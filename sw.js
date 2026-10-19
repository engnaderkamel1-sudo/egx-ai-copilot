// sw.js - EGX AI Copilot Native Service Worker & Push Notification Handler
// Enables background emergency notifications without Telegram or 3rd-party apps

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Native Background Push Notification Receiver
self.addEventListener('push', (event) => {
  let payload = {
    title: 'تنبيه البورصة المصرية | EGX AI Copilot',
    body: 'فحص فوري: تغير في مستويات الدعم والمقاومة لأحد أسهم المحفظة.',
    icon: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg',
    badge: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
    url: '/'
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg',
    badge: payload.badge || 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
    vibrate: [200, 100, 200],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'egx-market-alert',
    renotify: true,
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Click Handler: brings app into focus or opens deep link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
