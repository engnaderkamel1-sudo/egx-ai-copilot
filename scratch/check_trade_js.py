import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/trade.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function openTradeModal')
print(text[idx:idx+1500])
