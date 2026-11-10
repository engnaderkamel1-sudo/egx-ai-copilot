files = ['js/state.js', 'js/app.js', 'js/ui.js']
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    counts = {b: 0 for b in '(){}[]'}
    for ch in content:
        if ch in counts:
            counts[ch] += 1
    print(f"{fpath}: ()={counts['(']} vs {counts[')']}, {{}}={counts['{']} vs {counts['}']}, []={counts['[']} vs {counts[']']}")
    assert counts['('] == counts[')'], f"Mismatch () in {fpath}"
    assert counts['{'] == counts['}'], f"Mismatch {{}} in {fpath}"
    assert counts['['] == counts[']'], f"Mismatch [] in {fpath}"
print("ALL_BRACKETS_BALANCED_PERFECTLY")
