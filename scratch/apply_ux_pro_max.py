import re

print("=== Starting UX/UI Pro Max Overhaul ===")

# -------------------------------------------------------------
# 1. Update index.html
# -------------------------------------------------------------
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# A. Header adjustments:
# Ensure active-tab-title has truncate and responsive max-w
old_header_title = '<h2 id="active-tab-title" class="text-base sm:text-lg font-bold text-white tracking-wide">المحفظة وتوزيع الأصول</h2>'
new_header_title = '<h2 id="active-tab-title" class="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">المحفظة وتوزيع الأصول</h2>'

if old_header_title in html:
    html = html.replace(old_header_title, new_header_title)
    print("Patched active-tab-title truncate in index.html")
else:
    print("Notice: old_header_title not matched exactly")

# Make desktop-only buttons hidden on mobile in header
old_sim_btn = '<button onclick="switchTab(\'simulation\')" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-600/40 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="مختبر المحاكاة وتدريب الذكاء الاصطناعي (AI Scenario Lab)">'
new_sim_btn = '<button onclick="switchTab(\'simulation\')" class="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-600/40 transition items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0" title="مختبر المحاكاة وتدريب الذكاء الاصطناعي (AI Scenario Lab)">'
if old_sim_btn in html:
    html = html.replace(old_sim_btn, new_sim_btn)
    print("Patched simulation button responsive in header")

old_sanity_btn = '<button onclick="openSanityAuditModal()" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="درع التدقيق الذاتي ومنع التناقضات (AI Sanity Shield)">'
new_sanity_btn = '<button onclick="openSanityAuditModal()" class="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0" title="درع التدقيق الذاتي ومنع التناقضات (AI Sanity Shield)">'
if old_sanity_btn in html:
    html = html.replace(old_sanity_btn, new_sanity_btn)
    print("Patched sanity button responsive in header")

old_pos_btn = '<button onclick="openPositionSizingModal()" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="حاسبة حجم المركز وإدارة المخاطر (2% Risk)">'
new_pos_btn = '<button onclick="openPositionSizingModal()" class="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 transition items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0" title="حاسبة حجم المركز وإدارة المخاطر (2% Risk)">'
if old_pos_btn in html:
    html = html.replace(old_pos_btn, new_pos_btn)
    print("Patched position sizing button responsive in header")

# Enhance voice button in header
old_hdr_voice = '<button onclick="openVoiceTradingModal()" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-500/50 transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer" title="المساعد الصوتي الذكي (أوامر التداول وتعديل الحدود)">\n            <i data-lucide="mic" class="w-4 h-4 text-purple-300"></i>\n            <span class="hidden sm:inline">أمر صوتي</span>\n          </button>'
new_hdr_voice = '<button onclick="openVoiceTradingModal()" class="px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/50 transition flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer shrink-0" title="المساعد الصوتي الذكي (أوامر التداول وتعديل الحدود)">\n            <i data-lucide="mic" class="w-4 h-4 text-white animate-pulse"></i>\n            <span class="font-bold text-[11px] sm:text-xs">صوتي</span>\n          </button>'
if old_hdr_voice in html:
    html = html.replace(old_hdr_voice, new_hdr_voice)
    print("Patched header voice button to high contrast pill")

# Ensure header has overflow-x-hidden and gap-2
old_header_tag = '<header class="sticky top-0 z-30 bg-[#0e1424]/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">'
new_header_tag = '<header class="sticky top-0 z-30 bg-[#0e1424]/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 overflow-x-hidden">'
if old_header_tag in html:
    html = html.replace(old_header_tag, new_header_tag)
    print("Patched header tag responsive classes")

# B. Table header buttons banner in view-portfolio:
old_table_buttons = '''          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="openVoiceTradingModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/50 transform active:scale-95" title="تسجيل صفقة أو تعديل حد أمان صوتياً بالذكاء الاصطناعي">
              <i data-lucide="mic" class="w-4 h-4 text-purple-200 animate-pulse"></i>
              <span>🎙️ أمر صوتي ذكي</span>
            </button>
            <button onclick="openTradeModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 transform active:scale-95" title="تسجيل عملية شراء أو بيع نفذتها في ثندر">
              <i data-lucide="arrow-left-right" class="w-4 h-4 text-emerald-200"></i>
              <span>+ تسجيل صفقة (شراء / بيع)</span>
            </button>
            <button onclick="fetchLiveEGXPricesAndReevaluate()" id="btn-live-egx-refresh" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950/50 transform active:scale-95" title="سحب أحدث أسعار البورصة المصرية وإعادة اتخاذ القرارات وحساب الأرباح فوراً">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300" id="icon-live-egx-refresh"></i>
              <span id="btn-refresh-text">⚡ تحديث الأسعار اللحظية</span>
            </button>
            <button onclick="forceFreshSync()" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-700/50 text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95" title="مزامنة فورية للأسعار وإعادة تقييم المحفظة دون حذف بياناتك">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>مزامنة نظيفة 🔄</span>
            </button>
            <button onclick="hardResetPortfolioToDefault()" class="px-2.5 py-2 rounded-xl bg-gray-800/80 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-gray-700 hover:border-rose-800/50 text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95" title="استعادة المحفظة الافتراضية الأصلية (مع تأكيد الحذف)">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>استعادة الافتراضي</span>
            </button>
            <div id="live-auto-countdown-badge" class="px-3 py-2 rounded-xl bg-gray-950 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center gap-1.5 shadow-sm" title="العداد التنازلي لنبض التحديث التلقائي">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>تحديث تلقائي خلال: <strong id="live-countdown-secs" class="text-white font-bold">60</strong> ث</span>
            </div>
            <span class="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700" id="assets-count-badge">12 أصل مالي</span>
          </div>'''

new_table_buttons = '''          <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto">
            <button onclick="openVoiceTradingModal()" class="col-span-1 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/50 transform active:scale-95 cursor-pointer" title="تسجيل صفقة أو تعديل حد أمان صوتياً بالذكاء الاصطناعي">
              <i data-lucide="mic" class="w-4 h-4 text-purple-200 animate-pulse shrink-0"></i>
              <span class="truncate">🎙️ أمر صوتي</span>
            </button>
            <button onclick="openTradeModal()" class="col-span-1 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transform active:scale-95 cursor-pointer" title="تسجيل عملية شراء أو بيع نفذتها في ثندر">
              <i data-lucide="arrow-left-right" class="w-4 h-4 text-emerald-200 shrink-0"></i>
              <span class="truncate">+ صفقة جديدة</span>
            </button>
            <button onclick="fetchLiveEGXPricesAndReevaluate()" id="btn-live-egx-refresh" class="col-span-1 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 transform active:scale-95 cursor-pointer" title="سحب أحدث أسعار البورصة المصرية وإعادة اتخاذ القرارات وحساب الأرباح فوراً">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300 shrink-0" id="icon-live-egx-refresh"></i>
              <span id="btn-refresh-text" class="truncate">⚡ تحديث الأسعار</span>
            </button>
            <button onclick="forceFreshSync()" class="col-span-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer" title="مزامنة فورية للأسعار وإعادة تقييم المحفظة دون حذف بياناتك">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-cyan-400 shrink-0"></i>
              <span class="truncate">مزامنة نظيفة 🔄</span>
            </button>
            <button onclick="hardResetPortfolioToDefault()" class="col-span-2 sm:col-span-1 px-2.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800/50 text-xs font-semibold transition flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer" title="استعادة المحفظة الافتراضية الأصلية (مع تأكيد الحذف)">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 shrink-0"></i>
              <span class="truncate">استعادة الافتراضي</span>
            </button>
            <div id="live-auto-countdown-badge" class="col-span-2 sm:col-span-1 px-3 py-2 rounded-xl bg-slate-950 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 shadow-sm" title="العداد التنازلي لنبض التحديث التلقائي">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>تحديث تلقائي: <strong id="live-countdown-secs" class="text-white font-bold">60</strong> ث</span>
            </div>
            <span class="col-span-2 sm:col-span-1 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-center font-bold" id="assets-count-badge">12 أصل مالي</span>
          </div>'''

# Normalize newlines for replacement
if old_table_buttons.replace('\r\n', '\n') in html.replace('\r\n', '\n'):
    html = html.replace('\r\n', '\n').replace(old_table_buttons.replace('\r\n', '\n'), new_table_buttons.replace('\r\n', '\n'))
    print("Patched table buttons banner into responsive grid")
else:
    print("Notice: table buttons banner not matched directly")

# C. Add Floating Action Button (FAB) for Voice Assistant:
fab_html = '''
    <!-- Floating Voice Assistant Action Button (Always Accessible on Mobile & Desktop) -->
    <div id="floating-voice-widget" class="fixed bottom-6 left-5 z-40 flex items-center">
      <button type="button" onclick="openVoiceTradingModal()" class="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-950/80 border-2 border-purple-400/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" title="المساعد الصوتي الذكي (تحدث لتسجيل الصفقات وتعديل الحدود)">
        <span class="absolute -inset-0.5 rounded-full bg-purple-500/40 blur-sm group-hover:blur-md transition -z-10 animate-pulse"></span>
        <span class="w-2 h-2 rounded-full bg-purple-300 animate-ping absolute -top-1 -right-1"></span>
        <i data-lucide="mic" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-200"></i>
        <span class="tracking-wide font-black">أمر صوتي ذكي 🎙️</span>
      </button>
    </div>
'''

if 'id="floating-voice-widget"' not in html:
    # Insert right before </body>
    html = html.replace('</body>', fab_html + '\n</body>')
    print("Added Floating Action Button (FAB) to index.html")
else:
    print("Notice: FAB already present in index.html")

# D. Upgrade index.html small typography and low-contrast text:
html = html.replace('text-[9.5px] opacity-80', 'text-[11px] opacity-90 font-medium')
html = html.replace('text-[9px] text-gray-400 block mt-0.5', 'text-xs text-slate-300 block mt-0.5 font-medium')
html = html.replace('text-[11px] text-gray-500 mt-1 font-mono', 'text-xs text-slate-300 mt-1 font-mono')
html = html.replace('<span class="text-[11px] text-gray-500">يتم الحفظ التلقائي في المتصفح فوراً ✅</span>', '<span class="text-xs text-slate-300 font-medium">يتم الحفظ التلقائي في المتصفح فوراً ✅</span>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Saved updated index.html successfully.")

# -------------------------------------------------------------
# 2. Update js/voice-assistant.js
# -------------------------------------------------------------
with open('js/voice-assistant.js', 'r', encoding='utf-8') as f:
    va = f.read()

# Enlarge mic button from w-16 h-16 to w-20 h-20
va = va.replace('class="w-16 h-16 rounded-full bg-purple-600', 'class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600')
va = va.replace('<i data-lucide="mic" id="voice-mic-icon" class="w-8 h-8 text-white"></i>', '<i data-lucide="mic" id="voice-mic-icon" class="w-10 h-10 text-white"></i>')

# Upgrade contrast on helper texts and labels
va = va.replace('text-gray-500 text-[11px]">في انتظار الاستماع لكلامك...', 'text-slate-300 text-xs font-medium">في انتظار الاستماع لكلامك...')
va = va.replace('<span class="text-gray-500">جرب أن تقول:</span>', '<span class="text-slate-300 text-xs font-bold">جرب أن تقول:</span>')
va = va.replace('text-[11px] text-gray-400 block mb-1', 'text-xs font-bold text-slate-300 block mb-1')
va = va.replace('placeholder-gray-500 focus:outline-none', 'placeholder-slate-400 text-white text-xs sm:text-sm focus:outline-none')
va = va.replace('text-[11px] text-gray-500 shrink-0', 'text-xs text-slate-300 shrink-0 font-medium')
va = va.replace('text-gray-400 hover:text-white', 'text-slate-300 hover:text-white font-bold')
va = va.replace('text-xs text-gray-400', 'text-xs text-slate-300')
va = va.replace('text-gray-300', 'text-slate-200')
va = va.replace('text-[11px]', 'text-xs')

with open('js/voice-assistant.js', 'w', encoding='utf-8') as f:
    f.write(va)
print("Saved updated js/voice-assistant.js successfully.")

# -------------------------------------------------------------
# 3. Update js/ui.js
# -------------------------------------------------------------
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read()

# Replace technical indicators label sizes & colors
ui = ui.replace('text-[9px] text-gray-500 block font-sans', 'text-xs text-slate-300 block font-sans font-medium')
ui = ui.replace('text-[9px] text-gray-500 font-sans mt-0.5', 'text-xs text-slate-300 font-sans mt-0.5')
ui = ui.replace('text-[8.5px] text-gray-500 font-sans mt-0.5', 'text-[11px] text-slate-300 font-sans mt-0.5 font-medium')
ui = ui.replace('text-[9.5px] text-gray-500 font-sans', 'text-xs text-slate-300 font-sans font-medium')

# Replace dailyActionHub inactive gray badges
ui = ui.replace(": 'bg-gray-800 text-gray-500'", ": 'bg-slate-800/80 text-slate-300 border border-slate-700/60'")

# Replace DCA tranches tiny fonts
ui = ui.replace('text-[8.5px]', 'text-[11px]')
ui = ui.replace('text-[9px] text-emerald-400 font-bold', 'text-xs text-emerald-300 font-bold')
ui = ui.replace('text-[9px] text-cyan-400 font-bold', 'text-xs text-cyan-300 font-bold')
ui = ui.replace('text-[9px] text-purple-400 font-bold', 'text-xs text-purple-300 font-bold')
ui = ui.replace('text-[9px] text-rose-400 block font-sans', 'text-xs text-rose-300 block font-sans font-medium')
ui = ui.replace('text-[9px] text-emerald-400 block font-sans', 'text-xs text-emerald-300 block font-sans font-medium')
ui = ui.replace('text-[9px] text-gray-400 block font-sans', 'text-xs text-slate-300 block font-sans font-medium')

# Table specific replacements for clarity and high contrast:
ui = ui.replace('<div class="font-bold text-white text-xs sm:text-sm">${item.name}</div>', '<div class="font-bold text-white text-sm sm:text-base">${item.name}</div>')
ui = ui.replace('<div class="text-[10px] text-gray-400">${item.category}</div>', '<div class="text-xs text-slate-300 font-medium">${item.category}</div>')
ui = ui.replace('text-[10.5px] text-gray-300 leading-tight', 'text-xs text-slate-200 leading-normal font-medium')
ui = ui.replace('text-[9.5px] font-sans font-semibold', 'text-[11px] font-sans font-bold')
ui = ui.replace('text-[9.5px] px-2 py-0.5 rounded', 'text-xs px-2 py-0.5 rounded')
ui = ui.replace('text-[9.5px] text-emerald-400 hover:text-emerald-300 font-bold', 'text-xs text-emerald-300 hover:text-emerald-200 font-bold')
ui = ui.replace('text-[9.5px] text-rose-400 hover:text-rose-300 font-bold', 'text-xs text-rose-300 hover:text-rose-200 font-bold')
ui = ui.replace('text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold', 'text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold')
ui = ui.replace('text-[9px] font-mono font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30', 'text-xs font-mono font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40')
ui = ui.replace('text-[9px] font-mono font-semibold text-rose-300 bg-rose-950/80 border border-rose-500/30', 'text-xs font-mono font-bold text-rose-300 bg-rose-950/90 border border-rose-500/40')
ui = ui.replace('text-[9px] font-bold bg-emerald-500 text-white animate-pulse shadow-sm', 'text-xs font-bold bg-emerald-600 text-white animate-pulse shadow-sm')
ui = ui.replace('text-[9px] font-black bg-rose-600 text-white animate-pulse shadow-sm', 'text-xs font-black bg-rose-600 text-white animate-pulse shadow-sm')
ui = ui.replace('text-[9px] font-black bg-rose-600 text-white shadow-sm', 'text-xs font-black bg-rose-600 text-white shadow-sm')
ui = ui.replace('text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40', 'text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-500/50')
ui = ui.replace('text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40', 'text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-500/50')
ui = ui.replace('text-[9px] text-gray-400 font-mono', 'text-[11px] text-slate-300 font-mono font-medium')
ui = ui.replace('text-gray-400 block text-[9px]', 'text-slate-300 block text-xs font-medium')
ui = ui.replace('font-mono font-black text-emerald-300 text-xs sm:text-sm', 'font-mono font-black text-emerald-300 text-sm sm:text-base')
ui = ui.replace('font-mono font-black ${isStopBroken ? \'text-rose-400 animate-pulse\' : \'text-rose-300\'} text-xs sm:text-sm', 'font-mono font-black ${isStopBroken ? \'text-rose-400 animate-pulse\' : \'text-rose-300\'} text-sm sm:text-base')
ui = ui.replace('font-mono font-bold text-gray-200', 'font-mono font-bold text-slate-100 text-sm sm:text-base')
ui = ui.replace('text-cyan-300 text-xs sm:text-sm shadow-sm', 'text-cyan-200 text-sm sm:text-base shadow-sm')

# Replace remaining text-gray-500 in ui.js where appropriate
ui = ui.replace('text-gray-500 font-mono shrink-0', 'text-slate-400 font-mono shrink-0')
ui = ui.replace('text-gray-500 font-normal', 'text-slate-400 font-bold')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui)
print("Saved updated js/ui.js successfully.")

# -------------------------------------------------------------
# 4. Update js/modals.js & js/rotation.js & js/trade.js
# -------------------------------------------------------------
with open('js/modals.js', 'r', encoding='utf-8') as f:
    modals = f.read()
modals = modals.replace('text-[9px] text-gray-400', 'text-xs text-slate-300 font-bold')
modals = modals.replace('text-[9px]', 'text-xs')
modals = modals.replace('text-[10px] text-gray-500', 'text-xs text-slate-300')
modals = modals.replace('text-[11px] text-gray-500', 'text-xs text-slate-300 font-medium')
with open('js/modals.js', 'w', encoding='utf-8') as f:
    f.write(modals)
print("Saved updated js/modals.js successfully.")

with open('js/rotation.js', 'r', encoding='utf-8') as f:
    rot = f.read()
rot = rot.replace("text-[9px] text-rose-400/90 block font-sans mt-0.5", "text-xs text-rose-300 block font-sans mt-0.5 font-bold")
rot = rot.replace("text-[9px] text-emerald-400/80 block font-sans mt-0.5", "text-xs text-emerald-300 block font-sans mt-0.5 font-bold")
rot = rot.replace("text-[10px] text-gray-500 block", "text-xs text-slate-300 block font-bold")
rot = rot.replace("text-[9px] text-gray-500 block", "text-xs text-slate-300 block font-bold")
rot = rot.replace("text-[9px]", "text-xs")
rot = rot.replace("text-[10px] text-gray-500", "text-xs text-slate-300")
with open('js/rotation.js', 'w', encoding='utf-8') as f:
    f.write(rot)
print("Saved updated js/rotation.js successfully.")

with open('js/trade.js', 'r', encoding='utf-8') as f:
    trade = f.read()
trade = trade.replace("text-[9px]", "text-[11px]")
trade = trade.replace("text-gray-500", "text-slate-400")
with open('js/trade.js', 'w', encoding='utf-8') as f:
    f.write(trade)
print("Saved updated js/trade.js successfully.")

print("=== UX/UI Pro Max Overhaul Completed Successfully! ===")
