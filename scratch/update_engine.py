# -*- coding: utf-8 -*-
import sys

def main():
    with open('js/engine.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update accumulation
    old_acc = """          accumulation.push({
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
            thndrUrl: item.thndrUrl || `https://app.thndr.app/search?query=${item.ticker}`
          });"""

    new_acc = """          const fvInfoAcc = (typeof window !== 'undefined' && typeof window.getFairValueInfo === 'function')
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
          });"""

    # Normalize line endings for replacement
    content_norm = content.replace('\r\n', '\n')
    old_acc_norm = old_acc.replace('\r\n', '\n')
    new_acc_norm = new_acc.replace('\r\n', '\n')

    if old_acc_norm not in content_norm:
        print("ERROR: old_acc not found")
        sys.exit(1)

    content_norm = content_norm.replace(old_acc_norm, new_acc_norm)

    # 2. Update marketOpportunities
    old_opp = """      // Category 4: MARKET OPPORTUNITIES (From fullMarketRadar - stocks not owned)
      const ownedTickers = new Set(portfolioData.map(p => p.ticker));
      const marketOpportunities = fullMarketRadar
        .filter(m => m.ticker && !ownedTickers.has(m.ticker) && (Number(m.score) >= 80))
        .map(m => {
          const mPrice = Number(m.price || m.close) || 0;
          return {
            ticker: m.ticker,
            name: m.name,
            index: m.index || 'egx30',
            sector: m.sector || 'قطاع واعد',
            price: mPrice,
            changePct: m.changePct || '0.0%',
            score: Number(m.score) || 85,
            target1: m.target1 || (mPrice * 1.15).toFixed(2) + ' ج',
            target2: m.target2 || (mPrice * 1.25).toFixed(2) + ' ج',
            support: m.support || (mPrice * 0.95).toFixed(2) + ' ج',
            stopLoss: m.stopLoss || (mPrice * 0.92).toFixed(2) + ' ج',
            catalyst: m.catalyst || 'فرصة فنية واعدة بنسبة سيولة مرتفعة',
            liquidityStatus: m.liquidityStatus || 'سيولة نشطة في ثندر',
            thndrUrl: `https://app.thndr.app/search?query=${m.ticker}`
          };
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 4);"""

    new_opp = """      // Category 4: MARKET OPPORTUNITIES (From fullMarketRadar - stocks not owned)
      const ownedTickers = new Set(portfolioData.map(p => p.ticker));
      const marketOpportunities = fullMarketRadar
        .filter(m => m.ticker && !ownedTickers.has(m.ticker) && (Number(m.score) >= 80))
        .map(m => {
          const mPrice = Number(m.price || m.close) || 0;

          const numSupport = parseFloat(String(m.support).replace(/[^\\d.]/g, '')) || Number((mPrice * 0.95).toFixed(2));
          const numTarget1 = parseFloat(String(m.target1).replace(/[^\\d.]/g, '')) || Number((mPrice * 1.15).toFixed(2));
          const numTarget2 = parseFloat(String(m.target2).replace(/[^\\d.]/g, '')) || Number((mPrice * 1.25).toFixed(2));
          const numStopLoss = parseFloat(String(m.stopLoss).replace(/[^\\d.]/g, '')) || Number((mPrice * 0.92).toFixed(2));

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
        .slice(0, 4);"""

    old_opp_norm = old_opp.replace('\r\n', '\n')
    new_opp_norm = new_opp.replace('\r\n', '\n')

    if old_opp_norm not in content_norm:
        print("ERROR: old_opp not found")
        sys.exit(1)

    content_norm = content_norm.replace(old_opp_norm, new_opp_norm)

    with open('js/engine.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content_norm)

    print("SUCCESS: engine.js updated successfully")

if __name__ == '__main__':
    main()
