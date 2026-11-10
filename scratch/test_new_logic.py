import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('scratch/tv_sample.json', 'r', encoding='utf-8') as f:
    tv_data = json.load(f)

with open('js/valuation.js', 'r', encoding='utf-8') as f:
    val_text = f.read()

with open('api/prices.js', 'r', encoding='utf-8') as f:
    api_text = f.read()

# Owned
owned = {'ABUK', 'ARCC', 'BSB', 'CLHO', 'COMI', 'EGAL', 'HALN', 'HDBK', 'NCS', 'ORAS', 'RAYA', 'SWDY', 'TMGH', 'CASH'}
core_tickers = ['COMI', 'SWDY', 'ABUK', 'CLHO', 'EGAL', 'ORAS', 'MFPC', 'CIEB', 'ADIB', 'HDBK', 'TMGH', 'ALCN', 'JUFO', 'OCDI', 'HRHO', 'ESRS', 'ETEL', 'ORWE', 'PHDC', 'EMFD', 'PHAR', 'GBCO']

import re

# Simulate fullMarketRadar mapping
radar_items = []
for row in tv_data['data']:
    ticker = row['s'].replace('EGX:', '')
    close = row['d'][2]
    traded_val = row['d'][5]
    
    # Calculate liquidityTier
    isSuperLiquid = (traded_val >= 20000000) or ticker in ['COMI', 'SWDY', 'CCAP', 'TMGH', 'BTFH', 'ABUK']
    isModerateLiquid = (traded_val >= 5000000)
    liquidityTier = 'EXCELLENT' if isSuperLiquid else ('GOOD' if isModerateLiquid else 'LOW_CAUTION')
    
    is_core = ticker in core_tickers
    
    # Fair value
    m_fv = re.search(rf'"{ticker}":.*?fairValueBaseline:\s*([\d.]+)', val_text, re.DOTALL)
    fv = float(m_fv.group(1)) if m_fv else None
    discount = (((fv - close) / fv) * 100) if (fv and close) else None
    
    # rough score
    score = 80 if isSuperLiquid else 65
    if is_core:
        score = 65 # conservative dip score
    
    radar_items.append({
        'ticker': ticker,
        'price': close,
        'tradedVal': traded_val,
        'liquidityTier': liquidityTier,
        'isCore': is_core,
        'fairValue': fv,
        'fairValueDiscountPct': discount,
        'score': score
    })

# Now apply the new filter
mapped = [
    m for m in radar_items
    if m['ticker'] not in owned and m['score'] >= (50 if m['isCore'] else 75)
]

core_opps = [
    m for m in mapped
    if m['isCore'] and m['fairValue'] is not None and m['fairValueDiscountPct'] > 0 and m['liquidityTier'] != 'LOW_CAUTION'
]
core_opps.sort(key=lambda x: x['fairValueDiscountPct'], reverse=True)

print(f"=== Core Opportunities Found: {len(core_opps)} ===")
for c in core_opps[:4]:
    print(f"  {c['ticker']:6} | Price: {c['price']:8} | FV: {c['fairValue']:6} | Discount: {c['fairValueDiscountPct']:.1f}% | Liq: {c['liquidityTier']}")
