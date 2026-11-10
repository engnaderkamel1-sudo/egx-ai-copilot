import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_release = {
    'version': 'v2.7.4',
    'date': '28 أكتوبر 2026',
    'time': '11:40 ص (توقيت القاهرة)',
    'badge': 'توجيه الشراء الآمن',
    'badge_color': 'amber',
    'title': 'تنبيه الشراء الإلزامي بالأمر المحدد (Limit Order)',
    'summary': 'إدراج تنبيهات بصرية وإرشادية واضحة في كروت الشراء ونافذة العمليات لتأكيد الشراء دائماً بأمر محدد عند مستوى الدعم وحظر الشراء بسعر السوق المباشر لحماية رأس المال.',
    'items': [
        'إضافة شريط التوجيه الإلزامي (أمر بسعر محدد • Limit Order) في كروت الفرص الاستثمارية والتزويد.',
        'توضيح سعر التنفيذ المحدد مباشرة على زر فتح ثندر.',
        'إدراج التنبيه التوجيهي داخل نافذة تسجيل الصفقات لتذكير المستثمر بعدم الشراء بسعر السوق.'
    ]
}

data['latest_version'] = '2.7.4'
data['version_name'] = 'v2.7.4'
data['release_timestamp'] = '2026-10-28T11:40:00+03:00'
data['release_date_cairo'] = '28 أكتوبر 2026 - 11:40 ص'
data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_text = f.read()

assert "const LOCAL_APP_VERSION = '2.7.3';" in app_text
app_text = app_text.replace("const LOCAL_APP_VERSION = '2.7.3';", "const LOCAL_APP_VERSION = '2.7.4';", 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_text)

with open('index.html', 'r', encoding='utf-8') as f:
    idx_text = f.read()

count = idx_text.count('?v=2.7.3')
print(f"Replacing {count} occurrences of ?v=2.7.3 with ?v=2.7.4")
idx_text = idx_text.replace('?v=2.7.3', '?v=2.7.4')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_text)

print("Bumped to v2.7.4 successfully!")
