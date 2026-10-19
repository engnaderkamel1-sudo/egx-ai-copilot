/**
 * EGX AI Copilot - Native Web Push & Background Alarms (js/push-notifications.js)
 * Standalone in-app background push notifications without Telegram or 3rd-party apps.
 */

(function (global) {
  'use strict';

  let swRegistration = null;
  let isPushSupported = false;
  let isSubscribed = false;

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
      console.log('✅ EGX Service Worker Registered:', swRegistration.scope);

      // Check current subscription
      if ('PushManager' in window && swRegistration.pushManager) {
        const subscription = await swRegistration.pushManager.getSubscription();
        isSubscribed = subscription !== null;
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
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        isSubscribed = true;
        updatePushUIState();
        showLocalPushAlert(
          '🔔 تم تفعيل التنبيهات السحابية بنجاح!',
          'سيصلك إشعار فوري على شاشة جهازك عند كسر أي دعم فني أو وصول سهم لمستهدف المقاومة حتى لو المتصفح في الخلفية.'
        );
      } else if (permission === 'denied') {
        alert('⚠️ تم حظر الإشعارات في متصفحك. يرجى السماح بالإشعارات من إعدادات موقعك في شريط العنوان.');
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
    }
  }

  function showLocalPushAlert(title, body, url = '/') {
    if (Notification.permission !== 'granted') return;

    if (swRegistration && swRegistration.showNotification) {
      swRegistration.showNotification(title, {
        body: body,
        icon: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg',
        badge: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
        vibrate: [200, 100, 200],
        data: { url: url },
        tag: 'egx-market-alert',
        renotify: true
      });
    } else {
      // Fallback in-window notification
      try {
        new Notification(title, { body: body, icon: '/favicon.ico' });
      } catch (e) {}
    }
  }

  function sendTestNativeNotification() {
    if (Notification.permission !== 'granted') {
      requestNativePushPermission().then(() => {
        if (Notification.permission === 'granted') {
          showLocalPushAlert(
            '🔴 اختبار تنبيه كسر الدعم S1 (تجريبي)',
            'تحذير حقيقي: سهم البنك التجاري الدولي (CIB) كسر مستوى الدعم S1 (119.6 ج) • اضغط لفحص خطة الحماية والتدوير.'
          );
        }
      });
      return;
    }

    showLocalPushAlert(
      '🟢 اختبار إشعار المقاومة R1 (تجريبي)',
      'تنبيه الأرباح: سهم السويدي إليكتريك وصل لهدف المقاومة R1 (129.0 ج) • يُنصح بتأمين أرباح القمة وتدوير السيولة.'
    );
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
          btnEnable.innerText = 'التنبيهات مفعلة بنجاح (إرسال إشعار تجريبي)';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5';
        }
      } else if (perm === 'denied') {
        statusDot.className = 'w-2 h-2 rounded-full bg-rose-400';
        statusText.innerText = 'الإشعارات محظورة في إعدادات المتصفح 🔴';
        if (btnEnable) {
          btnEnable.innerText = 'محظور من المتصفح (اضغط للسماح)';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-900 transition flex items-center gap-1.5';
        }
      } else {
        statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
        statusText.innerText = 'التنبيهات السحابية غير مفعلة (اضغط للتفعيل) 🟡';
        if (btnEnable) {
          btnEnable.innerText = 'تفعيل التنبيهات السحابية الآن';
          btnEnable.className = 'px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow';
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
  global.showLocalPushAlert = showLocalPushAlert;
  global.updatePushUIState = updatePushUIState;

})(typeof window !== 'undefined' ? window : this);
