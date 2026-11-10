import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function parseTechnicalRecord')
print(text[idx:idx+2500])
