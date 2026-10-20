/**
 * EGX AI Copilot - Portfolio Manager (js/portfolio.js)
 * Clean, robust portfolio state, storage persistence, and capital accounting.
 */

(function (global) {
  'use strict';

  const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
  const CURRENT_PORTFOLIO_VER = '2026_10_zero_assumption_provenance_v215';

  const EGX_FUNDAMENTALS_REGISTRY = {
    "ABUK": {
      pe: 8.5, eps: 10.35, sector: "بتروكيماويات وتصدير", sectorPe: 8.5, peVsSectorPct: 0.0,
      operatingMargin: 48.5, netMargin: 42.0, dividendYield: 9.47, priceToBook: 3.77,
      valuationStatus: "مماثل لمتوسط القطاع (تقييم عادل)",
      operationalStability: "أرباح تشغيلية صلبة ومستقرة (هامش تشغيل: 48.5%)"
    },
    "ARCC": {
      pe: 9.8, eps: 6.69, sector: "مواد بناء وتشييد", sectorPe: 9.5, peVsSectorPct: 3.2,
      operatingMargin: 21.4, netMargin: 15.2, dividendYield: 4.5, priceToBook: 2.1,
      valuationStatus: "مماثل لمتوسط قطاع مواد البناء",
      operationalStability: "أرباح تشغيلية منتظمة (هامش تشغيل: 21.4%)"
    },
    "COMI": {
      pe: 6.01, eps: 21.16, sector: "بنوك وخدمات مالية", sectorPe: 5.0, peVsSectorPct: 20.2,
      operatingMargin: 85.0, netMargin: 51.0, dividendYield: 4.8, priceToBook: 1.78,
      valuationStatus: "علاوة جودة مصرفية (+20%)",
      operationalStability: "أرباح تشغيلية ومصرفية فائقة القوة (هامش تشغيل: 85.0%)"
    },
    "HDBK": {
      pe: 5.0, eps: 18.73, sector: "بنوك وتمويل عقاري", sectorPe: 5.0, peVsSectorPct: 0.0,
      operatingMargin: 73.2, netMargin: 57.8, dividendYield: 3.93, priceToBook: 2.13,
      valuationStatus: "مكرر ربحية مغري ومماثل لمتوسط القطاع (5.0x)",
      operationalStability: "أرباح تشغيلية ومصرفية صلبة ومستقرة (هامش تشغيل: 73.2%)"
    },
    "SWDY": {
      pe: 14.33, eps: 7.62, sector: "طاقة وكابلات وتصدير", sectorPe: 13.5, peVsSectorPct: 6.1,
      operatingMargin: 8.8, netMargin: 5.1, dividendYield: 1.64, priceToBook: 1.95,
      valuationStatus: "مماثل لمتوسط قطاع الكابلات والصناعة",
      operationalStability: "أرباح تشغيلية بهوامش صناعية منتظمة (8.8%)"
    },
    "TMGH": {
      pe: 10.86, eps: 7.49, sector: "تطوير عقاري وفنادق", sectorPe: 11.2, peVsSectorPct: -3.0,
      operatingMargin: 28.3, netMargin: 21.6, dividendYield: 0.35, priceToBook: 1.83,
      valuationStatus: "أرخص من متوسط قطاع التطوير العقاري بنسبة 3%",
      operationalStability: "أرباح تشغيلية وتدفقات عقارية وفندقية قوية (28.3%)"
    },
    "CLHO": {
      pe: 20.9, eps: 0.67, sector: "رعاية صحية ومستشفيات", sectorPe: 21.0, peVsSectorPct: -0.5,
      operatingMargin: 18.5, netMargin: 12.0, dividendYield: 2.1, priceToBook: 2.4,
      valuationStatus: "مماثل لمتوسط قطاع الرعاية الصحية (20.9x مطابق لثندر)",
      operationalStability: "أرباح تشغيلية دفاعية مستقرة من الرعاية الصحية (18.5%)"
    },
    "EGAL": {
      pe: 7.2, eps: 45.2, sector: "معادن وصناعة ثقيلة", sectorPe: 7.5, peVsSectorPct: -4.0,
      operatingMargin: 26.5, netMargin: 22.0, dividendYield: 6.2, priceToBook: 2.8,
      valuationStatus: "أرخص من متوسط القطاع بنسبة 4%",
      operationalStability: "أرباح تشغيلية صلبة وتصدير دولاري"
    },
    "HALN": {
      pe: 18.5, eps: 1.32, sector: "تكنولوجيا مالية وتمويل استهلاكي", sectorPe: 19.5, peVsSectorPct: -5.1,
      operatingMargin: 32.0, netMargin: 24.5, dividendYield: 0.0, priceToBook: 3.2,
      valuationStatus: "أرخص من متوسط قطاع التكنولوجيا المالية بنسبة 5%",
      operationalStability: "أرباح تشغيلية ونمو متسارع في المعاملات"
    },
    "ORAS": {
      pe: 8.2, eps: 103.7, sector: "مقاولات وبنية تحتية دولارية", sectorPe: 8.5, peVsSectorPct: -3.5,
      operatingMargin: 12.5, netMargin: 8.5, dividendYield: 5.5, priceToBook: 1.6,
      valuationStatus: "أرخص من متوسط القطاع",
      operationalStability: "أرباح تشغيلية وتدفقات دولارية منتظمة"
    },
    "RAYA": {
      pe: 11.5, eps: 0.42, sector: "استثمارات وتكنولوجيا", sectorPe: 12.0, peVsSectorPct: -4.2,
      operatingMargin: 14.2, netMargin: 8.8, dividendYield: 3.2, priceToBook: 1.5,
      valuationStatus: "أرخص من متوسط القطاع بنسبة 4%",
      operationalStability: "أرباح تشغيلية متوازنة ومتنوعة"
    },
    "FWRY": {
      pe: 19.19, eps: 0.95, sector: "مدفوعات رقمية وتكنولوجيا", sectorPe: 19.5, peVsSectorPct: -1.6,
      operatingMargin: 34.4, netMargin: 32.2, dividendYield: 0.0, priceToBook: 4.1,
      valuationStatus: "مماثل لمتوسط قطاع المدفوعات والتكنولوجيا",
      operationalStability: "أرباح تشغيلية قوية من نشاط المدفوعات (34.4%)"
    },
    "MFPC": {
      pe: 8.2, eps: 5.36, sector: "بتروكيماويات وأسمدة", sectorPe: 8.5, peVsSectorPct: -3.5,
      operatingMargin: 51.1, netMargin: 45.6, dividendYield: 8.97, priceToBook: 2.8,
      valuationStatus: "أرخص من متوسط القطاع مع عائد توزيعات ضخم (8.97%)",
      operationalStability: "أرباح تشغيلية فائقة وهوامش تصدير حرة (51.1%)"
    },
    "CIEB": {
      pe: 4.3, eps: 5.12, sector: "بنوك وخدمات مالية", sectorPe: 5.0, peVsSectorPct: -14.0,
      operatingMargin: 62.8, netMargin: 43.0, dividendYield: 14.46, priceToBook: 1.23,
      valuationStatus: "أرخص من متوسط القطاع بنسبة 14% (عائد توزيعات 14.5%)",
      operationalStability: "أرباح مصرفية تشغيلية صلبة وتوزيعات سخية (62.8%)"
    },
    "ADIB": {
      pe: 4.37, eps: 10.32, sector: "بنوك وصيرفة إسلامية", sectorPe: 5.0, peVsSectorPct: -12.6,
      operatingMargin: 72.0, netMargin: 50.6, dividendYield: 0.0, priceToBook: 1.47,
      valuationStatus: "أرخص من متوسط القطاع بنسبة 12.6% (أسرع البنوك نمواً)",
      operationalStability: "أرباح تشغيلية ونمو متسارع في التمويل الإسلامي (72.0%)"
    }
  };

const defaultPortfolioData = [
    {
        "ticker": "ABUK",
        "name": "أبو قير للأسمدة",
        "category": "EGX30 • بتروكيماويات وتصدير",
        "shares": 195,
        "buyPrice": 76.52,
        "currentPrice": 88.01,
        "pivotR1": 94.48,
        "pivotS1": 81.54,
        "target1": 94.48,
        "stopLoss": 81.54,
        "high": 91.20,
        "low": 86.80,
        "close": 88.01,
        "pivot": 88.67,
        "value": 17162,
        "profit": 2241,
        "returnPct": 15.02,
        "status": "ربح",
        "advice": "📈 اتجاه صاعد صحي أعلى متوسط 50 يوم (85.29 ج) • نمو (+15.0%)، احتفاظ استثماري هادئ مستهدفاً المقاومة 94.48 ج.",
        "action": "HOLD",
        "pe": 8.5,
        "eps": 10.35,
        "sector": "بتروكيماويات وتصدير",
        "sectorPe": 8.5,
        "peVsSectorPct": 0.0,
        "operatingMargin": 48.5,
        "netMargin": 42.0,
        "dividendYield": 9.47,
        "priceToBook": 3.77,
        "valuationStatus": "مماثل لمتوسط القطاع (تقييم عادل)",
        "operationalStability": "أرباح تشغيلية صلبة ومستقرة (هامش تشغيل: 48.5%)",
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
        "pivotR1": 76.32,
        "pivotS1": 54.48,
        "target1": 76.32,
        "stopLoss": 54.48,
        "high": 68.00,
        "low": 64.00,
        "close": 65.54,
        "pivot": 65.85,
        "value": 21694,
        "profit": -437,
        "returnPct": -1.97,
        "status": "تراجع",
        "advice": "احتفاظ ومتابعة • السهم يتحرك في نطاق الدعم 54.48 والمقاومة 76.32.",
        "action": "HOLD",
        "pe": 9.8,
        "eps": 6.69,
        "sector": "مواد بناء وتشييد",
        "sectorPe": 9.5,
        "peVsSectorPct": 3.2,
        "operatingMargin": 21.4,
        "netMargin": 15.2,
        "dividendYield": 4.5,
        "priceToBook": 2.1,
        "valuationStatus": "مماثل لمتوسط قطاع مواد البناء",
        "operationalStability": "أرباح تشغيلية منتظمة (هامش تشغيل: 21.4%)",
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
        "pivotR1": 2.10,
        "pivotS1": 1.55,
        "target1": 2.10,
        "stopLoss": 1.55,
        "high": 1.72,
        "low": 1.67,
        "close": 1.69,
        "pivot": 1.69,
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
        "category": "EGX30 • رعاية صحية ودفاعي (النواة الاستثمارية)",
        "shares": 963,
        "buyPrice": 17.73,
        "currentPrice": 14,
        "pivotR1": 15.80,
        "pivotS1": 13.22,
        "target1": 15.80,
        "stopLoss": 13.22,
        "high": 14.80,
        "low": 13.60,
        "close": 14.00,
        "pivot": 14.13,
        "value": 13482,
        "profit": -3592,
        "returnPct": -21.04,
        "status": "تراجع",
        "advice": "⚠️ حظر التبريد: تراجع السهم (-21.0%) يمنع ضخ سيولة جديدة رغم التشبع البيعي (RSI: 27.3). انتظر ارتداداً للمقاومة R1 (15.80 ج) لتخفيف 50% وتدوير الكاش.",
        "action": "DEFENSIVE_HOLD",
        "pe": 20.9,
        "eps": 0.67,
        "sector": "رعاية صحية ومستشفيات",
        "sectorPe": 21.0,
        "peVsSectorPct": -0.5,
        "operatingMargin": 18.5,
        "netMargin": 12.0,
        "dividendYield": 2.1,
        "priceToBook": 2.4,
        "valuationStatus": "مماثل لمتوسط قطاع الرعاية الصحية (20.9x مطابق لثندر)",
        "operationalStability": "أرباح تشغيلية دفاعية مستقرة من الرعاية الصحية (18.5%)",
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
        "category": "EGX30 • البنك التجاري الدولي (النواة الاستثمارية)",
        "shares": 122,
        "buyPrice": 140.48,
        "currentPrice": 124.97,
        "pivotR1": 137.90,
        "pivotS1": 119.60,
        "target1": 137.90,
        "stopLoss": 119.60,
        "high": 128.50,
        "low": 123.00,
        "close": 124.97,
        "pivot": 125.49,
        "value": 15246,
        "profit": -1893,
        "returnPct": -11.05,
        "status": "تراجع",
        "advice": "🛡️ سهم قيادي من النواة: احتفاظ هادئ ومتابعة ارتداد المقاومة 137.90 ج؛ ملاءة البنك صلبة وأرباحه قياسية، مع حظر الشراء الإضافي قبل اختراق 130 ج.",
        "action": "HOLD",
        "pe": 6.01,
        "eps": 21.16,
        "sectorPe": 5.0,
        "peVsSectorPct": 20.2,
        "operatingMargin": 85.0,
        "netMargin": 51.0,
        "dividendYield": 4.8,
        "priceToBook": 1.78,
        "valuationStatus": "علاوة جودة مصرفية (+20%)",
        "operationalStability": "أرباح تشغيلية ومصرفية فائقة القوة (هامش تشغيل: 85.0%)",
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
        "pivotR1": 330.00,
        "pivotS1": 313.33,
        "target1": 330.00,
        "stopLoss": 313.33,
        "high": 318.00,
        "low": 295.00,
        "close": 297.98,
        "pivot": 303.66,
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
        "pivotR1": 28.00,
        "pivotS1": 22.00,
        "target1": 28.00,
        "stopLoss": 22.00,
        "high": 25.50,
        "low": 23.80,
        "close": 24.50,
        "pivot": 24.60,
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
        "pivotR1": 104.50,
        "pivotS1": 96.25,
        "target1": 104.50,
        "stopLoss": 96.25,
        "high": 98.50,
        "low": 92.00,
        "close": 93.59,
        "pivot": 94.70,
        "value": 11418,
        "profit": 1459,
        "returnPct": 14.65,
        "status": "ربح",
        "advice": "⚠️ كسر مستوى الدعم الفني الرئيسي S1 (96.25 ج) • السعر الحالي 93.59 ج دون مستوى الأمان. راقب تفعيل خطة الحماية لتجنب انزلاق سعري.",
        "action": "STOP_LOSS_WARNING",
        "pe": 5.0,
        "eps": 18.73,
        "sectorPe": 5.0,
        "peVsSectorPct": 0,
        "operatingMargin": 73.2,
        "netMargin": 57.8,
        "dividendYield": 3.93,
        "priceToBook": 2.13,
        "valuationStatus": "مكرر ربحية مغري ومماثل لمتوسط القطاع (5.0x)",
        "operationalStability": "أرباح تشغيلية ومصرفية صلبة ومستقرة (هامش تشغيل: 73.2%)",
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
        "pivotR1": 21.50,
        "pivotS1": 17.50,
        "target1": 21.50,
        "stopLoss": 17.50,
        "high": 18.50,
        "low": 18.20,
        "close": 18.36,
        "pivot": 18.36,
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
        "pivotR1": 865.73,
        "pivotS1": 810.00,
        "target1": 865.73,
        "stopLoss": 810.00,
        "high": 860.00,
        "low": 840.00,
        "close": 850.60,
        "pivot": 850.20,
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
        "category": "EGX70 • تكنولوجيا ومضاربة (الأقمار)",
        "shares": 2193,
        "buyPrice": 6.88,
        "currentPrice": 5.83,
        "pivotR1": 6.60,
        "pivotS1": 5.37,
        "target1": 6.60,
        "stopLoss": 5.37,
        "high": 6.10,
        "low": 5.65,
        "close": 5.83,
        "pivot": 5.86,
        "value": 12785,
        "profit": -2303,
        "returnPct": -15.26,
        "status": "تراجع",
        "advice": "⚠️ حظر التبريد: سهم مضاربة تكتيكي متراجع (-15.3%). يمنع التبريد نهائياً؛ راقب موجة ارتدادية نحو المقاومة R1 (6.60 ج) لتخفيف المركز وتدوير السيولة.",
        "action": "DEFENSIVE_HOLD",
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
        "pivotR1": 129.03,
        "pivotS1": 91.64,
        "target1": 129.03,
        "stopLoss": 91.64,
        "high": 112.00,
        "low": 106.50,
        "close": 109.20,
        "pivot": 109.23,
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
        "pivotR1": 92.50,
        "pivotS1": 80.62,
        "target1": 92.50,
        "stopLoss": 80.62,
        "high": 84.00,
        "low": 80.80,
        "close": 81.40,
        "pivot": 82.07,
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

      // Guarantee Every Holding Always Has Real Fundamental Metrics (P/E & Operating Stability)
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (EGX_FUNDAMENTALS_REGISTRY[item.ticker]) {
            const f = EGX_FUNDAMENTALS_REGISTRY[item.ticker];
            if (item.pe === undefined) item.pe = f.pe;
            if (item.eps === undefined) item.eps = f.eps;
            if (item.sectorPe === undefined) item.sectorPe = f.sectorPe;
            if (item.peVsSectorPct === undefined) item.peVsSectorPct = f.peVsSectorPct;
            if (item.operatingMargin === undefined) item.operatingMargin = f.operatingMargin;
            if (item.netMargin === undefined) item.netMargin = f.netMargin;
            if (item.dividendYield === undefined) item.dividendYield = f.dividendYield;
            if (item.valuationStatus === undefined) item.valuationStatus = f.valuationStatus;
            if (item.operationalStability === undefined) item.operationalStability = f.operationalStability;
          }
        });
      }

      return parsed;
    },

    getFundamentals: function (ticker) {
      return EGX_FUNDAMENTALS_REGISTRY[ticker] || null;
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
    },

    // Custom User Price Levels (Overrides for Target 1 & Stop Loss)
    getCustomLevels: function (ticker) {
      try {
        const raw = localStorage.getItem('egx_copilot_custom_levels');
        const map = raw ? JSON.parse(raw) : {};
        return map[ticker] || null;
      } catch (e) {
        return null;
      }
    },

    setCustomLevels: function (ticker, levels) {
      try {
        const raw = localStorage.getItem('egx_copilot_custom_levels');
        const map = raw ? JSON.parse(raw) : {};
        if (!levels) {
          delete map[ticker];
        } else {
          map[ticker] = {
            customTarget1: (levels.customTarget1 !== null && levels.customTarget1 !== undefined && levels.customTarget1 !== '') ? Number(levels.customTarget1) : null,
            customStopLoss: (levels.customStopLoss !== null && levels.customStopLoss !== undefined && levels.customStopLoss !== '') ? Number(levels.customStopLoss) : null,
            updatedAt: new Date().toISOString()
          };
        }
        localStorage.setItem('egx_copilot_custom_levels', JSON.stringify(map));
        return map[ticker] || null;
      } catch (e) {
        console.warn('Failed to save custom price levels', e);
        return null;
      }
    },

    resetCustomLevels: function (ticker) {
      try {
        const raw = localStorage.getItem('egx_copilot_custom_levels');
        const map = raw ? JSON.parse(raw) : {};
        delete map[ticker];
        localStorage.setItem('egx_copilot_custom_levels', JSON.stringify(map));
      } catch (e) {}
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_Portfolio;
  } else {
    global.EGX_Portfolio = EGX_Portfolio;
  }
})(typeof window !== 'undefined' ? window : this);
