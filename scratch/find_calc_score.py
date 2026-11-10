with open('api/prices.js', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f):
        if 'calculatedScore' in l:
            print(f"{i+1}: {l.strip()}")
