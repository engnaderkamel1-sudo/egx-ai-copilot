# -*- coding: utf-8 -*-
import subprocess

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

html = """<!DOCTYPE html>
<html lang="ar">
<head><meta charset="utf-8"></head>
<body>
<script src="../js/voice-assistant.js"></script>
<script>
  const str = 'سهم طلعت مصطفى';
  console.log('RAW: ' + str);
  console.log('NORMALIZED: ' + window.lookupDynamicStock('طلعت مصطفى'));
  const res = window.parseEgyptianVoiceCommand(str);
  console.log('PARSE_RESULT: ' + JSON.stringify(res));
</script>
</body>
</html>
"""
with open('scratch/debug_voice.html', 'w', encoding='utf-8') as f:
    f.write(html)

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    'file:///C:/Users/nader.reda/Documents/antigravity/intelligent-raman/scratch/debug_voice.html'
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=5)
for l in res.stderr.splitlines():
    if 'RAW:' in l or 'NORMALIZED:' in l or 'PARSE_RESULT:' in l:
        print(l.encode('ascii', errors='backslashreplace').decode('ascii'))
