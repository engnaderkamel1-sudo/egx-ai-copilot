# -*- coding: utf-8 -*-
import json

# 1. Update version.json
with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['latest_version'] = '2.7.7'
data['version_name'] = 'v2.7.7'
data['release_timestamp'] = '2026-10-28T12:45:00+03:00'
data['release_date_cairo'] = '28 أكتوبر 2026 - 12:45 م'

new_release = {
    'version': 'v2.7.7',
    'date': '28 أكتوبر 2026',
    'time': '12:45 م (توقيت القاهرة)',
    'badge': 'أفعال توقيت السوق وجني الأرباح',
    'badge_color': 'emerald',
    'title': 'تصحيح أولوية جني الأرباح للأسهم الرابحة وتحويل مؤشر السوق إلى أفعال استثمارية صريحة',
    'summary': 'قصر قسم الحماية والبيع حصراً على المراكز الخاسرة وإعادة بنك التعمير والإسكان لمكانه الطبيعي في جني الأرباح، مع إعادة صياغة مؤشر السوق ليحدد أفعالاً استثمارية ملزمة (جني أرباح بالقمم، تجميع تدريجي بالقيعان، تجميد كلي بالأزمات).',
    'items': [
        'تصحيح ترتيب الفرز البرمجي ليمنح الأولوية لجني الأرباح (+10% فأكثر) ومنع دخول أي سهم رابح في قسم الحماية والبيع.',
        'إعادة سهم بنك التعمير والإسكان محقق الربح (+14.65%) فوراً إلى تبويب جني الأرباح وتعديل خط الأمان.',
        'إعادة صياغة مؤشر جاهزية السوق إلى أفعال استثمارية حقيقية صريحة بدلاً من الكلمات العامة.',
        'إضافة تنبيه حظر الشراء عند قمم التشبع وجعل التجميع مقتصراً على التراجعات الهادئة عند الدعوم.'
    ]
}

data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('version.json updated to 2.7.7')

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

app_code = app_code.replace("const LOCAL_APP_VERSION = '2.7.6';", "const LOCAL_APP_VERSION = '2.7.7';")
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)

print('js/app.js updated to 2.7.7')

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

html_code = html_code.replace('?v=2.7.6', '?v=2.7.7')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print('index.html updated to 2.7.7')
