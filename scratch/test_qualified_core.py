import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

with open('js/valuation.js', 'r', encoding='utf-8') as f:
    val_text = f.read()

owned = {'ABUK', 'ARCC', 'BSB', 'CLHO', 'COMI', 'EGAL', 'HALN', 'HDBK', 'NCS', 'ORAS', 'RAYA', 'SWDY', 'TMGH', 'CASH'}
core_tickers = ['COMI', 'SWDY', 'ABUK', 'CLHO', 'EGAL', 'ORAS', 'MFPC', 'CIEB', 'ADIB', 'HDBK', 'TMGH', 'ALCN', 'JUFO', 'OCDI', 'HRHO', 'ESRS', 'ETEL', 'ORWE', 'PHDC', 'EMFD', 'PHAR', 'GBCO']

import re

# For each row in tv_data:
# calculate score roughly and see if it passes
for row in tv_data['data']:
    t = row['s'].replace('EGX:', '')
    if t in owned: continue
    
    is_core = t in core_tickers
    
    m_fv = re.search(rf'"{t}":.*?fairValueBaseline:\s*([\d.]+)', val_text, re.DOTALL)
    fv = float(m_fv.group(1)) if m_fv else None
    price = row['d'][2]
    discount = (((fv - price) / fv) * 100) if (fv and price) else None
    
    if is_core and fv and discount and discount > 0:
        print(f"Qualified Core Opportunity: {t:6} | Price: {price:8} | FV: {fv:6} | Discount: {discount:.1f}%")
