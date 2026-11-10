import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('version.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_release = {
    'version': 'v2.7.3',
    'date': '28 أكتوبر 2026',
    'time': '11:30 ص (توقيت القاهرة)',
    'badge': 'توسيع النواة الآمنة',
    'badge_color': 'cyan',
    'title': 'توسيع النواة الآمنة وإدراج دراسات القيمة العادلة المعتمدة للأسهم القيادية',
    'summary': 'تغذية النظام بنماذج التدفقات النقدية والقيم العادلة الرسمية للأسهم القيادية خارج المحفظة (بالم هيلز، إعمار مصر، المصرية للاتصالات، إيبيكو للأدوية، غبور، كريدي أجريكول، ومصرف أبو ظبي الإسلامي) لتوفير فرص ذهبية حقيقية للاستثمار طويل الأجل بهامش أمان حقيقي.',
    'items': [
        'إدراج نماذج التدفقات النقدية والقيمة العادلة لـ 7 شركات قيادية كبرى في السوق.',
        'إظهار كروت فرص الشراء الحقيقية ذات هوامش الأمان في تبويب فرص السوق الذهبية (النواة الآمنة).',
        'مزامنة قرارات تبويب الفرص تلقائياً مع رادار السوق اللحظي دون أي تأخير.'
    ]
}

data['latest_version'] = '2.7.3'
data['version_name'] = 'v2.7.3'
data['release_timestamp'] = '2026-10-28T11:30:00+03:00'
data['release_date_cairo'] = '28 أكتوبر 2026 - 11:30 ص'
data['releases'].insert(0, new_release)

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Updated version.json to v2.7.3')
