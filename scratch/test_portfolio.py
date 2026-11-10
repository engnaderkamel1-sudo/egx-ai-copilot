# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect default portfolio from js/portfolio.js
with open('js/portfolio.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re, json
match = re.search(r'const defaultPortfolioData = (\[.*?\]);', text, re.DOTALL)
if match:
    portfolio = json.loads(match.group(1))
    print(f"Loaded {len(portfolio)} portfolio items")
    for item in portfolio:
        if item.get('ticker') in ['HDBK', 'COMI', 'SWDY', 'CLHO', 'RAYA']:
            cur = item.get('currentPrice', item.get('buyPrice'))
            buy = item.get('buyPrice')
            ret = ((cur - buy) / buy) * 100 if buy else 0
            s1 = item.get('pivotS1', 0)
            r1 = item.get('pivotR1', 0)
            print(f"Ticker: {item['ticker']}, Buy: {buy}, Cur: {cur}, Ret: {ret:.2f}%, S1: {s1}, R1: {r1}")
