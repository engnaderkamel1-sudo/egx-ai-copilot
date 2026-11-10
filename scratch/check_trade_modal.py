import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function openTradeModal')
if idx != -1:
    print('In ui.js:', text[idx:idx+600])
else:
    print('Not in ui.js')
