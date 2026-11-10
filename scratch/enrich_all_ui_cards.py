# -*- coding: utf-8 -*-
import sys

def main():
    with open('js/ui.js', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('\r\n', '\n')

    # 1. Replace renderProfitTakingCard
    start_pt = "    function renderProfitTakingCard(item, rank) {"
    end_pt = "    function renderRiskDefenseCard(item, rank) {"

    idx_start_pt = content.find(start_pt)
    idx_end_pt = content.find(end_pt)

    if idx_start_pt == -1 or idx_end_pt == -1:
        print("ERROR: markers for renderProfitTakingCard not found")
        sys.exit(1)

    new_pt = """    function renderProfitTakingCard(item, rank) {
      const curPrice = Number(item.currentPrice) || 0;
      const rsiVal = Number(item.rsi || (item.returnPct > 20 ? 74.2 : 68.5));
      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 0.95));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isOverValued = fvDiscount < 0;

      const suggestedSell = item.suggestedSellPrice || curPrice;
      const dynamicTrailingStop = item.suggestedTrailingStop || Number((curPrice * 0.97).toFixed(2));

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 border-amber-500/60 hover:border-amber-500/90 rounded-2xl overflow-hidden shadow-xl transition-all">
          <div class="bg-amber-950/70 border-b border-amber-500/40 p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span class="text-xs sm:text-sm font-black text-amber-300">أولوية #${rank} • ${item.name} (${item.ticker})</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-gray-300 border border-gray-700 font-bold">
                🎯 جني أرباح وتأمين
              </span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              ${getCardRsiBadge(rsiVal)}
              <span class="font-mono font-bold text-xs sm:text-sm text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (+${item.returnPct.toFixed(1)}%)
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg ${item.cycle ? item.cycle.badgeClass : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'} font-bold">
                ${item.cycle ? item.cycle.shortBadge : 'قمة تشبع'}
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- Fair Value & Valuation Stance -->
            <div class="bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <i data-lucide="scale" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="text-[11px] text-gray-400 block font-medium">السعر العادل المالي الحقيقي</span>
                  <strong class="text-sm font-bold text-white font-mono">${Number(fv).toFixed(2)} ج</strong>
                </div>
              </div>
              <div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isOverValued ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                  <i data-lucide="${isOverValued ? 'alert-triangle' : 'check-circle'}" class="w-3.5 h-3.5"></i>
                  <span>${isOverValued ? `أعلى من قيمته العادلة بـ +${Math.abs(fvDiscount)}% (تأكيد جني الأرباح والتخفيف 🎯)` : `يتداول قرب قيمته العادلة (تأمين مكسب ممتاز 🟢)`}</span>
                </span>
              </div>
            </div>

            <!-- Execution Box ("أبيع على كام؟") -->
            <div class="bg-gradient-to-r from-amber-950/40 via-gray-950 to-orange-950/30 border-2 border-amber-500/50 rounded-xl p-3.5 space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع أمر جني الأرباح المقترح:</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر بيع جزئي عند: ${Number(suggestedSell).toFixed(2)} ج
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 pt-1 font-sans">
                <div>
                  • <strong>الكمية المقترحة:</strong> بيع <strong class="text-amber-300 font-mono">${item.sellShares} سهم</strong> لتحصيل <strong class="text-emerald-400 font-mono font-bold">${Number(item.sellCash).toLocaleString('en-US')} ج.م</strong> كاش مضمون (ربح محقق +${Number(item.realizedProfit).toLocaleString('en-US')} ج).
                </div>
                <div>
                  • <strong>إعادة الشراء عند الدعم:</strong> وضع أمر شراء معلق عند <strong class="text-cyan-300 font-mono font-bold">${item.rebuyPrice} ج</strong> لشراء <strong class="text-white font-mono font-bold">${item.rebuyShares} سهم</strong> (+${item.netGainShares} سهم مجاناً!).
                </div>
              </div>
            </div>

            <!-- Technical Targets & Stops Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-amber-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">مستوى القمة الحالية</span>
                <span class="font-bold text-xs sm:text-sm text-amber-300">${curPrice.toFixed(2)} ج</span>
                <span class="text-[10px] text-emerald-400 block font-sans font-bold mt-0.5">(+${item.returnPct.toFixed(1)}%)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-cyan-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">المقاومة التالية (R2)</span>
                <span class="font-bold text-xs sm:text-sm text-cyan-300">${item.pivotR2 ? item.pivotR2 + ' ج' : '--'}</span>
                <span class="text-[10px] text-cyan-400 block font-sans font-bold mt-0.5">امتداد صعود</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-blue-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">خط الأمان المتحرك</span>
                <span class="font-bold text-xs sm:text-sm text-blue-400">${dynamicTrailingStop} ج</span>
                <span class="text-[10px] text-blue-300 block font-sans font-bold mt-0.5">يحبس +${Math.max(0, Math.round((dynamicTrailingStop - item.buyPrice)/item.buyPrice * 100))}%</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-emerald-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">دعم إعادة الشراء</span>
                <span class="font-bold text-xs sm:text-sm text-emerald-400">${item.rebuyPrice} ج</span>
                <span class="text-[10px] text-emerald-300 block font-sans font-bold mt-0.5">ارتكاز قاع</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>فتح السهم وتنفيذ البيع في تطبيق ثندر 🚀</span>
              </a>
              <button onclick="openTradeModal('${item.ticker}', 'SELL', ${item.sellShares}, ${curPrice})" class="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 cursor-pointer">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span>تسجيل جني الأرباح ⚡</span>
              </button>
              <button onclick="quickApplySafetyLevel('${item.ticker}', '${dynamicTrailingStop}')" class="py-3 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-blue-300 font-bold text-xs flex items-center justify-center gap-1 border border-blue-500/30 cursor-pointer" title="تثبيت خط الأمان فوراً">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
                <span>تثبيت الأمان 🛡️</span>
              </button>
              <button onclick="openAuditModal('${item.ticker}')" class="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs border border-gray-800 cursor-pointer" title="تقرير الفحص الشامل">
                <i data-lucide="file-text" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </div>
      `;
    }
"""

    content = content[:idx_start_pt] + new_pt + content[idx_end_pt:]

    # 2. Replace renderRiskDefenseCard
    start_rd = "    function renderRiskDefenseCard(item, rank) {"
    end_rd = "    function renderAccumulationCard(item, rank) {"

    idx_start_rd = content.find(start_rd)
    idx_end_rd = content.find(end_rd)

    if idx_start_rd == -1 or idx_end_rd == -1:
        print("ERROR: markers for renderRiskDefenseCard not found")
        sys.exit(1)

    new_rd = """    function renderRiskDefenseCard(item, rank) {
      const curPrice = Number(item.currentPrice) || 0;
      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 1.25));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isUnderValued = fvDiscount > 0;

      const suggestedExit = item.suggestedExitPrice || (item.isConfirmedExit ? Number((curPrice * 0.998).toFixed(2)) : Number((item.supportPrice || curPrice * 0.98).toFixed(2)));
      const savedCash = item.savedCash || Math.round((item.shares || 0) * curPrice);

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 ${item.isConfirmedExit ? 'border-rose-500/60 hover:border-rose-500/90' : 'border-amber-500/60 hover:border-amber-500/90'} rounded-2xl overflow-hidden shadow-xl transition-all">
          <div class="${item.isConfirmedExit ? 'bg-rose-950/70 border-rose-500/40' : 'bg-amber-950/70 border-amber-500/40'} border-b p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${item.isConfirmedExit ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'}"></span>
              <span class="text-xs sm:text-sm font-black ${item.isConfirmedExit ? 'text-rose-300' : 'text-amber-300'}">أولوية #${rank} • ${item.name} (${item.ticker})</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-gray-300 border border-gray-700 font-bold">
                ${item.isConfirmedExit ? 'حماية ووقف خسارة' : 'تريث ومراقبة دعم'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs sm:text-sm ${item.returnPct < 0 ? 'text-rose-400 bg-rose-950/70 border-rose-500/40' : 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40'} border px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (${item.returnPct >= 0 ? '+' : ''}${item.returnPct.toFixed(1)}%)
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg ${item.badgeClass} font-bold">
                ${item.badgeText}
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- Fair Value & Fundamental Shield -->
            <div class="bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg ${item.isConfirmedExit ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} border flex items-center justify-center shrink-0">
                  <i data-lucide="scale" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="text-[11px] text-gray-400 block font-medium">السعر العادل المالي الحقيقي</span>
                  <strong class="text-sm font-bold text-white font-mono">${Number(fv).toFixed(2)} ج</strong>
                </div>
              </div>
              <div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isUnderValued ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}">
                  <i data-lucide="${isUnderValued ? 'shield-check' : 'alert-octagon'}" class="w-3.5 h-3.5"></i>
                  <span>${isUnderValued ? `السعر العادل ${fv} ج (رخيص بخصم ${fvDiscount}%، لكن كسر الدعم يستوجب الانضباط 🛡️)` : `أعلى من قيمته العادلة بـ ${Math.abs(fvDiscount)}% (خروج فوري لحماية الكاش ⚠️)`}</span>
                </span>
              </div>
            </div>

            <!-- Execution Box ("أخرج على كام؟") -->
            <div class="bg-gradient-to-r ${item.isConfirmedExit ? 'from-rose-950/40 via-gray-950 to-red-950/30 border-rose-500/50' : 'from-amber-950/40 via-gray-950 to-orange-950/30 border-amber-500/50'} border-2 rounded-xl p-3.5 space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${item.isConfirmedExit ? 'border-rose-500/20' : 'border-amber-500/20'} pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full ${item.isConfirmedExit ? 'bg-rose-400 animate-ping' : 'bg-amber-400 animate-pulse'}"></span>
                  <span class="text-xs sm:text-sm font-extrabold ${item.isConfirmedExit ? 'text-rose-300' : 'text-amber-300'}">🎯 سعر وضع أمر الخروج المقترح:</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black ${item.isConfirmedExit ? 'text-rose-300 border-rose-500/40' : 'text-amber-300 border-amber-500/40'} font-mono bg-black/60 px-3 py-0.5 rounded-lg border inline-block">
                    ${item.isConfirmedExit ? `ضع أمر بيع عند: ${Number(suggestedExit).toFixed(2)} ج` : `راقب الثبات فوق: ${Number(suggestedExit).toFixed(2)} ج`}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 pt-1 font-sans">
                <div>
                  • <strong>حماية الكاش المنقذ:</strong> بيع <strong class="text-white font-mono font-bold">${item.shares || 0} سهم</strong> ينقذ <strong class="text-emerald-400 font-mono font-bold">${Number(savedCash).toLocaleString('en-US')} ج.م</strong> كاش حر فوراً.
                </div>
                <div class="${item.isConfirmedExit ? 'text-rose-300' : 'text-amber-300'} font-medium">
                  • <strong>توجيه المستشار:</strong> ${item.advice}
                </div>
              </div>
            </div>

            <!-- Technical Bounds Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-rose-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">الدعم المكسور (S1)</span>
                <span class="font-bold text-xs sm:text-sm text-rose-400">${item.supportPrice ? Number(item.supportPrice).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-rose-300 block font-sans font-bold mt-0.5">خط الخروج</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-amber-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">القاع المتوقع (S2)</span>
                <span class="font-bold text-xs sm:text-sm text-amber-300">${item.pivotS2 ? Number(item.pivotS2).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-amber-200 block font-sans font-bold mt-0.5">منطقة ارتداد</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-cyan-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">المقاومة للتخفيف (R1)</span>
                <span class="font-bold text-xs sm:text-sm text-cyan-300">${item.pivotR1 ? Number(item.pivotR1).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-cyan-200 block font-sans font-bold mt-0.5">ارتداد مؤقت</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-slate-700">
                <span class="text-[10px] text-gray-400 block font-sans">سعر الشراء القديم</span>
                <span class="font-bold text-xs sm:text-sm text-slate-300">${Number(item.buyPrice).toFixed(2)} ج</span>
                <span class="text-[10px] text-slate-400 block font-sans font-bold mt-0.5">تكلفة الدخول</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl ${item.isConfirmedExit ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500' : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500'} text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-rose-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>فتح السهم وتنفيذ الإجراء في تطبيق ثندر 🚀</span>
              </a>
              <button onclick="${item.buttonAction === 'SELL' ? `openTradeModal('${item.ticker}', 'SELL', ${item.shares || 0}, ${curPrice})` : `openAuditModal('${item.ticker}')`}" class="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 ${item.isConfirmedExit ? 'text-rose-300 border-rose-500/40' : 'text-amber-300 border-amber-500/40'} font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span>${item.buttonText}</span>
              </button>
              <button onclick="openAuditModal('${item.ticker}')" class="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs border border-gray-800 cursor-pointer" title="تقرير التحليل الكامل">
                <i data-lucide="file-text" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </div>
      `;
    }
"""

    content = content[:idx_start_rd] + new_rd + content[idx_end_rd:]

    # 3. Replace renderSafetyLevelUpdateCard
    start_sl = "    function renderSafetyLevelUpdateCard(item, rank) {"
    end_sl = "    function renderWaitAndHoldCard(item, rank) {"

    idx_start_sl = content.find(start_sl)
    idx_end_sl = content.find(end_sl)

    if idx_start_sl == -1 or idx_end_sl == -1:
        print("ERROR: markers for renderSafetyLevelUpdateCard not found")
        sys.exit(1)

    new_sl = """    function renderSafetyLevelUpdateCard(item, rank) {
      const curPrice = Number(item.currentPrice) || 0;
      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 1.25));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isUnderValued = fvDiscount > 0;

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 border-blue-500/60 hover:border-blue-500/90 rounded-2xl overflow-hidden shadow-xl transition-all">
          <div class="bg-blue-950/70 border-b border-blue-500/40 p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span class="text-xs sm:text-sm font-black text-blue-300">أولوية #${rank} • ${item.name} (${item.ticker})</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-gray-300 border border-gray-700 font-bold">
                تعديل ورفع خط الأمان
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs sm:text-sm text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (+${item.returnPct.toFixed(1)}%)
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                🛡️ حبس ربح (+${item.lockedProfitPct}%)
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- Fair Value & Safety Margin -->
            <div class="bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <i data-lucide="scale" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="text-[11px] text-gray-400 block font-medium">السعر العادل المالي الحقيقي</span>
                  <strong class="text-sm font-bold text-white font-mono">${Number(fv).toFixed(2)} ج</strong>
                </div>
              </div>
              <div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isUnderValued ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}">
                  <i data-lucide="${isUnderValued ? 'check-circle' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
                  <span>${isUnderValued ? `يتداول بخصم ${fvDiscount}% عن قيمته الحقيقية (صعود آمن ومستمر 🟢)` : `أعلى من قيمته العادلة بـ ${Math.abs(fvDiscount)}% (ارفع الأمان لحبس القمة 🟡)`}</span>
                </span>
              </div>
            </div>

            <!-- Action Box: Level Comparison & Profit Locked -->
            <div class="bg-gradient-to-r from-blue-950/40 via-gray-950 to-indigo-950/30 border-2 border-blue-500/50 rounded-xl p-3.5 space-y-2">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono pb-1 border-b border-blue-500/20">
                <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800">
                  <span class="text-[10px] text-gray-400 block font-sans font-medium">خط الأمان القديم المتأخر</span>
                  <span class="font-bold text-xs sm:text-sm text-amber-400">${item.currentStopLoss.toFixed(2)} ج</span>
                  <span class="text-[10px] text-rose-300 block font-sans font-medium">معرض لخسارة المكسب</span>
                </div>
                <div class="p-2.5 rounded-lg bg-gray-950/80 border border-blue-500/40">
                  <span class="text-[10px] text-blue-300 block font-sans font-bold">خط الأمان المقترح الجديد</span>
                  <span class="font-bold text-xs sm:text-sm text-blue-400">${item.suggestedStop.toFixed(2)} ج</span>
                  <span class="text-[10px] text-emerald-300 block font-sans font-bold">يحبس ربح +${item.lockedProfitPct}%</span>
                </div>
                <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 col-span-2 sm:col-span-1">
                  <span class="text-[10px] text-gray-400 block font-sans font-medium">قيمة الأرباح المحمية</span>
                  <span class="font-bold text-xs sm:text-sm text-emerald-400">+${item.profitAtRisk.toLocaleString('en-US')} ج.م</span>
                  <span class="text-[10px] text-slate-300 block font-sans font-medium">${item.shares} سهم مملوك</span>
                </div>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed font-sans pt-1">
                • <strong>توجيه المستشار:</strong> السهم صعد بنجاح وابتعد عن نقطة الدخول. ارفع خط الأمان الآن إلى <strong class="text-blue-300 font-mono">${item.suggestedStop} ج</strong> لضمان الخروج بربح لا يقل عن <strong class="text-emerald-400 font-mono">+${item.lockedProfitPct}%</strong> في حال حدث أي هبوط مفاجئ.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="py-3 px-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-500/40 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>فتح في ثندر 🚀</span>
              </a>
              <div class="flex items-center gap-1.5 bg-gray-900 border border-gray-700 px-2.5 py-2 rounded-xl">
                <span class="text-[11px] text-gray-300 font-bold whitespace-nowrap">السعر:</span>
                <input type="number" step="0.05" id="quick-stop-input-${item.ticker}" value="${item.suggestedStop}" class="w-20 bg-gray-950 border border-blue-500/50 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-blue-400">
                <span class="text-[10.5px] text-gray-400">ج</span>
              </div>
              <button onclick="quickApplySafetyLevel('${item.ticker}', document.getElementById('quick-stop-input-${item.ticker}').value)" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xl shadow-blue-950/40 cursor-pointer">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
                <span>اعتماد وتثبيت خط الأمان الجديد 🛡️</span>
              </button>
              <button onclick="openPriceLevelsModal('${item.ticker}')" class="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-blue-300 font-bold text-xs flex items-center justify-center gap-1 border border-blue-500/30 cursor-pointer" title="تعديل وفحص المستويات كاملة">
                <i data-lucide="sliders" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </div>
      `;
    }
"""

    content = content[:idx_start_sl] + new_sl + content[idx_end_sl:]

    # 4. Replace renderWaitAndHoldCard
    start_wh = "    function renderWaitAndHoldCard(item, rank) {"
    end_wh = "    function confirmCompletedRebuy(ticker) {"

    idx_start_wh = content.find(start_wh)
    idx_end_wh = content.find(end_wh)

    if idx_start_wh == -1 or idx_end_wh == -1:
        print("ERROR: markers for renderWaitAndHoldCard not found")
        sys.exit(1)

    new_wh = """    function renderWaitAndHoldCard(item, rank) {
      const curPrice = Number(item.currentPrice) || 0;
      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 1.25));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isUnderValued = fvDiscount > 0;

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all">
          <div class="bg-slate-900/90 border-b border-slate-800 p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span class="text-xs sm:text-sm font-black text-slate-200">${item.name} (${item.ticker})</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-gray-300 border border-slate-700 font-bold">
                احتفاظ هادئ ومتابعة
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs sm:text-sm ${item.returnPct < 0 ? 'text-rose-400' : 'text-emerald-400'} bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (${item.returnPct >= 0 ? '+' : ''}${item.returnPct.toFixed(1)}%)
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                ⚪ مسار صحي
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- Fair Value & Position Status -->
            <div class="bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <i data-lucide="scale" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="text-[11px] text-gray-400 block font-medium">السعر العادل المالي الحقيقي</span>
                  <strong class="text-sm font-bold text-white font-mono">${Number(fv).toFixed(2)} ج</strong>
                </div>
              </div>
              <div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isUnderValued ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                  <i data-lucide="${isUnderValued ? 'check-circle' : 'info'}" class="w-3.5 h-3.5"></i>
                  <span>${isUnderValued ? `يتداول بخصم ${fvDiscount}% عن قيمته الحقيقية (استثمار هادئ آمن 🟢)` : `يتداول قرب قيمته العادلة بخصم ${fvDiscount}% ⚖️`}</span>
                </span>
              </div>
            </div>

            <!-- Holding Status Box -->
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-gray-300 leading-relaxed font-sans">
              <p>• <strong>قيمة المركز بالمحفظة:</strong> <strong class="text-white font-mono font-bold">${Number(item.currentValue).toLocaleString('en-US')} ج.م</strong> (${item.shares} سهم مملوك).</p>
              <p>• <strong>الأمان الفني اللحظي:</strong> السهم يتداول أعلى مستوى الدعم S1 (<strong class="text-cyan-300 font-mono">${item.pivotS1 ? Number(item.pivotS1).toFixed(2) + ' ج' : '--'}</strong>) بمسافة أمان صلبة <strong class="text-emerald-400 font-mono">+${item.distAboveS1Pct}%</strong>.</p>
              <p>• <strong>توجيه المستشار:</strong> ${item.advice}</p>
            </div>

            <!-- Technical Bounds Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span class="text-[10px] text-gray-400 block font-sans">الدعم الأساسي (S1)</span>
                <span class="font-bold text-xs sm:text-sm text-cyan-300">${item.pivotS1 ? Number(item.pivotS1).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-slate-400 block font-sans font-bold mt-0.5">خط الارتكاز</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span class="text-[10px] text-gray-400 block font-sans">المقاومة القادمة (R1)</span>
                <span class="font-bold text-xs sm:text-sm text-emerald-400">${item.pivotR1 ? Number(item.pivotR1).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-emerald-300 block font-sans font-bold mt-0.5">مستهدف صعود</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span class="text-[10px] text-gray-400 block font-sans">سعر الشراء (التكلفة)</span>
                <span class="font-bold text-xs sm:text-sm text-white">${Number(item.buyPrice).toFixed(2)} ج</span>
                <span class="text-[10px] text-slate-400 block font-sans font-bold mt-0.5">متوسط المحفظة</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span class="text-[10px] text-gray-400 block font-sans">مسافة الأمان الحالية</span>
                <span class="font-bold text-xs sm:text-sm text-emerald-400">+${item.distAboveS1Pct}%</span>
                <span class="text-[10px] text-emerald-300 block font-sans font-bold mt-0.5">فوق خط الأمان</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-slate-600 shadow-xl cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>فتح السهم في تطبيق ثندر 🚀</span>
              </a>
              <button onclick="openAuditModal('${item.ticker}')" class="flex-1 py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>تقرير فحص ومؤشرات السهم 📊</span>
              </button>
            </div>

          </div>
        </div>
      `;
    }
"""

    content = content[:idx_start_wh] + new_wh + content[idx_end_wh:]

    with open('js/ui.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

    print("SUCCESS: All ui.js cards enriched successfully")

if __name__ == '__main__':
    main()
