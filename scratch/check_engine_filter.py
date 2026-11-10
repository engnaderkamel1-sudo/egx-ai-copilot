import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const allMappedOpportunities')
print(text[idx-200:idx+600])
