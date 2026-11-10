import json

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    vdata = json.load(f)

vdata['latest_version'] = '2.6.1'
vdata['version_name'] = 'v2.6.1'
vdata['release_timestamp'] = '2026-10-24T15:10:00+03:00'
vdata['release_date_cairo'] = '24 أكتوبر 2026 - 03:10 م'

new_release = {
    "version": "v2.6.1",
    "date": "24 أكتوبر 2026",
    "time": "03:10 م (توقيت القاهرة)",
    "badge": "تحسين شامل للواجهة والتباين",
    "badge_color": "emerald",
    "title": "إعادة تصميم واجهة المستخدم والمساعد الصوتي العائم (UX/UI Pro Max)",
    "summary": "إضافة زر المساعد الصوتي العائم (FAB) الدائم على شاشات الموبايل، وحل مشكلة اختفاء الأزرار بالأعلى، ورفع تباين وأحجام النصوص بنسبة 100%.",
    "items": [
        "إضافة زر صوتي عائم دائم (Floating Action Button) في متناول الإبهام على جميع الشاشات.",
        "حل مشكلة انضغاط واختفاء أزرار الشريط العلوي على شاشات الهواتف الضيقة.",
        "تحويل شريط أزرار المحفظة إلى شبكة متجاوبة ومنظمة لشاشات الهواتف.",
        "رفع تباين كافة النصوص والبيانات الفنية من الرمادي الباهت إلى الألوان عالية الوضوح لراحة العين.",
        "تكبير الخطوط الصغيرة جداً للأرقام والأهداف وقيعان الأمان لقراءة فائقة السهولة."
    ]
}

vdata['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(vdata, f, ensure_ascii=False, indent=2)

print("Updated version.json to v2.6.1")

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

app_js = app_js.replace("const LOCAL_APP_VERSION = '2.6.0';", "const LOCAL_APP_VERSION = '2.6.1';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
print("Updated LOCAL_APP_VERSION in js/app.js")

# 3. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

sw = sw.replace("egx-copilot-v2.6.0", "egx-copilot-v2.6.1")
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print("Updated sw.js cache name")

# 4. Update index.html version display
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace("v2.6.0", "v2.6.1")
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html to v2.6.1")
