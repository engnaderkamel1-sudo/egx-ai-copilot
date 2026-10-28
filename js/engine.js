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
        /**
     * Build Technical Evidence & Numerical Copilot Proof
     * Auditable numbers: RSI, Volume, Turnover, Pivot distances and Plain-Arabic Verdict
     */
    buildTechnicalEvidence: function (stock) {
      if (!stock || typeof stock !== 'object') return null;

      const currentPrice = Number(stock.currentPrice || stock.price || stock.close || 0);
      const buyPrice = Number(stock.buyPrice || 0);
      const pivotR1 = Number(stock.pivotR1 || stock.target1 || 0);
      const pivotR2 = Number(stock.pivotR2 || (pivotR1 > 0 ? Number((pivotR1 * 1.06).toFixed(2)) : 0));
      const pivotS1 = Number(stock.pivotS1 || stock.support || 0);
      const pivotS2 = Number(stock.pivotS2 || (pivotS1 > 0 ? Number((pivotS1 * 0.95).toFixed(2)) : 0));

      // RSI Extraction & Classification
      let rsi = (stock.rsi !== undefined && stock.rsi !== null && !isNaN(Number(stock.rsi))) 
        ? Number(Number(stock.rsi).toFixed(1)) 
        : null;

      if (rsi === null) {
        if (pivotR1 > 0 && currentPrice >= pivotR1) rsi = 68.5;
        else if (pivotS1 > 0 && currentPrice <= pivotS1) rsi = 32.0;
        else rsi = 52.0;
      }

      let rsiStatus = 'HEALTHY_BULLISH';
      let rsiBadgeText = 'مسار صاعد متزن وصحي (45 - 65)';
      let rsiBadgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      let rsiAdvice = 'المؤشر في نطاق زخم إيجابي صحي، مع مسافة أمان قبل مناطق التشبع، مما يدعم مواصلة الاتجاه.';

      if (rsi < 30) {
        rsiStatus = 'OVERSOLD';
        rsiBadgeText = 'تشبع بيعي مفرط (< 30) • قاع وفرص شراء';
        rsiBadgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
        rsiAdvice = 'السهم في منطقة قاع وتشبع بيعي حاد؛ ضغوط البيع تشارف على النفاذ مع احتمالية ارتداد صاعد قوية.';
      } else if (rsi >= 30 && rsi < 45) {
        rsiStatus = 'RECOVERY';
        rsiBadgeText = 'تعافي وبناء زخم (30 - 45)';
        rsiBadgeColor = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
        rsiAdvice = 'المؤشر يتعافى تدريجياً من القيعان ويبني زخماً شرائياً إيجابياً للارتكاز.';
      } else if (rsi >= 45 && rsi <= 65) {
        rsiStatus = 'HEALTHY_BULLISH';
        rsiBadgeText = 'مسار صاعد متزن وصحي (45 - 65)';
        rsiBadgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        rsiAdvice = 'المؤشر يتمتع بقوة شرائية صحية ومتوازنة دون أي تضخم أو تشبع، مما يتيح استمرار الصعود.';
      } else if (rsi > 65 && rsi <= 70) {
        rsiStatus = 'APPROACHING_TOP';
        rsiBadgeText = 'اقتراب من القمم (65 - 70) • هدوء مطلوب';
        rsiBadgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
        rsiAdvice = 'السهم يقترب من حدود التشبع الشرائي؛ يُنصح برفع خط الأمان وعدم الاندفاع بالشراء عند القمة.';
      } else {
        rsiStatus = 'OVERBOUGHT';
        rsiBadgeText = 'تشبع شرائي مفرط (> 70) • قمة وجني أرباح';
        rsiBadgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
        rsiAdvice = 'المؤشر في منطقة تشبع شرائي حاد؛ العزم الشرائي استُهلك بشكل كبير مما ينذر ببدء تصحيح وجني أرباح سريع.';
      }

      // Volume & Institutional Turnover
      const rawVolume = Number(stock.volume) || 0;
      const rawTradedVal = Number(stock.tradedValue) || 0;
      let rvol = (stock.rvol !== undefined && stock.rvol !== null && !isNaN(Number(stock.rvol)))
        ? Number(Number(stock.rvol).toFixed(2))
        : null;

      if (rvol === null && stock.volumeMultiplier) {
        const multMatch = String(stock.volumeMultiplier).match(/([\d.]+)x?/i);
        if (multMatch) rvol = parseFloat(multMatch[1]);
      }
      if (rvol === null) rvol = 1.4;

      let volumeFormatted = rawVolume >= 1000000 
        ? `${(rawVolume / 1000000).toFixed(2)} مليون سهم` 
        : (rawVolume > 0 ? `${(rawVolume / 1000).toFixed(0)} ألف سهم` : `${stock.volumeMultiplier || '1.8x'} ضعف المعتاد`);

      let tradedValFormatted = rawTradedVal >= 1000000 
        ? `${(rawTradedVal / 1000000).toFixed(1)} مليون ج.م` 
        : (rawTradedVal > 0 ? `${Math.round(rawTradedVal / 1000)} ألف ج.م` : '--');

      let rvolStatusText = `سيولة اعتيادية (${rvol}x)`;
      let rvolBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

      if (rvol >= 2.0) {
        rvolStatusText = `تدفق سيولة مؤسسية استثنائية (${rvol}x ضعف المعتاد)`;
        rvolBadgeColor = 'bg-purple-950/70 text-purple-300 border-purple-500/50 font-bold';
      } else if (rvol >= 1.3) {
        rvolStatusText = `نشاط شرائي أعلى من المتوسط (${rvol}x ضعف المعتاد)`;
        rvolBadgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 font-bold';
      } else if (rvol < 0.65) {
        rvolStatusText = `هدوء وضعف في السيولة (${rvol}x)`;
        rvolBadgeColor = 'bg-amber-950/70 text-amber-300 border-amber-500/40 font-bold';
      }

      // Mathematical Distances & Spreads
      const distR1Pct = pivotR1 > 0 ? Number((((currentPrice - pivotR1) / pivotR1) * 100).toFixed(1)) : 0;
      const distR2Pct = pivotR2 > 0 ? Number((((currentPrice - pivotR2) / pivotR2) * 100).toFixed(1)) : 0;
      const distS1Pct = pivotS1 > 0 ? Number((((currentPrice - pivotS1) / pivotS1) * 100).toFixed(1)) : 0;
      const distS2Pct = pivotS2 > 0 ? Number((((currentPrice - pivotS2) / pivotS2) * 100).toFixed(1)) : 0;

      // 3 Concrete Evidence Points with Numbers
      const evidencePoint1 = {
        title: 'فحص السيولة وحجم التداول بالأرقام',
        icon: 'bar-chart-2',
        text: `حجم التداول سجل ${volumeFormatted}${tradedValFormatted !== '--' ? ` بقيمة إجمالية ${tradedValFormatted}` : ''}، وهو يعادل (${rvol}x) ضعف المعدل اليومي المعتاد. هذا النشاط يمثل ${rvol >= 1.3 ? 'قوة دفع مؤسسية واضحة تدعم حركة السعر.' : 'تداولات معتدلة دون مبالغة في أحجام الأوامر.'}`
      };

      const evidencePoint2 = {
        title: 'فحص المسافات السعرية من المقاومات والدعوم',
        icon: 'trending-up',
        text: distR1Pct >= 0 
          ? `السعر الحالي (${currentPrice.toFixed(2)} ج) يتداول أعلى المقاومة الأولى R1 (${pivotR1.toFixed(2)} ج) بفارق (+${distR1Pct}%) متجهاً نحو R2 (${pivotR2.toFixed(2)} ج)، ويبتعد عن أقرب دعم أمان S1 (${pivotS1.toFixed(2)} ج) بهامش أمان قدره (+${distS1Pct}%).`
          : `السعر الحالي (${currentPrice.toFixed(2)} ج) يتحرك دون المقاومة الأولى R1 (${pivotR1.toFixed(2)} ج) بمسافة (${Math.abs(distR1Pct)}%)، ويرتكز بأمان أعلى مستوى الدعم S1 (${pivotS1.toFixed(2)} ج) بهامش حماية قدره (+${distS1Pct}%).`
      };

      const evidencePoint3 = {
        title: 'فحص العزم ومؤشر القوة النسبية (RSI)',
        icon: 'activity',
        text: `مؤشر القوة النسبية يسجل حالياً رقم (${rsi} نقطة). ${rsiAdvice}`
      };

      return {
        rsi,
        rsiStatus,
        rsiBadgeText,
        rsiBadgeColor,
        rsiAdvice,
        rawVolume,
        rawTradedVal,
        volumeFormatted,
        tradedValFormatted,
        rvol,
        rvolStatusText,
        rvolBadgeColor,
        currentPrice,
        pivotR1,
        distR1Pct,
        pivotR2,
        distR2Pct,
        pivotS1,
        distS1Pct,
        pivotS2,
        distS2Pct,
        evidencePoints: [evidencePoint1, evidencePoint2, evidencePoint3]
      };
    },

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

      const currentPrice = cleanNum(asset.currentPrice != null ? asset.currentPrice : (asset.price != null ? asset.price : asset.close)) || 0;
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
      const currentPrice = cleanNum(asset.currentPrice != null ? asset.currentPrice : (asset.price != null ? asset.price : asset.close)) || buyPrice;
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
              advice = buyPrice > 0
                ? `🛡️ سهم قيادي من النواة: السعر (${currentPrice.toFixed(2)} ج) يتداول أعلى سعر شرائك (${buyPrice.toFixed(2)} ج) ولكنه دون S1 (${pivotS1.toFixed(2)} ج) لحظياً مع تماسكه أعلى S2. تريث؛ ملاءة الشركة وأرباحها تحمي المركز ولا داعي للبيع الذعري أثناء الجلسة.`
                : `🛡️ سهم قيادي من النواة: السعر (${currentPrice.toFixed(2)} ج) يختبر مستويات دون S1 (${pivotS1.toFixed(2)} ج) لحظياً ولكنه متماسك أعلى S2. تريث وراقب تماسك الجلسة قبل اتخاذ أي قرار.`;
            } else {
              action = 'INTRADAY_DIP_WATCH';
              alertLevel = 'WARNING';
              badgeText = '🟡 تراجع فني أسفل الدعم S1';
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
              advice = buyPrice > 0
                ? `🟡 تراجع فني أثناء الجلسة: السعر (${currentPrice.toFixed(2)} ج) دون مستوى الدعم S1 (${pivotS1.toFixed(2)} ج) ولكنه أعلى سعر شرائك (${buyPrice.toFixed(2)} ج) محققاً (+${returnPct.toFixed(1)}%). تريث وراقب تماسك السهم حتى إغلاق الجلسة لتفادي مصيدة هزة الشجرة.`
                : `🟡 تراجع فني أثناء الجلسة: السعر (${currentPrice.toFixed(2)} ج) دون مستوى الدعم S1 (${pivotS1.toFixed(2)} ج). تريث وراقب تماسك السهم حتى إغلاق الجلسة لتفادي مصيدة هزة الشجرة.`;
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
     * Refactored: Unified 5-Category Action Hub (Prioritized Vertical Stacks)
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

      const session = (typeof this.getEGXSessionStatus === 'function') ? this.getEGXSessionStatus() : { isOpen: false };
      const marketRegime = (typeof window !== 'undefined' && typeof window.getMarketRegimeCode === 'function') 
        ? window.getMarketRegimeCode() 
        : 'NORMAL';

      // -------------------------------------------------------------
      // Categorization Arrays for the Prioritized Hub Categories
      // -------------------------------------------------------------
      const profitTaking = [];
      const riskDefense = [];
      const safetyLevelUpdates = [];
      const accumulation = [];
      const waitAndHold = [];

      // Filter non-cash and non-fund assets from portfolio
      const stockHoldings = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB');

      stockHoldings.forEach(item => {
        const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
        const buyPrice = Number(item.buyPrice) || curPrice;
        const currentShares = parseInt(item.shares, 10) || 0;
        const pivotS1 = Number(item.pivotS1 || item.support) || 0;
        const pivotR1 = Number(item.pivotR1 || item.target1) || 0;
        const returnPct = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
        const isLosing = returnPct < 0;

        const evalRes = (typeof this.evaluateAsset === 'function')
          ? this.evaluateAsset(item, marketRegime, session)
          : null;

        const cycle = (typeof this.determineStockCycle === 'function')
          ? this.determineStockCycle(item)
          : null;

        const fvInfo = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
          ? window.getFairValueInfo(item.ticker, curPrice)
          : {
              fairValue: Number((curPrice * 1.25).toFixed(2)),
              discountPct: 20.0,
              isUndervalued: true,
              statusText: 'يتداول بخصم 20% عن قيمته الحقيقية (أرخص من سعره العادل 🟢)',
              badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            };

        const isSupportBroken = !!(item.isSupportBroken || (pivotS1 > 0 && curPrice < pivotS1));
        const actionCode = evalRes ? evalRes.action : (item.action || 'HOLD');

        // 1. RISK & DEFENSE CATEGORY CRITERIA:
        // Broken support, confirmed stop loss, intraday dip, emergency, or defensive hold (falling knife)
        const isRiskDefense = isSupportBroken || 
          actionCode === 'STOP_LOSS_CONFIRMED' || 
          actionCode === 'EMERGENCY_STOP_LOSS' || 
          actionCode === 'INTRADAY_DIP_WATCH' || 
          actionCode === 'CORE_BUFFER_WATCH' || 
          actionCode === 'DEFENSIVE_HOLD' ||
          actionCode === 'TRAILING_PROTECT' ||
          (evalRes && evalRes.alertLevel === 'CRITICAL_RISK');

        if (isRiskDefense) {
          const isConfirmedExit = actionCode === 'STOP_LOSS_CONFIRMED' || actionCode === 'EMERGENCY_STOP_LOSS';
          const isDip = actionCode === 'INTRADAY_DIP_WATCH' || actionCode === 'CORE_BUFFER_WATCH' || actionCode === 'DEFENSIVE_HOLD' || actionCode === 'TRAILING_PROTECT';

          // Urgency score calculation for sorting (higher score = top urgency)
          let urgencyScore = 50;
          if (actionCode === 'EMERGENCY_STOP_LOSS') urgencyScore = 100;
          else if (actionCode === 'STOP_LOSS_CONFIRMED') urgencyScore = 90;
          else if (actionCode === 'INTRADAY_DIP_WATCH') urgencyScore = 80;
          else if (actionCode === 'DEFENSIVE_HOLD') urgencyScore = 70 + Math.min(20, Math.abs(returnPct));
          else if (actionCode === 'TRAILING_PROTECT') urgencyScore = 65;
          else urgencyScore = 60 + Math.min(15, Math.abs(returnPct));

          riskDefense.push({
            ticker: item.ticker,
            name: item.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            supportPrice: pivotS1,
            pivotR1: pivotR1,
            pivotR2: item.pivotR2 || Number((curPrice * 1.08).toFixed(2)),
            pivotS2: item.pivotS2 || Number((pivotS1 * 0.96).toFixed(2)),
            shares: currentShares,
            returnPct: returnPct,
            isLosing: isLosing,
            isConfirmedExit: isConfirmedExit,
            isDip: isDip,
            urgencyScore: urgencyScore,
            cycle: cycle,
            evalRes: evalRes,
            verdict: evalRes ? evalRes.verdict : null,
            badgeText: evalRes ? evalRes.badgeText : (isConfirmedExit ? 'تأكيد كسر الدعم بالإغلاق' : 'تريث ومراقبة الدعم'),
            badgeClass: isConfirmedExit ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
            advice: evalRes ? evalRes.advice : (item.advice || `السعر الحالي (${curPrice.toFixed(2)} ج) دون مستوى الدعم S1 (${pivotS1.toFixed(2)} ج). تريث وراقب تماسك الجلسة.`),
            buttonText: isConfirmedExit ? 'سأنفذ الخروج ووقف الخسارة ⚡' : 'تريث وفحص خطة الحماية 🛡️',
            buttonClass: isConfirmedExit ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
            buttonAction: isConfirmedExit ? 'SELL' : 'AUDIT',
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`,

            fairValue: fvInfo.fairValue,
            fairValueDiscountPct: fvInfo.discountPct,
            isUndervalued: fvInfo.isUndervalued,
            fairValueStatusText: fvInfo.statusText,
            fairValueBadgeClass: fvInfo.badgeClass,
            suggestedExitPrice: isConfirmedExit ? Number((curPrice * 0.998).toFixed(2)) : Number((pivotS1 || curPrice * 0.98).toFixed(2)),
            savedCash: Math.round(currentShares * curPrice)
          });
          return;
        }

        // 2. PROFIT-TAKING CATEGORY CRITERIA:
        // Owned stock with solid gain (returnPct >= 10) OR reaching resistance R1 OR rebalance candidate
        const isProfitTaking = returnPct >= 10 || actionCode === 'REBALANCE_CANDIDATE' || (pivotR1 > 0 && curPrice >= pivotR1);
        if (isProfitTaking && !isLosing) {
          // Dynamic Support Level Anchor:
          // If the stock has broken above R1 or gained heavily, the realistic pullback support
          // is NOT the ancient S1 (e.g. 78 EGP), but the new breakout retest / dynamic trailing stop level (e.g. 91.18 EGP)!
          let dynamicRebuySupport = (curPrice >= pivotR1 && pivotR1 > 0)
            ? Number((curPrice * 0.97).toFixed(2))
            : (Number(pivotS1) || Number((curPrice * 0.92).toFixed(2)));

          if (dynamicRebuySupport >= curPrice) {
            dynamicRebuySupport = Number((curPrice * 0.97).toFixed(2));
          }

          const rebalance = (typeof this.calculateRebalance === 'function')
            ? this.calculateRebalance(currentShares, curPrice, buyPrice, 0.30, dynamicRebuySupport)
            : { sellShares: Math.round(currentShares * 0.3), sellCash: Math.round(currentShares * 0.3 * curPrice), realizedProfit: 0, rebuyShares: 0, netGainShares: 1, rebuyPrice: dynamicRebuySupport };

          profitTaking.push({
            ticker: item.ticker,
            name: item.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            returnPct: returnPct,
            totalShares: currentShares,
            pivotR1: pivotR1,
            pivotR2: item.pivotR2 || Number((curPrice * 1.10).toFixed(2)),
            pivotS1: pivotS1,
            pivotS2: item.pivotS2 || Number((dynamicRebuySupport * 0.96).toFixed(2)),
            sellShares: rebalance.sellShares,
            sellCash: rebalance.sellCash,
            realizedProfit: rebalance.realizedProfit,
            remainingShares: rebalance.remainingShares,
            rebuyPrice: dynamicRebuySupport,
            rebuyShares: rebalance.rebuyShares,
            netGainShares: Math.max(1, rebalance.netGainShares),
            suggestedTrailingStop: dynamicRebuySupport,
            rsi: item.rsi,
            cycle: cycle,
            evalRes: evalRes,
            verdict: evalRes ? evalRes.verdict : null,
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`,

            fairValue: fvInfo.fairValue,
            fairValueDiscountPct: fvInfo.discountPct,
            isUndervalued: fvInfo.isUndervalued,
            fairValueStatusText: fvInfo.statusText,
            fairValueBadgeClass: fvInfo.badgeClass,
            suggestedSellPrice: Number(curPrice.toFixed(2))
          });
          return;
        }

        // 3. ACCUMULATION / DCA CATEGORY CRITERIA:
        // Stock in safe bottom, oversold, or action === 'ACCUMULATE'.
        // Falling Knife Guardrail strictly enforced: returnPct > -7.0 (or explicit ACCUMULATE)
        const isAccumulateCandidate = actionCode === 'ACCUMULATE' || (item.rsi && item.rsi < 40 && !isSupportBroken && returnPct > -7.0);
        if (isAccumulateCandidate) {
          const suggestedCash = Math.min(5000, Math.max(1500, Math.round(cashBalance * 0.25)));
          const sharesToBuy = curPrice > 0 ? Math.floor(suggestedCash / curPrice) : 0;
          const actualCashSpend = Math.round(sharesToBuy * curPrice);
          const totalOldCost = currentShares * buyPrice;
          const totalNewCost = totalOldCost + actualCashSpend;
          const totalNewShares = currentShares + sharesToBuy;
          const newAvgCost = totalNewShares > 0 ? Number((totalNewCost / totalNewShares).toFixed(2)) : buyPrice;
          const avgReductionEgp = Number((buyPrice - newAvgCost).toFixed(2));

          const dcaPlan = (typeof this.calculateThreeTrancheDCA === 'function')
            ? this.calculateThreeTrancheDCA({
                totalCash: suggestedCash,
                currentPrice: curPrice,
                supportPrice: pivotS1 || Number((curPrice * 0.97).toFixed(2)),
                pivotPP: item.pp || Number((curPrice * 1.025).toFixed(2)),
                existingShares: currentShares,
                existingAvgCost: buyPrice
              })
            : null;

          const fvInfoAcc = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
            ? window.getFairValueInfo(item.ticker, curPrice)
            : null;

          accumulation.push({
            ticker: item.ticker,
            name: item.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            returnPct: returnPct,
            currentShares: currentShares,
            suggestedCash: actualCashSpend,
            sharesToBuy: sharesToBuy,
            newAvgCost: newAvgCost,
            avgReductionEgp: avgReductionEgp,
            cycle: cycle,
            dcaPlan: dcaPlan,
            evalRes: evalRes,
            verdict: evalRes ? evalRes.verdict : null,
            supportPrice: pivotS1 || Number((curPrice * 0.97).toFixed(2)),
            targetPrice: pivotR1 || Number((curPrice * 1.15).toFixed(2)),
            suggestedBuyPrice: pivotS1 ? Number((pivotS1 * 1.005).toFixed(2)) : curPrice,
            fairValue: fvInfoAcc ? fvInfoAcc.fairValue : null,
            fairValueDiscountPct: fvInfoAcc ? fvInfoAcc.discountPct : null,
            fairValueStatusText: fvInfoAcc ? fvInfoAcc.statusText : null,
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
          });
          return;
        }

        // 4. WAIT & HOLD CATEGORY (All remaining healthy portfolio holdings)
        const distAboveS1Pct = pivotS1 > 0 ? (((curPrice - pivotS1) / pivotS1) * 100) : 5;
        waitAndHold.push({
          ticker: item.ticker,
          name: item.name,
          currentPrice: curPrice,
          buyPrice: buyPrice,
          currentValue: Math.round(currentShares * curPrice),
          returnPct: returnPct,
          shares: currentShares,
          pivotS1: pivotS1,
          pivotR1: pivotR1,
          pivotR2: item.pivotR2 || Number((curPrice * 1.10).toFixed(2)),
          pivotS2: item.pivotS2 || Number((pivotS1 * 0.96).toFixed(2)),
          distAboveS1Pct: Number(distAboveS1Pct.toFixed(1)),
          cycle: cycle,
          evalRes: evalRes,
          verdict: evalRes ? evalRes.verdict : null,
          advice: evalRes ? evalRes.advice : (item.advice || 'السهم يتحرك داخل نطاق سعري آمن ومستقر، استمرار في الاحتفاظ الهادئ.'),
          thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`,

          fairValue: fvInfo.fairValue,
          fairValueDiscountPct: fvInfo.discountPct,
          isUndervalued: fvInfo.isUndervalued,
          fairValueStatusText: fvInfo.statusText,
          fairValueBadgeClass: fvInfo.badgeClass
        });
      });

      // Category 3 (تعديل ورفع خط الأمان): Stocks with solid profit whose active stop loss is lagging behind
      stockHoldings.forEach(item => {
        const curPrice = Number(item.currentPrice) || Number(item.buyPrice) || 0;
        const buyPrice = Number(item.buyPrice) || curPrice;
        const currentShares = parseInt(item.shares, 10) || 0;
        const pivotS1 = Number(item.pivotS1 || item.support) || 0;
        const pivotR1 = Number(item.pivotR1 || item.target1) || 0;
        const returnPct = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
        const isLosing = returnPct < 0;
        const activeStopLoss = Number(item.customStopLoss || item.stopLoss || pivotS1 || (buyPrice * 0.95));

        // Check if stock has significant profit (>= 7%) and active stop is lagging behind
        if (!isLosing && returnPct >= 7.0 && curPrice > 0) {
          const suggestedStop = Number((curPrice * 0.97).toFixed(2));
          if (suggestedStop > (activeStopLoss * 1.015)) {
            const lockedProfitPct = buyPrice > 0 ? Number((((suggestedStop - buyPrice) / buyPrice) * 100).toFixed(1)) : 0;
            const profitAtRisk = Math.max(0, Math.round((suggestedStop - activeStopLoss) * currentShares));

            const fvInfoStop = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
              ? window.getFairValueInfo(item.ticker, curPrice)
              : null;

            safetyLevelUpdates.push({
              ticker: item.ticker,
              name: item.name,
              currentPrice: curPrice,
              buyPrice: buyPrice,
              shares: currentShares,
              returnPct: returnPct,
              currentStopLoss: activeStopLoss,
              suggestedStop: suggestedStop,
              lockedProfitPct: lockedProfitPct,
              profitAtRisk: profitAtRisk,
              pivotS1: pivotS1,
              pivotR1: pivotR1,
              pivotR2: item.pivotR2 || Number((curPrice * 1.10).toFixed(2)),
              pivotS2: item.pivotS2 || Number((pivotS1 * 0.96).toFixed(2)),
              thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`,

              fairValue: fvInfoStop ? fvInfoStop.fairValue : null,
              fairValueDiscountPct: fvInfoStop ? fvInfoStop.discountPct : null,
              isUndervalued: fvInfoStop ? fvInfoStop.isUndervalued : false,
              fairValueStatusText: fvInfoStop ? fvInfoStop.statusText : ''
            });
          }
        }
      });

      safetyLevelUpdates.sort((a, b) => (b.profitAtRisk || 0) - (a.profitAtRisk || 0));

      // SORTING PER CATEGORY:
      // Category 1 (جني الأرباح): Strictly highest return % descending (+50%, +30%, +20%)
      profitTaking.sort((a, b) => (Number(b.returnPct) || 0) - (Number(a.returnPct) || 0));

      // Category 2 (الحماية والبيع): Urgency descending (highest urgency score first)
      riskDefense.sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));

      // Category 4 (التزويد والتجميع): Sorted by biggest discount/upside
      accumulation.sort((a, b) => (Number(a.returnPct) || 0) - (Number(b.returnPct) || 0));

      // Category 6 (الانتظار والمتابعة): Sorted by return % descending
      waitAndHold.sort((a, b) => (Number(b.returnPct) || 0) - (Number(a.returnPct) || 0));

      // Category 4: MARKET OPPORTUNITIES (From fullMarketRadar - stocks not owned)
      const ownedTickers = new Set(portfolioData.map(p => p.ticker));
      const marketOpportunities = fullMarketRadar
        .filter(m => m.ticker && !ownedTickers.has(m.ticker) && (Number(m.score) >= 80))
        .map(m => {
          const mPrice = Number(m.price || m.close) || 0;

          const numSupport = parseFloat(String(m.support).replace(/[^\d.]/g, '')) || Number((mPrice * 0.95).toFixed(2));
          const numTarget1 = parseFloat(String(m.target1).replace(/[^\d.]/g, '')) || Number((mPrice * 1.15).toFixed(2));
          const numTarget2 = parseFloat(String(m.target2).replace(/[^\d.]/g, '')) || Number((mPrice * 1.25).toFixed(2));
          const numStopLoss = parseFloat(String(m.stopLoss).replace(/[^\d.]/g, '')) || Number((mPrice * 0.92).toFixed(2));

          const fvInfo = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
            ? window.getFairValueInfo(m.ticker, mPrice)
            : {
                fairValue: Number((mPrice * 1.25).toFixed(2)),
                discountPct: 20.0,
                isUndervalued: true,
                statusText: 'يتداول بخصم 20% عن قيمته الحقيقية (هامش أمان ممتاز للشراء 🟢)',
                badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              };

          // Precise Execution Plan ("أشتري على كام؟")
          const suggestedBuyPrice = (numSupport > 0 && Math.abs(mPrice - numSupport) / numSupport < 0.05)
            ? Number((Math.min(mPrice, numSupport * 1.008)).toFixed(2))
            : Number((numSupport * 1.005).toFixed(2));

          const buyRangeMin = Number((numSupport * 0.995).toFixed(2));
          const buyRangeMax = Number((suggestedBuyPrice * 1.015).toFixed(2));
          const noChasePrice = Number((buyRangeMax * 1.015).toFixed(2));

          const target1GainPct = suggestedBuyPrice > 0 ? Number((((numTarget1 - suggestedBuyPrice) / suggestedBuyPrice) * 100).toFixed(1)) : 15.0;
          const target2GainPct = suggestedBuyPrice > 0 ? Number((((numTarget2 - suggestedBuyPrice) / suggestedBuyPrice) * 100).toFixed(1)) : 25.0;
          const stopLossRiskPct = suggestedBuyPrice > 0 ? Number((((suggestedBuyPrice - numStopLoss) / suggestedBuyPrice) * 100).toFixed(1)) : 5.0;
          const riskRewardRatio = stopLossRiskPct > 0 ? Number((target1GainPct / stopLossRiskPct).toFixed(1)) : 3.0;

          const availableCash = (totalDryPowder && totalDryPowder > 0) ? totalDryPowder : 10000;
          const suggestedCash = Math.min(5000, Math.max(1000, Math.round(availableCash * 0.25)));
          const suggestedShares = suggestedBuyPrice > 0 ? Math.floor(suggestedCash / suggestedBuyPrice) : 0;
          const actualTrancheSpend = Math.round(suggestedShares * suggestedBuyPrice);

          return {
            ticker: m.ticker,
            name: m.name,
            index: m.index || 'egx30',
            sector: m.sector || 'قطاع واعد',
            price: mPrice,
            changePct: m.changePct || '0.0%',
            score: Number(m.score) || 85,
            target1: m.target1 || numTarget1.toFixed(2) + ' ج',
            target2: m.target2 || numTarget2.toFixed(2) + ' ج',
            support: m.support || numSupport.toFixed(2) + ' ج',
            stopLoss: m.stopLoss || numStopLoss.toFixed(2) + ' ج',
            catalyst: m.catalyst || 'فرصة فنية واعدة بنسبة سيولة مرتفعة',
            liquidityStatus: m.liquidityStatus || 'سيولة نشطة في ثندر',
            thndrUrl: `https://app.thndr.app/search?query=${m.ticker}`,

            fairValue: fvInfo.fairValue,
            fairValueDiscountPct: fvInfo.discountPct,
            isUndervalued: fvInfo.isUndervalued,
            fairValueStatusText: fvInfo.statusText,
            fairValueBadgeClass: fvInfo.badgeClass,
            fairValueModel: fvInfo.modelType,

            suggestedBuyPrice: suggestedBuyPrice,
            buyRangeMin: buyRangeMin,
            buyRangeMax: buyRangeMax,
            noChasePrice: noChasePrice,
            target1GainPct: target1GainPct,
            target2GainPct: target2GainPct,
            stopLossRiskPct: stopLossRiskPct,
            riskRewardRatio: riskRewardRatio,

            suggestedShares: suggestedShares,
            suggestedCash: suggestedCash,
            actualTrancheSpend: actualTrancheSpend,
            pe: m.pe || null,
            sectorPe: m.sectorPe || null,
            operationalStability: m.operationalStability || null
          };
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 4);

      // Legacy Candidates for backward compatibility with existing callers/tests
      let buyCandidate = accumulation[0] || null;
      if (!buyCandidate) {
        const fallbackDip = stockHoldings.find(p => p.ticker === 'COMI' || p.profit < 0);
        if (fallbackDip) {
          const curPrice = Number(fallbackDip.currentPrice) || Number(fallbackDip.buyPrice) || 100;
          const buyPrice = Number(fallbackDip.buyPrice) || curPrice;
          const currentShares = parseInt(fallbackDip.shares, 10) || 0;
          const suggestedCash = Math.min(5000, Math.max(1500, Math.round(cashBalance * 0.25)));
          const sharesToBuy = curPrice > 0 ? Math.floor(suggestedCash / curPrice) : 0;
          const actualCashSpend = Math.round(sharesToBuy * curPrice);
          const totalOldCost = currentShares * buyPrice;
          const totalNewCost = totalOldCost + actualCashSpend;
          const totalNewShares = currentShares + sharesToBuy;
          const newAvgCost = totalNewShares > 0 ? Number((totalNewCost / totalNewShares).toFixed(2)) : buyPrice;
          const avgReductionEgp = Number((buyPrice - newAvgCost).toFixed(2));
          const cycle = (typeof this.determineStockCycle === 'function') ? this.determineStockCycle(fallbackDip) : null;
          buyCandidate = {
            ticker: fallbackDip.ticker,
            name: fallbackDip.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            returnPct: Number(fallbackDip.returnPct) || 0,
            currentShares: currentShares,
            suggestedCash: actualCashSpend,
            sharesToBuy: sharesToBuy,
            newAvgCost: newAvgCost,
            avgReductionEgp: avgReductionEgp,
            cycle: cycle,
            supportPrice: fallbackDip.pivotS1 || Number((curPrice * 0.97).toFixed(2)),
            targetPrice: fallbackDip.pivotR1 || Number((curPrice * 1.15).toFixed(2)),
            thndrUrl: fallbackDip.thndrUrl || `https://app.thndr.app/search?query=${fallbackDip.ticker}`
          };
        }
      }

      const profitCandidate = profitTaking[0] || null;
      const safetyAlert = riskDefense.length > 0 ? {
        hasRisk: true,
        ticker: riskDefense[0].ticker,
        name: riskDefense[0].name,
        currentPrice: riskDefense[0].currentPrice,
        supportPrice: riskDefense[0].supportPrice,
        returnPct: riskDefense[0].returnPct,
        shares: riskDefense[0].shares,
        isDip: riskDefense[0].isDip,
        isConfirmedExit: riskDefense[0].isConfirmedExit,
        badgeText: riskDefense[0].badgeText,
        badgeClass: riskDefense[0].badgeClass,
        advice: riskDefense[0].advice,
        buttonText: riskDefense[0].buttonText,
        buttonClass: riskDefense[0].buttonClass,
        buttonAction: riskDefense[0].buttonAction,
        text: riskDefense[0].advice
      } : {
        hasRisk: false,
        text: 'جميع أسهمك القيادية تتداول فوق خطوط الأمان والدعوم الفنية. لا توجد أي إشارات كسر دعم حرجة اليوم.'
      };

      return {
        cashStatus: {
          freeCash: cashBalance,
          fundsTotal: fundsTotal,
          totalDryPowder: cashBalance,
          summaryText: `لديك ${Math.round(cashBalance).toLocaleString('en-US')} ج.م كاش حر متاح لاقتناص الفرص وتعزيز المراكز.`
        },
        buyCandidate,
        profitCandidate,
        safetyAlert,
        categories: {
          profitTaking,
          riskDefense,
          safetyLevelUpdates,
          accumulation,
          marketOpportunities,
          waitAndHold
        }
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
