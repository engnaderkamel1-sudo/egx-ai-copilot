import subprocess
import re

out = subprocess.check_output([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=5000',
    '--dump-dom',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
], stderr=subprocess.STDOUT)

text = out.decode('utf-8', errors='ignore')
for m in re.finditer(r'id="(metric-[^"]+)"[^>]*>(.*?)</div>', text, re.DOTALL):
    print(f"{m.group(1)}: {m.group(2).strip()[:100]}")
