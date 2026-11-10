with open('js/ui.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = '<strong class="text-white font-mono font-bold">${fvObj ? fvObj.fairValue.toFixed(2) + \' ج\' : \'--\'}</strong>'
replacement = '<strong class="text-white font-mono font-bold">${(fvObj && fvObj.fairValue !== null) ? `${Number(fvObj.fairValue).toFixed(2)} ج` : \'قيد الإفصاح المعتمد\'}</strong>'

badge_target = '${fvObj ? `'
badge_replacement = '${(fvObj && fvObj.fairValue !== null && fvObj.discountPct !== null) ? `'

assert target in text, 'target not found'
text = text.replace(target, replacement, 1)

# Only replace the badge_target that occurs immediately after replacement
pos = text.find(replacement)
assert pos != -1
pos2 = text.find(badge_target, pos)
assert pos2 != -1 and pos2 - pos < 300, 'badge target not close to replacement'
text = text[:pos2] + badge_replacement + text[pos2 + len(badge_target):]

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully patched radar fair value rendering in js/ui.js')
