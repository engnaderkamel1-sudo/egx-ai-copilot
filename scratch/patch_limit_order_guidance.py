import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update js/ui.js
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_text = f.read()

# In renderAccumulationCard:
target_acc_box = '''              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع أمر التزويد المقترح:</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر الشراء عند: ${Number(suggestedBuy).toFixed(2)} ج
                  </span>
                </div>
              </div>'''

replacement_acc_box = '''              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع أمر التزويد المقترح:</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر الشراء عند: ${Number(suggestedBuy).toFixed(2)} ج
                  </span>
                </div>
              </div>

              <!-- Mandatory Limit Order Reminder -->
              <div class="bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-200 font-bold shadow-sm">
                <span class="text-base shrink-0">📌</span>
                <span class="leading-relaxed">تنبيه إلزامي للمستثمر: اختر دائماً في تطبيق ثندر <strong>(أمر بسعر محدد • Limit Order)</strong> وضع سعر التزويد عند <strong>${Number(suggestedBuy).toFixed(2)} ج</strong> ولا تشترِ بسعر السوق المباشر.</span>
              </div>'''

assert target_acc_box in ui_text, "target_acc_box not found in js/ui.js"
ui_text = ui_text.replace(target_acc_box, replacement_acc_box, 1)

# In renderAccumulationCard button:
target_acc_btn = '<span>تنفيذ الشراء في تطبيق ثندر 🚀</span>'
replacement_acc_btn = '<span>تنفيذ تزويد بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>'
assert target_acc_btn in ui_text, "target_acc_btn not found in js/ui.js"
ui_text = ui_text.replace(target_acc_btn, replacement_acc_btn, 1)

# In renderMarketOpportunityCard:
target_opp_box = '''              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع الأمر المقترح (أشتري على كام في ثندر؟):</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر الشراء عند: ${Number(suggestedBuy).toFixed(2)} ج
                  </span>
                </div>
              </div>'''

replacement_opp_box = '''              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs sm:text-sm font-extrabold text-amber-300">🎯 سعر وضع الأمر المقترح (أشتري على كام في ثندر؟):</span>
                </div>
                <div class="text-right sm:text-left">
                  <span class="text-base sm:text-lg font-black text-amber-300 font-mono bg-black/60 px-3 py-0.5 rounded-lg border border-amber-500/40 inline-block">
                    ضع أمر الشراء عند: ${Number(suggestedBuy).toFixed(2)} ج
                  </span>
                </div>
              </div>

              <!-- Mandatory Limit Order Reminder -->
              <div class="bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-200 font-bold shadow-sm">
                <span class="text-base shrink-0">📌</span>
                <span class="leading-relaxed">تنبيه إلزامي للمستثمر: اختر دائماً في تطبيق ثندر <strong>(أمر بسعر محدد • Limit Order)</strong> وضع سعر الشراء عند <strong>${Number(suggestedBuy).toFixed(2)} ج</strong> ولا تشترِ بسعر السوق المباشر.</span>
              </div>'''

assert target_opp_box in ui_text, "target_opp_box not found in js/ui.js"
ui_text = ui_text.replace(target_opp_box, replacement_opp_box, 1)

# In renderMarketOpportunityCard button:
target_opp_btn = '<span>فتح السهم وتنفيذ الشراء في تطبيق ثندر 🚀</span>'
replacement_opp_btn = '<span>تنفيذ شراء بأمر محدد (${Number(suggestedBuy).toFixed(2)} ج) في ثندر 🚀</span>'
assert target_opp_btn in ui_text, "target_opp_btn not found in js/ui.js"
ui_text = ui_text.replace(target_opp_btn, replacement_opp_btn, 1)

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_text)
print("Updated js/ui.js successfully!")

# 2. Update js/modals.js
with open('js/modals.js', 'r', encoding='utf-8') as f:
    mod_text = f.read()

target_mod_input = '<!-- Quantity & Price Inputs -->'
reminder_mod = '''<!-- Limit Order Mandatory Reminder -->
          <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2 text-[11px] text-amber-200 font-bold">
            <span class="text-base shrink-0">📌</span>
            <span>قاعدة الشراء الآمن: تأكد دائماً في تطبيق ثندر من اختيار <strong>(أمر بسعر محدد • Limit Order)</strong> ولا تنفذ بسعر السوق المباشر.</span>
          </div>

          <!-- Quantity & Price Inputs -->'''

assert target_mod_input in mod_text, "target_mod_input not found in js/modals.js"
mod_text = mod_text.replace(target_mod_input, reminder_mod, 1)

with open('js/modals.js', 'w', encoding='utf-8') as f:
    f.write(mod_text)
print("Updated js/modals.js successfully!")
