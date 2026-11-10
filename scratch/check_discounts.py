import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

# Let's inspect getFairValueInfo for ALCN, JUFO, OCDI, HRHO, ESRS
with open('js/valuation.js', encoding='utf-8') as f:
    text_v = f.read()

with open('js/state.js', encoding='utf-8') as f:
    text_s = f.read()

# Check price in state.js
import re

for t in ['ALCN', 'JUFO', 'OCDI', 'HRHO', 'ESRS', 'SKPC', 'AMOC', 'CCAP']:
    # get price
    m = re.search(rf"ticker:\s*'{t}'.*?price:\s*([\d.]+)", text_s, re.DOTALL)
    price = float(m.group(1)) if m else None
    # get fairValueBaseline in valuation.js
    m_fv = re.search(rf'"{t}":.*?fairValueBaseline:\s*([\d.]+)', text_v, re.DOTALL)
    fv = float(m_fv.group(1)) if m_fv else None
    
    discount = (((fv - price) / fv) * 100) if (fv and price) else None
    print(f"Ticker: {t:5} | Price: {price} | FairValue: {fv} | Discount: {discount:.1f}%" if discount else f"Ticker: {t:5} | Price: {price} | FairValue: {fv} | No discount")
