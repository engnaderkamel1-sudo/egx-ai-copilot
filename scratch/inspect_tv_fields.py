import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

# Let's inspect the columns for ETEL, PHAR, EMFD, PHDC
for row in tv_data['data']:
    t = row['s'].replace('EGX:', '')
    if t in ['ETEL', 'PHAR', 'EMFD', 'PHDC']:
        d = row['d']
        print(f"=== {t} ===")
        print(f"Close: {d[2]}, Change: {d[3]}, Vol: {d[4]}, TradedVal: {d[5]}")
        print(f"RSI: {d[9]}, Recommend: {d[10]}")
        print(f"SMA50: {d[11]}, SMA200: {d[12]}")
        print(f"PivotR1: {d[13]}, PivotS1: {d[14]}")
        print(f"MACD: {d[17]}, Signal: {d[18]}")
