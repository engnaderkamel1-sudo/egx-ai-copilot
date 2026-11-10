import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

# Let's inspect via Edge cdp_diagnose
import subprocess, time, urllib.request

edge = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--remote-debugging-port=9228',
    '--user-data-dir=C:/Users/nader.reda/AppData/Local/Temp/edge_diag5',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
])

time.sleep(3)

from cdp_diagnose import make_ws_handshake, send_ws_frame, recv_ws_frame

try:
    with urllib.request.urlopen('http://127.0.0.1:9228/json') as res:
        pages = json.loads(res.read().decode('utf-8'))
        page = [p for p in pages if p.get('type') == 'page'][0]
        ws_url = page['webSocketDebuggerUrl']
        
    path = '/' + ws_url.split('/', 3)[3]
    ws = make_ws_handshake('127.0.0.1', 9228, path)
    
    send_ws_frame(ws, json.dumps({
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            (() => {
                const hub = EGX_Engine.generateDailyActionHub(portfolioData, fullMarketRadar, 18197);
                const core = (hub.categories.marketOpportunities.coreOpportunities || []).map(c => ({
                    ticker: c.ticker,
                    name: c.name,
                    price: c.price,
                    fairValue: c.fairValue,
                    discountPct: c.fairValueDiscountPct,
                    suggestedBuyPrice: c.suggestedBuyPrice,
                    liquidityStatus: c.liquidityStatus
                }));
                const sat = (hub.categories.marketOpportunities.satelliteOpportunities || []).map(s => ({
                    ticker: s.ticker,
                    name: s.name,
                    price: s.price,
                    fairValue: s.fairValue,
                    discountPct: s.fairValueDiscountPct,
                    suggestedBuyPrice: s.suggestedBuyPrice
                }));
                return JSON.stringify({ core, sat });
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
            res = json.loads(raw)
            print("=== CORE OPPORTUNITIES ===")
            for c in res['core']:
                print(c)
            print("\n=== SATELLITE OPPORTUNITIES ===")
            for s in res['sat']:
                print(s)
            break
finally:
    edge.kill()
