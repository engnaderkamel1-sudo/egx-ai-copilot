/**
 * EGX AI Copilot - Core Financial Engine (js/engine.js)
 * Pure, deterministic mathematical and financial decision engine.
 * Single Source of Truth for all financial evaluations across the application.
 */

(function (global) {
  'use strict';

  const EGX_Engine = {
    version: '2.0.0-clean-modular',

    /**
     * Calculate Classic Pivot Points & Fibonacci Extensions
     */
    calculatePivots: function (high, low, close) {
      high = Number(high);
      low = Number(low);
      close = Number(close);

      if (isNaN(high) || isNaN(low) || isNaN(close) || high <= 0 || low <= 0 || close <= 0) {
        return null;
      }

      const pp = Number(((high + low + close) / 3).toFixed(2));
      const r1 = Number(((2 * pp) - low).toFixed(2));
      const s1 = Number(Math.max(0.01, (2 * pp) - high).toFixed(2));
      const r2 = Number((pp + (high - low)).toFixed(2));
      const s2 = Number(Math.max(0.01, pp - (high - low)).toFixed(2));

      // Fibonacci extensions for breakout mode (R2 breached)
      const spread = high - low;
      const fib127 = Number((pp + spread * 1.272).toFixed(2));
      const fib161 = Number((pp + spread * 1.618).toFixed(2));

      return {
        pp,
        r1,
        s1,
        r2,
        s2,
        fib127,
        fib161
      };
    },

    /**
     * Calculate Risk/Reward Ratio with complete protection against division by zero
     * and inverted entries (close >= r1 or close <= stopLoss).
     */
    calculateRiskReward: function (close, target1, stopLoss, isSupportBroken) {
      close = Number(close);
      target1 = Number(target1);
      stopLoss = Number(stopLoss);

      if (isNaN(close) || close <= 0) {
        return {
          rrRatio: 0,
          rrDisplay: '--',
          rewardPct: 0,
          riskPct: 0,
          isEligible: false,
          verdict: 'بيانات غير مكتملة',
          verdictType: 'MUTED'
        };
      }

      // 1. Broken Support condition
      if (isSupportBroken || (stopLoss > 0 && close < stopLoss)) {
        const riskPct = stopLoss > 0 ? Number((((close - stopLoss) / close) * 100).toFixed(1)) : 0;
        return {
          rrRatio: 0,
          rrDisplay: 'تحذير (كسر الدعم)',
          rewardPct: 0,
          riskPct,
          isEligible: false,
          verdict: 'كسر حد الأمان: السهم يتداول دون مستوى الدعم ووقف الخسارة، الشراء ممنوع.',
          verdictType: 'DANGER'
        };
      }

      // 2. Target Already Reached or Exceeded condition
      if (target1 > 0 && close >= target1) {
        const riskPct = stopLoss > 0 ? Number((((close - stopLoss) / close) * 100).toFixed(1)) : 0;
        return {
          rrRatio: 0,
          rrDisplay: 'تم الوصول للهدف',
          rewardPct: 0,
          riskPct,
          isEligible: false,
          verdict: 'تم الوصول لمستوى المقاومة والهدف الفني الأول. لا يُنصح بالدخول الآن لتجنب جني الأرباح التصحيحي.',
          verdictType: 'WARNING'
        };
      }

      // 3. Normal Calculation Mode
      const potentialGain = target1 > close ? (target1 - close) : 0;
      const potentialLoss = (stopLoss > 0 && close > stopLoss) ? (close - stopLoss) : (close * 0.03);

      const safeLoss = Math.max(potentialLoss, 0.05);
      const rrRatio = Number((potentialGain / safeLoss).toFixed(2));
      const rewardPct = Number(((potentialGain / close) * 100).toFixed(1));
      const riskPct = Number(((safeLoss / close) * 100).toFixed(1));

      let isEligible = rrRatio >= 1.8;
      let rrDisplay = `1 : ${rrRatio}`;
      let verdict = isEligible
        ? `فرصة ممتازة: العائد المتوقع (+${rewardPct}%) يبرر المخاطرة (-${riskPct}%) بأكثر من الضعف.`
        : `عائد غير متكافئ: العائد (+${rewardPct}%) أقل من ضعف المخاطرة (-${riskPct}%). انتظر نقطة دخول أفضل قرب الدعم.`;
      let verdictType = isEligible ? 'SUCCESS' : 'WARNING';

      return {
        rrRatio,
        rrDisplay,
        rewardPct,
        riskPct,
        isEligible,
        verdict,
        verdictType
      };
    },

    /**
     * Calculate Position Sizing based on Capital and Max Risk % (e.g. 1.5% rule)
     * Strictly enforces integer shares and prevents stopLoss >= entryPrice exploit.
     */
    calculatePositionSize: function (totalCapital, riskPct, entryPrice, stopLoss) {
      totalCapital = Number(totalCapital) || 0;
      riskPct = Number(riskPct) || 1.5;
      entryPrice = Number(entryPrice) || 0;
      stopLoss = Number(stopLoss) || 0;

      if (totalCapital <= 0 || entryPrice <= 0 || stopLoss <= 0) {
        return {
          isValid: false,
          error: 'يرجى إدخال قيم موجبة لرأس المال وسعر الدخول وسعر وقف الخسارة.',
          maxShares: 0,
          totalInvestment: 0,
          portfolioWeightPct: 0,
          maxRiskEgp: 0,
          riskPerShare: 0
        };
      }

      if (stopLoss >= entryPrice) {
        return {
          isValid: false,
          error: 'خطأ مالي: سعر وقف الخسارة يجب أن يكون أدنى من سعر الدخول لحماية المركز.',
          maxShares: 0,
          totalInvestment: 0,
          portfolioWeightPct: 0,
          maxRiskEgp: 0,
          riskPerShare: 0
        };
      }

      const maxRiskEgp = Math.round(totalCapital * (riskPct / 100));
      // Impose a minimum risk buffer (1.5% of entry price) to prevent runaway leverage on tight stops
      const minRiskPerShare = Math.max(0.01, entryPrice * 0.015);
      const effectiveRiskPerShare = Math.max(minRiskPerShare, Number((entryPrice - stopLoss).toFixed(2)));

      // 1. Cap by Risk
      const sharesByRisk = Math.floor(maxRiskEgp / effectiveRiskPerShare);

      // 2. Cap by Total Capital (Spot execution constraint: no unauthorized margin)
      const sharesByCapital = Math.floor(totalCapital / entryPrice);

      // Strictly integer shares capped by risk AND capital
      const maxShares = Math.max(0, Math.min(sharesByRisk, sharesByCapital));
      const totalInvestment = Math.round(maxShares * entryPrice);
      const portfolioWeightPct = totalCapital > 0 ? Number(((totalInvestment / totalCapital) * 100).toFixed(1)) : 0;

      return {
        isValid: true,
        error: null,
        maxShares,
        totalInvestment,
        portfolioWeightPct,
        maxRiskEgp,
        riskPerShare
      };
    },

    /**
     * Single Source of Truth for Asset Evaluation
     * Enforces the iron rule: A losing stock NEVER gets "جني أرباح" or "منطقة قمة".
     */
    evaluateAsset: function (asset, marketRegime) {
      if (!asset) return null;

      // Safe numeric cleaner for Egyptian piastre / currency strings (e.g. "83.20 ج")
      const cleanNum = (val) => {
        if (val == null) return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        const cleaned = String(val).replace(/[^\d.-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
      };

      // Dedicated Neutral Cash Handler (Never evaluate cash as a stock)
      if (asset.ticker === 'CASH' || asset.isCash || asset.isCashReserve) {
        const cashVal = cleanNum(asset.value) || 0;
        return {
          ticker: 'CASH',
          name: asset.name || 'المحفظة (الرصيد النقدي)',
          shares: 0,
          buyPrice: 0,
          currentPrice: 0,
          totalCost: 0,
          currentValue: cashVal,
          profit: 0,
          returnPct: 0,
          isLosing: false,
          status: 'سيولة حرة',
          action: 'HOLD',
          alertLevel: 'NORMAL',
          badgeText: 'احتياطي كاش',
          badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
          advice: 'سيولة نقدية جاهزة للاقتناص وحماية المحفظة.'
        };
      }

      const shares = parseInt(asset.shares, 10) || 0;
      const buyPrice = cleanNum(asset.buyPrice) || 0;
      const currentPrice = cleanNum(asset.currentPrice) || buyPrice;
      const pivotR1 = cleanNum(asset.pivotR1 || asset.target1);
      const pivotS1 = cleanNum(asset.pivotS1 || asset.support);
      const sma50 = cleanNum(asset.sma50);
      const rsi = cleanNum(asset.rsi) || 50;

      const totalCost = Math.round(shares * buyPrice);
      const currentValue = Math.round(shares * currentPrice);
      const profit = currentValue - totalCost;
      const returnPct = totalCost > 0 ? Number(((profit / totalCost) * 100).toFixed(2)) : 0;
      const isLosing = profit < 0 || returnPct < 0;

      let action = 'HOLD';
      let badgeText = 'احتفاظ';
      let badgeColor = 'bg-gray-800 text-gray-300 border border-gray-700';
      let advice = 'احتفاظ هادئ ومتابعة حركة السعر داخل النطاق الطبيعي.';
      let alertLevel = 'NORMAL';

      // 1. Losing Position Branch (Strict Sanitization: No profit-taking allowed)
      if (isLosing) {
        if (pivotS1 && currentPrice < pivotS1) {
          action = 'STOP_LOSS_WARNING';
          alertLevel = 'CRITICAL_RISK';
          badgeText = '⚠️ كسر دعم / حماية رأس المال';
          badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
          advice = `السعر الحالي (${currentPrice.toFixed(2)} ج) كسر مستوى الدعم S1 (${pivotS1.toFixed(2)} ج) مع تراجع (${returnPct.toFixed(1)}%). راقب خطة الحماية والتدوير لتفادي زيادة الخسارة.`;
        } else if (pivotR1 && currentPrice >= pivotR1) {
          action = 'REBALANCE_CANDIDATE';
          alertLevel = 'REBOUND_RESISTANCE';
          badgeText = '🔄 تدوير وتخفيف (ارتداد هابط)';
          badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          advice = `ارتداد فني لمستوى المقاومة R1 (${pivotR1.toFixed(2)} ج) لسهم متراجع (${returnPct.toFixed(1)}%). فرصة ممتازة لتخفيف المركز وتدوير السيولة في أصل أسرع نمواً.`;
        } else if (marketRegime === 'SYSTEMIC_SHOCK') {
          // Guardrail: Freeze accumulation during market-wide crashes
          action = 'DEFENSIVE_HOLD';
          alertLevel = 'CRITICAL_RISK';
          badgeText = 'حذر / صدمة سوقية';
          badgeColor = 'bg-rose-950/40 text-rose-300 border border-rose-800/40';
          advice = `السوق يمر بمرحلة صدمة سوقية (Systemic Shock Alert). يُحظر تعزيز المراكز المتراجعة وتجميد الشراء لحين استقرار المؤشرات.`;
        } else if (rsi < 36 && pivotS1 && currentPrice >= pivotS1) {
          action = 'ACCUMULATE';
          alertLevel = 'ACCUMULATE';
          badgeText = 'تجميع لتخفيض المتوسط';
          badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
          advice = `تشبع بيعي (RSI: ${rsi}) أعلى الدعم S1 (${pivotS1.toFixed(2)} ج). مناسب للمستثمر طويل الأجل لتعزيز المركز وخفض متوسط التكلفة.`;
        } else {
          action = 'HOLD';
          badgeText = 'احتفاظ ومراقبة الارتداد';
          badgeColor = 'bg-slate-800/80 text-slate-300 border border-slate-700';
          advice = `احتفاظ بالمركز مع مراقبة الدعم ${pivotS1 || '--'} ج لانتظار موجة ارتدادية لتخفيف الخسارة (${returnPct.toFixed(1)}%).`;
        }
      } 
      // 2. Winning Position Branch
      else {
        if (pivotR1 && currentPrice >= pivotR1) {
          action = 'REBALANCE_CANDIDATE';
          alertLevel = 'TARGET_HIT';
          badgeText = '🎯 جني أرباح قمة جزئية';
          badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm';
          advice = `وصول لمستوى المقاومة R1 (${pivotR1.toFixed(2)} ج) مع عائد (+${returnPct.toFixed(1)}%). يُنصح بتأمين أرباح جزئية وإعادة الشراء في القاع.`;
        } else if (returnPct >= 18) {
          action = 'REBALANCE_CANDIDATE';
          alertLevel = 'TARGET_HIT';
          badgeText = '🎯 جني أرباح طفرة';
          badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          advice = `السهم حقق مكاسب قوية (+${returnPct.toFixed(1)}%). يُنصح بتأمين جزء من الأرباح لحماية المكاسب المحققة.`;
        } else if (sma50 && currentPrice > sma50) {
          action = 'HOLD';
          badgeText = 'احتفاظ صاعد';
          badgeColor = 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40';
          advice = `اتجاه صاعد صحي أعلى متوسط 50 يوم (+${returnPct.toFixed(1)}%). استمرار في المركز مستهدفاً ${pivotR1 || '--'} ج.`;
        } else {
          action = 'HOLD';
          badgeText = 'احتفاظ بربح';
          badgeColor = 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/30';
          advice = `أداء إيجابي هادئ (+${returnPct.toFixed(1)}%). استمرار المتابعة مع حماية الأرباح.`;
        }
      }

      return {
        ticker: asset.ticker,
        name: asset.name,
        shares,
        buyPrice,
        currentPrice,
        totalCost,
        currentValue,
        profit,
        returnPct,
        isLosing,
        status: isLosing ? 'تراجع' : 'ربح',
        action,
        alertLevel,
        badgeText,
        badgeColor,
        advice
      };
    },

    /**
     * Evaluate Market Regime seamlessly without blind spots
     */
    evaluateMarketRegime: function (advancingCount, totalStocks, avgMarketChange) {
      totalStocks = Number(totalStocks) || 1;
      advancingCount = Number(advancingCount) || 0;
      avgMarketChange = Number(avgMarketChange) || 0;

      const advancingPct = totalStocks > 0 ? (advancingCount / totalStocks) * 100 : 50;

      let regime = 'NORMAL_CONSOLIDATION';
      let regimeArabic = 'تداول متوازن وعرضي (Consolidation)';
      let description = 'السوق يتحرك في نطاق متوازن مع استقرار الدعوم والمقاومات.';
      let allowDipBuying = true;

      // 1. Systemic Shock: Either broad market decline (< 20% advancing) OR severe index drop (<= -3.0%)
      if (advancingPct < 20 || avgMarketChange <= -3.0) {
        regime = 'SYSTEMIC_SHOCK';
        regimeArabic = 'حذر: ضغط بيعي واسع وشامل (Systemic Shock Alert)';
        description = 'هبوط عام في أغلب الأسهم؛ يُنصح بالتحفظ وتجميد الشراء عند الدعوم حتى تستقر السيولة.';
        allowDipBuying = false; // Guardrail against falling knife
      }
      // 2. Healthy Pullback
      else if (advancingPct <= 45 && avgMarketChange < 0) {
        regime = 'HEALTHY_CORRECTION';
        regimeArabic = 'تصحيح فني هادئ وجني أرباح صحي (Pullback)';
        description = 'تراجع هادئ متوقع لجني الأرباح مع تماسك الأسهم القيادية فوق دعومها الرئيسية؛ فرصة تجميع للمستثمر.';
        allowDipBuying = true;
      }
      // 3. Bullish Expansion
      else if (advancingPct >= 60 && avgMarketChange >= 1.0) {
        regime = 'BULLISH_EXPANSION';
        regimeArabic = 'زخم صعودي واستكشاف سعري (Bullish Expansion)';
        description = 'سيولة شرائية واسعة واختراق للمقاومات الفنية مدعومة بحجم تداول مرتفع.';
        allowDipBuying = true;
      }

      return {
        regime,
        regimeArabic,
        description,
        advancingPct: Number(advancingPct.toFixed(1)),
        avgMarketChange: Number(avgMarketChange.toFixed(2)),
        allowDipBuying
      };
    },

    /**
     * Compute clean, integer-based Rebalance details with EGX brokerage commission deduction
     */
    calculateRebalance: function (totalShares, currentPrice, buyPrice, ratio, supportPrice) {
      totalShares = parseInt(totalShares, 10) || 0;
      currentPrice = Number(currentPrice) || 0;
      buyPrice = Number(buyPrice) || 0;
      ratio = Number(ratio) || 0.33;
      supportPrice = Number(supportPrice) || (currentPrice * 0.88);

      let sellShares = Math.max(1, Math.round(totalShares * ratio));
      if (sellShares >= totalShares && totalShares > 1) sellShares = totalShares - 1;

      const grossSellCash = Number((sellShares * currentPrice).toFixed(2));
      const estCommission = Number((grossSellCash * 0.00175).toFixed(2)); // EGX standard fee (~0.175%)
      const sellCash = Math.max(0, Number((grossSellCash - estCommission).toFixed(2)));
      const realizedProfit = Number((sellShares * (currentPrice - buyPrice) - estCommission).toFixed(2));
      const remainingShares = totalShares - sellShares;
      const remainingValue = Math.round(remainingShares * currentPrice);

      // Rebuy factoring buy commission
      const rebuyShares = supportPrice > 0 ? Math.floor(sellCash / (supportPrice * 1.00175)) : 0;
      const netGainShares = rebuyShares - sellShares;
      const newTotalShares = remainingShares + rebuyShares;

      return {
        sellShares,
        grossSellCash,
        estCommission,
        sellCash,
        realizedProfit,
        remainingShares,
        remainingValue,
        rebuyShares,
        netGainShares,
        newTotalShares
      };
    },

    /**
     * Determine Stock Market Cycle Stage (4 distinct stages)
     */
    determineStockCycle: function (item) {
      if (!item || item.ticker === 'CASH' || item.isCashReserve) {
        return {
          stage: 0,
          nameAr: 'سيولة نقدية',
          shortBadge: 'كاش حر 💵',
          badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
          advice: 'سيولة نقدية استراتيجية مخصصة للاقتناص.',
          actionTag: 'سيولة جاهزة',
          progressPct: 0
        };
      }

      const clean = (val) => {
        if (val == null) return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        const cleaned = String(val).replace(/[^\d.-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
      };

      const price = clean(item.currentPrice) || clean(item.price) || clean(item.buyPrice) || 0;
      const buyPrice = clean(item.buyPrice) || price;
      const pivotS1 = clean(item.pivotS1) || clean(item.support);
      const pivotR1 = clean(item.pivotR1) || clean(item.target1);
      const sma50 = clean(item.sma50);
      const rsi = clean(item.rsi) || 50;
      const returnPct = clean(item.returnPct) != null ? clean(item.returnPct) : (buyPrice > 0 ? ((price - buyPrice) / buyPrice) * 100 : 0);
      const isSupportBroken = item.isSupportBroken || (pivotS1 != null && price < pivotS1);

      // Stage 4: Downtrend / Broken Support
      if (isSupportBroken || (returnPct <= -15 && pivotS1 != null && price < pivotS1)) {
        return {
          stage: 4,
          nameAr: 'المرحلة 4: مسار هابط وكسر دعم',
          shortBadge: 'كسر دعم / هبوط 🟣',
          badgeClass: 'bg-purple-950/70 text-purple-300 border border-purple-500/50 shadow-sm font-bold',
          bgHeaderClass: 'from-purple-950 to-slate-900',
          advice: 'السهم كسر حد الأمان الفني. الشراء هنا محظور؛ انتظر ارتداداً للتخفيف أو تماسك قاع جديد.',
          actionTag: 'تريث ومراقبة',
          progressPct: 15
        };
      }

      // Stage 3: Topping / Overextended (FOMO / Profit Taking zone)
      if ((pivotR1 != null && price >= pivotR1) || returnPct >= 20 || rsi >= 72 || (sma50 != null && sma50 > 0 && ((price - sma50) / sma50) > 0.25)) {
        return {
          stage: 3,
          nameAr: 'المرحلة 3: قمة خطرة وتشبع صاعد',
          shortBadge: 'قمة وتشبع 🔴 (ممنوع الشراء)',
          badgeClass: 'bg-rose-950/70 text-rose-300 border border-rose-500/50 shadow-sm font-bold',
          bgHeaderClass: 'from-rose-950 to-slate-900',
          advice: `السهم صعد بقوة (+${returnPct.toFixed(1)}%) ووصل لمنطقة تشبع ومقاومة. الشراء هنا مخاطرة عالية (مصيدة قمة). الأصل هو تأمين الأرباح ونقل الكاش لصناديق السيولة.`,
          actionTag: 'جني أرباح وتأمين',
          progressPct: 90
        };
      }

      // Stage 1: Safe Bottom & Accumulation
      const distFromS1Pct = (pivotS1 != null && pivotS1 > 0) ? ((price - pivotS1) / pivotS1) * 100 : 10;
      if ((distFromS1Pct <= 5 && distFromS1Pct >= -0.5) || rsi < 38 || (returnPct < 0 && !isSupportBroken && (pivotS1 == null || price >= pivotS1))) {
        return {
          stage: 1,
          nameAr: 'المرحلة 1: قاع آمن وتجميع',
          shortBadge: 'قاع وتجميع 🟢 (فرصة شراء)',
          badgeClass: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-sm font-bold',
          bgHeaderClass: 'from-emerald-950 to-slate-900',
          advice: 'السهم مستقر عند مستويات دعمه الرئيسية ولم يرتفع بعد. نسبة العائد للمخاطرة ممتازة وتوقيت مثالي للشراء أو تخفيض المتوسط.',
          actionTag: 'فرصة شراء آمنة',
          progressPct: 25
        };
      }

      // Stage 2: Mid-Cycle Healthy Trend
      return {
        stage: 2,
        nameAr: 'المرحلة 2: مسار صاعد معتدل',
        shortBadge: 'مسار صاعد 🟡 (احتفاظ)',
        badgeClass: 'bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-sm font-bold',
        bgHeaderClass: 'from-amber-950 to-slate-900',
        advice: 'السهم يتحرك في اتجاه إيجابي صحي، لكنه ابتعد عن القاع. مناسب للاحتفاظ إذا كنت تملكه، ولا يُنصح بالشراء بكميات كبيرة الآن.',
        actionTag: 'احتفاظ بالمركز',
        progressPct: 60
      };
    },

    /**
     * Generate Actionable Daily Hub Plan for Busy Investors
     */
    generateDailyActionHub: function (portfolioData, fullMarketRadar, cashBalance) {
      portfolioData = Array.isArray(portfolioData) ? portfolioData : [];
      fullMarketRadar = Array.isArray(fullMarketRadar) ? fullMarketRadar : [];
      cashBalance = Number(cashBalance) || 0;

      // Extract funds cash
      const ncsItem = portfolioData.find(p => p.ticker === 'NCS');
      const bsbItem = portfolioData.find(p => p.ticker === 'BSB');
      const fundsTotal = (ncsItem ? Number(ncsItem.value || 0) : 0) + (bsbItem ? Number(bsbItem.value || 0) : 0);
      const totalDryPowder = cashBalance + fundsTotal;

      // 1. Identify Buy / Accumulation Candidate
      let buyCandidate = null;
      const accumPortfolio = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB' && (p.profit < 0 || p.action === 'ACCUMULATE'));
      const preferredDip = accumPortfolio.find(p => p.ticker === 'COMI') || accumPortfolio[0];
      
      if (preferredDip) {
        const curPrice = Number(preferredDip.currentPrice) || Number(preferredDip.buyPrice) || 100;
        const buyPrice = Number(preferredDip.buyPrice) || curPrice;
        const currentShares = parseInt(preferredDip.shares, 10) || 0;
        
        const suggestedCash = Math.min(5000, Math.max(1500, Math.round(cashBalance * 0.25)));
        const sharesToBuy = curPrice > 0 ? Math.floor(suggestedCash / curPrice) : 0;
        const actualCashSpend = Math.round(sharesToBuy * curPrice);
        
        const totalOldCost = currentShares * buyPrice;
        const totalNewCost = totalOldCost + actualCashSpend;
        const totalNewShares = currentShares + sharesToBuy;
        const newAvgCost = totalNewShares > 0 ? Number((totalNewCost / totalNewShares).toFixed(2)) : buyPrice;
        const avgReductionEgp = Number((buyPrice - newAvgCost).toFixed(2));

        const cycle = this.determineStockCycle(preferredDip);

        buyCandidate = {
          ticker: preferredDip.ticker,
          name: preferredDip.name,
          currentPrice: curPrice,
          buyPrice: buyPrice,
          returnPct: Number(preferredDip.returnPct) || 0,
          currentShares: currentShares,
          suggestedCash: actualCashSpend,
          sharesToBuy: sharesToBuy,
          newAvgCost: newAvgCost,
          avgReductionEgp: avgReductionEgp,
          cycle: cycle,
          supportPrice: preferredDip.pivotS1 || Number((curPrice * 0.97).toFixed(2)),
          targetPrice: preferredDip.pivotR1 || Number((curPrice * 1.15).toFixed(2)),
          thndrUrl: preferredDip.thndrUrl || `https://app.thndr.app/search?query=${preferredDip.ticker}`
        };
      }

      // 2. Identify Profit-Taking & Share Accumulation Candidate (Trading Around Core)
      let profitCandidate = null;
      const winningPortfolio = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB' && (p.profit > 0 || p.returnPct > 0));
      winningPortfolio.sort((a, b) => (Number(b.returnPct) || 0) - (Number(a.returnPct) || 0));
      
      const topWinner = winningPortfolio[0];
      if (topWinner && (topWinner.returnPct >= 18 || topWinner.action === 'REBALANCE_CANDIDATE')) {
        const curPrice = Number(topWinner.currentPrice) || Number(topWinner.buyPrice) || 100;
        const buyPrice = Number(topWinner.buyPrice) || curPrice;
        const totalShares = parseInt(topWinner.shares, 10) || 0;
        
        const rebalance = this.calculateRebalance(totalShares, curPrice, buyPrice, 0.30, Number(topWinner.pivotS1) || (curPrice * 0.90));
        const cycle = this.determineStockCycle(topWinner);

        profitCandidate = {
          ticker: topWinner.ticker,
          name: topWinner.name,
          currentPrice: curPrice,
          buyPrice: buyPrice,
          returnPct: Number(topWinner.returnPct) || 0,
          totalShares: totalShares,
          sellShares: rebalance.sellShares,
          sellCash: rebalance.sellCash,
          realizedProfit: rebalance.realizedProfit,
          remainingShares: rebalance.remainingShares,
          rebuyPrice: Number(topWinner.pivotS1) || Number((curPrice * 0.90).toFixed(2)),
          rebuyShares: rebalance.rebuyShares,
          netGainShares: Math.max(1, rebalance.netGainShares),
          cycle: cycle,
          thndrUrl: topWinner.thndrUrl || `https://app.thndr.app/search?query=${topWinner.ticker}`
        };
      }

      // 3. Identify Capital Protection / Risk Alert
      let safetyAlert = null;
      const brokenAssets = portfolioData.filter(p => p.ticker !== 'CASH' && (p.isSupportBroken || (p.pivotS1 && p.currentPrice < p.pivotS1)));
      if (brokenAssets.length > 0) {
        const risky = brokenAssets[0];
        safetyAlert = {
          hasRisk: true,
          ticker: risky.ticker,
          name: risky.name,
          currentPrice: Number(risky.currentPrice) || 0,
          supportPrice: Number(risky.pivotS1) || 0,
          returnPct: Number(risky.returnPct) || 0,
          text: `سهم ${risky.name} (${risky.ticker}) كسر مستوى الدعم المحوري S1 (${risky.pivotS1} ج). يُنصح بمتابعة خطة الحماية والتدوير لتفادي زيادة الخسارة.`
        };
      } else {
        safetyAlert = {
          hasRisk: false,
          text: 'جميع أسهمك القيادية تتداول فوق خطوط الأمان والدعوم الفنية. لا توجد أي إشارات كسر دعم حرجة اليوم.'
        };
      }

      return {
        cashStatus: {
          freeCash: cashBalance,
          fundsTotal: fundsTotal,
          totalDryPowder: totalDryPowder,
          summaryText: `لديك ${Math.round(cashBalance).toLocaleString('en-US')} ج.م كاش حر + ${Math.round(fundsTotal).toLocaleString('en-US')} ج.م في صناديق السيولة اليومية (تدر عائد ~22% سنوياً). هذه السيولة مخصصة لاقتناص القيعان فقط.`
        },
        buyCandidate,
        profitCandidate,
        safetyAlert
      };
    }
  };

  // Expose to browser window or module exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_Engine;
  } else {
    global.EGX_Engine = EGX_Engine;
  }
})(typeof window !== 'undefined' ? window : this);
