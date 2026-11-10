# -*- coding: utf-8 -*-
import json

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['latest_version'] = '2.7.6'
data['version_name'] = 'v2.7.6'
data['release_timestamp'] = '2026-10-28T12:25:00+03:00'
data['release_date_cairo'] = '28 أكتوبر 2026 - 12:25 م'

new_release = {
    'version': 'v2.7.6',
    'date': '28 أكتوبر 2026',
    'time': '12:25 م (توقيت القاهرة)',
    'badge': 'أمان توقيت السوق',
    'badge_color': 'cyan',
    'title': 'إدراج الإشارة الضوئية الثلاثية لتوقيت السوق وحماية السيولة من الهبوط العام',
    'summary': 'إدراج مؤشر مرئي ثلاثي الألوان (أخضر / أصفر / أحمر) في صدارة كروت الفرص لرصد جاهزية وأمان السوق للشراء وتجميد التنفيذ تلقائياً وقت الأزمات أو الصدمات البيعية لحماية رأس المال.',
    'items': [
        'إضافة شريط مؤشر جاهزية وأمان الشراء في السوق العام بألوانه الثلاثية في صدارة قسم الفرص الذهبية.',
        'إدراج شارة توقيت السوق العام داخل كل بطاقة فرصة لشرح موقف التداول الموصى به.',
        'تجميد أزرار الشراء والتزويد تلقائياً عند رصد صدمة سوقية أو هبوط ذعري واسع لمنع صيد السكاكين الساقطة.',
        'معايرة حجم السيولة المقترحة بحسب حالة اتجاه السوق لتوفير احتياطي كاش إضافي وقت التذبذب.'
    ]
}

data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('version.json updated to 2.7.6')

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

app_code = app_code.replace("const LOCAL_APP_VERSION = '2.7.5';", "const LOCAL_APP_VERSION = '2.7.6';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)

print('js/app.js updated to 2.7.6')

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

html_code = html_code.replace('?v=2.7.5', '?v=2.7.6')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print('index.html updated to 2.7.6')
