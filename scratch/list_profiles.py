import json

with open('js/valuation.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('EGX_VALUATION_PROFILES =')
end = text.find('function calculateDCF(')
profiles_text = text[idx:end]
import re
tickers = re.findall(r'"([A-Z0-9]+)":\s*\{', profiles_text)
print('Tickers in EGX_VALUATION_PROFILES:', tickers)
