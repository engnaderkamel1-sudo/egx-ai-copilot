import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="tradeModal"')
if idx == -1:
    idx = text.find('trade-modal')
if idx != -1:
    print(text[idx:idx+1500])
else:
    print("modal not found by id")
