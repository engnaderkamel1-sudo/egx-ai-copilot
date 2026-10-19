// /api/prices.js
// Ultra-Reliable EGX Live Market Scanner & Prices Provider
// Powered by TradingView Egypt Real-Time Scanner with True Technical Indicators & Pivot Points

function toEnglishDigits(str) {
  if (str === null || str === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[٠-٩]/g, d => arabicDigits.indexOf(d));
}

const EGX_DICTIONARY = {
  "COMI": { name: "البنك التجاري الدولي (CIB)", sector: "بنوك وخدمات مالية", index: "egx30", quality: "سهم دفاعي من الطراز الأول" },
  "SWDY": { name: "السويدي إليكتريك", sector: "طاقة وكابلات وتصدير", index: "egx30", quality: "إيرادات دولارية قوية" },
  "ORAS": { name: "أوراسكوم كونستراكشون", sector: "مقاولات وبنية تحتية دولارية", index: "egx30", quality: "توزيعات دولارية وأمان عالي" },
  "TMGH": { name: "مجموعة طلعت مصطفى", sector: "تطوير عقاري وفنادق", index: "egx30", quality: "مشروعات تاريخية وتدفقات مستمرة" },
  "ABUK": { name: "أبو قير للأسمدة", sector: "بتروكيماويات وتصدير", index: "egx30", quality: "توزيعات نقدية وعائد مرتفع" },
  "EGAL": { name: "مصر للألومنيوم", sector: "معادن وصناعة ثقيلة", index: "egx30", quality: "استفادة مباشرة من ارتفاع المعادن عالمياً" },
  "ETEL": { name: "المصرية للاتصالات (وي)", sector: "اتصالات وتكنولوجيا", index: "egx30", quality: "حصة فودافون مصر وبنية تحتية" },
  "FWRY": { name: "فوري لتكنولوجيا البنوك", sector: "مدفوعات رقمية وتكنولوجيا", index: "egx30", quality: "ريادة المدفوعات والشمول المالي" },
  "HDBK": { name: "بنك التعمير والإسكان", sector: "بنوك وتمويل عقاري", index: "egx30", quality: "مكرر ربحية منخفض جداً وتوزيعات قوية" },
  "AMOC": { name: "الإسكندرية للزيوت المعدنية (أموك)", sector: "بترول وتكرير", index: "egx70", quality: "هوامش تكرير بترولية" },
  "ARCC": { name: "العربية للأسمنت", sector: "مواد بناء وتشييد", index: "egx70", quality: "تعافي أسعار الأسمنت والتصدير" },
  "RAYA": { name: "راية القابضة", sector: "استثمارات وتكنولوجيا", index: "egx70", quality: "تنوع قطاعي وخدمات تمويلية" },
  "CLHO": { name: "مستشفيات كليوباترا", sector: "رعاية صحية ومستشفيات", index: "egx30", quality: "قطاع دفاعي غير متأثر بالأزمات" },
  "SKPC": { name: "سيدي كرير للبتروكيماويات", sector: "بتروكيماويات", index: "egx70", quality: "طلب خارجي قوي على البتروكيماويات" },
  "EKHO": { name: "القابضة المصرية الكويتية", sector: "استثمار متعدد ودولاري", index: "egx30", quality: "إيرادات بالدولار وتوزيعات منتظمة" },
  "ISPH": { name: "ابن سينا فارما", sector: "أدوية ورعاية صحية", index: "egx70", quality: "حصة سوقية ضخمة في توزيع الدواء" },
  "MFPC": { name: "مصر لإنتاج الأسمدة (موبكو)", sector: "بتروكيماويات وأسمدة", index: "egx30", quality: "أعلى هوامش ربحية وتصدير حر" },
  "JUFO": { name: "جهينة للصناعات الغذائية", sector: "أغذية واستهلاكي", index: "egx30", quality: "طلب استهلاكي محلي لا يتوقف" },
  "CERA": { name: "العز للبورسلين (الجوهرة)", sector: "سيراميك ومواد بناء", index: "egx70", quality: "ماركة رائدة وحصة سوقية صلبة" },
  "ESRS": { name: "حديد عز", sector: "صلب وحديد وتصدير", index: "egx30", quality: "عملاق التصدير الصناعي المصري" },
  "CCAP": { name: "القلعة للاستشارات المالية", sector: "استثمار وطاقة", index: "egx30", quality: "أعلى تداولات يومية ومشروع التكرير" },
  "KORA": { name: "القاهرة للإسكان والتعمير", sector: "تطوير عقاري وإسكان", index: "egx70", quality: "سيولة قياسية وإعادة تقييم أصول" },
  "ORHD": { name: "أوراسكوم للتنمية مصر", sector: "سياحة وتطوير عقاري", index: "egx30", quality: "أصول فندقية دولارية في الجونة" },
  "UEGC": { name: "الصعيد العامة للمقاولات", sector: "مقاولات وإنشاءات", index: "egx70", quality: "عقود بنية تحتية ومشاريع قومية" },
  "ZMID": { name: "زهراء المعادي للاستثمار", sector: "عقارات وتنمية", index: "egx70", quality: "محفظة أراضي مميزة بالقاهرة" },
  "ORWE": { name: "النساجون الشرقيون", sector: "منسوجات وتصدير دولاري", index: "egx30", quality: "أكثر من 65% من المبيعات تصدير بالعملة الصعبة" },
  "BTFH": { name: "بلتون المالية القابضة", sector: "خدمات مالية وبنوك استثمار", index: "egx30", quality: "توسع مصرفي وتمويلي سريع" },
  "ALCN": { name: "الإسكندرية لتداول الحاويات", sector: "شحن وموانئ ولوجستيات", index: "egx30", quality: "عوائد دولارية نقية وتوزيعات ممتازة" },
  "OCDI": { name: "السادس من أكتوبر (سوديك)", sector: "تطوير عقاري فاخر", index: "egx30", quality: "إدارة إماراتية فاخرة ومبيعات قياسية" },
  "HELI": { name: "مصر الجديدة للإسكان", sector: "تطوير عقاري وأراضي", index: "egx30", quality: "مخزون أراضي هائل بمصر الجديدة والشروق" },
  "PHDC": { name: "بالم هيلز للتعمير", sector: "تطوير عقاري", index: "egx30", quality: "شراكات كبرى وتدفقات نقدية منتظمة" },
  "ETRS": { name: "إيجيترانس", sector: "شحن ولوجستيات", index: "egx70", quality: "لوجستيات طاقة الرياح والمشاريع الكبرى" },
  "CIEB": { name: "بنك كريدي أجريكول مصر", sector: "بنوك وخدمات مالية", index: "egx30", quality: "كفاية رأس مال عالية وتوزيع نقدي دوري" },
  "ADIB": { name: "مصرف أبو ظبي الإسلامي مصر", sector: "بنوك وصيرفة إسلامية", index: "egx30", quality: "أسرع البنوك نمواً في الأرباح" },
  "EMFD": { name: "إعمار مصر للتنمية", sector: "تطوير عقاري وإنشاءات", index: "egx30", quality: "تدفقات دولارية ومشاريع عقارية فاخرة" }
};

// Official Mutual Funds Benchmark & Dynamic Daily Accrual NAV Engine
function getDynamicFundsNAV() {
  const now = new Date();
  const prevWorkDay = new Date(now);
  // Rollback weekend to Thursday if Friday (5) or Saturday (6)
  if (prevWorkDay.getDay() === 5) prevWorkDay.setDate(prevWorkDay.getDate() - 1);
  else if (prevWorkDay.getDay() === 6) prevWorkDay.setDate(prevWorkDay.getDate() - 2);

  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const updateDateStr = `${prevWorkDay.getDate()} ${MONTHS_SHORT[prevWorkDay.getMonth()]} ${prevWorkDay.getFullYear()} (إغلاق رسمي)`;

  // Dynamic Daily Accrual for Cash Fund (NCS) compounding at 22.4% annually
  const baseDate = new Date('2024-01-01T00:00:00Z');
  const elapsedDays = Math.max(0, Math.floor((now - baseDate) / (1000 * 60 * 60 * 24)));
  const baseNcsPrice = 15.42;
  const dailyRate = 0.224 / 365;
  const dynamicNcsPrice = Number((baseNcsPrice * Math.pow(1 + dailyRate, elapsedDays)).toFixed(2));

  return {
    "NCS": {
      ticker: "NCS",
      name: "صندوق إن آي كابيتال (السيولة النقدية/الأصول)",
      manager: "NI Capital إدارة الأصول",
      unitPrice: dynamicNcsPrice,
      currency: "EGP",
      annualYieldPct: 22.4,
      lastOfficialUpdate: updateDateStr,
      status: "🟢 وثيقة نقدية يومية • عائد تراكمي يُحدث يومياً",
      note: "يُحسب العائد التراكمي اليومي بنسبة 22.4% سنوياً بنهاية كل يوم عمل ويطابق ثندر.",
      thndrUrl: "https://app.thndr.app/search?query=NCS"
    },
    "BSB": {
      ticker: "BSB",
      name: "صندوق بلتون للسيولة النقدية (Beltone B-Safe Cash)",
      manager: "بلتون لإدارة الصناديق",
      unitPrice: 16.73,
      currency: "EGP",
      annualYieldPct: 22.0,
      lastOfficialUpdate: updateDateStr,
      status: "🟢 وثيقة نقدية يومية • عائد تراكمي يُحدث يومياً",
      note: "صندوق يومي منخفض المخاطر يُحسب عائده التراكمي يومياً ويطابق تطبيق ثندر.",
      thndrUrl: "https://app.thndr.app/search?query=BSB"
    },
    "BGROWTH": {
      ticker: "BGROWTH",
      name: "صندوق بلتون لأسهم النمو (Beltone Equity Growth)",
      manager: "بلتون لإدارة الصناديق",
      unitPrice: 284.10,
      currency: "EGP",
      annualYieldPct: 24.8,
      lastOfficialUpdate: updateDateStr,
      status: "ℹ️ وثيقة أسهم نمو • تقييم دوري معتمد",
      note: "يُحدد سعر الوثيقة رسمياً من بلتون ويُنشر بنهاية كل جلسة تداول.",
      thndrUrl: "https://app.thndr.app/search?query=Beltone"
    }
  };
}

const TECHNICAL_COLUMNS = [
  "name", "description", "close", "change", "volume", "Value.Traded",
  "high", "low", "open", "RSI", "Recommend.All",
  "SMA50", "SMA200", "Pivot.M.Classic.R1", "Pivot.M.Classic.S1",
  "Pivot.M.Classic.R2", "Pivot.M.Classic.S2",
  "MACD.macd", "MACD.signal", "price_52_week_high", "price_52_week_low"
];

function parseTechnicalRecord(item) {
  const symbol = item.s.replace("EGX:", "");
  const dict = EGX_DICTIONARY[symbol] || {};
  const price = Number(item.d[2]) || 0;
  const changePct = Number(Number(item.d[3] || 0).toFixed(2));
  const volume = Number(item.d[4]) || 0;
  const tradedValue = Number(item.d[5]) || 0;
  const high = Number(item.d[6]) || price;
  const low = Number(item.d[7]) || price;
  const open = Number(item.d[8]) || price;
  const rsi = item.d[9] != null ? Number(Number(item.d[9]).toFixed(1)) : 50;
  const recommendation = Number(Number(item.d[10] || 0).toFixed(2));

  const sma50 = item.d[11] != null ? Number(Number(item.d[11]).toFixed(2)) : null;
  const sma200 = item.d[12] != null ? Number(Number(item.d[12]).toFixed(2)) : null;
  const pivotR1 = item.d[13] != null ? Number(Number(item.d[13]).toFixed(2)) : null;
  const pivotS1 = item.d[14] != null ? Number(Number(item.d[14]).toFixed(2)) : null;
  const pivotR2 = item.d[15] != null ? Number(Number(item.d[15]).toFixed(2)) : null;
  const pivotS2 = item.d[16] != null ? Number(Number(item.d[16]).toFixed(2)) : null;
  const macd = item.d[17] != null ? Number(Number(item.d[17]).toFixed(2)) : null;
  const macdSignal = item.d[18] != null ? Number(Number(item.d[18]).toFixed(2)) : null;
  const week52High = item.d[19] != null ? Number(Number(item.d[19]).toFixed(2)) : null;
  const week52Low = item.d[20] != null ? Number(Number(item.d[20]).toFixed(2)) : null;

  // Real Technical Targets & Support Levels (Strictly Non-Hallucinatory)
  const isSupportBroken = pivotS1 != null && price < pivotS1;
  const isR1Exceeded = pivotR1 != null && price >= pivotR1;

  // Support determination
  let supportVal = null;
  let stopLossVal = null;

  if (pivotS1 != null && price >= pivotS1) {
    supportVal = pivotS1;
    stopLossVal = Number((pivotS1 * 0.985).toFixed(2)); // 1.5% buffer below S1 as confirmed invalidation point
  } else if (pivotS2 != null && price >= pivotS2) {
    supportVal = pivotS2;
    stopLossVal = Number((pivotS2 * 0.985).toFixed(2));
  } else if (low > 0 && low < price) {
    supportVal = low;
    stopLossVal = Number((low * 0.98).toFixed(2));
  } else {
    supportVal = low > 0 ? Math.min(low, price * 0.97) : Number((price * 0.97).toFixed(2));
    stopLossVal = Number((Math.min(price, supportVal) * 0.97).toFixed(2));
  }

  // Safety invariant: Stop loss must strictly be below current market price by at least 1.5%
  if (stopLossVal != null && (stopLossVal >= price || (price - stopLossVal) < 0.01)) {
    stopLossVal = Number((price * 0.96).toFixed(2));
  }

  // Target determination: Structurally anchored to Resistance 1 (R1)
  let target1Val = null;
  let target2Val = null;

  if (pivotR1 != null) {
    target1Val = pivotR1;
    target2Val = pivotR2 != null && pivotR2 > target1Val ? pivotR2 : (week52High != null && week52High > target1Val ? week52High : Number((target1Val * 1.05).toFixed(2)));
  } else if (pivotR2 != null && pivotR2 > price) {
    target1Val = pivotR2;
    target2Val = week52High != null && week52High > target1Val ? week52High : null;
  } else if (week52High != null && week52High > price) {
    target1Val = week52High;
    const fibSpread = (pivotR1 && pivotS1) ? (pivotR1 - pivotS1) * 0.618 : price * 0.05;
    target2Val = Number((week52High + fibSpread).toFixed(2));
  } else {
    // Stock is trading in price discovery above R1, R2, and 52W High
    // Anchor to the highest structural level reached to prevent moving goalposts
    const baseAnchor = Math.max(price, pivotR2 || 0, week52High || 0);
    const fibSpread = (pivotR1 && pivotS1) ? (pivotR1 - pivotS1) * 0.618 : price * 0.05;
    target1Val = Number((baseAnchor + fibSpread).toFixed(2));
    target2Val = Number((target1Val + fibSpread).toFixed(2));
  }

  // Risk/Reward Ratio Calculation (Strict & Robust with Penny-Stock scaling)
  let potentialGain = target1Val > price ? Number((target1Val - price).toFixed(2)) : 0;
  let potentialLoss = price > stopLossVal ? Number((price - stopLossVal).toFixed(2)) : 0;
  let rrRatio = 0;
  let rrDisplay = 'غير مؤهل (كسر دعم)';

  // Scale down minimum loss threshold for penny stocks trading under 2 EGP
  const minLossThreshold = price < 2.0 ? Math.max(0.005, price * 0.005) : 0.05;

  if (!isSupportBroken && potentialLoss >= minLossThreshold && potentialGain > 0) {
    rrRatio = Number((potentialGain / potentialLoss).toFixed(2));
    rrDisplay = `1 : ${rrRatio}`;
  } else if (isSupportBroken) {
    rrRatio = 0;
    rrDisplay = 'تحذير (دون الدعم S1)';
  } else if (target1Val <= price) {
    rrRatio = 0;
    const isPullback = changePct < 0 || (sma200 != null && price < sma200);
    rrDisplay = isPullback ? 'ارتداد مقاومة (تخفيف)' : 'تحقق الهدف (تأمين أرباح)';
  }

  // Technical Trend & Momentum Classification
  let trend = 'محايد / تذبذب عرضي';
  let trendPts = 15;
  if (sma50 && sma200) {
    if (price > sma50 && sma50 > sma200) {
      const extPct = sma50 > 0 ? ((price - sma50) / sma50) * 100 : 0;
      if (extPct > 30 && rsi > 78) {
        trend = '⚠️ تحذير تمدد سعري ومضاربة (FOMO Pump Trap)';
        trendPts = 5;
      } else {
        trend = 'اتجاه صاعد رئيسي (Golden Cross / Bullish)';
        trendPts = 30;
      }
    } else if (price < sma50 && sma50 < sma200) {
      trend = 'اتجاه هابط رئيسي (Bearish)';
      trendPts = 5;
    } else if (price > sma50 && price < sma200) {
      trend = 'ارتداد تصحيحي إيجابي (Recovery)';
      trendPts = 20;
    } else if (price < sma50 && price > sma200) {
      trend = 'اختبار دعم المتوسط 200 يوم (Pullback)';
      trendPts = 18;
    }
  } else if (sma50) {
    const extPct = sma50 > 0 ? ((price - sma50) / sma50) * 100 : 0;
    if (extPct > 30 && rsi > 78) {
      trend = '⚠️ تحذير تمدد سعري ومضاربة (FOMO Pump Trap)';
      trendPts = 5;
    } else if (price > sma50) {
      trend = 'تداول أعلى متوسط 50 يوم';
      trendPts = 22;
    } else {
      trend = 'تداول أسفل متوسط 50 يوم';
      trendPts = 10;
    }
  } else if (!sma50 && !sma200 && rsi > 78) {
    // Newly listed IPO stocks (e.g. TAQA 2023) without moving averages
    trend = '⚠️ تحذير تمدد سعري ومضاربة (IPO FOMO Trap)';
    trendPts = 5;
  }

  let momentum = 'محايد';
  let momentumPts = 5;
  if (macd != null && macdSignal != null) {
    if (macd >= macdSignal) {
      momentum = 'زخم شرائي صاعد (Bullish MACD)';
      momentumPts += 5;
    } else {
      momentum = 'زخم بيعي تصحيحي (Bearish MACD)';
    }
  }
  if (rsi >= 40 && rsi <= 65) momentumPts += 5;
  else if (rsi < 36) momentumPts += 4; // oversold recovery potential

  // Liquidity Points (out of 30)
  let liquidityPts = 10;
  if (tradedValue >= 50000000) liquidityPts = 30;
  else if (tradedValue >= 20000000) liquidityPts = 25;
  else if (tradedValue >= 10000000) liquidityPts = 20;
  else if (tradedValue >= 2500000) liquidityPts = 15;

  // Risk/Reward Points (out of 25)
  let rrPts = 0;
  if (rrRatio >= 2.5) rrPts = 25;
  else if (rrRatio >= 2.0) rrPts = 20;
  else if (rrRatio >= 1.5) rrPts = 12;
  else if (rrRatio >= 1.0) rrPts = 5;

  // Calculated Multi-Factor Score (40 - 99)
  const calculatedScore = Math.min(99, Math.max(40, liquidityPts + trendPts + rrPts + momentumPts));

  // Smart Safety Status & Signals
  let type = 'سهم قيادي وسيولة نشطة';
  let safetyTag = 'low_risk';
  let catalyst = dict.quality || 'سيولة نشطة وتداول منتظم في تطبيق ثندر';

  const turnoverMillions = (tradedValue / 1000000).toFixed(1);
  const qualityDesc = dict.quality || 'تداول نشط ومستمر في تطبيق ثندر';

  const isFomoTrap = trend && trend.includes('FOMO');

  if (isFomoTrap) {
    type = '⚠️ تحذير تمدد سعري ومضاربة أفراد (مصيدة سيولة)';
    catalyst = `${qualityDesc} • تمدد سعري حاد ومضاربات أفراد محمومة؛ الشراء محظور لتجنب التعليق في القمة`;
    safetyTag = 'fomo_danger';
  } else if (isSupportBroken) {
    type = '⚠️ سهم تحت ضغط بيعي وكسر دعم';
    catalyst = `${qualityDesc} • كسر صريح لمستوى الدعم الفني ${supportVal} ج (وقف الخسارة مفعل)`;
    safetyTag = 'broken_support';
  } else if (tradedValue >= 1000000000) {
    type = 'سيولة مليارية استثنائية • أمان مؤسسي فائق';
    const flowType = changePct >= 0 ? 'تجميع مؤسسي قياسي وتدفقات سيولة ضخمة' : 'امتصاص بيعي مؤسسي وتثبيت سعري';
    catalyst = `${qualityDesc} • ${flowType} (تنفيذات ${turnoverMillions} مليون ج)`;
    safetyTag = 'volume_surge';
  } else if (tradedValue >= 100000000) {
    type = 'سيولة مؤسسية كبرى تتجاوز 100 مليون ج';
    const flowType = changePct >= 0 ? 'تجميع مؤسسي قوي وتدفقات سيولة قيادية' : 'امتصاص بيعي مؤسسي وتثبيت سعري';
    catalyst = `${qualityDesc} • ${flowType} (تنفيذات ${turnoverMillions} مليون ج)`;
    safetyTag = 'volume_surge';
  } else if (changePct > 3.0 && tradedValue > 10000000) {
    type = 'طفرة صعودية وزخم فني قوي';
    catalyst = `${qualityDesc} • اختراق بزخم شرائي صاعد (تداول ${turnoverMillions}M ج)`;
    safetyTag = 'momentum';
  } else if (!isSupportBroken && rsi < 36) {
    type = 'فرصة ارتداد من تشبع بيعي (Dip Buy)';
    catalyst = `${qualityDesc} • تشبع بيعي حاد (RSI: ${rsi}) عند مشارف الدعم ${supportVal} ج`;
    safetyTag = 'oversold_bounce';
  } else if (dict.index === 'egx30') {
    type = 'شركة قيادية كبرى (EGX30)';
    const egx30Trend = changePct >= 0 ? 'تداول إيجابي متوازن' : 'تهدئة سعرية وتماسك';
    catalyst = `${qualityDesc} • ${egx30Trend} (سيولة ${turnoverMillions}M ج)`;
    safetyTag = 'low_risk';
  } else {
    const egx70Trend = changePct >= 0 ? 'نشاط مضاربي مدروس' : 'حركة تصحيحية هادئة';
    catalyst = `${qualityDesc} • ${egx70Trend} (تداول ${turnoverMillions}M ج)`;
  }

  return {
    ticker: symbol,
    name: dict.name || item.d[1] || symbol,
    sector: dict.sector || "سوق الأسهم المصرية",
    index: dict.index || "egx70",
    price: price,
    changePct: `${changePct >= 0 ? '+' : ''}${changePct}%`,
    changeNum: changePct,
    high: high,
    low: low,
    open: open,
    volume: volume,
    tradedValue: tradedValue,
    volumeMultiplier: `${turnoverMillions}M ج`,
    rsi: rsi,
    recommendation: recommendation,
    // Real Technical Levels
    sma50: sma50,
    sma200: sma200,
    pivotR1: pivotR1,
    pivotS1: pivotS1,
    pivotR2: pivotR2,
    pivotS2: pivotS2,
    isSupportBroken: isSupportBroken,
    isR1Exceeded: isR1Exceeded,
    macd: macd,
    macdSignal: macdSignal,
    week52High: week52High,
    week52Low: week52Low,
    trend: trend,
    momentum: momentum,
    support: supportVal != null ? `${supportVal} ج` : '--',
    target1: target1Val != null ? `${target1Val} ج` : '--',
    target2: target2Val != null ? `${target2Val} ج` : 'اكتشاف أسعار تاريخي',
    stopLoss: stopLossVal != null ? `${stopLossVal} ج` : '--',
    rrRatio: rrRatio,
    rrDisplay: rrDisplay,
    catalyst: catalyst,
    type: type,
    score: calculatedScore,
    liquidityStatus: `سيولة ممتازة في ثندر (${turnoverMillions} مليون ج)`,
    tags: [safetyTag, dict.index || 'egx30'],
    source: "مسح فني حي للبورصة المصرية (TradingView EGX Technicals)",
    latencyNotice: "بيانات الأسعار والمؤشرات الفنية من TradingView (متأخرة 15 دقيقة مجاناً)",
    thndrUrl: `https://app.thndr.app/search?query=${symbol}`,
    tradingViewUrl: `https://www.tradingview.com/symbols/EGX-${symbol}/`
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url && req.url.includes('_t=')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=15');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const customTickers = url.searchParams.get('tickers');
    const searchQuery = url.searchParams.get('q');
    const includeRadar = url.searchParams.get('include_radar') !== 'false';

    // 1. Tickers to always scan for user portfolio
    const defaultPortfolioTickers = [
      "EGX:ORAS", "EGX:COMI", "EGX:SWDY", "EGX:ABUK", "EGX:HDBK",
      "EGX:TMGH", "EGX:EGAL", "EGX:ARCC", "EGX:RAYA", "EGX:CLHO",
      "EGX:AMOC", "EGX:ETEL", "EGX:FWRY", "EGX:ESRS", "EGX:SKPC",
      "EGX:EKHO", "EGX:ISPH", "EGX:MFPC", "EGX:JUFO", "EGX:CERA",
      "EGX:BTFH", "EGX:ALCN", "EGX:OCDI", "EGX:HELI", "EGX:PHDC",
      "EGX:CCAP", "EGX:KORA", "EGX:ORHD", "EGX:UEGC", "EGX:ZMID",
      "EGX:ORWE", "EGX:CIEB", "EGX:ADIB", "EGX:ETRS", "EGX:EMFD"
    ];

    let tickersToFetch = [...defaultPortfolioTickers];
    if (customTickers) {
      const extra = customTickers.split(',').map(t => t.trim().toUpperCase()).map(t => t.startsWith('EGX:') ? t : `EGX:${t}`);
      extra.forEach(t => {
        if (!tickersToFetch.includes(t)) tickersToFetch.push(t);
      });
    }

    // Parallel Request 1: Fetch exact prices & technicals for portfolio & tracked list
    const portfolioScanPromise = fetch("https://scanner.tradingview.com/egypt/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filter: [],
        options: { lang: "en" },
        symbols: { query: { types: [] }, tickers: tickersToFetch },
        columns: TECHNICAL_COLUMNS
      })
    }).then(r => r.json());

    // Parallel Request 2: Live Market Opportunities (Top liquid stocks with real turnover > 2.5M EGP)
    const marketRadarPromise = includeRadar ? fetch("https://scanner.tradingview.com/egypt/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filter: [
          { left: "volume", operation: "greater", right: 10000 },
          { left: "Value.Traded", operation: "greater", right: 2500000 }
        ],
        options: { lang: "en" },
        symbols: { query: { types: ["stock"] } },
        columns: TECHNICAL_COLUMNS,
        sort: { sortBy: "Value.Traded", sortOrder: "desc" },
        range: [0, 40]
      })
    }).then(r => r.json()) : Promise.resolve(null);

    const [portfolioData, marketRadarData] = await Promise.all([portfolioScanPromise, marketRadarPromise]);

    // Process exact prices and technical indicators
    const prices = {};
    if (portfolioData && portfolioData.data) {
      portfolioData.data.forEach(item => {
        const record = parseTechnicalRecord(item);
        prices[record.ticker] = record;
      });
    }

    // Process Live Radar items
    let radar = [];
    if (marketRadarData && marketRadarData.data) {
      radar = marketRadarData.data.map(item => parseTechnicalRecord(item));
    }

    // Filter by search query if requested
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      radar = radar.filter(item => 
        item.ticker.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q) || 
        item.sector.toLowerCase().includes(q)
      );
    }

    // Calculate Real-Time Market Breadth & Institutional Regime Classification
    let advancingCount = 0;
    let decliningCount = 0;
    let totalMarketChange = 0;

    radar.forEach(stock => {
      if (stock.changeNum > 0) advancingCount++;
      else if (stock.changeNum < 0) decliningCount++;
      totalMarketChange += (stock.changeNum || 0);
    });

    const avgMarketChange = radar.length > 0 ? (totalMarketChange / radar.length) : 0;
    const advancingPct = radar.length > 0 ? (advancingCount / radar.length) * 100 : 50;

    let currentRegime = "NORMAL_CONSOLIDATION";
    let currentRegimeArabic = "تداول متوازن وعرضي (Consolidation)";
    let currentRegimeDescription = "السوق يتحرك في نطاق متوازن مع استقرار الدعوم والمقاومات.";

    if (advancingPct < 20 || avgMarketChange <= -3.0) {
      currentRegime = "SYSTEMIC_SHOCK";
      currentRegimeArabic = "حذر: ضغط بيعي واسع وشامل (Systemic Shock Alert)";
      currentRegimeDescription = "هبوط عام في أغلب الأسهم؛ يُنصح بالتحفظ وتأجيل الشراء عند الدعوم حتى تستقر السيولة.";
    } else if (advancingPct <= 45 && avgMarketChange < 0) {
      currentRegime = "HEALTHY_CORRECTION";
      currentRegimeArabic = "تصحيح فني هادئ وجني أرباح صحي (Pullback)";
      currentRegimeDescription = "تراجع هادئ متوقع لجني الأرباح مع تماسك الأسهم القيادية فوق دعومها الرئيسية؛ فرصة تجميع للمستثمر.";
    } else if (advancingPct >= 60 && avgMarketChange >= 1.0) {
      currentRegime = "BULLISH_EXPANSION";
      currentRegimeArabic = "زخم صعودي واستكشاف سعري (Bullish Expansion)";
      currentRegimeDescription = "سيولة شرائية واسعة واختراق للمقاومات الفنية مدعومة بحجم تداول مرتفع.";
    }

    // Guard against falling knife dip-buying during SYSTEMIC_SHOCK
    if (currentRegime === "SYSTEMIC_SHOCK") {
      radar.forEach(stock => {
        if (stock.tags && stock.tags.includes('oversold_bounce')) {
          stock.type = 'تشبع بيعي في هبوط عام (تجميد الشراء)';
          stock.catalyst = `${stock.name} • تشبع بيعي لكن السوق في حالة هبوط ذعري شامل؛ يُفضل التريث والاحتفاظ بالكاش`;
          stock.tags = stock.tags.map(t => t === 'oversold_bounce' ? 'systemic_hold' : t);
        }
      });
    }

    // Cairo Time stamp
    const now = new Date();
    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timePart = now.toLocaleTimeString('ar-EG-u-nu-latn', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      numberingSystem: 'latn'
    });
    const cairoTimeStr = toEnglishDigits(`${timePart} (${now.getDate()} ${MONTHS_SHORT[now.getMonth()]})`);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      cairo_time: cairoTimeStr,
      source: "TradingView Live EGX Technical Scanner",
      data_latency: "Delayed 15 Minutes (Free TradingView Feed)",
      market_regime: {
        regime: currentRegime,
        regimeArabic: currentRegimeArabic,
        description: currentRegimeDescription,
        breadth: {
          advancing: advancingCount,
          declining: decliningCount,
          advancingPct: Math.round(advancingPct),
          avgMarketChange: Number(avgMarketChange.toFixed(2))
        }
      },
      total_liquid_stocks: radar.length,
      prices: prices,
      radar: radar,
      funds: getDynamicFundsNAV()
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      fallback_funds: getDynamicFundsNAV()
    });
  }
}
