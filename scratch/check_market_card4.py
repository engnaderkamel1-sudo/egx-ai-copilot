import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderMarketOpportunityCard')
print(text[idx+6000:idx+9000])
