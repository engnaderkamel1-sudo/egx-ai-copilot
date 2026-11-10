import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

with open('api/prices.js', 'r', encoding='utf-8') as f:
    api_text = f.read()

with open('js/valuation.js', 'r', encoding='utf-8') as f:
    val_text = f.read()

# Owned tickers from default portfolio
owned = {'ABUK', 'ARCC', 'BSB', 'CLHO', 'COMI', 'EGAL', 'HALN', 'HDBK', 'NCS', 'ORAS', 'RAYA', 'SWDY', 'TMGH', 'CASH'}

core_tickers = ['COMI', 'SWDY', 'ABUK', 'CLHO', 'EGAL', 'ORAS', 'MFPC', 'CIEB', 'ADIB', 'HDBK', 'TMGH', 'ALCN', 'JUFO', 'OCDI', 'HRHO', 'ESRS', 'ETEL', 'ORWE', 'PHDC', 'EMFD', 'PHAR', 'GBCO']

# Check each record in tv_data
import re

for row in tv_data['data']:
    ticker = row['s'].replace('EGX:', '')
    close = row['d'][2]
    
    # check if owned
    if ticker in owned:
        continue
        
    is_core = ticker in core_tickers
    
    # Check fair value in valuation.js
    m_fv = re.search(rf'"{ticker}":.*?fairValueBaseline:\s*([\d.]+)', val_text, re.DOTALL)
    fv = float(m_fv.group(1)) if m_fv else None
    
    discount = (((fv - close) / fv) * 100) if (fv and close) else None
    
    print(f"Ticker: {ticker:6} | Close: {close:8} | FairVal: {str(fv):6} | Discount: {discount if discount is not None else 'None'} | IsCore: {is_core}")
