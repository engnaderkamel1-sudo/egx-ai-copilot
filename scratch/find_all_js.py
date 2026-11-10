import glob, re

with open('scratch/all_js_tiny.txt', 'w', encoding='utf-8') as out:
    for fpath in glob.glob('js/*.js'):
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for i, l in enumerate(lines):
            if re.search(r'text-\[(?:7|8|8\.5|9|9\.5)px\]|text-gray-500', l):
                out.write(f"{fpath}:{i+1}: {l.strip()}\n")

print("Dumped all JS tiny and gray lines to scratch/all_js_tiny.txt")
