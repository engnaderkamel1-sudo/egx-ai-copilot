with open('js/ai.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = """        const portfolioSummary = portfolioData.map(p => {
          const buy = p.buyPrice || p.costPrice || p.currentPrice || 0;
          const cur = p.currentPrice || buy;
          const ret = buy > 0 ? (((cur - buy) / buy) * 100).toFixed(1) : '0.0';
          const tech = p.pivotR1 ? `[مقاومة R1: ${p.pivotR1} ج، هدف R2: ${p.pivotR2 || '--'} ج، دعم S1: ${p.pivotS1} ج، وقف متحرك مقترح: ${p.proposedTrailingStop || (p.pivotR1 * 0.975).toFixed(2)} ج، RSI: ${p.rsi || '--'}، متوسط 50: ${p.sma50 || '--'} ج، عائد/مخاطرة R/R: ${p.rrDisplay || '--'}]` : '';
          return `- سهم ${p.name} (${p.ticker}): عدد ${p.shares || 0} سهم، متوسط تكلفة الشراء ${buy} ج، السعر اللحظي ${cur} ج، العائد: ${ret}% ${tech}`;
        }).join('\\n');

        const topRadarSummary = fullMarketRadar.slice(0, 8).map(r => 
          `- سهم ${r.name} (${r.ticker}): سعر ${r.price} ج (${r.changePct})، سيولة ${r.volumeMultiplier}، مقاومة R1: ${r.pivotR1 || r.target1}، دعم S1: ${r.pivotS1 || r.support}، اتجاه: ${r.trend || r.type}، عائد/مخاطرة: ${r.rrDisplay}`
        ).join('\\n');"""

replacement = """        const portfolioSummary = portfolioData.map(p => {
          const buy = p.buyPrice || p.costPrice || p.currentPrice || 0;
          const cur = p.currentPrice || buy;
          const ret = buy > 0 ? (((cur - buy) / buy) * 100).toFixed(1) : '0.0';
          const custom = (typeof EGX_Portfolio !== 'undefined' && typeof EGX_Portfolio.getCustomLevels === 'function') ? EGX_Portfolio.getCustomLevels(p.ticker) : null;
          const safeStop = (custom && custom.customStopLoss) ? `${custom.customStopLoss} ج (محدد يدوياً)` : (p.stopLoss || p.pivotS1 || '--');
          const targetLvl = (custom && custom.customTarget1) ? `${custom.customTarget1} ج (محدد يدوياً)` : (p.target1 || p.pivotR1 || '--');
          const tech = p.pivotR1 ? `[مقاومة R1: ${p.pivotR1} ج، هدف R2: ${p.pivotR2 || '--'} ج، دعم S1: ${p.pivotS1} ج، حد بيع آمن/وقف: ${safeStop}، مستهدف: ${targetLvl}، RSI: ${p.rsi || '--'}، متوسط 50: ${p.sma50 || '--'} ج]` : `[حد أمان: ${safeStop}]`;
          return `- سهم ${p.name} (${p.ticker}): عدد ${p.shares || 0} سهم، متوسط شراء ${buy} ج، سعر لحظي ${cur} ج، عائد: ${ret}% ${tech}`;
        }).join('\\n');

        const topRadarSummary = fullMarketRadar.map(r => 
          `- سهم ${r.name} (${r.ticker}): سعر لحظي ${r.price} ج (${r.changePct})، سيولة ${r.volumeMultiplier}، هدف R1: ${r.pivotR1 || r.target1}، دعم S1: ${r.pivotS1 || r.support}، وقف أمان: ${r.stopLoss || '--'}`
        ).join('\\n');

        const pendingOrdersSummary = (Array.isArray(window.pendingThndrOrders) && window.pendingThndrOrders.length > 0)
          ? window.pendingThndrOrders.map(o => `- أمر معلق: ${o.type} لسهم ${o.name} (${o.ticker}) بسعر ${o.orderPrice} ج بعدد ${o.shares} سهم`).join('\\n')
          : 'لا توجد أوامر معلقة حالياً.';"""

# Normalize
norm_code = code.replace('\r\n', '\n')
norm_target = target.replace('\r\n', '\n')
norm_replacement = replacement.replace('\r\n', '\n')

assert norm_target in norm_code, "Target not found in js/ai.js"
norm_code = norm_code.replace(norm_target, norm_replacement)

# Also enhance prompt instructions
prompt_target = """أنت "مستشار البورصة المصرية المعتمد والمحلل المالي الرقمي" (EGX Institutional Copilot).
المستخدم مستثمر في البورصة المصرية ويدير محفظته عبر تطبيق ثندر (Thndr):"""

prompt_replacement = """أنت "مستشار البورصة المصرية المعتمد والمحلل المالي الرقمي" (EGX Institutional Copilot).
المستخدم مستثمر في البورصة المصرية ويدير محفظته عبر تطبيق ثندر (Thndr).
قاعدة ذهبية إلزامية: جميع الأرقام الواردة أدناه هي أرقام ديناميكية لحظية حقيقية 100% مسحوبة لحظياً من البورصة المصرية ومحفظة المستخدم. يُمنع منعاً باتاً ذكر أي أرقام ثابتة قديمة أو مخترعة؛ التزم فقط بهذه الأرقام الديناميكية:"""

norm_target_prompt = prompt_target.replace('\r\n', '\n')
norm_replacement_prompt = prompt_replacement.replace('\r\n', '\n')

assert norm_target_prompt in norm_code, "Prompt target not found"
norm_code = norm_code.replace(norm_target_prompt, norm_replacement_prompt)

# Append pending orders to prompt
pending_anchor = "دروس وذاكرة المتداول السابقة المستخلصة من صفقاته المحققة في ثندر:"
norm_code = norm_code.replace(pending_anchor, "الأوامر المعلقة النشطة في ثندر (Pending Orders):\n${pendingOrdersSummary}\n\n" + pending_anchor)

if '\r\n' in code:
    final_code = norm_code.replace('\n', '\r\n')
else:
    final_code = norm_code

with open('js/ai.js', 'w', encoding='utf-8') as f:
    f.write(final_code)

print('js/ai.js updated successfully!')
