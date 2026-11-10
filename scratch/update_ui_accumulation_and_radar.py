# -*- coding: utf-8 -*-
import sys

def main():
    with open('js/ui.js', 'r', encoding='utf-8') as f:
        content = f.read()

    content_norm = content.replace('\r\n', '\n')

    # 1. Update renderAccumulationCard
    start_acc = "    function renderAccumulationCard(item, rank) {"
    end_acc = "    function renderMarketOpportunityCard(item, rank) {"

    idx_start_acc = content_norm.find(start_acc)
    idx_end_acc = content_norm.find(end_acc)

    if idx_start_acc == -1 or idx_end_acc == -1:
        print("ERROR: markers for renderAccumulationCard not found")
        sys.exit(1)

    new_acc_fn = """    function renderAccumulationCard(item, rank) {
      const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
      const numSupport = parseFloat(String(item.supportPrice || item.support).replace(/[^\\d.]/g, '')) || (curPrice * 0.97);
      const suggestedBuy = item.suggestedBuyPrice || (numSupport ? Number((numSupport * 1.005).toFixed(2)) : curPrice);
      const buyRangeMin = Number((numSupport * 0.995).toFixed(2));
      const buyRangeMax = Number((suggestedBuy * 1.015).toFixed(2));
      const noChasePrice = Number((buyRangeMax * 1.015).toFixed(2));

      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 1.25));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isUnderValued = fvDiscount > 0;

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 border-emerald-500/50 hover:border-emerald-500/80 rounded-2xl overflow-hidden shadow-xl transition-all">
          <div class="bg-emerald-950/70 border-b border-emerald-500/30 p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs sm:text-sm font-black text-emerald-300">أولوية #${rank} • ${item.name} (${item.ticker})</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-gray-300 border border-gray-700 font-bold">
                تزويد وتخفيض متوسط
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs sm:text-sm ${item.returnPct < 0 ? 'text-rose-400 bg-rose-950/70 border-rose-500/30' : 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30'} border px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (${item.returnPct >= 0 ? '+' : ''}${item.returnPct.toFixed(1)}%)
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg ${item.cycle ? item.cycle.badgeClass : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'} font-bold">
                ${item.cycle ? item.cycle.shortBadge : '🟢 قاع وتجميع'}
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- Fair Value & Margin of Safety Box -->
            <div class="bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
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
                  <span>${isUnderValued ? `يتداول بخصم ${fvDiscount}% عن قيمته الحقيقية (أرخص من سعره العادل 🟢)` : `أعلى من قيمته العادلة بـ ${Math.abs(fvDiscount)}% 🟡`}</span>
                </span>
              </div>
            </div>

            <!-- Execution Box ("أشتري على كام؟") -->
            <div class="bg-gradient-to-r from-amber-950/40 via-gray-950 to-emerald-950/30 border-2 border-amber-500/50 rounded-xl p-3.5 space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع أمر التزويد المقترح:</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر الشراء عند: ${Number(suggestedBuy).toFixed(2)} ج
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 pt-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-gray-400 font-medium">• نطاق الشراء الآمن:</span>
                  <strong class="text-white font-mono">${Number(buyRangeMin).toFixed(2)} ج</strong> إلى <strong class="text-white font-mono">${Number(buyRangeMax).toFixed(2)} ج</strong>
                </div>
                <div class="flex items-center gap-1.5 text-rose-300 font-medium">
                  <span>• قاعدة عدم المطاردة:</span>
                  <span>إذا تجاوز السعر <strong class="text-white font-mono">${Number(noChasePrice).toFixed(2)} ج</strong> لا تطارد السهم</span>
                </div>
              </div>
            </div>

            <div class="text-[11.5px] text-gray-300 leading-relaxed bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-1.5 font-sans">
              <p>• <strong>الخطة المقترحة:</strong> تخصيص <strong class="text-emerald-300 font-mono">${item.suggestedCash.toLocaleString('en-US')} ج</strong> من رصيدك الكاش لشراء <strong class="text-white font-mono">${item.sharesToBuy} سهم</strong> بسعر التنفيذ المقترح <strong class="text-amber-300 font-mono">${Number(suggestedBuy).toFixed(2)} ج</strong>.</p>
              <p>• <strong>الفائدة المباشرة:</strong> سينخفض متوسط تكلفة السهم عليك من <strong class="text-rose-300 font-mono">${item.buyPrice.toFixed(2)} ج</strong> إلى <strong class="text-emerald-400 font-mono">${item.newAvgCost.toFixed(2)} ج</strong> فوراً (توفير ${item.avgReductionEgp} ج لكل سهم!).</p>
              ${item.dcaPlan ? `
                <div class="mt-2 pt-2 border-t border-gray-800/80">
                  <div class="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-1.5">
                    <span class="flex items-center gap-1"><i data-lucide="layers" class="w-3.5 h-3.5 text-cyan-400"></i> خطة التجميع الهرمي (3 دفعات ذكية):</span>
                    <span class="text-[10px] text-emerald-400 font-normal">توفير إجمالي: ${item.dcaPlan.totalReductionEgp} ج/سهم</span>
                  </div>
                  <div class="grid grid-cols-3 gap-1.5 text-[10px] text-center font-mono">
                    <div class="bg-gray-950 p-1.5 rounded-lg border border-emerald-500/30">
                      <div class="text-xs text-emerald-300 font-bold">1. فوري (40%)</div>
                      <div class="text-white font-bold">${item.dcaPlan.tranches[0].shares} سهم</div>
                      <div class="text-gray-400 text-[11px]">${item.dcaPlan.tranches[0].allocationCash.toLocaleString('en-US')} ج</div>
                    </div>
                    <div class="bg-gray-950 p-1.5 rounded-lg border border-cyan-500/30">
                      <div class="text-xs text-cyan-300 font-bold">2. ارتداد (30%)</div>
                      <div class="text-white font-bold">${item.dcaPlan.tranches[1].shares} سهم</div>
                      <div class="text-gray-400 text-[11px]">عند ${item.dcaPlan.tranches[1].targetPrice} ج</div>
                    </div>
                    <div class="bg-gray-950 p-1.5 rounded-lg border border-purple-500/30">
                      <div class="text-xs text-purple-300 font-bold">3. اختراق (30%)</div>
                      <div class="text-white font-bold">${item.dcaPlan.tranches[2].shares} سهم</div>
                      <div class="text-gray-400 text-[11px]">عند ${item.dcaPlan.tranches[2].targetPrice} ج</div>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>تنفيذ الشراء في تطبيق ثندر 🚀</span>
              </a>
              <button onclick="openTradeModal('${item.ticker}', 'BUY', ${item.sharesToBuy}, ${Number(suggestedBuy).toFixed(2)})" class="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/40 cursor-pointer">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>تسجيل في المحفظة ⚡</span>
              </button>
              <button onclick="openAuditModal('${item.ticker}')" class="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs border border-gray-800 cursor-pointer" title="تقرير الاقتراح">
                <i data-lucide="file-text" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

"""

    content_norm = content_norm[:idx_start_acc] + new_acc_fn + content_norm[idx_end_acc:]

    # 2. Update renderRadarGrid to include Fair Value & Buy Order Price in each radar card
    old_radar_grid_part = """            <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-2 bg-gray-950/50 p-2 rounded-xl border border-gray-800/80">
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="سعر الدعم الأول الذي إذا تماسك فوقه السهم يبدأ بالصعود">الدعم S1 (سعر الأمان)</span>
                <span class="font-bold text-white font-mono">${item.support}</span>
              </div>
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="مستوى المقاومة والهدف السعري الأول المتوقع">المقاومة R1 (الهدف الأول)</span>
                <span class="font-bold text-emerald-400 font-mono">${item.target1}</span>
              </div>
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="سعر الخروج الحامي لرأس المال لو هبط السهم دونه">وقف الخسارة (حماية رأس المال)</span>
                <span class="font-bold text-rose-400 font-mono">${item.stopLoss}</span>
              </div>
            </div>"""

    new_radar_grid_part = """            <!-- Fair Value & Execution Price Banner -->
            ${(() => {
              const fvObj = (typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, item.price) : null;
              const numS = parseFloat(String(item.support).replace(/[^\\d.]/g, '')) || (item.price * 0.95);
              const suggBuy = (numS * 1.005).toFixed(2);
              return `
                <div class="mb-2 bg-gradient-to-r from-amber-950/30 to-emerald-950/20 p-2 rounded-xl border border-amber-500/30 text-[10px] space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-300 font-semibold flex items-center gap-1">
                      <span>💎 السعر العادل:</span>
                      <strong class="text-white font-mono font-bold">${fvObj ? fvObj.fairValue.toFixed(2) + ' ج' : '--'}</strong>
                    </span>
                    ${fvObj ? `
                      <span class="px-1.5 py-0.5 rounded font-bold ${fvObj.isUndervalued ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                        ${fvObj.isUndervalued ? `خصم ${fvObj.discountPct}% 🟢` : `+${Math.abs(fvObj.discountPct)}% 🟡`}
                      </span>
                    ` : ''}
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-amber-500/20 font-mono text-[9.5px]">
                    <span class="text-amber-300 font-bold font-sans">🎯 أمر الشراء المقترح:</span>
                    <strong class="text-amber-300 font-bold">ضع أمر الشراء عند: ${suggBuy} ج</strong>
                  </div>
                </div>
              `;
            })()}

            <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-2 bg-gray-950/50 p-2 rounded-xl border border-gray-800/80">
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="سعر الدعم الأول الذي إذا تماسك فوقه السهم يبدأ بالصعود">الدعم S1 (سعر الأمان)</span>
                <span class="font-bold text-white font-mono">${item.support}</span>
              </div>
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="مستوى المقاومة والهدف السعري الأول المتوقع">المقاومة R1 (الهدف الأول)</span>
                <span class="font-bold text-emerald-400 font-mono">${item.target1}</span>
              </div>
              <div>
                <span class="text-slate-300 block text-xs font-medium" title="سعر الخروج الحامي لرأس المال لو هبط السهم دونه">وقف الخسارة (حماية رأس المال)</span>
                <span class="font-bold text-rose-400 font-mono">${item.stopLoss}</span>
              </div>
            </div>"""

    if old_radar_grid_part not in content_norm:
        print("ERROR: old_radar_grid_part not found")
        sys.exit(1)

    content_norm = content_norm.replace(old_radar_grid_part, new_radar_grid_part)

    with open('js/ui.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content_norm)

    print("SUCCESS: accumulation and radar grid updated successfully")

if __name__ == '__main__':
    main()
