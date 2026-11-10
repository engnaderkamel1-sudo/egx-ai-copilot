import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderMarketOpportunityCard')
pos_return = text.find('return `', idx)
pos_end = text.find('function render', pos_return + 10)
print(text[pos_end-1200:pos_end])
