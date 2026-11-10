# -*- coding: utf-8 -*-
import json

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['latest_version'] = '2.7.8'
data['version_name'] = 'v2.7.8'
data['release_timestamp'] = '2026-10-28T13:05:00+03:00'
data['release_date_cairo'] = '28 أكتوبر 2026 - 01:05 م'

new_release = {
    'version': 'v2.7.8',
    'date': '28 أكتوبر 2026',
    'time': '01:05 م (توقيت القاهرة)',
    'badge': 'تثبيت مؤشر السوق العام',
    'badge_color': 'cyan',
    'title': 'تثبيت مؤشر جاهزية السوق والفعل الاستثماري في صدارة مركز القرارات اليومية لكافة التبويبات',
    'summary': 'نقل وتثبيت شريط إشارة توقيت السوق والفعل الاستثماري المطلوب ليعلو كافة تبويبات مركز القرارات اليومية (جني الأرباح، الحماية والبيع، خط الأمان، التزويد، الفرص، والمتابعة) كمظلة حاكمة لجميع قرارات المحفظة.',
    'items': [
        'تثبيت شريط مؤشر جاهزية وأمان السوق في صدارة مركز القرارات اليومية ليكون مرئياً في كافة الأقسام الستة.',
        'ربط الفعل الاستثماري المطلوب بحالة المحفظة ككل (جني أرباح بالقمم، حماية بالأزمات، تجميع بالقيعان).',
        'إزالة تكرار الشريط من داخل تبويب الفرص ليصبح موحداً وثابتاً في أعلى لوحة التحكم.'
    ]
}

data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('version.json updated to 2.7.8')

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

app_code = app_code.replace("const LOCAL_APP_VERSION = '2.7.7';", "const LOCAL_APP_VERSION = '2.7.8';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)

print('js/app.js updated to 2.7.8')

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

html_code = html_code.replace('?v=2.7.7', '?v=2.7.8')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print('index.html updated to 2.7.8')
