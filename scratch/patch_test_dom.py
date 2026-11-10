# -*- coding: utf-8 -*-
with open('scratch/test_voice_dom.html', 'r', encoding='utf-8') as f:
    c = f.read()

target = 'console.log("TEST_CONSULT_INTENT: " + resConsult.intent + " | TICKER: " + resConsult.stock.ticker);'
replacement = 'console.log("TEST_CONSULT_DEBUG: " + JSON.stringify(resConsult));'
c = c.replace(target, replacement)

with open('scratch/test_voice_dom.html', 'w', encoding='utf-8') as f:
    f.write(c)
