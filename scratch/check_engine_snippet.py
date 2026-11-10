import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const allMappedOpportunities = fullMarketRadar')
print(text[idx-50:idx+350])
