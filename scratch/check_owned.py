with open('js/portfolio.js', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'"ticker":\s*"([A-Z0-9]+)"', text[:10000])
print('Owned tickers in defaultPortfolioData:', set(matches))
