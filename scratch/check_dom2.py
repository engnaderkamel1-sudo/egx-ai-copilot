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
with open('scratch/dom_results.txt', 'w', encoding='utf-8') as f:
    for m in re.finditer(r'id="(metric-[^"]+)"[^>]*>(.*?)</div>', text, re.DOTALL):
        f.write(f"{m.group(1)}: {m.group(2).strip()}\n")
    m_banner = re.search(r'id="app-update-available-banner"[^>]*class="([^"]+)"', text)
    if m_banner:
        f.write(f"banner_class: {m_banner.group(1)}\n")
print("Saved to scratch/dom_results.txt")
