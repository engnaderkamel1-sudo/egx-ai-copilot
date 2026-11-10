import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/valuation.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('"HRHO":')
print(text[idx:idx+600])
