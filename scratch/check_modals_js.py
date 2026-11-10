import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/modals.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('trade-shares-input')
print(text[idx-500:idx+1500])
