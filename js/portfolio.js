/**
 * EGX AI Copilot - Portfolio Manager (js/portfolio.js)
 * Clean, robust portfolio state, storage persistence, and capital accounting.
 */

(function (global) {
  'use strict';

  const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
  const CURRENT_PORTFOLIO_VER = '2026_10_clean_modular_v3_production';

  const defaultPortfolioData = [
    {
      ticker: 'ABUK',
      name: 'أبو قير للأسمدة',
      category: 'EGX30 • بتروكيماويات وتصدير',
      shares: 195,
      buyPrice: 76.52,
      currentPrice: 83.20,
      value: 16224,
      profit: 1302.79,
      returnPct: 8.73,
      status: 'ربح مستمر',
      advice: 'احتفاظ • تدفقات تصديرية دولارية ومشاريع طاقة نظيفة واعدة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 83.20 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'ARCC',
      name: 'العربية للأسمنت',
      category: 'EGX70 • مواد بناء وإنشاءات',
      shares: 331,
      buyPrice: 66.86,
      currentPrice: 70.80,
      value: 23435,
      profit: 1305.15,
      returnPct: 5.90,
      status: 'ربح',
      advice: 'احتفاظ • استقرار أسعار الأسمنت وهوامش ربحية تصديرية جيدة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 70.80 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'BSB',
      name: 'صندوق بيل كاش (أسهم ونمو)',
      category: 'صناديق استثمار أسهم • B-Safe',
      shares: 1222,
      buyPrice: 16.37,
      currentPrice: 16.73,
      value: 20444,
      profit: 439.92,
      returnPct: 2.20,
      status: 'ربح',
      advice: 'مرجع وثيقة نمو • استثمار طويل الأجل في أسهم النمو المصرية',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر الوثيقة المعلن 16.73 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'CLHO',
      name: 'مستشفيات كليوباترا',
      category: 'EGX30 • رعاية صحية ودفاعي',
      shares: 963,
      buyPrice: 17.73,
      currentPrice: 14.00,
      value: 13482,
      profit: -3595.92,
      returnPct: -21.06,
      status: 'تراجع',
      advice: 'مرشح للتدوير • انتظار ارتداد فني نحو المقاومة لتخفيف المركز وتدوير السيولة',
      action: 'REBALANCE_CANDIDATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 14.00 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'COMI',
      name: 'البنك التجاري الدولي (CIB)',
      category: 'EGX30 • قطاع بنكي واستثمار مؤسسي',
      shares: 147,
      buyPrice: 139.32,
      currentPrice: 123.56,
      value: 18163,
      profit: -2317.04,
      returnPct: -11.31,
      status: 'تراجع',
      advice: 'تجميع تدريجي • مكرر ربحية مغرٍ وأكبر سهم قيادي وزناً في EGX30',
      action: 'ACCUMULATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 123.56 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'EMFD',
      name: 'إعمار مصر للتنمية',
      category: 'EGX30 • عقارات وتطوير فندقي',
      shares: 2638,
      buyPrice: 8.95,
      currentPrice: 8.65,
      value: 22819,
      profit: -791.40,
      returnPct: -3.35,
      status: 'تراجع',
      advice: 'احتفاظ • محفظة أراضٍ ضخمة وتدفقات سياحية دولارية ممتازة',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 8.65 ج',
      thndrUrl: 'https://app.thndr.app'
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
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'FWRY',
      name: 'فوري لتكنولوجيا البنوك والمدفوعات',
      category: 'EGX30 • تكنولوجيا مالية ومدفوعات',
      shares: 1111,
      buyPrice: 8.78,
      currentPrice: 10.89,
      value: 12099,
      profit: 2344.21,
      returnPct: 24.03,
      status: 'طفرة ربحية',
      advice: 'جني أرباح قمة جزئية • تأمين ثلث المكسب وإعادة تدوير السيولة',
      action: 'REBALANCE_CANDIDATE',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر السوق اللحظي 10.89 ج',
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'NCS',
      name: 'صندوق إن آي كابيتال (السيولة النقدية)',
      category: 'صناديق استثمار نقدية • عوائد يومية',
      shares: 1301,
      buyPrice: 15.42,
      currentPrice: 16.03,
      value: 20855,
      profit: 793.61,
      returnPct: 3.96,
      status: 'ربح آمن',
      advice: 'مرجع وثيقة نقدية • عائد تراكمي آمن من أذون الخزانة وأدوات النقد',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'سعر الوثيقة المعلن 16.03 ج',
      thndrUrl: 'https://app.thndr.app'
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
      thndrUrl: 'https://app.thndr.app'
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
      thndrUrl: 'https://app.thndr.app'
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
      thndrUrl: 'https://app.thndr.app'
    },
    {
      ticker: 'CASH',
      name: 'المحفظة (الرصيد النقدي المتاح)',
      category: 'محفظة نقدية جاهزة للاقتناص',
      shares: 1,
      buyPrice: 1391,
      currentPrice: 1391,
      value: 1391,
      profit: 0,
      returnPct: 0.0,
      status: 'كاش متاح',
      advice: 'سيولة نقدية جاهزة لاقتناص الفرص عند ارتداد الأسهم من مناطق الدعم',
      action: 'HOLD',
      priceUpdatedAt: 'محفظة ثندر الرسمية',
      priceSource: 'شاشة ثندر اللحظية',
      decisionUpdatedAt: 'جلسة اليوم',
      decisionBasis: 'رصيد كاش محفظة ثندر',
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
      if (savedVer !== CURRENT_PORTFOLIO_VER) {
        const fresh = this.getDefaultData();
        this.save(fresh);
        localStorage.setItem(PORTFOLIO_VERSION_KEY, CURRENT_PORTFOLIO_VER);
        // Clean out legacy unversioned keys if corrupted
        try {
          const plans = localStorage.getItem('egx_copilot_active_plans');
          if (plans && !Array.isArray(JSON.parse(plans))) {
            localStorage.setItem('egx_copilot_active_plans', '[]');
          }
        } catch(e) {
          localStorage.setItem('egx_copilot_active_plans', '[]');
        }
        return fresh;
      }

      const saved = localStorage.getItem('egx_copilot_portfolio');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch(e){}
      }
      const fresh = this.getDefaultData();
      this.save(fresh);
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
        const profit = Number(item.profit) || 0;
        totalWealth += val;
        totalCost += (val - profit);
      });

      const totalProfit = totalWealth - totalCost;
      const totalReturnPct = totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0;

      return {
        totalWealth: Math.round(totalWealth),
        totalCost: Math.round(totalCost),
        totalProfit: Math.round(totalProfit),
        totalReturnPct
      };
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_Portfolio;
  } else {
    global.EGX_Portfolio = EGX_Portfolio;
  }
})(typeof window !== 'undefined' ? window : this);
