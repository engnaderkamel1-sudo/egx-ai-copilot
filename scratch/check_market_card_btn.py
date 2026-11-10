import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderMarketOpportunityCard')
end = text.find('function renderWaitAndHoldCard', idx)
print(text[end-1200:end])
