# remove_open_thndr_buttons.py
import json

print("--- 1. Updating version.json ---")
with open('version.json', 'r', encoding='utf-8') as f:
    ver_data = json.load(f)

ver_data['latest_version'] = '2.5.0'
ver_data['version_name'] = 'v2.5.0'
ver_data['release_timestamp'] = '2026-10-22T17:15:00+03:00'
ver_data['release_date_cairo'] = '22 أكتوبر 2026 - 05:15 م'

new_release = {
    "version": "v2.5.0",
    "date": "22 أكتوبر 2026",
    "time": "05:15 م (توقيت القاهرة)",
    "badge": "تحسين تجربة الاستخدام",
    "badge_color": "emerald",
    "title": "إزالة أزرار فتح ثندر والاعتماد الكلي على زر 'تم تنفيذ التعديل'",
    "summary": "إزالة كافة الأزرار والروابط الخارجية الموجهة لفتح ثندر والاعتماد على فتح المستخدم لتطبيق الهاتف بنفسه مع زر مباشر لتأكيد التعديل وإخفاء التنبيه.",
    "items": [
        "إزالة زر 'فتح ثندر' من شريط الطوارئ العلوي، والاكتفاء بزر 'تم تنفيذ التعديل ✓'.",
        "إزالة روابط فتح ثندر من القائمة الجانبية ورادار الأوامر المعلقة.",
        "التطبيق أصبح استشارياً خالصاً يحترم خصوصية تحكم المستخدم في وسيط التداول."
    ]
}

ver_data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)
print("[OK] version.json updated to v2.5.0")


print("--- 2. Updating api/prices.js ---")
with open('api/prices.js', 'r', encoding='utf-8') as f:
    prices_code = f.read()

prices_code = prices_code.replace('app_version: "2.4.9"', 'app_version: "2.5.0"')
with open('api/prices.js', 'w', encoding='utf-8') as f:
    f.write(prices_code)
print("[OK] api/prices.js updated to v2.5.0")


print("--- 3. Updating index.html ---")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('\r\n', '\n')

# A. Remove btn-thndr from sidebar footer (around line 1296)
old_sidebar_thndr = '''        <a href="https://app.thndr.app" target="_blank" class="btn-thndr w-full py-2 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition opacity-90 hover:opacity-100">
          <span>فتح موقع ثندر (Thndr)</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>'''
if old_sidebar_thndr in html:
    html = html.replace(old_sidebar_thndr, '', 1)
    print("[OK] Removed sidebar footer thndr link")

# B. Remove open thndr action button from emergency banner, keep only confirm button
old_emergency_buttons = '''          <div class="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0 flex-wrap">
            <button id="oed-banner-action-btn" type="button" onclick="handleOedBannerAction()" class="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer">
              <i data-lucide="external-link" class="w-4 h-4 text-white"></i>
              <span id="oed-banner-action-text" class="text-white font-black text-xs">فتح تطبيق ثندر للتنفيذ ⚡</span>
            </button>
            <button id="oed-banner-confirm-btn" type="button" onclick="confirmActionExecuted()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer" title="تأكيد أنك قمت بالتعديل أو الإلغاء لإخفاء التنبيه نهائياً">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-white"></i>
              <span>تم تنفيذ التعديل ✓</span>
            </button>
            <button type="button" onclick="dismissOedBanner()" class="hidden md:flex text-rose-700 hover:text-rose-950 dark:text-rose-300 p-1.5 rounded-lg transition cursor-pointer" title="إغلاق التنبيه مؤقتاً">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>'''

new_emergency_buttons = '''          <div class="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0 flex-wrap">
            <button id="oed-banner-confirm-btn" type="button" onclick="confirmActionExecuted()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer" title="تأكيد أنك قمت بالتعديل أو الإلغاء لإخفاء التنبيه نهائياً">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-white"></i>
              <span>تم تنفيذ التعديل ✓</span>
            </button>
            <button type="button" onclick="dismissOedBanner()" class="text-rose-700 hover:text-rose-950 dark:text-rose-300 p-1.5 rounded-lg transition cursor-pointer" title="إغلاق التنبيه مؤقتاً">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>'''

if old_emergency_buttons in html:
    html = html.replace(old_emergency_buttons, new_emergency_buttons, 1)
    print("[OK] Removed open thndr button from emergency banner")

# C. Remove thndr web link from sync tab step 2 if present
sync_link_old = '''            <a href="https://app.thndr.app" target="_blank" class="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-700/50 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow">
              <span>فتح موقع ثندر ويب ↗</span>
            </a>'''
if sync_link_old in html:
    html = html.replace(sync_link_old, '', 1)
    print("[OK] Removed thndr link from sync step 2")

# Bump scripts to v2.5.0
html = html.replace('?v=2.4.9', '?v=2.5.0')
html = html.replace('>v2.4.9<', '>v2.5.0<')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html updated to v2.5.0")


print("--- 4. Updating js/ui.js ---")
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read().replace('\r\n', '\n')

# In renderPendingThndrOrdersUI, remove the link to open Thndr
thndr_link_in_orders = '''              <div class="flex items-center gap-2 shrink-0 justify-end">
                <a href="https://app.thndr.app" target="_blank" class="px-3 py-1.5 rounded-xl ${isShock ? 'bg-rose-600 hover:bg-rose-500 text-white font-black animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'} text-xs font-bold transition flex items-center gap-1.5 shadow">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  <span>فتح تطبيق ثندر لإلغاء الأمر</span>
                </a>
                <button onclick="markPendingThndrOrderCancelled('${order.id}')" class="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition" title="تأكيد أنك ألغيت الأمر بالفعل في ثندر">
                  تم الإلغاء ✓
                </button>
                <button onclick="removePendingThndrOrder('${order.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition" title="حذف من السجل">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>'''

new_orders_buttons = '''              <div class="flex items-center gap-2 shrink-0 justify-end">
                <button onclick="markPendingThndrOrderCancelled('${order.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow" title="تأكيد أنك نفذت التعديل">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-white"></i>
                  <span>تم تنفيذ التعديل ✓</span>
                </button>
                <button onclick="removePendingThndrOrder('${order.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition" title="حذف من السجل">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>'''

if thndr_link_in_orders in ui_code:
    ui_code = ui_code.replace(thndr_link_in_orders, new_orders_buttons, 1)
    print("[OK] Removed open thndr link from pending orders card in ui.js")

ui_code = ui_code.replace("const currentVer = 'v2.4.9';", "const currentVer = 'v2.5.0';")
ui_code = ui_code.replace("badge: 'v2.4.9'", "badge: 'v2.5.0'")

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_code)
print("[OK] js/ui.js updated to v2.5.0")


print("--- 5. Updating js/app.js ---")
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read().replace('\r\n', '\n')

app_code = app_code.replace("const LOCAL_APP_VERSION = '2.4.9';", "const LOCAL_APP_VERSION = '2.5.0';")

# In handleOedBannerAction, remove OPEN_THNDR
handle_action_find = '''      if (activeEmergencyAlert.actionType === 'OPEN_THNDR') {
        window.open('https://app.thndr.app', '_blank');
      } else if (activeEmergencyAlert.actionType === 'RADAR') {'''

handle_action_replace = '''      if (activeEmergencyAlert.actionType === 'RADAR') {'''

if handle_action_find in app_code:
    app_code = app_code.replace(handle_action_find, handle_action_replace, 1)
    print("[OK] Removed OPEN_THNDR from handleOedBannerAction")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)
print("[OK] js/app.js updated to v2.5.0")


print("--- 6. Updating js/modals.js ---")
with open('js/modals.js', 'r', encoding='utf-8') as f:
    modal_code = f.read().replace('\r\n', '\n')

modal_thndr_link = '''            <a href="https://app.thndr.app" target="_blank" class="px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-800 font-bold text-[11px] flex items-center gap-1 transition">
              <span>فتح موقع ثندر ↗</span>
            </a>'''
if modal_thndr_link in modal_code:
    modal_code = modal_code.replace(modal_thndr_link, '', 1)
    print("[OK] Removed open thndr link from js/modals.js")

with open('js/modals.js', 'w', encoding='utf-8') as f:
    f.write(modal_code)
print("[OK] js/modals.js updated successfully")
