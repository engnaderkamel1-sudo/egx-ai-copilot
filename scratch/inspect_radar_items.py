import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('fullMarketRadar = [')
end = text.find('];', idx)
radar_text = text[idx:end]

for t in ['JUFO', 'ALCN', 'OCDI', 'HRHO', 'ESRS', 'SKPC']:
    pos = radar_text.find(f"ticker: '{t}'")
    if pos != -1:
        print(f"=== {t} ===")
        print(radar_text[pos:pos+400])
