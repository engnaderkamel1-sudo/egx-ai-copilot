import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

# Let's run a browser script via CDP to evaluate and inspect the exact runtime state of `actionHub`!
import subprocess, time, urllib.request

edge = subprocess.Popen([
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--remote-debugging-port=9226',
    '--user-data-dir=C:/Users/nader.reda/AppData/Local/Temp/edge_diag3',
    'file:///c:/Users/nader.reda/Documents/antigravity/intelligent-raman/index.html'
])

time.sleep(3)

from cdp_diagnose import make_ws_handshake, send_ws_frame, recv_ws_frame

try:
    with urllib.request.urlopen('http://127.0.0.1:9226/json') as res:
        pages = json.loads(res.read().decode('utf-8'))
        page = [p for p in pages if p.get('type') == 'page'][0]
        ws_url = page['webSocketDebuggerUrl']
        
    path = '/' + ws_url.split('/', 3)[3]
    ws = make_ws_handshake('127.0.0.1', 9226, path)
    
    send_ws_frame(ws, json.dumps({
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            (() => {
                const hub = EGX_Engine.buildActionHubCategories({
                    portfolioData: portfolioData,
                    fullMarketRadar: fullMarketRadar,
                    cashBalance: 18197,
                    totalDryPowder: 18197
                });
                
                const owned = portfolioData.map(p => ({
                    ticker: p.ticker,
                    action: p.action,
                    rsi: p.rsi,
                    returnPct: p.returnPct,
                    isSupportBroken: p.isSupportBroken
                }));

                const radarSample = fullMarketRadar.map(r => {
                    const fv = typeof getFairValueInfo === 'function' ? getFairValueInfo(r.ticker, r.price) : null;
                    return {
                        ticker: r.ticker,
                        isCore: EGX_Engine.isCoreAsset(r),
                        score: r.score,
                        price: r.price,
                        fairVal: fv ? fv.fairValue : null,
                        discountPct: fv ? fv.discountPct : null
                    };
                });
                
                return JSON.stringify({
                    categoriesCount: {
                        profitTaking: hub.profitTaking.length,
                        riskDefense: hub.riskDefense.length,
                        safetyLevelUpdates: hub.safetyLevelUpdates.length,
                        accumulation: hub.accumulation.length,
                        marketOpportunities: hub.marketOpportunities.length,
                        coreOpportunities: (hub.marketOpportunities.coreOpportunities || []).length,
                        satelliteOpportunities: (hub.marketOpportunities.satelliteOpportunities || []).length,
                        waitAndHold: hub.waitAndHold.length
                    },
                    owned: owned,
                    radarCandidates: radarSample.filter(r => !portfolioData.some(p => p.ticker === r.ticker))
                });
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
            parsed = json.loads(raw)
            print("Categories count:", json.dumps(parsed['categoriesCount'], indent=2, ensure_ascii=False))
            print("\nRadar candidates not owned:")
            for r in parsed['radarCandidates'][:15]:
                print(r)
            break
finally:
    edge.kill()
