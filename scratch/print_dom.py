import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('scratch/dom_results.txt', 'r', encoding='utf-8') as f:
    text = f.read()

print(text[:500])
