import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/engine.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('isCoreAsset')
print(text[idx:idx+1200])
