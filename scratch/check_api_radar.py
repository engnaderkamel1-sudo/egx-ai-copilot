import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('fullMarketRadar')
if idx != -1:
    print(text[idx:idx+1500])
else:
    print('fullMarketRadar not found in api/prices.js, searching for radar')
    idx2 = text.find('radar')
    print(text[idx2:idx2+1500])
