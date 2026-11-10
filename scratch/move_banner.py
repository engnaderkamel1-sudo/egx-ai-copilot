# -*- coding: utf-8 -*-
with open('js/ui.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove duplicate renderMarketReadinessBanner from activeCat === 'marketOpportunities'
duplicate_banner = '''          cardsHtml = `
            ${renderMarketReadinessBanner(timingLight)}

            <!-- Segment 1: Core Long-Term Investment (النواة الآمنة) -->'''

clean_opps = '''          cardsHtml = `
            <!-- Segment 1: Core Long-Term Investment (النواة الآمنة) -->'''

if duplicate_banner in code:
    code = code.replace(duplicate_banner, clean_opps)
    print('Removed duplicate banner from marketOpportunities cardsHtml')
else:
    print('duplicate_banner not found in exact form')

# 2. Place renderMarketReadinessBanner above 6 Categorized Action Tabs
tabs_target = '''          <!-- 6 Categorized Action Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 overflow-x-auto pb-1">'''

tabs_replacement = '''          <!-- Permanent Global Market Readiness & Action Posture Banner -->
          ${renderMarketReadinessBanner((hubData && hubData.marketTimingLight) || ((typeof EGX_Engine !== 'undefined' && typeof EGX_Engine.getMarketTimingLight === 'function') ? EGX_Engine.getMarketTimingLight() : null))}

          <!-- 6 Categorized Action Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 overflow-x-auto pb-1">'''

if tabs_target in code:
    code = code.replace(tabs_target, tabs_replacement)
    print('Placed renderMarketReadinessBanner permanently above 6 Action Tabs')
else:
    print('tabs_target not found in exact form')

# 3. Change mb-5 to mb-3 in renderMarketReadinessBanner
code = code.replace('shadow-2xl mb-5 transition-all', 'shadow-2xl mb-3 transition-all')
print('Adjusted margin in renderMarketReadinessBanner')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('js/ui.js updated successfully')
