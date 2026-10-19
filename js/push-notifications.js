/**
 * EGX AI Copilot - Native Web Push & Background Alarms (js/push-notifications.js)
 * Standalone in-app background push notifications with true server-side Web Push delivery.
 * Connects Mobile Phones (Android/iOS) and Desktops via VAPID Serverless Push.
 */

(function (global) {
  'use strict';

  // Standard VAPID Public Key for Web Push Subscriptions
  const VAPID_PUBLIC_KEY = 'BAtx_VsX7sQqBLrErkVgQhJXjecTxKV0ohn_ICVeQsAjuskf2dAqTKA3982-WlTVeDiPMQ9ubQaBmfnlgW07660';

  let swRegistration = null;
  let isPushSupported = false;
  let isSubscribed = false;

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function getDeviceDescription() {
    const ua = navigator.userAgent || '';
    let platform = 'جهاز كمبيوتر';
    if (/iPhone/i.test(ua)) platform = 'iPhone';
    else if (/iPad/i.test(ua)) platform = 'iPad';
    else if (/Android/i.test(ua)) platform = 'هاتف أندرويد';
    else if (/Macintosh/i.test(ua)) platform = 'جهاز Mac';
    else if (/Windows/i.test(ua)) platform = 'جهاز Windows';

    let browser = 'المتصفح';
    if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';

    return `${platform} (${browser})`;
  }

  async function registerSubscriptionWithServer(subscription) {
    if (!subscription) return false;
    try {
      const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          deviceName: getDeviceDescription()
        })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.warn('Could not register subscription with EGX server:', err);
      return false;
    }
  }

  async function initServiceWorkerAndPush() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('Web Push Notifications are not supported in this browser.');
      isPushSupported = false;
      updatePushUIState();
      return;
    }

    isPushSupported = true;

    try {
      // Register root Service Worker
      swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      console.log('✅ EGX Service Worker Registered:', swRegistration.scope);

      // Check current subscription
      if ('PushManager' in window && swRegistration.pushManager) {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          isSubscribed = true;
          // Silently sync with server to ensure this device stays in the cloud push list
          registerSubscriptionWithServer(subscription).catch(() => {});
        } else {
          isSubscribed = Notification.permission === 'granted';
        }
      } else {
        isSubscribed = Notification.permission === 'granted';
      }

      updatePushUIState();
    } catch (err) {
      console.warn('Service Worker registration non-fatal notice:', err.message);
      updatePushUIState();
    }
  }

  async function requestNativePushPermission() {
    if (!('Notification' in window)) {
      alert('⚠️ متصفحك لا يدعم الإشعارات الأصلية.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        isSubscribed = true;

        if (swRegistration && 'pushManager' in swRegistration) {
          try {
            let subscription = await swRegistration.pushManager.getSubscription();
            if (!subscription) {
              const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
              subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
              });
            }

            if (subscription) {
              await registerSubscriptionWithServer(subscription);
            }
          } catch (subErr) {
            console.warn('Push manager subscribe error:', subErr);
          }
        }

        updatePushUIState();
        showLocalPushAlert(
          '🔔 تم تفعيل التنبيهات السحابية بنجاح!',
          'تم ربط هذا الجهاز بنجاح. ستصلك إشعارات كسر الدعم والمقاومة لأسهم محفظتك حتى لو كان المتصفح مغلقاً.'
        );
        return true;
      } else if (permission === 'denied') {
        alert('⚠️ تم حظر الإشعارات في متصفحك. يرجى السماح بالإشعارات من إعدادات موقعك في شريط العنوان.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
      return false;
    }
    return false;
  }

  function playNotificationChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }

  function showLocalPushAlert(title, body, url = '/') {
    // 1. Play auditory chime
    playNotificationChime();

    // 2. High-visibility in-app toast for instant feedback
    if (typeof showToast === 'function') {
      showToast(`<div class="space-y-1"><div class="font-bold text-white text-xs">${title}</div><div class="text-[11px] text-gray-300 leading-relaxed">${body}</div></div>`, 'info');
    }

    // 3. System-level Notification dispatch (Lockscreen / OS notification center, Android & iOS & Desktop)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const options = {
        body: body,
        icon: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg',
        badge: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
        vibrate: [200, 100, 200],
        data: { url: url },
        tag: 'egx-market-alert'
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, options);
        }).catch(() => {
          try { new Notification(title, options); } catch (e) {}
        });
      } else {
        try {
          new Notification(title, options);
        } catch (e) {}
      }
    }
  }

  async function sendTestNativeNotification() {
    // 1. Always trigger instant auditory chime & visual toast for instant feedback
    playNotificationChime();
    showLocalPushAlert(
      '🔔 جارٍ إرسال التنبيه السحابي...',
      'يتم بث الإشعار الآن عبر السيرفر لجميع أجهزتك المسجلة (الموبايل والكمبيوتر).'
    );

    // 2. If browser OS permission is not granted yet, prompt user for full lockscreen/OS alerts
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const granted = await requestNativePushPermission();
      if (!granted) return;
    } else {
      // Ensure this device is subscribed and registered with the server
      if (swRegistration && 'pushManager' in swRegistration) {
        try {
          let subscription = await swRegistration.pushManager.getSubscription();
          if (!subscription) {
            const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await swRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey
            });
          }
          if (subscription) {
            await registerSubscriptionWithServer(subscription);
          }
        } catch (subErr) {
          console.warn('Subscription check error:', subErr);
        }
      }
    }

    // 3. Trigger true Server Web Push to ALL registered devices
    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🚨 تنبيه سحابي فوري | EGX AI Copilot',
          body: 'فحص فوري: منظومة التنبيهات السحابية تعمل بنجاح! تم تسليم التنبيه لجميع أجهزتك المسجلة 📱💻',
          url: '/'
        })
      });
      const data = await res.json();
      if (data.success) {
        const count = data.sentCount || 0;
        const total = data.totalDevices || count;
        if (typeof showToast === 'function') {
          showToast(`تم إرسال الإشعار السحابي بنجاح إلى (${count}/${total}) أجهزة مسجلة 🚀`, 'success');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(data.message || 'تم إرسال التنبيه، يرجى تفعيل التنبيهات من الموبايل لتلقيه هناك.', 'warning');
        }
      }
    } catch (err) {
      console.warn('Server push dispatch error:', err);
    }
  }

  async function simulateMarketEmergency() {
    playNotificationChime();
    showLocalPushAlert(
      '⚠️ محاكاة كسر الدعم الفني: CIB (البنك التجاري الدولي)',
      'سهم COMI كسر مستوى الدعم S1 (119.6 ج) • اضغط لمراجعة خطة الحماية والتدوير السيولة.'
    );

    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔴 تحذير كسر دعم فني رئيسي S1 | EGX Copilot',
          body: 'محاكاة طوارئ: سهم البنك التجاري الدولي (COMI) كسر الدعم S1 عند 119.6 ج. راقب تفعيل حماية رأس المال.',
          url: '/'
        })
      });
      const data = await res.json();
      if (data.success && typeof showToast === 'function') {
        showToast(`تم إرسال تنبيه الطوارئ السحابي بنجاح (${data.sentCount || 0} أجهزة) 🚨`, 'info');
      }
    } catch (e) {
      console.warn('Simulation push error:', e);
    }
  }

  function updatePushUIState() {
    const statusDot = document.getElementById('push-status-dot');
    const statusText = document.getElementById('push-status-text');
    const btnEnable = document.getElementById('btn-enable-push');

    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';

    if (statusDot && statusText) {
      if (perm === 'granted') {
        statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        statusText.innerText = 'التنبيهات السحابية مفعلة على هذا الجهاز 🟢';
        if (btnEnable) {
          btnEnable.innerText = 'التنبيهات مفعلة بنجاح (إرسال إشعار تجريبي سحابي 🚀)';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer';
        }
      } else if (perm === 'denied') {
        statusDot.className = 'w-2 h-2 rounded-full bg-rose-400';
        statusText.innerText = 'الإشعارات محظورة في إعدادات المتصفح 🔴';
        if (btnEnable) {
          btnEnable.innerText = 'محظور من المتصفح (اضغط للسماح)';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-900 transition flex items-center gap-1.5 cursor-pointer';
        }
      } else {
        statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
        statusText.innerText = 'التنبيهات السحابية غير مفعلة (اضغط للتفعيل) 🟡';
        if (btnEnable) {
          btnEnable.innerText = 'تفعيل التنبيهات السحابية الآن 🔔';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer';
        }
      }
    }
  }

  // Auto-init on script load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      initServiceWorkerAndPush();
    });
  }

  // Window exposures
  global.initServiceWorkerAndPush = initServiceWorkerAndPush;
  global.requestNativePushPermission = requestNativePushPermission;
  global.sendTestNativeNotification = sendTestNativeNotification;
  global.simulateMarketEmergency = simulateMarketEmergency;
  global.showLocalPushAlert = showLocalPushAlert;
  global.updatePushUIState = updatePushUIState;

})(typeof window !== 'undefined' ? window : this);
