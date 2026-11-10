import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderDailyActionHub')
print(text[idx+2500:idx+4000])
