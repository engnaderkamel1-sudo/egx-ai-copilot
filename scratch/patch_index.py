import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Header Voice Button
target1 = '''          <!-- Position Sizing Risk Calculator Button -->
          <button onclick="openPositionSizingModal()" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer" title="حاسبة حجم المركز وإدارة المخاطر (2% Risk)">
            <i data-lucide="calculator" class="w-4 h-4 text-cyan-400"></i>
            <span class="hidden lg:inline">حاسبة المخاطر</span>
          </button>'''

replacement1 = target1 + '''\n\n          <!-- Voice Assistant Header Button -->
          <button onclick="openVoiceTradingModal()" class="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-500/50 transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer" title="المساعد الصوتي الذكي (أوامر التداول وتعديل الحدود)">
            <i data-lucide="mic" class="w-4 h-4 text-purple-300"></i>
            <span class="hidden sm:inline">أمر صوتي</span>
          </button>'''

# 2. Holdings Table Voice Button
target2 = '''          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="openTradeModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 transform active:scale-95" title="تسجيل عملية شراء أو بيع نفذتها في ثندر">
              <i data-lucide="arrow-left-right" class="w-4 h-4 text-emerald-200"></i>
              <span>+ تسجيل صفقة (شراء / بيع)</span>
            </button>'''

replacement2 = '''          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="openVoiceTradingModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/50 transform active:scale-95" title="تسجيل صفقة أو تعديل حد أمان صوتياً بالذكاء الاصطناعي">
              <i data-lucide="mic" class="w-4 h-4 text-purple-200 animate-pulse"></i>
              <span>🎙️ أمر صوتي ذكي</span>
            </button>
            <button onclick="openTradeModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 transform active:scale-95" title="تسجيل عملية شراء أو بيع نفذتها في ثندر">
              <i data-lucide="arrow-left-right" class="w-4 h-4 text-emerald-200"></i>
              <span>+ تسجيل صفقة (شراء / بيع)</span>
            </button>'''

# 3. Chat Mic Button in Tab 4
target3 = '''          <form id="chat-form" onsubmit="handleChatSubmit(event)" class="flex items-center gap-2">
            <input type="text" id="chat-input" placeholder="اكتب سؤالك أو استشارتك عن أي سهم في البورصة..." class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition">
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition">'''

replacement3 = '''          <form id="chat-form" onsubmit="handleChatSubmit(event)" class="flex items-center gap-2">
            <input type="text" id="chat-input" placeholder="اكتب سؤالك أو استشارتك عن أي سهم في البورصة..." class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition">
            <button type="button" id="btn-chat-mic" onclick="toggleChatVoiceInput()" class="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 transition flex items-center justify-center cursor-pointer" title="تحدث بالسؤال صوتياً بالمايك">
              <i data-lucide="mic" class="w-4 h-4"></i>
            </button>
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition">'''

# 4. Script Tag
target4 = '''  <script src="js/trade.js?v=2.5.1"></script>'''
replacement4 = '''  <script src="js/trade.js?v=2.5.1"></script>\n  <script src="js/voice-assistant.js?v=2.5.1"></script>'''

# Normalize newlines
is_crlf = '\r\n' in content
c_norm = content.replace('\r\n', '\n')

assert target1.replace('\r\n', '\n') in c_norm, 'Target 1 not found'
assert target2.replace('\r\n', '\n') in c_norm, 'Target 2 not found'
assert target3.replace('\r\n', '\n') in c_norm, 'Target 3 not found'
assert target4.replace('\r\n', '\n') in c_norm, 'Target 4 not found'

c_norm = c_norm.replace(target1.replace('\r\n', '\n'), replacement1.replace('\r\n', '\n'))
c_norm = c_norm.replace(target2.replace('\r\n', '\n'), replacement2.replace('\r\n', '\n'))
c_norm = c_norm.replace(target3.replace('\r\n', '\n'), replacement3.replace('\r\n', '\n'))
c_norm = c_norm.replace(target4.replace('\r\n', '\n'), replacement4.replace('\r\n', '\n'))

if is_crlf:
    c_final = c_norm.replace('\n', '\r\n')
else:
    c_final = c_norm

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c_final)

print('Patch applied successfully to index.html!')
