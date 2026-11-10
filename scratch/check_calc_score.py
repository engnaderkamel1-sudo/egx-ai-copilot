import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('calculatedScore')
print(text[idx-500:idx+300])
