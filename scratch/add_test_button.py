# add_test_button.py

print("--- 1. Updating js/app.js ---")
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_text = f.read().replace('\r\n', '\n')

test_func = '''    function testShowUpdateBanner() {
      isUpdateBannerDismissed = false;
      showAppUpdateBanner('2.5.1 (تجربة التنبيه)', 'جلسة اليوم');
      if (typeof showToast === 'function') {
        showToast('تم إظهار شريط التحديث التجريبي في أعلى الشاشة 🚀', 'info');
      }
    }

    window.testShowUpdateBanner = testShowUpdateBanner;
'''

banner_find = "    function dismissUpdateBanner() {"
assert banner_find in app_text, "banner_find not found"
app_text = app_text.replace(banner_find, test_func + "\n    function dismissUpdateBanner() {", 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_text)
print("[OK] js/app.js updated with testShowUpdateBanner")


print("--- 2. Updating js/ui.js ---")
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_text = f.read().replace('\r\n', '\n')

old_ui_header = '''            <button type="button" onclick="checkForAppUpdates(false)" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>فحص التحديثات الآن</span>
            </button>'''

new_ui_header = '''            <button type="button" onclick="checkForAppUpdates(false)" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>فحص التحديثات الآن</span>
            </button>
            <button type="button" onclick="testShowUpdateBanner()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer" title="معاينة شكل شريط التنبيه الأخضر">
              <i data-lucide="play" class="w-3.5 h-3.5 text-yellow-400"></i>
              <span>تجربة شكل التنبيه</span>
            </button>'''

# Also update in index.html header for changelog view
with open('index.html', 'r', encoding='utf-8') as f:
    index_text = f.read().replace('\r\n', '\n')

if old_ui_header in index_text:
    index_text = index_text.replace(old_ui_header, new_ui_header, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(index_text)
    print("[OK] index.html updated with test button")

print("[OK] Done adding test button")
