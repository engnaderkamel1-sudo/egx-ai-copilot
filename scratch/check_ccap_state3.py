import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find("ticker: 'CCAP'")
print(text[idx+400:idx+700])
