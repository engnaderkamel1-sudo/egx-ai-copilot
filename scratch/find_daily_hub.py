with open('js/app.js', encoding='utf-8') as f:
    for i, l in enumerate(f):
        if 'renderDailyActionHub' in l:
            print(f"app.js:{i+1}: {l.strip()}")

with open('js/ui.js', encoding='utf-8') as f:
    for i, l in enumerate(f):
        if 'renderDailyActionHub' in l:
            print(f"ui.js:{i+1}: {l.strip()}")
