import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const EGX_DICTIONARY = {')
end = text.find('};', idx)
dict_text = text[idx:end+2]

import re
egx30_tickers = []
for line in dict_text.splitlines():
    m = re.search(r'"([A-Z0-9]+)":\s*\{\s*name:\s*"([^"]+)",\s*sector:\s*"([^"]+)",\s*index:\s*"([^"]+)"', line)
    if m:
        t, n, s, ind = m.groups()
        if ind == 'egx30':
            egx30_tickers.append((t, n, s))

print(f"Total egx30 in EGX_DICTIONARY: {len(egx30_tickers)}")
for t in egx30_tickers:
    print(t)
