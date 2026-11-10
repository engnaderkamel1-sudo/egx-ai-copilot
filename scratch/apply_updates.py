# apply_updates.py

print("--- Updating js/ui.js ---")
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_text = f.read().replace('\r\n', '\n')

# 1. Add 'changelog' to tabMeta
tabmeta_find = "'portfolio': { title: 'المحفظة وتوزيع الأصول'"
tabmeta_replace = "'changelog': { title: 'سجل التحديثات والإصدارات الرسمية', desc: 'تتبع كافة التعديلات والتطويرات المرفوعة للنظام وتواريخها بدقة', badge: 'v2.4.8' },\n        'portfolio': { title: 'المحفظة وتوزيع الأصول'"
assert tabmeta_find in ui_text, "tabmeta_find not found"
ui_text = ui_text.replace(tabmeta_find, tabmeta_replace, 1)

# 2. Add switchTab condition
switchtab_find = "} else if (tabId === 'valuation') {"
switchtab_replace = "} else if (tabId === 'changelog') {\n        if (typeof renderChangelogUI === 'function') renderChangelogUI();\n      } else if (tabId === 'valuation') {"
assert switchtab_find in ui_text, "switchtab_find not found"
ui_text = ui_text.replace(switchtab_find, switchtab_replace, 1)

# 3. Add renderChangelogUI implementation
changelog_code = '''
    // ============================================================
    // Changelog & System Releases Audit UI
    // ============================================================
    let cachedChangelogData = null;

    async function fetchChangelogData() {
      if (cachedChangelogData) return cachedChangelogData;
      try {
        const res = await fetch(`/version.json?_t=${Date.now()}`);
        if (res.ok) {
          cachedChangelogData = await res.json();
          return cachedChangelogData;
        }
      } catch (e) {
        console.warn('fetchChangelogData network fallback:', e);
      }
      return null;
    }

    async function renderChangelogUI() {
      const container = document.getElementById('changelog-timeline-container');
      if (!container) return;

      const data = await fetchChangelogData();
      const releases = (data && Array.isArray(data.releases)) ? data.releases : [
        {
          version: 'v2.4.8',
          date: '22 أكتوبر 2026',
          time: '04:45 م (توقيت القاهرة)',
          badge: 'تحديث رئيسي',
          badge_color: 'emerald',
          title: 'إشعار التحديث الفوري وسجل التحديثات الشامل',
          summary: 'إضافة مستشعر لاكتشاف أي تحديث يتم رفعه سحابياً وإظهار زر لإعادة التحميل بلمسة واحدة، مع إضافة شاشة سجل التحديثات في القائمة الجانبية.',
          items: [
            'إشعار فوري علوي ينبهك عند توفر أي نسخة جديدة مع زر تحديث إجباري بلمسة واحدة.',
            'تبويب سجل التحديثات في القائمة الجانبية لعرض تاريخ ووقت وتفاصيل كافة التعديلات المرفوعة.',
            'زر فحص التحديثات الآن للتحقق المباشر من الخادم في أي لحظة.'
          ]
        }
      ];

      const currentVer = 'v2.4.8';

      container.innerHTML = releases.map((rel, idx) => {
        const isCurrent = rel.version === currentVer;
        const badgeColor = rel.badge_color || 'emerald';
        const colorClasses = {
          emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        }[badgeColor] || 'bg-slate-700 text-slate-300 border-slate-600';

        return `
          <div class="p-5 rounded-2xl border ${isCurrent ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg' : 'bg-gray-950 border-gray-800'} transition space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="font-mono font-black text-sm text-white px-2.5 py-1 rounded-xl bg-gray-900 border border-gray-700">${rel.version}</span>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colorClasses}">${rel.badge || 'تحديث'}</span>
                ${isCurrent ? '<span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>النسخة النشطة بجهازك حالياً</span>' : ''}
              </div>
              <div class="text-xs text-gray-400 flex items-center gap-1.5 dir-rtl">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-400"></i>
                <span>${rel.date} • ${rel.time}</span>
              </div>
            </div>

            <div>
              <h3 class="font-bold text-white text-base">${rel.title}</h3>
              <p class="text-xs text-gray-400 mt-1">${rel.summary || ''}</p>
            </div>

            <ul class="space-y-1.5 pt-1 text-xs text-gray-300">
              ${(rel.items || []).map(item => `
                <li class="flex items-start gap-2">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }
'''

ui_text += changelog_code
ui_text += "\n    window.renderChangelogUI = renderChangelogUI;\n"

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_text)
print("[OK] js/ui.js updated successfully")


print("--- Updating js/app.js ---")
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_text = f.read().replace('\r\n', '\n')

# Add Auto-Update Engine
auto_update_engine = '''
    // ============================================================
    // Real-Time System Auto-Update Engine
    // ============================================================
    const LOCAL_APP_VERSION = '2.4.8';
    window.LOCAL_APP_VERSION = LOCAL_APP_VERSION;

    let isUpdateBannerDismissed = false;

    async function checkForAppUpdates(silent = true) {
      try {
        const res = await fetch(`/version.json?_t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        const serverVer = data.latest_version || data.version;

        if (serverVer && isNewerVersion(serverVer, LOCAL_APP_VERSION)) {
          showAppUpdateBanner(serverVer, data.release_date_cairo);
          if (!silent && typeof showToast === 'function') {
            showToast(`🚀 يتوفر تحديث جديد للنظام (${serverVer})!`, 'info');
          }
        } else {
          if (!silent && typeof showToast === 'function') {
            showToast(`أنت تستخدم أحدث إصدار بالفعل (${LOCAL_APP_VERSION}) ✓`, 'success');
          }
        }
      } catch (err) {
        if (!silent && typeof showToast === 'function') {
          showToast('تعذر فحص التحديثات، تحقق من الاتصال بالإنترنت.', 'error');
        }
      }
    }

    function isNewerVersion(serverVer, localVer) {
      const sParts = String(serverVer).replace(/[^0-9.]/g, '').split('.').map(Number);
      const lParts = String(localVer).replace(/[^0-9.]/g, '').split('.').map(Number);
      for (let i = 0; i < Math.max(sParts.length, lParts.length); i++) {
        const s = sParts[i] || 0;
        const l = lParts[i] || 0;
        if (s > l) return true;
        if (s < l) return false;
      }
      return false;
    }

    function showAppUpdateBanner(serverVer, releaseDate) {
      const banner = document.getElementById('app-update-available-banner');
      if (!banner || isUpdateBannerDismissed) return;
      const badge = document.getElementById('update-banner-version-badge');
      if (badge) badge.innerText = `إصدار جديد ${serverVer}`;
      const desc = document.getElementById('update-banner-desc');
      if (desc && releaseDate) {
        desc.innerText = `تم رفع تحديث جديد (${releaseDate})؛ اضغط لتطبيق التحديث وتحديث الصفحة فوراً.`;
      }
      banner.classList.remove('hidden');
      banner.classList.add('block');
      if (window.lucide) lucide.createIcons();
    }

    function dismissUpdateBanner() {
      isUpdateBannerDismissed = true;
      const banner = document.getElementById('app-update-available-banner');
      if (banner) banner.classList.add('hidden');
    }

    function applyAppUpdateNow() {
      try {
        sessionStorage.removeItem('oed_dismissed_alerts');
      } catch (e) {}
      const cleanUrl = window.location.origin + window.location.pathname;
      window.location.href = `${cleanUrl}?refresh=${Date.now()}`;
    }

    window.checkForAppUpdates = checkForAppUpdates;
    window.applyAppUpdateNow = applyAppUpdateNow;
    window.dismissUpdateBanner = dismissUpdateBanner;
'''

# Insert before bootApp
bootapp_find = "    function bootApp() {"
assert bootapp_find in app_text, "bootapp_find not found"
app_text = app_text.replace(bootapp_find, auto_update_engine + "\n    function bootApp() {", 1)

# In bootApp, add checkForAppUpdates call and visibility listener
boot_insert_find = "try { fetchCloudStatus(); } catch(e){ console.warn('fetchCloudStatus error:', e); }"
boot_insert_replace = '''try { fetchCloudStatus(); } catch(e){ console.warn('fetchCloudStatus error:', e); }
      try {
        checkForAppUpdates(true);
        setInterval(() => checkForAppUpdates(true), 60000);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForAppUpdates(true);
        });
      } catch(e){}'''
assert boot_insert_find in app_text, "boot_insert_find not found"
app_text = app_text.replace(boot_insert_find, boot_insert_replace, 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_text)
print("[OK] js/app.js updated successfully")
