import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request, json

req = urllib.request.Request(
    "https://scanner.tradingview.com/egypt/scan",
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    data=json.dumps({
        "filter": [
            {"left": "volume", "operation": "greater", "right": 10000},
            {"left": "Value.Traded", "operation": "greater", "right": 2500000}
        ],
        "options": {"lang": "en"},
        "symbols": {"query": {"types": ["stock"]}},
        "columns": ["name", "description", "close", "change", "volume", "Value.Traded"],
        "sort": {"sortBy": "Value.Traded", "sortOrder": "desc"},
        "range": [0, 40]
    }).encode('utf-8')
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Total returned from TradingView: {len(data.get('data', []))}")
        for row in data.get('data', []):
            symbol = row['s'].replace('EGX:', '')
            close = row['d'][2]
            traded_val = row['d'][5]
            print(f"Ticker: {symbol:8} | Close: {close:8} | TradedVal: {traded_val/1e6:.1f}M")
except Exception as e:
    print("Error querying TradingView:", e)
