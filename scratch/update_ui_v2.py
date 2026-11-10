# -*- coding: utf-8 -*-
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read()

# 1. Replace renderMarketReadinessBanner
old_banner_marker = '    // ============================================================\n    // Market Timing & Readiness Guardrail Banner (3-Color Traffic Light)\n    // ============================================================\n    function renderMarketReadinessBanner(timingLight) {'
if old_banner_marker not in ui_code:
    old_banner_marker = '    // ============================================================\r\n    // Market Timing & Readiness Guardrail Banner (3-Color Traffic Light)\r\n    // ============================================================\r\n    function renderMarketReadinessBanner(timingLight) {'

end_banner_marker = '    function renderMarketOpportunityCard(item, rank) {'

start_idx = ui_code.find('function renderMarketReadinessBanner(timingLight) {')
end_idx = ui_code.find(end_banner_marker)

if start_idx != -1 and end_idx != -1:
    new_banner_func = '''function renderMarketReadinessBanner(timingLight) {
      if (!timingLight) {
        timingLight = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function')
          ? EGX_Engine.getMarketTimingLight(typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL', typeof fullMarketRadar !== 'undefined' ? fullMarketRadar : [])
          : { code: 'YELLOW', stageName: 'تداول متوازن وعرضي', actionVerb: 'مراقبة وتريث • انتقائية صارمة للنواة الآمنة فقط', badgeText: '🟡 تداول متوازن • مراقبة وتريث وانتقائية', badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', title: 'السوق يتحرك في نطاق عرضي متوازن', advice: 'الشراء مسموح بحصص مدروسة وبالأمر المحدد فقط عند مستويات الدعم لأسهم النواة.', allowBuying: true };
      }

      const isRed = timingLight.code === 'RED';
      const isOverbought = timingLight.code === 'OVERBOUGHT';
      const isPullback = timingLight.code === 'PULLBACK';
      const isGreen = timingLight.code === 'GREEN';
      const isYellow = timingLight.code === 'YELLOW';

      return `
        <div class="bg-gradient-to-r ${timingLight.headerBg || 'from-gray-950 via-slate-900 to-gray-950'} border-2 ${isRed ? 'border-rose-500/80 shadow-rose-950/50' : (isOverbought ? 'border-amber-500/80 shadow-amber-950/50' : (isPullback || isGreen ? 'border-emerald-500/80 shadow-emerald-950/50' : 'border-yellow-500/60 shadow-yellow-950/40'))} rounded-2xl p-4 sm:p-5 shadow-2xl mb-5 transition-all">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="space-y-2.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <span>مؤشر جاهزية وأمان الشراء في السوق العام</span>
                </span>
                <span class="text-[11px] font-black px-2.5 py-0.5 rounded-full ${timingLight.badgeClass}">
                  ${timingLight.badgeText}
                </span>
                ${(isRed || isOverbought) ? '<span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-900 text-rose-200 border border-rose-500 font-bold animate-pulse">تجميد الشراء لحماية السيولة</span>' : ''}
              </div>

              <!-- Actionable Posture Banner -->
              <div class="bg-black/60 border border-gray-700/80 rounded-xl p-2.5 flex items-center gap-2 text-xs sm:text-sm">
                <span class="text-amber-400 font-bold shrink-0">🎯 الفعل الاستثماري المطلوب:</span>
                <span class="text-white font-extrabold text-xs sm:text-sm tracking-wide">${timingLight.actionVerb || timingLight.badgeText}</span>
              </div>

              <h4 class="text-sm sm:text-base font-extrabold ${isRed ? 'text-rose-300' : (isOverbought ? 'text-amber-300' : (isPullback || isGreen ? 'text-emerald-300' : 'text-amber-200'))}">
                ${timingLight.title}
              </h4>

              <p class="text-xs text-gray-300 leading-relaxed max-w-3xl">
                ${timingLight.advice}
              </p>
            </div>

            <!-- 4-Stage Action Traffic Light Widget -->
            <div class="bg-black/80 border border-gray-800 rounded-2xl p-3 flex md:flex-col items-center justify-center gap-2.5 shrink-0 shadow-inner">
              <div class="flex items-center gap-3 md:flex-col">
                <!-- Red Light: Crisis / Shock -->
                <div class="flex items-center gap-1.5" title="إشارة حمراء: هبوط ذعري أو ضغط بيعي عام (تجميد الشراء كلياً)">
                  <span class="w-3.5 h-3.5 rounded-full ${isRed ? 'bg-rose-500 shadow-lg shadow-rose-500/80 animate-ping' : 'bg-rose-950/50 border border-rose-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isRed ? 'text-rose-400 font-black' : 'text-gray-600'} hidden md:inline">هبوط ذعري</span>
                </div>

                <!-- Orange Light: Topping / Overbought -->
                <div class="flex items-center gap-1.5" title="إشارة برتقالية: قمم وتشبع شرائي (جني وتأمين أرباح • حظر الشراء بالقمم)">
                  <span class="w-3.5 h-3.5 rounded-full ${isOverbought ? 'bg-amber-500 shadow-lg shadow-amber-500/80 animate-ping' : 'bg-amber-950/50 border border-amber-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isOverbought ? 'text-amber-300 font-black' : 'text-gray-600'} hidden md:inline">قمم وتشبع</span>
                </div>

                <!-- Yellow Light: Consolidation -->
                <div class="flex items-center gap-1.5" title="إشارة صفراء: تداول عرضي متوازن (مراقبة وتريث وانتقائية)">
                  <span class="w-3.5 h-3.5 rounded-full ${isYellow ? 'bg-yellow-400 shadow-lg shadow-yellow-400/80 animate-pulse' : 'bg-yellow-950/50 border border-yellow-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${isYellow ? 'text-yellow-300 font-black' : 'text-gray-600'} hidden md:inline">تداول متوازن</span>
                </div>

                <!-- Green Light: Pullback Accumulation or Balanced Momentum -->
                <div class="flex items-center gap-1.5" title="إشارة خضراء: قاع وتصحيح هادئ أو صعود متزن (تجميع هادئ بالأمر المحدد)">
                  <span class="w-3.5 h-3.5 rounded-full ${(isPullback || isGreen) ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-pulse' : 'bg-emerald-950/50 border border-emerald-900/50 opacity-40'}"></span>
                  <span class="text-[10px] font-bold ${(isPullback || isGreen) ? 'text-emerald-300 font-black' : 'text-gray-600'} hidden md:inline">${isPullback ? 'قاع وتجميع' : 'صعود متزن'}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="mt-3.5 pt-3 border-t border-gray-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <div class="flex items-center gap-2 text-gray-400">
              <span class="text-emerald-400">🛡️ حوكمة السيولة:</span>
              <span>${(isRed || isOverbought) ? 'الاحتفاظ بنسبة ١٠٠٪ كاش حر وعدم الاستعجال في الشراء' : (isYellow ? 'تخصيص حصص هادئة وحجز كاش احتياطي لأي تراجعات إضافية' : 'تجميع هادئ تدريجي مع الالتزام بأمر الشراء المحدد عند الدعم')}</span>
            </div>
            <div class="font-mono text-gray-400">
              <span>تحديث حي مرتبط بنبض البورصة المصرية</span>
            </div>
          </div>
        </div>
      `;
    }

    '''
    ui_code = ui_code[:start_idx] + new_banner_func + ui_code[end_idx:]
    print('Updated renderMarketReadinessBanner')

# 2. Update renderMarketOpportunityCard vars and frozen check
old_opp_vars = '      const isMarketRed = timingLight && timingLight.code === \'RED\';'
new_opp_vars = '      const isMarketFrozen = timingLight && (timingLight.code === \'RED\' || timingLight.code === \'OVERBOUGHT\');'

if old_opp_vars in ui_code:
    ui_code = ui_code.replace(old_opp_vars, new_opp_vars)
    print('Updated isMarketFrozen in renderMarketOpportunityCard')

# Update badge in renderMarketOpportunityCard
old_card_badge = '''            <!-- Market Timing & Readiness Guardrail Badge -->
            <div class="rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs border ${isMarketRed ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 animate-pulse font-bold' : (timingLight && timingLight.code === 'GREEN' ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30' : 'bg-amber-950/30 text-amber-300 border-amber-500/30')}">
              <div class="flex items-center gap-2">
                <span class="text-sm">${isMarketRed ? '🔴' : (timingLight && timingLight.code === 'GREEN' ? '🟢' : '🟡')}</span>
                <span><strong>توقيت السوق العام:</strong> ${timingLight ? timingLight.badgeText : 'تداول متوازن وعرضي'}</span>
              </div>
              <span class="text-[11px] font-normal text-gray-300">${isMarketRed ? 'الشراء مجمد لحماية الكاش' : (timingLight && timingLight.code === 'GREEN' ? 'زخم صاعد • وقت مناسب للشراء' : 'تجميع تدريجي هادئ بحصص مدروسة')}</span>
            </div>'''

new_card_badge = '''            <!-- Market Timing & Readiness Guardrail Badge -->
            <div class="rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs border ${isMarketFrozen ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 animate-pulse font-bold' : ((timingLight && (timingLight.code === 'GREEN' || timingLight.code === 'PULLBACK')) ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30' : 'bg-amber-950/30 text-amber-300 border-amber-500/30')}">
              <div class="flex items-center gap-2">
                <span class="text-sm">${isMarketFrozen ? '🚫' : ((timingLight && (timingLight.code === 'GREEN' || timingLight.code === 'PULLBACK')) ? '🟢' : '🟡')}</span>
                <span><strong>توقيت السوق العام:</strong> ${timingLight ? timingLight.badgeText : 'تداول متوازن وعرضي'}</span>
              </div>
              <span class="text-[11px] font-bold text-amber-300">${timingLight ? timingLight.actionVerb : 'تجميع تدريجي هادئ بحصص مدروسة'}</span>
            </div>'''

if old_card_badge in ui_code:
    ui_code = ui_code.replace(old_card_badge, new_card_badge)
    print('Updated timing badge in renderMarketOpportunityCard')

# Update action buttons in renderMarketOpportunityCard
old_btn_block = '''            <!-- 6. Action Buttons -->
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

new_btn_block = '''            <!-- 6. Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              ${isMarketFrozen ? `
                <div class="flex-1 py-3 px-4 rounded-xl bg-gray-900 border border-rose-500/50 text-rose-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                  <span>الشراء مجمد حالياً • (${timingLight ? timingLight.actionVerb : 'حماية السيولة'}) ⚠️</span>
                </div>
              ` : `
                <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                  <span>تنفيذ شراء بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>
                </a>
              `}'''

if old_btn_block in ui_code:
    ui_code = ui_code.replace(old_btn_block, new_btn_block)
    print('Updated action buttons with isMarketFrozen in renderMarketOpportunityCard')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_code)

print('js/ui.js updated successfully')
