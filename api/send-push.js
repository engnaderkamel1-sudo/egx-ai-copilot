// /api/send-push.js
// EGX AI Copilot - Universal Web Push Dispatcher
// Dispatches background alerts to all registered devices (Mobile phones, Tablets, Desktop)

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'BAtx_VsX7sQqBLrErkVgQhJXjecTxKV0ohn_ICVeQsAjuskf2dAqTKA3982-WlTVeDiPMQ9ubQaBmfnlgW07660';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'i9f-hoomB134FdYKUoXvVCG8phABT6VnxWHTA7tsmOE';

const FIRESTORE_DOC_URL = 'https://firestore.googleapis.com/v1/projects/st-john-church-service/databases/(default)/documents/service_settings/egx_subscriptions';

webpush.setVapidDetails(
  'mailto:eng.nader.reda@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, url, tag, directSubscription } = req.body || {};

    const payload = JSON.stringify({
      title: title || 'تنبيه البورصة المصرية | EGX AI Copilot 🔔',
      body: body || 'فحص فوري: تغير في مستويات الدعم والمقاومة لأحد أسهم المحفظة.',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      url: url || '/',
      tag: tag || 'egx-market-alert'
    });

    const subscriptionsToSend = [];

    // 1. Direct subscription passed from client (e.g. for immediate test)
    if (directSubscription) {
      try {
        const parsed = typeof directSubscription === 'string' ? JSON.parse(directSubscription) : directSubscription;
        if (parsed?.endpoint) subscriptionsToSend.push(parsed);
      } catch (e) {}
    }

    // 2. Fetch all registered devices from Cloud Firestore
    let cloudSubscriptions = [];
    try {
      const fsRes = await fetch(FIRESTORE_DOC_URL);
      if (fsRes.ok) {
        const data = await fsRes.json();
        const rawValues = data?.fields?.subscriptions?.arrayValue?.values || [];
        cloudSubscriptions = rawValues.map(v => {
          try { return JSON.parse(v.stringValue); } catch { return null; }
        }).filter(Boolean);

        cloudSubscriptions.forEach(sub => {
          if (sub?.endpoint) subscriptionsToSend.push(sub);
        });
      }
    } catch (fsErr) {
      console.warn('Firestore fetch error in send-push:', fsErr.message);
    }

    // Deduplicate by endpoint
    const uniqueSubs = Array.from(new Map(subscriptionsToSend.map(s => [s.endpoint, s])).values());

    if (uniqueSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'لا توجد أجهزة مسجلة حالياً لتلقي الإشعارات السحابية. يرجى تفعيل التنبيهات من الموبايل أولاً.'
      });
    }

    // Send push to all devices concurrently
    const results = await Promise.allSettled(
      uniqueSubs.map(sub => webpush.sendNotification(sub, Buffer.from(payload, 'utf8')))
    );

    // Identify expired/invalid endpoints (HTTP 410 or 404) to clean up Firestore
    const deadEndpoints = [];
    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        const statusCode = r.reason?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          deadEndpoints.push(uniqueSubs[idx].endpoint);
        }
      }
    });

    // Cleanup dead endpoints in background if any found
    if (deadEndpoints.length > 0 && cloudSubscriptions.length > 0) {
      try {
        const cleaned = cloudSubscriptions.filter(s => !deadEndpoints.includes(s.endpoint));
        await fetch(FIRESTORE_DOC_URL, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              subscriptions: {
                arrayValue: {
                  values: cleaned.map(item => ({ stringValue: JSON.stringify(item) }))
                }
              },
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          })
        });
      } catch (cleanErr) {
        console.warn('Error cleaning dead push endpoints:', cleanErr.message);
      }
    }

    const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;

    return res.status(200).json({
      success: true,
      totalDevices: uniqueSubs.length,
      sentCount: fulfilledCount,
      results: results.map(r => ({
        status: r.status,
        reason: r.reason ? (r.reason.message || r.reason.statusCode) : null
      }))
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
