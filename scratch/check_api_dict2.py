import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('"ADIB":')
print(text[idx:idx+400])
