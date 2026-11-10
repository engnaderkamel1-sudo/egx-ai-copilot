with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

assert "const LOCAL_APP_VERSION = '2.7.2';" in text
text = text.replace("const LOCAL_APP_VERSION = '2.7.2';", "const LOCAL_APP_VERSION = '2.7.3';", 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

with open('index.html', 'r', encoding='utf-8') as f:
    idx_text = f.read()

count = idx_text.count('?v=2.7.2')
print(f"Replacing {count} occurrences of ?v=2.7.2 with ?v=2.7.3")
idx_text = idx_text.replace('?v=2.7.2', '?v=2.7.3')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_text)

print("Updated app.js and index.html to 2.7.3 successfully!")
