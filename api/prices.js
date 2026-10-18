// /api/prices.js
// Live EGX Stock Prices Provider using TradingView Egypt Scanner

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.query && req.query._t) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const tickers = [
      "EGX:ORAS", "EGX:COMI", "EGX:SWDY", "EGX:ABUK", "EGX:HDBK",
      "EGX:TMGH", "EGX:EGAL", "EGX:ARCC", "EGX:RAYA", "EGX:CLHO",
      "EGX:AMOC", "EGX:ETEL", "EGX:FWRY", "EGX:ESRS", "EGX:SKPC",
      "EGX:EKHO", "EGX:ISPH", "EGX:MFPC", "EGX:JUFO", "EGX:CERA"
    ];

    const body = {
      filter: [],
      options: { lang: "en" },
      symbols: { query: { types: [] }, tickers },
      columns: ["name", "close", "change", "volume", "high", "low", "open"]
    };

    const response = await fetch("https://scanner.tradingview.com/egypt/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`TradingView scanner responded with status ${response.status}`);
    }

    const data = await response.json();
    const prices = {};

    if (data && data.data) {
      data.data.forEach(item => {
        const symbol = item.s.replace("EGX:", "");
        prices[symbol] = {
          ticker: symbol,
          name: item.d[0],
          price: Number(item.d[1]),
          changePct: Number(item.d[2]),
          volume: Number(item.d[3]),
          high: Number(item.d[4]),
          low: Number(item.d[5]),
          open: Number(item.d[6])
        };
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      source: "TradingView Live EGX Scanner",
      prices
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
