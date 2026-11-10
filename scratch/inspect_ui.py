import sys

with open('js/ui.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in ui.js: {len(lines)}")

# Let's inspect lines 984 to 1250
with open('scratch/portfolio_table_dump.txt', 'w', encoding='utf-8') as out:
    for i in range(980, min(1250, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Dumped portfolio table lines 980-1250 to scratch/portfolio_table_dump.txt")
