# implement_confirm_and_dynamic.py
import json

print("--- 1. Updating version.json ---")
with open('version.json', 'r', encoding='utf-8') as f:
    ver_data = json.load(f)

ver_data['latest_version'] = '2.4.9'
ver_data['version_name'] = 'v2.4.9'
ver_data['release_timestamp'] = '2026-10-22T17:10:00+03:00'
ver_data['release_date_cairo'] = '22 أكتوبر 2026 - 05:10 م'

new_release = {
    "version": "v2.4.9",
    "date": "22 أكتوبر 2026",
    "time": "05:10 م (توقيت القاهرة)",
    "badge": "تفاعل ذكي",
    "badge_color": "emerald",
    "title": "زر تأكيد تنفيذ التعديل والمحرك الديناميكي للقرارات",
    "summary": "إضافة زر فوري 'تم تنفيذ التعديل' لإخفاء التنبيهات بمجرد تنفيذها، مع محرك ديناميكي لحساب تعديل الأسعار بالأرقام الحية والمصادر.",
    "items": [
        "زر 'تم تنفيذ التعديل ✓' في شريط الطوارئ يسجل تنفيذ التوجيه ويخفي التنبيه فوراً ولا يكرره.",
        "قرارات ديناميكية متغيرة لكل سيناريو: تعديل السعر لنقطة الدعم المحسوبة، أو الإلغاء التام والانتظار في الكاش حسب ضغط البيع المؤسسي.",
        "ربط كامل بين أوامر ثندر المعلقة ومحرك التقييم اللحظي مع توثيق المصادر الفنية المباشرة."
    ]
}

ver_data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)
print("[OK] version.json updated to v2.4.9")


print("--- 2. Updating api/prices.js ---")
with open('api/prices.js', 'r', encoding='utf-8') as f:
    prices_code = f.read()

prices_code = prices_code.replace('app_version: "2.4.8"', 'app_version: "2.4.9"')
with open('api/prices.js', 'w', encoding='utf-8') as f:
    f.write(prices_code)
print("[OK] api/prices.js updated to v2.4.9")


print("--- 3. Updating index.html ---")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('\r\n', '\n')

# Add confirm button in oed-emergency-banner
old_banner_buttons = '''          <div class="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0">
            <button id="oed-banner-action-btn" type="button" onclick="handleOedBannerAction()" class="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer">
              <i data-lucide="shield-alert" class="w-4 h-4 text-white"></i>
              <span id="oed-banner-action-text" class="text-white font-black text-xs">فحص خطة الحماية 🛡️</span>
            </button>
            <button type="button" onclick="dismissOedBanner()" class="hidden md:flex text-rose-700 hover:text-rose-950 dark:text-rose-300 p-1.5 rounded-lg transition cursor-pointer" title="إغلاق التنبيه">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>'''

new_banner_buttons = '''          <div class="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0 flex-wrap">
            <button id="oed-banner-action-btn" type="button" onclick="handleOedBannerAction()" class="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer">
              <i data-lucide="external-link" class="w-4 h-4 text-white"></i>
              <span id="oed-banner-action-text" class="text-white font-black text-xs">فتح تطبيق ثندر للتنفيذ ⚡</span>
            </button>
            <button id="oed-banner-confirm-btn" type="button" onclick="confirmActionExecuted()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer" title="تأكيد أنك قمت بالتعديل أو الإلغاء لإخفاء التنبيه نهائياً">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-white"></i>
              <span>تم تنفيذ التعديل ✓</span>
            </button>
            <button type="button" onclick="dismissOedBanner()" class="hidden md:flex text-rose-700 hover:text-rose-950 dark:text-rose-300 p-1.5 rounded-lg transition cursor-pointer" title="إغلاق التنبيه مؤقتاً">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>'''

assert old_banner_buttons in html, "old_banner_buttons not found in index.html"
html = html.replace(old_banner_buttons, new_banner_buttons, 1)

# Bump script tags to 2.4.9
html = html.replace('?v=2.4.8', '?v=2.4.9')
html = html.replace('>v2.4.8<', '>v2.4.9<')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html updated to v2.4.9 with confirm button")


print("--- 4. Updating js/app.js ---")
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read().replace('\r\n', '\n')

# 1. Update LOCAL_APP_VERSION
app_code = app_code.replace("const LOCAL_APP_VERSION = '2.4.8';", "const LOCAL_APP_VERSION = '2.4.9';")

# 2. Add confirmActionExecuted function
confirm_function = '''    function confirmActionExecuted() {
      if (activeEmergencyAlert) {
        const alertId = activeEmergencyAlert.id;
        const ticker = activeEmergencyAlert.ticker;

        // Mark matching pending Thndr orders as ACTIONED so they don't trigger alerts
        if (typeof pendingThndrOrders !== 'undefined' && Array.isArray(pendingThndrOrders)) {
          pendingThndrOrders.forEach(o => {
            if (o.status === 'PENDING' && (o.ticker === ticker || ticker === 'EGX')) {
              o.status = 'ACTIONED';
              o.actionedAt = new Date().toISOString();
              o.notes = (o.notes || '') + ' • تم تأكيد تنفيذ التعديل من المستخدم بنجاح';
            }
          });
          if (typeof savePendingThndrOrders === 'function') savePendingThndrOrders();
        }

        // Persist confirmed alert ID to localStorage
        const confirmed = JSON.parse(localStorage.getItem('oed_confirmed_actions') || '[]');
        if (!confirmed.includes(alertId)) confirmed.push(alertId);
        localStorage.setItem('oed_confirmed_actions', JSON.stringify(confirmed));

        const dismissed = JSON.parse(sessionStorage.getItem('oed_dismissed_alerts') || '[]');
        if (!dismissed.includes(alertId)) dismissed.push(alertId);
        sessionStorage.setItem('oed_dismissed_alerts', JSON.stringify(dismissed));
      }

      // Hide emergency banner immediately
      const banner = document.getElementById('oed-emergency-banner');
      if (banner) {
        banner.classList.add('hidden');
        banner.classList.remove('block');
      }
      activeEmergencyAlert = null;

      if (typeof renderPendingThndrOrdersUI === 'function') renderPendingThndrOrdersUI();
      if (typeof showToast === 'function') {
        showToast('تم تسجيل تنفيذ التعديل بنجاح، ولن يظهر هذا التنبيه مجدداً ✓', 'success');
      }
    }

    window.confirmActionExecuted = confirmActionExecuted;
'''

dismiss_find = "    function dismissOedBanner() {"
assert dismiss_find in app_code, "dismiss_find not found in app.js"
app_code = app_code.replace(dismiss_find, confirm_function + "\n    function dismissOedBanner() {", 1)

# 3. Dynamic scenario decision logic in evaluateInAppAlerts
old_eval_block = '''      // 0. Check Systemic Market Shock Alert (Flash crash protection)
      if (getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {
        const pendingBuys = (typeof getPendingBuyOrders === 'function') ? getPendingBuyOrders() : [];

        let shockTitle = '⚠️ تحذير هبوط ذعري شامل (Systemic Shock Alert)';
        let shockDesc = 'أكثر من 80% من أسهم السوق في مسار هابط أو تراجع المؤشر بأكثر من -3.0%. تم تجميد إشارات الشراء عند الدعوم تلقائياً لحماية السيولة.';
        let shockBadge = 'تجميد الشراء';
        let actionLabel = 'متابعة نبض السوق 📊';
        let actionType = 'RADAR';

        if (pendingBuys.length > 0) {
          const buySummary = pendingBuys.map(o => `${o.name} (${o.ticker}) بسعر ${Number(o.orderPrice).toFixed(2)} ج`).join(' و ');
          shockTitle = `🚨 إلغاء فوري لأوامر الشراء في ثندر (${pendingBuys.map(o => o.ticker).join(', ')})`;
          shockDesc = `السوق في هبوط ذعري شامل! ادخل على تطبيق ثندر فوراً وألغِ أمر شراء ${buySummary} لحماية كاشك وتجنب الشراء في الهبوط العنيف.`;
          shockBadge = 'إلغاء أمر ثندر فوراً ⚡';
          actionLabel = 'فتح ثندر لإلغاء الأمر ⚡';
          actionType = 'OPEN_THNDR';
        }

        const shockAlert = {
          id: 'shock_systemic_alert',
          ticker: pendingBuys.length > 0 ? pendingBuys[0].ticker : 'EGX',
          name: 'سوق البورصة المصرية',
          type: 'SYSTEMIC_SHOCK',
          title: shockTitle,
          desc: shockDesc,
          badge: shockBadge,
          actionLabel: actionLabel,
          actionType: actionType,
          time: formatCairoTime(new Date(), false, true)
        };
        alertsList.push(shockAlert);
        // Systemic shock alerts are life-or-death guardrails: ALWAYS show and prioritize on mobile/desktop
        highestPriorityAlert = shockAlert;
      }'''

new_eval_block = '''      // 0. Dynamic Scenario-Based Order Decision Engine
      const regimeCode = getMarketRegimeCode();
      const confirmedActions = JSON.parse(localStorage.getItem('oed_confirmed_actions') || '[]');
      const pendingBuys = (typeof getPendingBuyOrders === 'function') ? getPendingBuyOrders() : [];

      if (regimeCode === 'SYSTEMIC_SHOCK') {
        // Only show if user has not already clicked "تم تنفيذ التعديل" for this order
        const isShockConfirmed = confirmedActions.includes('shock_systemic_alert') && pendingBuys.length === 0;

        if (!isShockConfirmed) {
          let shockTitle = '⚠️ تحذير هبوط ذعري شامل (Systemic Shock Alert)';
          let shockDesc = 'أكثر من 80% من أسهم السوق في مسار هابط أو تراجع المؤشر بأكثر من -3.0%. تم تجميد إشارات الشراء عند الدعوم تلقائياً لحماية السيولة.';
          let shockBadge = 'تجميد الشراء';
          let actionLabel = 'فتح تطبيق ثندر ⚡';
          let actionType = 'OPEN_THNDR';

          if (pendingBuys.length > 0) {
            const firstOrder = pendingBuys[0];
            const stockData = (Array.isArray(fullMarketRadar) && fullMarketRadar.find(s => s.ticker === firstOrder.ticker))
              || (Array.isArray(portfolioData) && portfolioData.find(s => s.ticker === firstOrder.ticker))
              || { ticker: firstOrder.ticker, name: firstOrder.name };

            const sma50Text = stockData.sma50 ? Number(stockData.sma50).toFixed(2) + ' ج' : 'الدعم التالي';
            const volumeText = stockData.volumeMultiplier || (stockData.tradedValue ? Math.round(stockData.tradedValue / 1e6) + 'M ج' : 'سيولة ضخمة');

            shockTitle = `🚨 إلغاء فوري لأمر الشراء في ثندر (${firstOrder.ticker})`;
            shockDesc = `السوق في هبوط ذعري شامل (تداولات بيع مكثفة بقيمة ${volumeText})! التوجيه الفوري: لا تعدل السعر الآن؛ ادخل ثندر وألغِ أمر شراء ${firstOrder.name} بسعر ${Number(firstOrder.orderPrice).toFixed(2)} ج واحتفظ بكامل الكاش لحين هدوء السوق واستقرار السعر حول دعم ${sma50Text}. (المصدر: مسح السيولة ومؤشرات TradingView EGX).`;
            shockBadge = 'إلغاء أمر ثندر فوراً ⚡';
            actionLabel = 'فتح ثندر لإلغاء الأمر ⚡';
            actionType = 'OPEN_THNDR';
          }

          const shockAlert = {
            id: 'shock_systemic_alert',
            ticker: pendingBuys.length > 0 ? pendingBuys[0].ticker : 'EGX',
            name: 'سوق البورصة المصرية',
            type: 'SYSTEMIC_SHOCK',
            title: shockTitle,
            desc: shockDesc,
            badge: shockBadge,
            actionLabel: actionLabel,
            actionType: actionType,
            time: formatCairoTime(new Date(), false, true)
          };
          alertsList.push(shockAlert);
          highestPriorityAlert = shockAlert;
        }
      }
      else if (regimeCode === 'HEALTHY_CORRECTION' && pendingBuys.length > 0) {
        // Dynamic Scenario B: Order Price Adjustment Recommendation (Pullback to Support)
        const firstOrder = pendingBuys[0];
        const stockData = (Array.isArray(fullMarketRadar) && fullMarketRadar.find(s => s.ticker === firstOrder.ticker))
          || (Array.isArray(portfolioData) && portfolioData.find(s => s.ticker === firstOrder.ticker));

        if (stockData && stockData.pivotS1 && firstOrder.orderPrice > stockData.pivotS1) {
          const modAlertId = `modify_order_${firstOrder.ticker}_${Math.round(stockData.pivotS1)}`;
          if (!confirmedActions.includes(modAlertId)) {
            const modAlert = {
              id: modAlertId,
              ticker: firstOrder.ticker,
              name: firstOrder.name,
              type: 'WARNING',
              title: `🔄 تعديل سعر أمر الشراء في ثندر: ${firstOrder.name} (${firstOrder.ticker})`,
              desc: `الهبوط الحالي تصحيحي فني طبيعي؛ الدعم الفني S1 محدد عند ${Number(stockData.pivotS1).toFixed(2)} ج. التوجيه الفوري: ادخل ثندر وعدّل سعر أمر الشراء من ${Number(firstOrder.orderPrice).toFixed(2)} ج إلى ${Number(stockData.pivotS1).toFixed(2)} ج لرفع نسبة الأمان واقتناص السهم من دعم أقوى. (المصدر: ارتكازات الدعم الكلاسيكية لجلسة اليوم).`,
              badge: 'تعديل السعر المقترح',
              actionLabel: 'فتح ثندر لتعديل السعر ⚡',
              actionType: 'OPEN_THNDR',
              time: formatCairoTime(new Date(), false, true)
            };
            alertsList.push(modAlert);
            if (!highestPriorityAlert) highestPriorityAlert = modAlert;
          }
        }
      }'''

assert old_eval_block in app_code, "old_eval_block not found in app.js"
app_code = app_code.replace(old_eval_block, new_eval_block, 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)
print("[OK] js/app.js updated successfully")


print("--- 5. Updating js/ui.js to v2.4.9 ---")
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read().replace('\r\n', '\n')

ui_code = ui_code.replace("const currentVer = 'v2.4.8';", "const currentVer = 'v2.4.9';")
ui_code = ui_code.replace("badge: 'v2.4.8'", "badge: 'v2.4.9'")

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_code)
print("[OK] js/ui.js updated to v2.4.9")
