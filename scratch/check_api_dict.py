import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('api/prices.js', encoding='utf-8') as f:
    text = f.read()

for t in ['PHDC', 'EMFD', 'ETEL', 'GBCO', 'PHAR', 'CIEB', 'ADIB']:
    print(f"{t} in EGX_DICTIONARY:", f'"{t}":' in text)
