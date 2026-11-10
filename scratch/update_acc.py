# -*- coding: utf-8 -*-
with open('js/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

target_vars = '''    function renderAccumulationCard(item, rank) {
      const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;'''

replacement_vars = '''    function renderAccumulationCard(item, rank) {
      const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
      const timingLight = item.timingLight || ((typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function') ? EGX_Engine.getMarketTimingLight() : null);
      const isMarketRed = timingLight && timingLight.code === 'RED';'''

if target_vars in content:
    content = content.replace(target_vars, replacement_vars)
    print('Updated renderAccumulationCard vars')
else:
    print('target_vars NOT found')

target_btn = '''            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>تنفيذ تزويد بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>
              </a>'''

replacement_btn = '''            <div class="flex items-center gap-2 flex-wrap pt-1">
              ${isMarketRed ? `
                <div class="flex-1 py-3 px-4 rounded-xl bg-gray-900 border border-rose-500/50 text-rose-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                  <span>التزويد مجمد حالياً • تحذير هبوط عام (وفر الكاش) ⚠️</span>
                </div>
              ` : `
                <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                  <span>تنفيذ تزويد بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>
                </a>
              `}'''

if target_btn in content:
    content = content.replace(target_btn, replacement_btn)
    print('Updated renderAccumulationCard buttons')
else:
    print('target_btn NOT found')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
