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
      const s1 = Number(((2 * pp) - high).toFixed(2));
      const r2 = Number((pp + (high - low)).toFixed(2));
      const s2 = Number((pp - (high - low)).toFixed(2));

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
      const riskPerShare = Number((entryPrice - stopLoss).toFixed(2));

      // Strictly integer shares (Egyptian Exchange execution constraint)
      const maxShares = Math.max(0, Math.floor(maxRiskEgp / riskPerShare));
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
    evaluateAsset: function (asset) {
      const shares = parseInt(asset.shares, 10) || 0;
      const buyPrice = Number(asset.buyPrice) || 0;
      const currentPrice = Number(asset.currentPrice) || buyPrice;
      const pivotR1 = Number(asset.pivotR1 || asset.target1) || null;
      const pivotS1 = Number(asset.pivotS1 || asset.support) || null;
      const sma50 = Number(asset.sma50) || null;
      const rsi = Number(asset.rsi) || 50;

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
        } else if (rsi < 36 && pivotS1 && currentPrice >= pivotS1) {
          action = 'ACCUMULATE';
          alertLevel = 'ACCUMULATE';
          badgeText = 'تجميع لتخفيض المتوسط';
          badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
          advice = `تشبع بيعي (RSI: ${rsi}) أعلى الدعم S1 (${pivotS1.toFixed(2)} ج). مناسب للمستثمر طويل الأجل لتعزيز المركز وخفض متوسط التكلفة.`;
        } else {
          action = 'HOLD';
          badgeText = 'احتفاظ ومراقبة الارتداد';
          badgeColor = 'bg-gray-800/80 text-gray-300 border border-gray-700';
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

      const grossSellCash = Math.round(sellShares * currentPrice);
      const estCommission = Math.round(grossSellCash * 0.00175); // EGX standard fee (~0.175%)
      const sellCash = Math.max(0, grossSellCash - estCommission);
      const realizedProfit = Math.round(sellShares * (currentPrice - buyPrice)) - estCommission;
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
    }
  };

  // Expose to browser window or module exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EGX_Engine;
  } else {
    global.EGX_Engine = EGX_Engine;
  }
})(typeof window !== 'undefined' ? window : this);
