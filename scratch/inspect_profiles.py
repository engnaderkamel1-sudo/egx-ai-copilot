import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('js/valuation.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('EGX_VALUATION_PROFILES =')
end = text.find('function calculateDCF(')
profiles_text = text[idx:end]

for ticker in ['JUFO', 'SKPC', 'ALCN', 'HRHO', 'OCDI', 'BTFH', 'AMOC']:
    t_idx = profiles_text.find(f'"{ticker}":')
    if t_idx != -1:
        print(f"=== {ticker} ===")
        print(profiles_text[t_idx:t_idx+400])
