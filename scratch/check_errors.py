# check_errors.py
import subprocess
import time
import json
import urllib.request

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
user_data = r'C:\Users\nader.reda\AppData\Local\Temp\edge_debug_profile'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    f'--user-data-dir={user_data}',
    '--remote-debugging-port=9222',
    'https://egx-ai-copilot.vercel.app'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

time.sleep(3)

try:
    with urllib.request.urlopen('http://localhost:9222/json') as r:
        tabs = json.loads(r.read().decode('utf-8'))
    print("Found tabs:", len(tabs))
    target_tab = tabs[0]
    ws_url = target_tab.get('webSocketDebuggerUrl')
    print("WS URL:", ws_url)
finally:
    proc.terminate()
