import sys
sys.stdout.reconfigure(encoding='utf-8')
import glob

for p in glob.glob('js/*.js'):
    with open(p, encoding='utf-8') as f:
        for i, l in enumerate(f):
            if 'function openTradeModal' in l:
                print(f"{p}:{i+1}: {l.strip()}")
