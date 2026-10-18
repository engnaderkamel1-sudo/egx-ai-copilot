// /api/status.js
// Health check and real-time status of Autonomous Cloud Engine

function toEnglishDigits(str) {
  if (str === null || str === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[٠-٩]/g, d => arabicDigits.indexOf(d));
}

export default async function handler(req, res) {
  const now = new Date();
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timePart = now.toLocaleTimeString('ar-EG-u-nu-latn', {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    numberingSystem: 'latn'
  });
  const cairoTime = toEnglishDigits(`${timePart} (${now.getDate()} ${MONTHS_SHORT[now.getMonth()]})`);

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    engine: 'EGX AI Copilot Cloud Worker',
    status: 'ONLINE',
    cloud_platform: 'Vercel Serverless (Global Edge)',
    cairo_time: cairoTime,
    autonomous_analysis: 'ACTIVE',
    cron_interval: 'Sunday - Thursday (Session Hours 10:30 AM, 01:00 PM, 03:30 PM Cairo)'
  });
}
