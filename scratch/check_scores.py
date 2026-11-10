import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('js/state.js', encoding='utf-8') as f:
    text = f.read()

for t in ['JUFO', 'ALCN', 'OCDI', 'HRHO', 'ESRS', 'SKPC']:
    pos = text.find(f"ticker: '{t}'")
    if pos != -1:
        block = text[pos:pos+400]
        score_match = re.search(r"score:\s*(\d+)", block)
        score = score_match.group(1) if score_match else "NO SCORE"
        print(f"{t}: score = {score}")
