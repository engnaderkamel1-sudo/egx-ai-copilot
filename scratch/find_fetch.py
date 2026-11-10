with open('js/app.js', encoding='utf-8') as f:
    for i, l in enumerate(f):
        if 'fetchLiveEGXPrices' in l:
            print(f"{i+1}: {l.strip()}")
