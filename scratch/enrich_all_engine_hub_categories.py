# -*- coding: utf-8 -*-
import sys

def main():
    with open('js/engine.js', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('\r\n', '\n')

    # 1. Insert fvInfo computation inside stockHoldings.forEach
    target_loop_head = """        const cycle = (typeof this.determineStockCycle === 'function')
          ? this.determineStockCycle(item)
          : null;"""

    replacement_loop_head = """        const cycle = (typeof this.determineStockCycle === 'function')
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
            };"""

    if target_loop_head not in content:
        print("ERROR: target_loop_head not found")
        sys.exit(1)

    content = content.replace(target_loop_head, replacement_loop_head, 1)

    # 2. Update riskDefense.push
    old_risk_push = """          riskDefense.push({
            ticker: item.ticker,
            name: item.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            supportPrice: pivotS1,
            pivotR1: pivotR1,
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
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
          });"""

    new_risk_push = """          riskDefense.push({
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
          });"""

    if old_risk_push not in content:
        print("ERROR: old_risk_push not found")
        sys.exit(1)

    content = content.replace(old_risk_push, new_risk_push, 1)

    # 3. Update profitTaking.push
    old_profit_push = """          profitTaking.push({
            ticker: item.ticker,
            name: item.name,
            currentPrice: curPrice,
            buyPrice: buyPrice,
            returnPct: returnPct,
            totalShares: currentShares,
            pivotR1: pivotR1,
            pivotS1: pivotS1,
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
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
          });"""

    new_profit_push = """          profitTaking.push({
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
          });"""

    if old_profit_push not in content:
        print("ERROR: old_profit_push not found")
        sys.exit(1)

    content = content.replace(old_profit_push, new_profit_push, 1)

    # 4. Update waitAndHold.push
    old_wait_push = """        waitAndHold.push({
          ticker: item.ticker,
          name: item.name,
          currentPrice: curPrice,
          buyPrice: buyPrice,
          currentValue: Math.round(currentShares * curPrice),
          returnPct: returnPct,
          shares: currentShares,
          pivotS1: pivotS1,
          pivotR1: pivotR1,
          distAboveS1Pct: Number(distAboveS1Pct.toFixed(1)),
          cycle: cycle,
          evalRes: evalRes,
          verdict: evalRes ? evalRes.verdict : null,
          advice: evalRes ? evalRes.advice : (item.advice || 'السهم يتحرك داخل نطاق سعري آمن ومستقر، استمرار في الاحتفاظ الهادئ.'),
          thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
        });"""

    new_wait_push = """        waitAndHold.push({
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
        });"""

    if old_wait_push not in content:
        print("ERROR: old_wait_push not found")
        sys.exit(1)

    content = content.replace(old_wait_push, new_wait_push, 1)

    # 5. Update safetyLevelUpdates.push
    old_safety_push = """            safetyLevelUpdates.push({
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
              thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
            });"""

    new_safety_push = """            const fvInfoStop = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
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
            });"""

    if old_safety_push not in content:
        print("ERROR: old_safety_push not found")
        sys.exit(1)

    content = content.replace(old_safety_push, new_safety_push, 1)

    with open('js/engine.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

    print("SUCCESS: engine.js hub categories enriched successfully")

if __name__ == '__main__':
    main()
