with open('js/engine.js', encoding='utf-8') as f:
    text = f.read()

idx = text.find('generateDailyActionHub')
print(text[idx:idx+1500])
