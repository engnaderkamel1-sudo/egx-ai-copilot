/**
 * EGX AI Copilot - Trading & Execution Layer (js/trade.js)
 * Real-time buy/sell orders, Thndr sync/import, fine-tuning, position sizing, and paper trading.
 */

    // Modal Operations
    function recalcAssetModal() {
      const shares = Math.max(0, parseInt(document.getElementById('modal-shares').value, 10) || 0);
      const currentPrice = Math.max(0, parseFloat(document.getElementById('modal-current-price').value) || 0);
      const buyPrice = Math.max(0, parseFloat(document.getElementById('modal-buy-price').value) || 0);

      if (shares > 0 && currentPrice > 0) {
        const value = parseFloat((shares * currentPrice).toFixed(2));
        document.getElementById('modal-value').value = value;
        if (buyPrice > 0) {
          const cost = parseFloat((shares * buyPrice).toFixed(2));
          const profit = parseFloat((value - cost).toFixed(2));
          document.getElementById('modal-profit').value = profit;
        }
      }
    }

    function openAddAssetModal() {
      document.getElementById('modal-title').innerText = 'إضافة أصل مالي جديد';
      document.getElementById('asset-edit-index').value = '-1';
      document.getElementById('modal-ticker').value = '';
      document.getElementById('modal-name').value = '';
      document.getElementById('modal-category').value = 'EGX30';
      document.getElementById('modal-shares').value = '';
      document.getElementById('modal-current-price').value = '';
      document.getElementById('modal-buy-price').value = '';
      document.getElementById('modal-value').value = '';
      document.getElementById('modal-profit').value = '0';
      document.getElementById('modal-advice').value = 'احتفاظ • استثمار طويل الأجل';
      
      const modal = document.getElementById('asset-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function editAsset(index) {
      const item = portfolioData[index];
      if (!item) return;

      document.getElementById('modal-title').innerText = `تعديل سهم: ${item.name} (${item.ticker})`;
      document.getElementById('asset-edit-index').value = index;
      document.getElementById('modal-ticker').value = item.ticker;
      document.getElementById('modal-name').value = item.name;
      document.getElementById('modal-category').value = item.category;
      document.getElementById('modal-shares').value = item.shares || '';
      document.getElementById('modal-current-price').value = item.currentPrice ? Number(item.currentPrice).toFixed(2) : '';
      document.getElementById('modal-buy-price').value = item.buyPrice ? Number(item.buyPrice).toFixed(2) : '';
      document.getElementById('modal-value').value = item.value;
      document.getElementById('modal-profit').value = item.profit;
      document.getElementById('modal-advice').value = item.advice;

      const modal = document.getElementById('asset-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeAssetModal() {
      const modal = document.getElementById('asset-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }


    // ============================================================
    // Thndr 1-Click Sync & Import Engine
    // ============================================================
    function generateThndrExtractorScript() {
      return `(function() {
  console.clear();
  console.log("%c🎯 جاري قراءة محفظة ثندر بالكامل (الأسهم + الصناديق + الكاش بالقرش)...", "color:#10b981;font-size:14px;font-weight:bold;");

  let results = [];
  const knownTickers = ["COMI","SWDY","ORAS","TMGH","ARCC","RAYA","CLHO","ETEL","FWRY","ESRS","SKPC","EKHO","ISPH","MFPC","JUFO","CERA","BTFH","ALCN","OCDI","HELI","PHDC","ABUK","HDBK","ETRS","HRHO","EFIH","EAST","ORHD","CICH","ADIB","EGAL","AMOC","HALN","NCS","BSB"];

  function cleanNum(s) {
    if (!s) return 0;
    let str = String(s).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/,/g, '').trim();
    let m = str.match(/-?\\d+(?:\\.\\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }

  // 1. قراءة جدول الأصول والأسهم والصناديق
  let allRows = document.querySelectorAll('tr, [role="row"], div[class*="row"]');
  allRows.forEach(row => {
    let txt = row.innerText || '';
    if (txt.includes('نوع الورقه الماليه') || txt.includes('وحدات مملوكه') || txt.includes('الأوراق المالية المملوكة')) return;

    for (let sym of knownTickers) {
      if (txt.includes(sym) && !results.some(r => r.ticker === sym)) {
        let cells = row.querySelectorAll('td, [role="cell"], div[class*="cell"]');
        let cellValues = [];
        if (cells.length >= 4) {
          cellValues = Array.from(cells).map(c => c.innerText.trim());
        } else {
          cellValues = txt.split('\\n').map(l => l.trim()).filter(l => l.length > 0 && !l.includes('%'));
        }

        let nums = cellValues.map(c => cleanNum(c)).filter(n => n > 0);
        let shares = 0;
        let buyPrice = 0;
        let curPrice = 0;

        if (cellValues.length >= 5) {
          shares = cleanNum(cellValues[2]) || cleanNum(cellValues[1]);
          buyPrice = cleanNum(cellValues[3]) || cleanNum(cellValues[2]);
          curPrice = cleanNum(cellValues[4]) || cleanNum(cellValues[3]);
        } else if (nums.length >= 3) {
          shares = nums[0];
          buyPrice = nums[1];
          curPrice = nums[2];
        }

        results.push({
          ticker: sym,
          shares: shares,
          buyPrice: buyPrice,
          currentPrice: curPrice
        });
        break;
      }
    }
  });

  // 2. قراءة كارت السيولة النقدية (الكاش) من أعلى الشاشة
  let cashVal = 0;
  let fullText = document.body.innerText || '';
  let cashMatch = fullText.match(/نقدي[\\s\\S]*?([\\d,]+(?:\\.\\d+)?)\\s*جنيه/i) || 
                  fullText.match(/([\\d,]+(?:\\.\\d+)?)\\s*جنيه مصري[\\s\\S]*?نقدي/i);
  if (cashMatch) {
    cashVal = cleanNum(cashMatch[1]);
  } else {
    // fallback check
    let cMatch = fullText.match(/(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s*(?:جنيه مصري|EGP)\\s*(?:مجموع|نقدي)/i);
    if (cMatch) cashVal = cleanNum(cMatch[1]);
  }

  if (cashVal > 0) {
    results.push({
      ticker: "CASH",
      shares: cashVal,
      buyPrice: cashVal,
      currentPrice: cashVal
    });
  }

  let cleanJson = JSON.stringify(results, null, 2);
  console.log("👇 تم تجهيز أرقام المحفظة بالقرش (انسخ هذا النص):");
  console.log(cleanJson);

  try { if (typeof copy === 'function') copy(cleanJson); } catch(e){}
  alert("🎉 تم استخراج " + results.length + " أصل مالي (أسهم + صناديق + كاش " + (cashVal ? cashVal + ' ج' : '') + ") بنجاح! تم نسخ الكود، الصقه الآن في التطبيق واضغط تحديث.");
  return cleanJson;
})();`;
    }

    function openThndrSyncModal() {
      const modal = document.getElementById('thndr-sync-modal');
      if (!modal) return;
      
      const scriptBox = document.getElementById('thndr-verified-script-box');
      if (scriptBox) {
        scriptBox.value = generateThndrExtractorScript();
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.lucide) lucide.createIcons();
    }

    function closeThndrSyncModal() {
      const modal = document.getElementById('thndr-sync-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function copyThndrVerifiedScript() {
      const code = generateThndrExtractorScript();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const btn = document.getElementById('btn-copy-verified-text');
          if (btn) {
            btn.innerText = '✅ تم نسخ الكود بنجاح!';
            setTimeout(() => { btn.innerText = '📋 اضغط هنا لنسخ الكود'; }, 3000);
          }
          showToast('تم نسخ كود السحب بنجاح! الصقه في Console موقع ثندر واضغط Enter.', 'success');
        }).catch(() => {
          showToast('يرجى نسخ الكود من الصندوق بالأسفل يدوياً.', 'info');
        });
      }
    }

    function pasteThndrFromClipboard() {
      if (!navigator.clipboard) {
        showToast('متصفحك لا يدعم القراءة المباشرة؛ استخدم Ctrl + V للصق النص.', 'info');
        return;
      }
      navigator.clipboard.readText().then(text => {
        const input = document.getElementById('thndr-manual-json-input');
        if (input) {
          input.value = text;
          showToast('تم لصق أرقام المحفظة من الحافظة بنجاح ✅', 'success');
        }
      }).catch(err => {
        showToast('يرجى لصق الكود يدوياً داخل المربع.', 'info');
      });
    }

    function handleManualThndrImportSubmit() {
      const input = document.getElementById('thndr-manual-json-input');
      const replaceAll = document.getElementById('thndr-replace-all') ? document.getElementById('thndr-replace-all').checked : true;
      if (!input || !input.value.trim()) {
        showToast('يرجى لصق كود أو ملف JSON للمحفظة أولاً.', 'error');
        return;
      }
      try {
        const parsed = JSON.parse(input.value.trim());
        applyThndrImport(parsed, replaceAll);
        closeThndrSyncModal();
        input.value = '';
      } catch (err) {
        showToast('صيغة الـ JSON غير صحيحة: ' + err.message, 'error');
      }
    }

    function downloadPortfolioBackupJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `egx_copilot_portfolio_backup_${new Date().toISOString().slice(0,10)}.json`);
      dlAnchorElem.click();
      dlAnchorElem.remove();
      showToast('تم تحميل نسخة احتياطية من المحفظة بنجاح 💾', 'success');
    }

    function copyPortfolioBackupJSON() {
      const jsonStr = JSON.stringify(portfolioData, null, 2);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          const btn = document.getElementById('btn-copy-backup-text');
          if (btn) {
            btn.innerText = 'تم النسخ! ✅';
            setTimeout(() => { btn.innerText = 'نسخ الكود كـ JSON'; }, 3000);
          }
          showToast('تم نسخ بيانات المحفظة الحالية كـ JSON إلى الحافظة.', 'success');
        });
      }
    }

    function applyThndrImport(payload, isReplaceAll = true) {
      if (!payload) return;
      const stocks = Array.isArray(payload) ? payload : (payload.stocks || []);
      if (!stocks || stocks.length === 0) {
        showToast('لم يتم العثور على أي أسهم صالحة للاستيراد في البيانات.', 'error');
        return;
      }

      let importedCount = 0;
      const existingCash = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      let newPortfolio = isReplaceAll 
        ? (existingCash ? [existingCash] : [{ ticker: 'CASH', name: 'المحفظة (الرصيد النقدي)', category: 'محفظة نقدية', value: 0, profit: 0, shares: 0, buyPrice: 0 }]) 
        : [...portfolioData];

      stocks.forEach(stk => {
        const ticker = (stk.ticker || stk.symbol || stk.code || '').toUpperCase().trim();
        if (!ticker) return;
        const shares = parseFloat(stk.shares || stk.quantity || 0);
        if (shares <= 0) return;
        const buyPrice = parseFloat(stk.buyPrice || stk.avgPrice || stk.costPrice || 0);
        
        const radarMatch = typeof fullMarketRadar !== 'undefined' ? fullMarketRadar.find(r => r.ticker === ticker) : null;
        const existingMatch = portfolioData.find(p => p.ticker === ticker);

        const stockName = (radarMatch && radarMatch.name) || (existingMatch && existingMatch.name) || stk.name || ticker;
        const stockCategory = (radarMatch && radarMatch.sector ? `EGX • ${radarMatch.sector}` : '') || (existingMatch && existingMatch.category) || 'EGX • أسهم قيادية';

        let currentPrice = parseFloat(stk.currentPrice || stk.price || 0);
        if (!currentPrice || currentPrice <= 0) {
          currentPrice = (radarMatch && radarMatch.price) || (existingMatch && existingMatch.currentPrice) || buyPrice;
        }

        const value = Math.round(shares * currentPrice);
        const cost = Math.round(shares * buyPrice);
        const profit = Math.round(value - cost);
        const returnPct = buyPrice > 0 ? parseFloat((((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;

        const existingIndex = newPortfolio.findIndex(p => p.ticker === ticker);
        let assetAdvice = returnPct >= 15 ? 'احتفاظ قوي وجني أرباح تدريجي' : (returnPct <= -10 ? 'مستوى تعزيز أو مراقبة وقف الخسارة' : 'احتفاظ • متابعة الاتجاه');
        let assetAction = returnPct >= 20 ? 'PROFIT_TAKE' : (returnPct <= -10 ? 'WATCH_STOP' : 'HOLD');
        let assetStatus = profit >= 0 ? 'ربح ممتاز' : 'تراجع مؤقت';

        if (typeof EGX_Engine !== 'undefined') {
          const evalRes = EGX_Engine.evaluateAsset({
            ticker, name: stockName, shares, buyPrice, currentPrice,
            pivotR1: radarMatch ? radarMatch.pivotR1 : null,
            pivotS1: radarMatch ? radarMatch.pivotS1 : null
          }, typeof getMarketRegimeCode === 'function' ? getMarketRegimeCode() : 'NORMAL_CONSOLIDATION');
          if (evalRes) {
            assetAdvice = evalRes.advice;
            assetAction = evalRes.action;
            assetStatus = evalRes.status;
          }
        }

        const assetObj = {
          ticker: ticker,
          name: stockName,
          category: stockCategory,
          shares: shares,
          buyPrice: buyPrice,
          currentPrice: currentPrice,
          value: value,
          profit: profit,
          returnPct: returnPct,
          status: assetStatus,
          advice: assetAdvice,
          action: assetAction,
          priceUpdatedAt: 'مزامنة ثندر الآن',
          priceSource: 'محفظة ثندر اللحظية',
          decisionUpdatedAt: 'جلسة اليوم',
          decisionBasis: `سعر الشراء: ${buyPrice.toFixed(2)} ج • السعر: ${currentPrice.toFixed(2)} ج`,
          thndrUrl: 'https://app.thndr.app'
        };

        if (existingIndex !== -1) {
          newPortfolio[existingIndex] = assetObj;
        } else {
          newPortfolio.push(assetObj);
        }
        importedCount++;
      });

      if (importedCount > 0) {
        portfolioData = newPortfolio;
        savePortfolio();
        
        // Immediately fetch live EGX quotes to calculate official pivots and decisions
        if (typeof fetchLiveEGXPricesAndReevaluate === 'function') {
          fetchLiveEGXPricesAndReevaluate();
        }

        showToast(`🎉 تمت مزامنة ${importedCount} أصل مالي من ثندر بنجاح! يتم الآن ربط الأسعار اللحظية وإعادة اتخاذ القرارات...`, 'success');
      } else {
        showToast('لم يتم العثور على أصول صالحة للإضافة.', 'info');
      }
    }

    function checkUrlForThndrSync() {
      const hash = window.location.hash;
      if (!hash || !hash.includes('thndr_sync=')) return;
      
      try {
        const raw = hash.split('thndr_sync=')[1];
        const decoded = decodeURIComponent(raw);
        let payload = null;
        try {
          const jsonStr = decodeURIComponent(escape(atob(decoded)));
          payload = JSON.parse(jsonStr);
        } catch(e) {
          payload = JSON.parse(decoded);
        }
        
        if (payload) {
          // Clean the hash so it doesn't trigger on every page refresh
          history.replaceState(null, null, window.location.pathname + window.location.search);
          applyThndrImport(payload, true);
        }
      } catch(e) {
        console.error('Failed to parse thndr_sync hash:', e);
      }
    }
    window.addEventListener('hashchange', checkUrlForThndrSync);


    // ============================================================
    // Real-Time Trade Execution & Portfolio Sync (Buy / Sell)
    // ============================================================
    let currentTradeMode = 'BUY'; // 'BUY' or 'SELL'

    function openTradeModal(preSelectedTicker = null, defaultMode = 'BUY', defaultShares = null, defaultPrice = null) {
      currentTradeMode = defaultMode;
      setTradeMode(defaultMode);
      populateTradeStockDropdown(preSelectedTicker);

      const sharesInput = document.getElementById('trade-shares-input');
      const priceInput = document.getElementById('trade-price-input');

      if (defaultShares !== null && defaultShares !== undefined && Number(defaultShares) > 0) {
        sharesInput.value = Math.round(Number(defaultShares));
      } else {
        sharesInput.value = '';
      }

      if (defaultPrice !== null && defaultPrice !== undefined && Number(defaultPrice) > 0) {
        priceInput.value = Number(defaultPrice).toFixed(2);
      } else {
        priceInput.value = '';
      }

      document.getElementById('trade-custom-ticker').value = '';
      document.getElementById('trade-custom-ticker').classList.add('hidden');
      document.getElementById('trade-stock-select').classList.remove('hidden');
      document.getElementById('trade-toggle-custom-btn').innerText = 'سهم جديد غير موجود بالقائمة؟';
      onTradeStockSelected();

      if (defaultShares !== null && defaultShares !== undefined && Number(defaultShares) > 0) {
        sharesInput.value = Math.round(Number(defaultShares));
      }
      if (defaultPrice !== null && defaultPrice !== undefined && Number(defaultPrice) > 0) {
        priceInput.value = Number(defaultPrice).toFixed(2);
      }
      recalcTradeSummary();
      
      const modal = document.getElementById('trade-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.lucide) lucide.createIcons();
    }

    function closeTradeModal() {
      const modal = document.getElementById('trade-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setTradeMode(mode) {
      currentTradeMode = mode;
      const buyBtn = document.getElementById('btn-trade-mode-buy');
      const sellBtn = document.getElementById('btn-trade-mode-sell');
      const submitBtn = document.getElementById('btn-submit-trade');
      const submitLabel = document.getElementById('trade-submit-label');
      const cashLabel = document.getElementById('trade-cash-label');

      if (mode === 'BUY') {
        buyBtn.className = 'py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 bg-emerald-600 text-white shadow';
        sellBtn.className = 'py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 text-gray-400 hover:text-white';
        submitBtn.className = 'flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5';
        submitLabel.innerText = 'تأكيد عملية الشراء وتحديث المحفظة';
        cashLabel.innerText = 'خصم قيمة الشراء تلقائياً من رصيد الكاش المتوفر';
      } else {
        sellBtn.className = 'py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 bg-rose-600 text-white shadow';
        buyBtn.className = 'py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 text-gray-400 hover:text-white';
        submitBtn.className = 'flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5';
        submitLabel.innerText = 'تأكيد عملية البيع وإيداع الأرباح في الكاش';
        cashLabel.innerText = 'إضافة عائد البيع تلقائياً إلى رصيد الكاش المتوفر';
      }
      const sellAllocBox = document.getElementById('trade-sell-allocation-box');
      if (sellAllocBox) {
        if (mode === 'SELL') {
          sellAllocBox.classList.remove('hidden');
        } else {
          sellAllocBox.classList.add('hidden');
        }
      }
      populateTradeStockDropdown();
      onTradeStockSelected();
      recalcTradeSummary();
      if (window.lucide) lucide.createIcons();
    }

    function populateTradeStockDropdown(preSelectedTicker = null) {
      const select = document.getElementById('trade-stock-select');
      select.innerHTML = '';

      if (currentTradeMode === 'SELL') {
        const owned = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB' && p.shares > 0);
        if (owned.length === 0) {
          select.innerHTML = '<option value="">لا توجد أسهم متاحة للبيع في محفظتك</option>';
          return;
        }
        owned.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.ticker;
          opt.innerText = `${item.name} (${item.ticker}) • تملك: ${item.shares} سهم • سعر الشراء: ${item.buyPrice || item.costPrice || 0} ج`;
          if (preSelectedTicker && item.ticker === preSelectedTicker) opt.selected = true;
          select.appendChild(opt);
        });
      } else {
        const groupOwned = document.createElement('optgroup');
        groupOwned.label = 'أسهم محفظتك الحالية (لإضافة كمية أو تعزيز):';
        portfolioData.filter(p => p.ticker !== 'CASH').forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.ticker;
          opt.innerText = `${item.name} (${item.ticker}) ${item.shares ? `• تملك ${item.shares} سهم` : ''}`;
          if (preSelectedTicker && item.ticker === preSelectedTicker) opt.selected = true;
          groupOwned.appendChild(opt);
        });
        select.appendChild(groupOwned);

        const groupRadar = document.createElement('optgroup');
        groupRadar.label = 'أسهم من رادار البورصة المصرية:';
        fullMarketRadar.forEach(item => {
          if (!portfolioData.some(p => p.ticker === item.ticker)) {
            const opt = document.createElement('option');
            opt.value = item.ticker;
            opt.innerText = `${item.name} (${item.ticker}) • سعر البورصة: ${item.price} ج`;
            if (preSelectedTicker && item.ticker === preSelectedTicker) opt.selected = true;
            groupRadar.appendChild(opt);
          }
        });
        select.appendChild(groupRadar);
      }
    }

    function toggleTradeCustomTicker() {
      const select = document.getElementById('trade-stock-select');
      const input = document.getElementById('trade-custom-ticker');
      const btn = document.getElementById('trade-toggle-custom-btn');
      if (input.classList.contains('hidden')) {
        input.classList.remove('hidden');
        select.classList.add('hidden');
        btn.innerText = 'اختيار من قائمة الأسهم المتاحة؟';
        input.focus();
      } else {
        input.classList.add('hidden');
        select.classList.remove('hidden');
        btn.innerText = 'سهم جديد غير موجود بالقائمة؟';
      }
      onTradeStockSelected();
    }

    function onTradeStockSelected() {
      const isCustom = !document.getElementById('trade-custom-ticker').classList.contains('hidden');
      const ticker = isCustom ? 
        document.getElementById('trade-custom-ticker').value.trim().toUpperCase() : 
        document.getElementById('trade-stock-select').value;
      
      const infoEl = document.getElementById('trade-stock-info');
      const priceInput = document.getElementById('trade-price-input');
      
      const owned = portfolioData.find(p => p.ticker === ticker);
      const radarItem = fullMarketRadar.find(p => p.ticker === ticker);
      
      const livePrice = (owned && owned.currentPrice) ? owned.currentPrice : (radarItem ? radarItem.price : null);

      if (livePrice && !priceInput.value) {
        priceInput.value = Number(livePrice).toFixed(2);
      } else if (livePrice && document.activeElement !== priceInput) {
        priceInput.value = Number(livePrice).toFixed(2);
      }

      if (owned) {
        infoEl.innerHTML = `تملك حالياً: <strong class="text-white">${owned.shares || 0} سهم</strong> • متوسط تكلفتك: <strong class="text-white">${owned.buyPrice ? Number(owned.buyPrice).toFixed(2) : '--'} ج</strong> • سعر البورصة الآن: <strong class="text-emerald-400">${livePrice ? Number(livePrice).toFixed(2) + ' ج' : '--'}</strong>`;
      } else if (radarItem) {
        infoEl.innerHTML = `سهم جديد غير مملوك • سعر البورصة اللحظي: <strong class="text-emerald-400">${Number(radarItem.price).toFixed(2)} ج</strong> (${radarItem.changePct})`;
      } else {
        infoEl.innerHTML = ticker ? `كود السهم: <strong class="text-white">${ticker}</strong>` : 'اختر سهماً لتحديد التفاصيل';
      }

      recalcTradeSummary();
    }

    function recalcTradeSummary() {
      const shares = parseInt(document.getElementById('trade-shares-input').value, 10) || 0;
      const price = parseFloat(document.getElementById('trade-price-input').value) || 0;
      const totalVal = shares * price;

      document.getElementById('trade-total-val').innerText = `${Math.round(totalVal).toLocaleString('en-US')} ج.م`;

      const isCustom = !document.getElementById('trade-custom-ticker').classList.contains('hidden');
      const ticker = isCustom ? 
        document.getElementById('trade-custom-ticker').value.trim().toUpperCase() : 
        document.getElementById('trade-stock-select').value;

      const owned = portfolioData.find(p => p.ticker === ticker);
      const impactEl = document.getElementById('trade-impact-val');

      const cashItem = portfolioData.find(p => p.ticker === 'CASH');
      const currentCash = cashItem ? cashItem.value : 0;

      if (currentTradeMode === 'BUY') {
        if (shares > 0 && price > 0) {
          const oldShares = owned ? (owned.shares || 0) : 0;
          const oldPrice = owned ? (owned.buyPrice || 0) : 0;
          const newTotalShares = oldShares + shares;
          const newAvgPrice = newTotalShares > 0 ? (((oldShares * oldPrice) + (shares * price)) / newTotalShares).toFixed(2) : price.toFixed(2);
          
          impactEl.innerHTML = `سيصبح رصيدك: <strong class="text-white">${newTotalShares} سهم</strong> • متوسط التكلفة الجديد: <strong class="text-amber-300">${newAvgPrice} ج</strong> ${currentCash < totalVal ? '<span class="text-rose-400 font-bold">(تنبيه: يتجاوز الكاش المتوفر)</span>' : ''}`;
        } else {
          impactEl.innerText = `الرصيد النقدي المتوفر بالكاش: ${Math.round(currentCash).toLocaleString('en-US')} ج.م`;
        }
      } else {
        // SELL
        if (owned && shares > 0 && price > 0) {
          const cost = owned.buyPrice || 0;
          const profitPerShare = price - cost;
          const totalProfit = Math.round(profitPerShare * shares);
          const remainingShares = (owned.shares || 0) - shares;
          
          impactEl.innerHTML = `الأرباح المحققة: <strong class="${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US')} ج.م</strong> • المتبقي بالمحفظة: <strong class="text-white">${remainingShares} سهم</strong>`;
        } else {
          impactEl.innerText = owned ? `تملك ${owned.shares || 0} سهم للبيع` : '--';
        }
      }
    }

    function handleExecuteTrade(e) {
      e.preventDefault();
      const isCustom = !document.getElementById('trade-custom-ticker').classList.contains('hidden');
      const ticker = (isCustom ? 
        document.getElementById('trade-custom-ticker').value.trim().toUpperCase() : 
        document.getElementById('trade-stock-select').value).trim().toUpperCase();

      const shares = parseInt(document.getElementById('trade-shares-input').value, 10);
      const price = parseFloat(document.getElementById('trade-price-input').value);
      const autoCash = document.getElementById('trade-auto-cash').checked;

      if (!ticker) {
        alert('يرجى اختيار أو كتابة رمز السهم');
        return;
      }
      if (!shares || shares <= 0) {
        alert('يرجى إدخال عدد أسهم صحيح');
        return;
      }
      if (!price || price <= 0) {
        alert('يرجى إدخال سعر تنفيذ صحيح');
        return;
      }

      const grossTradeValue = Math.round(shares * price);
      const estCommission = Math.round(grossTradeValue * 0.00175);
      const totalBuyValue = grossTradeValue + estCommission;
      const netSellValue = Math.max(0, grossTradeValue - estCommission);

      let cashItem = portfolioData.find(p => p.ticker === 'CASH');
      if (!cashItem) {
        cashItem = { ticker: 'CASH', name: 'المحفظة (الرصيد النقدي)', category: 'محفظة نقدية', value: 0, profit: 0, shares: 0, buyPrice: 0 };
        portfolioData.push(cashItem);
      }

      const now = new Date();
      const cairoTime = formatCairoTime(now);

      if (currentTradeMode === 'BUY') {
        if (autoCash && cashItem.value < totalBuyValue) {
          alert(`⚠️ لا يمكن إتمام الشراء: الرصيد النقدي المتاح في المحفظة (${cashItem.value.toLocaleString('en-US')} ج) غير كافٍ لتغطية إجمالي الصفقة مع العمولة (${totalBuyValue.toLocaleString('en-US')} ج).\nيرجى شحن المحفظة أو تقليل عدد الأسهم لحفظ توازن رأس المال.`);
          return;
        }

        let stock = portfolioData.find(p => p.ticker === ticker);
        const radarItem = fullMarketRadar.find(p => p.ticker === ticker);

        if (stock) {
          const oldShares = stock.shares || 0;
          const oldBuyPrice = stock.buyPrice || stock.currentPrice || price;
          const newShares = oldShares + shares;
          const newAvgPrice = parseFloat((((oldShares * oldBuyPrice) + (shares * price)) / newShares).toFixed(2));
          
          stock.shares = newShares;
          stock.buyPrice = newAvgPrice;
          stock.currentPrice = price;
          stock.value = Math.round(newShares * price);
          const totalCost = Math.round(newShares * newAvgPrice);
          stock.profit = stock.value - totalCost;
          stock.returnPct = totalCost > 0 ? parseFloat(((stock.profit / totalCost) * 100).toFixed(2)) : 0;
          stock.status = stock.profit >= 0 ? 'ربح' : 'تراجع';
          stock.priceUpdatedAt = cairoTime;
          stock.decisionUpdatedAt = cairoTime;
        } else {
          const stockName = radarItem ? radarItem.name : ticker;
          const stockCategory = radarItem ? `${radarItem.index.toUpperCase()} • ${radarItem.sector}` : 'EGX • أسهم مصرية';
          const newStock = {
            ticker: ticker,
            name: stockName,
            category: stockCategory,
            shares: shares,
            buyPrice: price,
            currentPrice: price,
            value: grossTradeValue,
            profit: 0,
            returnPct: 0.0,
            status: 'متعادل',
            advice: 'احتفاظ • مركز استثماري جديد تم شراؤه بنجاح',
            action: 'HOLD',
            thndrUrl: 'https://app.thndr.app',
            priceSource: 'شاشة البورصة اللحظية',
            priceUpdatedAt: cairoTime,
            decisionUpdatedAt: cairoTime
          };
          portfolioData.unshift(newStock);
        }

        if (autoCash) {
          cashItem.value = Number((cashItem.value - totalBuyValue).toFixed(2));
          cashItem.shares = cashItem.value;
          cashItem.buyPrice = cashItem.value;
        }

        savePortfolio();
        closeTradeModal();
        alert(`✅ تم بنجاح تسجيل شراء ${shares} سهم في (${ticker}) بسعر ${price.toFixed(2)} ج بإجمالي ${totalBuyValue.toLocaleString('en-US')} ج.م (شامل عمولة البورصة وثندر: ${estCommission} ج).`);
      } else {
        // SELL Mode
        let stock = portfolioData.find(p => p.ticker === ticker);
        if (!stock || (stock.shares || 0) < shares) {
          alert(`لا يمكنك بيع ${shares} سهم؛ رصيدك الحالي هو ${stock ? stock.shares : 0} سهم فقط.`);
          return;
        }

        const cost = stock.buyPrice || price;
        const realizedProfit = Math.round((price - cost) * shares) - estCommission;
        stock.shares -= shares;

        if (stock.shares === 0) {
          // Remove completely exited position from active holdings
          portfolioData = portfolioData.filter(p => p.ticker !== ticker);
        } else {
          stock.value = Math.round(stock.shares * (stock.currentPrice || price));
          const totalRemainingCost = Math.round(stock.shares * stock.buyPrice);
          stock.profit = stock.value - totalRemainingCost;
          stock.returnPct = totalRemainingCost > 0 ? parseFloat(((stock.profit / totalRemainingCost) * 100).toFixed(2)) : 0;
        }

        if (autoCash) {
          cashItem.value += netSellValue;
          cashItem.shares = cashItem.value;
          cashItem.buyPrice = cashItem.value;
        }

        // Automated Post-Mortem Trade Diagnostic & Continuous Learning
        try {
          recordLearnedTradeLesson({
            ticker: ticker,
            name: stock ? stock.name : ticker,
            sharesSold: shares,
            sellPrice: price,
            buyCost: cost,
            realizedProfit: realizedProfit,
            returnPct: cost > 0 ? parseFloat((((price - cost) / cost) * 100).toFixed(2)) : 0,
            timestamp: cairoTime,
            pivotR1: stock ? stock.pivotR1 : null,
            pivotS1: stock ? stock.pivotS1 : null,
            stopLoss: stock ? stock.stopLoss : null
          });
        } catch(postMortemErr) {
          console.warn('Post-mortem learning non-fatal warning:', postMortemErr);
        }

        const cashDest = document.querySelector('input[name="trade-cash-dest"]:checked')?.value || 'FREE_CASH';
        let destMsg = 'تم إيداع صافي العائد في رصيدك الكاش الحر.';
        // Record active pending rebuy plan if selling
        try {
          const rebuyPrice = (stock && stock.pivotR1 && price >= stock.pivotR1)
            ? Number((price * 0.97).toFixed(2))
            : (stock && stock.pivotS1 ? Number(stock.pivotS1.toFixed(2)) : Number((price * 0.92).toFixed(2)));
          const rebuyShares = rebuyPrice > 0 ? Math.floor(netSellValue / rebuyPrice) : shares;
          const freeShares = Math.max(0, rebuyShares - shares);

          const pendingPlan = {
            ticker: ticker,
            name: stock ? stock.name : ticker,
            soldShares: shares,
            sellPrice: price,
            sellCash: netSellValue,
            realizedProfit: realizedProfit,
            rebuyPrice: rebuyPrice,
            rebuyShares: rebuyShares,
            freeShares: freeShares,
            createdAt: cairoTime,
            status: 'PENDING'
          };

          let pendingList = [];
          try {
            pendingList = JSON.parse(localStorage.getItem('egx_pending_rebuys') || '[]');
          } catch(err) { pendingList = []; }
          pendingList = pendingList.filter(p => p.ticker !== ticker);
          pendingList.push(pendingPlan);
          localStorage.setItem('egx_pending_rebuys', JSON.stringify(pendingList));
        } catch(planErr) {
          console.warn('Pending rebuy plan recording warning:', planErr);
        }

        if (cashDest === 'PENDING_BUY') {
          destMsg = 'تم تسجيل تخصيص العائد لأمر شراء معلق عند الدعم لإعادة الشراء وتكبير الأسهم مجاناً 🎯';
        } else if (cashDest === 'RADAR_ROTATE') {
          destMsg = 'تم تجهيز السيولة لتدويرها في فرصة ذهبية من رادار السوق 🚀';
        }

        savePortfolio();
        closeTradeModal();
        alert(`✅ تم بنجاح تسجيل بيع ${shares} سهم في (${ticker}) بسعر ${price.toFixed(2)} ج.\nصافي عائد البيع: ${netSellValue.toLocaleString('en-US')} ج.م (بعد خصم عمولة ${estCommission} ج).\nالأرباح المحققة: ${realizedProfit >= 0 ? '+' : ''}${realizedProfit.toLocaleString('en-US')} ج.م.\nتوجيه السيولة: ${destMsg}`);
        if (cashDest === 'RADAR_ROTATE' && typeof switchTab === 'function') {
          switchTab('radar');
        }
      }

      fetchLiveEGXPricesAndReevaluate();
    }

    // ============================================================

    function handleSaveAsset(e) {
      e.preventDefault();
      const index = parseInt(document.getElementById('asset-edit-index').value, 10);
      const ticker = document.getElementById('modal-ticker').value.trim().toUpperCase();
      const name = document.getElementById('modal-name').value.trim();
      const category = document.getElementById('modal-category').value.trim();
      const existing = (index >= 0 && index < portfolioData.length) ? portfolioData[index] : {};
      const shares = parseInt(document.getElementById('modal-shares').value, 10) || existing.shares;
      const currentPrice = parseFloat(document.getElementById('modal-current-price').value) || existing.currentPrice;
      const buyPrice = parseFloat(document.getElementById('modal-buy-price').value) || existing.buyPrice;

      if (shares <= 0 || currentPrice <= 0 || buyPrice <= 0 || isNaN(shares) || isNaN(currentPrice) || isNaN(buyPrice)) {
        alert('⚠️ يرجى التأكد من إدخال أرقام صحيحة وموجبة لعدد الأسهم وسعر الشراء وسعر السوق اللحظي.');
        return;
      }

      // Mathematically derive cost, value, profit, and returnPct with exact 2-decimal piastre precision
      const value = parseFloat((shares * currentPrice).toFixed(2));
      const cost = parseFloat((shares * buyPrice).toFixed(2));
      const profit = parseFloat((value - cost).toFixed(2));
      const returnPct = cost > 0 ? parseFloat((((value - cost) / cost) * 100).toFixed(2)) : 0;
      const advice = document.getElementById('modal-advice').value.trim() || existing.advice || 'احتفاظ ومتابعة';

      const nowStr = formatCairoTime(new Date());
      const newAsset = {
        ...existing,
        ticker,
        name,
        category,
        shares,
        currentPrice,
        buyPrice,
        value,
        profit,
        returnPct,
        status: profit >= 0 ? 'ربح' : 'تراجع',
        advice,
        action: returnPct < -15 ? 'REBALANCE_CANDIDATE' : (returnPct < -5 ? 'ACCUMULATE' : 'HOLD'),
        priceUpdatedAt: nowStr,
        priceSource: 'تعديل يدوي من المستخدم',
        decisionUpdatedAt: nowStr,
        decisionBasis: `سعر السهم: ${currentPrice ? Number(currentPrice).toFixed(2) + ' ج' : '--'}`,
        thndrUrl: existing.thndrUrl || 'https://app.thndr.app'
      };

      if (index >= 0 && index < portfolioData.length) {
        portfolioData[index] = newAsset;
      } else {
        portfolioData.push(newAsset);
      }

      savePortfolio();
      closeAssetModal();
    }

    function deleteAsset(index) {
      const item = portfolioData[index];
      if (!item) return;
      if (item.ticker === 'CASH' || item.isCashReserve) {
        alert('⚠️ لا يمكن حذف بند النقدية (CASH) لأنه وعاء السيولة الإلزامية للمحفظة. يمكنك تعديل رصيد الكاش بدلاً من حذفه.');
        return;
      }
      if (confirm(`هل أنت متأكد من حذف ${item.name} (${item.ticker}) من المحفظة؟`)) {
        portfolioData.splice(index, 1);
        savePortfolio();
      }
    }


    // ============================================================
    // Fine-Tuning Shares Quantity & Buy Price Modal Operations
    // ============================================================
    function openFineTuneModal(index) {
      const item = portfolioData[index];
      if (!item) return;

      document.getElementById('ft-asset-index').value = index;
      document.getElementById('ft-modal-title').innerText = `الضبط الدقيق: ${item.name} (${item.ticker})`;
      
      const currentShares = item.shares || (item.currentPrice ? Math.round(item.value / item.currentPrice) : 1);
      const buyPrice = item.buyPrice || ((item.value - item.profit) / (currentShares || 1));
      const currentPrice = item.currentPrice || (item.value / (currentShares || 1));

      document.getElementById('ft-input-shares').value = currentShares;
      document.getElementById('ft-input-buy-price').value = Number(buyPrice).toFixed(2);
      document.getElementById('ft-input-current-price').value = Number(currentPrice).toFixed(2);

      const priceUpdated = item.priceUpdatedAt || 'جلسة اليوم';
      const priceSource = item.priceSource || 'شاشة البورصة اللحظية';
      const ftUpdatedEl = document.getElementById('ft-price-updated-at');
      if (ftUpdatedEl) ftUpdatedEl.innerText = `آخر تحديث: ${formatDateTimeDisplay(priceUpdated)}`;
      const ftSourceEl = document.getElementById('ft-price-source-badge');
      if (ftSourceEl) {
        ftSourceEl.innerText = priceSource;
        ftSourceEl.className = priceSource.includes('يدوي') 
          ? 'px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold'
          : 'px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold';
      }

      recalcFineTunePreview();

      const modal = document.getElementById('fine-tune-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      if (window.lucide) lucide.createIcons();
    }

    function closeFineTuneModal() {
      const modal = document.getElementById('fine-tune-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function adjustFineTuneShares(delta) {
      const input = document.getElementById('ft-input-shares');
      if (!input) return;
      let val = parseInt(input.value, 10) || 0;
      val = Math.max(1, val + delta);
      input.value = val;
      recalcFineTunePreview();
    }

    function formatPoundsAndPiastres(num) {
      if (isNaN(num) || num <= 0) return '0.00 ج.م';
      const pounds = Math.floor(num);
      const piastres = Math.round((num - pounds) * 100);
      if (piastres === 0) {
        return `${pounds.toLocaleString('en-US')} ج تماماً`;
      }
      return `${pounds.toLocaleString('en-US')} ج و ${piastres} قرش`;
    }

    function adjustFineTunePrice(fieldId, delta) {
      const input = document.getElementById(fieldId);
      if (!input) return;
      let val = parseFloat(input.value) || 0;
      val = Math.max(0.01, +(val + delta).toFixed(2));
      input.value = val.toFixed(2);
      recalcFineTunePreview();
    }

    function recalcFineTunePreview() {
      const shares = parseInt(document.getElementById('ft-input-shares').value, 10) || 0;
      const buyPrice = parseFloat(document.getElementById('ft-input-buy-price').value) || 0;
      const currentPrice = parseFloat(document.getElementById('ft-input-current-price').value) || 0;

      // Update Real-Time Piastre Breakdown (بالقروش)
      const buyBreakdown = document.getElementById('ft-buy-price-breakdown');
      if (buyBreakdown) buyBreakdown.innerText = formatPoundsAndPiastres(buyPrice);

      const curBreakdown = document.getElementById('ft-current-price-breakdown');
      if (curBreakdown) curBreakdown.innerText = formatPoundsAndPiastres(currentPrice);

      const newValue = shares * currentPrice;
      const totalCost = shares * buyPrice;
      const profit = newValue - totalCost;
      const returnPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      const isPositive = profit >= 0;

      // Box 1: اشتريت بكام؟ (التكلفة)
      const costEl = document.getElementById('ft-preview-cost');
      const costDetailEl = document.getElementById('ft-preview-cost-detail');
      if (costEl) costEl.innerHTML = `${Math.round(totalCost).toLocaleString('en-US')} <span class="text-[10px] text-gray-400 font-sans">ج.م</span>`;
      if (costDetailEl) costDetailEl.innerText = `${shares.toLocaleString('en-US')} سهم @ ${buyPrice.toFixed(2)} ج`;

      // Box 2: بقى بكام؟ (القيمة الآن)
      const valPreview = document.getElementById('ft-preview-value');
      const valDetailEl = document.getElementById('ft-preview-val-detail');
      if (valPreview) valPreview.innerHTML = `${Math.round(newValue).toLocaleString('en-US')} <span class="text-[10px] text-gray-400 font-sans">ج.م</span>`;
      if (valDetailEl) valDetailEl.innerText = `${shares.toLocaleString('en-US')} سهم @ ${currentPrice.toFixed(2)} ج`;

      // Box 3: التطور والفرق (المكسب / الخسارة)
      const profitPreview = document.getElementById('ft-preview-profit');
      const returnPctEl = document.getElementById('ft-preview-return-pct');
      if (profitPreview) {
        profitPreview.className = `font-bold font-mono text-xs sm:text-sm my-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`;
        profitPreview.innerText = `${isPositive ? '+' : ''}${Math.round(profit).toLocaleString('en-US')} ج.م`;
      }
      if (returnPctEl) {
        returnPctEl.className = `text-[9px] font-mono block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`;
        returnPctEl.innerText = `${isPositive ? '+' : ''}${returnPct.toFixed(2)}% ${isPositive ? 'نمو وتطور' : 'تراجع'}`;
      }
    }

    async function fetchSingleStockLivePrice() {
      const index = parseInt(document.getElementById('ft-asset-index').value, 10);
      const item = portfolioData[index];
      if (!item || !item.ticker) return;
      const badge = document.getElementById('ft-price-source-badge');
      if (badge) badge.innerText = 'جاري السحب...';
      try {
        const res = await fetch(`/api/prices?_t=${Date.now()}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.success && data.prices && data.prices[item.ticker]) {
          const live = data.prices[item.ticker];
          document.getElementById('ft-input-current-price').value = Number(live.price).toFixed(2);
          const nowStr = formatCairoTime(new Date());
          const ftUpdatedEl = document.getElementById('ft-price-updated-at');
          if (ftUpdatedEl) ftUpdatedEl.innerText = `آخر تحديث: ${nowStr}`;
          if (badge) {
            badge.className = 'px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold';
            badge.innerText = 'شاشة البورصة اللحظية';
          }
          recalcFineTunePreview();
        }
      } catch (e) {
        if (badge) badge.innerText = 'تعذر الاتصال';
      }
    }

    function applyFineTuning() {
      const index = parseInt(document.getElementById('ft-asset-index').value, 10);
      const item = portfolioData[index];
      if (!item) return;

      const shares = parseInt(document.getElementById('ft-input-shares').value, 10) || 0;
      const buyPrice = parseFloat(document.getElementById('ft-input-buy-price').value) || 0;
      const currentPrice = parseFloat(document.getElementById('ft-input-current-price').value) || 0;

      if (shares <= 0 || buyPrice <= 0 || currentPrice <= 0 || isNaN(shares) || isNaN(buyPrice) || isNaN(currentPrice)) {
        alert('يرجى إدخال عدد أسهم وأسعار شراء وأسعار سوق صحيحة وموجبة أكبر من الصفر.');
        return;
      }

      const newValue = Math.round(shares * currentPrice);
      const totalCost = shares * buyPrice;
      const profit = Math.round(newValue - totalCost);
      const returnPct = totalCost > 0 ? parseFloat(((profit / totalCost) * 100).toFixed(2)) : 0;

      const nowStr = formatCairoTime(new Date());

      item.shares = shares;
      item.buyPrice = buyPrice;
      item.currentPrice = currentPrice;
      item.value = newValue;
      item.profit = profit;
      item.returnPct = returnPct;
      item.status = profit >= 0 ? 'ربح' : 'تراجع';
      item.priceUpdatedAt = nowStr;
      item.priceSource = 'تعديل يدوي من المستخدم';
      item.decisionUpdatedAt = nowStr;
      item.decisionBasis = `سعر مدخل يدوياً: ${currentPrice.toFixed(2)} ج`;

      // Re-evaluate asset through core financial engine immediately
      if (typeof EGX_Engine !== 'undefined') {
        const evalResult = EGX_Engine.evaluateAsset(item, getMarketRegimeCode());
        item.advice = evalResult.advice;
        item.action = evalResult.action;
        item.alertLevel = evalResult.alertLevel;
      }

      savePortfolio();
      closeFineTuneModal();
    }


    // ==============================================
    // PHASE 7: PAPER TRADING SIMULATOR & LEDGER
    // ==============================================
    let simCash = 50000;
    let simPositions = [];

    function updateSimPriceFromSelect() {
      const ticker = document.getElementById('sim-trade-stock').value;
      const stock = fullMarketRadar.find(s => s.ticker === ticker);
      if (stock) {
        document.getElementById('sim-trade-price').value = stock.price;
      }
    }

    function executeSimulatedBuy() {
      const ticker = document.getElementById('sim-trade-stock').value;
      const price = parseFloat(document.getElementById('sim-trade-price').value) || 0;
      const amount = parseFloat(document.getElementById('sim-trade-amount').value) || 0;

      if (!ticker || price <= 0 || amount <= 0) {
        alert('يرجى اختيار السهم وإدخال سعر ومبلغ صحيح');
        return;
      }

      if (amount > simCash) {
        alert('رصيد الكاش الافتراضي المتاح لا يكفي لتنفيذ هذه العملية');
        return;
      }

      const stock = fullMarketRadar.find(s => s.ticker === ticker);
      const shares = Math.floor(amount / price);
      if (shares < 1) {
        alert(`المبلغ المدخل (${amount.toLocaleString('en-US')} ج) لا يكفي لشراء سهم واحد في ${stock ? stock.name : ticker} بسعر ${price.toFixed(2)} ج.`);
        return;
      }
      const totalCost = shares * price;

      simCash -= totalCost;

      simPositions.push({
        ticker: stock.ticker,
        name: stock.name,
        shares: shares,
        buyPrice: price,
        totalCost: totalCost,
        target: stock.target1,
        stopLoss: stock.stopLoss,
        date: formatCairoDateOnly(new Date())
      });

      renderSimPositions();
      alert(`✅ تم تنفيذ أمر الشراء التجريبي: ${shares} سهم في ${stock.name} بنجاح!`);
    }

    function closeSimPosition(index) {
      const pos = simPositions[index];
      if (!pos) return;

      const radarItem = (typeof fullMarketRadar !== 'undefined' && Array.isArray(fullMarketRadar)) 
        ? fullMarketRadar.find(p => p.ticker === pos.ticker) 
        : null;
      const currentPrice = radarItem && radarItem.price ? Number(radarItem.price) : Number(pos.buyPrice);
      const exitValue = Math.round(pos.shares * currentPrice);
      const realProfit = exitValue - pos.totalCost;
      const returnPct = pos.totalCost > 0 ? ((realProfit / pos.totalCost) * 100).toFixed(1) : '0';

      simCash += exitValue;
      simPositions.splice(index, 1);

      renderSimPositions();
      const profitMsg = realProfit >= 0 
        ? `🎉 تم إغلاق الصفقة بسعر السوق اللحظي (${currentPrice.toFixed(2)} ج) محققة ربحاً قدره +${realProfit.toLocaleString('en-US')} ج (+${returnPct}%)!`
        : `⚠️ تم إغلاق الصفقة بسعر السوق اللحظي (${currentPrice.toFixed(2)} ج) مع تراجع قدره ${realProfit.toLocaleString('en-US')} ج (${returnPct}%)!`;
      alert(profitMsg);
    }

    function renderSimPositions() {
      const tbody = document.getElementById('sim-positions-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      let totalStocksValue = 0;
      simPositions.forEach((pos, idx) => {
        totalStocksValue += pos.totalCost;
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-900/60 transition';
        tr.innerHTML = `
          <td class="py-2.5 px-3 font-bold text-white">${pos.name} (${pos.ticker})</td>
          <td class="py-2.5 px-3 font-mono text-gray-300">${pos.shares} سهم</td>
          <td class="py-2.5 px-3 font-mono text-white">${pos.buyPrice.toFixed(2)} ج</td>
          <td class="py-2.5 px-3 font-mono text-cyan-400 font-bold">${pos.totalCost.toLocaleString('en-US')} ج</td>
          <td class="py-2.5 px-3 font-mono text-rose-400 font-bold">${pos.stopLoss}</td>
          <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${pos.target}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="closeSimPosition(${idx})" class="px-2 py-1 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-[10px] transition cursor-pointer">
              إغلاق بسعر السوق اللحظي
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if (simPositions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-500">لا توجد صفقات تجريبية مفتوحة حالياً. اختر سهماً ونفذ شراءً وهمياً أعلاه.</td></tr>';
      }

      updateAutonomousSummaryMetrics();
    }

    function resetPaperTrading() {
      if (confirm('هل ترغب في إعادة ضبط المحفظة التجريبية إلى 50,000 ج؟')) {
        simCash = 50000;
        simPositions = [];
        renderSimPositions();
      }
    }

    // Sidebar Responsive Toggle Controls (Desktop & Mobile)

    function openPositionSizingModal(customEntry = null, customStop = null) {
      const modal = document.getElementById('position-sizing-modal');
      if (!modal) return;

      const totalCapital = portfolioData.reduce((acc, cur) => acc + (cur.value || 0), 0) || 219000;
      const capInput = document.getElementById('ps-total-capital');
      if (capInput) capInput.value = Math.round(totalCapital);

      const entryNum = parseFloat(customEntry);
      if (!isNaN(entryNum) && entryNum > 0) {
        const entryInput = document.getElementById('ps-entry-price');
        if (entryInput) entryInput.value = entryNum.toFixed(2);
      }

      const stopNum = parseFloat(customStop);
      const stopInput = document.getElementById('ps-stop-loss');
      if (stopInput) {
        if (!isNaN(stopNum) && stopNum > 0) {
          stopInput.value = stopNum.toFixed(2);
        } else if (!isNaN(entryNum) && entryNum > 0) {
          // Set a safe default 4% protective stop when technical stop is undefined or '--'
          stopInput.value = (entryNum * 0.96).toFixed(2);
        }
      }

      calculatePositionSize();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.lucide) lucide.createIcons();
    }

    function closePositionSizingModal() {
      const modal = document.getElementById('position-sizing-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function calculatePositionSize() {
      const totalCapital = parseFloat(document.getElementById('ps-total-capital')?.value) || 200000;
      const riskPct = parseFloat(document.getElementById('ps-risk-pct')?.value) || 1.5;
      const entryPrice = parseFloat(document.getElementById('ps-entry-price')?.value) || 100;
      const stopLoss = parseFloat(document.getElementById('ps-stop-loss')?.value) || 94;

      const maxRiskEl = document.getElementById('ps-max-risk-egp');
      const riskPerShareEl = document.getElementById('ps-risk-per-share');
      const resultSharesEl = document.getElementById('ps-result-shares');
      const resultCostEl = document.getElementById('ps-result-cost');
      const resultWeightEl = document.getElementById('ps-result-weight');

      if (entryPrice <= 0 || stopLoss <= 0) {
        if (riskPerShareEl) riskPerShareEl.innerText = '--';
        if (resultSharesEl) resultSharesEl.innerText = '--';
        if (resultCostEl) resultCostEl.innerText = '--';
        if (resultWeightEl) resultWeightEl.innerText = '--';
        return;
      }

      if (stopLoss >= entryPrice) {
        if (riskPerShareEl) riskPerShareEl.innerText = 'خطأ: الوقف أعلى أو مساوٍ لسعر الدخول';
        if (resultSharesEl) resultSharesEl.innerText = '0 سهم (ممنوع)';
        if (resultCostEl) resultCostEl.innerText = '0 ج.م';
        if (resultWeightEl) resultWeightEl.innerText = '0%';
        return;
      }

      const maxRiskEgp = Math.round(totalCapital * (riskPct / 100));
      // Impose a minimum risk buffer (1.5% of entry price) to prevent runaway leverage on ultra-tight stops
      const minRiskPerShare = Math.max(0.01, entryPrice * 0.015);
      const effectiveRiskPerShare = Math.max(minRiskPerShare, entryPrice - stopLoss);

      // 1. Cap by Risk
      const sharesByRisk = Math.floor(maxRiskEgp / effectiveRiskPerShare);
      // 2. Cap by Total Capital (Cash purchasing power constraint: Spot trading, no margin)
      const sharesByCapital = Math.floor(totalCapital / entryPrice);

      const maxShares = Math.max(0, Math.min(sharesByRisk, sharesByCapital));
      const totalInvestment = maxShares * entryPrice;
      const portfolioWeightPct = totalCapital > 0 ? ((totalInvestment / totalCapital) * 100).toFixed(1) : '0';

      if (maxRiskEl) maxRiskEl.innerText = `${maxRiskEgp.toLocaleString('en-US')} ج`;
      if (riskPerShareEl) riskPerShareEl.innerText = `${effectiveRiskPerShare.toFixed(2)} ج`;
      if (resultSharesEl) resultSharesEl.innerText = `${maxShares.toLocaleString('en-US')} سهم`;
      if (resultCostEl) resultCostEl.innerText = `${Math.round(totalInvestment).toLocaleString('en-US')} ج.م`;
      if (resultWeightEl) resultWeightEl.innerText = `${portfolioWeightPct}%`;
    }

    // Explicit Window Object Exposure for Inline Onclick Handlers
    window.recalcAssetModal = recalcAssetModal;
    window.openAddAssetModal = openAddAssetModal;
    window.editAsset = editAsset;
    window.closeAssetModal = closeAssetModal;
    window.generateThndrExtractorScript = generateThndrExtractorScript;
    window.openThndrSyncModal = openThndrSyncModal;
    window.closeThndrSyncModal = closeThndrSyncModal;
    window.copyThndrVerifiedScript = copyThndrVerifiedScript;
    window.pasteThndrFromClipboard = pasteThndrFromClipboard;
    window.handleManualThndrImportSubmit = handleManualThndrImportSubmit;
    window.downloadPortfolioBackupJSON = downloadPortfolioBackupJSON;
    window.copyPortfolioBackupJSON = copyPortfolioBackupJSON;
    window.applyThndrImport = applyThndrImport;
    window.checkUrlForThndrSync = checkUrlForThndrSync;
    window.openTradeModal = openTradeModal;
    window.closeTradeModal = closeTradeModal;
    window.setTradeMode = setTradeMode;
    window.populateTradeStockDropdown = populateTradeStockDropdown;
    window.toggleTradeCustomTicker = toggleTradeCustomTicker;
    window.onTradeStockSelected = onTradeStockSelected;
    window.recalcTradeSummary = recalcTradeSummary;
    window.handleExecuteTrade = handleExecuteTrade;
    window.handleSaveAsset = handleSaveAsset;
    window.deleteAsset = deleteAsset;
    window.openFineTuneModal = openFineTuneModal;
    window.closeFineTuneModal = closeFineTuneModal;
    window.adjustFineTuneShares = adjustFineTuneShares;
    window.formatPoundsAndPiastres = formatPoundsAndPiastres;
    window.adjustFineTunePrice = adjustFineTunePrice;
    window.recalcFineTunePreview = recalcFineTunePreview;
    window.fetchSingleStockLivePrice = fetchSingleStockLivePrice;
    window.applyFineTuning = applyFineTuning;
    window.updateSimPriceFromSelect = updateSimPriceFromSelect;
    window.executeSimulatedBuy = executeSimulatedBuy;
    window.closeSimPosition = closeSimPosition;
    window.renderSimPositions = renderSimPositions;
    window.resetPaperTrading = resetPaperTrading;
    window.openPositionSizingModal = openPositionSizingModal;
    window.closePositionSizingModal = closePositionSizingModal;
    window.calculatePositionSize = calculatePositionSize;
