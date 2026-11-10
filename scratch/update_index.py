# update_index.py
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

old_banner = '<div id="oed-emergency-banner" class="hidden sticky top-14 z-40 bg-rose-50/95 dark:bg-rose-950/90 border-b-2 border-rose-300 dark:border-rose-700/60 shadow-lg px-4 py-2.5 transition-all animate-slide-down">'
new_banner = '<div id="oed-emergency-banner" class="hidden sticky top-14 z-50 bg-rose-50/95 dark:bg-rose-950/90 border-b-2 border-rose-300 dark:border-rose-700/60 shadow-xl px-4 py-3 transition-all animate-slide-down">'
assert old_banner in text, 'old_banner not found'
text = text.replace(old_banner, new_banner, 1)

radar_marker = '<div id="view-radar" class="view-panel hidden space-y-6">\n      \n      <!-- Filter & Search Controls Header -->'
widgets_insert = '''<div id="view-radar" class="view-panel hidden space-y-6">
      
      <!-- Market Breadth & Systemic Liquidity Pulse (Live EGX Visual Gauge) -->
      <div id="market-breadth-pulse-widget" class="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-xl transition-all">
        <!-- Rendered dynamically by renderMarketBreadthWidget() -->
      </div>

      <!-- User Active Thndr Pending Orders Tracker (Direct Synchronization Guardrail) -->
      <div id="thndr-pending-orders-widget" class="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-xl transition-all">
        <!-- Rendered dynamically by renderPendingThndrOrdersUI() -->
      </div>

      <!-- Filter & Search Controls Header -->'''
assert radar_marker in text, 'radar_marker not found'
text = text.replace(radar_marker, widgets_insert, 1)

text = text.replace('?v=2.4.5', '?v=2.4.6')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text.replace('\n', '\r\n'))

print('SUCCESS_INDEX_UPDATED')
