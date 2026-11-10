import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('api/prices.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(370, 420):
    print(f"{i+1}: {lines[i]}", end='')
