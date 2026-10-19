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

  function sendTestNativeNotification() {
    // Always trigger instant feedback chime and visual toast
    showLocalPushAlert(
      '🔔 إشعار تجريبي: تنبيه سحابي فوري من EGX Copilot',
      'منظومة التنبيهات السحابية تعمل بنجاح! يتم رصد مستويات الأمان ومستهدفات الأرباح لأسهم محفظتك لحظة بلحظة.'
    );

    // If browser OS permission is not granted yet, prompt user for full lockscreen/OS alerts
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      requestNativePushPermission().then(() => {
        if (Notification.permission === 'granted') {
          showLocalPushAlert(
            '🔴 تنبيه كسر الدعم S1 (نظام الإشعارات المباشرة)',
            'تحذير حقيقي: سهم البنك التجاري الدولي (CIB) كسر مستوى الدعم S1 (119.6 ج) • اضغط لفحص خطة الحماية والتدوير.'
          );
        }
      });
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
