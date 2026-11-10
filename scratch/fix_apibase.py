# fix_apibase.py
with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

old_str = 'const res = await fetch(`/version.json?_t=${Date.now()}`);'
new_str = '''const apiBase = (window.location.protocol === 'file:' || !window.location.host) ? 'https://egx-ai-copilot.vercel.app' : '';
        const res = await fetch(`${apiBase}/version.json?_t=${Date.now()}`);'''

assert old_str in text, 'old_str not found'
text = text.replace(old_str, new_str, 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(text)
print('SUCCESS_APP_JS_API_BASE')
