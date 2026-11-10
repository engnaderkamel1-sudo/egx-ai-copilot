with open('js/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find occurrences of text-[8 or text-[9 in js/ui.js and show line numbers
lines = content.splitlines()
matches = []
for i, line in enumerate(lines):
    if re.search(r'text-\[(?:7|8|8\.5|9|9\.5)px\]|text-gray-500|text-gray-600', line):
        matches.append((i+1, line.strip()))

print(f"Found {len(matches)} lines with tiny font or dark gray in ui.js")
with open('scratch/ui_matches.txt', 'w', encoding='utf-8') as out:
    for num, l in matches:
        out.write(f"Line {num}: {l}\n")
