/**
 * EGX AI Copilot - State Management & Utilities (js/state.js)
 * Global state variables, Latin digits observer, Cairo time & formatting utilities.
 */

    // ============================================================
    // Strict General Rule: All Numbers in English (0-9) - No Eastern Arabic Digits
    // ============================================================
    function toEnDigits(str) {
      if (str === null || str === undefined) return '';
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return String(str).replace(/[٠-٩]/g, d => arabicDigits.indexOf(d));
    }

    function formatNum(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return toEnDigits(Number(num).toLocaleString('en-US'));
    }

    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function getCairoParts(date = new Date()) {
      const d = date instanceof Date ? date : new Date(date);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'short'
      });
      const parts = formatter.formatToParts(d);
      const map = {};
      parts.forEach(p => map[p.type] = p.value);
      return map;
    }

    function isCairoSessionOpen(date = new Date()) {
      const parts = getCairoParts(date);
      const isTradingDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(parts.weekday);
      const hour = parseInt(parts.hour, 10);
      const minute = parseInt(parts.minute, 10);
      const timeInMinutes = hour * 60 + minute;
      return isTradingDay && (timeInMinutes >= 600 && timeInMinutes <= 870); // 10:00 AM to 02:30 PM Cairo
    }

    function formatCairoDateOnly(date = new Date()) {
      const parts = getCairoParts(date);
      const day = parts.day;
      const monthIdx = parseInt(parts.month, 10) - 1;
      const monthName = MONTHS_SHORT[monthIdx] || 'Oct';
      return `${day} ${monthName}`;
    }

    function formatCairoTime(date = new Date(), includeSeconds = false, timeOnly = false) {
      const d = date instanceof Date ? date : new Date(date);
      const timeStr = d.toLocaleTimeString('ar-EG-u-nu-latn', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        second: includeSeconds ? '2-digit' : undefined,
        numberingSystem: 'latn'
      });
      if (timeOnly) return toEnDigits(timeStr);
      const dateStr = formatCairoDateOnly(d);
      return toEnDigits(`${timeStr} (${dateStr})`);
    }

    function formatDateTimeDisplay(str) {
      if (!str || str === 'جلسة اليوم' || str === 'جلسة البورصة اليوم') return str || 'جلسة اليوم';
      let s = toEnDigits(String(str)).trim();
      s = s.replace(/^الساعة\s+/, '');
      s = s.replace(/\(?(\d{1,2})\/(\d{1,2})\)?/g, (match, p1, p2) => {
        let d = parseInt(p2, 10);
        let m = parseInt(p1, 10) - 1;
        if (parseInt(p1, 10) > 12) {
          d = parseInt(p1, 10);
          m = parseInt(p2, 10) - 1;
        }
        const mName = MONTHS_SHORT[m] || 'Oct';
        return `(${d} ${mName})`;
      });
      s = s.replace(/\(\(([^\)]+)\)\)/g, '($1)');
      return s;
    }

    function formatDecisionTimeString(str) {
      const formatted = formatDateTimeDisplay(str);
      if (!formatted || formatted === 'جلسة اليوم' || formatted === 'جلسة البورصة اليوم') {
        return 'جلسة اليوم';
      }
      return `الساعة ${formatted}`;
    }

    function enforceEnglishNumbers(root = document.body) {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (/[٠-٩]/.test(node.nodeValue)) {
          node.nodeValue = toEnDigits(node.nodeValue);
        }
      }
    }

    // Auto-intercept any dynamic Arabic numerals across the entire DOM
    if (typeof MutationObserver !== 'undefined') {
      const englishDigitsObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                if (/[٠-٩]/.test(node.nodeValue)) {
                  node.nodeValue = toEnDigits(node.nodeValue);
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                enforceEnglishNumbers(node);
              }
            });
          } else if (mutation.type === 'characterData') {
            if (/[٠-٩]/.test(mutation.target.nodeValue)) {
              mutation.target.nodeValue = toEnDigits(mutation.target.nodeValue);
            }
          }
        });
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          enforceEnglishNumbers(document.body);
          englishDigitsObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
      } else {
        enforceEnglishNumbers(document.body);
        englishDigitsObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
    }

    // Pure Single Source of Truth: Delegated to EGX_Portfolio (js/portfolio.js)
    const defaultPortfolioData = (typeof EGX_Portfolio !== 'undefined')
      ? EGX_Portfolio.getDefaultData()
      : [];

    // Comprehensive EGX Market Universe (18 Active Stocks)
    let fullMarketRadar = [
      {
        ticker: 'COMI',
        name: 'البنك التجاري الدولي',
        index: 'egx30',
        sector: 'بنوك وخدمات مالية',
        price: 79.20,
        high: 80.50,
        low: 78.10,
        close: 79.20,
        changePct: '+0.85%',
        volumeMultiplier: '1.4x',
        catalyst: 'إعلان نتائج أعمال ربع سنوية قياسية وتوزيعات نقدية قوية',
        type: 'سهم قيادي • تجميع عند التصحيح',
        score: 95,
        support: '77.80 ج',
        target1: '88.00 ج',
        target2: '94.00 ج',
        stopLoss: '75.50 ج',
        liquidityStatus: 'ممتازة في ثندر (تداول عشرات الملايين)',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'SWDY',
        name: 'السويدي إليكتريك',
        index: 'egx30',
        sector: 'طاقة وصناعة',
        price: 51.40,
        high: 52.20,
        low: 50.00,
        close: 51.40,
        changePct: '+2.10%',
        volumeMultiplier: '2.1x',
        catalyst: 'عقود توريد كابلات ضخمة ومشروعات ربط كهربائي خليجي',
        type: 'طاقة وتصدير • اتجاه صاعد قوي',
        score: 94,
        support: '48.50 ج',
        target1: '58.00 ج',
        target2: '65.00 ج',
        stopLoss: '46.80 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['volume_surge', 'egx30', 'low_risk']
      },
      {
        ticker: 'AMOC',
        name: 'الإسكندرية للزيوت المعدنية',
        index: 'egx70',
        sector: 'بتروكيماويات وطاقة',
        price: 10.85,
        high: 11.20,
        low: 10.40,
        close: 10.85,
        changePct: '+4.32%',
        volumeMultiplier: '3.4x',
        catalyst: 'دخول سيولة مؤسساتية غير معتادة وتوقعات عوائد تصديرية مجزية',
        type: 'طفرة EGX70 واعدة • فوليوم استثنائي',
        score: 92,
        support: '9.80 ج',
        target1: '12.40 ج',
        target2: '14.00 ج',
        stopLoss: '9.30 ج',
        liquidityStatus: 'عالية جداً ونشطة في ثندر',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'ETRS',
        name: 'المصرية للنقل والخدمات (إيجيترانس)',
        index: 'egx70',
        sector: 'لوجستيات ونقل بحري',
        price: 4.65,
        high: 4.80,
        low: 4.35,
        close: 4.65,
        changePct: '+5.68%',
        volumeMultiplier: '4.1x',
        catalyst: 'استحواذات لوجستية وتوسعات نقل توربينات طاقة الرياح',
        type: 'طفرة صاعدة • كسر قمة سابقة',
        score: 90,
        support: '4.15 ج',
        target1: '5.50 ج',
        target2: '6.20 ج',
        stopLoss: '3.90 ج',
        liquidityStatus: 'نشطة في ثندر',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'FWRY',
        name: 'فوري لتكنولوجيا المدفوعات',
        index: 'egx30',
        sector: 'تكنولوجيا مالية',
        price: 7.85,
        high: 8.00,
        low: 7.65,
        close: 7.85,
        changePct: '+1.42%',
        volumeMultiplier: '1.8x',
        catalyst: 'نمو متسارع في عمليات التمويل الاستهلاكي والمدفوعات الإلكترونية',
        type: 'سهم تكنولوجيا قيادي • قاعدة سعرية قوية',
        score: 89,
        support: '7.30 ج',
        target1: '9.00 ج',
        target2: '10.50 ج',
        stopLoss: '7.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['egx30', 'low_risk']
      },
      {
        ticker: 'MFPC',
        name: 'مصر لإنتاج الأسمدة (موبكو)',
        index: 'egx30',
        sector: 'أسمدة وبتروكيماويات',
        price: 46.20,
        high: 47.00,
        low: 44.80,
        close: 46.20,
        changePct: '+2.80%',
        volumeMultiplier: '2.5x',
        catalyst: 'إيرادات دولارية نقية وهوامش ربحية استثنائية من تصدير اليوريا',
        type: 'عملاق أسمدة دولاري • استثمار آمن',
        score: 93,
        support: '43.00 ج',
        target1: '54.00 ج',
        target2: '60.00 ج',
        stopLoss: '41.50 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30', 'volume_surge']
      },
      {
        ticker: 'TMGH',
        name: 'مجموعة طلعت مصطفى القابضة',
        index: 'egx30',
        sector: 'تطوير عقاري وفندقي',
        price: 54.00,
        high: 55.20,
        low: 52.80,
        close: 54.00,
        changePct: '+0.95%',
        volumeMultiplier: '1.2x',
        catalyst: 'مبيعات تاريخية في رأس الحكمة ومشروع ساوث ميد وعوائد فندقية دولارية',
        type: 'سهم عقاري قيادي • استثمار استراتيجي',
        score: 88,
        support: '50.00 ج',
        target1: '64.00 ج',
        target2: '72.00 ج',
        stopLoss: '48.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['egx30', 'low_risk']
      },
      {
        ticker: 'ESRS',
        name: 'حديد عز',
        index: 'egx30',
        sector: 'معادن وتعدين',
        price: 94.50,
        high: 96.00,
        low: 92.50,
        close: 94.50,
        changePct: '+3.10%',
        volumeMultiplier: '2.3x',
        catalyst: 'طفرة تصديرية لمصانع أوروبا مع استفادة كاملة من خفض الجنيه',
        type: 'سهم تصدير ثقيل • اختراق مستويات مقاومة',
        score: 91,
        support: '88.00 ج',
        target1: '108.00 ج',
        target2: '120.00 ج',
        stopLoss: '85.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['volume_surge', 'egx30']
      },
      {
        ticker: 'ORAS',
        name: 'أوراسكوم كونستراكشون',
        index: 'egx30',
        sector: 'مقاولات وبنية تحتية',
        price: 305.00,
        high: 310.00,
        low: 298.00,
        close: 305.00,
        changePct: '+1.65%',
        volumeMultiplier: '1.5x',
        catalyst: 'عقود بنية تحتية دولارية ومشاريع كبرى بالشرق الأوسط والولايات المتحدة',
        type: 'سهم دولاري ممتاز • صلب وقت الأزمات',
        score: 92,
        support: '285.00 ج',
        target1: '345.00 ج',
        target2: '380.00 ج',
        stopLoss: '275.00 ج',
        liquidityStatus: 'عالية في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'ABUK',
        name: 'أبو قير للأسمدة',
        index: 'egx30',
        sector: 'بتروكيماويات',
        price: 58.50,
        high: 59.80,
        low: 57.20,
        close: 58.50,
        changePct: '+0.50%',
        volumeMultiplier: '1.3x',
        catalyst: 'توزيعات نقدية دورية ومفاوضات حصص استثمارية لمستثمرين استراتيجيين',
        type: 'عائد نقدى واستقرار مالي',
        score: 90,
        support: '55.00 ج',
        target1: '68.00 ج',
        target2: '75.00 ج',
        stopLoss: '53.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'SKPC',
        name: 'سيدي كرير للبتروكيماويات',
        index: 'egx70',
        sector: 'بتروكيماويات',
        price: 28.40,
        high: 29.20,
        low: 27.50,
        close: 28.40,
        changePct: '+3.65%',
        volumeMultiplier: '2.7x',
        catalyst: 'انتظام إمدادات الغاز وارتفاع الطلب على البولي إيثيلين بالأسواق الخارجية',
        type: 'طفرة بتروكيماويات • تعافي سريع',
        score: 87,
        support: '26.00 ج',
        target1: '33.00 ج',
        target2: '36.50 ج',
        stopLoss: '24.80 ج',
        liquidityStatus: 'نشطة جداً في ثندر',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'ALCN',
        name: 'الإسكندرية لتداول الحاويات',
        index: 'egx30',
        sector: 'نقل ولوجستيات دولارية',
        price: 48.90,
        high: 49.50,
        low: 47.80,
        close: 48.90,
        changePct: '+1.88%',
        volumeMultiplier: '1.7x',
        catalyst: 'عوائد شحن بحري بالدولار مع توزيع كوبونات أرباح تاريخية',
        type: 'سهم تدفقات نقدية دولارية نقية',
        score: 93,
        support: '45.50 ج',
        target1: '56.00 ج',
        target2: '62.00 ج',
        stopLoss: '44.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'BTFH',
        name: 'بلتون القابضة',
        index: 'egx30',
        sector: 'خدمات مالية وبنوك استثمار',
        price: 3.35,
        high: 3.45,
        low: 3.22,
        close: 3.35,
        changePct: '+2.14%',
        volumeMultiplier: '2.8x',
        catalyst: 'توسعات كبرى في التأجير التمويلي والتمويل العقاري بعد زيادة رأس المال',
        type: 'خدمات مالية ونمو متسارع',
        score: 86,
        support: '3.10 ج',
        target1: '4.10 ج',
        target2: '4.60 ج',
        stopLoss: '2.95 ج',
        liquidityStatus: 'أعلى سيولة في البورصة وثندر',
        tags: ['volume_surge', 'egx30']
      },
      {
        ticker: 'ISPH',
        name: 'ابن سينا فارما',
        index: 'egx70',
        sector: 'أدوية ورعاية صحية',
        price: 3.20,
        high: 3.32,
        low: 3.05,
        close: 3.20,
        changePct: '+4.25%',
        volumeMultiplier: '3.2x',
        catalyst: 'تحريك أسعار الأدوية واستقرار سلاسل الإمداد وتحسن هوامش التوزيع',
        type: 'طفرة قطاع الدواء • نموذج ارتداد قاع',
        score: 88,
        support: '2.95 ج',
        target1: '3.90 ج',
        target2: '4.35 ج',
        stopLoss: '2.80 ج',
        liquidityStatus: 'عالية ونشطة في ثندر',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'JUFO',
        name: 'جهينة للصناعات الغذائية',
        index: 'egx30',
        sector: 'صناعات غذائية واستهلاكية',
        price: 27.80,
        high: 28.40,
        low: 27.10,
        close: 27.80,
        changePct: '+1.10%',
        volumeMultiplier: '1.3x',
        catalyst: 'قوة تسعيرية هائلة ونمو مطرد في المبيعات وتوزيعات أرباح منتظمة',
        type: 'سهم استهلاكي دفاعي • نمو ثابت',
        score: 89,
        support: '25.50 ج',
        target1: '32.00 ج',
        target2: '35.00 ج',
        stopLoss: '24.50 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'OCDI',
        name: 'سوديك (السادس من أكتوبر للتنمية)',
        index: 'egx30',
        sector: 'تطوير عقاري فاخر',
        price: 52.00,
        high: 53.50,
        low: 50.80,
        close: 52.00,
        changePct: '+2.35%',
        volumeMultiplier: '1.9x',
        catalyst: 'تحالفات استراتيجية مع مستثمرين إماراتيين ومحفظة أراضي غرب وشرق القاهرة',
        type: 'عقارات فاخرة • دعم مؤسسي قوي',
        score: 90,
        support: '48.00 ج',
        target1: '61.00 ج',
        target2: '68.00 ج',
        stopLoss: '46.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'HRHO',
        name: 'إي إف جي القابضة (هيرميس)',
        index: 'egx30',
        sector: 'بنوك استثمار وإقليمي',
        price: 23.40,
        high: 24.00,
        low: 22.90,
        close: 23.40,
        changePct: '+1.52%',
        volumeMultiplier: '1.6x',
        catalyst: 'إيرادات بنك الاستثمار والسمسرة بالخليج ونمو بنك aiBANK التجاري',
        type: 'سهم مالي إقليمي قيادي',
        score: 91,
        support: '21.80 ج',
        target1: '27.50 ج',
        target2: '31.00 ج',
        stopLoss: '20.90 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'EGAL',
        name: 'مصر للألومنيوم',
        index: 'egx30',
        sector: 'معادن وصناعة ثقيلة',
        price: 109.00,
        high: 112.00,
        low: 106.00,
        close: 109.00,
        changePct: '+2.90%',
        volumeMultiplier: '2.2x',
        catalyst: 'ارتفاع أسعار الألومنيوم العالمية وتطوير مصنع نجع حمادي مع شريك أجنبي',
        type: 'سهم سلع أساسية وتصدير',
        score: 91,
        support: '102.00 ج',
        target1: '128.00 ج',
        target2: '140.00 ج',
        stopLoss: '98.00 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['volume_surge', 'egx30']
      }
    ];

    // Load from LocalStorage or use default
    // Load from LocalStorage or use default via EGX_Portfolio
    const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
    const CURRENT_PORTFOLIO_VER = (typeof EGX_Portfolio !== 'undefined') ? EGX_Portfolio.version : '2026_10_thndr_official_real_v211k';
    let portfolioData = [];

    function loadPortfolio() {
      if (typeof EGX_Portfolio !== 'undefined') {
        portfolioData = EGX_Portfolio.load();
      } else {
        portfolioData = JSON.parse(JSON.stringify(defaultPortfolioData));
      }
      if (!Array.isArray(portfolioData) || portfolioData.length === 0) {
        portfolioData = (typeof EGX_Portfolio !== 'undefined') ? EGX_Portfolio.getDefaultData() : JSON.parse(JSON.stringify(defaultPortfolioData));
      }
    }

    function savePortfolio() {
      if (typeof EGX_Portfolio !== 'undefined') {
        EGX_Portfolio.save(portfolioData);
      } else {
        localStorage.setItem('egx_copilot_portfolio', JSON.stringify(portfolioData));
      }

      // Realtime synchronization to Firebase Cloud Firestore
      if (typeof EGX_FirebaseSync !== 'undefined' && EGX_FirebaseSync.saveToCloud) {
        EGX_FirebaseSync.saveToCloud(portfolioData);
      }

      updateMetrics();
      renderPortfolioTable();
      renderAllocationChart();
    }

    function resetToDefaultPortfolio() {
      if (confirm('هل ترغب في استعادة أرقام المحفظة الأصلية من ثندر؟')) {
        portfolioData = (typeof EGX_Portfolio !== 'undefined') 
          ? EGX_Portfolio.getDefaultData() 
          : JSON.parse(JSON.stringify(defaultPortfolioData));
        savePortfolio();
      }
    }


    function getMarketRegimeCode() {
      if (!window.currentMarketRegime) return 'NORMAL_CONSOLIDATION';
      if (typeof window.currentMarketRegime === 'object') {
        return window.currentMarketRegime.regime || 'NORMAL_CONSOLIDATION';
      }
      return String(window.currentMarketRegime);
    }


    // Toast Notification System
    // ============================================================
    function showToast(message, type = 'success') {
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-6 left-6 z-[99999] flex flex-col gap-2 max-w-sm pointer-events-none';
        document.body.appendChild(toastContainer);
      }
      
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/80' :
                 type === 'error' ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/80' :
                 'bg-slate-900/95 border-cyan-500/60 text-cyan-100 shadow-cyan-950/80';
      
      toast.className = `p-4 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 flex items-start gap-3 text-xs font-semibold ${bg}`;
      toast.innerHTML = `
        <div class="shrink-0 mt-0.5 text-base">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div class="flex-1 leading-relaxed">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white shrink-0 p-1 text-sm font-bold cursor-pointer">×</button>
      `;
      
      toastContainer.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 350);
      }, 6500);
    }

    function showSuccessNotification(message) {
      showToast(message, 'success');
    }
