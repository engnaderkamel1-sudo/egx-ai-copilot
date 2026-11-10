import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/app.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('async function fetchLiveEGXPrices(')
print(text[idx:idx+1500])
