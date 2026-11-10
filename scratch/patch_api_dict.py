with open('api/prices.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = '  "EMFD": { name: "إعمار مصر للتنمية", sector: "تطوير عقاري وإنشاءات", index: "egx30", quality: "تدفقات دولارية ومشاريع عقارية فاخرة" },'
addition = '''  "EMFD": { name: "إعمار مصر للتنمية", sector: "تطوير عقاري وإنشاءات", index: "egx30", quality: "تدفقات دولارية ومشاريع عقارية فاخرة" },
  "GBCO": { name: "جي بي كورب (غبور)", sector: "سيارات وخدمات مالية غير مصرفية", index: "egx30", quality: "ريادة في سيارات الركوب والخدمات التمويلية" },
  "PHAR": { name: "إيبيكو للأدوية", sector: "أدوية ورعاية صحية", index: "egx30", quality: "أكبر مصدّر للدواء ومشروع بايوفارم 3" },'''

assert target in text, "target not found in api/prices.js"
text = text.replace(target, addition, 1)

with open('api/prices.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added GBCO and PHAR to api/prices.js successfully!")
