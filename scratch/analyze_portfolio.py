# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/parsed_portfolio.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Exclude funds (BSB, NCS) as requested by user
stocks = [it for it in items if it.get('ticker') not in ['BSB', 'NCS']]

total_equity = sum(it.get('shares', 0) * it.get('currentPrice', it.get('buyPrice', 0)) for it in stocks if it.get('ticker') != 'CASH')
cash_item = next((it for it in stocks if it.get('ticker') == 'CASH'), None)
cash_val = cash_item.get('buyPrice', 0) if cash_item else 0
grand_total = total_equity + cash_val

print(f"Total Portfolio (Excluding Funds): {grand_total:,.2f} EGP")
print(f"Cash: {cash_val:,.2f} EGP ({(cash_val/grand_total)*100:.1f}%)")
print(f"Stock Equity: {total_equity:,.2f} EGP ({(total_equity/grand_total)*100:.1f}%)")
print("-" * 100)

for it in sorted(stocks, key=lambda x: (x.get('shares', 0) * x.get('currentPrice', x.get('buyPrice', 0))), reverse=True):
    t = it.get('ticker')
    if t == 'CASH': continue
    name = it.get('name', '')
    sh = it.get('shares', 0)
    buy = it.get('buyPrice', 0)
    cur = it.get('currentPrice', buy)
    val = sh * cur
    weight = (val / grand_total) * 100
    ret = ((cur - buy) / buy) * 100 if buy else 0
    pnl = (cur - buy) * sh
    s1 = it.get('pivotS1', 0)
    r1 = it.get('pivotR1', 0)
    print(f"{t:6} | {name:30} | Sh: {sh:5} | Buy: {buy:7.2f} | Cur: {cur:7.2f} | Val: {val:9.2f} ({weight:4.1f}%) | Ret: {ret:+6.2f}% ({pnl:+8.1f} EGP) | S1: {s1} | R1: {r1}")
