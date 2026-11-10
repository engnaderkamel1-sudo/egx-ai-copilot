import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

for row in tv_data['data']:
    t = row['s'].replace('EGX:', '')
    if t == 'ETEL':
        d = row['d']
        price = d[2]
        changePct = d[3]
        tradedValue = d[5]
        rsi = d[9]
        recommendation = d[10]
        sma50 = d[11]
        sma200 = d[12]
        pivotR1 = d[13]
        pivotS1 = d[14]
        macd = d[17]
        macdSignal = d[18]
        
        # In api/prices.js:
        # trendPts:
        # if (sma50 && sma200) { if (price >= sma50 && sma50 >= sma200) trendPts = 30; else if (price >= sma50) trendPts = 22; else trendPts = 10; }
        # Let's check price vs sma50:
        print(f"Price: {price}, SMA50: {sma50}, SMA200: {sma200}")
        if price >= sma50:
            trendPts = 22
        else:
            trendPts = 10
        print(f"trendPts: {trendPts}")
        
        momentumPts = 5
        if macd >= macdSignal: momentumPts += 5
        if rsi >= 40 and rsi <= 65: momentumPts += 5
        print(f"momentumPts: {momentumPts}")
        
        liquidityPts = 30 if tradedValue >= 50000000 else 25
        print(f"liquidityPts: {liquidityPts}")
        
        # rrRatio:
        target1Val = pivotR1
        supportVal = pivotS1
        stopLossVal = supportVal * 0.985
        potentialGain = target1Val - price
        potentialRisk = price - stopLossVal
        rrRatio = potentialGain / potentialRisk if potentialRisk > 0 else 0
        print(f"Target1: {target1Val}, Support: {supportVal}, StopLoss: {stopLossVal}")
        print(f"potentialGain: {potentialGain}, potentialRisk: {potentialRisk}, rrRatio: {rrRatio}")
        
        rrPts = 0
        if rrRatio >= 2.5: rrPts = 25
        elif rrRatio >= 2.0: rrPts = 20
        elif rrRatio >= 1.5: rrPts = 12
        elif rrRatio >= 1.0: rrPts = 5
        print(f"rrPts: {rrPts}")
        
        score = liquidityPts + trendPts + rrPts + momentumPts
        print(f"TOTAL SCORE for ETEL: {score}")
