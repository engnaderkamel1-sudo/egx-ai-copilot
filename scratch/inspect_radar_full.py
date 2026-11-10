import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('fullMarketRadar = [')
end = text.find('];', idx)
radar_text = text[idx:end]

for t in ['JUFO', 'ALCN', 'OCDI', 'HRHO', 'SKPC']:
    pos = radar_text.find(f"ticker: '{t}'")
    pos_end = radar_text.find('}', pos)
    print(f"=== {t} ===")
    print(radar_text[pos:pos_end+1])
