import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('fullMarketRadar = [')
end = text.find('];', idx)
radar_text = text[idx:end]
tickers = re.findall(r"ticker:\s*'([A-Z0-9]+)'", radar_text)
print("Tickers in fullMarketRadar in js/state.js:", len(tickers), tickers)
