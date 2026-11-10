import subprocess

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--enable-logging=stderr',
    '--v=1',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
]

res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
stderr_text = res.stderr.decode('utf-8', errors='ignore')
with open('scratch/edge_errors.txt', 'w', encoding='utf-8') as f:
    f.write(stderr_text)
print("Saved stderr, length:", len(stderr_text))
