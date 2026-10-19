/**
 * EGX AI Copilot - Portfolio Manager (js/portfolio.js)
 * Clean, robust portfolio state, storage persistence, and capital accounting.
 */

(function (global) {
  'use strict';

  const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
  const CURRENT_PORTFOLIO_VER = '2026_10_thndr_official_real_v211k';

const defaultPortfolioData = [
    {
        "ticker": "ABUK",
        "name": "أبو قير للأسمدة",
        "category": "EGX30 • بتروكيماويات وتصدير",
        "shares": 195,
        "buyPrice": 76.52,
        "currentPrice": 88.01,
        "value": 17162,
        "profit": 2241,
        "returnPct": 15.02,
        "status": "ربح",
        "advice": "📈 اتجاه صاعد صحي أعلى متوسط 50 يوم (85.29 ج) • نمو (+15.0%)، احتفاظ استثماري هادئ مستهدفاً المقاومة 94.48 ج.",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 88.01 ج",
        "thndrUrl": "https://app.thndr.app/search?query=ABUK",
        "isCashReserve": false
    },
    {
        "ticker": "ARCC",
        "name": "العربية للأسمنت",
        "category": "EGX70 • مواد بناء وإنشاءات",
        "shares": 331,
        "buyPrice": 66.86,
        "currentPrice": 65.54,
        "value": 21694,
        "profit": -437,
        "returnPct": -1.97,
        "status": "تراجع",
        "advice": "احتفاظ ومتابعة • السهم يتحرك في نطاق الدعم 54.48 والمقاومة 76.32.",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 65.54 ج",
        "thndrUrl": "https://app.thndr.app/search?query=ARCC",
        "isCashReserve": false
    },
    {
        "ticker": "BSB",
        "name": "صندوق بلتون للأسهم (BSB)",
        "category": "صناديق استثمارية • بلتون إدخار",
        "shares": 161,
        "buyPrice": 1.83,
        "currentPrice": 1.69,
        "value": 272.09,
        "profit": -22.54,
        "returnPct": -7.65,
        "status": "صندوق إدخار",
        "advice": "مرجع وثيقة نمو • النمو السنوي الاسترشادي: 22%",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 1.69 ج",
        "thndrUrl": "https://app.thndr.app",
        "isCashReserve": false
    },
    {
        "ticker": "CLHO",
        "name": "مستشفيات كليوباترا",
        "category": "EGX30 • رعاية صحية ودفاعي",
        "shares": 963,
        "buyPrice": 17.73,
        "currentPrice": 14,
        "value": 13482,
        "profit": -3592,
        "returnPct": -21.04,
        "status": "تراجع",
        "advice": "🟢 ارتداد من تشبع بيعي (RSI: 27.3) أعلى الدعم الفني S1 (13.22 ج) • فرصة تعزيز للمستثمر طويل الأجل لخفض متوسط التكلفة.",
        "action": "ACCUMULATE",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 14 ج",
        "thndrUrl": "https://app.thndr.app/search?query=CLHO",
        "isCashReserve": false
    },
    {
        "ticker": "COMI",
        "name": "البنك التجاري الدولي (CIB)",
        "category": "EGX30 • السهم القيادي رقم 1",
        "shares": 122,
        "buyPrice": 140.48,
        "currentPrice": 124.97,
        "value": 15246,
        "profit": -1893,
        "returnPct": -11.05,
        "status": "تراجع",
        "advice": "احتفاظ ومتابعة • السهم يتحرك في نطاق الدعم 119.6 والمقاومة 137.9.",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 124.97 ج",
        "thndrUrl": "https://app.thndr.app/search?query=COMI",
        "isCashReserve": false
    },
    {
        "ticker": "EGAL",
        "name": "مصر للألومنيوم",
        "category": "EGX30 • معادن وثروة معدنية",
        "shares": 44,
        "buyPrice": 303.52,
        "currentPrice": 297.98,
        "value": 13111,
        "profit": -244,
        "returnPct": -1.83,
        "status": "تراجع",
        "advice": "⚠️ كسر مستوى الدعم الفني الرئيسي S1 (313.33 ج) • السعر الحالي 297.98 ج دون مستوى الأمان. راقب تفعيل خطة الحماية لتجنب انزلاق سعري.",
        "action": "STOP_LOSS_WARNING",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 297.98 ج",
        "thndrUrl": "https://app.thndr.app/search?query=EGAL",
        "isCashReserve": false
    },
    {
        "ticker": "HALN",
        "name": "إم إن تي حالا (HALN)",
        "category": "EGX • تكنولوجيا مالية وتمويل استهلاكي",
        "shares": 74,
        "buyPrice": 24.5,
        "currentPrice": 24.5,
        "value": 1813,
        "profit": 0,
        "returnPct": 0,
        "status": "اكتتاب واستقرار",
        "advice": "احتفاظ استثماري • نمو قياسي في قطاع التكنولوجيا المالية وحجم المعاملات",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 24.5 ج",
        "thndrUrl": "https://app.thndr.app",
        "isCashReserve": false
    },
    {
        "ticker": "HDBK",
        "name": "بنك التعمير والإسكان",
        "category": "EGX30 • قطاع بنكي وعوائد نقدية",
        "shares": 122,
        "buyPrice": 81.63,
        "currentPrice": 93.59,
        "value": 11418,
        "profit": 1459,
        "returnPct": 14.65,
        "status": "ربح",
        "advice": "⚠️ كسر مستوى الدعم الفني الرئيسي S1 (96.25 ج) • السعر الحالي 93.59 ج دون مستوى الأمان. راقب تفعيل خطة الحماية لتجنب انزلاق سعري.",
        "action": "STOP_LOSS_WARNING",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 93.59 ج",
        "thndrUrl": "https://app.thndr.app/search?query=HDBK",
        "isCashReserve": false
    },
    {
        "ticker": "NCS",
        "name": "صندوق إن آي كابيتال (NCS)",
        "category": "صناديق استثمارية • إن آي إدخار",
        "shares": 3037,
        "buyPrice": 20.61,
        "currentPrice": 18.36,
        "value": 55759.32,
        "profit": -6833.25,
        "returnPct": -10.92,
        "status": "أكبر مركز مالي",
        "advice": "مرجع وثيقة نقدية • العائد السنوي الاسترشادي: 22.4%",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 18.36 ج",
        "thndrUrl": "https://app.thndr.app",
        "isCashReserve": false
    },
    {
        "ticker": "ORAS",
        "name": "أوراسكوم كونستراكشون",
        "category": "EGX30 • بنية تحتية ومقاولات دولارية",
        "shares": 17,
        "buyPrice": 715.01,
        "currentPrice": 850.6,
        "value": 14460,
        "profit": 2305,
        "returnPct": 18.96,
        "status": "ربح",
        "advice": "📈 اتجاه صاعد صحي أعلى متوسط 50 يوم (821.77 ج) • نمو (+19.0%)، احتفاظ استثماري هادئ مستهدفاً المقاومة 865.73 ج.",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 850.6 ج",
        "thndrUrl": "https://app.thndr.app/search?query=ORAS",
        "isCashReserve": false
    },
    {
        "ticker": "RAYA",
        "name": "راية القابضة للاستثمارات",
        "category": "EGX70 • تكنولوجيا وخدمات مالية",
        "shares": 2193,
        "buyPrice": 6.88,
        "currentPrice": 5.83,
        "value": 12785,
        "profit": -2303,
        "returnPct": -15.26,
        "status": "تراجع",
        "advice": "🟢 ارتداد من تشبع بيعي (RSI: 33.4) أعلى الدعم الفني S1 (5.37 ج) • فرصة تعزيز للمستثمر طويل الأجل لخفض متوسط التكلفة.",
        "action": "ACCUMULATE",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 5.83 ج",
        "thndrUrl": "https://app.thndr.app/search?query=RAYA",
        "isCashReserve": false
    },
    {
        "ticker": "SWDY",
        "name": "السويدي إليكتريك",
        "category": "EGX30 • طاقة وتصدير",
        "shares": 110,
        "buyPrice": 93.86,
        "currentPrice": 109.2,
        "value": 12012,
        "profit": 1687,
        "returnPct": 16.34,
        "status": "ربح",
        "advice": "احتفاظ ومتابعة • السهم يتحرك في نطاق الدعم 91.64 والمقاومة 129.03.",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 109.2 ج",
        "thndrUrl": "https://app.thndr.app/search?query=SWDY",
        "isCashReserve": false
    },
    {
        "ticker": "TMGH",
        "name": "مجموعة طلعت مصطفى",
        "category": "EGX30 • عقارات وتنمية فندقية",
        "shares": 55,
        "buyPrice": 97.62,
        "currentPrice": 81.4,
        "value": 4477,
        "profit": -892,
        "returnPct": -16.61,
        "status": "تراجع",
        "advice": "🟢 ارتداد من تشبع بيعي (RSI: 20.5) أعلى الدعم الفني S1 (80.62 ج) • فرصة تعزيز للمستثمر طويل الأجل لخفض متوسط التكلفة.",
        "action": "ACCUMULATE",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 81.4 ج",
        "thndrUrl": "https://app.thndr.app/search?query=TMGH",
        "isCashReserve": false
    },
    {
        "ticker": "CASH",
        "name": "المحفظة (الرصيد النقدي والسيولة)",
        "category": "محفظة نقدية • سيولة حرة",
        "shares": 1,
        "buyPrice": 18196.79,
        "currentPrice": 18196.79,
        "value": 18196.79,
        "profit": 0,
        "returnPct": 0,
        "status": "سيولة نقدية جاهزة",
        "advice": "رصيد كاش حر في حساب ثندر متاح لاقتناص الفرص وتعزيز المراكز",
        "action": "HOLD",
        "priceUpdatedAt": "محفظة ثندر الرسمية",
        "priceSource": "شاشة ثندر اللحظية",
        "decisionUpdatedAt": "جلسة اليوم",
        "decisionBasis": "سعر السوق اللحظي 18196.79 ج",
        "thndrUrl": "https://app.thndr.app",
        "isCashReserve": true
    }
];

  const EGX_Portfolio = {
    version: CURRENT_PORTFOLIO_VER,

    getDefaultData: function () {
      return JSON.parse(JSON.stringify(defaultPortfolioData));
    },

    load: function () {
      const savedVer = localStorage.getItem(PORTFOLIO_VERSION_KEY);
      const saved = localStorage.getItem('egx_copilot_portfolio');
      let parsed = null;

      if (saved) {
        try {
          parsed = JSON.parse(saved);
        } catch (e) {
          parsed = null;
        }
      }

      if (Array.isArray(parsed)) {
        parsed = parsed.filter(item => item && typeof item === 'object' && typeof item.ticker === 'string' && item.ticker.trim() !== '');
      }

      // Detect if stored data is legacy mock data (e.g. contains old demo tickers like EMFD, ETRS, FWRY or lacks user funds)
      const isLegacyMockData = Array.isArray(parsed) && parsed.some(p =>
        ['EMFD', 'ETRS', 'FWRY', 'ISPH', 'ORWE'].includes(p.ticker)
      );
      const isMissingRealHoldings = Array.isArray(parsed) && (
        !parsed.some(p => p.ticker === 'BSB') ||
        !parsed.some(p => p.ticker === 'NCS') ||
        !parsed.some(p => p.ticker === 'ARCC')
      );

      // Universal migration: If version mismatch, empty storage, or legacy mock data detected, seed official real 211k baseline
      if (savedVer !== CURRENT_PORTFOLIO_VER || !Array.isArray(parsed) || parsed.length === 0 || isLegacyMockData || isMissingRealHoldings) {
        parsed = this.getDefaultData();
        this.save(parsed);
        localStorage.setItem(PORTFOLIO_VERSION_KEY, CURRENT_PORTFOLIO_VER);
        try {
          localStorage.setItem('egx_copilot_active_plans', '[]');
        } catch (e) {}
        return parsed;
      }

      // Enforce CASH sanitation (fixes any 331M or NaN corruption from legacy storage)
      const defCash = defaultPortfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      let cashItem = parsed.find(p => p.ticker === 'CASH' || p.isCashReserve);
      if (cashItem) {
        const cashVal = Number(cashItem.value);
        if (isNaN(cashVal) || cashVal <= 0 || cashVal > 500000 || typeof cashItem.value === 'string') {
          cashItem.value = defCash ? defCash.value : 18196.79;
          cashItem.buyPrice = cashItem.value;
          cashItem.currentPrice = cashItem.value;
          cashItem.shares = 1;
          this.save(parsed);
        } else {
          cashItem.value = Number(cashVal.toFixed(2));
          cashItem.buyPrice = cashItem.value;
          cashItem.currentPrice = cashItem.value;
        }
      } else if (defCash) {
        parsed.push(JSON.parse(JSON.stringify(defCash)));
        this.save(parsed);
      }

      return parsed;
    },

    save: function (data) {
      if (Array.isArray(data)) {
        localStorage.setItem('egx_copilot_portfolio', JSON.stringify(data));
      }
    },

    calculateMetrics: function (portfolioData) {
      if (!Array.isArray(portfolioData)) {
        return { totalWealth: 0, totalCost: 0, totalProfit: 0, totalReturnPct: 0 };
      }

      let totalWealth = 0;
      let totalCost = 0;

      portfolioData.forEach(item => {
        const val = Number(item.value) || 0;
        const shares = Number(item.shares) || 0;
        const buyPrice = Number(item.buyPrice) || 0;
        totalWealth += val;
        if (item.ticker === 'CASH' || item.isCashReserve) {
          totalCost += val;
        } else {
          totalCost += (shares * buyPrice);
        }
      });

      const totalProfit = Number((totalWealth - totalCost).toFixed(2));
      const totalReturnPct = totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0;

      return {
        totalWealth: Number(totalWealth.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        totalProfit,
        totalReturnPct
      };
    },

    getCashBalance: function (portfolioData) {
      if (!Array.isArray(portfolioData)) return 0;
      const cashItem = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      return cashItem ? Number(cashItem.value) || 0 : 0;
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_Portfolio;
  } else {
    global.EGX_Portfolio = EGX_Portfolio;
  }
})(typeof window !== 'undefined' ? window : this);
