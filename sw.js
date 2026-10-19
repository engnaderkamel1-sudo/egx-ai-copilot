// sw.js - EGX AI Copilot Native Service Worker & Push Notification Handler
// Version: v3.1-mobile-robust (Compatible with Android Chrome, iOS Safari PWA, and Desktop)

const SW_VERSION = 'v3.1-mobile-robust';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Native Background Push Notification Receiver
self.addEventListener('push', (event) => {
  let payload = {
    title: 'تنبيه البورصة المصرية | EGX AI Copilot 🔔',
    body: 'فحص فوري: تغير في مستويات الدعم والمقاومة لأحد أسهم المحفظة.',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    url: '/'
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  // Full-featured options for modern Android & Desktop
  const fullOptions = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'egx-market-alert',
    renotify: true,
    dir: 'rtl',
    lang: 'ar'
  };

  // Safe fallback to guarantee display on all Android versions
  const showPromise = self.registration.showNotification(payload.title, fullOptions).catch((err) => {
    console.warn('Initial showNotification failed, trying minimal options:', err);
    return self.registration.showNotification(payload.title, {
      body: payload.body || '',
      data: { url: payload.url || '/' }
    });
  });

  event.waitUntil(showPromise);
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
