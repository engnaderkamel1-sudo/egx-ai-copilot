# -*- coding: utf-8 -*-
import sys

with open('js/voice-assistant.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State management & speech helpers
target_state = """  // State Management
  let voiceRecognition = null;
  let isListening = false;
  let chatVoiceRecognition = null;
  let isChatListening = false;
  let lastParsedTrade = null;"""

replace_state = """  // State Management
  let voiceRecognition = null;
  let isListening = false;
  let chatVoiceRecognition = null;
  let isChatListening = false;
  let lastParsedTrade = null;
  let currentConsultationStock = null;
  let currentUtterance = null;

  // Response Mode Management (TEXT vs VOICE)
  function getVoiceResponseMode() {
    return localStorage.getItem('egx_voice_response_mode') || 'TEXT';
  }

  function setVoiceResponseMode(mode) {
    const selectedMode = (mode === 'VOICE') ? 'VOICE' : 'TEXT';
    localStorage.setItem('egx_voice_response_mode', selectedMode);
    updateVoiceModeUI();
    if (selectedMode === 'TEXT') {
      stopSpeaking();
    }
  }

  function updateVoiceModeUI() {
    const mode = getVoiceResponseMode();
    const btnSilent = document.getElementById('voice-mode-silent');
    const btnAudio = document.getElementById('voice-mode-audio');
    if (btnSilent && btnAudio) {
      if (mode === 'VOICE') {
        btnAudio.className = 'px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition cursor-pointer';
        btnSilent.className = 'px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer';
      } else {
        btnSilent.className = 'px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition cursor-pointer';
        btnAudio.className = 'px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer';
      }
    }
  }

  function speakArabicText(text) {
    if (getVoiceResponseMode() !== 'VOICE') return;
    if (!('speechSynthesis' in global)) return;

    try {
      global.speechSynthesis.cancel();

      let clean = String(text || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/[*_#`~[\\]()•]/g, ' ')
        .replace(/[\\u{1F300}-\\u{1F9FF}]/gu, '')
        .replace(/ج\\.م|ج\\b/g, 'جنيه')
        .replace(/%/g, ' في المائة ')
        .replace(/\\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ar-EG';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = global.speechSynthesis.getVoices() || [];
      const arVoice = voices.find(v => v.lang === 'ar-EG' || v.lang === 'ar_EG') ||
                      voices.find(v => v.lang && v.lang.startsWith('ar')) ||
                      voices.find(v => v.name && v.name.toLowerCase().includes('arabic'));
      if (arVoice) {
        utterance.voice = arVoice;
      }

      utterance.onstart = function () {
        updateSpeakingUIState(true);
      };
      utterance.onend = function () {
        updateSpeakingUIState(false);
      };
      utterance.onerror = function () {
        updateSpeakingUIState(false);
      };

      currentUtterance = utterance;
      global.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      updateSpeakingUIState(false);
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in global) {
      try {
        global.speechSynthesis.cancel();
      } catch (e) {}
    }
    updateSpeakingUIState(false);
  }

  function updateSpeakingUIState(isSpeaking) {
    const badge = document.getElementById('consult-speaking-badge');
    if (badge) {
      if (isSpeaking) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    }
  }"""

if target_state not in content:
    print("ERROR: target_state not found!")
    sys.exit(1)
content = content.replace(target_state, replace_state, 1)

# 2. lookupDynamicStock enrichment
target_lookup = """    return {
      ticker: matchedTicker,
      name: stockName,
      category: stockCategory,
      livePrice: livePrice,
      ownedShares: ownedShares,
      avgBuyPrice: avgBuyPrice,
      safeSellLimit: defaultSafeSell,
      safeBuyLimit: defaultTarget,
      isOwned: !!owned && ownedShares > 0
    };"""

replace_lookup = """    return {
      ticker: matchedTicker,
      name: stockName,
      category: stockCategory,
      livePrice: livePrice,
      ownedShares: ownedShares,
      avgBuyPrice: avgBuyPrice,
      safeSellLimit: defaultSafeSell,
      safeBuyLimit: defaultTarget,
      isOwned: !!owned && ownedShares > 0,
      support: (radar && radar.support) ? radar.support : (owned && owned.pivotS1) ? `${owned.pivotS1} ج` : `${(livePrice * 0.95).toFixed(2)} ج`,
      target1: (radar && radar.target1) ? radar.target1 : (owned && owned.target1) ? `${owned.target1} ج` : `${(livePrice * 1.15).toFixed(2)} ج`,
      target2: (radar && radar.target2) ? radar.target2 : (owned && owned.pivotR2) ? `${owned.pivotR2} ج` : `${(livePrice * 1.25).toFixed(2)} ج`,
      stopLoss: (radar && radar.stopLoss) ? radar.stopLoss : (owned && owned.stopLoss) ? `${owned.stopLoss} ج` : `${(livePrice * 0.92).toFixed(2)} ج`,
      changePct: (radar && radar.changePct) ? radar.changePct : '+0.0%',
      volumeMultiplier: (radar && radar.volumeMultiplier) ? radar.volumeMultiplier : '1.0x',
      catalyst: (radar && radar.catalyst) ? radar.catalyst : (owned && owned.advice) ? owned.advice : 'سهم قيادي ونشط بالبورصة المصرية',
      type: (radar && radar.type) ? radar.type : 'استثمار وتداول مباشر',
      score: (radar && radar.score) ? radar.score : 85,
      liquidityStatus: (radar && radar.liquidityStatus) ? radar.liquidityStatus : 'نشطة في ثندر'
    };"""

if target_lookup not in content:
    print("ERROR: target_lookup not found!")
    sys.exit(1)
content = content.replace(target_lookup, replace_lookup, 1)

# 3. parseEgyptianVoiceCommand replacement
# Find section 3 up to section 4
start_p = content.find("  // ============================================================\n  // 3. Natural Language Egyptian Dialect Parser\n  // ============================================================")
end_p = content.find("  // ============================================================\n  // 4. Voice Modal & UI Architecture\n  // ============================================================")

if start_p == -1 or end_p == -1:
    print("ERROR: parseEgyptianVoiceCommand section not found!")
    sys.exit(1)

new_parser_code = """  // ============================================================
  // 3. Natural Language Egyptian Dialect Parser & Intent Classifier
  // ============================================================
  function parseEgyptianVoiceCommand(rawTranscript) {
    if (!rawTranscript) return null;
    const norm = normalizeArabic(rawTranscript);

    // 1. Detect Stock Ticker
    let matchedStock = null;
    for (const [ticker, aliases] of Object.entries(EGX_VOICE_ALIASES)) {
      for (const alias of aliases) {
        const normAlias = normalizeArabic(alias);
        const pattern = new RegExp(`(?:^|\\s)(?:في\\s+|ل|ب)?${normAlias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:\\s|$)`, 'i');
        if (pattern.test(norm) || norm.includes(normAlias)) {
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

    // 2. Check General Questions (Portfolio / Market)
    const isPortfolioQuery = /(?:محفظ(?:ة|تي)|رصيد(?:ي)?|كاش|فلوس(?:ي)?|ارباح(?:ي)?)/i.test(norm);
    const isMarketQuery = /(?:سوق|بورص(?:ة)?|فرص|افضل\\s*سهم|احسن\\s*سهم|رشح|ترشيح|طفر(?:ة|ات))/i.test(norm);

    if (!matchedStock && !isPortfolioQuery && !isMarketQuery) {
      return {
        success: false,
        intent: 'UNKNOWN',
        rawTranscript: rawTranscript,
        error: 'لم نتمكن من تحديد اسم السهم بدقة في الجملة. اذكر اسم السهم (مثل: طلعت مصطفى، السويدي، فوري) أو اسأل عن المحفظة والبورصة.'
      };
    }

    // 3. Detect Questions / Inquiries vs Explicit Trade Actions
    const isQuestion = /(?:هل|ايه|إيه|رايك|رأيك|تنصحني|نصيحتك|اخبار|أخبار|موقف|وضع|تحليل|حلل|تقييم|كام|بكام|شايف|توقعات|مناسب|ممكن|استشاره|استشارة)/i.test(norm);

    let action = null;
    if (!isQuestion) {
      if (/امر\\s*شراء\\s*(?:محدد|معلق)?|طلب\\s*شراء\\s*محدد|شراء\\s*محدد|شراء\\s*عند/i.test(norm)) {
        action = 'LIMIT_BUY';
      } else if (/امر\\s*بيع\\s*(?:محدد|معلق)?|طلب\\s*بيع\\s*محدد|بيع\\s*محدد|بيع\\s*عند/i.test(norm)) {
        action = 'LIMIT_SELL';
      } else if (/(?:^|\\s)(?:اشتريت|شريت|نفذت\\s*شراء|عملت\\s*شراء|زودت|تعزيز|عايز\\s*اشتري|سجل\\s*شراء|نفذ\\s*شراء)(?:\\s|$)|^(?:اشتري|شراء)(?:\\s|$)/i.test(norm)) {
        action = 'BUY';
      } else if (/(?:^|\\s)(?:بيعت|بعت|نفذت\\s*بيع|عملت\\s*بيع|تخارجت|تخارج|عايز\\s*ابيع|سجل\\s*بيع|نفذ\\s*بيع)(?:\\s|$)|^(?:بيع|ابيع)(?:\\s|$)/i.test(norm) && !/حد\\s*(?:ال)?بيع/i.test(norm)) {
        action = 'SELL';
      } else if (/حد\\s*(?:ال)?(?:بيع)?\\s*(?:ال)?(?:امن|امان)|وقف\\s*خساره|تعديل\\s*حد|تغيير\\s*حد|غير\\s*حد/i.test(norm)) {
        action = 'SAFE_LIMIT';
      }
    }

    // If explicit trading action and stock is matched -> TRADE INTENT
    if (action && matchedStock) {
      // Detect Safe Limits
      let customSafeSell = matchedStock.safeSellLimit;
      if (action === 'SAFE_LIMIT') {
        const sm = norm.match(/(?:الى|الي|لـ|على|سعر)?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:جنيه|ج)?/);
        if (sm && sm[1]) {
          customSafeSell = parseFloat(sm[1]);
        }
      } else {
        let sm = norm.match(/(?:و)?حد\\s*(?:ال)?(?:بيع)?\\s*(?:ال)?(?:امن|امان|سلامه)?\\s*(?:هو|على|لـ|الي|إلى)?\\s*(\\d+(?:\\.\\d+)?)/);
        if (!sm) {
          sm = norm.match(/وقف\\s*(?:ال)?خساره\\s*(?:هو|على|لـ|الي|إلى)?\\s*(\\d+(?:\\.\\d+)?)/);
        }
        if (sm && sm[1]) {
          customSafeSell = parseFloat(sm[1]);
        }
      }

      // Detect Price
      let price = null;
      if (action !== 'SAFE_LIMIT') {
        const pm = norm.match(/(?:بسعر|على\\s*سعر|سعر|بـ|ب)\\s*(\\d+(?:\\.\\d+)?)/) ||
                   norm.match(/(\\d+(?:\\.\\d+)?)\\s*(?:جنيه|ج(?:\\.م)?|قرش)/);
        if (pm && pm[1]) {
          price = parseFloat(pm[1]);
        } else {
          price = matchedStock.livePrice || matchedStock.avgBuyPrice || 10.0;
        }
      } else {
        price = customSafeSell || matchedStock.livePrice;
      }

      // Detect Shares Quantity
      let shares = null;
      let sharesMode = 'EXACT';

      if (/نص\\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|نصف\\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|50\\s*%/i.test(norm)) {
        sharesMode = 'HALF';
        shares = matchedStock.isOwned ? Math.floor(matchedStock.ownedShares / 2) : 100;
      } else if (/كل\\s*(?:الكميه|كميتي|المحفظه|الاسهم|اللي\\s*معايا)?|كامل\\s*(?:الكميه|الاسهم)?|100\\s*%/i.test(norm)) {
        sharesMode = 'ALL';
        shares = matchedStock.isOwned ? matchedStock.ownedShares : 100;
      } else {
        const sharesMatch = norm.match(/(\\d+)\\s*(?:سهم|اسهم)/) || norm.match(/عدد\\s*(\\d+)/);
        if (sharesMatch && sharesMatch[1]) {
          shares = parseInt(sharesMatch[1], 10);
        } else {
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
        intent: 'TRADE',
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

    // Default -> CONSULT INTENT (Inquiry & Advisory)
    return {
      success: true,
      intent: 'CONSULT',
      stock: matchedStock,
      isPortfolioQuery: isPortfolioQuery,
      isMarketQuery: isMarketQuery,
      rawTranscript: rawTranscript
    };
  }

"""

content = content[:start_p] + new_parser_code + content[end_p:]

# 4. ensureVoiceModalDOM replacement
start_dom = content.find("  function ensureVoiceModalDOM() {")
end_dom = content.find("  // ============================================================\n  // 5. Speech Recognition Controllers\n  // ============================================================")

if start_dom == -1 or end_dom == -1:
    print("ERROR: ensureVoiceModalDOM section not found!")
    sys.exit(1)

new_dom_code = """  function ensureVoiceModalDOM() {
    if (document.getElementById('voice-trading-modal')) return;

    const modalHTML = `
      <div id="voice-trading-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden overflow-y-auto p-3 sm:p-4 items-center justify-center">
        <div class="modal-card bg-gray-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0 gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shrink-0">
                <i data-lucide="mic" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>المساعد الصوتي الذكي</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 font-normal">استشارة وتنفيذ</span>
                </h3>
                <p class="text-[11px] text-gray-400">تحدث بالعامية المصرية لمناقشة أي سهم أو تسجيل الصفقات</p>
              </div>
            </div>

            <!-- Mode Switcher (Silent Text vs Spoken Voice) & Close -->
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
                <button type="button" id="voice-mode-silent" onclick="setVoiceResponseMode('TEXT')" class="px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer" title="قراءة الردود نصياً دون تشغيل الصوت">
                  <i data-lucide="volume-x" class="w-3.5 h-3.5"></i>
                  <span class="hidden sm:inline">قراءة صامتة</span>
                </button>
                <button type="button" id="voice-mode-audio" onclick="setVoiceResponseMode('VOICE')" class="px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer" title="سماع الرد الصوتي مسموعاً">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
                  <span class="hidden sm:inline">رد صوتي</span>
                </button>
              </div>
              <button onclick="closeVoiceTradingModal()" class="text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-gray-800 transition" aria-label="إغلاق">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

          <div class="modal-scroll-body flex-1 overflow-y-auto overscroll-contain pr-1 py-4 space-y-4">
            
            <!-- Voice Listening Status Card -->
            <div id="voice-listening-card" class="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-gray-950 to-slate-900 border border-purple-500/30 text-center space-y-3">
              
              <!-- Pulsing Mic Button -->
              <div class="flex justify-center items-center py-2">
                <button type="button" id="btn-voice-pulse" onclick="toggleVoiceRecording()" class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 transition transform active:scale-95 relative cursor-pointer">
                  <span id="voice-pulse-ring" class="hidden absolute inset-0 rounded-full border-2 border-purple-400 animate-ping"></span>
                  <i data-lucide="mic" id="voice-mic-icon" class="w-10 h-10 text-white"></i>
                </button>
              </div>

              <!-- Status Indicator -->
              <div>
                <div id="voice-status-heading" class="font-bold text-sm text-purple-300">
                  اضغط على زر المايك وتحدث باستشارتك أو أمرك...
                </div>
                <p id="voice-status-sub" class="text-xs text-slate-300 mt-1">
                  مثال: «إيه رأيك في سهم طلعت مصطفى؟» أو «اشتري 200 سهم السويدي بسعر 51 ج»
                </p>
              </div>

              <!-- Live Transcript Box -->
              <div id="voice-transcript-box" class="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs text-purple-200 min-h-[48px] flex items-center justify-center text-center font-medium">
                <span class="text-slate-300 text-xs font-medium">في انتظار الاستماع لكلامك...</span>
              </div>

              <!-- Quick Dialect Examples -->
              <div class="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-[10px]">
                <span class="text-slate-300 text-xs font-bold">أمثلة سريعة:</span>
                <button type="button" onclick="testVoiceCommandSample('إيه رأيك في سهم طلعت مصطفى؟')" class="px-2 py-0.5 rounded bg-gray-800 text-purple-300 hover:bg-purple-900/40 border border-gray-700">رأيك في طلعت مصطفى؟</button>
                <button type="button" onclick="testVoiceCommandSample('مستويات الدعم والهدف لسهم السويدي')" class="px-2 py-0.5 rounded bg-gray-800 text-cyan-300 hover:bg-cyan-900/40 border border-gray-700">مستويات السويدي</button>
                <button type="button" onclick="testVoiceCommandSample('اشتريت 500 سهم في السويدي بسعر 52 جنيه')" class="px-2 py-0.5 rounded bg-gray-800 text-emerald-300 hover:bg-emerald-900/40 border border-gray-700">شراء 500 سهم السويدي</button>
                <button type="button" onclick="testVoiceCommandSample('بعت نص كمية فوري على سعر 8.20')" class="px-2 py-0.5 rounded bg-gray-800 text-rose-300 hover:bg-rose-900/40 border border-gray-700">بيع نص كمية فوري</button>
              </div>
            </div>

            <!-- Manual Text Fallback (Input box in case mic is blocked) -->
            <div class="p-2.5 bg-gray-950 rounded-xl border border-gray-800 flex items-center gap-2">
              <input type="text" id="voice-manual-input" placeholder="أو اكتب سؤالك أو أمرك هنا إذا تعذر تشغيل المايك..." class="flex-1 bg-transparent text-xs text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none">
              <button type="button" onclick="parseVoiceFromManualInput()" class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 text-xs font-bold transition cursor-pointer">
                تحليل ومتابعة
              </button>
            </div>

            <!-- Dynamic Consultation Card (Hidden until consultation query is parsed) -->
            <div id="voice-consultation-card" class="hidden p-4 rounded-2xl bg-gray-950 border border-purple-500/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <!-- Card Header & Badges -->
              <div class="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-sm flex items-center gap-1">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                    <span>استشارة وتحليل مالي</span>
                  </span>
                  <span id="consult-stock-ticker-pill" class="text-xs font-mono text-cyan-400 font-bold bg-gray-900 px-2.5 py-0.5 rounded-lg border border-gray-800">TMGH</span>
                </div>
                <div id="consult-speaking-badge" class="hidden text-xs text-purple-300 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950 border border-purple-700/50">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5 animate-pulse text-purple-400"></i>
                  <span>جاري النطق...</span>
                  <button type="button" onclick="stopSpeaking()" class="text-white hover:text-rose-400 font-bold underline mr-1 text-[11px] cursor-pointer">إيقاف</button>
                </div>
              </div>

              <!-- Stock Snapshot & Live Price (if stock matched) -->
              <div id="consult-stock-header-box" class="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <h4 id="consult-stock-name" class="font-bold text-white text-sm">مجموعة طلعت مصطفى القابضة</h4>
                  <p id="consult-stock-category" class="text-xs text-slate-400 mt-0.5">EGX30 • تطوير عقاري وفندقي</p>
                </div>
                <div class="text-left font-mono">
                  <span class="text-[10px] text-gray-400 block">سعر التداول اللحظي:</span>
                  <strong id="consult-stock-live-price" class="text-sm text-cyan-300 font-bold">54.00 ج</strong>
                </div>
              </div>

              <!-- Key Analytical Metrics Grid (Support, Target, StopLoss) -->
              <div id="consult-metrics-grid" class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <span class="text-[10px] text-emerald-400 block mb-0.5 font-bold">دعم وشراء آمن</span>
                  <strong id="consult-metric-support" class="font-mono text-white text-xs">50.00 ج</strong>
                </div>
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <span class="text-[10px] text-cyan-400 block mb-0.5 font-bold">مستهدف أول</span>
                  <strong id="consult-metric-target" class="font-mono text-white text-xs">64.00 ج</strong>
                </div>
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <span class="text-[10px] text-amber-400 block mb-0.5 font-bold">وقف خسارة آمن</span>
                  <strong id="consult-metric-stop" class="font-mono text-white text-xs">48.00 ج</strong>
                </div>
              </div>

              <!-- Advisory Analysis Content Body -->
              <div id="consult-advisory-body" class="p-3.5 bg-gray-900/90 rounded-xl border border-gray-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <!-- Dynamic text injected here -->
              </div>

              <!-- Interactive Action Buttons -->
              <div class="flex items-center gap-2 pt-1 flex-wrap">
                <button type="button" id="btn-consult-buy" onclick="triggerTradeFromConsult('BUY')" class="flex-1 min-w-[140px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 active:scale-95 cursor-pointer">
                  <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                  <span id="btn-consult-buy-label">تسجيل شراء لهذا السهم</span>
                </button>
                <button type="button" id="btn-consult-sell" onclick="triggerTradeFromConsult('SELL')" class="hidden flex-1 min-w-[140px] py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50 active:scale-95 cursor-pointer">
                  <i data-lucide="badge-percent" class="w-3.5 h-3.5"></i>
                  <span>تسجيل بيع من كميتك</span>
                </button>
                <button type="button" onclick="resetVoiceModalToListen()" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
                  <i data-lucide="mic" class="w-3.5 h-3.5 text-purple-400"></i>
                  <span>اسأل سؤالاً آخر</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Confirmation Card (Hidden until command is parsed) -->
            <div id="voice-confirmation-card" class="hidden p-4 rounded-2xl bg-gray-950 border border-emerald-500/50 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <!-- Card Header & Badge -->
              <div class="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div class="flex items-center gap-2">
                  <span id="confirm-badge-action" class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                    شراء مؤكد 🛒
                  </span>
                  <span class="text-xs text-slate-300">مراجعة المعطيات قبل الاعتماد</span>
                </div>
                <div class="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  <span>حماية وأمان 100%</span>
                </div>
              </div>

              <!-- Stock Identification & Dynamic Price -->
              <div class="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <h4 id="confirm-stock-name" class="font-bold text-white text-sm">السويدي إليكتريك</h4>
                  <div class="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
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
                  <label class="text-xs font-bold text-slate-300 block mb-1">عدد الأسهم:</label>
                  <input type="number" id="confirm-input-shares" oninput="recalcVoiceConfirmationMetrics()" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none">
                </div>
                <div class="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <label class="text-xs font-bold text-slate-300 block mb-1">سعر التنفيذ (ج):</label>
                  <input type="number" step="0.01" id="confirm-input-price" oninput="recalcVoiceConfirmationMetrics()" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none">
                </div>
                <div class="col-span-2 sm:col-span-1 p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                  <label class="text-xs font-bold text-slate-300 block mb-1">حد البيع الآمن (ج):</label>
                  <input type="number" step="0.01" id="confirm-input-safesell" class="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none" placeholder="اختياري">
                </div>
              </div>

              <!-- Dynamic Financial Calculation Box -->
              <div class="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
                <div class="flex items-center justify-between text-slate-200">
                  <span>إجمالي قيمة الصفقة (مع عمولة البورصة وثندر):</span>
                  <strong id="confirm-metric-total" class="font-mono text-white text-sm">26,046 ج.م</strong>
                </div>
                <div class="flex items-center justify-between text-gray-400 text-xs">
                  <span>رصيد الكاش المتاح بالمحفظة:</span>
                  <span id="confirm-metric-cash-avail" class="font-mono text-cyan-400">25,320 ج.م</span>
                </div>
                <div class="flex items-center justify-between border-t border-gray-800 pt-2 text-xs">
                  <span id="confirm-metric-impact-label">أثر الصفقة على رصيد الكاش:</span>
                  <strong id="confirm-metric-impact" class="font-mono text-emerald-400">سيتبقى 12,400 ج.م</strong>
                </div>
                <div id="confirm-metric-profit-row" class="hidden flex items-center justify-between border-t border-gray-800 pt-2 text-xs">
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
                <button type="button" onclick="resetVoiceModalToListen()" class="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>إعادة</span>
                </button>
              </div>

            </div>

          </div>

          <!-- Modal Footer Note -->
          <div class="border-t border-gray-800 pt-3 flex items-center justify-between text-xs text-slate-300 shrink-0 font-medium">
            <span>🔒 لا يتم تنفيذ أي صفقة مالية دون معاينتك وتأكيدك المباشر.</span>
            <button onclick="closeVoiceTradingModal()" class="text-slate-300 hover:text-white font-bold cursor-pointer">إغلاق</button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    updateVoiceModeUI();
    if (global.lucide) global.lucide.createIcons();
  }
"""

content = content[:start_dom] + new_dom_code + content[end_dom:]

# 5. Controllers update
content = content.replace("""  function openVoiceTradingModal() {
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
      transcriptBox.innerHTML = '<span class="text-slate-300 text-xs font-medium">في انتظار الاستماع لكلامك...</span>';
    }

    const heading = document.getElementById('voice-status-heading');
    if (heading) heading.innerText = 'اضغط على زر المايك وتحدث بأمرك...';

    lastParsedTrade = null;
  }""", """  function openVoiceTradingModal() {
    ensureVoiceModalDOM();
    const modal = document.getElementById('voice-trading-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    updateVoiceModeUI();
    resetVoiceModalToListen();
    if (global.lucide) global.lucide.createIcons();

    setTimeout(() => {
      startVoiceListening();
    }, 300);
  }

  function closeVoiceTradingModal() {
    stopSpeaking();
    stopVoiceListening();
    const modal = document.getElementById('voice-trading-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function resetVoiceModalToListen() {
    stopSpeaking();
    const confCard = document.getElementById('voice-confirmation-card');
    if (confCard) confCard.classList.add('hidden');

    const consultCard = document.getElementById('voice-consultation-card');
    if (consultCard) consultCard.classList.add('hidden');

    const transcriptBox = document.getElementById('voice-transcript-box');
    if (transcriptBox) {
      transcriptBox.innerHTML = '<span class="text-slate-300 text-xs font-medium">في انتظار الاستماع لكلامك...</span>';
    }

    const heading = document.getElementById('voice-status-heading');
    if (heading) heading.innerText = 'اضغط على زر المايك وتحدث باستشارتك أو أمرك...';

    lastParsedTrade = null;
    currentConsultationStock = null;
  }""")

# 6. processSpokenTranscript & consultation methods
target_process = """  function processSpokenTranscript(transcript) {
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
  }"""

replace_process = """  function processSpokenTranscript(transcript) {
    stopVoiceListening();
    const result = parseEgyptianVoiceCommand(transcript);

    if (!result || !result.success) {
      const heading = document.getElementById('voice-status-heading');
      if (heading) {
        heading.innerText = result ? result.error : 'لم نتمكن من فهم المعنى بدقة، يرجى المحاولة ثانية.';
      }
      return;
    }

    if (result.intent === 'TRADE') {
      const consultCard = document.getElementById('voice-consultation-card');
      if (consultCard) consultCard.classList.add('hidden');
      displayConfirmationCard(result);

      if (getVoiceResponseMode() === 'VOICE') {
        const actionWord = result.action === 'BUY' ? 'شراء' : result.action === 'SELL' ? 'بيع' : 'أمر محدد في';
        speakArabicText(`تم تجهيز أمر ${actionWord} سهم ${result.stock.name}. يرجى مراجعة التفاصيل وتأكيد التنفيذ.`);
      }
    } else {
      // CONSULT INTENT
      const confCard = document.getElementById('voice-confirmation-card');
      if (confCard) confCard.classList.add('hidden');
      displayConsultationCard(result);
    }
  }

  // Generate Consultation Content
  function generateConsultationContent(result) {
    if (result.stock) {
      const s = result.stock;
      const livePrice = s.livePrice.toFixed(2);
      const isOwned = s.isOwned;

      let adviceSummary = '';
      let spokenText = '';

      if (isOwned) {
        const cost = s.avgBuyPrice.toFixed(2);
        const retPct = s.avgBuyPrice > 0 ? (((s.livePrice - s.avgBuyPrice) / s.avgBuyPrice) * 100).toFixed(1) : '0';
        const isProfit = Number(retPct) >= 0;

        adviceSummary = `
          <div class="space-y-2">
            <p class="font-bold text-white flex items-center gap-1.5 flex-wrap">
              <span>💼 موقفك بالمحفظة:</span>
              <span class="text-emerald-400 font-mono font-bold">تمتلك ${s.ownedShares.toLocaleString('en-US')} سهم</span>
              <span class="text-slate-300">بمتوسط شراء ${cost} ج (${isProfit ? '+' : ''}${retPct}% ${isProfit ? '🟢 ربح' : '🔴 تراجع'})</span>
            </p>
            <p class="text-slate-300 text-xs leading-relaxed">
              ${s.catalyst ? `<strong>عوامل السهم ومحفزاته:</strong> ${s.catalyst}.<br>` : ''}
              ${isProfit 
                ? `السهم يسير بإيجابية؛ نوصي بالحفاظ على حد بيع آمن متحرك لحماية الأرباح حول <strong>${s.safeSellLimit || s.stopLoss}</strong>، مع التفكير في جني أرباح جزئي عند المقاومة <strong>${s.target1}</strong>.`
                : `السهم يمر بتصحيح؛ طالما أنه يتداول أعلى منطقة الدعم <strong>${s.support}</strong> فإن التماسك هادئ، ويُرجى تفعيل وقف الخسارة الصارم فور كسر <strong>${s.stopLoss}</strong>.`
              }
            </p>
          </div>
        `;

        spokenText = `سهم ${s.name} يتداول حالياً عند ${livePrice} جنيه. أنت تمتلك فيه ${s.ownedShares} سهم بمتوسط ${cost} جنيه والعائد الحالي ${retPct} في المائة. الدعم الأقرب هو ${s.support}، والمستهدف القادم هو ${s.target1}. ${isProfit ? 'ننصح بحماية الأرباح وجني جزئي عند المقاومة.' : 'ننصح بالاحتفاظ طالما يتداول أعلى الدعم.'}`;
      } else {
        adviceSummary = `
          <div class="space-y-2">
            <p class="font-bold text-white">
              🔍 السهم ليس في محفظتك حالياً (${s.category}).
            </p>
            <p class="text-slate-300 text-xs leading-relaxed">
              ${s.catalyst ? `<strong>أبرز محفزات السهم:</strong> ${s.catalyst} (معدل السيولة ${s.volumeMultiplier}).<br>` : ''}
              <strong>تقييم الدخول والتداول:</strong> السعر اللحظي <strong>${livePrice} ج</strong>. أفضل منطقة شراء منخفضة المخاطر تكون بالقرب من الدعم <strong>${s.support}</strong>، والمستهدف الأول عند <strong>${s.target1}</strong>، مع وقف خسارة مقترح عند <strong>${s.stopLoss}</strong>.
            </p>
          </div>
        `;

        spokenText = `سهم ${s.name} يتداول حالياً عند ${livePrice} جنيه. أقرب منطقة شراء آمنة بالقرب من الدعم ${s.support}، والمستهدف الأول هو ${s.target1} مع وقف خسارة عند ${s.stopLoss}. يمكنك الضغط على زر الشراء لتجهيز الأمر فوراً.`;
      }

      return {
        title: s.name,
        ticker: s.ticker,
        category: s.category,
        livePrice: `${livePrice} ج`,
        support: s.support,
        target: s.target1,
        stopLoss: s.safeSellLimit ? `${s.safeSellLimit} ج` : s.stopLoss,
        htmlBody: adviceSummary,
        spokenText: spokenText,
        canBuy: true,
        canSell: isOwned
      };
    } else if (result.isPortfolioQuery) {
      const portfolioList = Array.isArray(global.portfolioData) ? global.portfolioData : [];
      const totalWealth = portfolioList.reduce((acc, cur) => acc + (cur.value || 0), 0);
      const cashAsset = portfolioList.find(p => p.ticker === 'CASH');
      const cashBalance = cashAsset ? cashAsset.value : 0;
      const stocksList = portfolioList.filter(p => p.ticker !== 'CASH');

      const htmlBody = `
        <div class="space-y-2">
          <p class="font-bold text-white">📊 ملخص المحفظة الاستثمارية:</p>
          <ul class="space-y-1.5 text-slate-300 list-disc pr-4 text-xs">
            <li>إجمالي ثروة المحفظة: <strong class="text-cyan-400 font-mono">${Math.round(totalWealth).toLocaleString('en-US')} ج.م</strong></li>
            <li>رصيد الكاش الحر المتاح: <strong class="text-emerald-400 font-mono">${Math.round(cashBalance).toLocaleString('en-US')} ج.م</strong> (${totalWealth > 0 ? ((cashBalance / totalWealth) * 100).toFixed(1) : 0}% سيولة نقدية جاهزة)</li>
            <li>الأسهم المملوكة: <strong class="text-white">${stocksList.length} شركات</strong> (${stocksList.map(s => s.name).join('، ')})</li>
          </ul>
        </div>
      `;
      const spokenText = `إجمالي ثروة محفظتك حالياً ${Math.round(totalWealth).toLocaleString('en-US')} جنيه، منها رصيد كاش حر يبلغ ${Math.round(cashBalance).toLocaleString('en-US')} جنيه. محفظتك تحتوي على ${stocksList.length} شركات في البورصة.`;

      return {
        title: 'محفظتك الاستثمارية',
        ticker: 'PORTFOLIO',
        category: 'إجمالي الأصول والكاش',
        livePrice: `${Math.round(totalWealth).toLocaleString('en-US')} ج`,
        support: 'كاش آمن',
        target: 'نمو مستدام',
        stopLoss: 'إدارة مخاطر',
        htmlBody: htmlBody,
        spokenText: spokenText,
        canBuy: false,
        canSell: false
      };
    } else {
      // Market Radar Query
      const radarList = Array.isArray(global.fullMarketRadar) ? global.fullMarketRadar : [];
      const topStocks = radarList.slice(0, 3);
      const htmlBody = `
        <div class="space-y-2">
          <p class="font-bold text-white">🚀 أبرز فرص البورصة المصرية اللحظية:</p>
          <div class="space-y-1.5 text-slate-300 text-xs">
            ${topStocks.map(s => `
              <div class="p-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <strong class="text-white">${s.name} (${s.ticker})</strong>
                  <div class="text-[10px] text-slate-400">${s.catalyst || s.type}</div>
                </div>
                <div class="text-left font-mono">
                  <span class="text-cyan-300 font-bold">${s.price} ج</span>
                  <span class="block text-[10px] text-emerald-400">هدف: ${s.target1}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      const spokenText = `أبرز الفرص المرصودة اليوم في البورصة المصرية تشمل: ${topStocks.map(s => s.name).join(' و ')}. يمكنك السؤال عن أي سهم منها بالاسم لسماع تحليله الكامل.`;

      return {
        title: 'رادار البورصة المصرية',
        ticker: 'EGX RADAR',
        category: 'فرص السيولة العالية',
        livePrice: 'جلسة اليوم',
        support: 'دعوم قوية',
        target: 'أهداف صاعدة',
        stopLoss: 'وقف منضبط',
        htmlBody: htmlBody,
        spokenText: spokenText,
        canBuy: false,
        canSell: false
      };
    }
  }

  // Display Consultation Card
  function displayConsultationCard(parsed) {
    currentConsultationStock = parsed.stock;
    const card = document.getElementById('voice-consultation-card');
    const confCard = document.getElementById('voice-confirmation-card');
    if (confCard) confCard.classList.add('hidden');
    if (!card) return;

    const data = generateConsultationContent(parsed);

    // Update Header
    const tickerPill = document.getElementById('consult-stock-ticker-pill');
    if (tickerPill) tickerPill.innerText = data.ticker;

    const nameEl = document.getElementById('consult-stock-name');
    if (nameEl) nameEl.innerText = data.title;

    const catEl = document.getElementById('consult-stock-category');
    if (catEl) catEl.innerText = data.category;

    const priceEl = document.getElementById('consult-stock-live-price');
    if (priceEl) priceEl.innerText = data.livePrice;

    // Update Metrics
    const supEl = document.getElementById('consult-metric-support');
    if (supEl) supEl.innerText = data.support;

    const tarEl = document.getElementById('consult-metric-target');
    if (tarEl) tarEl.innerText = data.target;

    const stopEl = document.getElementById('consult-metric-stop');
    if (stopEl) stopEl.innerText = data.stopLoss;

    // Update Body
    const bodyEl = document.getElementById('consult-advisory-body');
    if (bodyEl) bodyEl.innerHTML = data.htmlBody;

    // Action buttons
    const buyBtn = document.getElementById('btn-consult-buy');
    const sellBtn = document.getElementById('btn-consult-sell');
    const buyLabel = document.getElementById('btn-consult-buy-label');

    if (buyBtn) {
      if (data.canBuy && parsed.stock) {
        buyBtn.classList.remove('hidden');
        if (buyLabel) buyLabel.innerText = `تسجيل شراء ${parsed.stock.name}`;
      } else {
        buyBtn.classList.add('hidden');
      }
    }

    if (sellBtn) {
      if (data.canSell && parsed.stock) {
        sellBtn.classList.remove('hidden');
      } else {
        sellBtn.classList.add('hidden');
      }
    }

    card.classList.remove('hidden');
    if (global.lucide) global.lucide.createIcons();

    // Check Voice Mode: speak or stay silent
    if (getVoiceResponseMode() === 'VOICE') {
      speakArabicText(data.spokenText);
    } else {
      stopSpeaking();
    }
  }

  // Switch from Consultation Card to Trade Card
  function triggerTradeFromConsult(action) {
    if (!currentConsultationStock) return;
    switchConsultationToTrade(currentConsultationStock, action);
  }

  function switchConsultationToTrade(stock, action = 'BUY') {
    stopSpeaking();
    const consultCard = document.getElementById('voice-consultation-card');
    if (consultCard) consultCard.classList.add('hidden');

    const livePrice = stock.livePrice || 10.0;
    const shares = (action === 'SELL' && stock.isOwned) ? stock.ownedShares : 100;
    const grossTrade = Math.round(shares * livePrice);
    const estCommission = Math.round(grossTrade * 0.00175);
    const totalBuy = grossTrade + estCommission;
    const netSell = Math.max(0, grossTrade - estCommission);

    const portfolioList = Array.isArray(global.portfolioData) ? global.portfolioData : [];
    const cashItem = portfolioList.find(p => p.ticker === 'CASH');
    const availableCash = cashItem ? Number(cashItem.value || 0) : 0;

    const tradeObj = {
      success: true,
      intent: 'TRADE',
      action: action,
      stock: stock,
      shares: shares,
      sharesMode: 'EXACT',
      price: Number(livePrice.toFixed(2)),
      safeSellLimit: stock.safeSellLimit,
      safeBuyLimit: stock.safeBuyLimit,
      grossTrade: grossTrade,
      estCommission: estCommission,
      totalBuy: totalBuy,
      netSell: netSell,
      availableCash: availableCash,
      rawTranscript: `أمر ${action === 'BUY' ? 'شراء' : 'بيع'} لسهم ${stock.name}`
    };

    displayConfirmationCard(tradeObj);

    if (getVoiceResponseMode() === 'VOICE') {
      speakArabicText(`تم تجهيز أمر ${action === 'BUY' ? 'شراء' : 'بيع'} سهم ${stock.name}. يرجى مراجعة الكمية والسعر والتأكيد.`);
    }
  }"""

if target_process not in content:
    print("ERROR: target_process not found!")
    sys.exit(1)
content = content.replace(target_process, replace_process, 1)

# 7. toggleChatVoiceInput update (add stopSpeaking)
target_chat = """    if (isChatListening) {
      if (chatVoiceRecognition) {
        try { chatVoiceRecognition.stop(); } catch (e) {}
      }
      isChatListening = false;
      if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
      return;
    }"""

replace_chat = """    if (isChatListening) {
      if (chatVoiceRecognition) {
        try { chatVoiceRecognition.stop(); } catch (e) {}
      }
      isChatListening = false;
      if (btn) btn.className = 'p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center';
      return;
    }

    stopSpeaking();"""

if target_chat not in content:
    print("ERROR: target_chat not found!")
    sys.exit(1)
content = content.replace(target_chat, replace_chat, 1)

# 8. Global exports update
target_exports = """  global.lookupDynamicStock = lookupDynamicStock;
  global.parseEgyptianVoiceCommand = parseEgyptianVoiceCommand;"""

replace_exports = """  global.lookupDynamicStock = lookupDynamicStock;
  global.parseEgyptianVoiceCommand = parseEgyptianVoiceCommand;
  global.getVoiceResponseMode = getVoiceResponseMode;
  global.setVoiceResponseMode = setVoiceResponseMode;
  global.speakArabicText = speakArabicText;
  global.stopSpeaking = stopSpeaking;
  global.triggerTradeFromConsult = triggerTradeFromConsult;
  global.switchConsultationToTrade = switchConsultationToTrade;
  global.displayConsultationCard = displayConsultationCard;
  global.generateConsultationContent = generateConsultationContent;"""

if target_exports not in content:
    print("ERROR: target_exports not found!")
    sys.exit(1)
content = content.replace(target_exports, replace_exports, 1)

with open('js/voice-assistant.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: js/voice-assistant.js successfully patched!")
