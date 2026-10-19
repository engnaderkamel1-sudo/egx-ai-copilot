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

      if (ltLabel) ltLabel.innerText = `Ø§Ø³ØªØ«Ù…Ø§Ø± Ø·ÙˆÙŠÙ„: ${longTermPct}%`;
      if (tacLabel) tacLabel.innerText = `Ø·ÙØ±Ø§Øª Ø³Ø±ÙŠØ¹Ø©: ${tacticalPct}%`;
      if (ltVal) ltVal.innerText = `${longTermVal.toLocaleString('en-US')} Ø¬.Ù… (${longTermPct}%)`;
      if (tacVal) tacVal.innerText = `${tacticalVal.toLocaleString('en-US')} Ø¬.Ù… (${tacticalPct}%)`;
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
      alert('âœ… ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ø­ÙØ¸Ø© ÙˆÙ†Ø³Ø¨ Ø§Ù„Ø£Ù…Ø§Ù† Ø¨Ù†Ø¬Ø§Ø­! Ø³ÙŠØªÙ… ØªØ·Ø¨ÙŠÙ‚Ù‡Ø§ ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø­ÙØ¸Ø©.');
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
            timestampEl.innerText = `${data.cairo_time} â€¢ Ø³ÙŠØ±ÙØ± Vercel Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ Ù†Ø´Ø·`;
          }
          if (modalTimeEl) {
            modalTimeEl.innerText = `Ø¢Ø®Ø± ØªØ´ØºÙŠÙ„: ${data.cairo_time}`;
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
        timestampEl.innerText = `Ø§Ù„ÙŠÙˆÙ… ${timeStr} Ø¨ØªÙˆÙ‚ÙŠØª Ø§Ù„Ù‚Ø§Ù‡Ø±Ø© (Ø³ÙŠØ±ÙØ±Ø§Øª Vercel Edge)`;
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
            timestampEl.innerText = `${data.cairo_time} â€¢ ÙØ­Øµ ÙÙˆØ±ÙŠ Ù…ÙƒØªÙ…Ù„`;
          }
          if (data.autonomous_findings) {
            renderAutonomousFindings(data.autonomous_findings);
          }
          alert('âœ… ØªÙ… ØªØ´ØºÙŠÙ„ Ø§Ù„ÙØ­Øµ Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªØ­Ø¯ÙŠØ« ÙƒØ§ÙØ© Ø§Ù„ØªÙˆØµÙŠØ§Øª Ø§Ù„Ø±Ù‚Ø§Ø¨ÙŠØ© ÙÙŠ Ø§Ù„Ø³Ø­Ø§Ø¨!');
        } else {
          fallbackLocalTimestamp();
          alert('âœ… ØªÙ… Ø·Ù„Ø¨ Ø§Ù„ÙØ­Øµ Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø¨Ù†Ø¬Ø§Ø­.');
        }
      } catch (err) {
        fallbackLocalTimestamp();
        alert('âœ… ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ÙØ­Øµ Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ ÙˆÙ…Ø·Ø§Ø¨Ù‚Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø­ÙØ¸Ø©.');
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
        if (btnText) btnText.innerText = 'Ø¬Ø§Ø±ÙŠ Ø³Ø­Ø¨ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§ØªØ®Ø§Ø° Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª...';
        if (statusText) statusText.innerHTML = '<span class="text-cyan-400 font-bold animate-pulse">â³ Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„Ù…ØµØ±ÙŠØ© ÙˆØ³Ø­Ø¨ Ø£Ø­Ø¯Ø« Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ù„Ø­Ø¸ÙŠØ© ÙˆØ¥Ø¹Ø§Ø¯Ø© ØªÙ‚ÙŠÙŠÙ… ÙƒØ§ÙØ© Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª...</span>';
      }

      try {
        const apiBase = (window.location.protocol === 'file:' || !window.location.host) 
          ? 'https://egx-ai-copilot.vercel.app' 
          : '';
        const res = await fetch(`${apiBase}/api/prices?include_radar=true&_t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!res.ok) throw new Error(`Ø³ÙŠØ±ÙØ± Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø±Ø¯ Ø¨Ø±Ù…Ø² ${res.status}`);
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
                item.priceSource = isSessionOpen ? 'Ø´Ø§Ø´Ø© Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„Ù„Ø­Ø¸ÙŠØ© (ØªØ¯Ø§ÙˆÙ„ Ù…Ø¨Ø§Ø´Ø±)' : 'Ø¢Ø®Ø± Ø¥ØºÙ„Ø§Ù‚ Ø±Ø³Ù…ÙŠ Ù„Ù„Ø¨ÙˆØ±ØµØ©';
                
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

                if (item.shares && item.shares > 0) {
                  item.value = Math.round(item.shares * item.currentPrice);
                  if (item.buyPrice) {
                    const cost = item.shares * item.buyPrice;
                    item.profit = Math.round(item.value - cost);
                    item.returnPct = cost > 0 ? parseFloat(((item.profit / cost) * 100).toFixed(2)) : 0;
                    item.status = item.profit >= 0 ? 'Ø±Ø¨Ø­' : 'ØªØ±Ø§Ø¬Ø¹';
                  }
                }

                // Mathematical Technical Decision Engine (Zero Fake Data)
                item.decisionUpdatedAt = cairoTime;
                item.decisionBasis = `Ø³Ø¹Ø± Ø§Ù„Ø¨ÙˆØ±ØµØ©: ${item.currentPrice.toFixed(2)} Ø¬ | Ù…Ù‚Ø§ÙˆÙ…Ø© R1: ${item.pivotR1 || '--'} Ø¬ | Ø¯Ø¹Ù… S1: ${item.pivotS1 || '--'} Ø¬`;

                // 1. Target 1 Reached (Pivot R1 Hit)
                if (item.pivotR1 && item.currentPrice >= item.pivotR1) {
                  const isLosing = (item.profit !== undefined && item.profit < 0) || (item.returnPct !== undefined && item.returnPct < 0);
                  item.action = 'REBALANCE_CANDIDATE';
                  item.alertLevel = isLosing ? 'REBOUND_RESISTANCE' : 'TARGET_HIT';
                  if (isLosing) {
                    item.advice = `ðŸ”„ Ø§Ø±ØªØ¯Ø§Ø¯ ÙÙ†ÙŠ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© R1 (${item.pivotR1} Ø¬) â€¢ Ø³Ù‡Ù… ${item.name} ÙŠØ®ØªØ¨Ø± Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© Ø¨ØªØ±Ø§Ø¬Ø¹ (${item.returnPct.toFixed(1)}%). ÙØ±ØµØ© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„ØªØ®ÙÙŠÙ Ø§Ù„Ù…Ø±ÙƒØ² ÙˆØªØ¯ÙˆÙŠØ± Ø§Ù„Ø³ÙŠÙˆÙ„Ø© Ù„Ø£ØµÙ„ Ø£Ø³Ø±Ø¹ Ù†Ù…ÙˆØ§Ù‹.`;
                  } else {
                    item.advice = `ðŸŽ¯ ÙˆØµÙˆÙ„ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ø£ÙˆÙ„Ù‰ R1 (${item.pivotR1} Ø¬) â€¢ Ø³Ù‡Ù… ${item.name} ÙÙŠ Ù…Ù†Ø·Ù‚Ø© Ø¬Ù†ÙŠ Ø£Ø±Ø¨Ø§Ø­ Ø§Ù„Ù‚Ù…Ø© (+${item.returnPct.toFixed(1)}%). ÙŠÙÙ†ØµØ­ Ø¨ØªØ£Ù…ÙŠÙ† Ø£Ø±Ø¨Ø§Ø­ Ø¬Ø²Ø¦ÙŠØ© ÙˆØ¥Ø¹Ø§Ø¯Ø© ØªØ¯ÙˆÙŠØ± Ø§Ù„Ø³ÙŠÙˆÙ„Ø©.`;
                  }
                }
                // 2. Critical Support Breakdown (Pivot S1 Broken - Stop Loss Trigger)
                else if (item.pivotS1 && item.currentPrice < item.pivotS1) {
                  item.action = 'STOP_LOSS_WARNING';
                  item.alertLevel = 'CRITICAL_RISK';
                  item.advice = `âš ï¸ ÙƒØ³Ø± Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ S1 (${item.pivotS1} Ø¬) â€¢ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ ${item.currentPrice.toFixed(2)} Ø¬ Ø¯ÙˆÙ† Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø£Ù…Ø§Ù†. Ø±Ø§Ù‚Ø¨ ØªÙØ¹ÙŠÙ„ Ø®Ø·Ø© Ø§Ù„Ø­Ù…Ø§ÙŠØ© Ù„ØªØ¬Ù†Ø¨ Ø§Ù†Ø²Ù„Ø§Ù‚ Ø³Ø¹Ø±ÙŠ.`;
                }
                // 3. Oversold Bounce on Support S1 (with mandatory Systemic Shock check)
                else if (item.rsi < 36 && item.pivotS1 && item.currentPrice >= item.pivotS1) {
                  if (getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {
                    item.action = 'HOLD';
                    item.alertLevel = 'WARNING';
                    item.advice = `âš ï¸ ØªØ´Ø¨Ø¹ Ø¨ÙŠØ¹ÙŠ (RSI: ${item.rsi}) Ù„ÙƒÙ† Ø§Ù„Ø³ÙˆÙ‚ ÙÙŠ Ø­Ø§Ù„Ø© Ù‡Ø¨ÙˆØ· Ø°Ø¹Ø±ÙŠ Ø´Ø§Ù…Ù„Ø› ÙŠÙØ­Ø¸Ø± Ø§Ù„ØªØ¬Ù…ÙŠØ¹ Ø§Ù„Ø¢Ù† ÙˆÙŠÙÙØ¶Ù„ Ø§Ù„ØªØ±ÙŠØ« ÙˆØ§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„ÙƒØ§Ø´.`;
                  } else {
                    item.action = 'ACCUMULATE';
                    item.alertLevel = 'ACCUMULATE';
                    item.advice = `ðŸŸ¢ Ø§Ø±ØªØ¯Ø§Ø¯ Ù…Ù† ØªØ´Ø¨Ø¹ Ø¨ÙŠØ¹ÙŠ (RSI: ${item.rsi}) Ø£Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ S1 (${item.pivotS1} Ø¬) â€¢ ÙØ±ØµØ© ØªØ¹Ø²ÙŠØ² Ù„Ù„Ù…Ø³ØªØ«Ù…Ø± Ø·ÙˆÙŠÙ„ Ø§Ù„Ø£Ø¬Ù„ Ù„Ø®ÙØ¶ Ù…ØªÙˆØ³Ø· Ø§Ù„ØªÙƒÙ„ÙØ©.`;
                  }
                }
                // 4. Bullish Trend Continuation (Above SMA 50)
                else if (item.sma50 && item.currentPrice > item.sma50 && item.returnPct > 0) {
                  item.action = 'HOLD';
                  item.alertLevel = 'NORMAL';
                  item.advice = `ðŸ“ˆ Ø§ØªØ¬Ø§Ù‡ ØµØ§Ø¹Ø¯ ØµØ­ÙŠ Ø£Ø¹Ù„Ù‰ Ù…ØªÙˆØ³Ø· 50 ÙŠÙˆÙ… (${item.sma50} Ø¬) â€¢ Ù†Ù…Ùˆ (+${item.returnPct.toFixed(1)}%)ØŒ Ø§Ø­ØªÙØ§Ø¸ Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠ Ù‡Ø§Ø¯Ø¦ Ù…Ø³ØªÙ‡Ø¯ÙØ§Ù‹ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© ${item.pivotR1 || item.target1} Ø¬.`;
                }
                // 5. Default Strategic Hold
                else {
                  item.action = 'HOLD';
                  item.alertLevel = 'NORMAL';
                  item.advice = `Ø§Ø­ØªÙØ§Ø¸ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© â€¢ Ø§Ù„Ø³Ù‡Ù… ÙŠØªØ­Ø±Ùƒ ÙÙŠ Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¯Ø¹Ù… ${item.pivotS1 || item.support} ÙˆØ§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© ${item.pivotR1 || item.target1}.`;
                }

                updatedStocksCount++;
              }
            });
          }

          // 2. Synchronize Mutual Funds Official Daily NAV (NCS & BSB)
          if (data.funds) {
            portfolioData.forEach(item => {
              if (item.ticker === 'NCS' && data.funds.NCS) {
                item.advice = `Ù…Ø±Ø¬Ø¹ ÙˆØ«ÙŠÙ‚Ø© Ù†Ù‚Ø¯ÙŠØ© â€¢ Ø§Ù„Ø¹Ø§Ø¦Ø¯ Ø§Ù„Ø³Ù†ÙˆÙŠ Ø§Ù„Ø§Ø³ØªØ±Ø´Ø§Ø¯ÙŠ: ${data.funds.NCS.annualYieldPct}%`;
                item.priceSource = data.funds.NCS.lastOfficialUpdate;
              } else if (item.ticker === 'BSB' && data.funds.BSB) {
                item.advice = `Ù…Ø±Ø¬Ø¹ ÙˆØ«ÙŠÙ‚Ø© Ù†Ù…Ùˆ â€¢ Ø§Ù„Ù†Ù…Ùˆ Ø§Ù„Ø³Ù†ÙˆÙŠ Ø§Ù„Ø§Ø³ØªØ±Ø´Ø§Ø¯ÙŠ: ${data.funds.BSB.annualYieldPct}%`;
                item.priceSource = data.funds.BSB.lastOfficialUpdate;
              }
            });
          }

          // 3. Save Portfolio & Re-render Holdings Table First (Guaranteed Sync)
          savePortfolio();
          try { renderActivePlansRadar(); } catch(e){}

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

          // 4b. Update Real-Time Market Regime & Breadth
          if (data.market_regime) {
            window.currentMarketRegime = typeof data.market_regime === 'object' ? data.market_regime : {
              regime: String(data.market_regime),
              regimeArabic: data.market_regime_arabic || 'ØªØ¯Ø§ÙˆÙ„ Ù…ØªÙˆØ§Ø²Ù† ÙˆØ¹Ø±Ø¶ÙŠ',
              description: '',
              breadth: { advancingPct: 50, avgMarketChange: 0 }
            };
            window.currentMarketRegimeArabic = window.currentMarketRegime.regimeArabic;
            try { updateSimulationRegimeUI(); } catch(e){}
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
              statusText.innerHTML = `ðŸŸ¢ Ù…ØªØµÙ„ Ø¨Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„Ù…ØµØ±ÙŠØ© Ù„Ø­Ø¸ÙŠØ§Ù‹ â€¢ ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¢Ù†: <strong class="text-cyan-300 font-mono">${timeStr}</strong> â€¢ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ø´Ø§Ø´Ø© Ø§Ù„ØªØ¯Ø§ÙˆÙ„ Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙÙŠ Ø«Ù†Ø¯Ø±`;
            } else {
              statusText.innerHTML = `âšª Ø¬Ù„Ø³Ø© Ø§Ù„Ø¨ÙˆØ±ØµØ© Ù…ØºÙ„Ù‚Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ â€¢ ØªÙ… Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙÙŠ: <strong class="text-emerald-300 font-mono">${timeStr}</strong> â€¢ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ù‡ÙŠ Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ø¢Ø®Ø± Ø¬Ù„Ø³Ø© (Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ø«Ù†Ø¯Ø±)`;
            }
          }
        }
      } catch (err) {
        console.error('Live price fetch fallback:', err);
        if (statusText) {
          statusText.innerHTML = `<span class="text-rose-400 font-bold">âš ï¸ ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø§Ù„Ù„Ø­Ø¸ÙŠ Ø¨Ø§Ù„Ø¨ÙˆØ±ØµØ© (${err.message}) â€¢ Ø§Ù†Ù‚Ø± "Ù…Ø²Ø§Ù…Ù†Ø© Ù†Ø¸ÙŠÙØ© ðŸ”„" Ù„Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© ÙÙˆØ±Ø§Ù‹</span>`;
        }
      } finally {
        if (!isSilent) {
          if (icon) icon.classList.remove('animate-spin');
          if (btnText) btnText.innerText = 'âš¡ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ù„Ø­Ø¸ÙŠØ©';
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
      if (confirm('ØªØ­Ø°ÙŠØ±: Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· Ø§Ù„Ù…Ø­ÙØ¸Ø© Ù„Ù„Ù‚ÙŠÙ… Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© ÙˆØ­Ø°Ù Ø£ÙŠ ØªØ¹Ø¯ÙŠÙ„Ø§Øª ÙŠØ¯ÙˆÙŠØ©ØŸ')) {
        localStorage.removeItem('egx_copilot_portfolio');
        localStorage.removeItem('egx_copilot_portfolio_ver');
        portfolioData = (typeof EGX_Portfolio !== 'undefined')
          ? EGX_Portfolio.load()
          : JSON.parse(JSON.stringify(defaultPortfolioData));
        if (typeof renderPortfolioTable === 'function') renderPortfolioTable();
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

      // 0. Check Systemic Market Shock Alert (Flash crash protection)
      if (getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {
        const shockAlert = {
          id: `shock_systemic_alert`,
          ticker: 'EGX',
          name: 'Ø³ÙˆÙ‚ Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„Ù…ØµØ±ÙŠØ©',
          type: 'SYSTEMIC_SHOCK',
          title: `âš ï¸ ØªØ­Ø°ÙŠØ± Ù‡Ø¨ÙˆØ· Ø°Ø¹Ø±ÙŠ Ø´Ø§Ù…Ù„ (Systemic Shock Alert)`,
          desc: `Ø£ÙƒØ«Ø± Ù…Ù† 80% Ù…Ù† Ø£Ø³Ù‡Ù… Ø§Ù„Ø³ÙˆÙ‚ ÙÙŠ Ù…Ø³Ø§Ø± Ù‡Ø§Ø¨Ø· Ø£Ùˆ ØªØ±Ø§Ø¬Ø¹ Ø§Ù„Ù…Ø¤Ø´Ø± Ø¨Ø£ÙƒØ«Ø± Ù…Ù† -3.0%. ØªÙ… ØªØ¬Ù…ÙŠØ¯ Ø¥Ø´Ø§Ø±Ø§Øª Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¹Ù†Ø¯ Ø§Ù„Ø¯Ø¹ÙˆÙ… ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø³ÙŠÙˆÙ„Ø©.`,
          badge: 'ØªØ¬Ù…ÙŠØ¯ Ø§Ù„Ø´Ø±Ø§Ø¡',
          actionLabel: 'Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø±Ø§Ø¯Ø§Ø± ðŸ›¡ï¸',
          actionType: 'RADAR',
          time: formatCairoTime(new Date(), false, true)
        };
        alertsList.push(shockAlert);
        if (!highestPriorityAlert && !dismissedKeys.includes(shockAlert.id)) {
          highestPriorityAlert = shockAlert;
        }
      }

      portfolioData.forEach(item => {
        if (item.ticker === 'CASH' || item.ticker === 'NCS' || item.ticker === 'BSB') return;

        // Check S1 Breakdown (Critical Risk)
        if (item.pivotS1 && item.currentPrice < item.pivotS1) {
          const alertObj = {
            id: `s1_${item.ticker}_${Math.round(item.currentPrice)}`,
            ticker: item.ticker,
            name: item.name,
            type: 'CRITICAL_RISK',
            title: `ðŸ”´ ÙƒØ³Ø± Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ S1: ${item.name} (${item.ticker})`,
            desc: `Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ (${Number(item.currentPrice).toFixed(2)} Ø¬) ÙƒØ³Ø± Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ S1 (${item.pivotS1} Ø¬). ÙŠØ¬Ø¨ ÙØ­Øµ Ø®Ø·Ø© Ø§Ù„Ø­Ù…Ø§ÙŠØ© ÙÙˆØ±Ø§Ù‹.`,
            badge: 'Ø­Ù…Ø§ÙŠØ© Ø¹Ø§Ø¬Ù„Ø©',
            actionLabel: 'ÙØ­Øµ Ø®Ø·Ø© Ø§Ù„Ø­Ù…Ø§ÙŠØ© ðŸ›¡ï¸',
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
            id: `r1_${item.ticker}_${Math.round(item.currentPrice)}`,
            ticker: item.ticker,
            name: item.name,
            type: isLosing ? 'REBOUND_RESISTANCE' : 'TARGET_REACHED',
            title: isLosing 
              ? `ðŸ”„ Ø§Ø±ØªØ¯Ø§Ø¯ ÙÙ†ÙŠ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© R1: ${item.name} (${item.ticker})`
              : `ðŸŸ¢ ÙˆØµÙˆÙ„ Ù„Ù‡Ø¯Ù Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© R1: ${item.name} (${item.ticker})`,
            desc: isLosing
              ? `Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ (${Number(item.currentPrice).toFixed(2)} Ø¬) ÙˆØµÙ„ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© R1 (${item.pivotR1} Ø¬) ÙÙŠ Ù…ÙˆØ¬Ø© Ø§Ø±ØªØ¯Ø§Ø¯ÙŠØ© (ØªØ±Ø§Ø¬Ø¹ Ø§Ù„Ù…Ø±ÙƒØ² ${item.returnPct.toFixed(1)}%). ÙŠÙÙ†ØµØ­ Ø¨ØªØ®ÙÙŠÙ Ø§Ù„Ù…Ø±ÙƒØ² ÙˆØªØ¯ÙˆÙŠØ± Ø§Ù„Ø³ÙŠÙˆÙ„Ø©.`
              : `Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ (${Number(item.currentPrice).toFixed(2)} Ø¬) Ø­Ù‚Ù‚ Ù…Ø³ØªÙ‡Ø¯Ù Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© R1 (${item.pivotR1} Ø¬) Ù…Ø¹ Ø¹Ø§Ø¦Ø¯ (+${item.returnPct.toFixed(1)}%). ÙŠÙÙ†ØµØ­ Ø¨ØªØ£Ù…ÙŠÙ† Ø£Ø±Ø¨Ø§Ø­ Ø§Ù„Ù‚Ù…Ø©.`,
            badge: isLosing ? 'ØªØ®ÙÙŠÙ Ø§Ø±ØªØ¯Ø§Ø¯' : 'Ø¬Ù†ÙŠ Ø£Ø±Ø¨Ø§Ø­',
            actionLabel: isLosing ? 'ØªØ®ÙÙŠÙ ÙˆØªØ¯ÙˆÙŠØ± ðŸ”„' : 'ØªØ£Ù…ÙŠÙ† Ø£Ø±Ø¨Ø§Ø­ Ø§Ù„Ù‚Ù…Ø© ðŸ’°',
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
            banner.className = 'sticky top-14 z-40 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white border-b-2 border-rose-500 shadow-2xl px-4 py-2.5 transition-all animate-slide-down block';
          } else if (highestPriorityAlert.type === 'REBOUND_RESISTANCE') {
            banner.className = 'sticky top-14 z-40 bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 text-white border-b-2 border-amber-500 shadow-2xl px-4 py-2.5 transition-all animate-slide-down block';
          } else {
            banner.className = 'sticky top-14 z-40 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white border-b-2 border-emerald-500 shadow-2xl px-4 py-2.5 transition-all animate-slide-down block';
          }

          triggerBrowserNotification(highestPriorityAlert.title, highestPriorityAlert.desc);
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
      if (activeEmergencyAlert.actionType === 'ROTATION') {
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
            <span>Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø¹Ø§Ø¬Ù„Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†. Ø£Ø³Ù‡Ù… Ø§Ù„Ù…Ø­ÙØ¸Ø© ØªØªØ­Ø±Ùƒ Ø£Ø¹Ù„Ù‰ Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠØ© Ø¨Ø£Ù…Ø§Ù†.</span>
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
        alert('Ø§Ù„Ù…ØªØµÙØ­ Ø§Ù„Ø­Ø§Ù„ÙŠ Ù„Ø§ ÙŠØ¯Ø¹Ù… Ù…ÙŠØ²Ø© Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„ÙˆÙŠØ¨.');
        return;
      }
      Notification.requestPermission().then(permission => {
        const btn = document.getElementById('btn-browser-perm');
        if (permission === 'granted') {
          if (btn) btn.innerText = 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù…ÙØ¹Ù„Ø© ðŸŸ¢';
          new Notification('EGX AI Copilot', {
            body: 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ù…ØªØµÙØ­ Ø¨Ù†Ø¬Ø§Ø­! Ø³ØªØµÙ„Ùƒ ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙˆÙ‚Ù Ø§Ù„Ø®Ø³Ø§Ø±Ø© ÙˆØ¬Ù†ÙŠ Ø§Ù„Ø£Ø±Ø¨Ø§Ø­ Ù…Ø¨Ø§Ø´Ø±Ø©.',
            icon: '/favicon.ico'
          });
        } else {
          if (btn) btn.innerText = 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù…Ø­Ø¸ÙˆØ±Ø© âŒ';
          alert('ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØµÙØ­.');
        }
      });
    }

    function triggerBrowserNotification(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body: body, icon: '/favicon.ico' });
        } catch(e){}
      }
    }


    // ============================================================
    // Precision Auto-Refresh Engine (Web Worker + Visual Countdown + Instant Tab Wake-up)
    // ============================================================
    let autoRefreshSeconds = 30;
    let countdownTimerId = null;

    function startAutoRefreshEngine() {
      if (countdownTimerId) clearInterval(countdownTimerId);
      autoRefreshSeconds = 30;
      updateCountdownUI();

      // 1. Foreground Visual Countdown (Ticks every 1 second)
      countdownTimerId = setInterval(() => {
        autoRefreshSeconds--;
        if (autoRefreshSeconds <= 0) {
          autoRefreshSeconds = 30;
          fetchLiveEGXPricesAndReevaluate(true);
        }
        updateCountdownUI();
      }, 1000);

      // 2. Background Web Worker (Immune to browser background tab freezing/throttling)
      initBackgroundHeartbeatWorker();

      // 3. Instant Wake-up on Tab Focus (fires the exact millisecond user returns to browser)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          autoRefreshSeconds = 30;
          updateCountdownUI();
          fetchLiveEGXPricesAndReevaluate(false);
        }
      });

      window.addEventListener('focus', () => {
        autoRefreshSeconds = 30;
        updateCountdownUI();
        fetchLiveEGXPricesAndReevaluate(false);
      });
    }

    function resetCountdownTimer() {
      autoRefreshSeconds = 30;
      updateCountdownUI();
    }

    function updateCountdownUI() {
      const el = document.getElementById('live-countdown-secs');
      if (el) el.innerText = Math.max(0, autoRefreshSeconds);
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
              }, 30000);
            }
          };
        `;
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = function(e) {
          if (e.data === 'TICK_FETCH') {
            resetCountdownTimer();
            fetchLiveEGXPricesAndReevaluate(true);
          }
        };
        worker.postMessage('start');
      } catch (err) {
        console.warn('Worker initialization fallback:', err);
      }
    }

    // Initialize Page and Live Auto-Refresh Heartbeat

    let isAppBooted = false;

    function bootApp() {
      if (isAppBooted) return;
      isAppBooted = true;

      try { initTheme(); } catch(e){ console.warn('initTheme error:', e); }
      try { initSidebar(); } catch(e){ console.warn('initSidebar error:', e); }
      try { loadPortfolio(); } catch(e){ console.warn('loadPortfolio error:', e); }
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
      try { if (window.lucide) lucide.createIcons(); } catch(e){}
    }

    window.bootApp = bootApp;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootApp);
    } else {
      bootApp();
    }
