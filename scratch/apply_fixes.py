# -*- coding: utf-8 -*-
with open('js/engine.js', 'r', encoding='utf-8') as f:
    engine_code = f.read()

# 1. Replace getMarketTimingLight with the new action-oriented 5-stage engine
old_timing_light_pattern = '''    getMarketTimingLight: function (marketRegime, fullMarketRadar) {'''

# Find the start and end of getMarketTimingLight
start_idx = engine_code.find(old_timing_light_pattern)
if start_idx != -1:
    end_marker = '    calculateRebalance: function (totalShares, currentPrice, buyPrice, ratio, supportPrice) {'
    end_idx = engine_code.find(end_marker, start_idx)
    if end_idx != -1:
        new_timing_code = '''    getMarketTimingLight: function (marketRegime, fullMarketRadar) {
      let regimeCode = 'NORMAL_CONSOLIDATION';
      if (typeof marketRegime === 'string') {
        regimeCode = marketRegime;
      } else if (marketRegime && typeof marketRegime === 'object') {
        regimeCode = marketRegime.regime || 'NORMAL_CONSOLIDATION';
      } else if (typeof window !== 'undefined' && typeof window.getMarketRegimeCode === 'function') {
        regimeCode = window.getMarketRegimeCode();
      }

      let advancingPct = 50;
      let avgMarketChange = 0;
      const radarList = Array.isArray(fullMarketRadar) && fullMarketRadar.length > 0 
        ? fullMarketRadar 
        : ((typeof window !== 'undefined' && Array.isArray(window.fullMarketRadar)) ? window.fullMarketRadar : []);

      if (radarList.length > 0) {
        let advancing = 0;
        let sumChange = 0;
        radarList.forEach(s => {
          const c = s.changeNum !== undefined ? s.changeNum : parseFloat(String(s.changePct || '0').replace('%', ''));
          if (c > 0) advancing++;
          sumChange += (c || 0);
        });
        advancingPct = Number(((advancing / radarList.length) * 100).toFixed(1));
        avgMarketChange = Number((sumChange / radarList.length).toFixed(2));
      }

      // 1. Red Shock / Systemic Crisis
      const isRed = regimeCode === 'SYSTEMIC_SHOCK' || advancingPct < 20 || avgMarketChange <= -2.5;
      if (isRed) {
        return {
          code: 'RED',
          stageName: 'صدمة وهبوط ذعري شامل',
          actionVerb: 'تجميد الشراء كلياً • حجز السيولة وحماية المحفظة',
          badgeText: '🔴 صدمة بيعية • تجميد الشراء كلياً',
          badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse',
          headerBg: 'from-rose-950/80 via-slate-950 to-gray-950',
          title: 'السوق يمر بضغط بيعي ذعري واسع أو صدمة عامة',
          advice: 'يُحظر الشراء أو التبريد في المسارات الهابطة لتفادي السكاكين الساقطة؛ الفعل السليم هو تجميد الشراء والاحتفاظ بالسيولة حتى استقرار وتماسك القاع.',
          allowBuying: false,
          cashMultiplier: 0.0,
          regimeCode: 'SYSTEMIC_SHOCK',
          advancingPct: advancingPct,
          avgMarketChange: avgMarketChange
        };
      }

      // 2. Overextended Topping / Peak Euphoria
      const isOverbought = advancingPct >= 75 || avgMarketChange >= 2.0;
      if (isOverbought) {
        return {
          code: 'OVERBOUGHT',
          stageName: 'قمم وزخم متضخم وتشبع شرائي',
          actionVerb: 'جني وتأمين الأرباح • حظر ملاحقة الأسعار بالقمم',
          badgeText: '🟠 قمم وتشبع • جني وتأمين الأرباح',
          badgeClass: 'bg-amber-600/20 text-amber-300 border border-amber-500/40',
          headerBg: 'from-amber-950/80 via-slate-950 to-gray-950',
          title: 'السوق في مناطق قمم وتشبع شرائي متضخم',
          advice: 'يُحظر الشراء هنا لتفادي مصائد القمم وملاحقة الأسعار المرتفعة؛ الفعل السليم الآن هو جني الأرباح وتأمين المكاسب.',
          allowBuying: false,
          cashMultiplier: 0.0,
          regimeCode: 'OVERBOUGHT',
          advancingPct: advancingPct,
          avgMarketChange: avgMarketChange
        };
      }

      // 3. Healthy Pullback / Dip Accumulation
      const isPullback = regimeCode === 'HEALTHY_CORRECTION' || (advancingPct >= 25 && advancingPct <= 45 && avgMarketChange < 0);
      if (isPullback) {
        return {
          code: 'PULLBACK',
          stageName: 'تصحيح هادئ وقيعان فنية متماسكة',
          actionVerb: 'تجميع هادئ تدريجي • اقتناص الخصومات بالأمر المحدد',
          badgeText: '🟢 قاع وتصحيح هادئ • تجميع تدريجي بالأمر المحدد',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          headerBg: 'from-emerald-950/80 via-slate-950 to-gray-950',
          title: 'السوق يمر بهبوط تصحيحي صحي وتماسك عند الدعوم',
          advice: 'هذا هو التوقيت الذهبي لبناء المراكز؛ الفعل السليم هو التجميع الهادئ بالدفعات في الأسهم القيادية المقومة بأقل من قيمتها العادلة.',
          allowBuying: true,
          cashMultiplier: 0.8,
          regimeCode: 'HEALTHY_CORRECTION',
          advancingPct: advancingPct,
          avgMarketChange: avgMarketChange
        };
      }

      // 4. Bullish Expansion / Balanced Momentum
      const isGreen = regimeCode === 'BULLISH_EXPANSION' || (advancingPct >= 55 && avgMarketChange >= 0.5);
      if (isGreen) {
        return {
          code: 'GREEN',
          stageName: 'مسار صاعد وزخم شرائي متزن',
          actionVerb: 'شراء بالأمر المحدد عند الارتدادات • ركوب الاتجاه الصاعد',
          badgeText: '🟢 صعود متزن • شراء بالأمر المحدد عند الدعوم',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          headerBg: 'from-emerald-950/80 via-slate-950 to-gray-950',
          title: 'السوق في مسار صاعد وزخم شرائي متزن',
          advice: 'تدفق سيولة إيجابي واختراق صحي؛ الفعل السليم هو الشراء الانتقائي بأمر محدد عند نقاط الارتداد دون ملاحقة الأسعار.',
          allowBuying: true,
          cashMultiplier: 1.0,
          regimeCode: 'BULLISH_EXPANSION',
          advancingPct: advancingPct,
          avgMarketChange: avgMarketChange
        };
      }

      // 5. Normal Consolidation / Balanced Range
      return {
        code: 'YELLOW',
        stageName: 'تداول عرضي متوازن ومتذبذب',
        actionVerb: 'مراقبة وتريث • انتقائية صارمة للنواة الآمنة فقط',
        badgeText: '🟡 تداول متوازن • مراقبة وتريث وانتقائية',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        headerBg: 'from-amber-950/70 via-slate-950 to-gray-950',
        title: 'السوق يتحرك في نطاق عرضي متذبذب دون اتجاه صريح',
        advice: 'تذبذب متوازن؛ الفعل السليم هو التريث وحجز نصف السيولة كاش، والشراء فقط في سهم قيادي ذي خصم حقيقي بالأمر المحدد.',
        allowBuying: true,
        cashMultiplier: 0.6,
        regimeCode: 'NORMAL_CONSOLIDATION',
        advancingPct: advancingPct,
        avgMarketChange: avgMarketChange
      };
    },

'''
        engine_code = engine_code[:start_idx] + new_timing_code + engine_code[end_idx:]
        print('Updated getMarketTimingLight to action-oriented 5-stage engine')

# 2. Swap Priority in buildDailyActionPlan: profitTaking FIRST for winning stocks, riskDefense ONLY for losing stocks!
# Let's inspect the block from `const isSupportBroken =` to `return;` in profitTaking
block_start_marker = '        const isSupportBroken = !!(item.isSupportBroken || (pivotS1 > 0 && curPrice < pivotS1));'
block_end_marker = '        // 3. ACCUMULATION / DCA CATEGORY CRITERIA:'

start_block_idx = engine_code.find(block_start_marker)
end_block_idx = engine_code.find(block_end_marker)

if start_block_idx != -1 and end_block_idx != -1:
    new_priority_block = '''        const isSupportBroken = !!(item.isSupportBroken || (pivotS1 > 0 && curPrice < pivotS1));
        const actionCode = evalRes ? evalRes.action : (item.action || 'HOLD');

        // 1. PROFIT-TAKING CATEGORY CRITERIA (Evaluated first for winning positions!)
        // Any owned position with solid profit (returnPct >= 10) OR reaching resistance R1 OR rebalance candidate
        const isProfitTaking = !isLosing && (returnPct >= 10 || actionCode === 'REBALANCE_CANDIDATE' || (pivotR1 > 0 && curPrice >= pivotR1));
        if (isProfitTaking) {
          // Dynamic Support Level Anchor:
          // If the stock has broken above R1 or gained heavily, the realistic pullback support
          // is NOT the ancient S1, but the new breakout retest / dynamic trailing stop level!
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

        // 2. RISK & DEFENSE CATEGORY CRITERIA:
        // STRICTLY for losing positions or emergency capital preservation! Winning positions are NEVER put in riskDefense!
        const isRiskDefense = isLosing && (
          isSupportBroken || 
          actionCode === 'STOP_LOSS_CONFIRMED' || 
          actionCode === 'EMERGENCY_STOP_LOSS' || 
          actionCode === 'INTRADAY_DIP_WATCH' || 
          actionCode === 'CORE_BUFFER_WATCH' || 
          actionCode === 'DEFENSIVE_HOLD' ||
          (evalRes && evalRes.alertLevel === 'CRITICAL_RISK')
        );

        if (isRiskDefense) {
          const isConfirmedExit = actionCode === 'STOP_LOSS_CONFIRMED' || actionCode === 'EMERGENCY_STOP_LOSS';
          const isDip = actionCode === 'INTRADAY_DIP_WATCH' || actionCode === 'CORE_BUFFER_WATCH' || actionCode === 'DEFENSIVE_HOLD';

          // Urgency score calculation for sorting (higher score = top urgency)
          let urgencyScore = 50;
          if (actionCode === 'EMERGENCY_STOP_LOSS') urgencyScore = 100;
          else if (actionCode === 'STOP_LOSS_CONFIRMED') urgencyScore = 90;
          else if (actionCode === 'INTRADAY_DIP_WATCH') urgencyScore = 80;
          else if (actionCode === 'DEFENSIVE_HOLD') urgencyScore = 70 + Math.min(20, Math.abs(returnPct));
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

'''
    engine_code = engine_code[:start_block_idx] + new_priority_block + engine_code[end_block_idx:]
    print('Swapped priority: profitTaking first, riskDefense strictly for losing positions')

with open('js/engine.js', 'w', encoding='utf-8') as f:
    f.write(engine_code)

print('js/engine.js updated successfully')
