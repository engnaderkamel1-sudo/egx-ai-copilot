import json, re

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    ver_data = json.load(f)

new_release = {
    "version": "v2.6.0",
    "date": "24 أكتوبر 2026",
    "time": "02:50 م (توقيت القاهرة)",
    "badge": "تطوير رئيسي",
    "badge_color": "purple",
    "title": "المساعد الصوتي الذكي للأوامر وتحديث إشعارات أندرويد",
    "summary": "إضافة المساعد الصوتي لتسجيل صفقات الشراء والبيع وتعديل حدود الأمان بالعامية المصرية، مع دعم إشعارات أندرويد السحابية اللحظية.",
    "items": [
        "أمر صوتي ذكي لتسجيل صفقات الشراء والبيع وتعديل حدود البيع الآمن بالصوت.",
        "إمكانية إملاء الأسئلة الصوتية والتحدث المباشر مع مستشار البورصة داخل التطبيق.",
        "تفعيل التجديد التلقائي لاشتراك إشعارات أندرويد السحابية في الخلفية."
    ]
}

ver_data["latest_version"] = "2.6.0"
ver_data["version_name"] = "v2.6.0"
ver_data["release_timestamp"] = "2026-10-24T14:50:00+03:00"
ver_data["release_date_cairo"] = "24 أكتوبر 2026 - 02:50 م"
ver_data["releases"].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)

print("version.json bumped to v2.6.0")

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

app_js = re.sub(r"const LOCAL_APP_VERSION = '2\.5\.1';", "const LOCAL_APP_VERSION = '2.6.0';", app_js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("js/app.js bumped to 2.6.0")

# 3. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_js = f.read()

sw_js = re.sub(r"const SW_VERSION = 'v3\.1-mobile-robust';", "const SW_VERSION = 'v3.2-voice-copilot';", sw_js)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_js)

print("sw.js bumped to v3.2-voice-copilot")

# 4. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

index_html = index_html.replace('?v=2.5.1', '?v=2.6.0')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

print("index.html script tags updated to ?v=2.6.0")
