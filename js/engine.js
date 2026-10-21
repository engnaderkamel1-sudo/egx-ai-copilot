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
     * Calculate Trailing Stop Loss & Dynamic R2 Prospects when R1 is reached/tested
     * Strictly avoids vague advice: computes exact trailing stop price (EGP) with a 2.5% volatility buffer,
     * and evaluates R2 breakout probability using live dynamic metrics (RSI, Turnover, Price distance above R1).
     */
    calculateTrailingStopAndR2Prospects: function (params) {
      if (!params || typeof params !== 'object') return null;

      const currentPrice = Number(params.currentPrice) || 0;
      const buyPrice = Number(params.buyPrice) || 0;
      const pivotR1 = Number(params.pivotR1) || 0;
      const pivotR2 = Number(params.pivotR2) || (pivotR1 > 0 ? Number((pivotR1 * 1.06).toFixed(2)) : 0);
      const pivotS1 = Number(params.pivotS1) || 0;
      const pp = Number(params.pp) || 0;
      const rsi = (params.rsi !== undefined && params.rsi !== null && !isNaN(Number(params.rsi))) ? Number(Number(params.rsi).toFixed(1)) : 50;
      const tradedValue = Number(params.tradedValue) || 0;
      const volumeMultiplier = params.volumeMultiplier || '';
      const category = params.category || 'core';
      const rvol = (params.rvol !== undefined && params.rvol !== null && !isNaN(Number(params.rvol))) ? Number(Number(params.rvol).toFixed(2)) : 0;

      if (currentPrice <= 0 || pivotR1 <= 0) return null;

      // 1. Exact Trailing Stop Loss Calculation (with 2.5% intraday volatility buffer below R1)
      let proposedStop = Number((pivotR1 * 0.975).toFixed(2));

      // If price surged higher above R1 (> +3%), trail dynamically under current price by 4%
      if (currentPrice > pivotR1 * 1.03) {
        proposedStop = Math.max(proposedStop, Number((currentPrice * 0.96).toFixed(2)));
      }

      // If buyPrice is known and profitable, ensure trailing stop secures breakeven + fee buffer at minimum
      if (buyPrice > 0 && currentPrice > buyPrice) {
        if (proposedStop < buyPrice) {
          proposedStop = Number((buyPrice * 1.01).toFixed(2));
        }
      }

      // Safety: trailing stop must strictly be below current price
      if (proposedStop >= currentPrice) {
        proposedStop = Number((currentPrice * 0.975).toFixed(2));
      }

      // Locked-in profit % at proposed trailing stop
      const lockedProfitPct = (buyPrice > 0 && proposedStop > buyPrice)
        ? Number((((proposedStop - buyPrice) / buyPrice) * 100).toFixed(1))
        : null;

      // Current profit %
      const currentProfitPct = buyPrice > 0
        ? Number((((currentPrice - buyPrice) / buyPrice) * 100).toFixed(1))
        : null;

      // 2. Dynamic Metric Factor 1: Distance & Stability above R1
      const aboveR1Pct = Number((((currentPrice - pivotR1) / pivotR1) * 100).toFixed(1));
      let factor1Text = '';
      if (aboveR1Pct > 0) {
        factor1Text = `ثبات السعر أعلى المقاومة R1 بنسبة (+${aboveR1Pct}%)`;
      } else if (aboveR1Pct === 0) {
        factor1Text = `ملامسة مباشرة لسقف المقاومة R1 (${pivotR1.toFixed(2)} ج)`;
      } else {
        factor1Text = `محاولة اختراق المقاومة R1 (السعر أدنى منها بـ ${Math.abs(aboveR1Pct)}%)`;
      }

      // 3. Dynamic Metric Factor 2: RSI Momentum
      let rsiStatus = 'BULLISH';
      let factor2Text = '';
      if (rsi >= 50 && rsi <= 75) {
        rsiStatus = 'BULLISH';
        factor2Text = `مؤشر الزخم في نطاق صاعد صحي (RSI: ${rsi}) دون تشبع مفرط`;
      } else if (rsi > 75) {
        rsiStatus = 'OVERBOUGHT';
        factor2Text = `دخول مؤشر الزخم في تشبع شرائي حاد (RSI: ${rsi}) ينذر بجني أرباح تصحيحي`;
      } else {
        rsiStatus = 'WEAK';
        factor2Text = `هدوء القوة الشرائية اللحظية (RSI: ${rsi}) مما يقلل عزم الاختراق السريع`;
      }

      // 4. Dynamic Metric Factor 3: Liquidity & Turnover (with Institutional RVol)
      let factor3Text = '';
      let turnoverFormatted = '';
      if (rvol >= 1.8) {
        turnoverFormatted = `سيولة مؤسسية استثنائية (${rvol}x)`;
        factor3Text = `تدفق سيولة مؤسسية استثنائية (RVol: ${rvol}x ضعف المعتاد) يدعم بقوة اختراق المقاومة`;
      } else if (rvol > 0 && rvol < 0.65) {
        turnoverFormatted = `ضعف في السيولة (${rvol}x)`;
        factor3Text = `⚠️ ضعف حجم التداول اللحظي (RVol: ${rvol}x) ينذر بنقص عزم الاختراق ومصيدة قمة`;
      } else if (tradedValue > 0) {
        turnoverFormatted = tradedValue >= 1000000 
          ? `${(tradedValue / 1000000).toFixed(1)} مليون ج` 
          : `${Math.round(tradedValue / 1000)} ألف ج`;
        factor3Text = `تنفيذ سيولة نشطة بقيمة ${turnoverFormatted}`;
      } else if (volumeMultiplier) {
        turnoverFormatted = volumeMultiplier;
        factor3Text = `حجم تداول بزخم ${volumeMultiplier}`;
      } else {
        turnoverFormatted = 'سيولة اعتيادية';
        factor3Text = `معدلات تداول اعتيادية`;
      }

      // 5. Target R2 distance and upside
      const targetR2 = pivotR2 > currentPrice ? pivotR2 : Number((pivotR1 * 1.06).toFixed(2));
      const r2DistancePct = Number((((targetR2 - currentPrice) / currentPrice) * 100).toFixed(1));

      // 6. Overall Verdict on R2
      let verdict = 'FAVORED';
      let headline = '';
      let adviceText = '';

      if (category === 'satellite') {
        // Satellite portfolio prioritizes locking in tactical gains
        if (rsiStatus === 'OVERBOUGHT' || rsiStatus === 'WEAK') {
          verdict = 'EXHAUSTED';
          headline = `🎯 جني أرباح تكتيكي لمحفظة الأقمار`;
          adviceText = `🎯 وصول لهدف R1 (${pivotR1} ج) • 💡 يُنصح بالبيع وجني الأرباح لتأمين كاش محفظة الأقمار بدلاً من المخاطرة بانتظار R2 (${targetR2} ج) بسبب: (1) ${factor2Text}، (2) ${factor1Text}. لضمان الأرباح إن أردت الانتظار: ارفع الوقف فوراً إلى [${proposedStop} ج].`;
        } else {
          verdict = 'FAVORED';
          headline = `🎯 بلوغ الهدف التكتيكي R1 (${pivotR1} ج)`;
          adviceText = `🎯 وصول لهدف R1 (${pivotR1} ج) • 💡 ارفع وقف الخسارة فوراً إلى [${proposedStop} ج] (لحجز ربح ${lockedProfitPct !== null ? '+' + lockedProfitPct + '%' : 'مضمون'} مع ترك هامش 2.5% لتذبذب الجلسة). 🚀 فرصة الامتداد لـ R2 (${targetR2} ج / +${r2DistancePct}%) مدعومة بـ: (1) ${factor1Text}، (2) ${factor2Text}، (3) ${factor3Text}.`;
        }
      } else {
        // Core portfolio allows riding the trend if momentum supports it
        if (rsiStatus === 'OVERBOUGHT') {
          verdict = 'EXHAUSTED';
          headline = `⚠️ وصول لمقاومة R1 مع تشبع شرائي`;
          adviceText = `🎯 ملامسة المقاومة R1 (${pivotR1} ج) • 💡 ارفع وقف الخسارة فوراً إلى [${proposedStop} ج]. يُفضل تأمين جزء من الأرباح (30%-50%) بسبب: (1) ${factor2Text}، (2) ${factor1Text}. فرصة R2 (${targetR2} ج) تتطلب الحذر من هبوط مفاجئ.`;
        } else if (rsiStatus === 'BULLISH' && aboveR1Pct >= 0) {
          verdict = 'FAVORED';
          headline = `🚀 تجاوز المقاومة R1 والامتداد نحو R2`;
          adviceText = `🎯 تجاوز المقاومة R1 (${pivotR1} ج) • 💡 ارفع وقف الخسارة فوراً إلى [${proposedStop} ج] (لحجز ربح ${lockedProfitPct !== null ? '+' + lockedProfitPct + '%' : 'مضمون'} مع ترك هامش 2.5% لتذبذب الجلسة). 🚀 امتداد الصعود لـ R2 (${targetR2} ج / +${r2DistancePct}%) مرجح بسبب: (1) ${factor1Text}، (2) ${factor2Text}، (3) ${factor3Text}.`;
        } else {
          verdict = 'CAUTIOUS';
          headline = `🎯 اختبار المقاومة R1 (${pivotR1} ج)`;
          adviceText = `🎯 اختبار المقاومة R1 (${pivotR1} ج) • 💡 ارفع وقف الخسارة إلى [${proposedStop} ج]. يُنصح بمراقبة استقرار التداول؛ الامتداد لـ R2 (${targetR2} ج) يتطلب زيادة في السيولة: (1) ${factor1Text}، (2) ${factor2Text}، (3) ${factor3Text}.`;
        }
      }

      return {
        proposedStop,
        lockedProfitPct,
        currentProfitPct,
        targetR2,
        r2DistancePct,
        aboveR1Pct,
        rsiStatus,
        turnoverFormatted,
        verdict,
        headline,
        adviceText,
        factors: [factor1Text, factor2Text, factor3Text]
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
     * Get Cairo Live Session Status
     * Sunday to Thursday: 10:00 to 14:30 Cairo Time (Africa/Cairo)
     */
    getEGXSessionStatus: function (overrideDate) {
      try {
        const now = overrideDate || new Date();
        const options = { timeZone: 'Africa/Cairo', hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);
        let weekday = '';
        let hour = 0;
        let minute = 0;
        parts.forEach(p => {
          if (p.type === 'weekday') weekday = p.value;
          if (p.type === 'hour') hour = parseInt(p.value, 10);
          if (p.type === 'minute') minute = parseInt(p.value, 10);
        });

        const isMarketDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(weekday);
        const timeMinutes = hour * 60 + minute;
        // Official EGX Session: 10:00 (600 mins) to 14:30 (870 mins)
        // Auction Window: 14:15 (855 mins) to 14:30 (870 mins)
        const isOpen = isMarketDay && (timeMinutes >= 600 && timeMinutes < 870);
        const isAuction = isMarketDay && (timeMinutes >= 855 && timeMinutes < 870);
        const isClosed = !isOpen;

        return {
          isOpen,
          isAuction,
          isClosed,
          timeMinutes,
          weekday,
          cairoTimeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        };
      } catch (e) {
        return {
          isOpen: false,
          isAuction: false,
          isClosed: true,
          timeMinutes: 0,
          weekday: '',
          cairoTimeStr: '15:00'
        };
      }
    },

    /**
     * Determine whether an asset belongs to Core (النواة الاستثمارية) or Satellite (الأقمار والمضاربات)
     */
    isCoreAsset: function (asset) {
      if (!asset) return true;
      if (asset.ticker === 'CASH' || asset.ticker === 'NCS' || asset.ticker === 'BSB' || asset.isCashReserve) {
        return true;
      }
      if (asset.portfolioBucket === 'satellite' || asset.strategy === 'satellite') {
        return false;
      }
      if (asset.portfolioBucket === 'core' || asset.strategy === 'core') {
        return true;
      }

      const cat = String(asset.category || '').toLowerCase();
      if (cat.includes('satellite') || cat.includes('أقمار') || cat.includes('مضارب') || cat.includes('طفرات') || cat.includes('egx70')) {
        return false;
      }

      // Recognized Core stocks in EGX30 with solid fundamentals / dividends
      const coreTickers = ['COMI', 'SWDY', 'ABUK', 'CLHO', 'EGAL', 'ORAS', 'MFPC', 'CIEB', 'ADIB', 'HDBK', 'TMGH'];
      if (coreTickers.includes(asset.ticker)) {
        return true;
      }

      return !cat.includes('egx70');
    },

    /**
     * Check if a stock or market is in a Catastrophic / Emergency Drop
     * Bypasses the "wait for close" rule if an extreme flash crash or systemic collapse occurs.
     */
    checkEmergencyDrop: function (asset, marketRegime) {
      if (!asset) return { isEmergency: false };

      const cleanNum = (val) => {
        if (val == null) return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        const cleaned = String(val).replace(/[^\d.-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
      };

      const currentPrice = cleanNum(asset.currentPrice) || 0;
      const buyPrice = cleanNum(asset.buyPrice) || currentPrice;
      const pivotS1 = cleanNum(asset.pivotS1 || asset.support) || 0;
      const pivotS2 = cleanNum(asset.pivotS2) || (pivotS1 > 0 ? Number((pivotS1 * 0.95).toFixed(2)) : 0);
      const changePct = cleanNum(asset.changePct != null ? asset.changePct : asset.change);
      const totalLossPct = buyPrice > 0 ? (((currentPrice - buyPrice) / buyPrice) * 100) : 0;

      // 1. Systemic market flash crash
      if (marketRegime === 'SYSTEMIC_SHOCK') {
        return {
          isEmergency: true,
          reason: 'صدمة سوقية شاملة (Systemic Market Shock)'
        };
      }

      // 2. Severe intraday crash (e.g. -6.5% or worse in a single session)
      if (changePct !== null && changePct <= -6.5) {
        return {
          isEmergency: true,
          reason: `هبوط لحظي عنيف للجلسة (${changePct.toFixed(1)}%) يقترب من حدود الإيقاف المؤقت`
        };
      }

      // 3. Catastrophic support breakdown below S2
      if (pivotS2 > 0 && currentPrice < pivotS2) {
        return {
          isEmergency: true,
          reason: `انهيار كسر الدعم الثاني S2 (${pivotS2.toFixed(2)} ج) وانزلاق سعري حاد`
        };
      }

      // 4. Extreme total drawdown exceeding -25% with broken S1
      if (pivotS1 > 0 && currentPrice < pivotS1 && totalLossPct <= -25.0) {
        return {
          isEmergency: true,
          reason: `تراجع كلي فادح (${totalLossPct.toFixed(1)}%) دون الدعم S1`
        };
      }

      return { isEmergency: false };
    },

    /**
     * Calculate Partial Exit (50% reduction) metrics
     */
    calculatePartialExit: function (shares, currentPrice, buyPrice) {
      shares = parseInt(shares, 10) || 0;
      currentPrice = Number(currentPrice) || 0;
      buyPrice = Number(buyPrice) || currentPrice;

      const exitShares = Math.floor(shares * 0.5);
      const remainingShares = shares - exitShares;
      const cashReleased = Math.round(exitShares * currentPrice);
      const remainingValue = Math.round(remainingShares * currentPrice);
      const realizedProfit = Math.round(exitShares * (currentPrice - buyPrice));
      const realizedReturnPct = buyPrice > 0 ? Number((((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;

      return {
        exitShares,
        remainingShares,
        cashReleased,
        remainingValue,
        realizedProfit,
        realizedReturnPct,
        guidanceText: `تخفيف 50% (${exitShares.toLocaleString('en-US')} سهم): يوفر سيولة حرة بقيمة ${cashReleased.toLocaleString('en-US')} ج.م مع الاحتفاظ بـ ${remainingShares.toLocaleString('en-US')} سهم لترقب الارتداد.`
      };
    },

    /**
     * Single Source of Truth for Asset Evaluation
     * Enforces:
     * 1. Iron Rule: A losing stock NEVER gets "جني أرباح" or "منطقة قمة".
     * 2. Falling Knife Guardrail: A stock in deep drawdown (<= -7%) NEVER gets naive "تجميع / ACCUMULATE".
     * 3. Emergency Hard Stop: Bypasses wait-for-close on severe crash / systemic collapse.
     * 4. Session Timing: Differentiates between intraday dip (wait for 02:30 close) vs confirmed daily close.
     * 5. Portfolio Archetype: Core assets get wide S2 buffer; Satellite assets enforce strict discipline.
     */
    evaluateAsset: function (asset, marketRegime, sessionContext) {
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
      const pivotR2 = cleanNum(asset.pivotR2 || asset.target2);
      const pivotS1 = cleanNum(asset.pivotS1 || asset.support);
      const pivotS2 = cleanNum(asset.pivotS2) || (pivotS1 ? Number((pivotS1 * 0.95).toFixed(2)) : null);
      const sma50 = cleanNum(asset.sma50);
      const rsi = cleanNum(asset.rsi) || 50;

      const totalCost = Math.round(shares * buyPrice);
      const currentValue = Math.round(shares * currentPrice);
      const profit = currentValue - totalCost;
      const returnPct = totalCost > 0 ? Number(((profit / totalCost) * 100).toFixed(2)) : 0;
      const isLosing = profit < 0 || returnPct < 0;

      // Smart Context Evaluation
      const isCore = this.isCoreAsset(asset);
      const session = sessionContext || this.getEGXSessionStatus();
      const emergency = this.checkEmergencyDrop(asset, marketRegime);

      let action = 'HOLD';
      let badgeText = 'احتفاظ';
      let badgeColor = 'bg-gray-800 text-gray-300 border border-gray-700';
      let advice = 'احتفاظ هادئ ومتابعة حركة السعر داخل النطاق الطبيعي.';
      let alertLevel = 'NORMAL';

      // 1. Losing Position Branch (Strict Sanitization: No profit-taking allowed)
      if (isLosing) {
        // Condition A: Emergency Hard Stop (Catastrophic flash drop or Systemic Shock)
        if (emergency.isEmergency && pivotS1 && currentPrice < pivotS1) {
          action = 'EMERGENCY_STOP_LOSS';
          alertLevel = 'CRITICAL_RISK';
          badgeText = '🚨 خروج طارئ فوري';
          badgeColor = 'bg-rose-950/90 text-rose-200 border border-rose-500 shadow-md shadow-rose-950/60 animate-pulse';
          advice = `🚨 خروج طارئ فوري دون انتظار الإغلاق: ${emergency.reason}. نفّذ الخروج لتفادي تجميد المحفظة على الحد الأدنى (Limit Down).`;
        }
        // Condition B: Rebound towards Resistance R1 for a losing stock (Trimming opportunity)
        else if (pivotR1 && currentPrice >= pivotR1) {
          action = 'REBALANCE_CANDIDATE';
          alertLevel = 'REBOUND_RESISTANCE';
          badgeText = '🔄 تدوير وتخفيف (ارتداد هابط)';
          badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          advice = `ارتداد فني لمستوى المقاومة R1 (${pivotR1.toFixed(2)} ج) لسهم متراجع (${returnPct.toFixed(1)}%). فرصة مثالية لتخفيف 50% من الكمية وتدوير السيولة في أصل أسرع نمواً.`;
        }
        // Condition C: Broken Support S1 Breakdown Evaluation
        else if (pivotS1 && currentPrice < pivotS1) {
          if (session.isOpen) {
            // Intraday session is active (10:00 to 14:30 Cairo)
            if (isCore) {
              if (pivotS2 && currentPrice >= pivotS2) {
                // Core stock within S2 safety cushion
                action = 'CORE_BUFFER_WATCH';
                alertLevel = 'NORMAL';
                badgeText = '🛡️ وسادة أمان النواة الاستثمارية';
                badgeColor = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
                advice = `🛡️ سهم قيادي من النواة: السعر (${currentPrice.toFixed(2)} ج) أدنى S1 (${pivotS1.toFixed(2)} ج) لحظياً ولكنه مستقر أعلى S2 (${pivotS2.toFixed(2)} ج). تريث؛ ملاءة الشركة وأرباحها تحمي المركز ولا داعي للبيع الذعري أثناء الجلسة.`;
              } else {
                // Core stock breached S2 intraday
                action = 'INTRADAY_DIP_WATCH';
                alertLevel = 'WARNING';
                badgeText = '🟡 كسر دعم النواة S2 لحظياً';
                badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                advice = `🟡 كسر لحظي لدعم النواة S2 (${pivotS2 ? pivotS2.toFixed(2) + ' ج' : '--'}): لا تتسرع بالبيع العشوائي؛ انتظر تأكيد إغلاق الجلسة بعد 02:30 م للتأكد من سلوك المشتري.`;
              }
            } else {
              // Satellite speculative stock
              action = 'INTRADAY_DIP_WATCH';
              alertLevel = 'WARNING';
              badgeText = '🟡 كسر لحظي أثناء الجلسة';
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
              advice = `🟡 كسر لحظي أثناء الجلسة (السعر ${currentPrice.toFixed(2)} ج < S1 ${pivotS1.toFixed(2)} ج): لا تبع الآن! انتظر تأكيد إغلاق الجلسة بعد 02:30 م لتفادي مصيدة هزة الشجرة (Shakeout) من صانع السوق.`;
            }
          } else {
            // Session is closed: Confirmed daily close below support S1
            if (isCore) {
              if (pivotS2 && currentPrice >= pivotS2) {
                action = 'HOLD';
                alertLevel = 'WARNING';
                badgeText = '🛡️ سهم نواة (أعلى S2)';
                badgeColor = 'bg-indigo-950/60 text-indigo-300 border border-indigo-600/50';
                advice = `سهم قيادي استثماري أغلق دون S1 (${pivotS1.toFixed(2)} ج) ولكنه متماسك أعلى S2 (${pivotS2.toFixed(2)} ج). احتفاظ هادئ ومراقبة التماسك؛ لا بيع عشوائي بخسارة طالما أرباح الشركة صلبة.`;
              } else {
                action = 'STOP_LOSS_CONFIRMED';
                alertLevel = 'CRITICAL_RISK';
                badgeText = '⚠️ كسر مؤكد لدعم النواة S2';
                badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                advice = `⚠️ تم تأكيد كسر الدعم الثاني S2 (${pivotS2 ? pivotS2.toFixed(2) + ' ج' : '--'}) بإغلاق الجلسة. يُنصح بتخفيف 50% لحماية المحفظة حتى يستعيد السهم مساره.`;
              }
            } else {
              action = 'STOP_LOSS_CONFIRMED';
              alertLevel = 'CRITICAL_RISK';
              badgeText = '🔴 تأكيد كسر الدعم بالإغلاق';
              badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
              advice = `🔴 تم تأكيد كسر الدعم S1 (${pivotS1.toFixed(2)} ج) بإغلاق الجلسة. سهم مضاربة تكتيكي: يُنصح بتفعيل الخروج (أو تخفيف 50%) لتأمين الكاش وتدويره في فرصة رابحة.`;
            }
          }
        }
        // Condition D: Systemic Shock Guardrail
        else if (marketRegime === 'SYSTEMIC_SHOCK') {
          action = 'DEFENSIVE_HOLD';
          alertLevel = 'CRITICAL_RISK';
          badgeText = 'حذر / صدمة سوقية';
          badgeColor = 'bg-rose-950/40 text-rose-300 border border-rose-800/40';
          advice = `السوق يمر بمرحلة صدمة سوقية (Systemic Shock Alert). يُحظر تعزيز المراكز المتراجعة وتجميد الشراء لحين استقرار المؤشرات.`;
        }
        // Condition E: Falling Knife Guardrail vs Disciplined Accumulate
        else if (rsi < 36 && pivotS1 && currentPrice >= pivotS1) {
          if (returnPct <= -7.0) {
            // STRICT GUARDRAIL: Never tell a user to average down on a bleeding stock (-7% or worse)
            action = 'DEFENSIVE_HOLD';
            alertLevel = 'WARNING';
            badgeText = '🚫 حظر تبريد / مراقبة ارتداد';
            badgeColor = 'bg-slate-800 text-amber-300 border border-amber-500/50 shadow-sm';
            advice = `⚠️ حظر التبريد: تراجع السهم (${returnPct.toFixed(1)}%) يمنع ضخ سيولة جديدة في مسار هابط رغم التشبع البيعي (RSI: ${rsi}). لا تشتري الآن؛ انتظر ارتداداً نحو المقاومة ${pivotR1 ? pivotR1.toFixed(2) + ' ج' : 'R1'} لتخفيف 50% وتدوير الكاش.`;
          } else if (isCore) {
            // Mild dip in a fundamentally strong core stock
            action = 'ACCUMULATE';
            alertLevel = 'ACCUMULATE';
            badgeText = 'تجميع لتخفيض المتوسط';
            badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
            advice = `تشبع بيعي (RSI: ${rsi}) أعلى الدعم S1 (${pivotS1.toFixed(2)} ج) لسهم قيادي بتراجع طفيف (${returnPct.toFixed(1)}%). مناسب للتجميع التدريجي المنضبط.`;
          } else {
            action = 'HOLD';
            alertLevel = 'NORMAL';
            badgeText = 'احتفاظ مضاربي حذر';
            badgeColor = 'bg-slate-800 text-slate-300 border border-slate-700';
            advice = `تشبع بيعي في سهم تكتيكي؛ يُفضل التريث والاحتفاظ دون تبريد لحين ظهور مشتري مؤكد.`;
          }
        }
        // Condition F: Default losing hold
        else {
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
          badgeText = '🎯 بلوغ الهدف R1';
          badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm';
          const prospects = (typeof this.calculateTrailingStopAndR2Prospects === 'function')
            ? this.calculateTrailingStopAndR2Prospects({
                currentPrice,
                buyPrice,
                pivotR1,
                pivotR2,
                pivotS1,
                rsi,
                tradedValue: cleanNum(asset.tradedValue),
                volumeMultiplier: asset.volumeMultiplier,
                category: asset.category
              })
            : null;
          if (prospects) {
            advice = prospects.adviceText;
          } else {
            advice = `وصول لمستوى المقاومة R1 (${pivotR1.toFixed(2)} ج) مع عائد (+${returnPct.toFixed(1)}%). يُنصح بتأمين أرباح جزئية وإعادة تدوير السيولة.`;
          }
        } else if (returnPct >= 18) {
          action = 'REBALANCE_CANDIDATE';
          alertLevel = 'TARGET_HIT';
          badgeText = '🎯 جني أرباح طفرة';
          badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          advice = `السهم حقق مكاسب قوية (+${returnPct.toFixed(1)}%). يُنصح بتأمين جزء من الأرباح لحماية المكاسب المحققة.`;
        } else if (pivotS1 && currentPrice < pivotS1) {
          // Winning or Breakeven position pulling back below Technical Pivot S1
          if (session.isOpen) {
            if (isCore && pivotS2 && currentPrice >= pivotS2) {
              action = 'CORE_BUFFER_WATCH';
              alertLevel = 'NORMAL';
              badgeText = '🛡️ وسادة أمان النواة الاستثمارية';
              badgeColor = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
              advice = `🛡️ سهم قيادي من النواة: السعر (${currentPrice.toFixed(2)} ج) يتداول أعلى سعر شرائك (${buyPrice > 0 ? buyPrice.toFixed(2) + ' ج' : 'الأساسي'}) ولكنه دون S1 (${pivotS1.toFixed(2)} ج) لحظياً مع تماسكه أعلى S2. تريث؛ ملاءة الشركة وأرباحها تحمي المركز ولا داعي للبيع الذعري أثناء الجلسة.`;
            } else {
              action = 'INTRADAY_DIP_WATCH';
              alertLevel = 'WARNING';
              badgeText = '🟡 تراجع فني أسفل الدعم S1';
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
              advice = `🟡 تراجع فني أثناء الجلسة: السعر (${currentPrice.toFixed(2)} ج) دون مستوى الدعم S1 (${pivotS1.toFixed(2)} ج) ولكنه أعلى سعر شرائك محققاً (+${returnPct.toFixed(1)}%). تريث وراقب تماسك السهم حتى إغلاق الجلسة لتفادي مصيدة هزة الشجرة.`;
            }
          } else {
            action = 'TRAILING_PROTECT';
            alertLevel = 'WARNING';
            badgeText = '🛡️ حماية أرباح المركز';
            badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
            advice = `أغلق السهم دون مستوى الدعم S1 (${pivotS1.toFixed(2)} ج) مع الحفاظ على عائد (+${returnPct.toFixed(1)}%). يُنصح برفع خط الحماية إلى سعر الدخول لتأمين المكسب دون بيع متعجل.`;
          }
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

      const verdict = this.buildUnifiedVerdict({
        action,
        alertLevel,
        badgeText,
        badgeColor,
        advice,
        isLosing,
        returnPct,
        buyPrice,
        currentPrice,
        isCore,
        emergency
      });

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
        advice,
        isCore,
        emergency,
        verdict
      };
    },

    /**
     * Unified Guaranteed Verdict Tuple Generator with Circuit Breaker
     * Locks Title, Badge, Color, Advice, ButtonText, ButtonAction into an unbreakable tuple
     */
    buildUnifiedVerdict: function (params) {
      if (!params || typeof params !== 'object') {
        return {
          title: 'احتفاظ استثماري ومتابعة متوازنة ⚪',
          color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
          badge: 'احتفاظ',
          advice: 'السهم يتحرك داخل نطاق سعري وفني آمن بين مستويات الدعم والمقاومة.',
          buttonText: 'احتفاظ وتحديث المحفظة 👁️',
          buttonAction: 'HOLD',
          buttonClass: 'bg-slate-700 hover:bg-slate-600'
        };
      }

      const {
        action = 'HOLD',
        alertLevel = 'NORMAL',
        badgeText = 'احتفاظ',
        badgeColor = 'bg-gray-800 text-gray-300',
        advice = 'احتفاظ هادئ ومتابعة حركة السعر داخل النطاق الطبيعي.',
        isLosing = false,
        returnPct = 0,
        buyPrice = 0,
        currentPrice = 0,
        isCore = false
      } = params;

      let title = 'احتفاظ استثماري ومتابعة متوازنة ⚪';
      let color = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      let badge = badgeText || 'احتفاظ';
      let buttonText = 'احتفاظ وتحديث المحفظة 👁️';
      let buttonAction = 'HOLD';
      let buttonClass = 'bg-slate-700 hover:bg-slate-600';

      switch (action) {
        case 'EMERGENCY_STOP_LOSS':
          title = 'خروج طارئ فوري (انهيار حاد) 🚨';
          color = 'bg-rose-950/80 text-rose-200 border border-rose-500 animate-pulse';
          badge = 'وقف خسارة طارئ';
          buttonText = 'سأنفذ الخروج الطارئ فوراً ⚡';
          buttonAction = 'SELL';
          buttonClass = 'bg-rose-700 hover:bg-rose-600';
          break;

        case 'INTRADAY_DIP_WATCH':
          title = isLosing 
            ? 'تريث ومراقبة: كسر لحظي أثناء الجلسة 🟡' 
            : 'تريث ومراقبة: تراجع أسفل الدعم S1 🟡';
          color = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          badge = isLosing ? 'كسر لحظي (انتظر الإغلاق)' : 'مراقبة الدعم';
          buttonText = 'تريث ومتابعة حركة السهم 👁️';
          buttonAction = 'HOLD';
          buttonClass = 'bg-amber-600 hover:bg-amber-500';
          break;

        case 'CORE_BUFFER_WATCH':
          title = 'وسادة أمان النواة الاستثمارية 🛡️';
          color = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
          badge = 'وسادة أمان S2';
          buttonText = 'احتفاظ هادئ بمحفظة النواة 🛡️';
          buttonAction = 'HOLD';
          buttonClass = 'bg-blue-600 hover:bg-blue-500';
          break;

        case 'DEFENSIVE_HOLD':
          title = 'حظر التبريد ومراقبة ارتداد لتخفيف المركز 🚫';
          color = 'bg-slate-800 text-amber-300 border border-amber-600/40';
          badge = 'حظر التبريد';
          buttonText = 'تريث ومراقبة الارتداد ⏸️';
          buttonAction = 'HOLD';
          buttonClass = 'bg-slate-700 hover:bg-slate-600';
          break;

        case 'STOP_LOSS_CONFIRMED':
          title = 'تأكيد كسر الدعم بالإغلاق وحماية رأس المال 🔴';
          color = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
          badge = 'كسر مؤكد بالإغلاق';
          buttonText = 'سأنفذ الخروج ووقف الخسارة ⚡';
          buttonAction = 'SELL';
          buttonClass = 'bg-rose-600 hover:bg-rose-500';
          break;

        case 'REBALANCE_CANDIDATE':
          if (isLosing) {
            title = 'تدوير وتخفيف عند الارتداد 🔄';
            color = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
            badge = 'تخفيف ارتداد';
            buttonText = 'سأنفذ التخفيف وتدوير الكاش 🔄';
            buttonAction = 'SELL';
            buttonClass = 'bg-amber-600 hover:bg-amber-500';
          } else {
            title = 'تأمين أرباح القمة وتكبير الأسهم مجاناً 🟡';
            color = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
            badge = 'جني أرباح جزئي';
            buttonText = 'سأنفذ البيع وتأمين الأرباح ⚡';
            buttonAction = 'SELL';
            buttonClass = 'bg-amber-600 hover:bg-amber-500';
          }
          break;

        case 'TRAILING_PROTECT':
          title = 'حماية وتأمين أرباح المركز 🛡️';
          color = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          badge = 'حماية أرباح';
          buttonText = 'سأنفذ تأمين الأرباح ⚡';
          buttonAction = 'SELL';
          buttonClass = 'bg-amber-600 hover:bg-amber-500';
          break;

        case 'ACCUMULATE':
          title = 'فرصة اقتناص وتخفيض متوسط التكلفة 🟢';
          color = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          badge = 'شراء / تعزيز قاع';
          buttonText = 'سأنفذ الشراء وتحديث المحفظة ⚡';
          buttonAction = 'BUY';
          buttonClass = 'bg-emerald-600 hover:bg-emerald-500';
          break;

        case 'HOLD':
        default:
          if (isLosing) {
            title = 'احتفاظ ومراقبة الارتداد ⚪';
            color = 'bg-slate-800 text-slate-300 border border-slate-700';
            badge = 'احتفاظ هادئ';
            buttonText = 'احتفاظ ومراقبة الارتداد 👁️';
            buttonAction = 'HOLD';
            buttonClass = 'bg-slate-700 hover:bg-slate-600';
          } else {
            title = 'احتفاظ استثماري ومتابعة متوازنة ⚪';
            color = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
            badge = 'احتفاظ';
            buttonText = 'استمرار الاحتفاظ ومتابعة الصعود 👁️';
            buttonAction = 'HOLD';
            buttonClass = 'bg-slate-700 hover:bg-slate-600';
          }
          break;
      }

      // Runtime Conflict Guardrail (Circuit Breaker)
      // Automatically detect and reconcile any polarity conflict between title and advice
      const isTitleLoss = /خسارة|كسر|خروج|انهيار/.test(title);
      const isAdvicePureGain = /أرباح|مكاسب|إيجابي|صاعد|طفرة/.test(advice) && !/تخفيف|تأمين|حماية|ارتداد/.test(advice);
      const isTitleGain = /أرباح|طفرة|شراء|تجميع/.test(title);
      const isAdvicePureLoss = /خسارة|كسر مؤكد|نزيف|حظر/.test(advice);

      if ((isTitleLoss && isAdvicePureGain) || (isTitleGain && isAdvicePureLoss)) {
        title = 'تريث ومراقبة فنية: تدقيق مسار السعر 🟡';
        badge = 'تدقيق الأمان';
        color = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
        buttonText = 'تريث ومتابعة الجلسة 👁️';
        buttonAction = 'HOLD';
        buttonClass = 'bg-amber-600 hover:bg-amber-500';
      }

      return {
        title,
        color,
        badge,
        advice,
        buttonText,
        buttonAction,
        buttonClass
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
     * Institutional 3-Tranche DCA Accumulation Planner
     * Tranche 1: 40% of cash deployed at current support (S1)
     * Tranche 2: 30% of cash deployed on confirmed bounce (+2.5% from support)
     * Tranche 3: 30% of cash deployed on breakout/reclaiming pivot point (PP)
     */
    calculateThreeTrancheDCA: function (params) {
      params = params || {};
      const totalCash = Number(params.totalCash) || 0;
      const currentPrice = Number(params.currentPrice) || 0;
      const supportPrice = Number(params.supportPrice) || Number((currentPrice * 0.97).toFixed(2));
      const pivotPP = Number(params.pivotPP) || Number((currentPrice * 1.03).toFixed(2));
      const existingShares = parseInt(params.existingShares, 10) || 0;
      const existingAvgCost = Number(params.existingAvgCost) || currentPrice;

      if (totalCash <= 0 || currentPrice <= 0) {
        return null;
      }

      // Tranche 1: 40% of cash at current price (near S1)
      const cashT1 = Math.round(totalCash * 0.40);
      const sharesT1 = Math.floor(cashT1 / currentPrice);
      const actualCashT1 = Math.round(sharesT1 * currentPrice);
      const totalCostAfterT1 = (existingShares * existingAvgCost) + actualCashT1;
      const totalSharesAfterT1 = existingShares + sharesT1;
      const avgAfterT1 = totalSharesAfterT1 > 0 ? Number((totalCostAfterT1 / totalSharesAfterT1).toFixed(2)) : currentPrice;

      // Tranche 2: 30% of cash on confirmation bounce (+2.5% from support or current)
      const priceT2 = Number((supportPrice * 1.025).toFixed(2));
      const cashT2 = Math.round(totalCash * 0.30);
      const sharesT2 = priceT2 > 0 ? Math.floor(cashT2 / priceT2) : 0;
      const actualCashT2 = Math.round(sharesT2 * priceT2);
      const totalCostAfterT2 = totalCostAfterT1 + actualCashT2;
      const totalSharesAfterT2 = totalSharesAfterT1 + sharesT2;
      const avgAfterT2 = totalSharesAfterT2 > 0 ? Number((totalCostAfterT2 / totalSharesAfterT2).toFixed(2)) : avgAfterT1;

      // Tranche 3: 30% of cash on breakout above Pivot Point (PP confirmation)
      const priceT3 = pivotPP > currentPrice ? pivotPP : Number((currentPrice * 1.04).toFixed(2));
      const cashT3 = totalCash - actualCashT1 - actualCashT2;
      const sharesT3 = priceT3 > 0 ? Math.floor(cashT3 / priceT3) : 0;
      const actualCashT3 = Math.round(sharesT3 * priceT3);
      const totalCostAfterT3 = totalCostAfterT2 + actualCashT3;
      const totalSharesAfterT3 = totalSharesAfterT2 + sharesT3;
      const finalAvgCost = totalSharesAfterT3 > 0 ? Number((totalCostAfterT3 / totalSharesAfterT3).toFixed(2)) : avgAfterT2;

      const totalNewShares = sharesT1 + sharesT2 + sharesT3;
      const totalActualCash = actualCashT1 + actualCashT2 + actualCashT3;
      const totalReductionEgp = Number((existingAvgCost - finalAvgCost).toFixed(2));
      const totalReductionPct = existingAvgCost > 0 ? Number(((totalReductionEgp / existingAvgCost) * 100).toFixed(1)) : 0;

      return {
        totalCash,
        totalActualCash,
        totalNewShares,
        initialAvgCost: existingAvgCost,
        finalAvgCost,
        totalReductionEgp,
        totalReductionPct,
        tranches: [
          {
            step: 1,
            name: "الدفعة 1: تثبيت القاع والتمركز",
            weightPct: 40,
            allocationCash: actualCashT1,
            targetPrice: currentPrice,
            shares: sharesT1,
            condition: "تنفذ فوراً عند السعر الحالي قرب الدعم S1 لبدء تثبيت المركز.",
            status: "READY_NOW",
            avgCostResult: avgAfterT1
          },
          {
            step: 2,
            name: "الدفعة 2: تأكيد التماسك والارتداد",
            weightPct: 30,
            allocationCash: actualCashT2,
            targetPrice: priceT2,
            shares: sharesT2,
            condition: "تُعلق حتى ظهور شمعة انعكاسية خضراء أو إغلاق أعلى قاع اليوم السابق.",
            status: "WAITING_BOUNCE",
            avgCostResult: avgAfterT2
          },
          {
            step: 3,
            name: "الدفعة 3: استعادة الاتجاه الصاعد",
            weightPct: 30,
            allocationCash: actualCashT3,
            targetPrice: priceT3,
            shares: sharesT3,
            condition: "تُنفذ عند اختراق واستقرار السعر أعلى نقطة الارتكاز المحورية (PP).",
            status: "WAITING_BREAKOUT",
            avgCostResult: finalAvgCost
          }
        ]
      };
    },

    /**
     * Generate Actionable Daily Hub Plan for Busy Investors
     */
    generateDailyActionHub: function (portfolioData, fullMarketRadar, cashBalance) {
      portfolioData = Array.isArray(portfolioData) ? portfolioData : [];
      fullMarketRadar = Array.isArray(fullMarketRadar) ? fullMarketRadar : [];
      cashBalance = Number(cashBalance) || 0;

      // Extract funds cash (tracked separately from pure cash)
      const ncsItem = portfolioData.find(p => p.ticker === 'NCS');
      const bsbItem = portfolioData.find(p => p.ticker === 'BSB');
      const fundsTotal = (ncsItem ? Number(ncsItem.value || 0) : 0) + (bsbItem ? Number(bsbItem.value || 0) : 0);
      const totalDryPowder = cashBalance; // Pure cash only - investment funds excluded per user requirement

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

        // Generate 3-Tranche DCA Accumulation Plan
        const dcaPlan = (typeof this.calculateThreeTrancheDCA === 'function')
          ? this.calculateThreeTrancheDCA({
              totalCash: suggestedCash,
              currentPrice: curPrice,
              supportPrice: preferredDip.pivotS1 || Number((curPrice * 0.97).toFixed(2)),
              pivotPP: preferredDip.pp || Number((curPrice * 1.025).toFixed(2)),
              existingShares: currentShares,
              existingAvgCost: buyPrice
            })
          : null;

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
          dcaPlan: dcaPlan,
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
          totalDryPowder: cashBalance,
          summaryText: `لديك ${Math.round(cashBalance).toLocaleString('en-US')} ج.م كاش حر متاح لاقتناص الفرص وتعزيز المراكز.`
        },
        buyCandidate,
        profitCandidate,
        safetyAlert
      };
    },

    /**
     * Institutional DCF & DDM Fair Value Engine
     * Tailored for EGX dynamics (CBE rates, Egyptian inflation, and sector multiples).
     */
    calculateDCF: function (params) {
      params = params || {};
      const fcf0 = Number(params.fcf0) || 0;
      const growthRate = (Number(params.growthRate) || 18) / 100;
      const discountRate = (Number(params.discountRate) || 22) / 100;
      const terminalGrowth = (Number(params.terminalGrowth) || 7) / 100;
      const netDebt = Number(params.netDebt) || 0;
      const sharesCount = Number(params.sharesCount) || 1;
      const currentPrice = Number(params.currentPrice) || 0;
      const isFinancial = !!params.isFinancial;

      const effectiveSpread = Math.max(0.015, discountRate - terminalGrowth);

      let projectedCashFlows = [];
      let discountedCashFlows = [];
      let sumPV = 0;
      let currentFCF = fcf0;

      for (let year = 1; year <= 5; year++) {
        currentFCF = currentFCF * (1 + growthRate);
        const pv = currentFCF / Math.pow(1 + discountRate, year);
        projectedCashFlows.push(Number(currentFCF.toFixed(2)));
        discountedCashFlows.push(Number(pv.toFixed(2)));
        sumPV += pv;
      }

      const terminalValue = (currentFCF * (1 + terminalGrowth)) / effectiveSpread;
      const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);

      const enterpriseValue = sumPV + pvTerminalValue;
      const equityValue = isFinancial ? enterpriseValue : (enterpriseValue - netDebt);
      const fairValuePerShare = sharesCount > 0 ? Number((Math.max(0.01, equityValue / sharesCount)).toFixed(2)) : 0;

      let marginOfSafetyPct = 0;
      let status = 'FAIR';
      let statusAr = 'تقييم عادل ومتوازن';
      let statusBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';

      if (currentPrice > 0) {
        marginOfSafetyPct = Number((((fairValuePerShare - currentPrice) / currentPrice) * 100).toFixed(1));
        if (marginOfSafetyPct >= 20) {
          status = 'UNDERVALUED';
          statusAr = `فرصة استثمارية مغرية (أرخص بـ ${marginOfSafetyPct}% من القيمة العادلة)`;
          statusBadge = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
        } else if (marginOfSafetyPct <= -15) {
          status = 'OVERVALUED';
          statusAr = `سعر متضخم أعلى من القيمة العادلة بـ ${Math.abs(marginOfSafetyPct)}%`;
          statusBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
        } else {
          status = 'FAIR';
          statusAr = `يتداول قرب القيمة العادلة (فارق ${marginOfSafetyPct >= 0 ? '+' : ''}${marginOfSafetyPct}%)`;
          statusBadge = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
        }
      }

      // Sensitivity Table (+/- 2% on discount rate and growth rate)
      const sensitivity = [];
      const discountShifts = [-0.02, 0, 0.02];
      const growthShifts = [-0.02, 0, 0.02];

      discountShifts.forEach(ds => {
        const dRate = discountRate + ds;
        const row = { discountRatePct: Number((dRate * 100).toFixed(1)), values: [] };
        growthShifts.forEach(gs => {
          const gRate = growthRate + gs;
          let sSum = 0;
          let sFCF = fcf0;
          for (let y = 1; y <= 5; y++) {
            sFCF = sFCF * (1 + gRate);
            sSum += sFCF / Math.pow(1 + dRate, y);
          }
          const sSpread = Math.max(0.015, dRate - terminalGrowth);
          const sTV = (sFCF * (1 + terminalGrowth)) / sSpread;
          const sPVTV = sTV / Math.pow(1 + dRate, 5);
          const sEV = sSum + sPVTV;
          const sEq = isFinancial ? sEV : (sEV - netDebt);
          const sFV = sharesCount > 0 ? Number((Math.max(0.01, sEq / sharesCount)).toFixed(2)) : 0;
          row.values.push({
            growthRatePct: Number((gRate * 100).toFixed(1)),
            fairValue: sFV
          });
        });
        sensitivity.push(row);
      });

      return {
        fcf0,
        growthRatePct: Number((growthRate * 100).toFixed(1)),
        discountRatePct: Number((discountRate * 100).toFixed(1)),
        terminalGrowthPct: Number((terminalGrowth * 100).toFixed(1)),
        projectedCashFlows,
        discountedCashFlows,
        sumPVDiscountedFlows: Number(sumPV.toFixed(2)),
        terminalValue: Number(terminalValue.toFixed(2)),
        pvTerminalValue: Number(pvTerminalValue.toFixed(2)),
        enterpriseValue: Number(enterpriseValue.toFixed(2)),
        equityValue: Number(equityValue.toFixed(2)),
        fairValuePerShare,
        currentPrice,
        marginOfSafetyPct,
        status,
        statusAr,
        statusBadge,
        sensitivity
      };
    },

    /**
     * Quantitative Benchmark Alpha Tracker
     * Computes Alpha (α), Beta (β), and Sharpe Ratio against EGX30 and Egyptian Risk-Free Rate.
     */
    calculatePortfolioAlpha: function (portfolioReturnPct, marketReturnPct, riskFreeRatePct, beta) {
      portfolioReturnPct = Number(portfolioReturnPct) || 0;
      marketReturnPct = Number(marketReturnPct) || 0;
      riskFreeRatePct = Number(riskFreeRatePct) || 22.4;
      beta = Number(beta) || 0.85;

      const expectedReturn = riskFreeRatePct + (beta * (marketReturnPct - riskFreeRatePct));
      const alpha = Number((portfolioReturnPct - expectedReturn).toFixed(2));
      const excessReturn = Number((portfolioReturnPct - riskFreeRatePct).toFixed(2));
      const estimatedVolatility = Math.max(5.0, 16.0 * Math.max(0.4, beta));
      const sharpeRatio = Number(((portfolioReturnPct - riskFreeRatePct) / estimatedVolatility).toFixed(2));

      let alphaVerdict = 'أداء متوازن مع السوق';
      let alphaBadge = 'bg-gray-800 text-gray-300 border border-gray-700';

      if (alpha > 3.0) {
        alphaVerdict = `تفوق استثنائي على مؤشر البورصة ومعدل الفائدة (ألفا إيجابية +${alpha}%)`;
        alphaBadge = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
      } else if (alpha < -3.0) {
        alphaVerdict = `أداء دون المؤشر (ألفا سالبة ${alpha}%) • يُنصح بمراجعة تخصيص المراكز وزيادة نسبة الكاش وصناديق السيولة`;
        alphaBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
      } else {
        alphaVerdict = `أداء متقارب مع السوق وصناديق السيولة (ألفا ${alpha >= 0 ? '+' : ''}${alpha}%)`;
        alphaBadge = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      }

      return {
        portfolioReturnPct,
        marketReturnPct,
        riskFreeRatePct,
        beta,
        expectedReturn: Number(expectedReturn.toFixed(2)),
        alpha,
        excessReturn,
        sharpeRatio,
        estimatedVolatility: Number(estimatedVolatility.toFixed(1)),
        alphaVerdict,
        alphaBadge
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
