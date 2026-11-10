import sys
sys.stdout.reconfigure(encoding='utf-8')
import socket
import base64
import os
import json
import urllib.request
import subprocess
import time
import struct

def make_ws_handshake(host, port, path):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    key = base64.b64encode(os.urandom(16)).decode('utf-8')
    req = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(req.encode('utf-8'))
    resp = s.recv(4096)
    assert b"101" in resp, f"Handshake failed: {resp}"
    return s

def send_ws_frame(s, text):
    data = text.encode('utf-8')
    length = len(data)
    frame = bytearray([0x81]) # FIN + text
    mask = os.urandom(4)
    if length < 126:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(struct.pack("!H", length))
    else:
        frame.append(0x80 | 127)
        frame.extend(struct.pack("!Q", length))
    frame.extend(mask)
    masked_data = bytearray(b ^ mask[i % 4] for i, b in enumerate(data))
    frame.extend(masked_data)
    s.sendall(frame)

def recv_ws_frame(s):
    hdr = s.recv(2)
    if not hdr: return None
    b1, b2 = hdr[0], hdr[1]
    length = b2 & 0x7f
    if length == 126:
        length = struct.unpack("!H", s.recv(2))[0]
    elif length == 127:
        length = struct.unpack("!Q", s.recv(8))[0]
    is_masked = bool(b2 & 0x80)
    if is_masked:
        mask = s.recv(4)
    data = bytearray()
    while len(data) < length:
        chunk = s.recv(min(4096, length - len(data)))
        if not chunk: break
        data.extend(chunk)
    if is_masked:
        data = bytearray(b ^ mask[i % 4] for i, b in enumerate(data))
    return data.decode('utf-8', errors='ignore')

# 1. Start Edge
edge = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:/Users/nader.reda/AppData/Local/Temp/edge_debug_profile2',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
])

time.sleep(2)

try:
    with urllib.request.urlopen('http://127.0.0.1:9225/json') as res:
        pages = json.loads(res.read().decode('utf-8'))
        page = [p for p in pages if p.get('type') == 'page'][0]
        ws_url = page['webSocketDebuggerUrl']
        
    path = '/' + ws_url.split('/', 3)[3]
    ws = make_ws_handshake('127.0.0.1', 9225, path)
    
    # Enable Console and Runtime
    send_ws_frame(ws, json.dumps({"id": 1, "method": "Console.enable"}))
    send_ws_frame(ws, json.dumps({"id": 2, "method": "Runtime.enable"}))
    
    # Evaluate expressions
    exprs = [
        "window.isAppBooted",
        "typeof updateMetrics",
        "Array.isArray(portfolioData) ? portfolioData.length : 'not array'",
        "document.getElementById('metric-total-wealth') ? document.getElementById('metric-total-wealth').innerHTML : 'missing el'",
        "window.__lastError || 'no global error captured'"
    ]
    
    time.sleep(1)
    
    for i, expr in enumerate(exprs):
        msg_id = 10 + i
        send_ws_frame(ws, json.dumps({
            "id": msg_id,
            "method": "Runtime.evaluate",
            "params": {"expression": expr}
        }))
        
    # Read responses
    for _ in range(15):
        msg = recv_ws_frame(ws)
        if not msg: break
        data = json.loads(msg)
        if 'id' in data and data['id'] >= 10:
            res_obj = data.get('result', {}).get('result', {})
            print(f"Eval {data['id']}: {res_obj}")
        elif 'method' in data:
            if 'console' in data['method'].lower() or 'exception' in data['method'].lower():
                print(f"EVENT: {data['method']} => {data.get('params')}")

finally:
    edge.kill()
