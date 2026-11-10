# test_all_features.py
import re

# 1. Check index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

assert 'id="market-breadth-pulse-widget"' in html, "market-breadth-pulse-widget missing"
assert 'id="thndr-pending-orders-widget"' in html, "thndr-pending-orders-widget missing"
assert 'id="oed-emergency-banner"' in html, "oed-emergency-banner missing"
assert 'z-50' in html, "z-50 missing on banner"
assert '?v=2.4.7' in html, "v=2.4.7 version bump missing"
assert '?v=2.4.6' not in html, "old v=2.4.6 still present"
print("[OK] index.html checks passed")

# 2. Check js/state.js
with open('js/state.js', 'r', encoding='utf-8') as f:
    state_js = f.read()

assert 'PENDING_ORDERS_STORAGE_KEY' in state_js, "PENDING_ORDERS_STORAGE_KEY missing"
assert 'loadPendingThndrOrders' in state_js, "loadPendingThndrOrders missing"
assert 'getPendingBuyOrders' in state_js, "getPendingBuyOrders missing"
assert 'egx_market_regime' in state_js, "localStorage market regime caching missing"
print("[OK] js/state.js checks passed")

# 3. Check js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

assert 'getPendingBuyOrders' in app_js, "getPendingBuyOrders call missing in app.js"
assert 'OPEN_THNDR' in app_js, "OPEN_THNDR action type missing"
assert 'https://app.thndr.app' in app_js, "thndr web app link missing"
assert 'loadPendingThndrOrders' in app_js, "loadPendingThndrOrders missing in bootApp"
print("[OK] js/app.js checks passed")

# 4. Check js/ui.js
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_js = f.read()

assert 'function renderMarketBreadthWidget' in ui_js, "renderMarketBreadthWidget missing"
assert 'function renderPendingThndrOrdersUI' in ui_js, "renderPendingThndrOrdersUI missing"
assert 'function openAddThndrOrderPrompt' in ui_js, "openAddThndrOrderPrompt missing"
assert 'window.renderMarketBreadthWidget' in ui_js, "window.renderMarketBreadthWidget missing"
assert 'window.renderPendingThndrOrdersUI' in ui_js, "window.renderPendingThndrOrdersUI missing"
assert 'window.openAddThndrOrderPrompt' in ui_js, "window.openAddThndrOrderPrompt missing"
print("[OK] js/ui.js checks passed")

print("ALL VERIFICATION CHECKS PASSED 100%!")
