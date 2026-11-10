# -*- coding: utf-8 -*-
import subprocess

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    'file:///C:/Users/nader.reda/Documents/antigravity/intelligent-raman/scratch/test_voice_dom.html'
]

stderr_out = ''
try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=5)
    stderr_out = res.stderr
except subprocess.TimeoutExpired as e:
    stderr_out = e.stderr or ''

lines = [l for l in stderr_out.splitlines() if 'TEST_' in l or 'ALL_VOICE_' in l]
for l in lines:
    print(l.encode('ascii', errors='backslashreplace').decode('ascii'))
