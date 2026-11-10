import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/state.js', 'r', encoding='utf-8') as f:
    state_text = f.read()

target_end = "        operationalStability: 'أرباح تشغيلية متنامية بعد تسوية الديون'\n      }\n    ];"

new_radar_items = '''      {
        ticker: 'PHDC',
        name: 'بالم هيلز للتعمير',
        index: 'egx30',
        sector: 'تطوير عقاري وفنادق',
        price: 11.75,
        high: 12.10,
        low: 11.40,
        close: 11.75,
        changePct: '+1.65%',
        volumeMultiplier: '2.1x',
        catalyst: 'طفرة مبيعات مشروع بادية بغرب القاهرة والساحل الشمالي وتدفقات نقدية قياسية',
        type: 'سهم قيادي • نمو عقاري قوي',
        score: 93,
        support: '11.20 ج',
        target1: '13.50 ج',
        target2: '15.00 ج',
        stopLoss: '10.80 ج',
        liquidityStatus: 'ممتازة في ثندر (تداول عشرات الملايين)',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'EMFD',
        name: 'إعمار مصر للتنمية',
        index: 'egx30',
        sector: 'تطوير عقاري وإنشاءات',
        price: 11.68,
        high: 12.00,
        low: 11.35,
        close: 11.68,
        changePct: '+1.20%',
        volumeMultiplier: '1.8x',
        catalyst: 'مركز مالي فائق القوة خالٍ تماماً من الديون بفائض سيولة دولارية وتدفقات مراسي وسول',
        type: 'سهم قيادي صلب • سيولة دولارية',
        score: 92,
        support: '11.10 ج',
        target1: '13.20 ج',
        target2: '14.50 ج',
        stopLoss: '10.70 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'ETEL',
        name: 'المصرية للاتصالات (وي)',
        index: 'egx30',
        sector: 'اتصالات وتكنولوجيا',
        price: 126.90,
        high: 129.50,
        low: 124.00,
        close: 126.90,
        changePct: '+2.10%',
        volumeMultiplier: '1.9x',
        catalyst: 'احتكار البنية التحتية للألياف الضوئية وحصة 45% في فودافون مصر وتدفقات كابلات بحرية دولارية',
        type: 'سهم احتكاري دفاعي • أرباح دولارية صلبة',
        score: 94,
        support: '121.50 ج',
        target1: '142.00 ج',
        target2: '155.00 ج',
        stopLoss: '118.00 ج',
        liquidityStatus: 'ممتازة في ثندر (خروج ودخول فوري بنقرة زر)',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'PHAR',
        name: 'إيبيكو للأدوية',
        index: 'egx30',
        sector: 'أدوية ورعاية صحية',
        price: 99.60,
        high: 102.00,
        low: 97.50,
        close: 99.60,
        changePct: '+1.45%',
        volumeMultiplier: '1.5x',
        catalyst: 'أكبر مصدّر للدواء في مصر واستفادة مباشرة من تحريك أسعار الدواء وتوسعات بايوفارم 3',
        type: 'سهم دفاعي صلب • رعاية صحية وتصدير',
        score: 90,
        support: '95.00 ج',
        target1: '112.00 ج',
        target2: '125.00 ج',
        stopLoss: '92.50 ج',
        liquidityStatus: 'نشطة جداً في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'GBCO',
        name: 'جي بي كورب (غبور)',
        index: 'egx30',
        sector: 'سيارات وخدمات مالية غير مصرفية',
        price: 23.50,
        high: 24.20,
        low: 22.90,
        close: 23.50,
        changePct: '+2.40%',
        volumeMultiplier: '1.6x',
        catalyst: 'تعافي استيراد سيارات الركوب وطفرة نمو الأذرع التمويلية والتكنولوجيا المالية',
        type: 'سهم نمو وتمويل • توسع إقليمي',
        score: 89,
        support: '22.30 ج',
        target1: '27.00 ج',
        target2: '30.00 ج',
        stopLoss: '21.50 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'CIEB',
        name: 'بنك كريدي أجريكول مصر',
        index: 'egx30',
        sector: 'بنوك وخدمات مالية',
        price: 24.50,
        high: 25.10,
        low: 24.00,
        close: 24.50,
        changePct: '+0.95%',
        volumeMultiplier: '1.4x',
        catalyst: 'أعلى عائد توزيعات نقدية في البورصة المصرية (14.5%) وهوامش أرباح مصرفية قوية',
        type: 'بنوك وأرباح نقدية • عوائد استثنائية',
        score: 93,
        support: '23.40 ج',
        target1: '28.50 ج',
        target2: '32.00 ج',
        stopLoss: '22.70 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['dividend_champions', 'low_risk', 'egx30']
      },
      {
        ticker: 'ADIB',
        name: 'مصرف أبو ظبي الإسلامي - مصر',
        index: 'egx30',
        sector: 'بنوك وصيرفة إسلامية',
        price: 49.50,
        high: 51.00,
        low: 48.50,
        close: 49.50,
        changePct: '+1.80%',
        volumeMultiplier: '1.8x',
        catalyst: 'أسرع البنوك نمواً في الودائع والتمويل الإسلامي ومعدل عائد على الملكية يتجاوز 45%',
        type: 'صيرفة إسلامية • أرباح متسارعة',
        score: 92,
        support: '47.20 ج',
        target1: '58.00 ج',
        target2: '65.00 ج',
        stopLoss: '45.80 ج',
        liquidityStatus: 'ممتازة في ثندر',
        tags: ['low_risk', 'egx30']
      }'''

replacement = "        operationalStability: 'أرباح تشغيلية متنامية بعد تسوية الديون'\n      },\n" + new_radar_items + "\n    ];"

assert target_end in state_text, "target_end not found in js/state.js"
state_text = state_text.replace(target_end, replacement, 1)

with open('js/state.js', 'w', encoding='utf-8') as f:
    f.write(state_text)
print("3. Updated js/state.js successfully!")

# 4. Patch js/app.js to re-render Daily Action Hub after live prices fetch
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_text = f.read()

target_radar_render = '''              fullMarketRadar = data.radar;
              renderRadarGrid();
              populateRiskStockDropdown();'''

replacement_radar_render = '''              fullMarketRadar = data.radar;
              renderRadarGrid();
              populateRiskStockDropdown();
              if (typeof renderDailyActionHub === 'function') renderDailyActionHub();'''

assert target_radar_render in app_text, "target_radar_render not found in js/app.js"
app_text = app_text.replace(target_radar_render, replacement_radar_render, 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_text)
print("4. Updated js/app.js successfully!")
