import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('fullMarketRadar =')
end = text.find(';', idx)
print(text[idx:idx+1500])
