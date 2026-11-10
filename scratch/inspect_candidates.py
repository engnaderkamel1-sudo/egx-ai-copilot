import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import subprocess, time, urllib.request

edge = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--remote-debugging-port=9227',
    '--user-data-dir=C:/Users/nader.reda/AppData/Local/Temp/edge_diag4',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
])

time.sleep(3)

from cdp_diagnose import make_ws_handshake, send_ws_frame, recv_ws_frame

try:
    with urllib.request.urlopen('http://127.0.0.1:9227/json') as res:
        pages = json.loads(res.read().decode('utf-8'))
        page = [p for p in pages if p.get('type') == 'page'][0]
        ws_url = page['webSocketDebuggerUrl']
        
    path = '/' + ws_url.split('/', 3)[3]
    ws = make_ws_handshake('127.0.0.1', 9227, path)
    
    send_ws_frame(ws, json.dumps({
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            (() => {
                const owned = new Set(portfolioData.map(p => p.ticker));
                const candidates = fullMarketRadar
                    .filter(m => m.ticker && !owned.has(m.ticker))
                    .map(m => {
                        const isCore = EGX_Engine.isCoreAsset(m);
                        const fv = typeof getFairValueInfo === 'function' ? getFairValueInfo(m.ticker, m.price) : null;
                        return {
                            ticker: m.ticker,
                            name: m.name,
                            score: m.score,
                            price: m.price,
                            isCore: isCore,
                            fairValue: fv ? fv.fairValue : null,
                            discountPct: fv ? fv.discountPct : null,
                            liquidityStatus: m.liquidityStatus
                        };
                    });
                return JSON.stringify(candidates);
            })()
            """
        }
    }))
    
    for _ in range(10):
        msg = recv_ws_frame(ws)
        if not msg: break
        data = json.loads(msg)
        if data.get('id') == 1:
            raw = data['result']['result']['value']
            candidates = json.loads(raw)
            print(f"Total non-owned candidates in radar: {len(candidates)}")
            for c in candidates:
                print(c)
            break
finally:
    edge.kill()
