import sys
sys.stdout.reconfigure(encoding='utf-8')
import glob

for p in ['index.html'] + glob.glob('js/*.js'):
    with open(p, encoding='utf-8') as f:
        text = f.read()
        if 'trade-shares-input' in text:
            print(f"Found in {p}")
