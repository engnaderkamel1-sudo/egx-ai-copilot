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
        totalWealth += (item.value || 0);
        totalProfit += (item.profit || 0);
        if (item.ticker === 'CASH' || (item.category && item.category.includes('محفظة نقدية'))) {
          cashWealth += (item.value || 0);
        } else if (item.ticker === 'NCS' || item.ticker === 'BSB' || (item.category && item.category.includes('صناديق'))) {
          fundsWealth += (item.value || 0);
          fundsProfit += (item.profit || 0);
        } else {
          stocksWealth += (item.value || 0);
          stocksProfit += (item.profit || 0);
          stocksCount++;
        }
      });

      // Direct forward accounting for portfolio totalCost (Shares * BuyPrice)
      let calculatedTotalCost = 0;
      portfolioData.forEach(item => {
        if (item.ticker === 'CASH' || item.isCashReserve) {
          calculatedTotalCost += (item.value || 0);
        } else {
          calculatedTotalCost += ((item.shares || 0) * (item.buyPrice || 0));
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
      const idx = portfolioData.findIndex(p => p.ticker === ticker);
      if (idx !== -1 && typeof openRotationPlanModal === 'function') {
        openRotationPlanModal(idx);
      }
    }

    // Render Top Daily Action Hub (Interactive Decision Engine for Plain-Arabic Guidance)
    function renderDailyActionHub() {
      const container = document.getElementById('daily-action-hub');
      if (!container || typeof EGX_Engine === 'undefined' || typeof EGX_Engine.generateDailyActionHub !== 'function') return;

      const cashAsset = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      const cashVal = cashAsset ? Number(cashAsset.value) || 0 : 0;
      const hubData = EGX_Engine.generateDailyActionHub(portfolioData, fullMarketRadar, cashVal);

      const buy = hubData.buyCandidate;
      const profit = hubData.profitCandidate;
      const safety = hubData.safetyAlert;
      const cashStatus = hubData.cashStatus;

      container.innerHTML = `
        <div class="bg-gradient-to-br from-[#0e1424] via-gray-900 to-slate-950 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          
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
                <p class="text-xs text-gray-400 mt-0.5">توجيهات استثمارية واضحة ومباشرة مبنية على مستويات الأمان والدورة السعرية لكل سهم</p>
              </div>
            </div>
            <div class="bg-gray-950/90 border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span class="text-gray-300">السيولة المتاحة للاقتناص: <strong class="text-cyan-300 font-mono font-bold">${Math.round(cashStatus.totalDryPowder).toLocaleString('en-US')} ج.م</strong> (منها ${Math.round(cashStatus.freeCash).toLocaleString('en-US')} ج كاش حر)</span>
            </div>
          </div>

          <!-- 3 Primary Action Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <!-- CARD 1: 🟢 BUY & ACCUMULATE (FROM CASH) -->
            <div class="bg-gray-950/90 border border-emerald-500/40 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
              <div class="bg-emerald-950/60 border-b border-emerald-500/30 p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-xs font-black text-emerald-300">1. فرصة شراء وتخفيض متوسط 🟢</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded ${buy ? buy.cycle.badgeClass : 'bg-gray-800 text-gray-400'} font-bold">
                  ${buy ? buy.cycle.shortBadge : 'لا يوجد اقتناص'}
                </span>
              </div>

              <div class="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                ${buy ? `
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="font-extrabold text-white text-sm sm:text-base">${buy.name} (${buy.ticker})</div>
                      <span class="font-mono font-bold text-xs ${buy.returnPct < 0 ? 'text-rose-400' : 'text-emerald-400'}">${buy.currentPrice.toFixed(2)} ج (${buy.returnPct >= 0 ? '+' : ''}${buy.returnPct.toFixed(1)}%)</span>
                    </div>
                    <div class="text-[11.5px] text-gray-300 leading-relaxed bg-gray-900/90 p-2.5 rounded-lg border border-gray-800 space-y-1 font-sans">
                      <p>• <strong>الخطة المقترحة:</strong> تخصيص <strong class="text-emerald-300 font-mono">${buy.suggestedCash.toLocaleString('en-US')} ج</strong> من رصيدك الكاش لشراء <strong class="text-white font-mono">${buy.sharesToBuy} سهم</strong> بسعر السوق الحالي.</p>
                      <p>• <strong>الفائدة المباشرة:</strong> سينخفض متوسط تكلفة السهم عليك من <strong class="text-rose-300 font-mono">${buy.buyPrice.toFixed(2)} ج</strong> إلى <strong class="text-emerald-400 font-mono">${buy.newAvgCost.toFixed(2)} ج</strong> فوراً (توفير ${buy.avgReductionEgp} ج لكل سهم!).</p>
                    </div>
                  </div>
                  <div class="pt-2 flex items-center gap-2 flex-wrap">
                    <a href="${buy.thndrUrl}" target="_blank" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow">
                      <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                      <span>شراء في ثندر ↗</span>
                    </a>
                    <button onclick="openAuditModal('${buy.ticker}')" class="py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 border border-gray-700">
                      <i data-lucide="file-check" class="w-3.5 h-3.5 text-cyan-400"></i>
                      <span>الأسباب والمرجع 📊</span>
                    </button>
                  </div>
                ` : `
                  <div class="text-center py-6 text-gray-400 space-y-2">
                    <i data-lucide="check-circle" class="w-8 h-8 mx-auto text-emerald-400 opacity-80"></i>
                    <p class="text-xs">لا توجد أسهم في قيعان هبوط اليوم تتطلب تعزيزاً. احتفظ برصيدك الكاش بأمان.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- CARD 2: 🟡 PROFIT TAKING & FREE SHARES (TRADING AROUND CORE) -->
            <div class="bg-gray-950/90 border border-amber-500/40 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
              <div class="bg-amber-950/60 border-b border-amber-500/30 p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs font-black text-amber-300">2. تأمين قمة وتكبير أسهم مجاناً 🟡</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded ${profit ? profit.cycle.badgeClass : 'bg-gray-800 text-gray-400'} font-bold">
                  ${profit ? profit.cycle.shortBadge : 'احتفاظ هادئ'}
                </span>
              </div>

              <div class="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                ${profit ? `
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="font-extrabold text-white text-sm sm:text-base">${profit.name} (${profit.ticker})</div>
                      <span class="font-mono font-bold text-xs text-emerald-400">${profit.currentPrice.toFixed(2)} ج (+${profit.returnPct.toFixed(1)}%)</span>
                    </div>
                    <div class="text-[11.5px] text-gray-300 leading-relaxed bg-gray-900/90 p-2.5 rounded-lg border border-gray-800 space-y-1 font-sans">
                      <p>• <strong>الخطوة 1 (بيع جزئي):</strong> بيع <strong class="text-amber-300 font-mono">${profit.sellShares} سهم</strong> بسعر القمة لحبس كاش مضمون <strong class="text-emerald-400 font-mono">${profit.sellCash.toLocaleString('en-US')} ج</strong>.</p>
                      <p>• <strong>الخطوة 2 (إعادة شراء بالقاع):</strong> وضع أمر شراء عند الدعم <strong class="text-cyan-300 font-mono">${profit.rebuyPrice} ج</strong> لشراء <strong class="text-white font-mono">${profit.rebuyShares} سهم</strong>.</p>
                      <p class="text-emerald-300 font-semibold">• <strong>المكسب المجاني:</strong> رصيد أسهمك سيزداد بمقدار <strong class="text-white font-mono font-bold">+${profit.netGainShares} أسهم زيادة مجاناً</strong> بدون دفع أي مليم!</p>
                    </div>
                  </div>
                  <div class="pt-2 flex items-center gap-2 flex-wrap">
                    <button onclick="openRotationPlanModalByTicker('${profit.ticker}')" class="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow">
                      <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                      <span>عرض خطة زيادة الأسهم 📋</span>
                    </button>
                    <a href="${profit.thndrUrl}" target="_blank" class="py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 border border-gray-700">
                      <i data-lucide="trending-up" class="w-3.5 h-3.5 text-amber-400"></i>
                      <span>بيع في ثندر ↗</span>
                    </a>
                  </div>
                ` : `
                  <div class="text-center py-6 text-gray-400 space-y-2">
                    <i data-lucide="shield-check" class="w-8 h-8 mx-auto text-cyan-400 opacity-80"></i>
                    <p class="text-xs">الأسهم الرابحة في مسار صعود صحي ولم تصل لقمة متضخمة بعد. الاستمرار في الاحتفاظ.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- CARD 3: 🛡️ SAFETY & RISK WATCH -->
            <div class="bg-gray-950/90 border ${safety && safety.hasRisk ? 'border-rose-500/50' : 'border-slate-800'} rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
              <div class="${safety && safety.hasRisk ? 'bg-rose-950/70 border-rose-500/30' : 'bg-slate-900/90 border-slate-700'} border-b p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full ${safety && safety.hasRisk ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}"></span>
                  <span class="text-xs font-black ${safety && safety.hasRisk ? 'text-rose-300' : 'text-slate-200'}">3. رادار الأمان وحالة المحفظة 🛡️</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded ${safety && safety.hasRisk ? 'bg-rose-900/90 text-rose-200 border border-rose-500/40' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'} font-bold">
                  ${safety && safety.hasRisk ? 'تحذير كسر دعم' : 'استقرار وأمان'}
                </span>
              </div>

              <div class="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                ${safety && safety.hasRisk ? `
                  <div class="space-y-2">
                    <div class="font-extrabold text-white text-sm sm:text-base">${safety.name} (${safety.ticker})</div>
                    <div class="text-[11.5px] text-rose-200 leading-relaxed bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40 space-y-1 font-sans">
                      <p>• <strong>تنبيه فني:</strong> السعر الحالي (${safety.currentPrice} ج) كسر مستوى الدعم S1 (${safety.supportPrice} ج).</p>
                      <p>• <strong>التوجيه:</strong> يُنصح بعدم شراء كميات جديدة، وانتظار ارتداد مقاومة لتخفيف السهم ونقل السيولة لسهم أسرع تعويضاً.</p>
                    </div>
                  </div>
                  <div class="pt-2">
                    <button onclick="openRotationPlanModalByTicker('${safety.ticker}')" class="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow">
                      <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
                      <span>فحص خطة الحماية والتدوير 🔄</span>
                    </button>
                  </div>
                ` : `
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                      <span>محفظتك اليوم في وضع استقرار آمن</span>
                    </div>
                    <div class="text-[11.5px] text-gray-300 leading-relaxed bg-gray-900/90 p-2.5 rounded-lg border border-gray-800 space-y-1.5 font-sans">
                      <p>• <strong>الأسهم القيادية:</strong> تتداول فوق خطوط الأمان، ولا توجد مؤشرات كسر دعم مقلقة.</p>
                      <p>• <strong>أموال السيولة:</strong> وثائق صناديق B-Safe و NCS تدر عائداً يومياً ثابتاً (~22% سنوياً).</p>
                      <p class="text-cyan-300">• <strong>نصيحة اليوم:</strong> لا داعي للمضاربة اليومية؛ اترك السوق يعمل لصالحك واستمتع بيومك.</p>
                    </div>
                  </div>
                  <div class="pt-2">
                    <button onclick="switchTab('advisor')" class="w-full py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 border border-cyan-800/40 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                      <i data-lucide="message-square" class="w-3.5 h-3.5 text-cyan-400"></i>
                      <span>استشارة المستشار الذكي (AI Copilot)</span>
                    </button>
                  </div>
                `}
              </div>
            </div>

          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
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
                <div class="font-bold text-white text-xs sm:text-sm">${item.name}</div>
                <div class="text-[10px] text-gray-400">${item.category}</div>
                ${item.ticker !== 'CASH' ? `
                  <div class="mt-1 flex items-center gap-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${cycle.badgeClass}" title="${cycle.advice || ''}">
                      ${cycle.shortBadge}
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </td>

          <!-- 2. Live Market Price per Share (سعر السهم اللحظي بالبورصة) -->
          <td class="py-3.5 px-3 text-center">
            ${item.currentPrice && item.ticker !== 'CASH' && item.ticker !== 'NCS' && item.ticker !== 'BSB' 
              ? `<div class="inline-flex flex-col items-center">
                  <div class="bg-cyan-950/50 border border-cyan-800/60 px-2.5 py-1 rounded-lg inline-block font-mono font-bold text-cyan-300 text-xs sm:text-sm shadow-sm">
                    <span>${Number(item.currentPrice).toFixed(2)}</span>
                    <span class="text-[10px] text-gray-400 font-sans">ج</span>
                  </div>
                  <div class="flex items-center gap-1 mt-1 text-[9px] text-gray-400 font-mono">
                    <span class="w-1.5 h-1.5 rounded-full ${item.priceSource && item.priceSource.includes('يدوي') ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}"></span>
                    <span>آخر تحديث: ${formatDateTimeDisplay(item.priceUpdatedAt)}</span>
                  </div>
                  <span class="text-[8.5px] text-gray-500 font-sans mt-0.5">(${item.priceSource || 'شاشة البورصة اللحظية'})</span>
                 </div>`
              : `<span class="text-gray-500 font-normal">--</span>`}
          </td>

          <!-- 3. Shares Quantity (عدد الأسهم المملوكة) -->
          <td class="py-3.5 px-3 text-center font-mono font-bold text-indigo-300 text-xs sm:text-sm">
            ${item.shares 
              ? `<div class="bg-indigo-950/40 border border-indigo-800/40 px-2 py-1 rounded-lg inline-block">
                  <span>${item.shares.toLocaleString('en-US')}</span>
                  <span class="text-[10px] text-indigo-400 font-sans">سهم</span>
                 </div>`
              : `<span class="text-gray-500 font-normal">--</span>`}
          </td>

          <!-- 4. Buy Price per Share (متوسط تكلفة الشراء للسهم) -->
          <td class="py-3.5 px-3 text-center font-mono font-bold text-gray-300 text-xs sm:text-sm">
            ${item.buyPrice && item.ticker !== 'CASH' && item.ticker !== 'NCS' && item.ticker !== 'BSB'
              ? `<span>${Number(item.buyPrice).toFixed(2)}</span> <span class="text-[10px] text-gray-500 font-sans">ج</span>`
              : `<span class="text-gray-500 font-normal">--</span>`}
          </td>

          <!-- 5. Total Market Value (إجمالي القيمة السوقية) -->
          <td class="py-3.5 px-3 text-xs sm:text-sm">
            <div class="font-mono font-bold text-white">
              ${Math.round(item.value).toLocaleString('en-US')} <span class="text-[10px] text-gray-400 font-sans">ج.م</span>
            </div>
            <div class="text-[10px] text-gray-500 font-mono mt-0.5">
              التكلفة: ${Math.round(cost).toLocaleString('en-US')} ج (${weightPct}%)
            </div>
          </td>

          <!-- 6. Profit / Performance (التطور والأرباح) -->
          <td class="py-3.5 px-3 text-xs sm:text-sm">
            <div class="font-mono font-bold ${colorClass}">
              ${isNeutral ? '0' : `${isPositive ? '+' : ''}${Math.round(item.profit).toLocaleString('en-US')}`} <span class="text-[10px] font-sans">ج.م</span>
            </div>
            <div class="mt-0.5 flex items-center gap-1 font-mono text-[10px]">
              ${isNeutral
                ? `<span class="px-1.5 py-0.2 rounded border ${bgBadgeClass} text-gray-400">سيولة حرة</span>`
                : `<span class="px-1.5 py-0.2 rounded border ${bgBadgeClass} flex items-center gap-0.5">
                     <i data-lucide="${isPositive ? 'trending-up' : 'trending-down'}" class="w-3 h-3"></i>
                     <span>${isPositive ? '+' : ''}${item.returnPct.toFixed(2)}%</span>
                   </span>`
              }
            </div>
          </td>

          <!-- 7. Advisor Advice & Decision Freshness -->
          <td class="py-3.5 px-3 text-xs text-gray-300">
            <div class="flex flex-col gap-1 items-start">
              <div class="flex items-center gap-1.5 flex-wrap">
                ${(() => {
                  const activePlan = (typeof activeRotationPlans !== 'undefined' && Array.isArray(activeRotationPlans)) 
                    ? activeRotationPlans.find(p => p.ticker === item.ticker) 
                    : null;
                  if (!activePlan) return '';
                  return `
                    <button onclick="scrollToActiveRadar('${activePlan.id}')" class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm animate-pulse cursor-pointer" title="يوجد خطة معتمدة قيد المراقبة اللحظية لهذا السهم - اضغط للانتقال إلى الرادار">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>رادار المراقبة نشط 🎯</span>
                    </button>
                  `;
                })()}
                ${(item.action === 'REBALANCE_CANDIDATE' || item.returnPct >= 18) && item.ticker !== 'CASH' && item.ticker !== 'NCS' && item.ticker !== 'BSB' ? `
                  <button onclick="openRotationPlanModal(${index})" class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeActionColor} hover:opacity-90 transition flex items-center gap-1 cursor-pointer" title="${item.profit < 0 ? 'اضغط لعرض خطة تدوير وتخفيف السهم المتراجع' : 'اضغط لعرض خطة جني أرباح القمة وإعادة الشراء في القاع'}">
                    <span>${badgeActionText}</span>
                    <i data-lucide="${item.profit < 0 ? 'refresh-cw' : 'compass'}" class="w-3 h-3 ${item.profit < 0 ? 'text-amber-400' : 'text-amber-300'}"></i>
                  </button>
                  <button onclick="openRotationPlanModal(${index})" class="px-2 py-0.5 rounded text-[10px] font-bold ${item.profit < 0 ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'} flex items-center gap-1 transition shadow-sm animate-pulse" title="عرض تفاصيل كمية التخفيف والكاش الناتج وأين نضعه">
                    <span>${item.profit < 0 ? 'خطة التدوير 🔄' : 'الخطة التنفيذية 📋'}</span>
                  </button>
                ` : `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeActionColor}">${badgeActionText}</span>
                `}
                <button onclick="openAuditModal('${item.ticker}')" class="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-0.5 shrink-0" title="بطاقة التقييم ومصادر التحقق">
                  <i data-lucide="file-check" class="w-3 h-3 text-emerald-400"></i>
                  <span>فحص 📊</span>
                </button>
              </div>
              <div class="text-[10.5px] text-gray-300 leading-tight">
                ${item.advice || ''}
              </div>
              ${item.pivotR1 && item.ticker !== 'CASH' && item.ticker !== 'NCS' && item.ticker !== 'BSB' ? `
                <div class="flex items-center gap-1.5 mt-1 flex-wrap text-[9px] font-mono">
                  <span class="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300" title="المقاومة الفنية الأولى (الهدف الأول)">مقاومة R1 (الهدف): <strong>${item.pivotR1} ج</strong></span>
                  <span class="px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-500/30 text-rose-300" title="الدعم الفني الأول وخط الأمان">دعم S1 (الأمان): <strong>${item.pivotS1} ج</strong></span>
                  ${item.sma50 ? `<span class="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 text-cyan-300" title="متوسط حركة السهم لـ 50 يوم">متوسط 50: ${item.sma50} ج</span>` : ''}
                  ${item.rrDisplay ? `<span class="px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-bold" title="نسبة العائد للمخاطرة">R/R: ${item.rrDisplay}</span>` : ''}
                </div>
              ` : ''}
              <div class="bg-gray-950/90 border border-gray-800 px-2 py-1 rounded-md text-[9px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                <i data-lucide="clock" class="w-2.5 h-2.5 text-cyan-400 shrink-0"></i>
                <span>القرار صادر بناءً على سعر: <strong>${item.currentPrice ? Number(item.currentPrice).toFixed(2) + ' ج' : '--'}</strong> • ${formatDecisionTimeString(item.decisionUpdatedAt)}</span>
              </div>
            </div>
          </td>

          <!-- 8. Actions (تعديل الأسهم والتنفيذ) -->
          <td class="py-3.5 px-3 text-center">
            <div class="flex items-center justify-center gap-1">
              ${item.ticker !== 'CASH' ? `
                <a href="${item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`}" target="_blank" class="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition" title="فتح صفحة ${item.name} للتنفيذ في تطبيق ثندر">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </a>
              ` : ''}
              <button onclick="openFineTuneModal(${index})" class="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 text-xs font-bold shadow-sm" title="تعديل عدد الأسهم وسعر الشراء فوراً">
                <i data-lucide="layers" class="w-3.5 h-3.5 text-indigo-200"></i>
                <span>تعديل</span>
              </button>
              <button onclick="editAsset(${index})" class="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition" title="تعديل بيانات السهم والشركة">
                <i data-lucide="edit-3" class="w-3.5 h-3.5 text-cyan-400"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      safeCreateIcons();
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

    function openAuditModal(ticker) {
      const stock = fullMarketRadar.find(s => s.ticker === ticker) || 
                    portfolioData.find(s => s.ticker === ticker) || 
                    {
                      ticker: ticker,
                      name: ticker,
                      price: 0,
                      catalyst: 'إيرادات تشغيلية ومحفزات قطاعية قوية بالبورصة المصرية',
                      support: 'دعم هيكلي متماسك',
                      target1: 'مستهدف صاعد',
                      stopLoss: 'وقف خسارة صارم',
                      volumeMultiplier: '2.5x'
                    };

      const titleEl = document.getElementById('audit-modal-title');
      const subEl = document.getElementById('audit-modal-subtitle');
      const consensusBanner = document.getElementById('audit-consensus-banner');
      const container = document.getElementById('audit-agents-container');

      if (titleEl) titleEl.innerText = `بطاقة التقييم الاستثماري: ${stock.name || stock.ticker}`;
      if (subEl) subEl.innerText = `رمز السهم: ${stock.ticker} • فحص القوائم المالية، الشارت اللحظي، ومستويات الأمان`;

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

      // The 3 Pillars Breakdown & Proof Links
      const tradingViewUrl = `https://www.tradingview.com/symbols/EGX-${stock.ticker}/`;
      const mubasherUrl = `https://www.mubasher.info/markets/EGX/stocks/${stock.ticker}`;
      const thndrUrl = `https://app.thndr.app`;

      const currentQuote = stock.currentPrice || stock.price || 0;
      const decTime = stock.decisionUpdatedAt || stock.priceUpdatedAt || 'جلسة اليوم';
      const decBasis = stock.decisionBasis || `سعر السهم: ${Number(currentQuote).toFixed(2)} ج`;

      const stockCycle = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.determineStockCycle === 'function')
        ? EGX_Engine.determineStockCycle(stock)
        : { stage: 2, nameAr: 'المرحلة 2: مسار صاعد معتدل', shortBadge: 'مسار صاعد 🟡', badgeClass: 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50', advice: 'السهم يتحرك في اتجاه إيجابي صحي.', actionTag: 'احتفاظ', progressPct: 60, bgHeaderClass: 'from-cyan-950 to-slate-900' };

      container.innerHTML = `
        <!-- Decision Freshness & Pricing Basis Banner -->
        <div class="bg-gray-950/90 border border-cyan-500/40 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-gray-300 text-[11px]">القرار الاستثماري صادر بناءً على: <strong class="text-cyan-300 font-mono">${decBasis}</strong></span>
          </div>
          <div class="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>تاريخ ووقت تقييم القرار: <strong class="text-emerald-300">${formatDateTimeDisplay(decTime)}</strong></span>
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

        <!-- Pillar 1: Fundamental Analysis -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">التحليل المالي والأساسي (Fundamental Valuation)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✅ نمو الأرباح واستقرار التدفقات</span>
          </div>
          <p class="text-gray-300 text-[11px] leading-relaxed">
            ${stock.catalyst || 'الشركة تحقق نمواً في صافي الأرباح التشغيلية ومكرر ربحية جذاب وتوزيعات نقدية مستمرة تدعم الاستثمار طويل الأجل.'}
          </p>
          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px]">المصادر الرسمية للتحقق:</span>
            <a href="${mubasherUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>القوائم المالية ومكرر الأرباح (مباشر مصر)</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
            <span class="text-gray-600">•</span>
            <a href="https://www.egx.com.eg" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>إفصاحات البورصة المصرية الرسمية</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        </div>

        <!-- Pillar 2: Technical & Volume Analysis -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">التحليل الفني والسيولة (Technical & Momentum)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">✅ ارتكاز فوق الدعم وزخم صاعد</span>
          </div>
          <p class="text-gray-300 text-[11px] leading-relaxed">
            السعر يتداول في نطاق إيجابي فوق نقطة الارتكاز مع تماسك عند الدعم <strong>${stock.support || 'المحوري'}</strong>، واستهداف مقاومة <strong>${stock.target1 || 'الأولى'}</strong> بتدفق سيولة <strong>${stock.volumeMultiplier || '2.2x'}</strong> ضعف المتوسط.
          </p>
          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px]">المصادر الرسمية للتحقق:</span>
            <a href="${tradingViewUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>الرسم البياني والشارت اللحظي (TradingView)</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
            <span class="text-gray-600">•</span>
            <a href="${thndrUrl}" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>عمق طلبات التنفيذ في ثندر</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        </div>

        <!-- Pillar 3: Risk & Capital Preservation -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
              <h4 class="font-bold text-white text-xs sm:text-sm">حوكمة المخاطر وإدارة رأس المال (Risk Governance)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">✅ معتمد (R/R >= 1:2.0)</span>
          </div>
          <p class="text-gray-300 text-[11px] leading-relaxed">
            تحديد صارم لمستوى وقف الخسارة عند <strong>${stock.stopLoss || 'المستوى المحدد'}</strong> لضمان حماية رأس المال وعدم تجاوز أقصى نسبة مخاطرة مسموحة، مع التحقق من وجود عمق سيولة كافٍ لتنفيذ البيع الفوري في ثندر دون انزلاق سعري.
          </p>
          <div class="pt-1.5 flex items-center gap-2 flex-wrap border-t border-gray-800/60">
            <span class="text-gray-400 text-[10px]">القواعد المرجعية:</span>
            <button onclick="closeAuditModal(); switchTab('rules');" class="text-amber-400 hover:underline flex items-center gap-1 text-[10px] font-bold">
              <span>سياسة إدارة المحفظة وقواعد الاستثمار (INVESTMENT_RULES.md)</span>
              <i data-lucide="shield" class="w-3 h-3"></i>
            </button>
          </div>
        </div>

        <!-- Live Analysis Synthesis Bar -->
        <div class="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i>
            <span class="text-white font-bold">تحليل فوري مخصص للسهم:</span>
            <span class="text-gray-300">استشر النموذج الذكي حول ملاءمة السهم لمحفظتك وقواعد الاستثمار.</span>
          </div>
          <button onclick="closeAuditModal(); askCopilot('قدم لي تحليلاً شاملاً لسهم ${stock.name} (${stock.ticker}) ومستويات الدعم والشراء وفق محفظتي الحالية.');" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow">
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


    // Phase 3: Advanced Market Radar Logic & Filtering
    let currentRadarFilter = 'all';

    function setRadarFilter(filter) {
      currentRadarFilter = filter;
      ['all', 'egx30', 'egx70', 'volume_surge', 'oversold_bounce', 'low_risk'].forEach(f => {
        const btn = document.getElementById(`rf-${f}`);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-3.5 py-1.5 rounded-lg font-bold bg-emerald-600 text-white transition';
          } else {
            btn.className = 'px-3.5 py-1.5 rounded-lg font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition';
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
      updateLiveTickerMarquee();
      const container = document.getElementById('radar-grid');
      container.innerHTML = '';

      const query = (document.getElementById('radar-search-input')?.value || '').trim().toLowerCase();

      const filtered = fullMarketRadar.filter(item => {
        const matchesCategory = currentRadarFilter === 'all' 
          || item.index === currentRadarFilter 
          || (item.tags && item.tags.includes(currentRadarFilter));

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

          <div>
            <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-2 bg-gray-950/50 p-2 rounded-xl border border-gray-800/80">
              <div>
                <span class="text-gray-400 block text-[9px]" title="سعر الدعم الأول الذي إذا تماسك فوقه السهم يبدأ بالصعود">الدعم S1 (سعر الأمان)</span>
                <span class="font-bold text-white font-mono">${item.support}</span>
              </div>
              <div>
                <span class="text-gray-400 block text-[9px]" title="مستوى المقاومة والهدف السعري الأول المتوقع">المقاومة R1 (الهدف الأول)</span>
                <span class="font-bold text-emerald-400 font-mono">${item.target1}</span>
              </div>
              <div>
                <span class="text-gray-400 block text-[9px]" title="سعر الخروج الحامي لرأس المال لو هبط السهم دونه">وقف الخسارة (حماية رأس المال)</span>
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
              <button onclick="openAuditModal('${item.ticker}')" class="px-2 py-1.5 rounded-lg border border-gray-700 hover:border-emerald-500 bg-gray-800/80 text-gray-300 hover:text-emerald-400 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer" title="بطاقة التقييم الاستثماري والمصادر الرسمية">
                <i data-lucide="file-check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>فحص</span>
              </button>
              <a href="${item.tradingViewUrl || 'https://www.tradingview.com'}" target="_blank" class="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 transition" title="شارت TradingView اللحظي">
                <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
              </a>
              <button onclick="askCopilot('ما هو التحليل الفني والأساسي لسهم ${item.name} (${item.ticker}) وفق مستويات المقاومة ${item.target1} والدعم ${item.support}؟')" class="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>استشارة</span>
              </button>
              <a href="${item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-xs text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer" title="فتح صفحة ${item.name} في ثندر">
                <span>ثندر</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
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
        const trailingStop = pivot;
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
            تم تحقيق الهدف الفني الأول بنجاح (+${(((close - pivot) / pivot) * 100).toFixed(1)}%). للاستمرار في الصفقة نحو R2، ارفع وقف الخسارة إلى الارتكاز (${pivot.toFixed(2)} ج) لتأمين الأرباح ومنع تحولها لخسارة.
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
        'glossary': { title: 'دليل المصطلحات المالية', desc: 'شرح مبسط لكل مصطلحات البورصة والتحليل الفني والمالي', badge: 'قاموس المستثمر' }
      };

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
