/**
 * EGX AI Copilot - Portfolio Manager (js/portfolio.js)
 * Clean, robust portfolio state, storage persistence, and capital accounting.
 */

(function (global) {
  'use strict';

  const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
  const CURRENT_PORTFOLIO_VER = '2026_10_clean_modular_v7_cash_sanitized';

  const defaultPortfolioData = [
    {
      ticker: 'ABUK',
      name: 'أبو قير للأسمدة',
      category: 'EGX30 • بتروكيماويات وتصدير',
      shares: 195,
      buyPrice: 76.52,
      currentPrice: 83.20,
      value: 16224,
      profit: 1302.60,
      returnPct: 8.73,
      status: 'ربح مستمر',
      advice: 'احتفاظ • تدفقات تصديرية دولارية ومشاريع طاقة نظيفة واعدة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 83.20 ج',
      thndrUrl: 'https://app.thndr.app/search?query=ABUK'
    },
    {
      ticker: 'ARCC',
      name: 'العربية للأسمنت',
      category: 'EGX70 • مواد بناء وإنشاءات',
      shares: 331,
      buyPrice: 66.86,
      currentPrice: 70.80,
      value: 23434.80,
      profit: 1304.14,
      returnPct: 5.89,
      status: 'ربح',
      advice: 'احتفاظ • استقرار أسعار الأسمنت وهوامش ربحية تصديرية جيدة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 70.80 ج',
      thndrUrl: 'https://app.thndr.app/search?query=ARCC'
    },
    {
      ticker: 'BSB',
      name: 'صندوق بلتون للسيولة النقدية (B-Safe Cash)',
      category: 'صناديق نقدية وسيولة • B-Safe',
      shares: 1222,
      buyPrice: 16.37,
      currentPrice: 16.73,
      value: 20444.06,
      profit: 439.92,
      returnPct: 2.20,
      status: 'ربح',
      advice: 'وثيقة سيولة يومية • استثمار آمن منخفض المخاطر يدر عائداً تراكمياً يطابق ثندر',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر الوثيقة المعلن 16.73 ج',
      thndrUrl: 'https://app.thndr.app/search?query=BSB'
    },
    {
      ticker: 'CLHO',
      name: 'مستشفيات كليوباترا',
      category: 'EGX30 • رعاية صحية ودفاعي',
      shares: 963,
      buyPrice: 17.73,
      currentPrice: 14.00,
      value: 13482,
      profit: -3592.01,
      returnPct: -21.04,
      status: 'تراجع',
      advice: 'مرشح للتدوير • انتظار ارتداد فني نحو المقاومة لتخفيف المركز وتدوير السيولة',
      action: 'REBALANCE_CANDIDATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 14.00 ج',
      thndrUrl: 'https://app.thndr.app/search?query=CLHO'
    },
    {
      ticker: 'COMI',
      name: 'البنك التجاري الدولي (CIB)',
      category: 'EGX30 • قطاع بنكي واستثمار مؤسسي',
      shares: 147,
      buyPrice: 139.32,
      currentPrice: 123.56,
      value: 18163.32,
      profit: -2316.72,
      returnPct: -11.31,
      status: 'تراجع',
      advice: 'تجميع تدريجي • مكرر ربحية مغرٍ وأكبر سهم قيادي وزناً في EGX30',
      action: 'ACCUMULATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 123.56 ج',
      thndrUrl: 'https://app.thndr.app/search?query=COMI'
    },
    {
      ticker: 'EMFD',
      name: 'إعمار مصر للتنمية',
      category: 'EGX30 • عقارات وتطوير فندقي',
      shares: 2638,
      buyPrice: 8.95,
      currentPrice: 8.65,
      value: 22818.70,
      profit: -791.40,
      returnPct: -3.35,
      status: 'تراجع',
      advice: 'احتفاظ • محفظة أراضٍ ضخمة وتدفقات سياحية دولارية ممتازة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 8.65 ج',
      thndrUrl: 'https://app.thndr.app/search?query=EMFD'
    },
    {
      ticker: 'ETRS',
      name: 'المصرية للنقل والخدمات (إيجيترانس)',
      category: 'EGX70 • نقل ولوجستيات',
      shares: 2884,
      buyPrice: 4.89,
      currentPrice: 5.75,
      value: 16583,
      profit: 2480.24,
      returnPct: 17.59,
      status: 'ربح قوي',
      advice: 'احتفاظ قوي وجني أرباح تدريجي عند ملامسة المقاومة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 5.75 ج',
      thndrUrl: 'https://app.thndr.app/search?query=ETRS'
    },
    {
      ticker: 'FWRY',
      name: 'فوري لتكنولوجيا البنوك والمدفوعات',
      category: 'EGX30 • تكنولوجيا مالية ومدفوعات',
      shares: 1111,
      buyPrice: 8.78,
      currentPrice: 10.89,
      value: 12098.79,
      profit: 2344.21,
      returnPct: 24.03,
      status: 'طفرة ربحية',
      advice: 'جني أرباح قمة جزئية • تأمين ثلث المكسب وإعادة تدوير السيولة',
      action: 'REBALANCE_CANDIDATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 10.89 ج',
      thndrUrl: 'https://app.thndr.app/search?query=FWRY'
    },
    {
      ticker: 'NCS',
      name: 'صندوق إن آي كابيتال (السيولة النقدية)',
      category: 'صناديق استثمار نقدية • عوائد يومية',
      shares: 1301,
      buyPrice: 15.42,
      currentPrice: 16.03,
      value: 20855.03,
      profit: 793.61,
      returnPct: 3.96,
      status: 'ربح آمن',
      advice: 'مرجع وثيقة نقدية • عائد تراكمي آمن من أذون الخزانة وأدوات النقد',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر الوثيقة المعلن 16.03 ج',
      thndrUrl: 'https://app.thndr.app/search?query=NCS'
    },
    {
      ticker: 'ORAS',
      name: 'أوراسكوم للإنشاءات (بي إل سي)',
      category: 'EGX30 • مقاولات دولية وبنية تحتية',
      shares: 55,
      buyPrice: 284.44,
      currentPrice: 355.00,
      value: 19525,
      profit: 3880.80,
      returnPct: 24.81,
      status: 'طفرة قياسية',
      advice: 'جني أرباح جزئي • تأمين الأرباح بعد صعود قوي ورفع وقف الخسارة المتحرك',
      action: 'REBALANCE_CANDIDATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 355.00 ج',
      thndrUrl: 'https://app.thndr.app/search?query=ORAS'
    },
    {
      ticker: 'SWDY',
      name: 'السويدي إليكتريك',
      category: 'EGX30 • صناعة وطاقة وكابلات',
      shares: 260,
      buyPrice: 77.29,
      currentPrice: 104.90,
      value: 27274,
      profit: 7178.60,
      returnPct: 35.72,
      status: 'نجم المحفظة',
      advice: 'احتفاظ قوي • نمو تصديري دولاري ومشاريع ربط كهربائي عملاقة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 104.90 ج',
      thndrUrl: 'https://app.thndr.app/search?query=SWDY'
    },
    {
      ticker: 'TMGH',
      name: 'مجموعة طلعت مصطفى القابضة',
      category: 'EGX30 • تطوير عقاري وفنادق وسياحة',
      shares: 310,
      buyPrice: 65.45,
      currentPrice: 83.00,
      value: 25730,
      profit: 5440.50,
      returnPct: 26.81,
      status: 'ربح استثنائي',
      advice: 'احتفاظ قوي • إيرادات فندقية دولارية وتوسعات رأس الحكمة ومشروع ساوث ميد',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 83.00 ج',
      thndrUrl: 'https://app.thndr.app/search?query=TMGH'
    },
    {
      ticker: 'CASH',
      name: 'المحفظة (الرصيد النقدي والسيولة)',
      category: 'محفظة نقدية • سيولة حرة',
      shares: 1,
      buyPrice: 18196.79,
      currentPrice: 18196.79,
      value: 18196.79,
      profit: 0.00,
      returnPct: 0.00,
      isCashReserve: true,
      status: 'سيولة نقدية جاهزة',
      advice: 'رصيد كاش حر في حساب ثندر متاح لاقتناص الفرص وتعزيز المراكز',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'حساب ثندر الرسمي',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'الرصيد النقدي الفعلي 18,196.79 ج',
      thndrUrl: 'https://app.thndr.app'
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

      // If user has existing valid portfolio data, preserve and reconcile it
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce CASH sanitation (fixes any 331M or NaN corruption from legacy storage)
        const defCash = defaultPortfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
        let cashItem = parsed.find(p => p.ticker === 'CASH' || p.isCashReserve);
        if (cashItem) {
          const cashVal = Number(cashItem.value);
          // If cash is corrupted (e.g. legacy concatenation 331,123,166 or NaN or <= 0 or > 500,000)
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

        if (savedVer !== CURRENT_PORTFOLIO_VER) {
          localStorage.setItem(PORTFOLIO_VERSION_KEY, CURRENT_PORTFOLIO_VER);

          // Reconcile and sanitize any corrupted math or NaN values in preserved portfolio
          parsed.forEach(item => {
            if (item.ticker !== 'CASH' && !item.isCashReserve && item.shares > 0 && item.buyPrice > 0) {
              item.shares = Number(item.shares) || 0;
              item.buyPrice = Number(item.buyPrice) || 0;
              const curPrice = Number(item.currentPrice) || Number(item.buyPrice);
              item.currentPrice = curPrice;
              item.value = Number((item.shares * curPrice).toFixed(2));
              const cost = Number((item.shares * item.buyPrice).toFixed(2));
              item.profit = Number((item.value - cost).toFixed(2));
              item.returnPct = cost > 0 ? Number(((item.profit / cost) * 100).toFixed(2)) : 0;
            }
          });

          this.save(parsed);

          // Clean legacy unversioned plans if corrupted
          try {
            const plans = localStorage.getItem('egx_copilot_active_plans');
            if (plans && !Array.isArray(JSON.parse(plans))) {
              localStorage.setItem('egx_copilot_active_plans', '[]');
            }
          } catch (e) {
            localStorage.setItem('egx_copilot_active_plans', '[]');
          }
        }
        return parsed;
      }

      // First run or empty/corrupted storage: seed with official baseline portfolio
      const fresh = this.getDefaultData();
      this.save(fresh);
      localStorage.setItem(PORTFOLIO_VERSION_KEY, CURRENT_PORTFOLIO_VER);
      return fresh;
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
