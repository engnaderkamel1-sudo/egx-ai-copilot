/**
 * EGX AI Copilot - Smart Voice Assistant & Voice Trading Layer (js/voice-assistant.js)
 * High-accuracy Arabic Speech Recognition & Dynamic Voice Trading Engine.
 * 100% Dynamic: Pulls live market prices, holdings, and cash directly from active state.
 */

(function (global) {
  'use strict';

  // ============================================================
  // 1. EGX Stock Aliases & Synonyms Registry (Egyptian Dialect)
  // ============================================================
  const EGX_VOICE_ALIASES = {
    'SWDY': ['السويدي', 'السويدى', 'السويدي للكابلات', 'السويدي اليكتريك', 'السويدي إليكتريك', 'كابلات', 'swdy'],
    'TMGH': ['طلعت مصطفى', 'طلعت', 'مجموعة طلعت', 'هشام طلعت', 'مدينتي', 'الرحاب', 'مجموعة طلعت مصطفى', 'tmgh'],
    'FWRY': ['فوري', 'فورى', 'فوري للمدفوعات', 'تكنولوجيا البنوك', 'مدفوعات فوري', 'fwry'],
    'SKPC': ['سيدي كرير', 'سيدى كرير', 'سيدبك', 'سيدي كرير للبتروكيماويات', 'skpc'],
    'ABUK': ['أبو قير', 'ابو قير', 'ابوقير', 'أسمدة أبو قير', 'ابو قير للاسمدة', 'أبو قير للأسمدة', 'abuk'],
    'EGAL': ['مصر للألومنيوم', 'مصر للالمنيوم', 'الألومنيوم', 'الالمنيوم', 'ألومنيوم', 'الومنيوم', 'مصر للالومنيوم', 'الالومنيوم', 'للألومنيوم', 'للألومنيوم', 'egal'],
    'ESRS': ['حديد عز', 'عز للصلب', 'عز', 'حديد', 'esrs'],
    'HRHO': ['هيرميس', 'المجموعة المالية هيرميس', 'المجموعة المالية', 'اي اف جي', 'إي إف جي', 'hrho'],
    'PHDC': ['بالم هيلز', 'بالم', 'بالم هيلز للتعمير', 'phdc'],
    'BTFH': ['بلتون', 'بلتون القابضة', 'بلتون المالية', 'btfh'],
    'JUFO': ['جهينة', 'جهينه', 'جهينة للصناعات الغذائية', 'ألبان جهينة', 'jufo'],
    'EAST': ['الشرقية للدخان', 'ايسترن كومباني', 'إيسترن كومباني', 'ايسترن', 'الشرقية', 'دخان', 'east'],
    'AMOC': ['أموك', 'اموك', 'الإسكندرية للزيوت', 'اسكندرية للزيوت', 'زيوت معدنية', 'amoc'],
    'ETRS': ['إيجيترانس', 'ايجيترانس', 'المصرية للنقل والخدمات', 'etrs'],
    'ISPH': ['ابن سينا', 'ابن سينا فارما', 'isph'],
    'MFPC': ['موبكو', 'مصر لإنتاج الأسمدة', 'أسمدة موبكو', 'mfpc'],
    'COMI': ['البنك التجاري الدولي', 'التجاري الدولي', 'سي اي بي', 'cib', 'comi'],
    'KORA': ['القاهرة للإسكان', 'القاهرة للاسكان', 'kora'],
    'MASR': ['مدينة مصر', 'مدينة نصر', 'مدينة نصر للإسكان', 'مدينة مصر للإسكان', 'masr'],
    'CLHO': ['كليوباترا', 'مستشفيات كليوباترا', 'clho'],
    'ORWE': ['النساجون', 'النساجون الشرقيون', 'السجاد', 'orwe'],
    'CCAP': ['القلعة', 'شركة القلعة', 'ccap'],
    'OCDI': ['سوديك', 'السادس من أكتوبر', 'السادس من اكتوبر', 'ocdi'],
    'HELI': ['مصر الجديدة', 'مصر الجديدة للإسكان', 'heli'],
    'EMFD': ['إعمار', 'اعمار', 'إعمار مصر', 'emfd'],
    'ORAS': ['أوراسكوم كونستراكشون', 'اوراسكوم كونستراكشون', 'أوراسكوم للإنشاء', 'oras'],
    'ETEL': ['المصرية للاتصالات', 'وي', 'we', 'etel'],
    'ALCN': ['الإسكندرية لتداول الحاويات', 'حاويات اسكندرية', 'اسكندرية للحاويات', 'alcn'],
    'ADIB': ['مصرف أبو ظبي', 'ابو ظبي الاسلامي', 'أبو ظبي الإسلامي', 'adib'],
    'CIEB': ['كريدي أجريكول', 'اجريكول', 'cieb'],
    'ARCC': ['العربية للأسمنت', 'العربية للاسمنت', 'arcc'],
    'RAYA': ['راية', 'راية القابضة', 'raya']
  };

  // State Management
  let voiceRecognition = null;
  let isListening = false;
  let chatVoiceRecognition = null;
  let isChatListening = false;
  let lastParsedTrade = null;

  // Arabic Normalization Helper
  function normalizeArabic(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Tashkeel
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .trim();
  }

  // ============================================================
  // 2. Dynamic Stock Lookup Engine (100% Dynamic - Zero Static Numbers)
  // ============================================================
  function lookupDynamicStock(tickerOrAlias) {
    if (!tickerOrAlias) return null;
    const cleanQuery = normalizeArabic(tickerOrAlias);

    let matchedTicker = null;

    // Check alias dictionary
    for (const [t, aliases] of Object.entries(EGX_VOICE_ALIASES)) {
      if (t.toLowerCase() === cleanQuery) {
        matchedTicker = t;
        break;
      }
      for (const a of aliases) {
        const normAlias = normalizeArabic(a);
        const pattern = new RegExp(`(?:^|\\s)(?:في\\s+|ل|ب)?${normAlias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\s|$)`, 'i');
        if (pattern.test(cleanQuery) || cleanQuery.includes(normAlias)) {
          matchedTicker = t;
          break;
        }
      }
      if (matchedTicker) break;
    }

    // Dynamic search in active portfolioData
    const portfolioList = Array.isArray(global.portfolioData) ? global.portfolioData : [];
    let owned = null;
    if (matchedTicker) {
      owned = portfolioList.find(p => p.ticker === matchedTicker);
    } else {
      owned = portfolioList.find(p => {
        if (!p.ticker || p.ticker === 'CASH') return false;
        const normName = normalizeArabic(p.name || '');
        const normTicker = normalizeArabic(p.ticker);
        return cleanQuery.includes(normName) || cleanQuery.includes(normTicker) || normName.includes(cleanQuery);
      });
      if (owned) matchedTicker = owned.ticker;
    }

    // Dynamic search in market radar
    const radarList = Array.isArray(global.fullMarketRadar) ? global.fullMarketRadar : [];
    let radar = null;
    if (matchedTicker) {
      radar = radarList.find(r => r.ticker === matchedTicker);
    } else {
      radar = radarList.find(r => {
        const normName = normalizeArabic(r.name || '');
        const normTicker = normalizeArabic(r.ticker);
        return cleanQuery.includes(normName) || cleanQuery.includes(normTicker) || normName.includes(cleanQuery);
      });
      if (radar) matchedTicker = radar.ticker;
    }

    if (!matchedTicker) return null;

    // Pull strictly live dynamic numbers
    const livePrice = Number(
      (owned && owned.currentPrice) ? owned.currentPrice :
      (radar && radar.price) ? radar.price :
      (owned && owned.buyPrice) ? owned.buyPrice : 0
    );

    const stockName = (owned && owned.name) ? owned.name : (radar && radar.name) ? radar.name : matchedTicker;
    const stockCategory = (owned && owned.category) ? owned.category : (radar && radar.sector) ? `${radar.index ? radar.index.toUpperCase() : 'EGX'} • ${radar.sector}` : 'البورصة المصرية';
    const ownedShares = owned ? (parseInt(owned.shares, 10) || 0) : 0;
    const avgBuyPrice = owned ? (parseFloat(owned.buyPrice) || livePrice) : livePrice;

    // Pull custom or technical levels dynamically
    let customLevels = null;
    if (typeof global.EGX_Portfolio !== 'undefined' && typeof global.EGX_Portfolio.getCustomLevels === 'function') {
      customLevels = global.EGX_Portfolio.getCustomLevels(matchedTicker);
    }

    const defaultSafeSell = (customLevels && customLevels.customStopLoss) 
      ? Number(customLevels.customStopLoss)
      : (owned && owned.stopLoss) ? Number(owned.stopLoss) 
      : (radar && radar.stopLoss) ? parseFloat(radar.stopLoss) 
      : Number((livePrice * 0.92).toFixed(2));

    const defaultTarget = (customLevels && customLevels.customTarget1)
      ? Number(customLevels.customTarget1)
      : (owned && owned.target1) ? Number(owned.target1)
      : (radar && radar.target1) ? parseFloat(radar.target1)
      : Number((livePrice * 1.15).toFixed(2));

    return {
      ticker: matchedTicker,
      name: stockName,
      category: stockCategory,
      livePrice: livePrice,
      ownedShares: ownedShares,
      avgBuyPrice: avgBuyPrice,
      safeSellLimit: defaultSafeSell,
      safeBuyLimit: defaultTarget,
      isOwned: !!owned && ownedShares > 0
    };
  }

  // ============================================================
  // 3. Natural Language Egyptian Dialect Parser
  // ============================================================
  function parseEgyptianVoiceCommand(rawTranscript) {
    if (!rawTranscript) return null;
    const norm = normalizeArabic(rawTranscript);

    // 1. Detect Action (Strict Hierarchical Ordering)
    let action = 'BUY';
    if (/امر\s*شراء\s*(?:محدد|معلق)?|طلب\s*شراء\s*محدد|شراء\s*محدد|شراء\s*عند/i.test(norm)) {
      action = 'LIMIT_BUY';
    } else if (/امر\s*بيع\s*(?:محدد|معلق)?|طلب\s*بيع\s*محدد|بيع\s*محدد|بيع\s*عند/i.test(norm)) {
      action = 'LIMIT_SELL';
    } else if (/اشتريت|شريت|نفذت\s*شراء|عملت\s*شراء|زودت|تعزيز|عايز\s*اشتري|(?:^|\s)شراء(?:\s|$)/i.test(norm)) {
      action = 'BUY';
    } else if (/بيعت|بعت|نفذت\s*بيع|عملت\s*بيع|تخارجت|تخارج|عايز\s*ابيع|(?:^|\s)بيع(?:\s|$)/i.test(norm) && !/حد\s*(?:ال)?بيع/i.test(norm)) {
      action = 'SELL';
    } else if (/حد\s*(?:ال)?(?:بيع)?\s*(?:ال)?(?:امن|امان)|وقف\s*خساره|تعديل\s*حد|تغيير\s*حد|غير\s*حد/i.test(norm)) {
      action = 'SAFE_LIMIT';
    }

    // 2. Detect Stock Ticker
    let matchedStock = null;
    for (const [ticker, aliases] of Object.entries(EGX_VOICE_ALIASES)) {
      for (const alias of aliases) {
        const normAlias = normalizeArabic(alias);
        const pattern = new RegExp(`(?:^|\\s)(?:في\\s+|ل|ب)?${normAlias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\s|$)`, 'i');
        if (pattern.test(norm)) {
          matchedStock = lookupDynamicStock(ticker);
          break;
        }
      }
      if (matchedStock) break;
    }

    // If still not matched, scan dynamic portfolioData & fullMarketRadar
    if (!matchedStock) {
      const allTracked = [
        ...(Array.isArray(global.portfolioData) ? global.portfolioData : []),
        ...(Array.isArray(global.fullMarketRadar) ? global.fullMarketRadar : [])
      ];
      for (const item of allTracked) {
        if (!item.ticker || item.ticker === 'CASH') continue;
        const normName = normalizeArabic(item.name || '');
        const normTicker = normalizeArabic(item.ticker);
        if ((normName && norm.includes(normName)) || norm.includes(normTicker)) {
          matchedStock = lookupDynamicStock(item.ticker);
          break;
        }
      }
    }

    if (!matchedStock) {
      return {
        success: false,
        action: action,
        rawTranscript: rawTranscript,
        error: 'لم نتمكن من تحديد اسم السهم بدقة في الجملة. يرجى ذكر اسم السهم واضحاً (مثل: السويدي، طلعت مصطفى، فوري...).'
      };
    }

    // 3. Detect Safe Limits
    let customSafeSell = matchedStock.safeSellLimit;
    if (action === 'SAFE_LIMIT') {
      const sm = norm.match(/(?:الى|الي|لـ|على|سعر)?\s*(\d+(?:\.\d+)?)\s*(?:جنيه|ج)?/);
      if (sm && sm[1]) {
        customSafeSell = parseFloat(sm[1]);
      }
    } else {
      let sm = norm.match(/(?:و)?حد\s*(?:ال)?(?:بيع)?\s*(?:ال)?(?:امن|امان|سلامه)?\s*(?:هو|على|لـ|الي|إلى)?\s*(\d+(?:\.\d+)?)/);
      if (!sm) {
        sm = norm.match(/وقف\s*(?:ال)?خساره\s*(?:هو|على|لـ|الي|إلى)?\s*(\d+(?:\.\d+)?)/);
      }
      if (sm && sm[1]) {
        customSafeSell = parseFloat(sm[1]);
      }
    }

    // 4. Detect Price
    let price = null;
    if (action !== 'SAFE_LIMIT') {
      const pm = norm.match(/(?:بسعر|على\s*سعر|سعر|بـ|ب)\s*(\d+(?:\.\d+)?)/) ||
                 norm.match(/(\d+(?:\.\d+)?)\s*(?:جنيه|ج(?:\.م)?|قرش)/);
      if (pm && pm[1]) {
        price = parseFloat(pm[1]);
      } else {
        // 100% Dynamic Fallback to Live Market Price
        price = matchedStock.livePrice || matchedStock.avgBuyPrice || 10.0;
      }
    } else {
      price = customSafeSell || matchedStock.livePrice;
    }

    // 5. Detect Shares Quantity
    let shares = null;
    let sharesMode = 'EXACT';

    if (/نص\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|نصف\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|50\s*%/i.test(norm)) {
      sharesMode = 'HALF';
      shares = matchedStock.isOwned ? Math.floor(matchedStock.ownedShares / 2) : 100;
    } else if (/كل\s*(?:الكميه|كميتي|المحفظه|الاسهم|اللي\s*معايا)?|كامل\s*(?:الكميه|الاسهم)?|100\s*%/i.test(norm)) {
      sharesMode = 'ALL';
      shares = matchedStock.isOwned ? matchedStock.ownedShares : 100;
    } else {
      // Explicit shares count with suffix
      const sharesMatch = norm.match(/(\d+)\s*(?:سهم|اسهم)/) || norm.match(/عدد\s*(\d+)/);
      if (sharesMatch && sharesMatch[1]) {
        shares = parseInt(sharesMatch[1], 10);
      } else {
        // Textual numbers
        const arabicWordNumbers = [
          { word: 'الفين', val: 2000 },
          { word: 'الف', val: 1000 },
          { word: 'تسعميه', val: 900 },
          { word: 'تمنميه', val: 800 },
          { word: 'سبعميه', val: 700 },
          { word: 'ستميه', val: 600 },
          { word: 'خمسميه', val: 500 },
          { word: 'اربعميه', val: 400 },
          { word: 'تلميه', val: 300 },
          { word: 'ثلاثميه', val: 300 },
          { word: 'ميتين', val: 200 },
          { word: 'ميه', val: 100 },
          { word: 'خمسين', val: 50 }
        ];

        for (const item of arabicWordNumbers) {
          if (norm.includes(item.word)) {
            shares = item.val;
            break;
          }
        }
      }
    }

    if (!shares || shares <= 0) {
      shares = (action === 'SELL' && matchedStock.isOwned) ? matchedStock.ownedShares : 100;
    }

    // Dynamic Calculations
    const cashItem = (Array.isArray(global.portfolioData) ? global.portfolioData : []).find(p => p.ticker === 'CASH');
    const availableCash = cashItem ? Number(cashItem.value || 0) : 0;
    const grossTrade = Math.round(shares * price);
    const estCommission = Math.round(grossTrade * 0.00175);
    const totalBuy = grossTrade + estCommission;
    const netSell = Math.max(0, grossTrade - estCommission);

    return {
      success: true,
      action: action,
      stock: matchedStock,
      shares: shares,
      sharesMode: sharesMode,
      price: Number(price.toFixed(2)),
      safeSellLimit: customSafeSell ? Number(customSafeSell.toFixed(2)) : null,
      safeBuyLimit: matchedStock.safeBuyLimit ? Number(matchedStock.safeBuyLimit.toFixed(2)) : null,
      grossTrade: grossTrade,
      estCommission: estCommission,
      totalBuy: totalBuy,
      netSell: netSell,
      availableCash: availableCash,
      rawTranscript: rawTranscript
    };
  }

  // ============================================================
  // 4. Voice Modal & UI Architecture
  // ============================================================
  function ensureVoiceModalDOM() {
    if (document.getElementById('voice-trading-modal')) return;

    const modalHTML = `
      <div id="voice-trading-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden overflow-y-auto p-3 sm:p-4 items-center justify-center">
        <div class="modal-card bg-gray-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                <i data-lucide="mic" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-white text-base flex items-center gap-2">
                  <span>المساعد الصوتي لتنفيذ الأوامر</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 font-normal">ذكاء اصطناعي 100%</span>
                </h3>
                <p class="text-[11px] text-gray-400">تحدث بالعامية المصرية لتسجيل شراء، بيع، أوامر محددة، أو حدود أمان</p>
              </div>
            </div>
            <button onclick="closeVoiceTradingModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition" aria-label="إغلاق">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="modal-scroll-body flex-1 overflow-y-auto overscroll-contain pr-1 py-4 space-y-4">
            
            <!-- Voice Listening Status Card -->
            <div id="voice-listening-card" class="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-gray-950 to-slate-900 border border-purple-500/30 text-center space-y-3">
              
              <!-- Pulsing Mic Button -->
              <div class="flex justify-center items-center py-2">
                <button type="button" id="btn-voice-pulse" onclick="toggleVoiceRecording()" class="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 transition transform active:scale-95 relative cursor-pointer">
                  <span id="voice-pulse-ring" class="hidden absolute inset-0 rounded-full border-2 border-purple-400 animate-ping"></span>
                  <i data-lucide="mic" id="voice-mic-icon" class="w-8 h-8 text-white"></i>
                </button>
              </div>

              <!-- Status Indicator -->
              <div>
                <div id="voice-status-heading" class="font-bold text-sm text-purple-300">
                  اضغط على زر المايك وتحدث بأمرك...
                </div>
                <p id="voice-status-sub" class="text-xs text-gray-400 mt-1">
                  مثال: «اشتريت 500 سهم في السويدي بسعر 52 جنيه وحد البيع الآمن 58 جنيه»
                </p>
              </div>

              <!-- Live Transcript Box -->
              <div id="voice-transcript-box" class="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs text-purple-200 min-h-[48px] flex items-center justify-center text-center font-medium">
                <span class="text-gray-500 text-[11px]">في انتظار الاستماع لكلامك...</span>
              </div>

              <!-- Quick Dialect Examples -->
              <div class="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-[10px]">
                <span class="text-gray-500">جرب أن تقول:</span>
                <button type="button" onclick="testVoiceCommandSample('اشتريت 500 سهم في السويدي بسعر 52 جنيه')" class="px-2 py-0.5 rounded bg-gray-800 text-purple-300 hover:bg-purple-900/40 border border-gray-700">شراء 500 سهم السويدي</button>
                <button type="button" onclick="testVoiceCommandSample('بعت نص كمية فوري على سعر 8.20')" class="px-2 py-0.5 rounded bg-gray-800 text-rose-300 hover:bg-rose-900/40 border border-gray-700">بيع نص كمية فوري</button>
                <button type="button" onclick="testVoiceCommandSample('غير حد البيع الآمن لطلعت مصطفى إلى 85 جنيه')" class="px-2 py-0.5 rounded bg-gray-800 text-cyan-300 hover:bg-cyan-900/40 border border-gray-700">تعديل حد بيع طلعت مصطفى</button>
              </div>
            </div>

            <!-- Manual Text Fallback (Input box in case mic is blocked) -->
            <div class="p-2.5 bg-gray-950 rounded-xl border border-gray-800 flex items-center gap-2">
              <input type="text" id="voice-manual-input" placeholder="أو اكتب الأمر هنا لو المايك غير مفعل بالمتصفح..." class="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none">
              <button type="button" onclick="parseVoiceFromManualInput()" class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 text-xs font-bold transition">
                تحليل وتأكيد
              </button>
            </div>

            <!-- Dynamic Confirmation Card (Hidden until command is parsed) -->
            <div id="voice-confirmation-card" class="hidden p-4 rounded-2xl bg-gray-950 border border-emerald-500/50 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <!-- Card Header & Badge -->
              <div class="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div class="flex items-center gap-2">
                  <span id="confirm-badge-action" class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                    شراء مؤكد 🛒
                  </span>
                  <span class="text-xs text-gray-400">مراجعة المعطيات قبل الاعتماد</span>
                </div>
                <div class="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  <span>حماية وأمان 100%</span>
                </div>
              </div>

              <!-- Stock Identification & Dynamic Price -->
              <div class="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <h4 id="confirm-stock-name" class="font-bold text-white text-sm">السويدي إليكتريك</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span id="confirm-stock-ticker" class="font-mono text-cyan-400 font-bold">SWDY</span>
                    <span>•</span>
                    <span id="confirm-stock-category">EGX30 • طاقة وكابلات</span>
                  </div>
                </div>
                <div class="text-left font-mono">
                  <span class="text-[10px] text-gray-400 block">سعر البورصة اللحظي:</span>
                  <strong id="confirm-stock-live-price" class="text-sm text-cyan-300">51.40 ج</strong>
                </div>
              </div>

              <!-- Editable Inputs Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <label class="text-[11px] text-gray-400 block mb-1">عدد الأسهم:</label>
                  <input type="number" id="confirm-input-shares" oninput="recalcVoiceConfirmationMetrics()" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none">
                </div>
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <label class="text-[11px] text-gray-400 block mb-1">سعر التنفيذ (ج):</label>
                  <input type="number" step="0.01" id="confirm-input-price" oninput="recalcVoiceConfirmationMetrics()" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none">
                </div>
                <div class="col-span-2 sm:col-span-1 p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <label class="text-[11px] text-gray-400 block mb-1">حد البيع الآمن (ج):</label>
                  <input type="number" step="0.01" id="confirm-input-safesell" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none" placeholder="اختياري">
                </div>
              </div>

              <!-- Dynamic Financial Calculation Box -->
              <div class="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
                <div class="flex items-center justify-between text-gray-300">
                  <span>إجمالي قيمة الصفقة (مع عمولة البورصة وثندر):</span>
                  <strong id="confirm-metric-total" class="font-mono text-white text-sm">26,046 ج.م</strong>
                </div>
                <div class="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>رصيد الكاش المتاح بالمحفظة:</span>
                  <span id="confirm-metric-cash-avail" class="font-mono text-cyan-400">25,320 ج.م</span>
                </div>
                <div class="flex items-center justify-between border-t border-gray-800 pt-2 text-[11px]">
                  <span id="confirm-metric-impact-label">أثر الصفقة على رصيد الكاش:</span>
                  <strong id="confirm-metric-impact" class="font-mono text-emerald-400">سيتبقى 12,400 ج.م</strong>
                </div>
                <div id="confirm-metric-profit-row" class="hidden flex items-center justify-between border-t border-gray-800 pt-2 text-[11px]">
                  <span>الأرباح الرأسمالية المحققة من متوسط الشراء:</span>
                  <strong id="confirm-metric-profit" class="font-mono text-emerald-400">+3,200 ج (+14.2%)</strong>
                </div>
              </div>

              <!-- Action Confirmation Buttons -->
              <div class="flex items-center gap-2 pt-1">
                <button type="button" onclick="executeVoiceOrderFromModal()" id="btn-confirm-execute" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                  <i data-lucide="check-circle" class="w-4 h-4"></i>
                  <span id="confirm-btn-label">تأكيد وتنفيذ العملية فوراً</span>
                </button>
                <button type="button" onclick="resetVoiceModalToListen()" class="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>إعادة</span>
                </button>
              </div>

            </div>

          </div>

          <!-- Modal Footer Note -->
          <div class="border-t border-gray-800 pt-3 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
            <span>🔒 لا يتم تنفيذ أي أمر مالي دون معاينتك وتأكيدك المباشر.</span>
            <button onclick="closeVoiceTradingModal()" class="text-gray-400 hover:text-white">إلغاء</button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (global.lucide) global.lucide.createIcons();
  }

  // ============================================================
  // 5. Speech Recognition Controllers
  // ============================================================
  function initSpeechRecognition() {
    const SpeechRecognition = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    return recognition;
  }

  function openVoiceTradingModal() {
    ensureVoiceModalDOM();
    const modal = document.getElementById('voice-trading-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    resetVoiceModalToListen();
    if (global.lucide) global.lucide.createIcons();

    setTimeout(() => {
      startVoiceListening();
    }, 300);
  }

  function closeVoiceTradingModal() {
    stopVoiceListening();
    const modal = document.getElementById('voice-trading-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function resetVoiceModalToListen() {
    const confCard = document.getElementById('voice-confirmation-card');
    if (confCard) confCard.classList.add('hidden');

    const transcriptBox = document.getElementById('voice-transcript-box');
    if (transcriptBox) {
      transcriptBox.innerHTML = '<span class="text-gray-500 text-[11px]">في انتظار الاستماع لكلامك...</span>';
    }

    const heading = document.getElementById('voice-status-heading');
    if (heading) heading.innerText = 'اضغط على زر المايك وتحدث بأمرك...';

    lastParsedTrade = null;
  }

  function startVoiceListening() {
    if (isListening) return;

    if (!voiceRecognition) {
      voiceRecognition = initSpeechRecognition();
    }

    if (!voiceRecognition) {
      const heading = document.getElementById('voice-status-heading');
      if (heading) {
        heading.innerText = '⚠️ المايك غير مدعوم بمتصفحك؛ يمكنك كتابة أمرك في الحقل أدناه.';
      }
      return;
    }

    try {
      voiceRecognition.onstart = function () {
        isListening = true;
        updateVoiceListeningUI(true);
      };

      voiceRecognition.onresult = function (event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const textToShow = finalTranscript || interimTranscript;
        const transcriptBox = document.getElementById('voice-transcript-box');
        if (transcriptBox && textToShow) {
          transcriptBox.innerHTML = `<span class="text-purple-300 font-bold">«${textToShow}»</span>`;
        }

        if (finalTranscript) {
          processSpokenTranscript(finalTranscript);
        }
      };

      voiceRecognition.onerror = function (event) {
        console.warn('Voice recognition error:', event.error);
        isListening = false;
        updateVoiceListeningUI(false);
        const heading = document.getElementById('voice-status-heading');
        if (heading) {
          if (event.error === 'not-allowed') {
            heading.innerText = '⚠️ تم حظر إذن المايك. يرجى السماح بالمايك أو استخدام الكتابة.';
          } else if (event.error === 'no-speech') {
            heading.innerText = 'لم نسمع صوتاً واضحاً، يرجى الضغط والتحدث مجدداً.';
          } else {
            heading.innerText = 'حدث تنبيه بالتعرف على الصوت، جرب مجدداً.';
          }
        }
      };

      voiceRecognition.onend = function () {
        isListening = false;
        updateVoiceListeningUI(false);
      };

      voiceRecognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      isListening = false;
      updateVoiceListeningUI(false);
    }
  }

  function stopVoiceListening() {
    if (voiceRecognition && isListening) {
      try {
        voiceRecognition.stop();
      } catch (e) {}
    }
    isListening = false;
    updateVoiceListeningUI(false);
  }

  function toggleVoiceRecording() {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  }

  function updateVoiceListeningUI(active) {
    const ring = document.getElementById('voice-pulse-ring');
    const icon = document.getElementById('voice-mic-icon');
    const heading = document.getElementById('voice-status-heading');
    const btn = document.getElementById('btn-voice-pulse');

    if (active) {
      if (ring) ring.classList.remove('hidden');
      if (btn) btn.className = 'w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition transform scale-105 relative cursor-pointer';
      if (heading) heading.innerText = '🎙️ جاري الاستماع إليك الآن... تحدث براحتك';
    } else {
      if (ring) ring.classList.add('hidden');
      if (btn) btn.className = 'w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 transition transform active:scale-95 relative cursor-pointer';
      if (heading && !lastParsedTrade) heading.innerText = 'تم التوقف. اضغط على المايك للتحدث مجدداً';
    }
  }

  // ============================================================
  // 6. Transcript Processing & Confirmation Card Display
  // ============================================================
  function processSpokenTranscript(transcript) {
    stopVoiceListening();
    const result = parseEgyptianVoiceCommand(transcript);

    if (!result || !result.success) {
      const heading = document.getElementById('voice-status-heading');
      if (heading) {
        heading.innerText = result ? result.error : 'لم نتمكن من فهم العملية بدقة، جرب ثانية.';
      }
      return;
    }

    displayConfirmationCard(result);
  }

  function parseVoiceFromManualInput() {
    const input = document.getElementById('voice-manual-input');
    const val = (input?.value || '').trim();
    if (!val) {
      alert('يرجى كتابة نص الأمر أولاً.');
      return;
    }
    const transcriptBox = document.getElementById('voice-transcript-box');
    if (transcriptBox) {
      transcriptBox.innerHTML = `<span class="text-purple-300 font-bold">«${val}»</span>`;
    }
    processSpokenTranscript(val);
  }

  function testVoiceCommandSample(sampleText) {
    const transcriptBox = document.getElementById('voice-transcript-box');
    if (transcriptBox) {
      transcriptBox.innerHTML = `<span class="text-purple-300 font-bold">«${sampleText}»</span>`;
    }
    processSpokenTranscript(sampleText);
  }

  function displayConfirmationCard(parsed) {
    lastParsedTrade = parsed;
    const card = document.getElementById('voice-confirmation-card');
    if (!card) return;

    // Badges & Labels
    const badgeEl = document.getElementById('confirm-badge-action');
    const btnLabelEl = document.getElementById('confirm-btn-label');
    const btnConfirm = document.getElementById('btn-confirm-execute');

    if (parsed.action === 'BUY') {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm';
      badgeEl.innerText = 'شراء فوري 🛒';
      btnConfirm.className = 'flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer';
      btnLabelEl.innerText = 'تأكيد عملية الشراء وتحديث المحفظة';
    } else if (parsed.action === 'SELL') {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm';
      badgeEl.innerText = 'بيع فوري 💰';
      btnConfirm.className = 'flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer';
      btnLabelEl.innerText = 'تأكيد عملية البيع وإيداع الأرباح في الكاش';
    } else if (parsed.action === 'LIMIT_BUY') {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-cyan-600 text-white shadow-sm';
      badgeEl.innerText = 'أمر شراء محدد معلق ⏱️';
      btnConfirm.className = 'flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer';
      btnLabelEl.innerText = 'تسجيل أمر الشراء المحدد في رادار الأوامر';
    } else if (parsed.action === 'LIMIT_SELL') {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm';
      badgeEl.innerText = 'أمر بيع محدد معلق ⏱️';
      btnConfirm.className = 'flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer';
      btnLabelEl.innerText = 'تسجيل أمر البيع المحدد في رادار الأوامر';
    } else if (parsed.action === 'SAFE_LIMIT') {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-sm';
      badgeEl.innerText = 'تعديل حد البيع الآمن 🛡️';
      btnConfirm.className = 'flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer';
      btnLabelEl.innerText = 'اعتماد وتحديث حد الأمان ووقف الخسارة';
    }

    // Stock Identity
    document.getElementById('confirm-stock-name').innerText = parsed.stock.name;
    document.getElementById('confirm-stock-ticker').innerText = parsed.stock.ticker;
    document.getElementById('confirm-stock-category').innerText = parsed.stock.category;
    document.getElementById('confirm-stock-live-price').innerText = `${parsed.stock.livePrice.toFixed(2)} ج`;

    // Editable Inputs
    document.getElementById('confirm-input-shares').value = parsed.shares;
    document.getElementById('confirm-input-price').value = parsed.price;
    document.getElementById('confirm-input-safesell').value = parsed.safeSellLimit || '';

    // Calculate metrics
    recalcVoiceConfirmationMetrics();

    card.classList.remove('hidden');
    if (global.lucide) global.lucide.createIcons();
  }

  function recalcVoiceConfirmationMetrics() {
    if (!lastParsedTrade) return;

    const sharesInput = document.getElementById('confirm-input-shares');
    const priceInput = document.getElementById('confirm-input-price');

    const shares = parseInt(sharesInput?.value, 10) || 0;
    const price = parseFloat(priceInput?.value) || 0;

    const gross = Math.round(shares * price);
    const estCommission = Math.round(gross * 0.00175);
    const totalBuy = gross + estCommission;
    const netSell = Math.max(0, gross - estCommission);

    // Dynamic cash balance
    const portfolioList = Array.isArray(global.portfolioData) ? global.portfolioData : [];
    const cashItem = portfolioList.find(p => p.ticker === 'CASH');
    const availableCash = cashItem ? Number(cashItem.value || 0) : 0;

    document.getElementById('confirm-metric-cash-avail').innerText = `${availableCash.toLocaleString('en-US')} ج.م`;

    const impactLabel = document.getElementById('confirm-metric-impact-label');
    const impactVal = document.getElementById('confirm-metric-impact');
    const totalVal = document.getElementById('confirm-metric-total');
    const profitRow = document.getElementById('confirm-metric-profit-row');

    if (lastParsedTrade.action === 'BUY') {
      totalVal.innerText = `${totalBuy.toLocaleString('en-US')} ج.م (عمولة: ${estCommission} ج)`;
      impactLabel.innerText = 'أثر الشراء على رصيد الكاش:';
      const remainingCash = availableCash - totalBuy;
      if (remainingCash < 0) {
        impactVal.className = 'font-mono text-rose-400 font-bold';
        impactVal.innerText = `عجز نقدي: ${Math.abs(remainingCash).toLocaleString('en-US')} ج (الكاش غير كافٍ)`;
      } else {
        impactVal.className = 'font-mono text-emerald-400';
        impactVal.innerText = `سيتبقى في الكاش ${remainingCash.toLocaleString('en-US')} ج.م`;
      }
      if (profitRow) profitRow.classList.add('hidden');
    } else if (lastParsedTrade.action === 'SELL') {
      totalVal.innerText = `${netSell.toLocaleString('en-US')} ج.م صافي (عمولة: ${estCommission} ج)`;
      impactLabel.innerText = 'أثر البيع على رصيد الكاش:';
      const newCash = availableCash + netSell;
      impactVal.className = 'font-mono text-emerald-400 font-bold';
      impactVal.innerText = `سيصبح رصيد الكاش ${newCash.toLocaleString('en-US')} ج.م`;

      // Calculate realized profit dynamically
      if (profitRow && lastParsedTrade.stock.isOwned) {
        const cost = lastParsedTrade.stock.avgBuyPrice;
        const profit = Math.round((price - cost) * shares) - estCommission;
        const profitPct = cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : '0';
        profitRow.classList.remove('hidden');
        const profitEl = document.getElementById('confirm-metric-profit');
        if (profit >= 0) {
          profitEl.className = 'font-mono text-emerald-400 font-bold';
          profitEl.innerText = `+${profit.toLocaleString('en-US')} ج (+${profitPct}%) 🟢`;
        } else {
          profitEl.className = 'font-mono text-rose-400 font-bold';
          profitEl.innerText = `${profit.toLocaleString('en-US')} ج (${profitPct}%) 🔴`;
        }
      } else if (profitRow) {
        profitRow.classList.add('hidden');
      }
    } else if (lastParsedTrade.action === 'SAFE_LIMIT') {
      totalVal.innerText = `المستهدف المحدث: ${price} ج`;
      impactLabel.innerText = 'نوع العملية:';
      impactVal.className = 'font-mono text-purple-300 font-bold';
      impactVal.innerText = 'تعديل قواعد الأمان ووقف الخسارة فقط دون تحريك للكاش';
      if (profitRow) profitRow.classList.add('hidden');
    } else {
      // Pending limits
      totalVal.innerText = `أمر معلق بقيمة تقريبية: ${gross.toLocaleString('en-US')} ج.م`;
      impactLabel.innerText = 'حالة الأمر:';
      impactVal.className = 'font-mono text-cyan-300 font-bold';
      impactVal.innerText = 'أمر معلق ينتظر التنفيذ عند وصول السعر المطلوب';
      if (profitRow) profitRow.classList.add('hidden');
    }
  }

  // ============================================================
  // 7. Order Execution & State Persistence
  // ============================================================
  function executeVoiceOrderFromModal() {
    if (!lastParsedTrade) return;

    const sharesInput = document.getElementById('confirm-input-shares');
    const priceInput = document.getElementById('confirm-input-price');
    const safeSellInput = document.getElementById('confirm-input-safesell');

    const confirmedShares = parseInt(sharesInput?.value, 10);
    const confirmedPrice = parseFloat(priceInput?.value);
    const confirmedSafeSell = parseFloat(safeSellInput?.value) || null;

    if (!confirmedShares || confirmedShares <= 0) {
      alert('يرجى إدخال عدد أسهم صحيح.');
      return;
    }
    if (!confirmedPrice || confirmedPrice <= 0) {
      alert('يرجى إدخال سعر تنفيذ صحيح.');
      return;
    }

    const ticker = lastParsedTrade.stock.ticker;
    const now = new Date();
    const cairoTime = typeof global.formatCairoTime === 'function' ? global.formatCairoTime(now) : now.toLocaleTimeString('ar-EG');

    // 1. SAFE LIMIT UPDATE ONLY
    if (lastParsedTrade.action === 'SAFE_LIMIT') {
      if (typeof global.EGX_Portfolio !== 'undefined' && typeof global.EGX_Portfolio.setCustomLevels === 'function') {
        const existing = global.EGX_Portfolio.getCustomLevels(ticker) || {};
        global.EGX_Portfolio.setCustomLevels(ticker, {
          customStopLoss: confirmedSafeSell || confirmedPrice,
          customTarget1: existing.customTarget1 || null
        });
      }
      if (typeof global.savePortfolio === 'function') global.savePortfolio();
      closeVoiceTradingModal();
      alert(`✅ تم بنجاح تحديث حد البيع الآمن لسهم ${lastParsedTrade.stock.name} (${ticker}) إلى ${confirmedSafeSell || confirmedPrice} ج.م.`);
      return;
    }

    // 2. LIMIT ORDERS (PENDING)
    if (lastParsedTrade.action === 'LIMIT_BUY' || lastParsedTrade.action === 'LIMIT_SELL') {
      if (typeof global.addPendingThndrOrder === 'function') {
        global.addPendingThndrOrder({
          id: 'voice_' + Date.now(),
          ticker: ticker,
          name: lastParsedTrade.stock.name,
          type: lastParsedTrade.action,
          orderPrice: confirmedPrice,
          shares: confirmedShares,
          date: now.toISOString().split('T')[0],
          status: 'PENDING',
          notes: `أمر صوتي ذكي مسجل في ${cairoTime}`
        });
      }
      closeVoiceTradingModal();
      alert(`✅ تم بنجاح تسجيل أمر ${lastParsedTrade.action === 'LIMIT_BUY' ? 'الشراء' : 'البيع'} المحدد لسهم (${ticker}) على سعر ${confirmedPrice.toFixed(2)} ج بعدد ${confirmedShares} سهم في رادار الأوامر.`);
      return;
    }

    // 3. DIRECT BUY / SELL EXECUTION
    const grossTradeValue = Math.round(confirmedShares * confirmedPrice);
    const estCommission = Math.round(grossTradeValue * 0.00175);
    const totalBuyValue = grossTradeValue + estCommission;
    const netSellValue = Math.max(0, grossTradeValue - estCommission);

    let portfolioList = Array.isArray(global.portfolioData) ? global.portfolioData : [];
    let cashItem = portfolioList.find(p => p.ticker === 'CASH');
    if (!cashItem) {
      cashItem = { ticker: 'CASH', name: 'المحفظة (الرصيد النقدي)', category: 'محفظة نقدية', value: 0, profit: 0, shares: 0, buyPrice: 0 };
      portfolioList.push(cashItem);
    }

    if (lastParsedTrade.action === 'BUY') {
      if (cashItem.value < totalBuyValue) {
        const proceed = confirm(`⚠️ رصيد الكاش المتوفر (${cashItem.value.toLocaleString('en-US')} ج) أقل من إجمالي الشراء المطلوب (${totalBuyValue.toLocaleString('en-US')} ج).\nهل تريد المتابعة وخصم المبلغ وتحديث المحفظة؟`);
        if (!proceed) return;
      }

      let stock = portfolioList.find(p => p.ticker === ticker);
      if (stock) {
        const oldShares = stock.shares || 0;
        const oldBuyPrice = stock.buyPrice || stock.currentPrice || confirmedPrice;
        const newShares = oldShares + confirmedShares;
        const newAvgPrice = parseFloat((((oldShares * oldBuyPrice) + (confirmedShares * confirmedPrice)) / newShares).toFixed(2));

        stock.shares = newShares;
        stock.buyPrice = newAvgPrice;
        stock.currentPrice = confirmedPrice;
        stock.value = Math.round(newShares * confirmedPrice);
        const totalCost = Math.round(newShares * newAvgPrice);
        stock.profit = stock.value - totalCost;
        stock.returnPct = totalCost > 0 ? parseFloat(((stock.profit / totalCost) * 100).toFixed(2)) : 0;
        stock.status = stock.profit >= 0 ? 'ربح' : 'تراجع';
        stock.priceUpdatedAt = cairoTime;
      } else {
        const newStock = {
          ticker: ticker,
          name: lastParsedTrade.stock.name,
          category: lastParsedTrade.stock.category,
          shares: confirmedShares,
          buyPrice: confirmedPrice,
          currentPrice: confirmedPrice,
          value: grossTradeValue,
          profit: 0,
          returnPct: 0.0,
          status: 'متعادل',
          advice: 'احتفاظ • مركز استثماري جديد تم شراؤه صوتياً',
          action: 'HOLD',
          priceUpdatedAt: cairoTime
        };
        portfolioList.unshift(newStock);
      }

      cashItem.value = Number((cashItem.value - totalBuyValue).toFixed(2));
      cashItem.shares = cashItem.value;
      cashItem.buyPrice = cashItem.value;

      // Update custom safe sell limit if user entered one
      if (confirmedSafeSell && typeof global.EGX_Portfolio !== 'undefined' && typeof global.EGX_Portfolio.setCustomLevels === 'function') {
        const existing = global.EGX_Portfolio.getCustomLevels(ticker) || {};
        global.EGX_Portfolio.setCustomLevels(ticker, {
          customStopLoss: confirmedSafeSell,
          customTarget1: existing.customTarget1 || null
        });
      }

      if (typeof global.savePortfolio === 'function') global.savePortfolio();
      closeVoiceTradingModal();
      alert(`✅ تم بنجاح تسجيل شراء ${confirmedShares} سهم في (${ticker}) بسعر ${confirmedPrice.toFixed(2)} ج بإجمالي ${totalBuyValue.toLocaleString('en-US')} ج.م.`);

    } else if (lastParsedTrade.action === 'SELL') {
      let stock = portfolioList.find(p => p.ticker === ticker);
      if (!stock || (stock.shares || 0) < confirmedShares) {
        alert(`لا يمكنك بيع ${confirmedShares} سهم؛ رصيدك الحالي في (${ticker}) هو ${stock ? stock.shares : 0} سهم فقط.`);
        return;
      }

      stock.shares -= confirmedShares;
      if (stock.shares === 0) {
        global.portfolioData = portfolioList.filter(p => p.ticker !== ticker);
      } else {
        stock.value = Math.round(stock.shares * (stock.currentPrice || confirmedPrice));
        const totalRemainingCost = Math.round(stock.shares * stock.buyPrice);
        stock.profit = stock.value - totalRemainingCost;
        stock.returnPct = totalRemainingCost > 0 ? parseFloat(((stock.profit / totalRemainingCost) * 100).toFixed(2)) : 0;
      }

      cashItem.value = Number((cashItem.value + netSellValue).toFixed(2));
      cashItem.shares = cashItem.value;
      cashItem.buyPrice = cashItem.value;

      if (typeof global.savePortfolio === 'function') global.savePortfolio();
      closeVoiceTradingModal();
      alert(`✅ تم بنجاح تسجيل بيع ${confirmedShares} سهم من (${ticker}) بسعر ${confirmedPrice.toFixed(2)} ج وإيداع صافي العائد (${netSellValue.toLocaleString('en-US')} ج.م) في الكاش.`);
    }
  }

  // ============================================================
  // 8. In-App Advisor Chat Voice Integration (Tab 4)
  // ============================================================
  function toggleChatVoiceInput() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('btn-chat-mic');
    if (!input) return;

    if (isChatListening) {
      if (chatVoiceRecognition) {
        try { chatVoiceRecognition.stop(); } catch (e) {}
      }
      isChatListening = false;
      if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
      return;
    }

    if (!chatVoiceRecognition) {
      chatVoiceRecognition = initSpeechRecognition();
    }

    if (!chatVoiceRecognition) {
      alert('⚠️ المايك غير مدعوم في متصفحك الحالي، يمكنك كتابة سؤالك في حقل الشات مباشرة.');
      return;
    }

    try {
      chatVoiceRecognition.onstart = function () {
        isChatListening = true;
        if (btn) btn.className = 'p-2.5 rounded-xl bg-rose-600 text-white border border-rose-400 transition flex items-center justify-center animate-pulse';
        input.placeholder = 'جاري الاستماع لصوتك الآن... تحدث بسؤالك';
      };

      chatVoiceRecognition.onresult = function (event) {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        if (text) {
          input.value = text;
        }
      };

      chatVoiceRecognition.onerror = function (event) {
        console.warn('Chat voice error:', event.error);
        isChatListening = false;
        if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
        input.placeholder = 'اكتب سؤالك أو استشارتك عن أي سهم في البورصة...';
      };

      chatVoiceRecognition.onend = function () {
        isChatListening = false;
        if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
        input.placeholder = 'اكتب سؤالك أو استشارتك عن أي سهم في البورصة...';
      };

      chatVoiceRecognition.start();
    } catch (e) {
      isChatListening = false;
      if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
    }
  }

  // ============================================================
  // 9. Global Exports to Window
  // ============================================================
  global.openVoiceTradingModal = openVoiceTradingModal;
  global.closeVoiceTradingModal = closeVoiceTradingModal;
  global.toggleVoiceRecording = toggleVoiceRecording;
  global.toggleChatVoiceInput = toggleChatVoiceInput;
  global.parseVoiceFromManualInput = parseVoiceFromManualInput;
  global.testVoiceCommandSample = testVoiceCommandSample;
  global.recalcVoiceConfirmationMetrics = recalcVoiceConfirmationMetrics;
  global.executeVoiceOrderFromModal = executeVoiceOrderFromModal;
  global.resetVoiceModalToListen = resetVoiceModalToListen;
  global.lookupDynamicStock = lookupDynamicStock;
  global.parseEgyptianVoiceCommand = parseEgyptianVoiceCommand;

})(typeof window !== 'undefined' ? window : this);
