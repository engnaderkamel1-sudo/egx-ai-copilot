# bump_to_251.py
import json

with open('version.json', 'r', encoding='utf-8') as f:
    ver_data = json.load(f)

ver_data['latest_version'] = '2.5.1'
ver_data['version_name'] = 'v2.5.1'
ver_data['release_timestamp'] = '2026-10-22T17:16:00+03:00'
ver_data['release_date_cairo'] = '22 أكتوبر 2026 - 05:16 م'

new_release = {
    "version": "v2.5.1",
    "date": "22 أكتوبر 2026",
    "time": "05:16 م (توقيت القاهرة)",
    "badge": "تحسين وتجربة",
    "badge_color": "emerald",
    "title": "إضافة زر معاينة إشعار التحديث وضبط كاش الموبايل",
    "summary": "إضافة زر مباشر لمعاينة ظهور شريط التحديث الأخضر على الموبايل، ورفع النسخة لتمكين الهاتف من التقاط الإشعار الحي فوراً.",
    "items": [
        "إضافة زر 'تجربة شكل التنبيه' في شاشة سجل التحديثات لمعاينة الإشعار في أي وقت.",
        "ضبط آلية الكشف الدوري عن النسخ السحابية الجديدة على الهاتف.",
        "رفع الإصدار إلى v2.5.1 لتفعيل ظهور شريط التحديث للمستخدم مباشرة."
    ]
}

ver_data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)

with open('api/prices.js', 'r', encoding='utf-8') as f:
    prices_code = f.read().replace('app_version: "2.5.0"', 'app_version: "2.5.1"')
with open('api/prices.js', 'w', encoding='utf-8') as f:
    f.write(prices_code)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('?v=2.5.0', '?v=2.5.1').replace('>v2.5.0<', '>v2.5.1<')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read().replace("const currentVer = 'v2.5.0';", "const currentVer = 'v2.5.1';").replace("badge: 'v2.5.0'", "badge: 'v2.5.1'")
with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui)

with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read().replace("const LOCAL_APP_VERSION = '2.5.0';", "const LOCAL_APP_VERSION = '2.5.1';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print("[OK] Successfully bumped everything to v2.5.1")
