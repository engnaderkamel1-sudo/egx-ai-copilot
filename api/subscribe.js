// /api/subscribe.js
// EGX AI Copilot - Web Push Device Subscription Registrar
// Saves and deduplicates device push subscriptions in cloud storage for 24/7 background alerts

const FIRESTORE_DOC_URL = 'https://firestore.googleapis.com/v1/projects/st-john-church-service/databases/(default)/documents/service_settings/egx_subscriptions';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Check number of registered devices
  if (req.method === 'GET') {
    try {
      const fsRes = await fetch(FIRESTORE_DOC_URL);
      if (!fsRes.ok) {
        return res.status(200).json({ success: true, count: 0, devices: [] });
      }
      const data = await fsRes.json();
      const rawValues = data?.fields?.subscriptions?.arrayValue?.values || [];
      const subs = rawValues.map(v => {
        try { return JSON.parse(v.stringValue); } catch { return null; }
      }).filter(Boolean);

      return res.status(200).json({
        success: true,
        count: subs.length,
        devices: subs.map(s => ({
          deviceName: s.deviceName || 'جهاز مسجل',
          endpointPreview: s.endpoint ? s.endpoint.substring(0, 35) + '...' : '',
          registeredAt: s.registeredAt || null
        }))
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, deviceName } = req.body || {};

    if (!subscription || !subscription.endpoint || !subscription.keys?.auth || !subscription.keys?.p256dh) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الاشتراك غير مكتملة (Missing endpoint or encryption keys)'
      });
    }

    // Read current subscriptions
    let existingSubs = [];
    try {
      const fsRes = await fetch(FIRESTORE_DOC_URL);
      if (fsRes.ok) {
        const data = await fsRes.json();
        const rawValues = data?.fields?.subscriptions?.arrayValue?.values || [];
        existingSubs = rawValues.map(v => {
          try { return JSON.parse(v.stringValue); } catch { return null; }
        }).filter(Boolean);
      }
    } catch (readErr) {
      console.warn('Could not read existing subscriptions:', readErr.message);
    }

    // Deduplicate and update
    const targetEndpoint = subscription.endpoint;
    const nowIso = new Date().toISOString();

    const updatedEntry = {
      ...subscription,
      deviceName: deviceName || 'جهاز متصفح',
      registeredAt: nowIso
    };

    // Filter out same endpoint to prevent duplicates
    const filtered = existingSubs.filter(s => s && s.endpoint !== targetEndpoint);
    filtered.push(updatedEntry);

    // Save back to Firestore
    const patchBody = {
      fields: {
        subscriptions: {
          arrayValue: {
            values: filtered.map(item => ({
              stringValue: JSON.stringify(item)
            }))
          }
        },
        updatedAt: {
          timestampValue: nowIso
        }
      }
    };

    const updateRes = await fetch(FIRESTORE_DOC_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody)
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      return res.status(500).json({ success: false, error: 'فشل حفظ الاشتراك في السحابة', detail: errText });
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      message: 'تم تسجيل اشتراك هذا الجهاز بنجاح في منظومة التنبيهات السحابية 🔔'
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
