# test_edge_console.py
import subprocess
import time

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
# We test against local file or local server, or we can test parsing js/app.js directly in edge
cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    'file:///C:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
]

stderr_out = ''
try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=8)
    stderr_out = res.stderr
except subprocess.TimeoutExpired as e:
    stderr_out = e.stderr or ''

console_lines = [l for l in stderr_out.splitlines() if 'CONSOLE' in l]
errors = []
for cl in console_lines:
    if 'Tracking Prevention' not in cl:
        errors.append(cl)

print(f"Total relevant console lines: {len(errors)}")
for e in errors:
    try:
        print("LOG:", e.encode('ascii', errors='backslashreplace').decode('ascii'))
    except Exception:
        pass
