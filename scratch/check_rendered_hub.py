import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

import subprocess, time

out = subprocess.check_output([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=5000',
    '--dump-dom',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
], stderr=subprocess.STDOUT).decode('utf-8', errors='ignore')

import re
m_tabs = re.findall(r'<button[^>]*action-hub-tab[^>]*>(.*?)</button>', out, re.DOTALL)
print(f"Tabs found: {len(m_tabs)}")
for t in m_tabs:
    # clean tags
    clean = re.sub(r'<[^>]+>', ' ', t).strip()
    clean = ' '.join(clean.split())
    print("Tab:", clean)

m_core = re.search(r'فرص استثمار طويل الأجل.*?(\d+)\s*فرص معتمدة', out)
if m_core:
    print(f"\nCore opportunities count in DOM: {m_core.group(1)}")
else:
    print("\nCore opportunities banner text:")
    m_core_any = re.search(r'فرص استثمار طويل الأجل.*?</p>', out, re.DOTALL)
    if m_core_any:
        print(m_core_any.group(0)[:300])
