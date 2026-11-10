import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request, json

# 1. Fetch live TradingView scan
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
        "columns": [
            "name", "description", "close", "change", "volume", "Value.Traded",
            "high", "low", "open", "RSI", "Recommend.All",
            "SMA50", "SMA200", "Pivot.M.Classic.R1", "Pivot.M.Classic.S1",
            "Pivot.M.Classic.R2", "Pivot.M.Classic.S2", "MACD.macd", "MACD.signal",
            "price_52_week_high", "price_52_week_low", "price_earnings_ttm",
            "earnings_per_share_basic_ttm", "operating_margin", "net_margin",
            "dividend_yield_recent", "price_book_ratio", "relative_volume_10d_calc", "average_volume_30d_calc"
        ],
        "sort": {"sortBy": "Value.Traded", "sortOrder": "desc"},
        "range": [0, 40]
    }).encode('utf-8')
)

with urllib.request.urlopen(req) as resp:
    tv_data = json.loads(resp.read().decode('utf-8'))

print(f"Fetched {len(tv_data['data'])} records from TradingView")

# Save to scratch/tv_sample.json
with open('scratch/tv_sample.json', 'w', encoding='utf-8') as f:
    json.dump(tv_data, f, ensure_ascii=False, indent=2)

print("Saved sample to scratch/tv_sample.json")
