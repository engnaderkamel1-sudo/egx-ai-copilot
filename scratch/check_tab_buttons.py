import sys
sys.stdout.reconfigure(encoding='utf-8')
import re, subprocess

out = subprocess.check_output([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=5000',
    '--dump-dom',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
], stderr=subprocess.STDOUT).decode('utf-8', errors='ignore')

for m in re.finditer(r'<button[^>]*switchActionHubCategory\(\'([^\']+)\'\)[^>]*>(.*?)</button>', out, re.DOTALL):
    clean = re.sub(r'<[^>]+>', ' ', m.group(2)).strip()
    clean = ' '.join(clean.split())
    print(f"Tab '{m.group(1)}': {clean}")

# Check Core opportunities text
m_core = re.search(r'فرص استثمار طويل الأجل.*?(\d+)\s*فرص معتمدة', out, re.DOTALL)
if m_core:
    print(f"\nCore opportunities: {m_core.group(1)} فرص معتمدة")
else:
    print("\nCore opportunities not currently the active tab or empty")
