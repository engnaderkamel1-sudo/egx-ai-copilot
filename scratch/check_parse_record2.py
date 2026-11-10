import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function parseTechnicalRecord')
end = text.find('return {', idx)
print(text[end:end+1500])
