import socket
import base64
import os
import json
import urllib.request
import subprocess
import time

# 1. Start Edge with remote debugging
edge = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--remote-debugging-port=9224',
    '--user-data-dir=C:/Users/nader.reda/AppData/Local/Temp/edge_debug_profile',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
])

time.sleep(2)

try:
    with urllib.request.urlopen('http://127.0.0.1:9224/json') as res:
        pages = json.loads(res.read().decode('utf-8'))
        page = [p for p in pages if p.get('type') == 'page'][0]
        ws_url = page['webSocketDebuggerUrl']
        print('Found ws_url:', ws_url)
finally:
    edge.kill()
