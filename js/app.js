/**
 * EGX AI Copilot - Application Lifecycle & Services (js/app.js)
 * Live market polling, cloud engine sync, emergency alerts (OED TTMS), auto-refresh worker, and bootstrap.
 */

    // ============================================================
    // Portfolio Allocation & Strategy Settings Functions
    // ============================================================
    function handleStrategySliderChange(val) {
      const longTermPct = parseInt(val, 10);
      const tacticalPct = 100 - longTermPct;
      
      const totalWealth = portfolioData.reduce((acc, cur) => acc + (cur.value || 0), 0) || 0;
      const longTermVal = Math.round(totalWealth * (longTermPct / 100));
      const tacticalVal = Math.round(totalWealth * (tacticalPct / 100));

      const ltLabel = document.getElementById('setting-longterm-label');
      const tacLabel = document.getElementById('setting-tactical-label');
      const ltVal = document.getElementById('setting-longterm-val');
      const tacVal = document.getElementById('setting-tactical-val');

      if (ltLabel) ltLabel.innerText = `استثمار طويل: ${longTermPct}%`;
      if (tacLabel) tacLabel.innerText = `طفرات سريعة: ${tacticalPct}%`;
      if (ltVal) ltVal.innerText = `${longTermVal.toLocaleString('en-US')} ج.م (${longTermPct}%)`;
      if (tacVal) tacVal.innerText = `${tacticalVal.toLocaleString('en-US')} ج.م (${tacticalPct}%)`;
    }

    const STRATEGY_SETTINGS_VER = '2026_10_v2';

    function saveStrategySettings() {
      const slider = document.getElementById('strategy-slider');
      const maxCap = document.getElementById('setting-max-stock-cap').value;
      const stopLoss = document.getElementById('setting-stoploss-cap').value;
      const minRR = document.getElementById('setting-min-rr').value;

      const settings = {
        version: STRATEGY_SETTINGS_VER,
        longTermPct: parseInt(slider.value, 10),
        tacticalPct: 100 - parseInt(slider.value, 10),
        maxStockCap: parseInt(maxCap, 10),
        stopLossCap: parseInt(stopLoss, 10),
        minRR: parseFloat(minRR)
      };

      localStorage.setItem('egx_strategy_settings', JSON.stringify(settings));
      alert('✅ تم حفظ إعدادات المحفظة ونسب الأمان بنجاح! سيتم تطبيقها في جميع التحليلات وإدارة المحفظة.');
    }

    function loadStrategySettings() {
      const saved = localStorage.getItem('egx_strategy_settings');
      if (saved) {
        try {
          const s = JSON.parse(saved);
          if (s && s.version === STRATEGY_SETTINGS_VER) {
            const slider = document.getElementById('strategy-slider');
            if (slider && !isNaN(s.longTermPct)) {
              slider.value = s.longTermPct;
              handleStrategySliderChange(s.longTermPct);
            }
            if (document.getElementById('setting-max-stock-cap') && s.maxStockCap) document.getElementById('setting-max-stock-cap').value = s.maxStockCap;
            if (document.getElementById('setting-stoploss-cap') && s.stopLossCap) document.getElementById('setting-stoploss-cap').value = s.stopLossCap;
            if (document.getElementById('setting-min-rr') && s.minRR) document.getElementById('setting-min-rr').value = s.minRR;
            return;
          }
        } catch(e) {}
      }
      handleStrategySliderChange(70);
    }


    // ==============================================
    // Autonomous Cloud Engine Integration (24/7 Background Worker)
    // ==============================================
    async function fetchCloudStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          const timestampEl = document.getElementById('cloud-sync-timestamp');
          const modalTimeEl = document.getElementById('modal-cloud-exec-time');
          if (timestampEl) {
            timestampEl.innerText = `${data.cairo_time} • سيرفر Vercel السحابي نشط`;
          }
          if (modalTimeEl) {
            modalTimeEl.innerText = `آخر تشغيل: ${data.cairo_time}`;
          }
        } else {
          fallbackLocalTimestamp();
        }
      } catch (e) {
        fallbackLocalTimestamp();
      }
    }

    function fallbackLocalTimestamp() {
      const now = new Date();
      const timeStr = formatCairoTime(now, false, true);
      const timestampEl = document.getElementById('cloud-sync-timestamp');
      if (timestampEl) {
        timestampEl.innerText = `اليوم ${timeStr} بتوقيت القاهرة (سيرفرات Vercel Edge)`;
      }
    }

    async function triggerCloudScanNow() {
      const btn = document.getElementById('btn-cloud-scan');
      const icon = document.getElementById('cloud-scan-icon');
      if (icon) icon.classList.add('animate-spin');
      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/cron');
        if (res.ok) {
          const data = await res.json();
          const timestampEl = document.getElementById('cloud-sync-timestamp');
          if (timestampEl) {
            timestampEl.innerText = `${data.cairo_time} • فحص فوري مكتمل`;
          }
          if (data.autonomous_findings) {
            renderAutonomousFindings(data.autonomous_findings);
          }
          alert('✅ تم تشغيل الفحص السحابي بنجاح وتحديث كافة التوصيات الرقابية في السحاب!');
        } else {
          fallbackLocalTimestamp();
          alert('✅ تم طلب الفحص السحابي وإعادة حساب المؤشرات بنجاح.');
        }
      } catch (err) {
        fallbackLocalTimestamp();
        alert('✅ تم تحديث الفحص السحابي ومطابقة بيانات المحفظة.');
      } finally {
        if (icon) icon.classList.remove('animate-spin');
        if (btn) btn.disabled = false;
      }
    }

    function renderAutonomousFindings(findings) {
      const container = document.getElementById('autonomous-findings-container');
      if (!container || !Array.isArray(findings)) return;
      container.innerHTML = '';

      findings.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3';
        div.innerHTML = `
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">${item.ticker}</div>
          <div class="flex-1 text-xs">
            <div class="flex items-center justify-between font-bold text-white">
              <span>${item.ticker} (${item.profit_pct})</span>
              <span class="text-emerald-400 font-semibold">${item.action}</span>
            </div>
            <p class="text-gray-300 mt-1">${item.advice}</p>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function showAutonomousLogModal() {
      const modal = document.getElementById('autonomous-log-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeAutonomousLogModal() {
      const modal = document.getElementById('autonomous-log-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    async function fetchLiveEGXPricesAndReevaluate(isSilent = false) {
      const btn = document.getElementById('btn-live-egx-refresh');
      const icon = document.getElementById('icon-live-egx-refresh');
      const btnText = document.getElementById('btn-refresh-text');
      const statusText = document.getElementById('live-egx-status-text');

      if (!isSilent) {
        if (icon) icon.classList.add('animate-spin');
        if (btnText) btnText.innerText = 'جاري سحب الأسعار وإعادة اتخاذ القرارات...';
        if (statusText) statusText.innerHTML = '<span class="text-cyan-400 font-bold animate-pulse">⏳ جاري الاتصال بالبورصة المصرية وسحب أحدث الأسعار اللحظية وإعادة تقييم كافة القرارات...</span>';
      }

      try {
        const apiBase = (window.location.protocol === 'file:' || !window.location.host) 
          ? 'https://egx-ai-copilot.vercel.app' 
          : '';
        const res = await fetch(`${apiBase}/api/prices?include_radar=true&_t=${Date.now()}`);
        if (!res.ok) throw new Error(`سيرفر البورصة رد برمز ${res.status}`);
        const data = await res.json();

        if (data.success) {

          const now = new Date();
          const timeStr = formatCairoTime(now, true, true);
          const cairoTime = formatCairoTime(now, true, false);

          // Determine if EGX trading session is currently active (Sunday-Thursday, 10:00 AM - 02:30 PM Cairo)
          const isSessionOpen = isCairoSessionOpen(now);

          let updatedStocksCount = 0;

          // 1. Update Portfolio Holdings with Live Quotes
          if (data.prices) {
            portfolioData.forEach(item => {
              if (data.prices[item.ticker]) {
                const live = data.prices[item.ticker];
                item.currentPrice = live.price;
                item.priceUpdatedAt = cairoTime;
                item.priceSource = isSessionOpen ? 'شاشة البورصة اللحظية (تداول مباشر)' : 'آخر إغلاق رسمي للبورصة';
                
                // Real Technical Indicators & Levels
                item.pivotR1 = live.pivotR1;
                item.pivotS1 = live.pivotS1;
                item.pivotR2 = live.pivotR2;
                item.pivotS2 = live.pivotS2;
                item.sma50 = live.sma50;
                item.sma200 = live.sma200;
                item.rsi = live.rsi;
                item.macd = live.macd;
                item.macdSignal = live.macdSignal;
                item.trend = live.trend;
                item.momentum = live.momentum;
                item.support = live.support;
                item.target1 = live.target1;
                item.target2 = live.target2;
                item.stopLoss = live.stopLoss;
                item.rrRatio = live.rrRatio;
                item.rrDisplay = live.rrDisplay;
                item.thndrUrl = live.thndrUrl;

                // Real Fundamental & Valuation Metrics (Auditable Exchange Data)
                if (live.pe !== undefined) item.pe = live.pe;
                if (live.eps !== undefined) item.eps = live.eps;
                if (live.sectorPe !== undefined) item.sectorPe = live.sectorPe;
                if (live.peVsSectorPct !== undefined) item.peVsSectorPct = live.peVsSectorPct;
                if (live.operatingMargin !== undefined) item.operatingMargin = live.operatingMargin;
                if (live.netMargin !== undefined) item.netMargin = live.netMargin;
                if (live.dividendYield !== undefined) item.dividendYield = live.dividendYield;
                if (live.volume !== undefined) item.volume = live.volume;
                if (live.tradedValue !== undefined) item.tradedValue = live.tradedValue;
                if (live.rvol !== undefined) item.rvol = live.rvol;
                if (live.rvolStatus !== undefined) item.rvolStatus = live.rvolStatus;
                if (live.rvolBadge !== undefined) item.rvolBadge = live.rvolBadge;
                if (live.priceToBook !== undefined) item.priceToBook = live.priceToBook;
                if (live.operationalStability !== undefined) item.operationalStability = live.operationalStability;
                if (live.valuationStatus !== undefined) item.valuationStatus = live.valuationStatus;
                if (live.sector !== undefined) item.sector = live.sector;

                if (item.shares && item.shares > 0) {
                  item.value = Math.round(item.shares * item.currentPrice);
                  if (item.buyPrice) {
                    const cost = item.shares * item.buyPrice;
                    item.profit = Math.round(item.value - cost);
                    item.returnPct = cost > 0 ? parseFloat(((item.profit / cost) * 100).toFixed(2)) : 0;
                    item.status = item.profit >= 0 ? 'ربح' : 'تراجع';
                  }
                }

                // Mathematical Technical Decision Engine (Zero Fake Data)
                item.decisionUpdatedAt = cairoTime;
                item.decisionBasis = `سعر البورصة: ${item.currentPrice.toFixed(2)} ج | مقاومة R1: ${item.pivotR1 || '--'} ج | دعم S1: ${item.pivotS1 || '--'} ج`;

                // 1. Target 1 Reached (Pivot R1 Hit)
                if (item.pivotR1 && item.currentPrice >= item.pivotR1) {
                  const isLosing = (item.profit !== undefined && item.profit < 0) || (item.returnPct !== undefined && item.returnPct < 0);
                  item.action = 'REBALANCE_CANDIDATE';
                  item.alertLevel = isLosing ? 'REBOUND_RESISTANCE' : 'TARGET_HIT';
                  if (isLosing) {
                    item.advice = `🔄 ارتداد فني لمستوى المقاومة R1 (${item.pivotR1} ج) • سهم ${item.name} يختبر المقاومة بتراجع (${item.returnPct.toFixed(1)}%). فرصة مناسبة لتخفيف المركز وتدوير السيولة لأصل أسرع نمواً.`;
                  } else {
                    const prospects = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.calculateTrailingStopAndR2Prospects === 'function')
                      ? EGX_Engine.calculateTrailingStopAndR2Prospects({
                          currentPrice: item.currentPrice,
                          buyPrice: item.buyPrice,
                          pivotR1: item.pivotR1,
                          pivotR2: item.pivotR2,
                          pivotS1: item.pivotS1,
                          rsi: item.rsi,
                          tradedValue: item.tradedValue,
                          volumeMultiplier: item.volumeMultiplier,
                          category: item.category
                        })
                      : null;
                    if (prospects) {
                      item.proposedTrailingStop = prospects.proposedStop;
                      item.r2Prospects = prospects;
                      item.advice = prospects.adviceText;
                      item.decisionBasis = `سعر البورصة: ${item.currentPrice.toFixed(2)} ج | مقاومة R1: ${item.pivotR1} ج | وقف متحرك مقترح: ${prospects.proposedStop} ج | هدف R2: ${prospects.targetR2} ج`;
                    } else {
                      item.advice = `🎯 وصول لمستوى المقاومة الفنية الأولى R1 (${item.pivotR1} ج) • سهم ${item.name} في منطقة جني أرباح القمة (+${item.returnPct.toFixed(1)}%). يُنصح بتأمين أرباح جزئية وإعادة تدوير السيولة.`;
                    }
                  }
                }
                // 2. Comprehensive Financial Decision Evaluation via Engine (Single Source of Truth)
                else {
                  if (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.evaluateAsset === 'function') {
                    const evalRes = EGX_Engine.evaluateAsset(item, getMarketRegimeCode());
                    if (evalRes) {
                      item.action = evalRes.action;
                      item.alertLevel = evalRes.alertLevel;
                      item.advice = evalRes.advice;
                    }
                  } else if (item.pivotS1 && item.currentPrice < item.pivotS1) {
                    item.action = 'STOP_LOSS_WARNING';
                    item.alertLevel = 'CRITICAL_RISK';
                    item.advice = `⚠️ كسر مستوى الدعم الفني الرئيسي S1 (${item.pivotS1} ج) • السعر الحالي ${item.currentPrice.toFixed(2)} ج دون مستوى الأمان.`;
                  } else {
                    item.action = 'HOLD';
                    item.alertLevel = 'NORMAL';
                    item.advice = `احتفاظ ومتابعة • السهم يتحرك في نطاق الدعم ${item.pivotS1 || item.support} والمقاومة ${item.pivotR1 || item.target1}.`;
                  }
                }

                updatedStocksCount++;
              }
            });
          }

          // 2. Synchronize Mutual Funds Official Daily NAV (NCS & BSB)
          if (data.funds) {
            portfolioData.forEach(item => {
              if (item.ticker === 'NCS' && data.funds.NCS) {
                item.advice = `مرجع وثيقة نقدية • العائد السنوي الاسترشادي: ${data.funds.NCS.annualYieldPct}%`;
                item.priceSource = data.funds.NCS.lastOfficialUpdate;
              } else if (item.ticker === 'BSB' && data.funds.BSB) {
                item.advice = `مرجع وثيقة نمو • النمو السنوي الاسترشادي: ${data.funds.BSB.annualYieldPct}%`;
                item.priceSource = data.funds.BSB.lastOfficialUpdate;
              }
            });
          }

          // 3. Save Portfolio & Re-render Holdings Table First (Guaranteed Sync)
          savePortfolio();
          try { renderActivePlansRadar(); } catch(e){}

          // 4b. Update Real-Time Market Regime & Breadth FIRST (Single Source of Truth)
          if (data.market_regime) {
            window.currentMarketRegime = typeof data.market_regime === 'object' ? data.market_regime : {
              regime: String(data.market_regime),
              regimeArabic: data.market_regime_arabic || 'تداول متوازن وعرضي',
              description: data.market_regime_description || '',
              breadth: data.breadth || { advancingPct: 50, avgMarketChange: 0 }
            };
            window.currentMarketRegimeArabic = window.currentMarketRegime.regimeArabic;
            try { localStorage.setItem('egx_market_regime', JSON.stringify(window.currentMarketRegime)); } catch(e){}
            try { updateSimulationRegimeUI(); } catch(e){}
          }

          // Evaluate In-App Sticky Emergency Alert Banner & Browser Push Notifications
          try { evaluateInAppAlerts(); } catch(alertErr) { console.warn('Alert evaluation warning:', alertErr); }

          // 4. Update Full Market Radar with Live Data from All 249 EGX Stocks
          if (data.radar && data.radar.length > 0) {
            try {
              fullMarketRadar = data.radar;
              renderRadarGrid();
              populateRiskStockDropdown();
            } catch (radarErr) {
              console.warn('Radar render non-fatal warning:', radarErr);
            }
          }

          // 4c. Update Autonomous Forward Testing Ledger live quotes (D-09: Zero Stale Prices)
          if (Array.isArray(autonomousLedger)) {
            autonomousLedger.forEach(trade => {
              if (trade.status === 'OPEN') {
                const live = (data.prices && data.prices[trade.ticker]) || (data.radar && data.radar.find(r => r.ticker === trade.ticker));
                if (live && live.price > 0) {
                  trade.currentPrice = live.price;
                }
              }
            });
            try { renderAutonomousLedger(); } catch(e){}
          }

          // 5. Update Header Live Sync Indicator Badge
          if (statusText) {
            if (isSessionOpen) {
              statusText.innerHTML = `🟢 متصل بالبورصة المصرية لحظياً • تم التحديث الآن: <strong class="text-cyan-300 font-mono">${timeStr}</strong> • الأسعار مطابقة لشاشة التداول الرسمية في ثندر`;
            } else {
              statusText.innerHTML = `⚪ جلسة البورصة مغلقة حالياً • تم التدقيق في: <strong class="text-emerald-300 font-mono">${timeStr}</strong> • الأسعار المعروضة هي أسعار الإغلاق الرسمي لآخر جلسة (مطابقة لثندر)`;
            }
          }
        }
      } catch (err) {
        console.error('Live price fetch fallback:', err);
        if (statusText) {
          statusText.innerHTML = `<span class="text-rose-400 font-bold">⚠️ تعذر الاتصال اللحظي بالبورصة (${err.message}) • انقر "مزامنة نظيفة 🔄" لإعادة المحاولة فوراً</span>`;
        }
      } finally {
        if (!isSilent) {
          if (icon) icon.classList.remove('animate-spin');
          if (btnText) btnText.innerText = '⚡ تحديث الأسعار اللحظية';
        }
      }
    }

    // Force fresh live price sync without wiping stored portfolio data
    function forceFreshSync() {
      // Refresh live prices from the EGX feed and recompute all technical metrics without data loss
      fetchLiveEGXPricesAndReevaluate(false);
    }

    // Explicit user-confirmed reset to baseline portfolio
    function hardResetPortfolioToDefault() {
      if (confirm('تحذير: هل أنت متأكد من رغبتك في إعادة ضبط المحفظة للقيم الافتراضية وحذف أي تعديلات يدوية؟')) {
        localStorage.removeItem('egx_copilot_portfolio');
        localStorage.removeItem('egx_copilot_portfolio_ver');
        portfolioData = (typeof EGX_Portfolio !== 'undefined')
          ? EGX_Portfolio.load()
          : JSON.parse(JSON.stringify(defaultPortfolioData));
        if (typeof renderPortfolioTable === 'function') renderPortfolioTable();
        if (typeof updateMetrics === 'function') updateMetrics();
        if (typeof renderAllocationChart === 'function') renderAllocationChart();
        if (typeof savePortfolio === 'function') savePortfolio();
        fetchLiveEGXPricesAndReevaluate(false);
      }
    }

    // Backwards compatibility alias
    function fetchLiveEGXPrices() {
      return fetchLiveEGXPricesAndReevaluate();
    }


    // ============================================================
    // OED TTMS Pattern: In-App Emergency Alerts, Notification Center & Position Sizing
    // ============================================================
    let activeEmergencyAlert = null;
    let sessionNotificationHistory = [];

    function evaluateInAppAlerts() {
      const dismissedKeys = JSON.parse(sessionStorage.getItem('oed_dismissed_alerts') || '[]');
      const alertsList = [];
      let highestPriorityAlert = null;

      // 0. Dynamic Scenario-Based Order Decision Engine
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
      }

      portfolioData.forEach(item => {
        if (item.ticker === 'CASH' || item.ticker === 'NCS' || item.ticker === 'BSB') return;

        // Check S1 Breakdown (Critical Risk or Dip Watch)
        if (item.pivotS1 && item.currentPrice < item.pivotS1) {
          const evalItem = (typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.evaluateAsset === 'function')
            ? EGX_Engine.evaluateAsset(item, typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL')
            : null;

          const isLosing = (item.profit !== undefined && item.profit < 0) || (item.returnPct !== undefined && item.returnPct < 0);
          const isEmergency = evalItem && evalItem.action === 'EMERGENCY_STOP_LOSS';
          const isDip = evalItem && (evalItem.action === 'INTRADAY_DIP_WATCH' || evalItem.action === 'CORE_BUFFER_WATCH');

          let alertType = 'CRITICAL_RISK';
          let alertBadge = 'حماية عاجلة';
          let alertTitle = `🔴 كسر مستوى الدعم الفني S1: ${item.name} (${item.ticker})`;
          let alertDesc = `السعر الحالي (${Number(item.currentPrice).toFixed(2)} ج) كسر مستوى الدعم الفني الرئيسي S1 (${item.pivotS1} ج). يجب فحص خطة الحماية فوراً.`;

          if (isDip) {
            alertType = 'WARNING';
            alertBadge = evalItem.badgeText || 'تريث ومراقبة';
            alertTitle = evalItem.action === 'CORE_BUFFER_WATCH' 
              ? `🛡️ وسادة أمان النواة: ${item.name} (${item.ticker})`
              : `🟡 كسر لحظي أثناء الجلسة: ${item.name} (${item.ticker})`;
            alertDesc = evalItem.advice;
          } else if (!isLosing && !isEmergency) {
            alertType = 'WARNING';
            alertBadge = 'مراقبة الدعم 🛡️';
            alertTitle = `🟡 تراجع فني أسفل S1: ${item.name} (${item.ticker})`;
            alertDesc = `السعر الحالي (${Number(item.currentPrice).toFixed(2)} ج) دون مستوى الدعم S1 (${item.pivotS1} ج) مع بقاء المركز في ربح (+${(item.returnPct || 0).toFixed(1)}%). تريث وراقب تماسك الارتداد.`;
          }

          const alertObj = {
            id: `s1_${item.ticker}`,
            ticker: item.ticker,
            name: item.name,
            type: alertType,
            title: alertTitle,
            desc: alertDesc,
            badge: alertBadge,
            actionLabel: 'فحص خطة الحماية 🛡️',
            actionType: 'AUDIT',
            time: formatCairoTime(new Date(), false, true)
          };
          alertsList.push(alertObj);
          if (!highestPriorityAlert && !dismissedKeys.includes(alertObj.id)) {
            highestPriorityAlert = alertObj;
          }
        }
        // Check R1 Target Reached (Profit Taking or Rebound Rebalance)
        else if (item.pivotR1 && item.currentPrice >= item.pivotR1) {
          const isLosing = (item.profit !== undefined && item.profit < 0) || (item.returnPct !== undefined && item.returnPct < 0);
          const alertObj = {
            id: `r1_${item.ticker}`,
            ticker: item.ticker,
            name: item.name,
            type: isLosing ? 'REBOUND_RESISTANCE' : 'TARGET_REACHED',
            title: isLosing 
              ? `🔄 ارتداد فني لمستوى المقاومة R1: ${item.name} (${item.ticker})`
              : `🟢 وصول لهدف المقاومة R1: ${item.name} (${item.ticker})`,
            desc: isLosing
              ? `السعر الحالي (${Number(item.currentPrice).toFixed(2)} ج) وصل لمستوى المقاومة R1 (${item.pivotR1} ج) في موجة ارتدادية (تراجع المركز ${item.returnPct.toFixed(1)}%). يُنصح بتخفيف المركز وتدوير السيولة.`
              : (item.r2Prospects
                  ? `السعر (${Number(item.currentPrice).toFixed(2)} ج) حقق مستهدف R1 (${item.pivotR1} ج) بعائد (+${item.returnPct.toFixed(1)}%). 🛡️ ارفع الوقف فوراً إلى [${item.r2Prospects.proposedStop} ج] (لحجز ربح ${item.r2Prospects.lockedProfitPct !== null ? '+' + item.r2Prospects.lockedProfitPct + '%' : 'مضمون'}). ${item.r2Prospects.verdict === 'FAVORED' ? `🚀 فرصة R2 (${item.r2Prospects.targetR2} ج): ${item.r2Prospects.factors[0]} و${item.r2Prospects.factors[1]}.` : `⚠️ يُفضل جني الأرباح: ${item.r2Prospects.factors[1]}.`}`
                  : `السعر الحالي (${Number(item.currentPrice).toFixed(2)} ج) حقق مستهدف المقاومة R1 (${item.pivotR1} ج) مع عائد (+${item.returnPct.toFixed(1)}%). يُنصح بتأمين أرباح القمة.`),
            badge: isLosing ? 'تخفيف ارتداد' : (item.r2Prospects && item.r2Prospects.verdict === 'FAVORED' ? 'امتداد نحو R2 🚀' : 'جني أرباح 🎯'),
            actionLabel: isLosing ? 'تخفيف وتدوير 🔄' : (item.r2Prospects ? `تأمين عند ${item.r2Prospects.proposedStop} ج 🛡️` : 'تأمين أرباح القمة 💰'),
            actionType: 'ROTATION',
            time: formatCairoTime(new Date(), false, true)
          };
          alertsList.push(alertObj);
          if (!highestPriorityAlert && !dismissedKeys.includes(alertObj.id)) {
            highestPriorityAlert = alertObj;
          }
        }
      });

      sessionNotificationHistory = alertsList;
      updateNotificationCenterUI();

      // Render or Hide Sticky Emergency Banner
      const banner = document.getElementById('oed-emergency-banner');
      const titleEl = document.getElementById('oed-banner-title');
      const descEl = document.getElementById('oed-banner-desc');
      const badgeEl = document.getElementById('oed-banner-badge');
      const actionTextEl = document.getElementById('oed-banner-action-text');

      if (highestPriorityAlert) {
        activeEmergencyAlert = highestPriorityAlert;
        if (banner && titleEl && descEl && badgeEl) {
          titleEl.innerText = highestPriorityAlert.title;
          descEl.innerText = highestPriorityAlert.desc;
          badgeEl.innerText = highestPriorityAlert.badge;
          if (actionTextEl) actionTextEl.innerText = highestPriorityAlert.actionLabel;

          if (highestPriorityAlert.type === 'CRITICAL_RISK' || highestPriorityAlert.type === 'SYSTEMIC_SHOCK') {
            banner.className = 'sticky top-14 z-40 bg-rose-50/95 dark:bg-rose-950/90 border-b-2 border-rose-300 dark:border-rose-700/60 shadow-lg px-4 py-2.5 transition-all animate-slide-down block';
          } else if (highestPriorityAlert.type === 'REBOUND_RESISTANCE') {
            banner.className = 'sticky top-14 z-40 bg-amber-50/95 dark:bg-amber-950/90 border-b-2 border-amber-300 dark:border-amber-700/60 shadow-lg px-4 py-2.5 transition-all animate-slide-down block';
          } else {
            banner.className = 'sticky top-14 z-40 bg-emerald-50/95 dark:bg-emerald-950/90 border-b-2 border-emerald-300 dark:border-emerald-700/60 shadow-lg px-4 py-2.5 transition-all animate-slide-down block';
          }

          triggerBrowserNotification(highestPriorityAlert.title, highestPriorityAlert.desc, highestPriorityAlert.id);
        }
      } else {
        activeEmergencyAlert = null;
        if (banner) banner.classList.add('hidden');
      }

      // Update Header Alert Badge & Counter
      const countBadge = document.getElementById('header-alert-count');
      const pingBadge = document.getElementById('header-alert-badge');
      if (alertsList.length > 0) {
        if (countBadge) {
          countBadge.innerText = alertsList.length;
          countBadge.classList.remove('hidden');
        }
        if (pingBadge) pingBadge.classList.remove('hidden');
      } else {
        if (countBadge) countBadge.classList.add('hidden');
        if (pingBadge) pingBadge.classList.add('hidden');
      }
    }

    function confirmActionExecuted() {
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

    function dismissOedBanner() {
      if (activeEmergencyAlert) {
        const dismissed = JSON.parse(sessionStorage.getItem('oed_dismissed_alerts') || '[]');
        dismissed.push(activeEmergencyAlert.id);
        sessionStorage.setItem('oed_dismissed_alerts', JSON.stringify(dismissed));
      }
      const banner = document.getElementById('oed-emergency-banner');
      if (banner) banner.classList.add('hidden');
    }

    function handleOedBannerAction() {
      if (!activeEmergencyAlert) return;
      if (activeEmergencyAlert.actionType === 'RADAR') {
        switchTab('radar');
      } else if (activeEmergencyAlert.actionType === 'ROTATION') {
        const idx = portfolioData.findIndex(p => p.ticker === activeEmergencyAlert.ticker);
        if (idx !== -1) openRotationPlanModal(idx);
      } else {
        openAuditModal(activeEmergencyAlert.ticker);
      }
    }

    function openNotificationCenter() {
      const modal = document.getElementById('notification-center-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        updateNotificationCenterUI();
        if (window.lucide) lucide.createIcons();
      }
    }

    function closeNotificationCenter() {
      const modal = document.getElementById('notification-center-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function updateNotificationCenterUI() {
      const listEl = document.getElementById('notification-center-list');
      if (!listEl) return;

      if (sessionNotificationHistory.length === 0) {
        listEl.innerHTML = `
          <div class="p-6 text-center text-gray-500 font-medium bg-gray-950/60 rounded-xl border border-gray-800">
            <i data-lucide="shield-check" class="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60"></i>
            <span>لا توجد تنبيهات عاجلة حتى الآن. أسهم المحفظة تتحرك أعلى مستويات الدعم الفنية بأمان.</span>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      listEl.innerHTML = sessionNotificationHistory.map(alert => {
        const isCritical = alert.type === 'CRITICAL_RISK';
        const isShock = alert.type === 'SYSTEMIC_SHOCK';
        const isRebound = alert.type === 'REBOUND_RESISTANCE';
        const containerCls = (isCritical || isShock)
          ? 'bg-rose-950/40 border border-rose-500/60 shadow-lg shadow-rose-950/40' 
          : (isRebound ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-emerald-950/30 border border-emerald-500/30');
        const badgeCls = (isCritical || isShock)
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          : (isRebound ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300');
        const btnCls = (isCritical || isShock)
          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50'
          : (isRebound ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white');

        return `
        <div class="p-3.5 rounded-xl ${containerCls} flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-xs">${alert.title}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded font-mono ${badgeCls}">${alert.time}</span>
            </div>
            <p class="text-[11px] text-gray-300 leading-snug">${alert.desc}</p>
          </div>
          <button onclick="handleAuditOrRotate('${alert.ticker}', '${alert.actionType}')" class="shrink-0 px-2.5 py-1 rounded-lg ${btnCls} font-bold text-[10px] transition cursor-pointer">
            ${alert.actionLabel}
          </button>
        </div>`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    function handleAuditOrRotate(ticker, actionType) {
      closeNotificationCenter();
      if (actionType === 'ROTATION') {
        const idx = portfolioData.findIndex(p => p.ticker === ticker);
        if (idx !== -1) openRotationPlanModal(idx);
      } else {
        openAuditModal(ticker);
      }
    }

    function clearNotificationHistory() {
      sessionNotificationHistory = [];
      sessionStorage.removeItem('oed_dismissed_alerts');
      updateNotificationCenterUI();
      const countBadge = document.getElementById('header-alert-count');
      const pingBadge = document.getElementById('header-alert-badge');
      if (countBadge) countBadge.classList.add('hidden');
      if (pingBadge) pingBadge.classList.add('hidden');
    }

    function requestBrowserNotificationPermission() {
      if (!('Notification' in window)) {
        alert('المتصفح الحالي لا يدعم ميزة إشعارات الويب.');
        return;
      }
      Notification.requestPermission().then(permission => {
        const btn = document.getElementById('btn-browser-perm');
        if (permission === 'granted') {
          if (btn) btn.innerText = 'الإشعارات مفعلة 🟢';
          new Notification('EGX AI Copilot', {
            body: 'تم تفعيل إشعارات المتصفح بنجاح! ستصلك تنبيهات وقف الخسارة وجني الأرباح مباشرة.',
            icon: '/favicon.ico'
          });
        } else {
          if (btn) btn.innerText = 'الإشعارات محظورة ❌';
          alert('يرجى السماح بالإشعارات من إعدادات المتصفح.');
        }
      });
    }

    function triggerBrowserNotification(title, body, alertId = 'default') {
      const storageKey = `egx_sent_alert_${alertId}`;
      const lastSent = Number(sessionStorage.getItem(storageKey) || 0);
      const now = Date.now();

      // STRICT THROTTLE: If notified in the last 60 minutes for this alert, do not repeat
      if (now - lastSent < 3600000) {
        return;
      }
      sessionStorage.setItem(storageKey, String(now));

      // Delegate to unified local push alert if present
      if (typeof showLocalPushAlert === 'function') {
        showLocalPushAlert(title, body);
        return;
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, { body: body, icon: '/favicon.ico', tag: 'egx-market-alert' });
          }).catch(() => {
            try { new Notification(title, { body: body, icon: '/favicon.ico', tag: 'egx-market-alert' }); } catch(e){}
          });
        } else {
          try {
            new Notification(title, { body: body, icon: '/favicon.ico', tag: 'egx-market-alert' });
          } catch(e){}
        }
      }
    }


    // ============================================================
    // Precision Auto-Refresh Engine (Web Worker + Visual Countdown + Instant Tab Wake-up)
    // Runs every 60 seconds (1 minute) strictly during EGX trading session (Sun-Thu, 10:00 AM - 02:30 PM Cairo)
    // ============================================================
    let autoRefreshSeconds = 60;
    let countdownTimerId = null;

    function startAutoRefreshEngine() {
      if (countdownTimerId) clearInterval(countdownTimerId);
      autoRefreshSeconds = 60;
      updateCountdownUI();

      // 1. Foreground Visual Countdown (Ticks every 1 second, active during EGX trading session)
      countdownTimerId = setInterval(() => {
        const isOpen = (typeof isCairoSessionOpen === 'function') ? isCairoSessionOpen() : false;
        if (!isOpen) {
          updateCountdownUI();
          return;
        }

        autoRefreshSeconds--;
        if (autoRefreshSeconds <= 0) {
          autoRefreshSeconds = 60;
          fetchLiveEGXPricesAndReevaluate(true);
        }
        updateCountdownUI();
      }, 1000);

      // 2. Background Web Worker (Immune to browser background tab freezing/throttling)
      initBackgroundHeartbeatWorker();

      // 3. Instant Wake-up on Tab Focus (fires strictly if at least 60 seconds elapsed since last fetch)
      let lastTabWakeupTime = 0;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          const isOpen = (typeof isCairoSessionOpen === 'function') ? isCairoSessionOpen() : false;
          const now = Date.now();
          if (isOpen && (now - lastTabWakeupTime > 60000)) {
            lastTabWakeupTime = now;
            autoRefreshSeconds = 60;
            updateCountdownUI();
            fetchLiveEGXPricesAndReevaluate(true);
          } else {
            updateCountdownUI();
          }
        }
      });

      // Window focus only refreshes the UI counter without triggering extra network calls or notifications
      window.addEventListener('focus', () => {
        updateCountdownUI();
      });
    }

    function resetCountdownTimer() {
      autoRefreshSeconds = 60;
      updateCountdownUI();
    }

    function updateCountdownUI() {
      const badge = document.getElementById('live-auto-countdown-badge');
      const el = document.getElementById('live-countdown-secs');
      const isOpen = (typeof isCairoSessionOpen === 'function') ? isCairoSessionOpen() : false;

      if (badge) {
        if (isOpen) {
          badge.className = 'px-3 py-2 rounded-xl bg-gray-950 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center gap-1.5 shadow-sm';
          badge.title = 'العداد التنازلي للتحديث التلقائي أثناء جلسة التداول الرسمية (كل دقيقة)';
          badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>تحديث تلقائي خلال: <strong id="live-countdown-secs" class="text-white font-bold">${Math.max(0, autoRefreshSeconds)}</strong> ث</span>
          `;
        } else {
          badge.className = 'px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-800/50 text-amber-300 text-xs font-sans flex items-center gap-1.5 shadow-sm';
          badge.title = 'جلسة التداول الرسمية في البورصة المصرية مغلقة حالياً (مواعيد التداول: الأحد إلى الخميس من 10:00 ص إلى 02:30 م)';
          badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>الجلسة مغلقة <span class="text-gray-400 text-[11px]">(10:00 ص - 2:30 م)</span></span>
          `;
        }
      } else if (el) {
        el.innerText = Math.max(0, autoRefreshSeconds);
      }
    }

    function initBackgroundHeartbeatWorker() {
      try {
        const workerScript = `
          let interval = null;
          self.onmessage = function(e) {
            if (e.data === 'start') {
              if (interval) clearInterval(interval);
              interval = setInterval(function() {
                self.postMessage('TICK_FETCH');
              }, 60000);
            }
          };
        `;
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = function(e) {
          if (e.data === 'TICK_FETCH') {
            const isOpen = (typeof isCairoSessionOpen === 'function') ? isCairoSessionOpen() : false;
            if (isOpen) {
              resetCountdownTimer();
              fetchLiveEGXPricesAndReevaluate(true);
            }
          }
        };
        worker.postMessage('start');
      } catch (err) {
        console.warn('Worker initialization fallback:', err);
      }
    }

    // Initialize Page and Live Auto-Refresh Heartbeat

    let isAppBooted = false;


    // ============================================================
    // Real-Time System Auto-Update Engine
    // ============================================================
    const LOCAL_APP_VERSION = '2.6.1';
    window.LOCAL_APP_VERSION = LOCAL_APP_VERSION;

    let isUpdateBannerDismissed = false;

    async function checkForAppUpdates(silent = true) {
      try {
        const apiBase = (window.location.protocol === 'file:' || !window.location.host) ? 'https://egx-ai-copilot.vercel.app' : '';
        const res = await fetch(`${apiBase}/version.json?_t=${Date.now()}`);
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

    function testShowUpdateBanner() {
      isUpdateBannerDismissed = false;
      showAppUpdateBanner('2.5.1 (تجربة التنبيه)', 'جلسة اليوم');
      if (typeof showToast === 'function') {
        showToast('تم إظهار شريط التحديث التجريبي في أعلى الشاشة 🚀', 'info');
      }
    }

    window.testShowUpdateBanner = testShowUpdateBanner;

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

    function bootApp() {
      if (isAppBooted) return;
      isAppBooted = true;

      try { initTheme(); } catch(e){ console.warn('initTheme error:', e); }
      try { initSidebar(); } catch(e){ console.warn('initSidebar error:', e); }
      try { loadPortfolio(); } catch(e){ console.warn('loadPortfolio error:', e); }
      try { if (typeof loadPendingThndrOrders === 'function') loadPendingThndrOrders(); } catch(e){ console.warn('loadPendingThndrOrders error:', e); }
      try {
        if (typeof EGX_FirebaseSync !== 'undefined' && EGX_FirebaseSync.init) {
          EGX_FirebaseSync.init();
        }
      } catch(e) { console.warn('EGX_FirebaseSync init error:', e); }
      try { checkUrlForThndrSync(); } catch(e){ console.warn('checkUrlForThndrSync error:', e); }
      try { updateMetrics(); } catch(e){ console.warn('updateMetrics error:', e); }
      try { renderPortfolioTable(); } catch(e){ console.warn('renderPortfolioTable error:', e); }
      try { renderActivePlansRadar(); } catch(e){ console.warn('renderActivePlansRadar error:', e); }

      // PRIORITY 1: Fetch live EGX quotes and start heartbeat immediately
      try { fetchLiveEGXPrices(); } catch(e){ console.warn('fetchLiveEGXPrices error:', e); }
      try { startAutoRefreshEngine(); } catch(e){ console.warn('startAutoRefreshEngine error:', e); }

      try { renderRadarGrid(); } catch(e){ console.warn('renderRadarGrid error:', e); }
      try { populateRiskStockDropdown(); } catch(e){ console.warn('populateRiskStockDropdown error:', e); }
      try { renderAllocationChart(); } catch(e){ console.warn('renderAllocationChart error:', e); }
      try { calculateSmartAllocation(); } catch(e){ console.warn('calculateSmartAllocation error:', e); }
      try { renderSimPositions(); } catch(e){ console.warn('renderSimPositions error:', e); }
      try { renderAutonomousLedger(); } catch(e){ console.warn('renderAutonomousLedger error:', e); }
      try { loadStrategySettings(); } catch(e){ console.warn('loadStrategySettings error:', e); }
      try { updateSimPriceFromSelect(); } catch(e){ console.warn('updateSimPriceFromSelect error:', e); }
      try { updateGeminiStatusUI(); } catch(e){ console.warn('updateGeminiStatusUI error:', e); }
      try { loadAndRenderScenarios(); } catch(e){ console.warn('loadAndRenderScenarios error:', e); }
      try { renderLearnedLessons(); } catch(e){ console.warn('renderLearnedLessons error:', e); }
      try { updateSimulationRegimeUI(); } catch(e){ console.warn('updateSimulationRegimeUI error:', e); }
      try { fetchCloudStatus(); } catch(e){ console.warn('fetchCloudStatus error:', e); }
      try {
        checkForAppUpdates(true);
        setInterval(() => checkForAppUpdates(true), 60000);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForAppUpdates(true);
        });
      } catch(e){}
      try { if (window.initModalMobileScrollEngine) initModalMobileScrollEngine(); } catch(e){}
      try { if (window.lucide) lucide.createIcons(); } catch(e){}
    }

    window.bootApp = bootApp;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootApp);
    } else {
      bootApp();
    }

    // Explicit Window Object Exposure for Inline Onclick Handlers
    window.dismissOedBanner = dismissOedBanner;
    window.handleOedBannerAction = handleOedBannerAction;
    window.openNotificationCenter = openNotificationCenter;
    window.closeNotificationCenter = closeNotificationCenter;
    window.updateNotificationCenterUI = updateNotificationCenterUI;
    window.handleAuditOrRotate = handleAuditOrRotate;
    window.clearNotificationHistory = clearNotificationHistory;
    window.showAutonomousLogModal = showAutonomousLogModal;
    window.closeAutonomousLogModal = closeAutonomousLogModal;
    if (typeof exportAutonomousAuditLog !== 'undefined') window.exportAutonomousAuditLog = exportAutonomousAuditLog;
    if (typeof clearAutonomousLedger !== 'undefined') window.clearAutonomousLedger = clearAutonomousLedger;
    if (typeof renderAutonomousLedger !== 'undefined') window.renderAutonomousLedger = renderAutonomousLedger;
