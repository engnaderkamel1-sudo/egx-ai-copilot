import sys
sys.stdout.reconfigure(encoding='utf-8')
import re, json

with open('js/portfolio.js', encoding='utf-8') as f:
    text_p = f.read()

with open('js/state.js', encoding='utf-8') as f:
    text_s = f.read()

# Parse portfolioData tickers
# Let's find defaultPortfolioData
idx = text_p.find('const defaultPortfolioData = [')
end = text_p.find('];', idx)
p_tickers = re.findall(r'"ticker":\s*"([A-Z0-9]+)"', text_p[idx:end])
print("Portfolio tickers:", p_tickers)

# Parse fullMarketRadar items
idx_r = text_s.find('fullMarketRadar = [')
end_r = text_s.find('];', idx_r)
radar_block = text_s[idx_r:end_r]

# Parse each item
items = radar_block.split('{\n')
for item in items[1:]:
    t_m = re.search(r"ticker:\s*'([A-Z0-9]+)'", item)
    s_m = re.search(r"score:\s*(\d+)", item)
    if t_m:
        ticker = t_m.group(1)
        score = int(s_m.group(1)) if s_m else None
        is_owned = ticker in p_tickers
        passed = (not is_owned) and (score is not None and score >= 75)
        print(f"Ticker: {ticker:6} | Score: {score} | Owned: {is_owned} | Filter Passed: {passed}")
