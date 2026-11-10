# -*- coding: utf-8 -*-
import sys

with open('js/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert renderMarketReadinessBanner before renderMarketOpportunityCard
banner_code = '''    // ============================================================
    // Market Timing & Readiness Guardrail Banner (3-Color Traffic Light)
    // ============================================================
    function renderMarketReadinessBanner(timingLight) {
      if (!timingLight) {
        timingLight = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function')
          ? EGX_Engine.getMarketTimingLight(typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL', typeof fullMarketRadar !== 'undefined' ? fullMarketRadar : [])
          : { code: 'YELLOW', label: 'إشارة صفراء • تداول متوازن وتجميع تدريجي', badgeText: '🟡 ضوء أصفر • شراء انتقائي حذر', badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', title: 'السوق يتحرك في نطاق عرضي متوازن', advice: 'الشراء مسموح بحصص مدروسة وبالأمر المحدد فقط عند مستويات الدعم لأسهم النواة.', allowBuying: true };
      }

      const isGreen = timingLight.code === 'GREEN';
      const isYellow = timingLight.code === 'YELLOW';
      const isRed = timingLight.code === 'RED';

      return `
        <div class="bg-gradient-to-r ${timingLight.headerBg || 'from-gray-950 via-slate-900 to-gray-950'} border-2 ${isRed ? 'border-rose-500/80 shadow-rose-950/50' : (isGreen ? 'border-emerald-500/80 shadow-emerald-950/50' : 'border-amber-500/60 shadow-amber-950/40')} rounded-2xl p-4 sm:p-5 shadow-2xl mb-5 transition-all">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <span>مؤشر جاهزية وأمان الشراء في السوق العام</span>
                </span>
                <span class="text-[11px] font-black px-2.5 py-0.5 rounded-full ${timingLight.badgeClass}">
                  ${timingLight.badgeText}
                </span>
                ${isRed ? '<span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-900 text-rose-200 border border-rose-500 font-bold animate-pulse">تجميد الشراء لحماية السيولة</span>' : ''}
              </div>

              <h4 class="text-sm sm:text-base font-extrabold ${isRed ? 'text-rose-300' : (isGreen ? 'text-emerald-300' : 'text-amber-200')}">
                ${timingLight.title}
              </h4>

              <p class="text-xs text-gray-300 leading-relaxed max-w-3xl">
                ${timingLight.advice}
              </p>
            </div>

            <!-- 3-Color Traffic Light Widget -->
            <div class="bg-black/80 border border-gray-800 rounded-2xl p-3 flex md:flex-col items-center justify-center gap-3 shrink-0 shadow-inner">
              <div class="flex items-center gap-3 md:flex-col">
                <!-- Red Light -->
                <div class="flex items-center gap-1.5" title="إشارة حمراء: هبوط ذعري أو ضغط بيعي عام (تجميد الشراء)">
                  <span class="w-4 h-4 rounded-full ${isRed ? 'bg-rose-500 shadow-lg shadow-rose-500/80 animate-ping' : 'bg-rose-950/50 border border-rose-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isRed ? 'text-rose-400 font-black' : 'text-gray-600'} hidden md:inline">هبوط / أزمة</span>
                </div>

                <!-- Yellow Light -->
                <div class="flex items-center gap-1.5" title="إشارة صفراء: تذبذب عرضي أو تصحيح هادئ (شراء انتقائي بحصص مدروسة)">
                  <span class="w-4 h-4 rounded-full ${isYellow ? 'bg-amber-400 shadow-lg shadow-amber-400/80 animate-pulse' : 'bg-amber-950/50 border border-amber-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isYellow ? 'text-amber-300 font-black' : 'text-gray-600'} hidden md:inline">تذبذب / هدوء</span>
                </div>

                <!-- Green Light -->
                <div class="flex items-center gap-1.5" title="إشارة خضراء: زخم صاعد واستقرار إيجابي (وقت آمن للشراء)">
                  <span class="w-4 h-4 rounded-full ${isGreen ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-pulse' : 'bg-emerald-950/50 border border-emerald-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isGreen ? 'text-emerald-300 font-black' : 'text-gray-600'} hidden md:inline">صعود / أمان</span>
                </div>
              </div>
            </div>

          </div>

          <div class="mt-3.5 pt-3 border-t border-gray-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <div class="flex items-center gap-2 text-gray-400">
              <span class="text-emerald-400">🛡️ حوكمة السيولة:</span>
              <span>${isRed ? 'الاحتفاظ بنسبة ١٠٠٪ كاش حر وعدم الاستعجال في الشراء' : (isYellow ? 'تخصيص حصص هادئة وحجز كاش احتياطي لأي تراجعات إضافية' : 'استغلال الزخم الشرائي الإيجابي مع الالتزام بأمر الشراء المحدد عند الدعم')}</span>
            </div>
            <div class="font-mono text-gray-400">
              <span>تحديث حي مرتبط بنبض البورصة المصرية</span>
            </div>
          </div>
        </div>
      `;
    }

'''

target_opp_func = '    function renderMarketOpportunityCard(item, rank) {'
if target_opp_func in content:
    content = content.replace(target_opp_func, banner_code + target_opp_func)
    print('Inserted renderMarketReadinessBanner')

# 2. Update renderMarketOpportunityCard vars
old_card_vars = '''    function renderMarketOpportunityCard(item, rank) {
      const isHero = (rank === 1);
      const curPrice = Number(item.price) || 0;'''

new_card_vars = '''    function renderMarketOpportunityCard(item, rank) {
      const isHero = (rank === 1);
      const curPrice = Number(item.price) || 0;
      const timingLight = item.timingLight || ((typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function') ? EGX_Engine.getMarketTimingLight() : null);
      const isMarketRed = timingLight && timingLight.code === 'RED';'''

if old_card_vars in content:
    content = content.replace(old_card_vars, new_card_vars)
    print('Updated renderMarketOpportunityCard vars')

# 3. Add timing badge in renderMarketOpportunityCard
old_exec_box = '            <!-- 2. The Golden Execution Box ("أشتري على كام؟") -->'
new_exec_box = '''            <!-- Market Timing & Readiness Guardrail Badge -->
            <div class="rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs border ${isMarketRed ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 animate-pulse font-bold' : (timingLight && timingLight.code === 'GREEN' ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30' : 'bg-amber-950/30 text-amber-300 border-amber-500/30')}">
              <div class="flex items-center gap-2">
                <span class="text-sm">${isMarketRed ? '🔴' : (timingLight && timingLight.code === 'GREEN' ? '🟢' : '🟡')}</span>
                <span><strong>توقيت السوق العام:</strong> ${timingLight ? timingLight.badgeText : 'تداول متوازن وعرضي'}</span>
              </div>
              <span class="text-[11px] font-normal text-gray-300">${isMarketRed ? 'الشراء مجمد لحماية الكاش' : (timingLight && timingLight.code === 'GREEN' ? 'زخم صاعد • وقت مناسب للشراء' : 'تجميع تدريجي هادئ بحصص مدروسة')}</span>
            </div>

            <!-- 2. The Golden Execution Box ("أشتري على كام؟") -->'''

if old_exec_box in content:
    content = content.replace(old_exec_box, new_exec_box)
    print('Added timing badge in renderMarketOpportunityCard')

# 4. In Action Buttons of renderMarketOpportunityCard: Freeze buy button if RED
old_thndr_btn = '''            <!-- 6. Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>تنفيذ شراء بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>
              </a>'''

new_thndr_btn = '''            <!-- 6. Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              ${isMarketRed ? `
                <div class="flex-1 py-3 px-4 rounded-xl bg-gray-900 border border-rose-500/50 text-rose-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                  <span>الشراء مجمد حالياً • تحذير صدمة سوقية (وفر السيولة) ⚠️</span>
                </div>
              ` : `
                <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                  <span>تنفيذ شراء بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>
                </a>
              `}'''

if old_thndr_btn in content:
    content = content.replace(old_thndr_btn, new_thndr_btn)
    print('Updated action buttons in renderMarketOpportunityCard')

# 5. In renderActionHubView: Prepend banner in marketOpportunities
old_action_hub_opps = '''        if (activeCat === 'marketOpportunities') {
          const coreList = activeList.filter(item => item.subCategory === 'CORE' || item.isCore);
          const satList = activeList.filter(item => item.subCategory === 'SATELLITE' || !item.isCore);

          cardsHtml = `
            <!-- Segment 1: Core Long-Term Investment (النواة الآمنة) -->'''

new_action_hub_opps = '''        if (activeCat === 'marketOpportunities') {
          const coreList = activeList.filter(item => item.subCategory === 'CORE' || item.isCore);
          const satList = activeList.filter(item => item.subCategory === 'SATELLITE' || !item.isCore);
          const timingLight = activeList.timingLight || (typeof window !== 'undefined' && window.lastActionPlan && window.lastActionPlan.marketTimingLight) || ((typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function') ? EGX_Engine.getMarketTimingLight() : null);

          cardsHtml = `
            ${renderMarketReadinessBanner(timingLight)}

            <!-- Segment 1: Core Long-Term Investment (النواة الآمنة) -->'''

if old_action_hub_opps in content:
    content = content.replace(old_action_hub_opps, new_action_hub_opps)
    print('Prepend banner in renderActionHubView')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('js/ui.js updated successfully')
