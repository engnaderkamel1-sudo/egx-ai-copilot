# -*- coding: utf-8 -*-
import json

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['latest_version'] = '2.8.0'
data['version_name'] = 'v2.8.0'
data['release_timestamp'] = '2026-11-10T14:05:00+02:00'
data['release_date_cairo'] = '10 نوفمبر 2026 - 02:05 م'

new_release = {
    'version': 'v2.8.0',
    'date': '10 نوفمبر 2026',
    'time': '02:05 م (توقيت القاهرة)',
    'badge': 'مؤشرات القوة والتصويت الفني',
    'badge_color': 'emerald',
    'title': 'دمج مؤشرات القوة والتذبذب (ADX و ATR) ولوحة تصويت المؤشرات الفنية المجمعة في تقرير الاقتراح ورادار السوق',
    'summary': 'تطوير ترسانة التحليل الفني بدمج مؤشر قوة الاتجاه ADX ومؤشر التذبذب اليومي الحقيقي ATR مع بطاقة تصويت مجمعة ترصد أصوات المتوسطات المتحركة ومؤشرات التذبذب القياسية بدقة ومطابقة حية للبورصة المصرية.',
    'items': [
        'إضافة مؤشر قوة الاتجاه ADX لقياس عزم الاتجاه الصاعد وتنبيه المستثمر من تجميد السيولة في المسارات العرضية الهادئة.',
        'إضافة مؤشر التذبذب الحقيقي ATR وحساب حاجز وقف الخسارة الديناميكي لحماية المستثمر من التذبذبات الطبيعية للجلسة.',
        'إدراج لوحة تصويت المؤشرات الفنية المجمعة (Consensus Scorecard) لحساب أصوات الشراء والبيع والحياد للمتوسطات ومؤشرات التذبذب.',
        'إضافة شارات رقمية ذكية للتصويت الفني ومؤشر ADX داخل بطاقات رادار السوق وتقرير الاقتراح الاستثماري.'
    ]
}

data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('version.json updated to 2.8.0')

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

app_code = app_code.replace("const LOCAL_APP_VERSION = '2.7.8';", "const LOCAL_APP_VERSION = '2.8.0';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)

print('js/app.js updated to 2.8.0')

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

html_code = html_code.replace('?v=2.7.8', '?v=2.8.0')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print('index.html updated to 2.8.0')
