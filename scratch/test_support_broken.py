import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

for row in tv_data['data']:
    t = row['s'].replace('EGX:', '')
    if t in ['ETEL', 'PHAR', 'EMFD', 'PHDC']:
        d = row['d']
        price = d[2]
        changePct = d[3]
        tradedValue = d[5]
        rsi = d[9]
        sma50 = d[11]
        sma200 = d[12]
        pivotR1 = d[13]
        pivotS1 = d[14]
        pivotR2 = d[15]
        pivotS2 = d[16]
        macd = d[17]
        macdSignal = d[18]
        
        # RR ratio logic from api/prices.js
        # Let's inspect rrRatio logic
        print(f"=== {t} ===")
        print(f"Price: {price}, S1: {pivotS1}, R1: {pivotR1}")
        isSupportBroken = (pivotS1 is not None and price < pivotS1)
        print(f"Price < S1 (isSupportBroken): {isSupportBroken}")
