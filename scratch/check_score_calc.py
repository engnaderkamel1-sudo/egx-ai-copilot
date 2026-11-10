import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

# Let's inspect calculateScore logic from api/prices.js
# Let's read lines 230 to 310 of api/prices.js
with open('api/prices.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('// 1. Trend Quality Points')
end = text.find('return {', idx)
print(text[idx:end])
