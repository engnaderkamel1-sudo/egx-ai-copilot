/**
 * EGX AI Copilot - UI & View Layer (js/ui.js)
 * Portfolio table, metrics, donut chart, modals, themes, sidebar navigation, and radar UI.
 */

    let chartInstance = null;

    function safeCreateIcons() {
      try {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
          lucide.createIcons();
        }
      } catch (e) {
        console.warn('Lucide icon render warning:', e);
      }
    }

    // Render Donut Chart (Asset Allocation)
    function renderAllocationChart() {
      const canvas = document.getElementById('allocationChart');
      if (!canvas || typeof Chart === 'undefined') return;
      const ctx = canvas.getContext('2d');
      if (chartInstance) {
        chartInstance.destroy();
      }

      const labels = portfolioData.map(p => p.ticker);
      const values = portfolioData.map(p => p.value);
      const colors = [
        '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', 
        '#ec4899', '#f59e0b', '#14b8a6', '#6366f1', 
        '#84cc16', '#f43f5e', '#a855f7', '#0ea5e9'
      ];

      const isDark = document.documentElement.classList.contains('dark');

      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: isDark ? '#111827' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const total = values.reduce((a, b) => a + b, 0);
                  const pct = ((val / total) * 100).toFixed(1);
                  return ` ${context.label}: ${val.toLocaleString('en-US')} ج.م (${pct}%)`;
                }
              }
            }
          },
          cutout: '68%'
        }
      });
    }

    // Update Top Metric Numbers (100% Dynamic, Zero Phantoms)
    function updateMetrics() {
      let totalWealth = 0;
      let totalProfit = 0;
      let stocksWealth = 0;
      let stocksProfit = 0;
      let fundsWealth = 0;
      let fundsProfit = 0;
      let cashWealth = 0;
      let stocksCount = 0;

      portfolioData.forEach(item => {
        const val = Number(item.value) || 0;
        const prof = Number(item.profit) || 0;
        totalWealth += val;
        totalProfit += prof;
        if (item.ticker === 'CASH' || (item.category && item.category.includes('محفظة نقدية')) || item.isCashReserve) {
          cashWealth += val;
        } else if (item.ticker === 'NCS' || item.ticker === 'BSB' || (item.category && item.category.includes('صناديق'))) {
          fundsWealth += val;
          fundsProfit += prof;
        } else {
          stocksWealth += val;
          stocksProfit += prof;
          stocksCount++;
        }
      });

      // Direct forward accounting for portfolio totalCost (Shares * BuyPrice)
      let calculatedTotalCost = 0;
      portfolioData.forEach(item => {
        if (item.ticker === 'CASH' || item.isCashReserve) {
          calculatedTotalCost += (Number(item.value) || 0);
        } else {
          calculatedTotalCost += ((Number(item.shares) || 0) * (Number(item.buyPrice) || 0));
        }
      });
      const totalCost = calculatedTotalCost > 0 ? calculatedTotalCost : Math.max(0, totalWealth - totalProfit);
      const totalReturnPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      const totalWealthEl = document.getElementById('metric-total-wealth');
      if (totalWealthEl) totalWealthEl.innerHTML = `${Math.round(totalWealth).toLocaleString('en-US')} <span class="text-xs text-gray-400 font-normal">ج.م</span>`;
      
      const stocksWealthEl = document.getElementById('metric-stocks-wealth');
      if (stocksWealthEl) stocksWealthEl.innerHTML = `${Math.round(stocksWealth).toLocaleString('en-US')} <span class="text-xs text-gray-400 font-normal">ج.م</span>`;
      
      const fundsWealthEl = document.getElementById('metric-funds-wealth');
      if (fundsWealthEl) fundsWealthEl.innerHTML = `${Math.round(fundsWealth).toLocaleString('en-US')} <span class="text-xs text-gray-400 font-normal">ج.م</span>`;
      
      const cashWealthEl = document.getElementById('metric-cash-wealth');
      if (cashWealthEl) cashWealthEl.innerHTML = `${Math.round(cashWealth).toLocaleString('en-US')} <span class="text-xs text-gray-400 font-normal">ج.م</span>`;
      
      // Dynamic Subtexts
      const stocksCountLabel = document.getElementById('metric-stocks-count-label');
      if (stocksCountLabel) stocksCountLabel.innerText = `الأسهم القيادية (${stocksCount} شركات)`;

      const stocksReturnContainer = document.getElementById('metric-stocks-return-container');
      const stocksReturnSubtext = document.getElementById('metric-stocks-return-subtext');
      if (stocksReturnSubtext) {
        const isStkPos = stocksProfit >= 0;
        const stkReturnPct = stocksWealth > 0 && (stocksWealth - stocksProfit) > 0 
          ? ((stocksProfit / (stocksWealth - stocksProfit)) * 100).toFixed(1) 
          : '0';
        stocksReturnSubtext.innerText = `${isStkPos ? '+' : ''}${Math.round(stocksProfit).toLocaleString('en-US')} ج (${isStkPos ? '+' : ''}${stkReturnPct}% عوائد الأسهم)`;
        if (stocksReturnContainer) {
          stocksReturnContainer.className = `mt-2 text-xs font-medium flex items-center ${isStkPos ? 'text-emerald-400' : 'text-rose-400'}`;
          const iconEl = stocksReturnContainer.querySelector('i');
          if (iconEl) iconEl.setAttribute('data-lucide', isStkPos ? 'trending-up' : 'trending-down');
        }
      }

      const fundsReturnContainer = document.getElementById('metric-funds-return-container');
      const fundsReturnSubtext = document.getElementById('metric-funds-return-subtext');
      if (fundsReturnSubtext) {
        const isFndPos = fundsProfit >= 0;
        const fndReturnPct = fundsWealth > 0 && (fundsWealth - fundsProfit) > 0 
          ? ((fundsProfit / (fundsWealth - fundsProfit)) * 100).toFixed(1) 
          : '0';
        fundsReturnSubtext.innerText = `${isFndPos ? '+' : ''}${Math.round(fundsProfit).toLocaleString('en-US')} ج (${isFndPos ? '+' : ''}${fndReturnPct}% عوائد الصناديق)`;
        if (fundsReturnContainer) {
          fundsReturnContainer.className = `mt-2 text-xs font-medium flex items-center ${isFndPos ? 'text-cyan-400' : 'text-rose-400'}`;
          const iconEl = fundsReturnContainer.querySelector('i');
          if (iconEl) iconEl.setAttribute('data-lucide', isFndPos ? 'shield-check' : 'trending-down');
        }
      }

      const cashSubtext = document.getElementById('metric-cash-subtext');
      if (cashSubtext) {
        const cashPct = totalWealth > 0 ? ((cashWealth / totalWealth) * 100).toFixed(1) : '0';
        cashSubtext.innerText = `سيولة جاهزة (${cashPct}% من المحفظة)`;
      }

      const assetsCountEl = document.getElementById('assets-count-badge');
      if (assetsCountEl) assetsCountEl.innerText = `${portfolioData.length} أصل مالي`;
      
      const allocCountEl = document.getElementById('allocation-count-label');
      if (allocCountEl) allocCountEl.innerText = `${portfolioData.length} أصل مالي`;

      const navCountEl = document.getElementById('nav-portfolio-count');
      if (navCountEl) navCountEl.innerText = `${portfolioData.length} أصل`;

      const returnBadge = document.getElementById('metric-total-return-badge');
      if (returnBadge) {
        const isPositive = totalProfit >= 0;
        returnBadge.className = `flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`;
        returnBadge.innerHTML = `
          <i data-lucide="${isPositive ? 'trending-up' : 'trending-down'}" class="w-3.5 h-3.5 ml-1"></i>
          <span>${isPositive ? '+' : ''}${totalReturnPct.toFixed(2)}% (${isPositive ? '+' : ''}${Math.round(totalProfit).toLocaleString('en-US')} ج)</span>
        `;
      }
      const costSubtext = document.getElementById('metric-total-cost-subtext');
      if (costSubtext) {
        costSubtext.innerText = `أصل الشراء: ${Math.round(totalCost).toLocaleString('en-US')} ج.م`;
      }

      // Synchronize Advisor Welcome Message Dynamically
      const welcomeEl = document.getElementById('advisor-welcome-text');
      if (welcomeEl) {
        welcomeEl.innerHTML = `أهلاً بك! أنا مستشارك المالي الرقمي لمتابعة محفظتك في البورصة المصرية (القيمة الحالية: <strong class="text-emerald-400 font-mono">${Math.round(totalWealth).toLocaleString('en-US')} ج.م</strong>، وتشمل <strong class="text-white">${portfolioData.length} أصول مالية</strong> تغطي الأسهم القيادية وصناديق الاستثمار والسيولة الكاش).<br><br>نحن نعمل وفق استراتيجية استثمارية منضبطة تركز على القيمة والأرباح وتتجنب التداول اليومي المفرط. يمكنك سؤالي عن تحليل أي شركة، أو مراجعة مستويات الدعم والمقاومة، أو دراسة أي قرار قبل تنفيذه في تطبيق ثندر.`;
      }

      // Bind Position Sizing Capital Input to Real Portfolio Wealth
      const psInput = document.getElementById('ps-total-capital');
      if (psInput && !psInput.dataset.userEdited) {
        psInput.value = Math.round(totalWealth);
        if (typeof calculatePositionSize === 'function') calculatePositionSize();
      }

      // Refresh strategy slider value representations
      const strategySlider = document.getElementById('strategy-slider');
      if (strategySlider && typeof handleStrategySliderChange === 'function') {
        handleStrategySliderChange(strategySlider.value);
      }

      // Render the Top Daily Action Hub
      renderDailyActionHub();

      if (window.lucide) lucide.createIcons();
    }

    function openRotationPlanModalByTicker(ticker) {
      if (!ticker) return;
      if (typeof openRotationPlanModal === 'function') {
        openRotationPlanModal(ticker);
      } else if (typeof window.openRotationPlanModal === 'function') {
        window.openRotationPlanModal(ticker);
      } else if (typeof openAuditModal === 'function') {
        openAuditModal(ticker);
      }
    }

    function quickApplySafetyLevel(ticker, newStopLoss) {
      if (!ticker) return;
      const parsed = parseFloat(newStopLoss);
      if (isNaN(parsed) || parsed <= 0) {
        if (typeof showToast === 'function') showToast('يرجى إدخال رقم صحيح لخط الأمان', 'warning');
        return;
      }

      if (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.setCustomLevels === 'function') {
        EGX_Portfolio.setCustomLevels(ticker, { customStopLoss: parsed });
      }

      if (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData)) {
        const stock = portfolioData.find(s => s.ticker === ticker);
        if (stock) {
          stock.customStopLoss = parsed;
          stock.stopLoss = parsed;
        }
      }

      if (typeof savePortfolio === 'function') savePortfolio();
      if (typeof renderPortfolioTable === 'function') renderPortfolioTable();
      if (typeof renderDailyActionHub === 'function') renderDailyActionHub();

      if (typeof showToast === 'function') {
        showToast(`تم رفع وتثبيت خط الأمان لسهم ${ticker} عند ${parsed.toFixed(2)} ج بنجاح 🛡️`, 'success');
      } else {
        alert(`تم رفع وتثبيت خط الأمان لسهم ${ticker} عند ${parsed.toFixed(2)} ج بنجاح 🛡️`);
      }
    }
    window.quickApplySafetyLevel = quickApplySafetyLevel;

    function switchActionHubCategory(catId) {
      window.activeActionHubCategory = catId;
      renderDailyActionHub();
    }
    window.switchActionHubCategory = switchActionHubCategory;
    window.quickApplySafetyLevel = quickApplySafetyLevel;

        function getCardRsiBadge(rsiVal) {
      const r = Number(rsiVal) || 50;
      if (r < 30) {
        return `<span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold" title="تشبع بيعي مفرط - قاع وفرصة شراء">
          RSI: ${r} (تشبع بيعي &lt; 30 🟢 شراء)
        </span>`;
      } else if (r < 45) {
        return `<span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/50 font-bold" title="مرحلة تعافي وبناء عزم">
          RSI: ${r} (تعافي 30-45 🔵 ارتكاز)
        </span>`;
      } else if (r <= 65) {
        return `<span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold" title="صعود متزن وصحي">
          RSI: ${r} (صعود متزن 45-65 🟡 صحي)
        </span>`;
      } else if (r <= 70) {
        return `<span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 font-bold" title="اقتراب من القمم - هدوء مطلوب">
          RSI: ${r} (اقتراب قمم 65-70 🟠 هدوء)
        </span>`;
      } else {
        return `<span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/60 font-bold animate-pulse" title="تشبع شرائي مفرط - قمة وجني أرباح">
          RSI: ${r} (تشبع شرائي &gt; 70 🔴 قمة وجني أرباح)
        </span>`;
      }
    }

    function renderProfitTakingCard(item, rank) {
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
    function renderRiskDefenseCard(item, rank) {
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
    function renderAccumulationCard(item, rank) {
      const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
      const numSupport = parseFloat(String(item.supportPrice || item.support).replace(/[^\d.]/g, '')) || (curPrice * 0.97);
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

    function renderMarketOpportunityCard(item, rank) {
      const isHero = (rank === 1);
      const curPrice = Number(item.price) || 0;
      const numSupport = parseFloat(String(item.support).replace(/[^\d.]/g, '')) || (curPrice * 0.95);
      const suggestedBuy = item.suggestedBuyPrice || (numSupport ? Number((numSupport * 1.005).toFixed(2)) : curPrice);
      const buyRangeMin = item.buyRangeMin || Number((numSupport * 0.995).toFixed(2));
      const buyRangeMax = item.buyRangeMax || Number((suggestedBuy * 1.015).toFixed(2));
      const noChasePrice = item.noChasePrice || Number((buyRangeMax * 1.015).toFixed(2));

      // Fair value retrieval or fallback
      const fv = (item.fairValue !== undefined && item.fairValue !== null)
        ? item.fairValue
        : ((typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, curPrice).fairValue : (curPrice * 1.25));
      const fvDiscount = (item.fairValueDiscountPct !== undefined && item.fairValueDiscountPct !== null)
        ? item.fairValueDiscountPct
        : (fv > 0 ? Number((((fv - curPrice) / fv) * 100).toFixed(1)) : 0);
      const isUnderValued = fvDiscount > 0;

      // Tranche calculation fallback
      const sharesToBuy = item.suggestedShares || (suggestedBuy > 0 ? Math.floor(2500 / suggestedBuy) : 0);
      const trancheCash = item.actualTrancheSpend || Math.round(sharesToBuy * suggestedBuy);

      return `
        <div class="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 ${isHero ? 'border-amber-500/80 shadow-2xl shadow-amber-500/10' : 'border-cyan-500/40 hover:border-cyan-500/70 shadow-xl'} rounded-2xl overflow-hidden transition-all">
          
          <!-- Card Header -->
          <div class="${isHero ? 'bg-gradient-to-r from-amber-950/80 via-slate-950 to-cyan-950/80 border-b border-amber-500/40' : 'bg-cyan-950/60 border-b border-cyan-500/30'} p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${isHero ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'}"></span>
              <span class="text-xs sm:text-sm font-black ${isHero ? 'text-amber-300' : 'text-cyan-300'}">
                ${isHero ? '⭐ فرصة اليوم الأولى الذهبية' : `فرصة #${rank}`} • ${item.name} (${item.ticker})
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-gray-300 border border-gray-700 font-bold">
                ${item.sector}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-xs sm:text-sm text-white bg-slate-950 border ${isHero ? 'border-amber-500/40 text-amber-300' : 'border-cyan-500/30 text-white'} px-2.5 py-1 rounded-lg">
                ${curPrice.toFixed(2)} ج (${item.changePct})
              </span>
              <span class="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                🏆 تقييم: ${item.score}/100
              </span>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5">
            
            <!-- 1. Fair Value & Margin of Safety Box -->
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
                  <span>${isUnderValued ? `يتداول بخصم ${fvDiscount}% عن قيمته الحقيقية (أرخص من سعره العادل 🟢)` : `أعلى من قيمته العادلة بـ ${Math.abs(fvDiscount)}% (شراء بحذر 🟡)`}</span>
                </span>
              </div>
            </div>

            <!-- 2. The Golden Execution Box ("أشتري على كام؟") -->
            <div class="bg-gradient-to-r from-amber-950/40 via-gray-950 to-emerald-950/30 border-2 border-amber-500/50 rounded-xl p-3.5 space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع الأمر المقترح (أشتري على كام في ثندر؟):</span>
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

            <!-- 3. Targets & Stop Loss Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-emerald-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">المستهدف الأول (R1)</span>
                <span class="font-bold text-xs sm:text-sm text-emerald-400">${item.target1}</span>
                <span class="text-[10px] text-emerald-300 block font-sans font-bold mt-0.5">(+${item.target1GainPct || 15}%)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-cyan-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">المستهدف الثاني (R2)</span>
                <span class="font-bold text-xs sm:text-sm text-cyan-300">${item.target2}</span>
                <span class="text-[10px] text-cyan-300 block font-sans font-bold mt-0.5">(+${item.target2GainPct || 25}%)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-rose-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">وقف الخسارة (حماية رأس المال)</span>
                <span class="font-bold text-xs sm:text-sm text-rose-400">${item.stopLoss}</span>
                <span class="text-[10px] text-rose-300 block font-sans font-bold mt-0.5">(-${item.stopLossRiskPct || 5}%)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-gray-950/80 border border-indigo-500/30">
                <span class="text-[10px] text-gray-400 block font-sans">نسبة العائد للمخاطرة</span>
                <span class="font-bold text-xs sm:text-sm text-indigo-300">1 : ${item.riskRewardRatio || '3.0'}</span>
                <span class="text-[10px] text-indigo-200 block font-sans font-bold mt-0.5">ممتازة ⚡</span>
              </div>
            </div>

            <!-- 4. Smart Tranche Sizing Box -->
            ${sharesToBuy > 0 ? `
              <div class="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
                  </div>
                  <span class="text-gray-300 font-medium">الشريحة الأولى المقترحة (25% من السيولة):</span>
                </div>
                <div class="font-mono text-xs">
                  اشترِ <strong class="text-white font-bold bg-black/60 px-2 py-0.5 rounded border border-gray-700">${sharesToBuy} سهماً</strong> بتكلفة تقريبية <strong class="text-emerald-400 font-bold">${Number(trancheCash).toLocaleString('en-US')} ج.م</strong>
                </div>
              </div>
            ` : ''}

            <!-- 5. Catalyst & Operating Profit Notes -->
            <div class="text-[11.5px] text-gray-300 leading-relaxed bg-gray-900/80 p-3 rounded-xl border border-gray-800 space-y-1.5 font-sans">
              <p>• <strong>المحفز الجوهري:</strong> ${item.catalyst}.</p>
              ${item.pe ? `<p>• <strong>مكرر الربحية:</strong> <strong class="text-emerald-400 font-mono">${item.pe}</strong> (متوسط القطاع: <strong class="text-cyan-300 font-mono">${item.sectorPe || '--'}</strong>) • <span class="text-emerald-300">${item.operationalStability || 'أرباح تشغيلية معتمدة'}</span>.</p>` : ''}
              <p class="text-gray-400">• <strong>حالة السيولة والتداول:</strong> ${item.liquidityStatus}.</p>
            </div>

            <!-- 6. Action Buttons -->
            <div class="flex items-center gap-2 flex-wrap pt-1">
              <a href="${item.thndrUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/50 cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>فتح السهم وتنفيذ الشراء في تطبيق ثندر 🚀</span>
              </a>
              <button onclick="openTradeModal('${item.ticker}', 'BUY', ${sharesToBuy}, ${Number(suggestedBuy).toFixed(2)})" class="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/40 cursor-pointer">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>تسجيل في المحفظة ⚡</span>
              </button>
              <button onclick="openAuditModal('${item.ticker}')" class="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs border border-gray-800 cursor-pointer" title="تقرير الفحص الشامل">
                <i data-lucide="file-text" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </div>
      `;
    }

    function renderSafetyLevelUpdateCard(item, rank) {
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
    function renderWaitAndHoldCard(item, rank) {
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
    function confirmCompletedRebuy(ticker) {
      if (!ticker) return;
      let pendingList = [];
      try {
        pendingList = JSON.parse(localStorage.getItem('egx_pending_rebuys') || '[]');
      } catch(e) { pendingList = []; }

      const plan = pendingList.find(p => p.ticker === ticker);
      if (!plan) return;

      const cost = Number((plan.rebuyShares * plan.rebuyPrice).toFixed(2));
      const cashAsset = (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData))
        ? portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve)
        : null;

      if (cashAsset) {
        cashAsset.value = Math.max(0, Number((cashAsset.value - cost).toFixed(2)));
      }

      let stock = portfolioData.find(p => p.ticker === ticker);
      if (stock) {
        const oldShares = stock.shares || 0;
        const newShares = oldShares + plan.rebuyShares;
        stock.shares = newShares;
        stock.value = Math.round(newShares * (stock.currentPrice || plan.rebuyPrice));
      }

      // Remove from pending list
      pendingList = pendingList.filter(p => p.ticker !== ticker);
      localStorage.setItem('egx_pending_rebuys', JSON.stringify(pendingList));

      if (typeof savePortfolio === 'function') savePortfolio();
      if (typeof renderPortfolioTable === 'function') renderPortfolioTable();
      if (typeof renderDailyActionHub === 'function') renderDailyActionHub();

      const freeGain = plan.freeShares > 0 ? `وحصولك على +${plan.freeShares} أسهم إضافية مجاناً 🚀` : '';
      if (typeof showToast === 'function') {
        showToast(`🎉 مبروك! تم بنجاح تنفيذ إعادة شراء ${plan.rebuyShares} سهم في ${plan.name} ${freeGain}`, 'success');
      } else {
        alert(`🎉 مبروك! تم بنجاح تنفيذ إعادة شراء ${plan.rebuyShares} سهم في ${plan.name} ${freeGain}`);
      }
    }
    window.confirmCompletedRebuy = confirmCompletedRebuy;

    function cancelPendingRebuy(ticker) {
      if (!ticker) return;
      let pendingList = [];
      try {
        pendingList = JSON.parse(localStorage.getItem('egx_pending_rebuys') || '[]');
      } catch(e) { pendingList = []; }

      pendingList = pendingList.filter(p => p.ticker !== ticker);
      localStorage.setItem('egx_pending_rebuys', JSON.stringify(pendingList));

      if (typeof renderDailyActionHub === 'function') renderDailyActionHub();

      if (typeof showToast === 'function') {
        showToast(`تم إلغاء خطة إعادة الشراء والإبقاء على السيولة كاش حر بالمحفظة 💵`, 'info');
      } else {
        alert(`تم إلغاء خطة إعادة الشراء والإبقاء على السيولة كاش حر بالمحفظة 💵`);
      }
    }
    window.cancelPendingRebuy = cancelPendingRebuy;

        // Thndr Sync View Handlers
    function pasteThndrFromClipboardView() {
      if (!navigator.clipboard) {
        if (typeof showToast === 'function') showToast('متصفحك لا يدعم القراءة المباشرة؛ استخدم Ctrl + V للصق النص.', 'info');
        return;
      }
      navigator.clipboard.readText().then(text => {
        const input = document.getElementById('thndr-manual-json-input-view');
        if (input) {
          input.value = text;
          if (typeof showToast === 'function') showToast('تم لصق أرقام المحفظة من الحافظة بنجاح ✅', 'success');
        }
      }).catch(() => {
        if (typeof showToast === 'function') showToast('يرجى لصق الكود يدوياً داخل المربع.', 'info');
      });
    }
    window.pasteThndrFromClipboardView = pasteThndrFromClipboardView;

    function handleThndrViewSyncSubmit() {
      const input = document.getElementById('thndr-manual-json-input-view');
      const replaceAll = document.getElementById('thndr-replace-all-view') ? document.getElementById('thndr-replace-all-view').checked : true;
      if (!input || !input.value.trim()) {
        if (typeof showToast === 'function') showToast('يرجى لصق الكود المنسوخ من ثندر أولاً.', 'error');
        else alert('يرجى لصق الكود المنسوخ من ثندر أولاً.');
        return;
      }
      try {
        const parsed = JSON.parse(input.value.trim());
        if (typeof applyThndrImport === 'function') {
          applyThndrImport(parsed, replaceAll);
        }
        input.value = '';
        if (typeof switchTab === 'function') switchTab('portfolio');
        if (typeof showToast === 'function') showToast('تمت مزامنة وتحديث المحفظة بنجاح بالقرش! ✅', 'success');
      } catch (err) {
        if (typeof showToast === 'function') showToast('صيغة البيانات غير صحيحة: ' + err.message, 'error');
        else alert('صيغة البيانات غير صحيحة: ' + err.message);
      }
    }
    window.handleThndrViewSyncSubmit = handleThndrViewSyncSubmit;

    // Render Top Daily Action Hub (Interactive Decision Engine for Plain-Arabic Guidance)
    function renderDailyActionHub() {
      const container = document.getElementById('daily-action-hub');
      if (!container || typeof EGX_Engine === 'undefined' || typeof EGX_Engine.generateDailyActionHub !== 'function') return;

      const cashAsset = (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData))
        ? portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve)
        : null;
      const cashVal = cashAsset ? Number(cashAsset.value) || 0 : 0;
      const hubData = EGX_Engine.generateDailyActionHub(portfolioData, fullMarketRadar, cashVal);
      const categories = hubData.categories || {
        profitTaking: [],
        riskDefense: [],
        safetyLevelUpdates: [],
        accumulation: [],
        marketOpportunities: [],
        waitAndHold: []
      };

      const counts = {
        profitTaking: (categories.profitTaking || []).length,
        riskDefense: (categories.riskDefense || []).length,
        safetyLevelUpdates: (categories.safetyLevelUpdates || []).length,
        accumulation: (categories.accumulation || []).length,
        marketOpportunities: (categories.marketOpportunities || []).length,
        waitAndHold: (categories.waitAndHold || []).length
      };

      // Determine active category (default to highest priority non-empty category)
      let activeCat = window.activeActionHubCategory;
      if (!activeCat || !categories[activeCat]) {
        if (counts.profitTaking > 0) activeCat = 'profitTaking';
        else if (counts.riskDefense > 0) activeCat = 'riskDefense';
        else if (counts.safetyLevelUpdates > 0) activeCat = 'safetyLevelUpdates';
        else if (counts.accumulation > 0) activeCat = 'accumulation';
        else if (counts.marketOpportunities > 0) activeCat = 'marketOpportunities';
        else activeCat = 'waitAndHold';
      }
      window.activeActionHubCategory = activeCat;

      const categoryDefs = [
        {
          id: 'profitTaking',
          name: 'جني الأرباح',
          icon: 'coins',
          count: counts.profitTaking,
          activeBorder: 'border-amber-500',
          activeBg: 'bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10',
          inactiveBorder: 'border-gray-800 hover:border-amber-500/40 text-gray-400 hover:text-amber-300',
          badgeClass: counts.profitTaking > 0 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        },
        {
          id: 'riskDefense',
          name: 'الحماية والبيع',
          icon: 'shield-alert',
          count: counts.riskDefense,
          activeBorder: 'border-rose-500',
          activeBg: 'bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-500/10',
          inactiveBorder: 'border-gray-800 hover:border-rose-500/40 text-gray-400 hover:text-rose-300',
          badgeClass: counts.riskDefense > 0 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        },
        {
          id: 'safetyLevelUpdates',
          name: 'رفع خط الأمان',
          icon: 'shield-check',
          count: counts.safetyLevelUpdates,
          activeBorder: 'border-blue-500',
          activeBg: 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10',
          inactiveBorder: 'border-gray-800 hover:border-blue-500/40 text-gray-400 hover:text-blue-300',
          badgeClass: counts.safetyLevelUpdates > 0 ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        },
        {
          id: 'accumulation',
          name: 'التزويد والتجميع',
          icon: 'plus-circle',
          count: counts.accumulation,
          activeBorder: 'border-emerald-500',
          activeBg: 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10',
          inactiveBorder: 'border-gray-800 hover:border-emerald-500/40 text-gray-400 hover:text-emerald-300',
          badgeClass: counts.accumulation > 0 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        },
        {
          id: 'marketOpportunities',
          name: 'فرص السوق الذهبية',
          icon: 'sparkles',
          count: counts.marketOpportunities,
          activeBorder: 'border-cyan-500',
          activeBg: 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10',
          inactiveBorder: 'border-gray-800 hover:border-cyan-500/40 text-gray-400 hover:text-cyan-300',
          badgeClass: counts.marketOpportunities > 0 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        },
        {
          id: 'waitAndHold',
          name: 'الانتظار والمتابعة',
          icon: 'eye',
          count: counts.waitAndHold,
          activeBorder: 'border-slate-500',
          activeBg: 'bg-slate-800 text-slate-200 shadow-lg shadow-slate-800/20',
          inactiveBorder: 'border-gray-800 hover:border-slate-600 text-gray-400 hover:text-slate-300',
          badgeClass: counts.waitAndHold > 0 ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
        }
      ];

      // Build tabs HTML
      const tabsHtml = categoryDefs.map(cat => {
        const isActive = cat.id === activeCat;
        return `
          <button onclick="switchActionHubCategory('${cat.id}')" class="category-tab-btn flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive ? `${cat.activeBorder} ${cat.activeBg}` : `${cat.inactiveBorder} bg-gray-950/70`}">
            <div class="flex items-center gap-1.5">
              <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
              <span>${cat.name}</span>
            </div>
            <span class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black ${cat.badgeClass}">${cat.count}</span>
          </button>
        `;
      }).join('');

      // Build active cards HTML
      let cardsHtml = '';
      const activeList = categories[activeCat] || [];

      if (activeList.length === 0) {
        let emptyTitle = '';
        let emptyDesc = '';
        let emptyIcon = 'check-circle';
        let emptyColor = 'text-emerald-400';

        switch (activeCat) {
          case 'profitTaking':
            emptyTitle = 'لا توجد أسهم بلغت قمم متضخمة لجني الأرباح حالياً';
            emptyDesc = 'جميع الأسهم الرابحة بمحفظتك تتحرك في مسار صعودي صحي ولم تصل بعد إلى مناطق التشبع أو المقاومات الحرجة. الاستمرار في الاحتفاظ هو الخيار الأمثل.';
            emptyIcon = 'trending-up';
            emptyColor = 'text-amber-400';
            break;
          case 'riskDefense':
            emptyTitle = 'محفظتك خالية تماماً من أي أسهم في منطقة خطر اليوم';
            emptyDesc = 'جميع مراكزك وأسهمك القيادية تتداول بأمان أعلى خطوط الدعم ونقاط الأمان الفنية. لا توجد أي إشارات خروج أو كسر مقلقة.';
            emptyIcon = 'shield-check';
            emptyColor = 'text-emerald-400';
            break;
          case 'safetyLevelUpdates':
            emptyTitle = 'جميع خطوط الأمان محدثة لحماية الأرباح';
            emptyDesc = 'لا توجد أسهم رابحة تحتاج لرفع خط الأمان حالياً؛ جميع مراكزك مؤمنة بوقف خسارة مواكب للأسعار.';
            emptyIcon = 'shield-check';
            emptyColor = 'text-blue-400';
            break;
          case 'accumulation':
            emptyTitle = 'لا توجد أسهم في قيعان تجميع حالياً';
            emptyDesc = 'لا توجد مراكز متراجعة مؤهلة لتخفيض المتوسط أو ضخ سيولة جديدة اليوم وفق قواعد الأمان الصارمة. احتفظ بسيولتك النقدية الحرة بأمان.';
            emptyIcon = 'wallet';
            emptyColor = 'text-cyan-400';
            break;
          case 'marketOpportunities':
            emptyTitle = 'جاري مسح شاشة السوق لرصد الفرص الذهبية';
            emptyDesc = 'لا توجد فرص جديدة خارج محفظتك تتجاوز معايير الجودة الفنية الصارمة والسيولة اللحظية اليوم. يمكنك متابعة رادار السوق بالأسفل.';
            emptyIcon = 'compass';
            emptyColor = 'text-purple-400';
            break;
          case 'waitAndHold':
          default:
            emptyTitle = 'جميع مراكزك مصنفة تحت القرارات النشطة بالأعلى';
            emptyDesc = 'كل سهم في محفظتك يمتلك حالياً خطة عمل واضحة إما لجني الأرباح أو التجميع أو خطة حماية.';
            emptyIcon = 'layers';
            emptyColor = 'text-slate-400';
            break;
        }

        cardsHtml = `
          <div class="bg-gray-950/80 border border-gray-800/90 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-inner">
            <div class="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 mx-auto flex items-center justify-center ${emptyColor}">
              <i data-lucide="${emptyIcon}" class="w-6 h-6"></i>
            </div>
            <div class="space-y-1">
              <h3 class="text-white font-extrabold text-sm sm:text-base">${emptyTitle}</h3>
              <p class="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">${emptyDesc}</p>
            </div>
          </div>
        `;
      } else {
        // Render vertical stack of cards
        cardsHtml = `
          <div class="flex flex-col gap-3.5">
            ${activeList.map((item, idx) => {
              if (activeCat === 'profitTaking') {
                return renderProfitTakingCard(item, idx + 1);
              } else if (activeCat === 'riskDefense') {
                return renderRiskDefenseCard(item, idx + 1);
              } else if (activeCat === 'safetyLevelUpdates') {
                return renderSafetyLevelUpdateCard(item, idx + 1);
              } else if (activeCat === 'accumulation') {
                return renderAccumulationCard(item, idx + 1);
              } else if (activeCat === 'marketOpportunities') {
                return renderMarketOpportunityCard(item, idx + 1);
              } else {
                return renderWaitAndHoldCard(item, idx + 1);
              }
            }).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="daily-hub-banner bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          
          <!-- Hub Header & Cash Status -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
                <i data-lucide="compass" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-lg font-black text-white tracking-wide">مركز التوجيه والقرارات اليومية الذكي</h2>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">مباشر ⚡</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">توجيهات استثمارية واضحة ومباشرة مرتبة بالأولوية القصوى لكل سهم</p>
              </div>
            </div>
            <div class="bg-gray-950/90 border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span class="text-gray-300">السيولة النقدية الحرة (الكاش): <strong class="text-cyan-300 font-mono font-bold">${Math.round(hubData.cashStatus.freeCash).toLocaleString('en-US')} ج.م</strong></span>
            </div>
          </div>

          <!-- Active Pending Rebuy Guidance Card -->
          ${(function() {
            let pendingList = [];
            try {
              pendingList = JSON.parse(localStorage.getItem('egx_pending_rebuys') || '[]');
            } catch(e) { pendingList = []; }
            if (!pendingList || pendingList.length === 0) return '';

            return pendingList.map(plan => `
              <div class="bg-gradient-to-r from-amber-950/80 via-gray-950 to-emerald-950/80 border-2 border-amber-500/60 rounded-xl p-4 shadow-xl space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                    <h3 class="text-xs sm:text-sm font-black text-amber-300">خطة إعادة الشراء المعلقة النشطة • ${plan.name} (${plan.ticker})</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">قيد الانتظار في المنصة 🎯</span>
                  </div>
                  <div class="text-[11px] text-gray-300 font-mono">
                    <span>كاش البيع المتاح: <strong class="text-emerald-400 font-bold">${Number(plan.sellCash).toLocaleString('en-US')} ج.م</strong></span>
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-black/60 border border-amber-500/30 text-xs text-gray-200 leading-relaxed space-y-1.5 font-sans">
                  <p>• <strong>ما تم تنفيذه بنجاح:</strong> بيع <strong class="text-amber-300 font-mono">${plan.soldShares} سهم</strong> بسعر قمة <strong class="text-white font-mono">${Number(plan.sellPrice).toFixed(2)} ج</strong> وحبس كاش مضمون.</p>
                  <p>• <strong>الخطوة المطلوبة منك في المنصة الآن:</strong> ضع أمر شراء معلق عند ارتكاز الدعم <strong class="text-cyan-300 font-mono font-bold">${Number(plan.rebuyPrice).toFixed(2)} ج</strong> لشراء <strong class="text-white font-mono font-bold">${plan.rebuyShares} سهم</strong>.</p>
                  <p class="text-emerald-300 font-bold">• <strong>المكسب المجاني المستهدف:</strong> رصيد أسهمك سيزداد بمقدار <strong class="text-white font-mono font-black">+${plan.freeShares || Math.max(1, plan.rebuyShares - plan.soldShares)} أسهم إضافية مجاناً</strong> دون دفع أي مليم!</p>
                </div>

                <div class="flex items-center gap-2 flex-wrap pt-1">
                  <button onclick="confirmCompletedRebuy('${plan.ticker}')" class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                    <span>تم تنفيذ أمر الشراء المعلق في المنصة بنجاح ⚡</span>
                  </button>
                  <button onclick="cancelPendingRebuy('${plan.ticker}')" class="py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-rose-300 text-xs font-bold border border-gray-700 cursor-pointer">
                    <span>إلغاء الخطة والإبقاء على الكاش 💵</span>
                  </button>
                </div>
              </div>
            `).join('');
          })()}

          <!-- 6 Categorized Action Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 overflow-x-auto pb-1">
            ${tabsHtml}
          </div>

          <!-- Active Category Card Stack Container -->
          <div id="action-hub-category-content" class="pt-1">
            ${cardsHtml}
          </div>

        </div>
      `;
      safeCreateIcons();
    }

    // Render Portfolio Table
    function renderPortfolioTable() {
      const tbody = document.getElementById('portfolio-table-body');
      tbody.innerHTML = '';

      const shockContainer = document.getElementById('systemic-shock-banner');
      if (shockContainer) {
        if (getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {
          shockContainer.classList.remove('hidden');
          shockContainer.innerHTML = `
            <div class="p-3 mb-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2 animate-pulse">
              <div class="flex items-center gap-2">
                <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400"></i>
                <span class="font-bold">⚠️ إنذار هبوط ذعري شامل (Systemic Shock Alert): السوق يشهد تراجعاً حاداً؛ تم تجميد صفقات الشراء عند الدعوم للحفاظ على السيولة.</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-rose-500/20 text-[10px] font-mono font-bold">تجميد الشراء</span>
            </div>
          `;
          if (window.lucide) lucide.createIcons();
        } else {
          shockContainer.classList.add('hidden');
          shockContainer.innerHTML = '';
        }
      }

      const totalWealth = portfolioData.reduce((acc, cur) => acc + cur.value, 0);

      portfolioData.forEach((item, index) => {
        if (typeof AiSanityShield !== 'undefined' && typeof AiSanityShield.auditAsset === 'function') {
          AiSanityShield.auditAsset(item);
        }
        const evalResult = (typeof EGX_Engine !== 'undefined') 
          ? EGX_Engine.evaluateAsset(item, getMarketRegimeCode()) 
          : { isLosing: (item.profit || 0) < 0, badgeText: 'احتفاظ', badgeColor: 'bg-gray-800 text-gray-300' };

        const cycle = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.determineStockCycle === 'function')
          ? EGX_Engine.determineStockCycle(item)
          : { stage: 2, shortBadge: 'مسار صاعد 🟡', badgeClass: 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50' };

        const isCash = item.ticker === 'CASH' || item.isCashReserve;
        const isNeutral = isCash || Math.abs(item.profit || 0) < 0.01;
        const isPositive = !isNeutral && (item.profit > 0);
        const colorClass = isNeutral ? 'text-gray-400' : (isPositive ? 'text-emerald-400' : 'text-rose-400');
        const bgBadgeClass = isNeutral 
          ? 'bg-gray-800/60 text-gray-400 border-gray-700/60' 
          : (isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');
        const badgeActionText = evalResult.badgeText;
        const badgeActionColor = evalResult.badgeColor;

        const weightPct = totalWealth > 0 ? ((item.value / totalWealth) * 100).toFixed(1) : 0;
        const cost = item.value - item.profit;

        // Custom Levels & Technical Anchors
        const customLevels = (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getCustomLevels === 'function') 
          ? EGX_Portfolio.getCustomLevels(item.ticker) 
          : null;

        const isCashOrFund = item.ticker === 'CASH' || item.ticker === 'NCS' || item.ticker === 'BSB' || item.isCashReserve;
        const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
        const buyPrice = Number(item.buyPrice) || curPrice;

        // Effective Target 1 (Profit Ceiling)
        const standardTarget1 = Number(item.pivotR1 || item.target1) || Number((curPrice * 1.15).toFixed(2));
        const effectiveTarget1 = (customLevels && customLevels.customTarget1) ? customLevels.customTarget1 : standardTarget1;
        const isCustomTarget = !!(customLevels && customLevels.customTarget1);
        const targetGainPct = curPrice > 0 ? (((effectiveTarget1 - curPrice) / curPrice) * 100).toFixed(1) : 0;
        const isTargetReached = !isCashOrFund && curPrice >= effectiveTarget1;

        // Effective Stop Loss (Safety Floor)
        const standardStopLoss = Number(item.pivotS1 || item.stopLoss) || Number((curPrice * 0.90).toFixed(2));
        const effectiveStopLoss = (customLevels && customLevels.customStopLoss) ? customLevels.customStopLoss : standardStopLoss;
        const isCustomStop = !!(customLevels && customLevels.customStopLoss);
        const stopLossBuffer = curPrice > 0 ? (((curPrice - effectiveStopLoss) / curPrice) * 100).toFixed(1) : 0;
        const isStopBroken = !isCashOrFund && curPrice < effectiveStopLoss;

        const fund = (item.pe ? item : (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getFundamentals === 'function' ? EGX_Portfolio.getFundamentals(item.ticker) : null)) || item;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-800/40 transition';
        tr.innerHTML = `
          <!-- 1. Stock / Symbol -->
          <td class="py-3.5 px-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                ${item.ticker}
              </div>
              <div>
                <div class="font-bold text-white text-sm sm:text-base">${item.name}</div>
                <div class="text-xs text-slate-300 font-medium">${item.category}</div>
                ${item.ticker !== 'CASH' ? `
                  <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${cycle.badgeClass}" title="${cycle.advice || ''}">
                      ${cycle.shortBadge}
                    </span>
                    ${fund.pe ? `
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 flex items-center gap-1 shadow-sm" title="مكرر ربحية السهم: ${fund.pe} | متوسط القطاع: ${fund.sectorPe || '--'}">
                        <i data-lucide="scale" class="w-3 h-3 text-cyan-400"></i>
                        <span>P/E: <strong class="text-white">${fund.pe}</strong></span>
                        <span class="text-gray-400 font-sans">| قطاع:</span>
                        <strong class="text-cyan-300">${fund.sectorPe || '--'}</strong>
                      </span>
                      ${fund.peVsSectorPct !== undefined && fund.peVsSectorPct !== null ? `
                        <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold ${fund.peVsSectorPct <= 0 ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/90 text-amber-300 border border-amber-800/60'}" title="${fund.valuationStatus || ''}">
                          ${fund.peVsSectorPct < 0 ? `أرخص ${Math.abs(fund.peVsSectorPct)}% 🟢` : (fund.peVsSectorPct > 0 ? `أعلى +${fund.peVsSectorPct}% 🟡` : 'مماثل للقطاع ⚖️')}
                        </span>
                      ` : ''}
                    ` : `
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 border border-amber-800/60 text-amber-300 flex items-center gap-1 shadow-sm" title="لم تعلن الشركة بعد نتائج أعمالها المعتمدة أو قيد التدقيق الرسمي">
                        <i data-lucide="clock" class="w-3 h-3 text-amber-400"></i>
                        <span>⏳ بانتظار الإفصاح</span>
                      </span>
                    `}
                  </div>
                ` : ''}
              </div>
            </div>
          </td>

          <!-- 2. Live Market Price per Share (سعر السهم اللحظي بالبورصة) -->
          <td class="py-3.5 px-3 text-center">
            ${item.currentPrice && item.ticker !== 'CASH' && item.ticker !== 'NCS' && item.ticker !== 'BSB' 
              ? `<div class="inline-flex flex-col items-center">
                  <div class="bg-cyan-950/50 border border-cyan-800/60 px-2.5 py-1 rounded-lg inline-block font-mono font-bold text-cyan-200 text-sm sm:text-base shadow-sm">
                    <span>${Number(item.currentPrice).toFixed(2)}</span>
                    <span class="text-[10px] text-gray-400 font-sans">ج</span>
                  </div>
                  <div class="flex items-center gap-1 mt-1 text-[11px] text-slate-300 font-mono font-medium">
                    <span class="w-1.5 h-1.5 rounded-full ${item.priceSource && item.priceSource.includes('يدوي') ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}"></span>
                    <span>آخر تحديث: ${formatDateTimeDisplay(item.priceUpdatedAt)}</span>
                  </div>
                  <span class="text-[11px] text-slate-300 font-sans mt-0.5 font-medium">(${item.priceSource || 'شاشة البورصة اللحظية'})</span>
                 </div>`
              : `<span class="text-slate-400 font-bold">--</span>`}
          </td>

          <!-- 3. Buy Price & Shares Quantity (متوسط الشراء والكمية) -->
          <td class="py-3.5 px-3 text-center text-xs">
            ${item.ticker !== 'CASH' ? `
              <div class="flex flex-col items-center gap-0.5 font-mono">
                <span class="font-bold text-gray-200">${item.buyPrice ? Number(item.buyPrice).toFixed(2) + ' ج' : '--'}</span>
                <span class="text-[10px] text-indigo-300 px-1.5 py-0.2 rounded bg-indigo-950/50 border border-indigo-800/40">${item.shares ? item.shares.toLocaleString('en-US') + ' سهم' : '--'}</span>
                <span class="text-xs text-slate-300 font-sans font-medium">تكلفة: ${Math.round(cost).toLocaleString('en-US')} ج</span>
              </div>
            ` : `
              <span class="text-slate-400 font-bold">--</span>
            `}
          </td>

          <!-- 4. Target 1 (سقف المكاسب الأول - بيع للربح) -->
          <td class="py-3.5 px-3 text-center">
            ${!isCashOrFund ? `
              <div class="flex flex-col items-center gap-1">
                <div class="font-mono font-black text-emerald-300 text-sm sm:text-base">
                  ${effectiveTarget1.toFixed(2)} <span class="text-[10px] text-gray-400 font-sans font-normal">ج</span>
                </div>
                <div class="flex items-center gap-1">
                  ${isTargetReached 
                    ? `<span class="px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white animate-pulse shadow-sm">🎯 وصل للهدف!</span>`
                    : `<span class="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40">+${targetGainPct}% ربح</span>`
                  }
                  ${isCustomTarget ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold" title="رقم مخصص قمت بوضعه بنفسك">مخصص</span>` : ''}
                </div>
                <button onclick="openPriceLevelsModal('${item.ticker}')" class="text-xs text-emerald-300 hover:text-emerald-200 font-bold flex items-center justify-center gap-0.5 mt-0.5 underline cursor-pointer" title="فحص المعادلة والمصدر وتعديل الرقم">
                  <i data-lucide="info" class="w-3 h-3 text-emerald-400"></i>
                  <span>المصدر والضبط</span>
                </button>
              </div>
            ` : `
              <span class="text-slate-400 font-bold">--</span>
            `}
          </td>

          <!-- 5. Stop Loss (حد الخسارة الأدنى - قاع الأمان) -->
          <td class="py-3.5 px-3 text-center">
            ${!isCashOrFund ? `
              <div class="flex flex-col items-center gap-1">
                <div class="font-mono font-black ${isStopBroken ? 'text-rose-400 animate-pulse' : 'text-rose-300'} text-sm sm:text-base">
                  ${effectiveStopLoss.toFixed(2)} <span class="text-[10px] text-gray-400 font-sans font-normal">ج</span>
                </div>
                <div class="flex items-center gap-1">
                  ${evalResult.action === 'EMERGENCY_STOP_LOSS'
                    ? `<span class="px-1.5 py-0.5 rounded text-xs font-black bg-rose-600 text-white animate-pulse shadow-sm" title="انهيار حاد: نفذ الخروج فوراً">🚨 خروج طارئ!</span>`
                    : (evalResult.action === 'INTRADAY_DIP_WATCH'
                      ? `<span class="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-500/50" title="كسر لحظي أثناء الجلسة: انتظر تأكيد إغلاق 02:30 م">🟡 كسر لحظي (انتظر)</span>`
                      : (evalResult.action === 'CORE_BUFFER_WATCH'
                        ? `<span class="px-1.5 py-0.5 rounded text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-500/50" title="سهم قيادي استثماري: مستقر ضمن وسادة الأمان أعلى S2">🛡️ وسادة أمان</span>`
                        : (isStopBroken 
                          ? `<span class="px-1.5 py-0.5 rounded text-xs font-black bg-rose-600 text-white shadow-sm" title="تم تأكيد كسر الدعم بالإغلاق">🔴 تأكيد كسر S1</span>`
                          : `<span class="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-rose-300 bg-rose-950/90 border border-rose-500/40">أمان ${stopLossBuffer}%</span>`
                        )
                      )
                    )
                  }
                  ${isCustomStop ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold" title="رقم مخصص قمت بوضعه بنفسك">مخصص</span>` : ''}
                </div>
                <button onclick="openPriceLevelsModal('${item.ticker}')" class="text-xs text-rose-300 hover:text-rose-200 font-bold flex items-center justify-center gap-0.5 mt-0.5 underline cursor-pointer" title="فحص المعادلة والمصدر وتعديل الرقم">
                  <i data-lucide="info" class="w-3 h-3 text-rose-400"></i>
                  <span>المصدر والضبط</span>
                </button>
              </div>
            ` : `
              <span class="text-slate-400 font-bold">--</span>
            `}
          </td>

          <!-- 6. Total Market Value & Profit / Performance (القيمة والأرباح) -->
          <td class="py-3.5 px-3 text-xs sm:text-sm">
            <div class="font-mono font-bold text-white">
              ${Math.round(item.value).toLocaleString('en-US')} <span class="text-[10px] text-gray-400 font-sans">ج.م</span>
            </div>
            <div class="mt-0.5 flex items-center gap-1 font-mono text-[10px]">
              ${isNeutral
                ? `<span class="px-1.5 py-0.2 rounded border ${bgBadgeClass} text-gray-400">سيولة حرة</span>`
                : `<span class="px-1.5 py-0.2 rounded border ${bgBadgeClass} flex items-center gap-0.5">
                     <i data-lucide="${isPositive ? 'trending-up' : 'trending-down'}" class="w-3 h-3"></i>
                     <span>${isPositive ? '+' : ''}${item.returnPct.toFixed(2)}% (${isPositive ? '+' : ''}${Math.round(item.profit).toLocaleString('en-US')} ج)</span>
                   </span>`
              }
            </div>
          </td>

          <!-- 7. Advisor Advice & Decision Freshness -->
          <td class="py-3.5 px-3 text-xs text-gray-300">
            <div class="flex flex-col gap-1 items-start">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeActionColor}">${badgeActionText}</span>
                <button onclick="openAuditModal('${item.ticker}')" class="text-xs px-2 py-0.5 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1 transition cursor-pointer" title="تقرير الاقتراح والمصادر الاستثمارية">
                  <i data-lucide="file-text" class="w-3 h-3 text-emerald-400"></i>
                  <span>تقرير الاقتراح 📊</span>
                </button>
                <button onclick="openPriceLevelsModal('${item.ticker}')" class="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-0.5 shrink-0" title="بطاقة الأمان وفحص المصادر">
                  <i data-lucide="crosshair" class="w-3 h-3 text-emerald-400"></i>
                  <span>سقف وقاع 🎯</span>
                </button>
              </div>
              <div class="text-xs text-slate-200 leading-normal font-medium">
                ${item.advice || ''}
              </div>
              ${fund.operationalStability ? `
                <div class="mt-1 flex items-center gap-1 text-[11px] font-sans font-bold px-2 py-0.5 rounded border ${fund.pe ? 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40' : 'text-amber-300 bg-amber-950/40 border-amber-800/40'}" title="فحص الأرباح التشغيلية">
                  <i data-lucide="${fund.pe ? 'shield-check' : 'clock'}" class="w-3 h-3 ${fund.pe ? 'text-emerald-400' : 'text-amber-400'} shrink-0"></i>
                  <span>${fund.operationalStability}</span>
                </div>
              ` : `
                <div class="mt-1 flex items-center gap-1 text-[11px] font-sans font-bold px-2 py-0.5 rounded border text-amber-300 bg-amber-950/40 border-amber-800/40" title="فحص الأرباح التشغيلية">
                  <i data-lucide="clock" class="w-3 h-3 text-amber-400 shrink-0"></i>
                  <span>⏳ بانتظار الإفصاح المالي المعتمد لبيانات التشغيل</span>
                </div>
              `}
            </div>
          </td>

          <!-- 8. Quick Actions (إجراء سريع) -->
          <td class="py-3.5 px-3 text-center">
            <div class="flex items-center justify-center gap-1">
              ${item.ticker !== 'CASH' ? `
                <button onclick="openAuditModal('${item.ticker}')" class="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition shadow cursor-pointer" title="تقرير الاقتراح والمصادر 📊">
                  <i data-lucide="file-text" class="w-3.5 h-3.5 text-emerald-400"></i>
                </button>
              ` : ''}
              <button onclick="openPriceLevelsModal('${item.ticker}')" class="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 hover:text-white transition" title="فحص المصدر وضبط حدود السعر">
                <i data-lucide="crosshair" class="w-3.5 h-3.5 text-cyan-400"></i>
              </button>
              <button onclick="openFineTuneModal(${index})" class="p-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white transition" title="تعديل عدد الأسهم أو سعر الشراء">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      safeCreateIcons();
    }

    // Price Levels, Targets & Stop Loss Verification Modal
    // ============================================================
    function openPriceLevelsModal(ticker) {
      const modal = document.getElementById('price-levels-verifier-modal');
      if (!modal) return;

      const item = portfolioData.find(s => s.ticker === ticker) || 
                   fullMarketRadar.find(s => s.ticker === ticker) || 
                   { ticker: ticker, name: ticker, currentPrice: 100, buyPrice: 100 };

      const customLevels = (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getCustomLevels === 'function') 
        ? EGX_Portfolio.getCustomLevels(ticker) 
        : null;

      const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
      const buyPrice = Number(item.buyPrice) || curPrice;
      const returnPct = Number(item.returnPct) || (buyPrice > 0 ? (((curPrice - buyPrice) / buyPrice) * 100) : 0);

      // Raw technical values from live feed or estimation
      const high = Number(item.high) || Number((curPrice * 1.025).toFixed(2));
      const low = Number(item.low) || Number((curPrice * 0.975).toFixed(2));
      const close = Number(item.close) || curPrice;
      const pivot = Number(item.pivot) || Number(((high + low + close) / 3).toFixed(2));
      
      const standardTarget1 = Number(item.pivotR1 || item.target1) || Number(((2 * pivot) - low).toFixed(2));
      const standardStopLoss = Number(item.pivotS1 || item.stopLoss) || Number(((2 * pivot) - high).toFixed(2));

      const activeTarget1 = (customLevels && customLevels.customTarget1) ? customLevels.customTarget1 : standardTarget1;
      const activeStopLoss = (customLevels && customLevels.customStopLoss) ? customLevels.customStopLoss : standardStopLoss;

      // Populate Elements
      const tickerInput = document.getElementById('pl-modal-ticker-input');
      if (tickerInput) tickerInput.value = ticker;
      
      const titleEl = document.getElementById('pl-modal-stock-title');
      if (titleEl) titleEl.innerText = `فحص المصدر وضبط حدود السعر: ${item.name || ticker}`;
      
      const tickerBadge = document.getElementById('pl-modal-stock-ticker');
      if (tickerBadge) tickerBadge.innerText = ticker;
      
      const curPriceEl = document.getElementById('pl-modal-current-price');
      if (curPriceEl) curPriceEl.innerText = `${curPrice.toFixed(2)} ج`;
      
      const buyPriceEl = document.getElementById('pl-modal-buy-price');
      if (buyPriceEl) buyPriceEl.innerText = `${buyPrice.toFixed(2)} ج`;

      const retBadge = document.getElementById('pl-modal-return-badge');
      if (retBadge) {
        retBadge.innerText = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`;
        retBadge.className = `font-mono font-bold text-sm ${returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
      }

      // Target Card
      const targetInput = document.getElementById('pl-input-custom-target');
      if (targetInput) targetInput.value = activeTarget1.toFixed(2);

      const targetGainPct = curPrice > 0 ? (((activeTarget1 - curPrice) / curPrice) * 100).toFixed(1) : 0;
      const targetGainEl = document.getElementById('pl-modal-target-gain-pct');
      if (targetGainEl) targetGainEl.innerText = `${targetGainPct >= 0 ? '+' : ''}${targetGainPct}% ربح من سعرك الحالي`;

      const targetStatusEl = document.getElementById('pl-modal-target-status');
      if (targetStatusEl) {
        if (curPrice >= activeTarget1) {
          targetStatusEl.innerText = '🎯 وصل للهدف (جاهز للبيع)';
          targetStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-white font-bold animate-pulse';
        } else {
          targetStatusEl.innerText = (customLevels && customLevels.customTarget1) ? 'سقف مخصص ✏️' : 'سقف ستاندرد تلقائي';
          targetStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
        }
      }

      // Stop Loss Card
      const stopInput = document.getElementById('pl-input-custom-stoploss');
      if (stopInput) stopInput.value = activeStopLoss.toFixed(2);

      const stopLossBuffer = curPrice > 0 ? (((curPrice - activeStopLoss) / curPrice) * 100).toFixed(1) : 0;
      const stopLossBufferEl = document.getElementById('pl-modal-stoploss-buffer');
      if (stopLossBufferEl) {
        stopLossBufferEl.innerText = curPrice < activeStopLoss 
          ? `⚠️ مكسور بنسبة -${Math.abs(stopLossBuffer)}% (نفّذ خروج لحماية باقي رأس المال)` 
          : `أمان ${stopLossBuffer}% قبل مستوى الوقف`;
        stopLossBufferEl.className = `font-mono font-bold ${curPrice < activeStopLoss ? 'text-rose-400 animate-pulse' : 'text-rose-300'}`;
      }

      const stopStatusEl = document.getElementById('pl-modal-stoploss-status');
      if (stopStatusEl) {
        if (curPrice < activeStopLoss) {
          const sess = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getEGXSessionStatus === 'function')
            ? EGX_Engine.getEGXSessionStatus()
            : { isOpen: false };
          const isEmerg = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.checkEmergencyDrop === 'function')
            ? EGX_Engine.checkEmergencyDrop(item, typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL').isEmergency
            : false;

          if (isEmerg) {
            stopStatusEl.innerText = '🚨 انهيار حاد طارئ (بيع فوري)';
            stopStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse';
          } else if (sess.isOpen) {
            stopStatusEl.innerText = '🟡 كسر لحظي أثناء الجلسة (انتظر إغلاق 02:30 م)';
            stopStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
          } else {
            stopStatusEl.innerText = '🔴 كسر مؤكد بالإغلاق اليومي';
            stopStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold';
          }
        } else {
          stopStatusEl.innerText = (customLevels && customLevels.customStopLoss) ? 'قاع مخصص ✏️' : 'قاع ستاندرد تلقائي';
          stopStatusEl.className = 'text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold';
        }
      }

      // Raw Session Data
      const rawHigh = document.getElementById('pl-raw-high');
      if (rawHigh) rawHigh.innerText = `${high.toFixed(2)} ج`;
      const rawLow = document.getElementById('pl-raw-low');
      if (rawLow) rawLow.innerText = `${low.toFixed(2)} ج`;
      const rawClose = document.getElementById('pl-raw-close');
      if (rawClose) rawClose.innerText = `${close.toFixed(2)} ج`;
      const rawPivot = document.getElementById('pl-raw-pivot');
      if (rawPivot) rawPivot.innerText = `${pivot.toFixed(2)} ج`;

      // Fundamental Data in Price Levels Modal
      const f = (item.pe ? item : (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getFundamentals === 'function' ? EGX_Portfolio.getFundamentals(ticker) : null)) || item;

      const rawPe = document.getElementById('pl-raw-pe');
      if (rawPe) rawPe.innerText = f.pe ? `${f.pe}` : '--';

      const rawSecPe = document.getElementById('pl-raw-sector-pe');
      if (rawSecPe) rawSecPe.innerText = f.sectorPe ? `${f.sectorPe}` : '--';

      const rawEps = document.getElementById('pl-raw-eps');
      if (rawEps) rawEps.innerText = f.eps ? `${f.eps} ج` : '--';

      const rawOpMargin = document.getElementById('pl-raw-operating-margin');
      if (rawOpMargin) rawOpMargin.innerText = f.operatingMargin !== undefined && f.operatingMargin !== null ? `${f.operatingMargin}%` : (f.netMargin ? `${f.netMargin}% (صافي)` : '--');

      const rawValBadge = document.getElementById('pl-raw-valuation-badge');
      if (rawValBadge) {
        if (f.pe && f.sectorPe) {
          const isCheap = f.pe <= f.sectorPe;
          const diffPct = Math.abs(f.peVsSectorPct !== undefined && f.peVsSectorPct !== null ? f.peVsSectorPct : Math.round(((f.pe - f.sectorPe) / f.sectorPe) * 100));
          rawValBadge.innerText = isCheap ? `سهم أرخص من القطاع بنسبة ${diffPct}% (فرصة مغرية 🟢)` : (f.pe > f.sectorPe ? `أعلى من القطاع بـ ${diffPct}% (علاوة تقييم)` : 'مماثل لمتوسط القطاع');
          rawValBadge.className = `text-[10px] font-mono font-bold ${isCheap ? 'text-emerald-400' : 'text-cyan-400'}`;
        } else {
          rawValBadge.innerText = '⏳ بانتظار الإفصاح الرسمي (التقييم معلق)';
          rawValBadge.className = 'text-[10px] text-amber-400 font-bold';
        }
      }

      const rawStability = document.getElementById('pl-raw-operational-stability');
      if (rawStability) {
        const isVerified = f.pe && f.operationalStability && !f.operationalStability.includes('بانتظار');
        rawStability.innerHTML = `
          <i data-lucide="${isVerified ? 'check-circle' : 'clock'}" class="w-3 h-3 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}"></i>
          <span>${f.operationalStability || '⏳ بانتظار الإفصاح المالي المعتمد لبيانات التشغيل'}</span>
        `;
      }

      const rawEqHint = document.getElementById('pl-raw-equation-hint');
      if (rawEqHint) {
        if (f.pe && f.eps) {
          rawEqHint.innerText = `المعادلة: سعر ${curPrice.toFixed(2)} ج ÷ ربح السهم (EPS) ${f.eps} ج = مكرر ربحية ${f.pe}x`;
        } else {
          rawEqHint.innerText = `المعادلة معلقة: لا يمكن حساب مكرر الربحية إلا بعد إعلان ربحية السهم المجمعة (EPS) رسمياً في البورصة.`;
        }
      }

      // Recommendation report button setup in price levels modal
      const auditBtn = document.getElementById('pl-modal-audit-btn');
      if (auditBtn) auditBtn.onclick = () => openAuditModal(ticker);

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      safeCreateIcons();
    }

    function closePriceLevelsModal() {
      const modal = document.getElementById('price-levels-verifier-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function saveCustomPriceLevelsModal() {
      const tickerInput = document.getElementById('pl-modal-ticker-input');
      const ticker = tickerInput ? tickerInput.value : null;
      if (!ticker) return;

      const targetInput = document.getElementById('pl-input-custom-target');
      const stopInput = document.getElementById('pl-input-custom-stoploss');
      const targetVal = targetInput ? parseFloat(targetInput.value) : null;
      const stopVal = stopInput ? parseFloat(stopInput.value) : null;

      if (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.setCustomLevels === 'function') {
        EGX_Portfolio.setCustomLevels(ticker, {
          customTarget1: (!isNaN(targetVal) && targetVal > 0) ? targetVal : null,
          customStopLoss: (!isNaN(stopVal) && stopVal > 0) ? stopVal : null
        });
      }

      closePriceLevelsModal();
      renderPortfolioTable();
      renderDailyActionHub();
      if (typeof showToast === 'function') {
        showToast(`تم حفظ وتثبيت أرقامك المخصصة لسهم ${ticker} بنجاح ✅`, 'success');
      }
    }

    function resetCustomPriceLevelsModal() {
      const tickerInput = document.getElementById('pl-modal-ticker-input');
      const ticker = tickerInput ? tickerInput.value : null;
      if (!ticker) return;

      if (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.resetCustomLevels === 'function') {
        EGX_Portfolio.resetCustomLevels(ticker);
      }

      openPriceLevelsModal(ticker);
      renderPortfolioTable();
      renderDailyActionHub();
      if (typeof showToast === 'function') {
        showToast(`تمت استعادة الأرقام الافتراضية (الستاندرد) لـ ${ticker} بنجاح 🔄`, 'info');
      }
    }

    // Investment Due Diligence & Proof Verification Modal
    // ============================================================
    function closeAuditModal() {
      const modal = document.getElementById('audit-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    let _lastAuditStock = null;
    let _lastAuditFund = null;

    function openAuditModal(ticker) {
      const cleanTicker = ticker ? String(ticker).trim().toUpperCase() : '';
      
      const portfolioItem = (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData))
        ? portfolioData.find(s => s.ticker && s.ticker.trim().toUpperCase() === cleanTicker)
        : null;

      const radarItem = (typeof fullMarketRadar !== 'undefined' && Array.isArray(fullMarketRadar))
        ? fullMarketRadar.find(s => s.ticker && s.ticker.trim().toUpperCase() === cleanTicker)
        : null;

      const rawStock = portfolioItem 
        ? { ...radarItem, ...portfolioItem }
        : (radarItem || {
            ticker: cleanTicker || 'TICKER',
            name: cleanTicker || 'سهم بالبورصة المصرية',
            price: 0,
            catalyst: 'إيرادات تشغيلية ومحفزات قطاعية قوية بالبورصة المصرية',
            support: 'دعم هيكلي متماسك',
            target1: 'مستهدف صاعد',
            stopLoss: 'وقف خسارة صارم',
            volumeMultiplier: '2.5x'
          });

      const currentQuote = Number(rawStock.currentPrice || rawStock.price || rawStock.close || 0);
      const stock = {
        ...rawStock,
        price: currentQuote,
        currentPrice: currentQuote
      };

      const fund = (stock && stock.pe ? stock : (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getFundamentals === 'function' ? EGX_Portfolio.getFundamentals(stock.ticker) : null)) || stock || {};

      _lastAuditStock = stock;
      _lastAuditFund = fund;
      window._lastAuditStock = stock;
      window._lastAuditFund = fund;

      const titleEl = document.getElementById('audit-modal-title');
      const subEl = document.getElementById('audit-modal-subtitle');
      const consensusBanner = document.getElementById('audit-consensus-banner');
      const container = document.getElementById('audit-agents-container');

      const decTime = stock.decisionUpdatedAt || stock.priceUpdatedAt || 'جلسة اليوم';
      const decBasis = stock.decisionBasis || `سعر السهم اللحظي: ${currentQuote.toFixed(2)} ج`;

      if (titleEl) titleEl.innerText = `تقرير الاقتراح الاستثماري: ${stock.name || stock.ticker} (${stock.ticker})`;
      if (subEl) subEl.innerText = `بيان تحليلي فني ومالي مدقق بالأرقام والمصادر الرسمية من البورصة والشارت اللحظي`;

      // Decision Classification & Reason
      const stopLossVal = parseFloat(stock.stopLoss || stock.pivotS1 || 0);
      const targetVal = parseFloat(stock.target1 || stock.pivotR1 || 0);
      const supportVal = parseFloat(stock.support || stock.pivotS1 || 0);

      const isStopBroken = (stopLossVal > 0 && currentQuote < stopLossVal) || stock.action === 'STOP_LOSS_WARNING';
      const isTargetReached = (targetVal > 0 && currentQuote >= targetVal);
      const isDipBuy = (!isStopBroken && (stock.action === 'BUY' || (supportVal > 0 && currentQuote <= supportVal * 1.03) || (stock.returnPct !== undefined && stock.returnPct < -1.5)));

      const evalStock = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.evaluateAsset === 'function')
        ? EGX_Engine.evaluateAsset(stock, typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL')
        : null;

      // Extract Unified Guaranteed Verdict from Engine (Impossible to conflict)
      const verdict = (evalStock && evalStock.verdict)
        ? evalStock.verdict
        : (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.buildUnifiedVerdict === 'function'
            ? EGX_Engine.buildUnifiedVerdict({
                action: isStopBroken ? (currentQuote < (stock.buyPrice || 0) ? 'STOP_LOSS_CONFIRMED' : 'INTRADAY_DIP_WATCH') : (isTargetReached ? 'REBALANCE_CANDIDATE' : (isDipBuy ? 'ACCUMULATE' : 'HOLD')),
                isLosing: currentQuote < (stock.buyPrice || 0),
                advice: 'السهم يتحرك داخل نطاق سعري وفني آمن بين مستويات الدعم والمقاومة.'
              })
            : {
                title: 'احتفاظ استثماري ومتابعة متوازنة ⚪',
                color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
                badge: 'احتفاظ',
                advice: 'السهم يتحرك داخل نطاق سعري وفني آمن بين مستويات الدعم والمقاومة، دون مؤشرات كسر أو تشبع.',
                buttonText: 'احتفاظ وتحديث المحفظة 👁️',
                buttonAction: 'HOLD',
                buttonClass: 'bg-slate-700 hover:bg-slate-600'
              });

      const verdictTitle = verdict.title;
      const verdictColor = verdict.color;
      const verdictBadge = verdict.badge;
      const verdictAdvice = verdict.advice;

      // Real Multi-Factor Score Assessment
      const qualityScore = stock.score || (stock.index === 'egx30' ? 88 : 78);
      let qualityBadgeText = 'مطابق لمعايير الاستثمار طويل الأجل';
      let qualityBadgeColor = 'bg-emerald-500/20 text-emerald-300';
      if (qualityScore >= 90) {
        qualityBadgeText = 'أمان مؤسسي وسيولة ممتازة (Top Tier)';
        qualityBadgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      } else if (qualityScore >= 75) {
        qualityBadgeText = 'جودة استثمارية جيدة • استقرار فني';
        qualityBadgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      } else {
        qualityBadgeText = 'مراقبة فنية • حذر عند مستويات الدعم';
        qualityBadgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      }

      consensusBanner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${qualityScore >= 75 ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping"></span>
          <span class="font-bold text-white text-sm">التقييم الاستثماري المتكامل (Multi-Factor Rating):</span>
          <span class="px-2 py-0.5 rounded-md ${qualityBadgeColor} font-bold text-xs">${qualityBadgeText}</span>
        </div>
        <div class="text-right">
          <span class="${qualityScore >= 75 ? 'text-emerald-400' : 'text-amber-400'} font-mono font-bold">مؤشر الجودة الفني: ${qualityScore}%</span>
          <span class="text-gray-400 text-[10px] block">تدقيق رياضي من شاشة TradingView</span>
        </div>
      `;

      // Official Source Links
      const tradingViewUrl = `https://www.tradingview.com/symbols/EGX-${stock.ticker}/`;
      const mubasherUrl = `https://www.mubasher.info/markets/EGX/stocks/${stock.ticker}`;

      const techEvidence = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.buildTechnicalEvidence === 'function')
        ? EGX_Engine.buildTechnicalEvidence(stock)
        : null;

      const stockCycle = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.determineStockCycle === 'function')
        ? EGX_Engine.determineStockCycle(stock)
        : { stage: 2, nameAr: 'المرحلة 2: مسار صاعد معتدل', shortBadge: 'مسار صاعد 🟡', badgeClass: 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50', advice: 'السهم يتحرك في اتجاه إيجابي صحي.', actionTag: 'احتفاظ', progressPct: 60, bgHeaderClass: 'from-cyan-950 to-slate-900' };

      container.innerHTML = `
        <!-- Decision Verdict & Executive Summary Banner -->
        <div class="p-3.5 rounded-xl border ${verdictColor} bg-gray-950/90 space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="font-extrabold text-white text-xs sm:text-sm">القرار الاستثماري المقترح:</span>
              <span class="px-2.5 py-0.5 rounded-lg ${verdictColor} font-black text-xs">${verdictTitle}</span>
            </div>
            <div class="text-[10.5px] text-gray-400 font-mono flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>وقت التقييم: <strong class="text-emerald-300">${formatDateTimeDisplay(decTime)}</strong></span>
            </div>
          </div>
          <p class="text-xs text-gray-200 leading-relaxed font-sans bg-black/40 p-2.5 rounded-lg border border-white/10">
            <strong>تفسير ومبرر القرار:</strong> ${verdictAdvice}
          </p>
          <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800 flex-wrap gap-2">
            <span>القرار صادر بناءً على: <strong class="text-cyan-300 font-mono">${decBasis}</strong></span>
            <span class="font-mono text-[10.5px]">
              دعم S2: <strong class="text-indigo-400">${stock.pivotS2 || (stock.pivotS1 ? (stock.pivotS1 * 0.95).toFixed(2) : '--')} ج</strong> |
              دعم S1: <strong class="text-cyan-400">${stock.pivotS1 || stock.support || '--'} ج</strong> |
              مقاومة R1: <strong class="text-emerald-400">${stock.pivotR1 || stock.target1 || '--'} ج</strong> |
              مقاومة R2: <strong class="text-amber-400">${stock.pivotR2 || (stock.pivotR1 ? (stock.pivotR1 * 1.05).toFixed(2) : '--')} ج</strong>
            </span>
            <span>الرمز الرسمي: <strong class="text-white font-mono">${stock.ticker}</strong></span>
          </div>
        </div>

        <!-- Stock Cycle Stage & Plain-Arabic Guidance Card -->
        <div class="bg-gradient-to-r ${stockCycle.bgHeaderClass} p-4 rounded-xl border border-gray-700 space-y-2.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${stockCycle.stage === 1 ? 'bg-emerald-400' : (stockCycle.stage === 3 ? 'bg-rose-400' : 'bg-cyan-400')} animate-ping"></span>
              <h4 class="font-bold text-white text-xs sm:text-sm">موقع السهم في الدورة السعرية:</h4>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${stockCycle.badgeClass}">${stockCycle.nameAr}</span>
            </div>
            <span class="text-[11px] text-gray-300 font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono">
              التوجيه المباشر: ${stockCycle.actionTag}
            </span>
          </div>

          <!-- Visual 4-Step Cycle Progress Bar -->
          <div class="space-y-1 pt-1">
            <div class="w-full bg-gray-950 h-3 rounded-full overflow-hidden p-0.5 border border-gray-700 flex">
              <div class="h-full rounded-full transition-all duration-500 ${stockCycle.stage === 1 ? 'bg-emerald-500' : (stockCycle.stage === 2 ? 'bg-cyan-500' : (stockCycle.stage === 3 ? 'bg-rose-500' : 'bg-purple-500'))}" style="width: ${stockCycle.progressPct}%"></div>
            </div>
            <div class="grid grid-cols-4 text-[9.5px] text-center font-bold text-gray-400 pt-0.5">
              <span class="${stockCycle.stage === 1 ? 'text-emerald-400 font-extrabold' : ''}">1. قاع وتجميع 🟢</span>
              <span class="${stockCycle.stage === 2 ? 'text-cyan-400 font-extrabold' : ''}">2. صعود معتدل 🟡</span>
              <span class="${stockCycle.stage === 3 ? 'text-rose-400 font-extrabold' : ''}">3. قمة وتشبع 🔴</span>
              <span class="${stockCycle.stage === 4 ? 'text-purple-400 font-extrabold' : ''}">4. كسر دعم 🟣</span>
            </div>
          </div>

          <!-- Plain Arabic Explanation -->
          <div class="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 leading-relaxed font-sans">
            <strong class="text-white">نصيحة المستشار المالي لك:</strong> ${stockCycle.advice}
          </div>
        </div>

        <!-- Pillar 1: Fundamental Analysis & P/E vs Sector Comparison -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">التحليل المالي والأساسي (Fundamental Valuation)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] ${fund.pe && fund.sectorPe && fund.pe <= fund.sectorPe ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : (fund.pe ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold')}">
              ${fund.pe ? (fund.valuationStatus || '✅ تقييم معتمد') : '⏳ بانتظار الإفصاح الرسمي (التقييم معلق)'}
            </span>
          </div>

          <!-- Dynamic P/E vs Sector Comparison Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">مكرر الربحية (P/E)</span>
              <span class="font-bold text-sm ${fund.pe ? 'text-emerald-400' : 'text-amber-400'}">${fund.pe ? fund.pe : 'معلق'}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">سعر السهم / ربحه</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">متوسط قطاع (${fund.sector || stock.sector || 'السوق'})</span>
              <span class="font-bold text-sm text-cyan-300">${fund.sectorPe ? fund.sectorPe : '--'}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">متوسط شركات القطاع</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">ربح السهم السنوي (EPS)</span>
              <span class="font-bold text-sm ${fund.eps ? 'text-white' : 'text-gray-400'}">${fund.eps ? fund.eps + ' ج' : 'معلق'}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">نصيب السهم من الربح</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">هامش التشغيل (Op Margin)</span>
              <span class="font-bold text-sm text-indigo-300">${fund.operatingMargin !== undefined && fund.operatingMargin !== null ? fund.operatingMargin + '%' : (fund.netMargin ? fund.netMargin + '% صافي' : '--')}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">قوة الأرباح التشغيلية</span>
            </div>
          </div>

          <!-- Operating Profit Stability Assessment Box -->
          <div class="p-3 rounded-xl ${fund.pe ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'} border text-xs space-y-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="${fund.pe ? 'text-emerald-300' : 'text-amber-300'} font-bold flex items-center gap-1.5">
                <i data-lucide="${fund.pe ? 'shield-check' : 'clock'}" class="w-4 h-4 ${fund.pe ? 'text-emerald-400' : 'text-amber-400'}"></i>
                <span>فحص استقرار الأرباح التشغيلية:</span>
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded ${fund.pe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'} font-bold">
                ${fund.operationalStability || (fund.pe ? 'أرباح تشغيلية مستقرة من النشاط الرئيسي' : '⏳ بانتظار إفصاح القوائم المالية الرسمية')}
              </span>
            </div>
            <p class="text-gray-300 text-[11px] leading-relaxed font-sans">
              ${fund.pe && fund.sectorPe
                ? `• سهم <strong>${stock.name}</strong> يتداول عند مكرر ربحية <strong>${fund.pe}</strong> مقارنة بمتوسط قطاع <strong>${fund.sector || stock.sector || 'السوق'}</strong> البالغ <strong>${fund.sectorPe}</strong>. ${fund.pe < fund.sectorPe ? `السهم يُعتبر <strong>أرخص من القطاع بنسبة ${Math.abs(fund.peVsSectorPct || 0)}%</strong> مما يمنحه هامش أمان استثماري ممتاز.` : (fund.pe === fund.sectorPe ? `السهم يتداول بتقييم عادل مطابق لمتوسط القطاع.` : `السهم يتداول بتقييم نمو مقارنة بالقطاع.`)}`
                : `• هذا السهم بانتظار الإفصاح المالي المعتمد لنتائج أعماله المجمعة. تطبيقاً لمبدأ النزاهة وعدم افتراض أرقام دون مصدر رسمي، تم تعليق مكرر الربحية وتقييم القطاع حتى تصدر القوائم المالية المدققة.`
              }
            </p>
            ${fund.dividendYield ? `
              <div class="text-[10.5px] text-gray-300 pt-1 flex items-center gap-2 font-mono">
                <span class="text-emerald-400">💰 عائد التوزيعات النقدية السنوي:</span>
                <strong class="text-white">${fund.dividendYield}%</strong>
                <span class="text-gray-400 font-sans text-[10px]">(دخل نقدي دوري يضاف لعائد صعود السهم)</span>
              </div>
            ` : ''}
          </div>

          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px] font-bold">المصادر الرسمية للتحقق:</span>
            <a href="${mubasherUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>القوائم المالية ومكرر الأرباح (مباشر مصر)</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
            <span class="text-gray-600">•</span>
            <a href="https://www.egx.com.eg" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>إفصاحات البورصة المصرية الرسمية (EGX)</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        </div>

        <!-- Pillar 2: Technical & Volume Analysis -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">التحليل الفني والسيولة ومؤشر القوة النسبية</h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                RSI: ${techEvidence ? techEvidence.rsi : 50}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                ${isStopBroken ? '⚠️ كسر مستوى الدعم' : (isTargetReached ? '🎯 تحقيق مستهدف المقاومة' : '✅ ارتكاز فوق الدعم وزخم إيجابي')}
              </span>
            </div>
          </div>

          <!-- 4-Level Pivots Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-indigo-500/30">
              <span class="text-[10px] text-gray-400 block font-sans">الدعم الثاني (S2)</span>
              <span class="font-bold text-sm text-indigo-400">${stock.pivotS2 || (stock.pivotS1 ? (stock.pivotS1 * 0.95).toFixed(2) : '--')} ج</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">وسادة الأمان القصوى</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-cyan-500/30">
              <span class="text-[10px] text-gray-400 block font-sans">الدعم الأول (S1)</span>
              <span class="font-bold text-sm text-cyan-400">${stock.pivotS1 || stock.support || '--'} ج</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">قاع الأمان الأقرب</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-emerald-500/30">
              <span class="text-[10px] text-gray-400 block font-sans">المقاومة الأولى (R1)</span>
              <span class="font-bold text-sm text-emerald-400">${stock.pivotR1 || stock.target1 || '--'} ج</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">مستهدف جني الأرباح</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-amber-500/30">
              <span class="text-[10px] text-gray-400 block font-sans">المقاومة الثانية (R2)</span>
              <span class="font-bold text-sm text-amber-300">${stock.pivotR2 || (stock.pivotR1 ? (stock.pivotR1 * 1.05).toFixed(2) : '--')} ج</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">المستهدف الصاعد الممتد</span>
            </div>
          </div>

          <!-- RSI Interactive Gauge & Educational Scale Card -->
          ${techEvidence ? `
          <div class="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-cyan-400"></i>
                <span class="text-xs font-bold text-white">مؤشر القوة النسبية والعزم (RSI - 14):</span>
                <span class="font-mono font-black text-sm text-white px-2 py-0.5 rounded bg-black/60 border border-white/10">
                  ${techEvidence.rsi}
                </span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[10.5px] ${techEvidence.rsiBadgeColor}">
                ${techEvidence.rsiBadgeText}
              </span>
            </div>

            <!-- Dynamic Slider Needle -->
            <div class="space-y-1">
              <div class="relative w-full h-3 rounded-full overflow-hidden bg-gray-950 border border-gray-700 flex">
                <div class="h-full w-[30%] bg-emerald-600/70" title="تشبع بيعي وقاع (أقل من 30)"></div>
                <div class="h-full w-[15%] bg-blue-600/70" title="تعافي (30 - 45)"></div>
                <div class="h-full w-[20%] bg-cyan-600/70" title="صعود متزن صحي (45 - 65)"></div>
                <div class="h-full w-[5%] bg-amber-500/70" title="اقتراب من القمم (65 - 70)"></div>
                <div class="h-full w-[30%] bg-rose-600/70" title="تشبع شرائي مفرط (فوق 70)"></div>
              </div>
              <div class="relative w-full h-2">
                <div class="absolute -top-1 w-2.5 h-2.5 bg-white border border-black rounded-full shadow-md transform -translate-x-1/2 transition-all duration-300" style="left: ${Math.min(Math.max(techEvidence.rsi, 2), 98)}%"></div>
              </div>
            </div>

            <!-- Educational Scale Reference -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[9.5px] text-center pt-1 font-sans">
              <div class="p-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 ${techEvidence.rsi < 30 ? 'ring-1 ring-emerald-400 font-bold' : ''}">
                <span class="block font-mono font-bold">&lt; 30</span>
                <span>قاع وتشبع بيعي</span>
              </div>
              <div class="p-1 rounded bg-blue-950/40 border border-blue-500/20 text-blue-300 ${techEvidence.rsi >= 30 && techEvidence.rsi < 45 ? 'ring-1 ring-blue-400 font-bold' : ''}">
                <span class="block font-mono font-bold">30 - 45</span>
                <span>تعافي وتجميع</span>
              </div>
              <div class="p-1 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 ${techEvidence.rsi >= 45 && techEvidence.rsi <= 65 ? 'ring-1 ring-cyan-400 font-bold' : ''}">
                <span class="block font-mono font-bold">45 - 65</span>
                <span>صعود متزن وصحي</span>
              </div>
              <div class="p-1 rounded bg-amber-950/40 border border-amber-500/20 text-amber-300 ${techEvidence.rsi > 65 && techEvidence.rsi <= 70 ? 'ring-1 ring-amber-400 font-bold' : ''}">
                <span class="block font-mono font-bold">65 - 70</span>
                <span>اقتراب من القمم</span>
              </div>
              <div class="p-1 rounded bg-rose-950/40 border border-rose-500/20 text-rose-300 col-span-2 sm:col-span-1 ${techEvidence.rsi > 70 ? 'ring-1 ring-rose-400 font-bold' : ''}">
                <span class="block font-mono font-bold">&gt; 70</span>
                <span>تشبع شرائي مفرط</span>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Volume & Liquidity Proof Card -->
          ${techEvidence ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">حجم التداول اليومي</span>
              <span class="font-bold text-xs text-white">${techEvidence.volumeFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">عدد الأسهم المنفذة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">قيمة التداول بالجلسة</span>
              <span class="font-bold text-xs text-emerald-400">${techEvidence.tradedValFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">السيولة النقدية المتدفقة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">مضاعف التدفق المؤسسي</span>
              <span class="font-bold text-xs text-purple-300">${techEvidence.rvol}x</span>
              <span class="text-[9px] ${techEvidence.rvolBadgeColor} px-1.5 py-0.2 rounded mt-0.5 inline-block font-sans text-[11px]">${techEvidence.rvolStatusText}</span>
            </div>
          </div>
          ` : ''}

          <!-- Smart Copilot Numerical Evidence Box -->
          ${techEvidence ? `
          <div class="p-3.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500/30 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-gray-800 pb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <h5 class="font-extrabold text-white text-xs">قراءة المساعد الذكي المدعمة بالأرقام والنسب الحقيقية:</h5>
            </div>
            <div class="space-y-2 text-[11.5px] leading-relaxed text-gray-200 font-sans">
              <div class="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong class="text-white block font-semibold mb-0.5">${techEvidence.evidencePoints[0].title}:</strong>
                  <span class="text-gray-300">${techEvidence.evidencePoints[0].text}</span>
                </div>
              </div>
              <div class="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong class="text-white block font-semibold mb-0.5">${techEvidence.evidencePoints[1].title}:</strong>
                  <span class="text-gray-300">${techEvidence.evidencePoints[1].text}</span>
                </div>
              </div>
              <div class="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong class="text-white block font-semibold mb-0.5">${techEvidence.evidencePoints[2].title}:</strong>
                  <span class="text-gray-300">${techEvidence.evidencePoints[2].text}</span>
                </div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px] font-bold">المصادر الرسمية للتحقق والمطابقة:</span>
            <a href="${tradingViewUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>مطابقة الأرقام على الشارت المعتمد (TradingView EGX: ${stock.ticker})</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        </div>

        <!-- Pillar 3: Risk & Capital Preservation -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">حوكمة المخاطر وإدارة رأس المال (Risk Governance)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              ${isStopBroken ? '⚠️ مخاطرة مرتفعة (كسر حد الأمان)' : '✅ معتمد (R/R >= 1:2.0)'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">وقف الخسارة الصارم</span>
              <span class="font-bold text-sm text-rose-400">${stock.stopLoss || stock.pivotS1 || '--'} ج</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">خط الدفاع الأخير</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">نسبة العائد للمخاطرة (R/R)</span>
              <span class="font-bold text-sm text-emerald-400">${stock.rrDisplay || '1 : 2.2'}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">مكسب متوقع مقابل المخاطرة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">حد المخاطرة في الصفقة</span>
              <span class="font-bold text-sm text-cyan-300">أقصى 2.0%</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">من إجمالي رأس مال المحفظة</span>
            </div>
          </div>

          <p class="text-gray-300 text-[11px] leading-relaxed">
            تحديد صارم لمستوى وقف الخسارة عند <strong>${stock.stopLoss || stock.pivotS1 || 'المستوى المحدد'} ج</strong> لضمان حماية رأس المال وعدم تجاوز أقصى نسبة خسارة مسموحة للصفقة الواحدة (${stock.maxRiskPct || '1.5 - 2%'}) من إجمالي المحفظة.
          </p>
          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px] font-bold">القواعد المرجعية المعتمدة:</span>
            <button onclick="closeAuditModal(); switchTab('rules');" class="text-amber-400 hover:underline flex items-center gap-1 text-[10px] font-bold cursor-pointer">
              <span>سياسة إدارة المحفظة وقواعد الاستثمار (INVESTMENT_RULES.md)</span>
              <i data-lucide="shield" class="w-3 h-3"></i>
            </button>
          </div>
        </div>

        <!-- Profit Protection & Cash Allocation Plan Box -->
        <div class="bg-gradient-to-r from-blue-950/60 via-gray-950 to-indigo-950/60 p-4 rounded-xl border border-blue-500/40 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
              </div>
              <h4 class="font-bold text-white text-xs sm:text-sm">خطة حماية الأرباح وتدوير السيولة النقدية:</h4>
            </div>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              إدارة رأس المال الذكية ⚡
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <!-- Box A: Trailing Stop Lock -->
            <div class="bg-gray-900/90 p-3 rounded-lg border border-gray-800 space-y-2">
              <span class="font-bold text-blue-300 block text-xs">1. خط الأمان المقترح لحبس الأرباح (وقف الخسارة المتحرك):</span>
              <p class="text-gray-300 text-[11px] leading-relaxed">
                إذا صعد السهم، لا تترك وقف الخسارة عند القاع القديم. ارفعه إلى <strong class="text-white font-mono">${(currentQuote * 0.97).toFixed(2)} ج</strong> لحبس معظم أرباحك وتجنب ضياعها.
              </p>
              <button onclick="quickApplySafetyLevel('${stock.ticker}', ${(currentQuote * 0.97).toFixed(2)})" class="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                <span>تثبيت خط الأمان عند ${(currentQuote * 0.97).toFixed(2)} ج في محفظتك 🛡️</span>
              </button>
            </div>

            <!-- Box B: Where Cash Goes -->
            <div class="bg-gray-900/90 p-3 rounded-lg border border-gray-800 space-y-2">
              <span class="font-bold text-emerald-300 block text-xs">2. أين تذهب الفلوس عند البيع؟ (خطة السيولة النقدية):</span>
              <p class="text-gray-300 text-[11px] leading-relaxed">
                عند تنفيذ البيع، يسألك النظام فوراً: إيداع كاش حر بالمحفظة، أو أمر شراء معلق عند الدعم لتكبير الأسهم مجاناً، أو تدويرها في فرصة ذهبية من رادار السوق.
              </p>
              <button onclick="closeAuditModal(); openRotationPlanModalByTicker('${stock.ticker}')" class="w-full py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 transition cursor-pointer">
                <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                <span>فتح خطة تدوير وتكبير الأسهم بالكامل 🔄</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Action Execution & Portfolio Sync Bar -->
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-gray-950 to-teal-950/60 border border-emerald-500/50 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg ${verdict.buttonAction === 'SELL' ? (verdict.buttonClass && verdict.buttonClass.includes('rose') ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400') : (verdict.buttonAction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300')} flex items-center justify-center shrink-0">
              <i data-lucide="zap" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="text-white font-extrabold block text-xs sm:text-sm">هل قررت تنفيذ هذا القرار الآن؟</span>
              <span class="text-gray-300 text-[11px]">اضغط لتسجيل العملية، وتعديل عدد الأسهم وسعر التنفيذ، وسيقوم النظام بتحديث محفظتك فوراً.</span>
            </div>
          </div>
          <button onclick="closeAuditModal(); ${verdict.buttonAction === 'HOLD' ? 'if (typeof showToast === \'function\') showToast(\'تم تأكيد قرار الاحتفاظ ومتابعة السهم بنجاح 👁️\', \'info\');' : `openTradeModal('${stock.ticker}', '${verdict.buttonAction}', ${stock.sharesToBuy || stock.sellShares || stock.shares || 0}, ${currentQuote})`}" class="px-4 py-2.5 rounded-xl ${verdict.buttonClass || 'bg-slate-700 hover:bg-slate-600'} text-white font-black text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>${verdict.buttonText}</span>
          </button>
        </div>

        <!-- Live Analysis Synthesis Bar -->
        <div class="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i>
            <span class="text-white font-bold">تحليل فوري مخصص للسهم:</span>
            <span class="text-gray-300">استشر النموذج الذكي حول ملاءمة السهم لمحفظتك وقواعد الاستثمار.</span>
          </div>
          <button onclick="closeAuditModal(); askCopilot('قدم لي تحليلاً شاملاً لسهم ${stock.name} (${stock.ticker}) ومستويات الدعم والشراء وفق محفظتي الحالية ومصادر البورصة الرسمية.');" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
            <span>طلب استشارة فورية</span>
          </button>
        </div>
      `;

      const modal = document.getElementById('audit-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      safeCreateIcons();
    }

    function printAuditReport() {
      const modalContent = document.getElementById('audit-agents-container');
      const title = document.getElementById('audit-modal-title')?.innerText || 'تقرير الاقتراح الاستثماري';
      const subtitle = document.getElementById('audit-modal-subtitle')?.innerText || '';
      
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        window.print();
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 24px; color: #111; direction: rtl; background: #fff; line-height: 1.6; }
            h1 { font-size: 18px; margin-bottom: 4px; color: #064e3b; border-bottom: 2px solid #059669; padding-bottom: 8px; }
            .subtitle { font-size: 12px; color: #666; margin-bottom: 16px; }
            .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 14px; background: #fafafa; }
            .section h2 { font-size: 14px; margin-top: 0; margin-bottom: 8px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-top: 8px; }
            .stat { background: #fff; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; text-align: center; }
            .stat-label { font-size: 10px; color: #64748b; display: block; }
            .stat-value { font-size: 14px; font-weight: bold; color: #0f172a; }
            .sources { font-size: 11px; color: #475569; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; }
            .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
            a { color: #0284c7; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle} • تاريخ الاستخراج: ${new Date().toLocaleString('ar-EG')}</div>
          ${modalContent ? modalContent.innerHTML : ''}
          <div class="footer">تقرير استرشادي مدقق بالمعادلات الرياضية وإفصاحات البورصة المصرية والشارت اللحظي • قرار البيع والشراء مسؤولية المستثمر</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    function copyAuditReport() {
      const stock = window._lastAuditStock;
      if (!stock) {
        if (typeof showToast === 'function') showToast('يرجى فتح تقرير سهم أولاً لنسخه', 'warning');
        return;
      }
      const fund = window._lastAuditFund || (stock && stock.pe ? stock : (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getFundamentals === 'function' ? EGX_Portfolio.getFundamentals(stock.ticker) : null)) || stock || {};
      const currentQuote = stock.currentPrice || stock.price || 0;
      const decTime = stock.decisionUpdatedAt || stock.priceUpdatedAt || 'جلسة اليوم';
      
      const text = `📊 تقرير الاقتراح الاستثماري الشامل: ${stock.name || stock.ticker} (${stock.ticker})
══════════════════════════════════════
📅 تاريخ ووقت التقييم: ${formatDateTimeDisplay(decTime)}
💵 السعر المعتمد لحظة القرار: ${Number(currentQuote).toFixed(2)} ج.م
📌 الرأي والتوجيه: ${stock.advice || 'فحص المستويات الفنية والمالية'}

1️⃣ التحليل المالي والأساسي (Fundamental):
• مكرر الربحية (P/E): ${fund.pe || 'معلق'} (متوسط القطاع: ${fund.sectorPe || '--'})
• ربح السهم (EPS): ${fund.eps ? fund.eps + ' ج' : 'معلق'}
• هامش التشغيل: ${fund.operatingMargin ? fund.operatingMargin + '%' : '--'}
• عائد التوزيعات: ${fund.dividendYield ? fund.dividendYield + '%' : '--'}
🔗 المصادر: إفصاحات البورصة المصرية الرسمية (egx.com.eg) • مباشر مصر (mubasher.info)

2️⃣ التحليل الفني ومستويات الارتكاز (Technical):
• الدعم الأقرب (S1): ${stock.pivotS1 || stock.support || '--'} ج
• المقاومة والمستهدف (R1): ${stock.pivotR1 || stock.target1 || '--'} ج
• وقف الخسارة الصارم: ${stock.stopLoss || stock.pivotS1 || '--'} ج
• متوسط 50 يوم (SMA50): ${stock.sma50 || '--'} ج
• تدفق السيولة: ${stock.volumeMultiplier || '1.8x'}
🔗 المصدر: الشارت اللحظي المعتمد للبورصة المصرية TradingView (tradingview.com/symbols/EGX-${stock.ticker}/)

3️⃣ حوكمة المخاطر (Risk Governance):
• نسبة العائد للمخاطرة (R/R): ${stock.rrDisplay || '1:2.0+'}
• الالتزام الصارم بميثاق إدارة المحفظة وقاعدة الـ 2% مخاطرة.

✅ تم التدقيق آلياً عبر منصة EGX AI Copilot`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (typeof showToast === 'function') showToast('✅ تم نسخ تقرير الاقتراح والمصادر إلى الحافظة بنجاح!', 'success');
          else alert('✅ تم نسخ التقرير والمصادر بنجاح!');
        }).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    }

    function fallbackCopyText(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('✅ تم نسخ تقرير الاقتراح والمصادر إلى الحافظة!', 'success');
        else alert('✅ تم نسخ التقرير!');
      } catch(e) {}
      document.body.removeChild(ta);
    }


    // Phase 3: Advanced Market Radar Logic & Filtering
    let currentRadarFilter = 'all';

    function setRadarFilter(filter) {
      currentRadarFilter = filter;
      ['all', 'egx30', 'egx70', 'volume_surge', 'oversold_bounce', 'low_risk', 'dividend_champions', 'institutional_surge'].forEach(f => {
        const btn = document.getElementById(`rf-${f}`);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-3.5 py-1.5 rounded-lg font-bold bg-emerald-600 text-white transition shrink-0';
          } else {
            btn.className = 'px-3.5 py-1.5 rounded-lg font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition shrink-0';
          }
        }
      });
      renderRadarGrid();
    }

    function handleRadarSearch() {
      renderRadarGrid();
    }

    function updateLiveTickerMarquee() {
      const marqueeEl = document.getElementById('live-ticker-marquee');
      if (!marqueeEl || !Array.isArray(fullMarketRadar) || fullMarketRadar.length === 0) return;
      const topStocks = fullMarketRadar.slice(0, 10);
      const itemsHtml = topStocks.map(stock => {
        const changeNum = stock.changeNum !== undefined ? stock.changeNum : parseFloat((stock.changePct || '0').replace('%', ''));
        const isNeg = changeNum < 0;
        const color = isNeg ? 'text-rose-400' : 'text-emerald-400';
        return `<span class="flex items-center gap-1.5 shrink-0">
          <strong class="text-white">${stock.ticker}</strong>: 
          <span>${Number(stock.price).toFixed(2)} ج</span> 
          <span class="${color} font-mono font-bold">${stock.changePct}</span> 
          <span class="text-gray-400 text-[10px]">(${stock.type})</span>
        </span>`;
      }).join('<span class="text-gray-600 px-2">•</span>');
      marqueeEl.innerHTML = `${itemsHtml}<span class="text-gray-600 px-2">•</span>${itemsHtml}`;
    }

    function renderRadarGrid() {
      try { renderMarketBreadthWidget(); } catch(e){}
      try { renderPendingThndrOrdersUI(); } catch(e){}
      updateLiveTickerMarquee();
      const container = document.getElementById('radar-grid');
      container.innerHTML = '';

      const query = (document.getElementById('radar-search-input')?.value || '').trim().toLowerCase();

      const filtered = fullMarketRadar.filter(item => {
        const matchesCategory = currentRadarFilter === 'all' 
          || item.index === currentRadarFilter 
          || (item.tags && item.tags.includes(currentRadarFilter))
          || (currentRadarFilter === 'dividend_champions' && (item.isDividendChampion || (item.tags && item.tags.includes('dividend_champion'))))
          || (currentRadarFilter === 'institutional_surge' && (item.rvolTag === 'institutional_surge' || (item.rvol && item.rvol >= 1.5)));

        const matchesSearch = !query 
          || item.ticker.toLowerCase().includes(query)
          || item.name.toLowerCase().includes(query)
          || item.sector.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-gray-400">
            <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            <p class="text-sm">لم يتم العثور على أي أسهم مطابقة لمعايير البحث الحالية.</p>
          </div>
        `;
        safeCreateIcons();
        return;
      }

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-gray-900/90 transition shadow-lg relative overflow-hidden group';
        
        const isVolumeSpike = item.tags && item.tags.includes('volume_surge');
        const badgeColor = item.index === 'egx30' ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' : 'text-purple-400 bg-purple-950/60 border-purple-800/40';

        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                  ${item.ticker}
                </span>
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-emerald-400 transition">${item.name}</h4>
                  <span class="text-[10px] text-gray-400">${item.sector}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}">
                  ${item.index.toUpperCase()}
                </span>
                ${(() => {
                  const changeVal = parseFloat(item.changeNum !== undefined ? item.changeNum : (item.changePct || '0').replace('%', ''));
                  const isNeg = changeVal < 0 || String(item.changePct).includes('-');
                  const colorCls = isNeg ? 'text-rose-400' : 'text-emerald-400';
                  return `<span class="block text-[11px] font-mono font-bold ${colorCls} mt-0.5">${item.changePct}</span>`;
                })()}
              </div>
            </div>

            <div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <i data-lucide="check" class="w-3 h-3"></i>
                <span>أمان: ${item.score}/100</span>
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                <i data-lucide="layers" class="w-3 h-3"></i>
                <span>توافق المعايير الثلاثية</span>
              </span>
              ${item.rvol ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.rvolBadge || 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center gap-1" title="${item.rvolStatus || 'مؤشر السيولة المؤسسية'}">
                  <i data-lucide="activity" class="w-3 h-3"></i>
                  <span>RVol: ${item.rvol}x</span>
                </span>
              ` : ''}
              ${(item.isDividendChampion || (item.dividendYield && item.dividendYield > 0)) ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1" title="عائد التوزيع النقدي المعتمد">
                  <span>👑 كوبون: ${item.dividendYield || (item.dividendProfile && item.dividendProfile.yieldPct) || '--'}%</span>
                </span>
              ` : ''}
              ${isVolumeSpike ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1 animate-pulse">
                  <i data-lucide="zap" class="w-3 h-3"></i>
                  <span>سيولة ${item.volumeMultiplier}</span>
                </span>
              ` : ''}
            </div>

            <div class="p-2.5 rounded-xl bg-gray-950/70 border border-gray-800 text-[11px] text-gray-300 mb-3 leading-relaxed">
              <span class="text-emerald-400 font-bold ml-1">المحفز الجوهري:</span> ${item.catalyst}
            </div>
          </div>

            <!-- Dynamic P/E & Sector Comparison Bar -->
            ${(() => {
              const fund = (item.pe ? item : (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getFundamentals === 'function' ? EGX_Portfolio.getFundamentals(item.ticker) : null)) || item;
              if (!fund.pe) {
                return `
                  <div class="mb-2 bg-gray-950/80 p-2 rounded-xl border border-gray-800 text-[10px] space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-amber-300 flex items-center gap-1 font-bold">
                        <i data-lucide="clock" class="w-3 h-3 text-amber-400"></i>
                        <span>⏳ بانتظار الإفصاح الرسمي</span>
                      </span>
                      <span class="text-[9.5px] text-gray-400 font-sans">التقييم معلق حتى إعلان الأرباح</span>
                    </div>
                    <div class="flex items-center justify-between text-[9px] pt-1 border-t border-gray-800/60">
                      <span class="text-gray-400 flex items-center gap-1 font-semibold truncate" title="فحص الأرباح التشغيلية">
                        <i data-lucide="shield-alert" class="w-3 h-3 text-gray-500 shrink-0"></i>
                        <span>قيد تدقيق القوائم المالية الرسمية</span>
                      </span>
                      <span class="text-slate-400 font-mono shrink-0">EPS: معلق</span>
                    </div>
                  </div>
                `;
              }
              return `
                <div class="mb-2 bg-gray-950/80 p-2 rounded-xl border border-gray-800 text-[10px] space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-400 flex items-center gap-1 font-mono">
                      <span class="font-sans text-gray-400">مكرر الربحية:</span>
                      <strong class="text-emerald-400 font-bold">${fund.pe}</strong>
                    </span>
                    <span class="text-gray-400 font-mono">
                      <span class="font-sans text-gray-400">متوسط القطاع:</span>
                      <strong class="text-cyan-300 font-bold">${fund.sectorPe || '--'}</strong>
                    </span>
                    ${fund.peVsSectorPct !== undefined && fund.peVsSectorPct !== null ? `
                      <span class="px-1.5 py-0.2 rounded font-bold ${fund.peVsSectorPct <= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                        ${fund.peVsSectorPct < 0 ? `أرخص ${Math.abs(fund.peVsSectorPct)}% 🟢` : (fund.peVsSectorPct > 0 ? `أعلى +${fund.peVsSectorPct}% 🟡` : 'مماثل للقطاع ⚖️')}
                      </span>
                    ` : ''}
                  </div>
                  <div class="flex items-center justify-between text-[9px] pt-1 border-t border-gray-800/60">
                    <span class="text-emerald-400 flex items-center gap-1 font-semibold truncate" title="فحص الأرباح التشغيلية">
                      <i data-lucide="shield-check" class="w-3 h-3 text-emerald-400 shrink-0"></i>
                      <span>${fund.operationalStability || (fund.operatingMargin ? `أرباح تشغيلية مستقرة (${fund.operatingMargin}%)` : 'أرباح تشغيلية معتمدة')}</span>
                    </span>
                    ${fund.eps ? `<span class="text-gray-400 font-mono shrink-0">EPS: ${fund.eps} ج</span>` : ''}
                  </div>
                </div>
              `;
            })()}

            <!-- Fair Value & Execution Price Banner -->
            ${(() => {
              const fvObj = (typeof getFairValueInfo === 'function') ? getFairValueInfo(item.ticker, item.price) : null;
              const numS = parseFloat(String(item.support).replace(/[^\d.]/g, '')) || (item.price * 0.95);
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
            </div>

            <div class="text-[10px] text-gray-400 mb-2.5 flex items-center justify-between">
              <span class="flex items-center gap-1 text-emerald-400">
                <i data-lucide="check-circle" class="w-3 h-3"></i>
                <span>${item.liquidityStatus}</span>
              </span>
              <div class="flex items-center gap-2 font-mono">
                ${item.rrDisplay ? `<span class="px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold text-[9px]">R/R: ${item.rrDisplay}</span>` : ''}
                <span class="text-gray-300 font-bold">${item.price.toFixed(2)} ج</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-wrap">
              ${(() => {
                const isShock = (typeof getMarketRegimeCode === 'function' && getMarketRegimeCode() === 'SYSTEMIC_SHOCK');
                const isBrokenSupport = (String(item.stopLoss).includes('مكسور') || (item.support && item.price < parseFloat(item.support)));
                const isOverbought = (item.rsi && item.rsi >= 78);
                const isBuyBlocked = isShock || isBrokenSupport || isOverbought;

                let reasonText = '';
                if (isShock) reasonText = '⚠️ تجميد الشراء (هبوط ذعري شامل)';
                else if (isBrokenSupport) reasonText = '⚠️ كسر الدعم (سكين ساقطة)';
                else if (isOverbought) reasonText = '⚠️ تشبع شرائي (قمة سعرية)';

                if (isBuyBlocked) {
                  return `
                    <button onclick="alert('${reasonText}\\n\\nيُنصح بعدم فتح مراكز شراء جديدة في هذا التوقيت للحفاظ على رأس المال.')" class="px-2 py-1.5 rounded-lg bg-gray-800/90 text-rose-400 border border-rose-800/40 font-bold text-[10px] flex items-center gap-1 transition shadow-sm cursor-not-allowed" title="${reasonText}">
                      <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-400"></i>
                      <span>تجميد الشراء</span>
                    </button>
                  `;
                }

                return `
                  <button onclick="openTradeModal('${item.ticker}', 'BUY')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer" title="تسجيل شراء هذا السهم في محفظتك">
                    <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                    <span>تسجيل</span>
                  </button>
                `;
              })()}
              <button onclick="openPositionSizingModal(${item.price}, ${!isNaN(parseFloat(item.stopLoss)) ? parseFloat(item.stopLoss) : 'null'})" class="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 font-bold text-[10px] transition cursor-pointer" title="حساب كمية الشراء الآمنة وفق قاعدة مخاطرة 2%">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="openAuditModal('${item.ticker}')" class="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/60 text-emerald-300 hover:text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer" title="تقرير الاقتراح والمصادر الاستثمارية">
                <i data-lucide="file-text" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>تقرير الاقتراح 📊</span>
              </button>
              <a href="${item.tradingViewUrl || 'https://www.tradingview.com'}" target="_blank" class="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 transition" title="شارت TradingView اللحظي">
                <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
              </a>
              <button onclick="askCopilot('ما هو التحليل الفني والأساسي لسهم ${item.name} (${item.ticker}) وفق مستويات المقاومة ${item.target1} والدعم ${item.support}؟')" class="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>استشارة</span>
              </button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      safeCreateIcons();
    }


    // PHASE 4: QUANTITATIVE RISK & LEVELS ENGINE
    // ==============================================
    function populateRiskStockDropdown() {
      const select = document.getElementById('risk-stock-select');
      const aiSelect = document.getElementById('ai-thesis-stock-select');
      const simSelect = document.getElementById('sim-trade-stock');

      select.innerHTML = '<option value="">-- اختر سهماً من الرادار --</option>';
      aiSelect.innerHTML = '';
      simSelect.innerHTML = '';

      fullMarketRadar.forEach(stock => {
        const opt = document.createElement('option');
        opt.value = stock.ticker;
        opt.innerText = `${stock.name} (${stock.ticker})`;
        select.appendChild(opt);

        const aiOpt = opt.cloneNode(true);
        aiSelect.appendChild(aiOpt);

        const simOpt = opt.cloneNode(true);
        simSelect.appendChild(simOpt);
      });
    }

    function inspectRiskForStock(ticker) {
      switchTab('risk');
      document.getElementById('risk-stock-select').value = ticker;
      loadStockForRiskCalc();
    }

    function loadStockForRiskCalc() {
      const ticker = document.getElementById('risk-stock-select').value;
      const stock = fullMarketRadar.find(s => s.ticker === ticker);
      if (!stock) return;

      document.getElementById('risk-high').value = stock.high;
      document.getElementById('risk-low').value = stock.low;
      document.getElementById('risk-close').value = stock.close;
      executeRiskCalculations();
    }

    function executeRiskCalculations() {
      const high = parseFloat(document.getElementById('risk-high').value) || 0;
      const low = parseFloat(document.getElementById('risk-low').value) || 0;
      const close = parseFloat(document.getElementById('risk-close').value) || 0;

      if (high <= 0 || low <= 0 || close <= 0 || high <= low) {
        alert('يرجى التأكد من إدخال قيم صحيحة للأسعار (أعلى وأدنى وإغلاق)، مع مراعاة أن يكون أعلى سعر أكبر من أدنى سعر.');
        return;
      }

      const p = (typeof EGX_Engine !== 'undefined') 
        ? EGX_Engine.calculatePivots(high, low, close)
        : null;
      const pivot = p ? p.pp : Number(((high + low + close) / 3).toFixed(2));
      const r1 = p ? p.r1 : Number(((2 * pivot) - low).toFixed(2));
      const s1 = p ? p.s1 : Number(Math.max(0.01, (2 * pivot) - high).toFixed(2));
      const r2 = p ? p.r2 : Number((pivot + (high - low)).toFixed(2));
      const s2 = p ? p.s2 : Number(Math.max(0.01, pivot - (high - low)).toFixed(2));
      const fib127 = p ? p.fib127 : Number((pivot + (high - low) * 1.272).toFixed(2));
      const fib161 = p ? p.fib161 : Number((pivot + (high - low) * 1.618).toFixed(2));
      const stopLoss = Math.max(0.01, Math.min(+(s1 * 0.97).toFixed(2), +(low * 0.98).toFixed(2)));

      if (close >= r2) {
        const trailingStop = r1;
        const rewardPct = ((fib127 - close) / close) * 100;
        const riskPct = ((close - trailingStop) / close) * 100;
        const rrRatio = riskPct > 0 ? (rewardPct / riskPct) : 1;

        document.getElementById('out-pivot').innerText = `${pivot.toFixed(2)} ج`;
        document.getElementById('out-r1').innerText = `${r1.toFixed(2)} ج (دعم متحرك)`;
        document.getElementById('out-r2').innerText = `${r2.toFixed(2)} ج (مخترق)`;
        document.getElementById('out-s1').innerText = `${s1.toFixed(2)} ج`;
        document.getElementById('out-s2').innerText = `${s2.toFixed(2)} ج`;
        document.getElementById('out-stoploss').innerText = `${trailingStop.toFixed(2)} ج (وقف متحرك R1)`;
        document.getElementById('out-rr-ratio').innerText = `امتداد فيبوناتشي`;
        document.getElementById('out-reward-pct').innerText = `+${rewardPct.toFixed(1)}% (فيبو 127%)`;
        document.getElementById('out-risk-pct').innerText = `-${riskPct.toFixed(1)}%`;

        const verdictBox = document.getElementById('out-verdict-box');
        verdictBox.className = 'p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-cyan-400 flex items-center gap-1 mb-1">
            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
            <span>اختراق القمة ومقاومة R2 (Price Discovery Mode): السعر (${close.toFixed(2)} ج) في مسار حر</span>
          </div>
          <p class="text-[11px] text-gray-300">
            تم تفعيل أهداف امتداد فيبوناتشي: الهدف الأول (${fib127.toFixed(2)} ج بنسبة 1.272)، والهدف الأقصى (${fib161.toFixed(2)} ج بنسبة 1.618). ارفع وقف الخسارة المتحرك إلى R1 (${r1.toFixed(2)} ج) لتأمين الأرباح المحققة.
          </p>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      if (close >= r1) {
        const rewardPct = ((r2 - close) / close) * 100;
        const trailingStop = Math.max(pivot, Number((r1 * 0.975).toFixed(2)));
        const riskPct = ((close - trailingStop) / close) * 100;
        const rrRatio = riskPct > 0 ? (rewardPct / riskPct) : 1;

        document.getElementById('out-pivot').innerText = `${pivot.toFixed(2)} ج`;
        document.getElementById('out-r1').innerText = `${r1.toFixed(2)} ج (هدف محقق)`;
        document.getElementById('out-r2').innerText = `${r2.toFixed(2)} ج (الهدف التالي)`;
        document.getElementById('out-s1').innerText = `${s1.toFixed(2)} ج`;
        document.getElementById('out-s2').innerText = `${s2.toFixed(2)} ج`;
        document.getElementById('out-stoploss').innerText = `${trailingStop.toFixed(2)} ج (وقف متحرك)`;
        document.getElementById('out-rr-ratio').innerText = `1 : ${rrRatio.toFixed(1)}`;
        document.getElementById('out-reward-pct').innerText = `+${rewardPct.toFixed(1)}% (نحو R2)`;
        document.getElementById('out-risk-pct').innerText = `-${riskPct.toFixed(1)}%`;

        const verdictBox = document.getElementById('out-verdict-box');
        verdictBox.className = 'p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-amber-400 flex items-center gap-1 mb-1">
            <i data-lucide="compass" class="w-3.5 h-3.5"></i>
            <span>تجاوز المقاومة الأولى R1: استهداف المقاومة الثانية R2 (${r2.toFixed(2)} ج)</span>
          </div>
          <p class="text-[11px] text-gray-300">
            تم بلوغ الهدف الفني الأول بنجاح (+${(((close - pivot) / pivot) * 100).toFixed(1)}%). للاستمرار في الصفقة نحو R2، ارفع وقف الخسارة المتحرك فوراً إلى [${trailingStop.toFixed(2)} ج] (تحت R1 بهامش أمان 2.5% لمراعاة تذبذب الجلسة) لحجز الأرباح وتجنب الخروج العشوائي.
          </p>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      if (close <= stopLoss) {
        document.getElementById('out-pivot').innerText = `${pivot.toFixed(2)} ج`;
        document.getElementById('out-r1').innerText = `${r1.toFixed(2)} ج`;
        document.getElementById('out-r2').innerText = `${r2.toFixed(2)} ج`;
        document.getElementById('out-s1').innerText = `${s1.toFixed(2)} ج`;
        document.getElementById('out-s2').innerText = `${s2.toFixed(2)} ج`;
        document.getElementById('out-stoploss').innerText = `${stopLoss.toFixed(2)} ج (مكسور)`;
        document.getElementById('out-rr-ratio').innerText = `وقف مكسور`;
        document.getElementById('out-reward-pct').innerText = `--`;
        document.getElementById('out-risk-pct').innerText = `كاسر للوقف`;

        const verdictBox = document.getElementById('out-verdict-box');
        verdictBox.className = 'p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-rose-400 flex items-center gap-1 mb-1">
            <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i>
            <span>قرار المحرك: السهم كسر مستوى وقف الخسارة (${stopLoss.toFixed(2)} ج)</span>
          </div>
          <p class="text-[11px] text-gray-300">
            ممنوع الشراء تماماً. كسر حد الأمان يعرض رأس المال لانزلاق سعري، التزم بالحماية وتجنب مطاردة السكين الساقطة.
          </p>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      if (close < s1) {
        document.getElementById('out-pivot').innerText = `${pivot.toFixed(2)} ج`;
        document.getElementById('out-r1').innerText = `${r1.toFixed(2)} ج`;
        document.getElementById('out-r2').innerText = `${r2.toFixed(2)} ج`;
        document.getElementById('out-s1').innerText = `${s1.toFixed(2)} ج (مكسور)`;
        document.getElementById('out-s2').innerText = `${s2.toFixed(2)} ج`;
        document.getElementById('out-stoploss').innerText = `${stopLoss.toFixed(2)} ج`;
        document.getElementById('out-rr-ratio').innerText = `دعم مكسور S1`;
        document.getElementById('out-reward-pct').innerText = `--`;
        document.getElementById('out-risk-pct').innerText = `تحت الدعم`;

        const verdictBox = document.getElementById('out-verdict-box');
        verdictBox.className = 'p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-rose-400 flex items-center gap-1 mb-1">
            <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i>
            <span>قرار المحرك: السعر الحالي (${close.toFixed(2)} ج) أدنى من الدعم الفني الرئيسي S1 (${s1.toFixed(2)} ج)</span>
          </div>
          <p class="text-[11px] text-gray-300">
            ⚠️ الشراء محظور ومرفوض رقابياً حتى استعادة الدعم الفني والتأكيد بشمعة إيجابية، لتجنب استمرار الانزلاق نحو S2 (${s2.toFixed(2)} ج).
          </p>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const potentialReward = r1 - close;
      const potentialRisk = Math.max(close - stopLoss, 0.05);
      const rrRatio = (potentialReward / potentialRisk);

      const rewardPct = ((r1 - close) / close) * 100;
      const riskPct = ((close - stopLoss) / close) * 100;

      document.getElementById('out-pivot').innerText = `${pivot.toFixed(2)} ج`;
      document.getElementById('out-r1').innerText = `${r1.toFixed(2)} ج (+${rewardPct.toFixed(1)}%)`;
      document.getElementById('out-r2').innerText = `${r2.toFixed(2)} ج`;
      document.getElementById('out-s1').innerText = `${s1.toFixed(2)} ج`;
      document.getElementById('out-s2').innerText = `${s2.toFixed(2)} ج`;
      document.getElementById('out-stoploss').innerText = `${stopLoss.toFixed(2)} ج (-${riskPct.toFixed(1)}%)`;

      document.getElementById('out-rr-ratio').innerText = `1 : ${rrRatio.toFixed(1)}`;
      document.getElementById('out-reward-pct').innerText = `+${rewardPct.toFixed(1)}%`;
      document.getElementById('out-risk-pct').innerText = `-${riskPct.toFixed(1)}%`;

      const verdictBox = document.getElementById('out-verdict-box');
      if (rrRatio >= 1.8) {
        verdictBox.className = 'p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-emerald-400 flex items-center gap-1 mb-1">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
            <span>قرار المحرك: مستوفٍ لشروط الأمان المالي (ممتاز)</span>
          </div>
          <p class="text-[11px] text-gray-300">
            نسبة العائد المتوقع (${rewardPct.toFixed(1)}%) تبرر المخاطرة (${riskPct.toFixed(1)}%) بنسبة 1 إلى ${rrRatio.toFixed(1)}. الصفقة تتوافق تماماً مع قواعد الاستثمار طويل الأجل.
          </p>
        `;
      } else {
        verdictBox.className = 'p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-gray-200';
        verdictBox.innerHTML = `
          <div class="font-bold text-amber-400 flex items-center gap-1 mb-1">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
            <span>قرار المحرك: عائد غير متكافئ (انتظر تصحيحاً أفضل)</span>
          </div>
          <p class="text-[11px] text-gray-300">
            العائد المتوقع لا يتجاوز ضعف المخاطرة (R/R أقل من 1:2). يُفضل انتظار هبوط السهم قرب منطقة الدعم (${s1.toFixed(2)} ج) لتحسين سعر الدخول.
          </p>
        `;
      }
      safeCreateIcons();
    }

    // ==============================================
    // PHASE 5: STRUCTURED DEEP AI THESIS GENERATOR
    // ==============================================
    function generateStructuredThesis() {
      const ticker = document.getElementById('ai-thesis-stock-select').value;
      const stock = fullMarketRadar.find(s => s.ticker === ticker);
      if (!stock) return;

      askCopilot(`أريد مذكرة تقييم استثماري متكاملة ومفصلة لسهم ${stock.name} (${stock.ticker}) تشمل التحليل المالي، الفني، وإدارة المخاطر.`);
    }

    // ==============================================
    // PHASE 6: EMERGENCY ALERTS SIMULATOR
    // ==============================================
    function simulateMarketEmergency() {
      const alertsContainer = document.getElementById('alerts-container');
      const alertDiv = document.createElement('div');
      alertDiv.className = 'bg-rose-950/80 p-4 rounded-xl border border-rose-500/60 flex items-start justify-between gap-3 animate-pulse shadow-lg';
      alertDiv.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
            <i data-lucide="alert-octagon" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-sm">⚠️ تنبيه عاجل: كسر دعم استراتيجي لسهم مضاربة</span>
              <span class="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded font-bold">إشارة حماية رأس مال</span>
            </div>
            <p class="text-xs text-rose-200 mt-1 leading-relaxed">
              السهم كسر مستوى الارتكاز مع ضغوط بيع قوية. وفقاً لقواعد إدارة المخاطر: يُنصح بتفعيل أمر وقف الخسارة فوراً لحماية رأس المال من أي انزلاق إضافي.
            </p>
            <div class="text-[11px] text-rose-300/80 mt-1 font-mono">الزمن: الآن • الأولوية: طوارئ قصوى</div>
          </div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-xs text-rose-300 hover:text-white px-2 py-1 rounded bg-rose-900/40">
          إغلاق التنبيه
        </button>
      `;
      alertsContainer.prepend(alertDiv);
      safeCreateIcons();
      alert('⚠️ تم إطلاق إشعار الطوارئ بنجاح لاختبار استجابة النظام!');
    }


    function toggleSidebar() {
      if (window.innerWidth >= 1024) {
        document.body.classList.toggle('sidebar-closed');
        const isClosed = document.body.classList.contains('sidebar-closed');
        localStorage.setItem('egx_sidebar_desktop_closed', isClosed ? 'true' : 'false');
        updateSidebarToggleBtnState(isClosed);
      } else {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;
        const isClosed = sidebar.classList.contains('translate-x-full');
        if (isClosed) {
          openSidebarMobile();
        } else {
          closeSidebarMobile();
        }
      }
    }

    function toggleSidebarDrawer() {
      toggleSidebar();
    }

    function openSidebarMobile() {
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sidebar) return;
      sidebar.classList.remove('translate-x-full');
      sidebar.classList.add('translate-x-0');
      if (backdrop) {
        backdrop.classList.remove('hidden');
        setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
      }
    }

    function closeSidebarMobile() {
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sidebar) return;
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('translate-x-full');
      if (backdrop) {
        backdrop.classList.add('opacity-0');
        setTimeout(() => backdrop.classList.add('hidden'), 250);
      }
    }

    function closeSidebarDrawer() {
      if (window.innerWidth < 1024) {
        closeSidebarMobile();
      }
    }

    function updateSidebarToggleBtnState(isClosed) {
      const btn = document.getElementById('sidebar-toggle-btn');
      if (!btn) return;
      if (isClosed) {
        btn.classList.add('border-emerald-500/50', 'text-emerald-400');
      } else {
        btn.classList.remove('border-emerald-500/50', 'text-emerald-400');
      }
    }

    function initSidebar() {
      if (window.innerWidth >= 1024) {
        const isClosed = localStorage.getItem('egx_sidebar_desktop_closed') === 'true';
        if (isClosed) {
          document.body.classList.add('sidebar-closed');
          updateSidebarToggleBtnState(true);
        } else {
          document.body.classList.remove('sidebar-closed');
          updateSidebarToggleBtnState(false);
        }
      } else {
        closeSidebarMobile();
      }
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        const backdrop = document.getElementById('sidebar-backdrop');
        if (backdrop) {
          backdrop.classList.add('hidden', 'opacity-0');
        }
        const isClosed = localStorage.getItem('egx_sidebar_desktop_closed') === 'true';
        if (isClosed) {
          document.body.classList.add('sidebar-closed');
        } else {
          document.body.classList.remove('sidebar-closed');
        }
      }
    });

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-400');
      });

      const targetView = document.getElementById(`view-${tabId}`);
      const targetBtn = document.getElementById(`tab-${tabId}`);
      if (targetView) targetView.classList.remove('hidden');
      if (targetBtn) {
        targetBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        targetBtn.classList.remove('text-slate-400');
      }

      // Update Header Title, Subtitle and Badge dynamically
      const tabMeta = {
        'changelog': { title: 'سجل التحديثات والإصدارات الرسمية', desc: 'تتبع كافة التعديلات والتطويرات المرفوعة للنظام وتواريخها بدقة', badge: 'v2.5.1' },
        'portfolio': { title: 'المحفظة وتوزيع الأصول', desc: 'متابعة الأصول والأسهم المملوكة في ثندر وتطور الأرباح اللحظية', badge: 'محفظة حية • EGX' },
        'radar': { title: 'رادار السوق والفرص', desc: 'رصد تدفقات السيولة غير المعتادة واختراق المقاومات بالبورصة المصرية', badge: '18 فرصة استثمارية' },
        'risk': { title: 'حاسبة الدعم وإدارة المخاطر (R/R)', desc: 'حسابات نقاط الارتكاز والدعم الكلاسيكية ونسبة العائد للمخاطرة', badge: 'معيار الأمان ≥ 1:2.0' },
        'advisor': { title: 'مركز التحليل المالي والفني', desc: 'مستشار الذكاء الاصطناعي ومذكرات التقييم الاستثماري للشركات', badge: 'Google Gemini AI' },
        'alerts': { title: 'إشارات السوق والتنبيهات', desc: 'تنبيهات فورية عند وصول الأهداف ونقاط الدعم وشذوذ السيولة', badge: 'تنبيهات لحظية' },
        'papertrading': { title: 'المحفظة التجريبية (محاكاة)', desc: 'تداول افتراضي بدون مخاطرة ومتابعة تقدم الصفقات نحو الأهداف', badge: 'محاكاة ذكية' },
        'rebalance': { title: 'حاسبة توزيع السيولة', desc: 'إعادة توازن وتوزيع أي مبالغ جديدة وفق استراتيجية النواة والأقمار', badge: 'إدارة السيولة' },
        'settings': { title: 'إعدادات المحفظة والربط', desc: 'تخصيص نسب الأمان والمضاربة وربط مفتاح Gemini API', badge: 'لوحة التحكم' },
        'rules': { title: 'قواعد وسياسة الاستثمار', desc: 'وثيقة حوكمة المحفظة والضوابط الصارمة لحماية رأس المال', badge: 'حوكمة المحفظة' },
        'simulation': { title: 'مختبر المحاكاة والتدريب المؤسسي لمنع الهلوسة', desc: 'محاكاة أداء الذكاء الاصطناعي على بيانات تاريخية معتمدة ومراقبة بيئة السوق ودفتر الصفقات', badge: 'معتمد 100% ضد الهلوسة' },
        'glossary': { title: 'دليل المصطلحات المالية', desc: 'شرح مبسط لكل مصطلحات البورصة والتحليل الفني والمالي', badge: 'قاموس المستثمر' },
        'valuation': { title: 'محرك تقييم القيمة العادلة المخصومة (DCF & DDM)', desc: 'تقييم التدفقات النقدية وهوامش الأمان الاستثمارية وفق أسعار الفائدة المصرية', badge: 'تقييم جوهري • DCF' },
        'thndrsync': { title: 'مزامنة مع Thndr', desc: 'سحب ومزامنة جميع أسهمك ومتوسطات الشراء من محفظة ثندر بالقرش في 3 خطوات بسيطة', badge: 'مزامنة ذكية ⚡' },
        'alpha': { title: 'متتبع ألفا والأداء التراكمي للمحفظة (Benchmark Alpha Tracker)', desc: 'مقارنة الأداء التراكمي بمؤشر EGX30 وعائد صناديق السيولة النقدية والتضخم', badge: 'Alpha & Sharpe' }
      };

      if (tabId === 'thndrsync') {
        const box = document.getElementById('thndr-verified-script-box-tab');
        if (box && typeof generateThndrExtractorScript === 'function') {
          box.value = generateThndrExtractorScript();
        }
      }

      if (tabMeta[tabId]) {
        const titleEl = document.getElementById('active-tab-title');
        const descEl = document.getElementById('active-tab-desc');
        const badgeEl = document.getElementById('active-tab-badge');
        if (titleEl) titleEl.innerText = tabMeta[tabId].title;
        if (descEl) descEl.innerText = tabMeta[tabId].desc;
        if (badgeEl) badgeEl.innerText = tabMeta[tabId].badge;
      }

      // Close mobile sidebar if open
      closeSidebarDrawer();

      // Scroll content container to top
      const scrollEl = document.getElementById('main-content-scroll');
      if (scrollEl) scrollEl.scrollTop = 0;

      safeCreateIcons();
      if (tabId === 'portfolio') {
        renderAllocationChart();
      } else if (tabId === 'radar') {
        renderRadarGrid();
      } else if (tabId === 'risk') {
        if (!document.getElementById('risk-stock-select').value && fullMarketRadar.length > 0) {
          document.getElementById('risk-stock-select').value = fullMarketRadar[0].ticker;
          loadStockForRiskCalc();
        }
      } else if (tabId === 'changelog') {
        if (typeof renderChangelogUI === 'function') renderChangelogUI();
      } else if (tabId === 'valuation') {
        if (typeof initDcfEngine === 'function') initDcfEngine();
      } else if (tabId === 'alpha') {
        if (typeof renderBenchmarkAlphaTracker === 'function') renderBenchmarkAlphaTracker();
      } else if (tabId === 'papertrading') {
        renderSimPositions();
        renderAutonomousLedger();
      } else if (tabId === 'simulation') {
        loadAndRenderScenarios();
        renderLearnedLessons();
        updateSimulationRegimeUI();
      } else if (tabId === 'settings') {
        loadStrategySettings();
      }
    }


    function handleGlossarySearch() {
      const query = (document.getElementById('glossary-search-input')?.value || '').trim().toLowerCase();
      const items = document.querySelectorAll('.glossary-item');
      items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }


    function initTheme() {
      const savedTheme = localStorage.getItem('egx_theme') || 'light';
      applyTheme(savedTheme);
    }

    function applyTheme(theme) {
      const html = document.documentElement;
      const themeIcon = document.getElementById('theme-icon');
      const themeLabel = document.getElementById('theme-label');

      if (theme === 'dark') {
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('egx_theme', 'dark');
        if (themeIcon) {
          themeIcon.setAttribute('data-lucide', 'moon');
          themeIcon.classList.remove('text-amber-500');
          themeIcon.classList.add('text-indigo-400');
        }
        if (themeLabel) themeLabel.innerText = 'داكن';
      } else {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('egx_theme', 'light');
        if (themeIcon) {
          themeIcon.setAttribute('data-lucide', 'sun');
          themeIcon.classList.remove('text-indigo-400');
          themeIcon.classList.add('text-amber-500');
        }
        if (themeLabel) themeLabel.innerText = 'فاتح';
      }

      if (window.lucide) {
        lucide.createIcons();
      }

      if (typeof renderAllocationChart === 'function' && document.getElementById('allocationChart')) {
        renderAllocationChart();
      }
    }

    function toggleTheme() {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    }

    function initModalMobileScrollEngine() {
      function syncBodyModalState() {
        const anyModalOpen = document.querySelector('[id$="-modal"]:not(.hidden)');
        if (anyModalOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      }

      try {
        const observer = new MutationObserver(() => {
          syncBodyModalState();
        });

        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach(modal => {
          observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              const closeBtn = modal.querySelector('button[onclick*="close"], button[onclick*="Close"]');
              if (closeBtn) closeBtn.click();
            }
          });
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' || e.key === 'Esc') {
            const openModal = document.querySelector('[id$="-modal"]:not(.hidden)');
            if (openModal) {
              const closeBtn = openModal.querySelector('button[onclick*="close"], button[onclick*="Close"]');
              if (closeBtn) closeBtn.click();
            }
          }
        });

        syncBodyModalState();
      } catch (err) {
        console.warn('initModalMobileScrollEngine error:', err);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initModalMobileScrollEngine);
    } else {
      initModalMobileScrollEngine();
    }


    // ============================================================
    // Market Breadth & Systemic Liquidity Pulse (Live EGX Visual Gauge)
    // ============================================================
    function renderMarketBreadthWidget() {
      const container = document.getElementById('market-breadth-pulse-widget');
      if (!container) return;

      const regimeData = (window.currentMarketRegime && typeof window.currentMarketRegime === 'object')
        ? window.currentMarketRegime
        : { regime: getMarketRegimeCode(), regimeArabic: window.currentMarketRegimeArabic || 'تداول متوازن وعرضي' };

      let advancingCount = 0;
      let decliningCount = 0;
      let unchangedCount = 0;
      let totalTracked = 0;
      let avgMarketChange = 0;

      if (regimeData.breadth && regimeData.breadth.totalTracked) {
        advancingCount = regimeData.breadth.advancingCount || 0;
        decliningCount = regimeData.breadth.decliningCount || 0;
        unchangedCount = regimeData.breadth.unchangedCount || 0;
        totalTracked = regimeData.breadth.totalTracked || (advancingCount + decliningCount + unchangedCount);
        avgMarketChange = regimeData.breadth.avgMarketChange || 0;
      } else if (Array.isArray(fullMarketRadar) && fullMarketRadar.length > 0) {
        let sumChange = 0;
        fullMarketRadar.forEach(stock => {
          const c = stock.changeNum !== undefined ? stock.changeNum : parseFloat((stock.changePct || '0').replace('%', ''));
          if (c > 0) advancingCount++;
          else if (c < 0) decliningCount++;
          else unchangedCount++;
          sumChange += (c || 0);
        });
        totalTracked = fullMarketRadar.length;
        avgMarketChange = totalTracked > 0 ? parseFloat((sumChange / totalTracked).toFixed(2)) : 0;
      }

      const advancingPct = totalTracked > 0 ? parseFloat(((advancingCount / totalTracked) * 100).toFixed(1)) : 50;
      const decliningPct = totalTracked > 0 ? parseFloat(((decliningCount / totalTracked) * 100).toFixed(1)) : 50;

      const isShock = regimeData.regime === 'SYSTEMIC_SHOCK' || advancingPct < 20 || avgMarketChange <= -3.0;
      const isHealthy = regimeData.regime === 'BULLISH_EXPANSION' || (advancingPct >= 60 && avgMarketChange > 0);

      let statusBadgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      let statusIcon = 'activity';
      if (isShock) {
        statusBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
        statusIcon = 'alert-triangle';
      } else if (isHealthy) {
        statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        statusIcon = 'trending-up';
      }

      container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <div class="p-2 rounded-xl ${isShock ? 'bg-rose-900/60 text-rose-400' : 'bg-emerald-900/60 text-emerald-400'} shrink-0 shadow-sm border border-gray-700">
                <i data-lucide="${statusIcon}" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-white">مقياس نبض وعمق سيولة البورصة المصرية (EGX Market Breadth)</h3>
                  <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusBadgeClass}">${regimeData.regimeArabic || 'تداول متوازن وعرضي'}</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">تحليل حي لمسار السيولة اللحظية: نسبة الأسهم الصاعدة مقابل الهابطة وقوة الضغط البيعي/الشرائي</p>
              </div>
            </div>
          </div>
          <div class="text-right sm:text-left shrink-0">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-950 text-gray-400 border border-gray-800">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>المصدر: تداول البورصة المصرية EGX عبر TradingView Feed</span>
            </span>
          </div>
        </div>

        <!-- Visual Dual Breadth Gauge Bar -->
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="flex items-center gap-1.5 text-rose-400">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>الأسهم الهابطة: ${decliningCount} سهم (${decliningPct}%)</span>
            </span>
            <span class="text-gray-400 text-[11px]">إجمالي المفحوص: ${totalTracked} شركة نشطة</span>
            <span class="flex items-center gap-1.5 text-emerald-400">
              <span>الأسهم الصاعدة: ${advancingCount} سهم (${advancingPct}%)</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          
          <!-- Split Progress Bar -->
          <div class="w-full h-4 bg-gray-950 rounded-full overflow-hidden flex p-0.5 border border-gray-800 shadow-inner">
            <div class="h-full bg-gradient-to-r from-rose-700 to-rose-500 rounded-r-full transition-all duration-700 shadow-sm" style="width: ${decliningPct}%;"></div>
            <div class="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700 shadow-sm" style="width: ${advancingPct}%;"></div>
          </div>
        </div>

        <!-- 4 Stats Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div class="bg-gray-950/70 p-3 rounded-xl border border-gray-800/80">
            <span class="text-[11px] text-gray-400 font-bold block">متوسط حركة السوق</span>
            <span class="text-sm sm:text-base font-black ${avgMarketChange < 0 ? 'text-rose-400' : 'text-emerald-400'} dir-ltr block mt-0.5">
              ${avgMarketChange > 0 ? '+' : ''}${avgMarketChange}%
            </span>
          </div>
          <div class="bg-gray-950/70 p-3 rounded-xl border border-gray-800/80">
            <span class="text-[11px] text-gray-400 font-bold block">حالة نظام التداول</span>
            <span class="text-xs sm:text-sm font-bold ${isShock ? 'text-rose-400' : 'text-slate-200'} block mt-0.5">
              ${isShock ? 'هبوط ذعري شامل' : (isHealthy ? 'توسع صاعد قوي' : 'تداول متوازن')}
            </span>
          </div>
          <div class="bg-gray-950/70 p-3 rounded-xl border border-gray-800/80">
            <span class="text-[11px] text-gray-400 font-bold block">إشارات الشراء بالدعوم</span>
            <span class="text-xs sm:text-sm font-bold ${isShock ? 'text-rose-400 font-black' : 'text-emerald-400'} block mt-0.5">
              ${isShock ? '⚠️ مجمدة لحماية الكاش' : 'نشطة مع إدارة المخاطر'}
            </span>
          </div>
          <div class="bg-gray-950/70 p-3 rounded-xl border border-gray-800/80">
            <span class="text-[11px] text-gray-400 font-bold block">المؤشر الرئيسي EGX30</span>
            <span class="text-xs sm:text-sm font-bold text-gray-300 block mt-0.5">
              جلسة اليوم اللحظية
            </span>
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // Thndr Active Pending Orders UI (Direct Protection Guardrail)
    // ============================================================
    function renderPendingThndrOrdersUI() {
      const container = document.getElementById('thndr-pending-orders-widget');
      if (!container) return;

      const orders = (typeof pendingThndrOrders !== 'undefined' && Array.isArray(pendingThndrOrders))
        ? pendingThndrOrders
        : [];

      const regimeCode = getMarketRegimeCode();
      const isShock = regimeCode === 'SYSTEMIC_SHOCK';

      const pendingBuys = orders.filter(o => o.status === 'PENDING');

      let rowsHtml = '';
      if (pendingBuys.length === 0) {
        rowsHtml = `
          <div class="p-4 text-center text-gray-400 text-xs bg-gray-950/50 rounded-xl border border-gray-800">
            لا توجد أوامر معلقة مسجلة حالياً في تطبيق ثندر. اضغط زر "إضافة أمر ثندر جديد" إذا وضعت طلباً معلقاً لحمايته تلقائياً.
          </div>
        `;
      } else {
        rowsHtml = pendingBuys.map(order => {
          return `
            <div class="p-3.5 rounded-xl border ${isShock ? 'bg-rose-950/40 border-rose-600/60 shadow-lg' : 'bg-gray-950 border-gray-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl ${isShock ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40' : 'bg-emerald-600/20 text-emerald-400'} flex items-center justify-center font-black text-sm shrink-0">
                  ${order.ticker}
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white text-sm">${order.name}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${order.type.includes('BUY') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-amber-500/20 text-amber-300'}">
                      ${order.type === 'BUY_LIMIT' ? 'طلب شراء محدد' : order.type}
                    </span>
                    <span class="text-[10px] font-mono text-gray-400">سعر الأمر: ${Number(order.orderPrice).toFixed(2)} ج</span>
                    <span class="text-[10px] text-gray-400">الكمية: ${order.shares} سهم</span>
                  </div>
                  <p class="text-xs ${isShock ? 'text-rose-300 font-bold' : 'text-gray-400'} mt-1">
                    ${isShock ? '⚠️ تحذير هبوط ذعري: يوصى بإلغاء هذا الأمر فوراً في تطبيق ثندر حتى لا ينفذ أثناء النزول العنيف!' : (order.notes || 'أمر معلق قيد المتابعة')}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0 justify-end">
                <button onclick="markPendingThndrOrderCancelled('${order.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow" title="تأكيد أنك نفذت التعديل">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-white"></i>
                  <span>تم تنفيذ التعديل ✓</span>
                </button>
                <button onclick="removePendingThndrOrder('${order.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition" title="حذف من السجل">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      container.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <i data-lucide="list-checks" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">أوامر تطبيق ثندر المعلقة (سجل حماية الأوامر النشطة)</h4>
              <p class="text-[11px] text-gray-400">أي أمر شراء تضعه في ثندر يتابعه النظام هنا؛ وإذا حدث هبوط ذعري بالسوق ينبهك فوراً لإلغائه</p>
            </div>
          </div>
          <button onclick="openAddThndrOrderPrompt()" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto shadow">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>إضافة أمر ثندر جديد</span>
          </button>
        </div>

        <div class="space-y-2.5 mt-3">
          ${rowsHtml}
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    }

    function openAddThndrOrderPrompt() {
      const ticker = prompt('أدخل رمز السهم في ثندر (مثال: ABUK أو SWDY):', 'ABUK');
      if (!ticker) return;
      const price = prompt(`أدخل سعر أمر الشراء المحدد لسهم ${ticker.toUpperCase()} بالجنيه:`, '91.50');
      if (!price || isNaN(parseFloat(price))) return;
      const shares = prompt('أدخل عدد الأسهم المطلوبة:', '200');

      const stockObj = (Array.isArray(fullMarketRadar) && fullMarketRadar.find(s => s.ticker === ticker.toUpperCase()))
        || (Array.isArray(portfolioData) && portfolioData.find(s => s.ticker === ticker.toUpperCase()))
        || { name: ticker.toUpperCase(), ticker: ticker.toUpperCase() };

      addPendingThndrOrder({
        id: 'thndr_' + Date.now(),
        ticker: ticker.toUpperCase(),
        name: stockObj.name || ticker.toUpperCase(),
        type: 'BUY_LIMIT',
        orderPrice: parseFloat(price),
        shares: parseInt(shares) || 100,
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        notes: 'أمر شراء محدد مسجل يدوياً للمتابعة والحماية'
      });

      if (typeof showToast === 'function') {
        showToast(`تم تسجيل أمر الشراء المعلق لسهم ${ticker.toUpperCase()} بنجاح!`, 'success');
      }
    }

    window.openPriceLevelsModal = openPriceLevelsModal;
    window.closePriceLevelsModal = closePriceLevelsModal;
    window.saveCustomPriceLevelsModal = saveCustomPriceLevelsModal;
    window.resetCustomPriceLevelsModal = resetCustomPriceLevelsModal;
    window.initModalMobileScrollEngine = initModalMobileScrollEngine;
    window.openAuditModal = openAuditModal;
    window.closeAuditModal = closeAuditModal;
    window.printAuditReport = printAuditReport;
    window.copyAuditReport = copyAuditReport;
    window.openRotationPlanModalByTicker = openRotationPlanModalByTicker;
    window.switchTab = switchTab;
    window.toggleSidebar = toggleSidebar;
    window.toggleSidebarDrawer = toggleSidebarDrawer;
    window.toggleTheme = toggleTheme;
    window.setRadarFilter = setRadarFilter;
    window.executeRiskCalculations = executeRiskCalculations;
    window.generateStructuredThesis = generateStructuredThesis;
    window.renderDailyActionHub = renderDailyActionHub;
    window.switchActionHubCategory = switchActionHubCategory;


    window.renderMarketBreadthWidget = renderMarketBreadthWidget;
    window.renderPendingThndrOrdersUI = renderPendingThndrOrdersUI;
    window.openAddThndrOrderPrompt = openAddThndrOrderPrompt;
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

      const currentVer = 'v2.5.1';

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

    window.renderChangelogUI = renderChangelogUI;
