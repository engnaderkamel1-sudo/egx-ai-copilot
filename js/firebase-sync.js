/**
 * EGX AI Copilot - Firebase Cloud Sync (js/firebase-sync.js)
 * Real-time two-way synchronization between PC, Mobile, and Firebase Cloud Firestore.
 */

(function (global) {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyCErEfKE2hVqXRY21rIcuXdFRNVrH4gMb8",
    authDomain: "egx-ai-copilot.firebaseapp.com",
    projectId: "egx-ai-copilot",
    storageBucket: "egx-ai-copilot.firebasestorage.app",
    messagingSenderId: "306926746012",
    appId: "1:306926746012:web:57e79474e87e33f80af059",
    measurementId: "G-R2VVF22GX2"
  };

  let db = null;
  let isInitialized = false;
  let isSyncing = false;
  let unsubscribeListener = null;

  function updateBadge(status, text) {
    const badge = document.getElementById('firebase-sync-badge');
    const dot = document.getElementById('firebase-sync-dot');
    const txt = document.getElementById('firebase-sync-text');
    if (!badge || !txt) return;

    txt.textContent = text;
    if (dot) {
      dot.className = 'w-1.5 h-1.5 rounded-full ' + (
        status === 'synced' ? 'bg-emerald-400' :
        (status === 'saving' ? 'bg-amber-400 animate-ping' :
        (status === 'error' ? 'bg-rose-400' : 'bg-sky-400 animate-pulse'))
      );
    }
    if (status === 'synced') {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold transition';
    } else if (status === 'error') {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold transition';
    } else if (status === 'saving') {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold transition';
    } else {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-semibold transition';
    }
  }

  const EGX_FirebaseSync = {
    init: function () {
      if (typeof firebase === 'undefined') {
        console.warn('[FirebaseSync] Firebase SDK not loaded, running in local storage fallback mode');
        updateBadge('error', 'سحابة Firebase: وضع محلي');
        return;
      }

      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();

        // Optional local offline cache persistence
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
        } catch (e) {}

        isInitialized = true;
        this.startRealtimeListener();
      } catch (err) {
        console.error('[FirebaseSync] Initialization error:', err);
        updateBadge('error', 'سحابة Firebase: غير متصل');
      }
    },

    startRealtimeListener: function () {
      if (!db) return;

      const docRef = db.collection('portfolios').doc('primary_thndr');

      unsubscribeListener = docRef.onSnapshot((doc) => {
        if (doc && doc.exists) {
          const data = doc.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const cloudUpdatedAt = Number(data.updatedAt) || 0;
            const localUpdatedAt = Number(localStorage.getItem('egx_copilot_portfolio_cloud_ts')) || 0;

            // Reconcile if cloud has newer data and we're not currently broadcasting a local save
            if (!isSyncing && cloudUpdatedAt > localUpdatedAt) {
              localStorage.setItem('egx_copilot_portfolio_cloud_ts', cloudUpdatedAt);

              if (typeof EGX_Portfolio !== 'undefined') {
                EGX_Portfolio.save(data.items);
              } else {
                localStorage.setItem('egx_copilot_portfolio', JSON.stringify(data.items));
              }

              if (typeof portfolioData !== 'undefined') {
                portfolioData.length = 0;
                data.items.forEach(it => portfolioData.push(it));
                if (typeof updateMetrics === 'function') updateMetrics();
                if (typeof renderPortfolioTable === 'function') renderPortfolioTable();
                if (typeof renderAllocationChart === 'function') renderAllocationChart();
              }
            }
            updateBadge('synced', 'متزامن سحابياً مع Firebase');
          }
        } else {
          // First time seeding into Firebase Cloud
          const current = (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData) && portfolioData.length > 0)
            ? portfolioData
            : (typeof EGX_Portfolio !== 'undefined' ? EGX_Portfolio.load() : []);

          if (current.length > 0) {
            this.saveToCloud(current);
          }
        }
      }, (error) => {
        console.warn('[FirebaseSync] Snapshot listener:', error.message);
        if (error.code === 'permission-denied') {
          updateBadge('error', 'يرجى تفعيل Firestore في وضع Test Mode');
        } else {
          updateBadge('error', 'سحابة Firebase: جاري الاتصال');
        }
      });
    },

    saveToCloud: function (items) {
      if (!db || !Array.isArray(items) || items.length === 0) return;

      const now = Date.now();
      isSyncing = true;
      updateBadge('saving', 'جاري الحفظ سحابياً...');

      const docRef = db.collection('portfolios').doc('primary_thndr');
      docRef.set({
        items: items,
        updatedAt: now,
        version: typeof CURRENT_PORTFOLIO_VER !== 'undefined' ? CURRENT_PORTFOLIO_VER : 'v2.2.5',
        clientDevice: (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Mobile')) ? 'Mobile' : 'Desktop'
      }, { merge: true })
      .then(() => {
        localStorage.setItem('egx_copilot_portfolio_cloud_ts', now);
        setTimeout(() => {
          isSyncing = false;
          updateBadge('synced', 'تم الحفظ سحابياً ✓');
          setTimeout(() => updateBadge('synced', 'متزامن سحابياً مع Firebase'), 2500);
        }, 300);
      })
      .catch((err) => {
        isSyncing = false;
        console.error('[FirebaseSync] Cloud write error:', err);
        if (err.code === 'permission-denied') {
          updateBadge('error', 'يرجى تفعيل Firestore في وضع Test Mode');
        } else {
          updateBadge('error', 'تعذر الحفظ السحابي');
        }
      });
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_FirebaseSync;
  } else {
    global.EGX_FirebaseSync = EGX_FirebaseSync;
  }
})(typeof window !== 'undefined' ? window : this);
