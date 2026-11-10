with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/index_matches.txt', 'w', encoding='utf-8') as out:
    for i, l in enumerate(lines):
        if 'text-gray-500' in l or any(k in l for k in ['text-[8', 'text-[9']):
            out.write(f"{i+1}: {l.strip()}\n")

print("Dumped index matches to scratch/index_matches.txt")
