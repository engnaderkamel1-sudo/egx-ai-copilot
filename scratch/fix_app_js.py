# fix_app_js.py
with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

lines = text.split('\n')

start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if '// 0. Check Systemic Market Shock Alert' in line:
        start_idx = i
    if start_idx is not None and 'portfolioData.forEach(item => {' in line:
        end_idx = i
        break

print("Found block from line", start_idx, "to", end_idx)

replacement_lines = [
    "      // 0. Check Systemic Market Shock Alert (Flash crash protection)",
    "      if (getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {",
    "        const pendingBuys = (typeof getPendingBuyOrders === 'function') ? getPendingBuyOrders() : [];",
    "",
    "        let shockTitle = '⚠️ تحذير هبوط ذعري شامل (Systemic Shock Alert)';",
    "        let shockDesc = 'أكثر من 80% من أسهم السوق في مسار هابط أو تراجع المؤشر بأكثر من -3.0%. تم تجميد إشارات الشراء عند الدعوم تلقائياً لحماية السيولة.';",
    "        let shockBadge = 'تجميد الشراء';",
    "        let actionLabel = 'متابعة نبض السوق 📊';",
    "        let actionType = 'RADAR';",
    "",
    "        if (pendingBuys.length > 0) {",
    "          const buySummary = pendingBuys.map(o => `${o.name} (${o.ticker}) بسعر ${Number(o.orderPrice).toFixed(2)} ج`).join(' و ');",
    "          shockTitle = `🚨 إلغاء فوري لأوامر الشراء في ثندر (${pendingBuys.map(o => o.ticker).join(', ')})`;",
    "          shockDesc = `السوق في هبوط ذعري شامل! ادخل على تطبيق ثندر فوراً وألغِ أمر شراء ${buySummary} لحماية كاشك وتجنب الشراء في الهبوط العنيف.`;",
    "          shockBadge = 'إلغاء أمر ثندر فوراً ⚡';",
    "          actionLabel = 'فتح ثندر لإلغاء الأمر ⚡';",
    "          actionType = 'OPEN_THNDR';",
    "        }",
    "",
    "        const shockAlert = {",
    "          id: 'shock_systemic_alert',",
    "          ticker: pendingBuys.length > 0 ? pendingBuys[0].ticker : 'EGX',",
    "          name: 'سوق البورصة المصرية',",
    "          type: 'SYSTEMIC_SHOCK',",
    "          title: shockTitle,",
    "          desc: shockDesc,",
    "          badge: shockBadge,",
    "          actionLabel: actionLabel,",
    "          actionType: actionType,",
    "          time: formatCairoTime(new Date(), false, true)",
    "        };",
    "        alertsList.push(shockAlert);",
    "        // Systemic shock alerts are life-or-death guardrails: ALWAYS show and prioritize on mobile/desktop",
    "        highestPriorityAlert = shockAlert;",
    "      }",
    ""
]

lines[start_idx:end_idx] = replacement_lines

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("SUCCESS_FIXED_JS_APP")
