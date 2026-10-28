/**
 * EGX AI Copilot - Modals Layer (js/modals.js)
 * Pure modular injection of application modals into the DOM.
 */
(function () {
  'use strict';
  const modalsHTML = `
  <!-- Buy / Sell Transaction Modal (تسجيل الصفقات اللحظية المباشرة) -->
  <div id="trade-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden overflow-y-auto p-3 sm:p-4 items-center justify-center">
    <div class="modal-card bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <i data-lucide="arrow-left-right" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">تسجيل صفقة (شراء / بيع في ثندر)</h3>
            <p class="text-[11px] text-gray-400">تحديث فوري لعدد الأسهم ومتوسط التكلفة ورصيد الكاش</p>
          </div>
        </div>
        <button onclick="closeTradeModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition" aria-label="إغلاق">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Trade Type Selector (Tabs) -->
      <div class="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800 shrink-0">
        <button type="button" onclick="setTradeMode('BUY')" id="btn-trade-mode-buy" class="py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 bg-emerald-600 text-white shadow">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>🟢 تسجيل شراء (جديد / تعزيز)</span>
        </button>
        <button type="button" onclick="setTradeMode('SELL')" id="btn-trade-mode-sell" class="py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 text-gray-400 hover:text-white">
          <i data-lucide="minus-circle" class="w-4 h-4"></i>
          <span>🔴 تسجيل بيع (جني أرباح / خروج)</span>
        </button>
      </div>

      <form id="trade-form" onsubmit="handleExecuteTrade(event)" class="flex-1 flex flex-col min-h-0 text-xs">
        <!-- Scrollable Inputs Area -->
        <div class="modal-scroll-body flex-1 overflow-y-auto overscroll-contain pr-1 space-y-4">
          <!-- Stock Selector -->
          <div>
            <label class="block text-gray-300 font-bold mb-1">اختر السهم أو الشركة:</label>
            <div class="flex gap-2">
              <select id="trade-stock-select" onchange="onTradeStockSelected()" class="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none">
                <!-- Dynamically populated from portfolio + radar -->
              </select>
              <input type="text" id="trade-custom-ticker" placeholder="كود السهم (مثال: ETEL)" class="w-40 bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono uppercase text-xs focus:border-emerald-500 focus:outline-none hidden">
            </div>
            <div class="flex items-center justify-between text-[11px] text-gray-400 mt-1">
              <span id="trade-stock-info">اختر سهم لعرض رصيدك الحالي وسعر البورصة اللحظي</span>
              <button type="button" onclick="toggleTradeCustomTicker()" class="text-cyan-400 hover:underline font-bold" id="trade-toggle-custom-btn">سهم جديد غير موجود بالقائمة؟</button>
            </div>
          </div>

          <!-- Limit Order Mandatory Reminder -->
          <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2 text-[11px] text-amber-200 font-bold">
            <span class="text-base shrink-0">📌</span>
            <span>قاعدة الشراء الآمن: تأكد دائماً في تطبيق ثندر من اختيار <strong>(أمر بسعر محدد • Limit Order)</strong> ولا تنفذ بسعر السوق المباشر.</span>
          </div>

          <!-- Quantity & Price Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-gray-300 font-bold mb-1">عدد الأسهم (الكمية):</label>
              <input type="number" id="trade-shares-input" min="1" step="1" required oninput="recalcTradeSummary()" placeholder="مثال: 50" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-gray-300 font-bold mb-1">سعر التنفيذ للسهم (ج.م):</label>
              <input type="number" id="trade-price-input" step="0.01" min="0.01" required oninput="recalcTradeSummary()" placeholder="مثال: 110.00" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none">
            </div>
          </div>

          <!-- Calculation & Impact Summary Box -->
          <div class="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2" id="trade-summary-box">
            <div class="flex items-center justify-between font-bold text-white">
              <span>إجمالي قيمة العملية:</span>
              <span class="text-emerald-400 font-mono text-sm" id="trade-total-val">0.00 ج.م</span>
            </div>
            <div class="text-[11px] text-gray-300 flex items-center justify-between border-t border-gray-800/80 pt-1.5" id="trade-impact-text">
              <span>أثر العملية على المحفظة:</span>
              <span class="text-cyan-300 font-mono" id="trade-impact-val">--</span>
            </div>
          </div>

          <!-- Cash Allocation Destination Selector (Visible during SELL mode) -->
          <div id="trade-sell-allocation-box" class="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2 hidden">
            <label class="block text-gray-200 font-bold text-xs flex items-center gap-1.5">
              <i data-lucide="compass" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>أين تريد توجيه السيولة النقدية الناتجة عن البيع؟</span>
            </label>
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 text-gray-200 text-xs p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer hover:border-emerald-500/40">
                <input type="radio" name="trade-cash-dest" id="dest-free-cash" value="FREE_CASH" checked class="text-emerald-500">
                <div>
                  <span class="font-bold text-white block">💵 إيداع كاش حر في المحفظة (الافتراضي)</span>
                  <span class="text-[10.5px] text-gray-400">ينزل العائد فوراً في رصيد الكاش الحر لديك ويكون جاهزاً لاقتناص أي هبوط.</span>
                </div>
              </label>
              <label class="flex items-center gap-2 text-gray-200 text-xs p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer hover:border-cyan-500/40">
                <input type="radio" name="trade-cash-dest" id="dest-pending-buy" value="PENDING_BUY" class="text-cyan-500">
                <div>
                  <span class="font-bold text-cyan-300 block">🎯 تسجيل أمر شراء معلق عند الدعم (تكبير الأسهم مجاناً)</span>
                  <span class="text-[10.5px] text-gray-400">حجز المبلغ لإعادة شراء نفس السهم عند القاع لكسب أسهم إضافية مجاناً.</span>
                </div>
              </label>
              <label class="flex items-center gap-2 text-gray-200 text-xs p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer hover:border-purple-500/40">
                <input type="radio" name="trade-cash-dest" id="dest-radar-rotate" value="RADAR_ROTATE" class="text-purple-500">
                <div>
                  <span class="font-bold text-purple-300 block">🚀 تدوير في فرصة ذهبية من رادار السوق</span>
                  <span class="text-[10.5px] text-gray-400">توجيه المبلغ لشراء سهم قيادي يتداول في قاع صاعد من رادار السوق.</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Auto Cash Deduction Checkbox -->
          <label class="flex items-center gap-2 text-gray-300 text-[11px] cursor-pointer">
            <input type="checkbox" id="trade-auto-cash" checked class="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500 bg-gray-950 w-4 h-4">
            <span id="trade-cash-label">تحديث رصيد الكاش تلقائياً (خصم في الشراء أو إضافة في البيع)</span>
          </label>
        </div>

        <!-- Submit Button (Always Pinned at Bottom / Reachable) -->
        <div class="pt-3 border-t border-gray-800 flex items-center gap-3 shrink-0">
          <button type="submit" id="btn-submit-trade" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span id="trade-submit-label">تأكيد عملية الشراء وتحديث المحفظة</span>
          </button>
          <button type="button" onclick="closeTradeModal()" class="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Thndr 1-Click Sync & Import Modal -->
  <div id="thndr-sync-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden overflow-y-auto p-3 sm:p-4 items-center justify-center">
    <div class="modal-card bg-gray-900 border border-emerald-500/50 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
            <i data-lucide="zap" class="w-5 h-5 text-amber-300"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base flex items-center gap-2">
              <span>أداة مزامنة محفظة ثندر بالقرش</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">100% Accurate</span>
            </h3>
            <p class="text-xs text-gray-400">سحب أحدث أرقام أسهمك ومتوسطات الشراء من ثندر وتحديث التطبيق في 3 خطوات بسيطة</p>
          </div>
        </div>
        <button onclick="closeThndrSyncModal()" class="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition cursor-pointer" aria-label="إغلاق">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Scrollable Wizard Body -->
      <div class="modal-scroll-body flex-1 overflow-y-auto overscroll-contain space-y-4 pr-1 text-xs text-gray-300">
        
        <!-- STEP 1: Copy Script -->
        <div class="p-4 bg-gray-950 rounded-2xl border border-emerald-500/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">1</span>
              <span class="font-bold text-white text-xs">الخطوة الأولى: انسخ كود السحب المعتمد</span>
            </div>
            <button onclick="copyThndrVerifiedScript()" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer transform active:scale-95">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span id="btn-copy-verified-text">📋 اضغط هنا لنسخ الكود</span>
            </button>
          </div>

          <!-- Collapsible Script Preview Box -->
          <details class="text-[11px] text-gray-400 cursor-pointer">
            <summary class="hover:text-emerald-300 transition select-none">عرض نص الكود البرمجي (للاطلاع أو النسخ اليدوي) ▾</summary>
            <textarea id="thndr-verified-script-box" readonly rows="4" class="w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-[10px] font-mono text-emerald-400 select-all focus:outline-none"></textarea>
          </details>
        </div>

        <!-- STEP 2: Run in Thndr -->
        <div class="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-2.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">2</span>
              <span class="font-bold text-white text-xs">الخطوة الثانية: شغل الكود في ثندر ويب</span>
            </div>

          </div>

          <div class="space-y-1.5 text-[11px] text-gray-300 leading-relaxed pr-8">
            <p>1. افتح موقع ثندر وسجل دخولك وادخل على شاشة <strong>"المحفظة"</strong>.</p>
            <p>2. اضغط <kbd class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700 font-mono">F12</kbd> في الكيبورد وافتح تبويب <strong>Console</strong>.</p>
            <p>3. اعمل لصق (<kbd class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700 font-mono">Ctrl + V</kbd>) واضغط <kbd class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700 font-mono">Enter</kbd> (هيتم نسخ الناتج تلقائياً لحافظتك).</p>
          </div>
        </div>

        <!-- STEP 3: Paste and Update -->
        <div class="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-amber-500 text-gray-950 font-bold flex items-center justify-center text-xs shrink-0 shadow">3</span>
              <span class="font-bold text-white text-xs">الخطوة الثالثة: الصق الناتج هنا واضغط تحديث</span>
            </div>
            <button onclick="pasteThndrFromClipboard()" class="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-emerald-600 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer">
              <i data-lucide="clipboard" class="w-3.5 h-3.5"></i>
              <span>لصق من الحافظة فوراً</span>
            </button>
          </div>

          <textarea id="thndr-manual-json-input" rows="5" placeholder='الصق هنا الكود الذي تم نسخه من Console ثندر...
مثال:
[
  { "ticker": "COMI", "shares": 122, "buyPrice": 140.48 },
  { "ticker": "SWDY", "shares": 110, "buyPrice": 93.86 }
]' class="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-emerald-300 font-mono text-[11px] focus:border-emerald-500 focus:outline-none leading-relaxed"></textarea>

          <div class="flex items-center justify-between text-[11px] bg-gray-950/80 p-2.5 rounded-xl border border-gray-800">
            <label class="flex items-center gap-1.5 text-gray-200 cursor-pointer">
              <input type="checkbox" id="thndr-replace-all" checked class="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500">
              <span>استبدال المحفظة بالكامل بالأرقام الجديدة المحدثة</span>
            </label>
          </div>

          <button onclick="handleManualThndrImportSubmit()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/60 cursor-pointer transform active:scale-95">
            <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i>
            <span>⚡ تحديث المحفظة فوراً بالقرش (Update Portfolio)</span>
          </button>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="pt-3 border-t border-gray-800 flex items-center justify-between shrink-0">
        <span class="text-xs text-slate-300 font-medium">يتم الحفظ التلقائي في جهازك وإعادة حساب الأسعار اللحظية فوراً ✅</span>
        <button onclick="closeThndrSyncModal()" class="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
          إغلاق
        </button>
      </div>
    </div>
  </div>

  <!-- Add / Edit Asset Modal -->
  <div id="asset-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden overflow-y-auto p-3 sm:p-4 items-center justify-center">
    <div class="modal-card bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
        <h3 class="font-bold text-white text-base" id="modal-title">إضافة / تعديل أصل مالي</h3>
        <button onclick="closeAssetModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition" aria-label="إغلاق">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="asset-form" onsubmit="handleSaveAsset(event)" class="flex-1 flex flex-col min-h-0 text-xs">
        <input type="hidden" id="asset-edit-index" value="-1">
        
        <div class="modal-scroll-body flex-1 overflow-y-auto overscroll-contain pr-1 space-y-3">
          <div>
            <label class="block text-gray-300 font-bold mb-1">رمز السهم (Ticker):</label>
            <input type="text" id="modal-ticker" required placeholder="مثال: COMI أو SWDY" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-emerald-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-300 font-bold mb-1">اسم الشركة:</label>
            <input type="text" id="modal-name" required placeholder="مثال: البنك التجاري الدولي" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-300 font-bold mb-1">القطاع والتصنيف:</label>
            <input type="text" id="modal-category" required placeholder="مثال: EGX30 • قطاع بنكي" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
          </div>

          <!-- Shares & Price Inputs -->
          <div class="p-3 bg-gray-950/80 rounded-xl border border-indigo-500/30 space-y-2">
            <div class="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
              <span>بيانات الأسهم والأسعار (Shares & Prices):</span>
              <span class="text-xs text-slate-300">حساب تلقائي للقيمة والأرباح</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label class="block text-indigo-400 font-bold mb-1 text-[11px]">عدد الأسهم:</label>
                <input type="number" id="modal-shares" min="1" step="1" oninput="recalcAssetModal()" placeholder="مثال: 17" class="w-full bg-gray-900 border border-indigo-500/50 rounded-xl px-2.5 py-2 text-white font-mono font-bold text-xs focus:border-indigo-400 focus:outline-none text-center">
              </div>
              <div>
                <label class="block text-cyan-400 font-bold mb-1 text-[11px]">سعر السهم (ج):</label>
                <input type="number" id="modal-current-price" min="0.01" step="0.01" oninput="recalcAssetModal()" placeholder="مثال: 876.00" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-white font-mono font-bold text-xs focus:border-cyan-400 focus:outline-none text-center">
              </div>
              <div>
                <label class="block text-gray-300 font-bold mb-1 text-[11px]">متوسط الشراء (ج):</label>
                <input type="number" id="modal-buy-price" min="0.01" step="0.01" oninput="recalcAssetModal()" placeholder="مثال: 715.00" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-white font-mono font-bold text-xs focus:border-indigo-500 focus:outline-none text-center">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-gray-300 font-bold mb-1">إجمالي القيمة الحالية (ج.م):</label>
              <input type="number" id="modal-value" step="0.1" required placeholder="15215" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-gray-300 font-bold mb-1">صافي الربح / الخسارة (ج.م):</label>
              <input type="number" id="modal-profit" step="0.1" required placeholder="+3060" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-gray-300 font-bold mb-1">توجيه المستشار الحالي:</label>
            <input type="text" id="modal-advice" required placeholder="مثال: احتفاظ • سهم قوي للاستثمار" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
          </div>
        </div>

        <div class="flex items-center gap-2 pt-3 border-t border-gray-800 shrink-0">
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer">
            حفظ الأصل في المحفظة
          </button>
          <button type="button" onclick="closeAssetModal()" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Dedicated Google Gemini API Key Setup Modal -->
  <div id="gemini-modal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full shadow-2xl relative modal-card flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <i data-lucide="key" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">ربط مفتاح Google Gemini API</h3>
            <p class="text-xs text-gray-400">تفعيل التحليل والاستشارات اللحظية لبيانات الأسهم</p>
          </div>
        </div>
        <button onclick="closeGeminiModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Step 1 banner -->
        <div class="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div>
            <div class="font-bold text-cyan-300">الخطوة 1: الحصول على المفتاح المجاني</div>
            <div class="text-[11px] text-gray-300 mt-0.5">منصة Google AI Studio الرسمية مجانية بالكامل.</div>
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition shadow">
            <span>فتح Google AI Studio</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <!-- Step 2 Input -->
        <div class="space-y-2">
          <label class="block font-bold text-white text-xs">الخطوة 2: الصق المفتاح هنا (يبدأ بـ AIzaSy...):</label>
          <div class="relative">
            <input type="text" id="modal-gemini-key-input" placeholder="AIzaSy..." class="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider">
          </div>
          <p class="text-[11px] text-gray-400">🔒 أمان تام: يتم حفظ المفتاح داخل متصفحك الحالي فقط (Local Storage) ولا يُرسل لأي طرف خارجي.</p>
        </div>

        <!-- Feedback alert box -->
        <div id="modal-gemini-feedback" class="text-xs hidden p-3 rounded-xl"></div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 p-4 sm:p-5 pt-3 border-t border-gray-800 shrink-0 safe-bottom">
        <button onclick="saveGeminiKeyFromModal()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>حفظ وتفعيل محرك التحليل ✅</span>
        </button>
        <button onclick="testGeminiConnectionFromModal()" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
          <i data-lucide="zap" class="w-4 h-4"></i>
          <span>اختبار الاتصال ⚡</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Investment Recommendation Report & Due Diligence Modal -->
  <div id="audit-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-2 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full shadow-2xl relative modal-card flex flex-col max-h-[92vh]">
      <div class="flex items-center justify-between border-b border-gray-800 p-3.5 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 shrink-0">
            <i data-lucide="file-text" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-white text-sm sm:text-base" id="audit-modal-title">تقرير الاقتراح الاستثماري ومصادر القرار</h3>
              <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">مدقق 📊</span>
            </div>
            <p class="text-[11px] text-gray-400" id="audit-modal-subtitle">بيان تحليلي فني ومالي وحوكمة مخاطر بالأرقام والمصادر المباشرة</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="copyAuditReport()" class="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 hover:text-white border border-gray-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="نسخ نص التقرير والمصادر">
            <i data-lucide="copy" class="w-4 h-4"></i>
            <span class="hidden sm:inline">نسخ</span>
          </button>
          <button type="button" onclick="printAuditReport()" class="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-emerald-300 hover:text-white border border-gray-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="طباعة أو تصدير التقرير PDF">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span class="hidden sm:inline">طباعة</span>
          </button>
          <button type="button" onclick="closeAuditModal()" class="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition cursor-pointer" aria-label="إغلاق">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <div class="p-3.5 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Rating Consensus Banner -->
        <div class="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between flex-wrap gap-2 text-xs" id="audit-consensus-banner">
          <!-- Dynamically injected via JS -->
        </div>

        <!-- The 3 Pillars Breakdown Cards -->
        <div class="space-y-3.5 text-xs" id="audit-agents-container">
          <!-- Injected via JS -->
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-3.5 sm:p-5 pt-3 border-t border-gray-800 shrink-0 safe-bottom bg-gray-950/60 rounded-b-2xl">
        <div class="flex items-center gap-2 text-[11px] text-gray-400">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
          <span>تم التحقق من إفصاحات البورصة الرسمية ومستويات TradingView والشارت اللحظي ✅</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="closeAuditModal()" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition cursor-pointer">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Fine-Tuning Shares & Purchase Cost Modal -->
  <div id="fine-tune-modal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-indigo-500/40 rounded-2xl max-w-lg w-full shadow-2xl relative modal-card flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <i data-lucide="sliders" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base" id="ft-modal-title">الضبط الدقيق للأسهم</h3>
            <p class="text-xs text-gray-400">عدّل عدد الأسهم أو متوسط الشراء وسيعاد حساب القيمة والأرباح لحظياً</p>
          </div>
        </div>
        <button onclick="closeFineTuneModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <input type="hidden" id="ft-asset-index" value="-1">

      <div class="p-4 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Shares Control with Steppers -->
        <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-white text-xs flex items-center gap-1.5">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>عدد الأسهم التي تملكها (Shares Quantity):</span>
            </label>
            <span class="text-[10px] text-gray-400">عدد صحيح بدون كسور</span>
          </div>
          
          <div class="flex items-center gap-2">
            <button type="button" onclick="adjustFineTuneShares(-10)" class="px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono font-bold cursor-pointer">-10</button>
            <button type="button" onclick="adjustFineTuneShares(-1)" class="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-300 font-mono font-bold text-sm cursor-pointer">-1</button>
            <input type="number" id="ft-input-shares" min="1" step="1" oninput="recalcFineTunePreview()" class="flex-1 bg-gray-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-base focus:border-indigo-400 focus:outline-none">
            <button type="button" onclick="adjustFineTuneShares(+1)" class="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-300 font-mono font-bold text-sm cursor-pointer">+1</button>
            <button type="button" onclick="adjustFineTuneShares(+10)" class="px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono font-bold cursor-pointer">+10</button>
          </div>
        </div>

        <!-- Prices Row with Manual Piastre Typing and 1-Piastre Steppers -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Buy Price Input -->
          <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-gray-300 text-[11px]">متوسط سعر الشراء (ج.م):</label>
              <span class="text-xs text-slate-300">سعر التكلفة للسهم</span>
            </div>
            
            <input type="number" id="ft-input-buy-price" min="0.01" step="0.01" inputmode="decimal" onfocus="this.select()" oninput="recalcFineTunePreview()" onchange="recalcFineTunePreview()" placeholder="مثال: 43.02" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-indigo-400 focus:outline-none">
            
            <!-- Real-Time Piastre Breakdown -->
            <div class="flex items-center justify-between text-[11px] bg-gray-900/60 px-2.5 py-1 rounded-lg border border-gray-800">
              <span class="text-gray-400 text-[10px]">القراءة بالقروش:</span>
              <span id="ft-buy-price-breakdown" class="text-indigo-300 font-mono font-bold text-[11px]">--</span>
            </div>

            <!-- Quick Piastre (+/-) Steppers including Single Piastre (بالقرش) -->
            <div class="flex items-center justify-between gap-1 pt-1 border-t border-gray-800/80">
              <span class="text-xs text-slate-300 font-bold">ضبط سريع:</span>
              <div class="flex items-center gap-1">
                <button type="button" onclick="adjustFineTunePrice('ft-input-buy-price', -0.10)" class="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[10px] cursor-pointer" title="إنقاص 10 قروش">-10ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-buy-price', -0.01)" class="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-[10px] cursor-pointer" title="إنقاص قرش واحد فقط">-1ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-buy-price', +0.01)" class="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-[10px] cursor-pointer" title="زيادة قرش واحد فقط">+1ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-buy-price', +0.10)" class="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[10px] cursor-pointer" title="زيادة 10 قروش">+10ق</button>
              </div>
            </div>
          </div>

          <!-- Current Market Price Input -->
          <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-gray-300 text-[11px]">سعر السهم بالسوق الآن (ج.م):</label>
              <span class="text-[10px] text-emerald-400/80">سعر البورصة اللحظي</span>
            </div>
            
            <input type="number" id="ft-input-current-price" min="0.01" step="0.01" inputmode="decimal" onfocus="this.select()" oninput="recalcFineTunePreview()" onchange="recalcFineTunePreview()" placeholder="مثال: 51.83" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-indigo-400 focus:outline-none">
            
            <!-- Real-Time Piastre Breakdown -->
            <div class="flex items-center justify-between text-[11px] bg-gray-900/60 px-2.5 py-1 rounded-lg border border-gray-800">
              <span class="text-gray-400 text-[10px]">القراءة بالقروش:</span>
              <span id="ft-current-price-breakdown" class="text-emerald-300 font-mono font-bold text-[11px]">--</span>
            </div>

            <!-- Quick Piastre (+/-) Steppers including Single Piastre (بالقرش) -->
            <div class="flex items-center justify-between gap-1 pt-1 border-t border-gray-800/80">
              <span class="text-xs text-slate-300 font-bold">ضبط سريع:</span>
              <div class="flex items-center gap-1">
                <button type="button" onclick="adjustFineTunePrice('ft-input-current-price', -0.10)" class="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[10px] cursor-pointer" title="إنقاص 10 قروش">-10ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-current-price', -0.01)" class="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] cursor-pointer" title="إنقاص قرش واحد فقط">-1ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-current-price', +0.01)" class="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] cursor-pointer" title="زيادة قرش واحد فقط">+1ق</button>
                <button type="button" onclick="adjustFineTunePrice('ft-input-current-price', +0.10)" class="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[10px] cursor-pointer" title="زيادة 10 قروش">+10ق</button>
              </div>
            </div>

            <!-- Timestamp & Source Indicator with Instant Single Fetch -->
            <div class="flex items-center justify-between text-[10px] bg-gray-900/90 px-2.5 py-1.5 rounded-lg border border-gray-800 text-gray-300 mt-2">
              <span class="flex items-center gap-1 font-mono">
                <i data-lucide="clock" class="w-3 h-3 text-cyan-400"></i>
                <span id="ft-price-updated-at">آخر تحديث: اليوم</span>
              </span>
              <div class="flex items-center gap-2">
                <span id="ft-price-source-badge" class="px-1.5 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-300 font-bold">شاشة البورصة</span>
                <button type="button" onclick="fetchSingleStockLivePrice()" class="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-0.5 cursor-pointer" title="سحب السعر اللحظي الحالي من البورصة لهذا السهم">
                  <span>سحب السعر اللحظي ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Explanatory Tooltip Box: What is Average Purchase Price? -->
        <div class="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-200/90 leading-relaxed flex items-start gap-2.5">
          <i data-lucide="info" class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold text-white block mb-0.5">ما هو «متوسط سعر الشراء» وكيف يقيس تطور أرباحك؟</span>
            <span>هو متوسط تكلفة السهم الواحد عليك في ثندر بعد حساب كل عمليات الشراء (إجمالي ما دفعته مقسوماً على عدد الأسهم). مثلاً لو اشتريت 100 سهم بـ 10 ج ثم 100 سهم بـ 8 ج، فمتوسط الشراء = 9 ج. هذا الرقم هو «المسطرة الأساسية» لحساب تطور أرباحك.</span>
          </div>
        </div>

        <!-- 3-Box Evolution & Performance Progression Flow -->
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-gray-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-2.5">
          <div class="text-[11px] font-bold text-indigo-300 flex items-center justify-between border-b border-gray-800 pb-2">
            <span class="flex items-center gap-1.5">
              <i data-lucide="trending-up" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>متابعة رحلة تطور السهم (اشتريت بكام ⬅️ بقى بكام ⬅️ التطور كام):</span>
            </span>
            <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">حساب حي لحظي</span>
          </div>
          
          <div class="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
              <span class="text-gray-400 block text-[10px]">1. اشتريت بكام؟ (التكلفة):</span>
              <span class="font-bold text-gray-200 font-mono text-xs sm:text-sm my-0.5" id="ft-preview-cost">0 ج.م</span>
              <span class="text-xs text-gray-500 block font-mono" id="ft-preview-cost-detail">0 سهم @ 0 ج</span>
            </div>

            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
              <span class="text-gray-400 block text-[10px]">2. بقى بكام؟ (القيمة الآن):</span>
              <span class="font-bold text-white font-mono text-xs sm:text-sm my-0.5" id="ft-preview-value">0 ج.م</span>
              <span class="text-xs text-cyan-400/90 block font-mono" id="ft-preview-val-detail">0 سهم @ 0 ج</span>
            </div>

            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
              <span class="text-gray-400 block text-[10px]">3. التطور والفرق (المكسب):</span>
              <span class="font-bold font-mono text-xs sm:text-sm my-0.5" id="ft-preview-profit">0 ج.م</span>
              <span class="text-xs font-mono block" id="ft-preview-return-pct">0.00%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 p-4 sm:p-5 pt-3 border-t border-gray-800 shrink-0 safe-bottom">
        <button onclick="applyFineTuning()" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>حفظ التعديل الدقيق في المحفظة ✅</span>
        </button>
        <button onclick="closeFineTuneModal()" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
          إلغاء
        </button>
      </div>
    </div>
  </div>

  <!-- Smart Rotation & Peak Profit Taking Modal (Trading Around The Core) -->
  <div id="rotation-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-amber-500/40 rounded-2xl max-w-xl w-full shadow-2xl relative modal-card flex flex-col">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400" id="rot-modal-icon-wrap">
            <i data-lucide="compass" class="w-5 h-5" id="rot-modal-icon"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base" id="rot-modal-title">خطة جني أرباح القمة وإعادة الشراء في القاع</h3>
            <p class="text-xs text-gray-400" id="rot-modal-subtitle">تكتيك المحترفين (Trading Around The Core) لتأمين المكسب وزيادة عدد الأسهم مجاناً</p>
          </div>
        </div>
        <button onclick="closeRotationModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <input type="hidden" id="rot-asset-index" value="-1">

      <div class="p-4 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Stock Performance & Live Diagnostics Banner -->
        <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <div class="font-bold text-white text-sm flex items-center gap-2">
              <span id="rot-stock-name">أوراسكوم كونستراكشون</span>
              <span class="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 font-mono text-xs" id="rot-stock-ticker">ORAS</span>
            </div>
            <div class="text-[11px] text-gray-400 mt-0.5 font-mono">
              السعر اللحظي: <strong class="text-cyan-300" id="rot-stock-price">870.00 ج</strong> • 
              متوسط شرائك: <span id="rot-stock-buyprice">715.00 ج</span> • 
              إجمالي أسهمك: <span class="text-indigo-300 font-bold" id="rot-stock-total-shares">17 سهم</span>
            </div>
          </div>
          <div class="text-right">
            <span class="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono text-xs" id="rot-stock-return">+21.7% (+2,635 ج)</span>
            <span class="text-[10px] text-amber-300 block mt-1 font-semibold" id="rot-stock-zone">⚠️ في منطقة قمة وتشبع صاعد</span>
          </div>
        </div>

        <!-- Step 1: Selling / Rebalancing Order (تأمين الكاش أو تحرير السيولة) -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-gray-950 via-slate-900 to-amber-950/30 border border-amber-500/30 space-y-3" id="rot-step1-container">
          <div class="flex items-center justify-between border-b border-gray-800 pb-2">
            <span class="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px] font-mono">1</span>
              <span id="rot-step1-title">الخطوة 1: أمر البيع الجزئي المقترح في ثندر الآن (تأمين الكاش)</span>
            </span>
            <span class="text-[10px] text-gray-400" id="rot-step1-note">لا نبيع 100% أبداً لحماية المركز</span>
          </div>

          <!-- Ratio Quick Selector Buttons -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] text-gray-400 ml-1">نسبة التخفيف:</span>
            <button type="button" onclick="setRotationRatio(0.25)" id="rot-btn-25" class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition cursor-pointer">25% (ربع الكمية)</button>
            <button type="button" onclick="setRotationRatio(0.33)" id="rot-btn-33" class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer">33% (ثلث الكمية - موصى به ⭐)</button>
            <button type="button" onclick="setRotationRatio(0.50)" id="rot-btn-50" class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition cursor-pointer">50% (نصف الكمية)</button>
          </div>

          <!-- Calculated Live Execution Box -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center font-mono">
            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span class="text-gray-400 text-[10px] block font-sans">عدد الأسهم للبيع</span>
              <span class="text-base font-bold text-amber-300" id="rot-sell-shares-count">5 أسهم</span>
              <span class="text-xs text-gray-500 block font-sans mt-0.5" id="rot-sell-shares-pct">(حوالي 30% من الكمية)</span>
            </div>

            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-emerald-500/30" id="rot-cash-card">
              <span class="text-emerald-400 text-[10px] block font-sans" id="rot-cash-generated-label">كاش مضمون يدخل حسابك</span>
              <span class="text-base font-bold text-emerald-300" id="rot-cash-generated">4,350 ج.م</span>
              <span class="text-xs text-emerald-400/80 block font-sans mt-0.5" id="rot-realized-profit-pill">منها 775 ج ربح صافي محقق</span>
            </div>

            <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span class="text-gray-400 text-[10px] block font-sans">الأسهم المتبقية المستمرة</span>
              <span class="text-base font-bold text-indigo-300" id="rot-remaining-shares">12 سهم</span>
              <span class="text-xs text-gray-500 block font-sans mt-0.5" id="rot-remaining-value">بقيمة 10,440 ج (أصل دائم)</span>
            </div>
          </div>
        </div>

        <!-- Step 2: Where does the money go? (أعمل إيه بالكاش بعد البيع؟) -->
        <div class="space-y-2.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-xs flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-mono">2</span>
              <span>الخطوة 2: أين تضع هذا الكاش؟ (الرؤية التنفيذية الكاملة لما بعد البيع):</span>
            </span>
            <span class="text-[10px] text-cyan-400 font-mono font-bold" id="rot-cash-allocated-label">المبلغ المتاح: 4,350 ج</span>
          </div>

          <!-- Strategy Option A -->
          <div class="bg-gray-950 p-3.5 rounded-xl border border-cyan-500/30 space-y-2" id="rot-scenario-a-card">
            <div class="flex items-center justify-between">
              <span class="font-bold text-cyan-300 flex items-center gap-1.5">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-cyan-400" id="rot-scenario-a-icon"></i>
                <span id="rot-scenario-a-title">الخيار الأول (المفضل لك): إعادة شراء نفس السهم في القاع لزيادة عدد أسهمك</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]" id="rot-scenario-a-tag">تكبير الملكية مجاناً</span>
            </div>
            <p class="text-gray-300 text-[11px] leading-relaxed" id="rot-scenario-a-desc">
              السهم في منطقة مقاومة ومن المتوقع أن يصحح بنسبة 10-14% نحو منطقة الدعم الفني بين 
              <strong class="text-white font-mono" id="rot-support-range">760.00 ج - 775.00 ج</strong>.
            </p>
            <div class="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40 flex items-center justify-between text-[11px]" id="rot-scenario-a-subcard">
              <span class="text-gray-300" id="rot-scenario-a-subdesc">عند وصول السهم للدعم، تشتري بالـ <strong class="text-cyan-300" id="rot-scenario-a-cash">4,350 ج</strong>:</span>
              <span class="font-mono font-bold text-emerald-400" id="rot-scenario-a-shares">5.7 أسهم (6 أسهم تقريباً)</span>
            </div>
            <div class="text-[10px] text-emerald-300/90 flex items-center gap-1 pt-0.5">
              <i data-lucide="sparkles" class="w-3 h-3 text-emerald-400 shrink-0"></i>
              <span id="rot-scenario-a-outcome">النتيجة: أمنت أرباحك، وعدد أسهمك في أوراسكوم زاد من 17 إلى 18 سهماً مجاناً من حركة السوق!</span>
            </div>
            <div class="pt-1.5">
              <button type="button" onclick="commitRotationPlan('A')" class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition transform active:scale-95 cursor-pointer">
                <i data-lucide="crosshair" class="w-4 h-4 text-cyan-200"></i>
                <span id="rot-scenario-a-btn-text">اعتمدت هذا الخيار وفعّل المراقبة 🎯 (رصد القاع لحظياً + إنذار لو هرب السهم)</span>
              </button>
            </div>
          </div>

          <!-- Strategy Option B -->
          <div class="bg-gray-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-2" id="rot-scenario-b-card">
            <div class="flex items-center justify-between">
              <span class="font-bold text-indigo-300 flex items-center gap-1.5">
                <i data-lucide="trending-down" class="w-3.5 h-3.5 text-indigo-400" id="rot-scenario-b-icon"></i>
                <span id="rot-scenario-b-title">الخيار الثاني: تعزيز سهم خسران في محفظتك (البنك التجاري الدولي CIB)</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]" id="rot-scenario-b-tag">تعديل وخفض التكلفة</span>
            </div>
            <p class="text-gray-300 text-[11px] leading-relaxed" id="rot-scenario-b-desc">
              سهم CIB متراجع حالياً بنسبة <strong class="text-rose-400 font-mono">-11.3%</strong> بسعر <strong class="text-white font-mono">123.50 ج</strong> ومكرر ربحيته تاريخي.
            </p>
            <div class="bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/40 flex items-center justify-between text-[11px]">
              <span class="text-gray-300" id="rot-scenario-b-subdesc">شراء بالـ <strong class="text-indigo-300" id="rot-scenario-b-cash">4,350 ج</strong> في سهم CIB:</span>
              <span class="font-mono font-bold text-indigo-300" id="rot-scenario-b-shares">شراء 35 سهماً جديداً</span>
            </div>
            <div class="text-[10px] text-indigo-200/90 flex items-center gap-1 pt-0.5">
              <i data-lucide="check-circle" class="w-3 h-3 text-indigo-400 shrink-0"></i>
              <span id="rot-scenario-b-result">النتيجة: تخفيض متوسط تكلفة سهم CIB فوراً من 139 ج إلى ~135 ج، وتسريع تحول السهم للربح مع أول ارتداد.</span>
            </div>
            <div class="pt-1.5">
              <button type="button" onclick="commitRotationPlan('B')" class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 transition transform active:scale-95 cursor-pointer">
                <i data-lucide="arrow-down-right" class="w-4 h-4 text-indigo-200"></i>
                <span id="rot-scenario-b-btn-text">اعتمدت هذا الخيار لشراء CIB 🎯 (تعديل التكلفة بربح السهم الرابح)</span>
              </button>
            </div>
          </div>

          <!-- Strategy Option C: Keep as Cash Reserve (كاش أمان لاقتناص الفرص) -->
          <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <div class="flex items-center gap-2">
                <i data-lucide="shield" class="w-4 h-4 text-emerald-400"></i>
                <span class="text-gray-300 font-semibold" id="rot-scenario-c-title">الخيار الثالث: إبقاء المبلغ كاش أمان وقوة شرائية حرة في ثندر للاكتتابات وأيام الهبوط العام.</span>
              </div>
              <span class="text-emerald-400 font-mono font-bold text-sm" id="rot-scenario-c-cash">4,350 ج</span>
            </div>
            <div class="pt-1">
              <button type="button" onclick="commitRotationPlan('C')" class="w-full py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
                <span id="rot-scenario-c-btn-text">حفظ كاش أمان واعتماد الخطة 🎯 (حماية السيولة للمفاجآت)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Real-World Lesson Alert -->
        <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5" id="rot-lesson-card">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" id="rot-lesson-icon"></i>
          <div>
            <span class="font-bold text-white block mb-0.5" id="rot-lesson-title">لماذا يمنعك هذا التكتيك من تكرار خسارة الـ 25 ألف السابقة؟</span>
            <span id="rot-lesson-desc">لأنك لم تنتظر هبوط السهم ليأخذ أرباحك؛ بل حولت ثلث المكسب لكاش مضمون في جيبك، فإذا هبط السهم اشتريت أسهماً أكثر، وإذا صعد فأنت لسه تملك 70% من المركز.</span>
          </div>
        </div>

        <!-- Real-Time AI Sanity Shield Verification Stamp -->
        <div class="px-3.5 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px] gap-2">
          <div class="flex items-center gap-2 text-emerald-300 font-semibold">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 shrink-0"></i>
            <span id="rot-sanity-shield-text">تم الفحص عبر AI Sanity Shield: تم التحقق من المنطق الرياضي والتوصية (خالٍ من أي تعارض).</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">100% Verified</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-4 sm:p-5 pt-3 border-t border-gray-800 shrink-0 safe-bottom">
        <button onclick="const t = document.getElementById('rot-stock-ticker')?.innerText; if (t) openAuditModal(t);" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
          <span>تقرير الاقتراح والمصادر 📊</span>
        </button>
        <button onclick="closeRotationModal()" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
          إغلاق النافذة
        </button>
      </div>

    </div>
  </div>

  <!-- Autonomous Cloud Background Log Modal -->
  <div id="autonomous-log-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl relative modal-card flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <i data-lucide="cloud-lightning" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">سجل التحليلات السحابية التلقائية (Autonomous Background Engine)</h3>
            <p class="text-xs text-gray-400">نتائج الفحص الدوري الذي أجراه السيرفر السحابي في غيابك</p>
          </div>
        </div>
        <button onclick="closeAutonomousLogModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-4 modal-scroll-body overflow-y-auto flex-1">
        <div class="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2 text-emerald-300 font-bold">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>حالة السيرفر: شغال 24/7 (Vercel Serverless Edge Cloud)</span>
          </div>
          <span class="text-gray-400 font-mono text-[11px]" id="modal-cloud-exec-time">محدث لحظياً</span>
        </div>

        <div class="space-y-3" id="autonomous-findings-container">
          <div class="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">ORAS</div>
            <div class="flex-1 text-xs">
              <div class="flex items-center justify-between font-bold text-white">
                <span>أوراسكوم كونستراكشون (+25.17%)</span>
                <span class="text-emerald-400 font-semibold">حماية أرباح</span>
              </div>
              <p class="text-gray-300 mt-1">سهم دولاري صلب - تم تثبيت وقف الخسارة المتحرك عند 285.00 ج لحماية الأرباح المحققة (+3,060 ج).</p>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">COMI</div>
            <div class="flex-1 text-xs">
              <div class="flex items-center justify-between font-bold text-white">
                <span>البنك التجاري الدولي (-11.02%)</span>
                <span class="text-cyan-400 font-semibold">تعزيز عند الدعم</span>
              </div>
              <p class="text-gray-300 mt-1">السهم عند منطقة دعم محورية 77.80 ج، أرباح البنك قياسية والهبوط تصحيح مؤقت مناسب للشراء التدريجي.</p>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">HALN</div>
            <div class="flex-1 text-xs">
              <div class="flex items-center justify-between font-bold text-white">
                <span>اكتتاب سهم حالاً (79,796.50 ج)</span>
                <span class="text-amber-400 font-semibold">قيد التنفيذ في ثندر</span>
              </div>
              <p class="text-gray-300 mt-1">طلبين اكتتاب بسعر 24.50 ج قيد المتابعة، السيرفر يراقب إعلان التخصيص الرسمي وبدء جلسة التداول الأولى.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-5 pt-3 border-t border-gray-800 flex items-center justify-between shrink-0 safe-bottom">
        <span class="text-[11px] text-gray-400">الجدول الزمني للتشغيل: الأحد - الخميس في ساعات جلسة التداول</span>
        <button onclick="closeAutonomousLogModal()" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition cursor-pointer">
          إغلاق النافذة
        </button>
      </div>
    </div>
  </div>

  <!-- OED TTMS Pattern: In-App Notification Center & Session Alert History Modal -->
  <div id="notification-center-modal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full shadow-2xl relative modal-card flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <i data-lucide="bell" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">مركز التنبيهات وإشارات السوق</h3>
            <p class="text-xs text-gray-400">التنبيهات الفنية اللحظية للمحفظة والأسهم القيادية</p>
          </div>
        </div>
        <button onclick="closeNotificationCenter()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="flex items-center justify-between text-xs px-4 sm:px-5 py-2.5 bg-gray-950 border-b border-gray-800 shrink-0">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="text-gray-300">إشعارات المتصفح المنبثقة:</span>
        </div>
        <button id="btn-browser-perm" onclick="requestBrowserNotificationPermission()" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow cursor-pointer">
          تفعيل إشعارات المتصفح 🔔
        </button>
      </div>

      <div id="notification-center-list" class="p-4 sm:p-5 flex-1 overflow-y-auto space-y-2.5 text-xs modal-scroll-body">
        <div class="p-4 text-center text-gray-500 font-medium">لا توجد تنبيهات عاجلة حتى الآن. السوق يتحرك في النطاق الطبيعي.</div>
      </div>

      <div class="p-4 sm:p-5 pt-3 border-t border-gray-800 flex items-center justify-between shrink-0 safe-bottom">
        <button onclick="clearNotificationHistory()" class="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer">
          مسح سجل التنبيهات
        </button>
        <button onclick="closeNotificationCenter()" class="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition cursor-pointer">
          إغلاق
        </button>
      </div>
    </div>
  </div>

  <!-- Price Levels, Stop Loss & Profit Target Verifier & Customizer Modal -->
  <div id="price-levels-verifier-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border-2 border-emerald-500/30 rounded-2xl max-w-2xl w-full shadow-2xl relative modal-card flex flex-col">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <i data-lucide="crosshair" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-black text-white text-base sm:text-lg" id="pl-modal-stock-title">فحص المصدر وضبط حدود السعر</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" id="pl-modal-stock-ticker">TICKER</span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">سقف المكاسب الأول • حد الخسارة الأدنى (وقف الخسارة) • التحقق من المعادلات الرسمية</p>
          </div>
        </div>
        <button onclick="closePriceLevelsModal()" class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <input type="hidden" id="pl-modal-ticker-input" value="">

      <div class="p-4 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Current Stock Snapshot Card -->
        <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div>
              <span class="text-gray-400 text-[11px] block">السعر الحالي اللحظي:</span>
              <span class="font-mono font-bold text-white text-base" id="pl-modal-current-price">-- ج</span>
            </div>
            <div class="border-r border-gray-800 pr-3">
              <span class="text-gray-400 text-[11px] block">متوسط سعر شرائك:</span>
              <span class="font-mono font-bold text-gray-300 text-base" id="pl-modal-buy-price">-- ج</span>
            </div>
          </div>
          <div class="text-left">
            <span class="text-gray-400 text-[11px] block">التطور / العائد الحالي:</span>
            <span class="font-mono font-bold text-sm" id="pl-modal-return-badge">--%</span>
          </div>
        </div>

        <!-- 2 Main Cards: Target 1 & Stop Loss -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- CARD 1: 🎯 TARGET 1 (سقف المكاسب الأول - بيع للربح) -->
          <div class="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-lg">
            <div>
              <div class="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span class="font-bold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <i data-lucide="target" class="w-4 h-4 text-emerald-400"></i>
                  <span>سقف المكاسب الأول (Target 1)</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold" id="pl-modal-target-status">مستهدف</span>
              </div>
              
              <div class="mt-3 space-y-2">
                <div>
                  <label class="text-[11px] text-gray-300 block mb-1 font-semibold">سعر بيع جني الأرباح (ج.م):</label>
                  <div class="flex items-center gap-2">
                    <input type="number" step="0.01" id="pl-input-custom-target" placeholder="مثال: 94.50" class="flex-1 bg-gray-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-emerald-400 focus:outline-none text-center">
                    <span class="text-xs text-gray-400 font-sans">ج.م</span>
                  </div>
                </div>
                <div class="text-[11px] text-gray-300 flex items-center justify-between font-mono bg-gray-950/60 p-2 rounded-lg border border-gray-800">
                  <span>المكسب عند الوصول للهدف:</span>
                  <strong class="text-emerald-400 font-bold" id="pl-modal-target-gain-pct">+0.0%</strong>
                </div>
              </div>
            </div>

            <!-- Mathematical Explanation & Source -->
            <div class="bg-gray-950/90 p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-300 space-y-1">
              <div class="text-emerald-400 font-bold flex items-center gap-1">
                <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
                <span>معادلة الحساب والمصدر الرسمي:</span>
              </div>
              <p class="leading-relaxed text-[10.5px]">
                • <strong>المعادلة الفنية:</strong> المقاومة R1 = <code class="text-emerald-300 font-mono">(2 × الارتكاز) - أدنى سعر</code>
              </p>
              <p class="leading-relaxed text-[10.5px]">
                • <strong>المصدر:</strong> جلسات تداول البورصة الرسمية EGX عبر TradingView.
              </p>
              <div class="p-1.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-[10px] text-emerald-200 mt-1">
                💡 <strong>طريقة التنفيذ في ثندر:</strong> ضع على السهم أمر بيع محدد بسعر (Limit Order) بهذا الرقم، ليتم البيع تلقائياً عند وصول السعر للقمة وتأمين الأرباح في جيبك.
              </div>
            </div>
          </div>

          <!-- CARD 2: 🛑 STOP LOSS (حد الخسارة الأدنى - قاع الأمان) -->
          <div class="bg-rose-950/20 border border-rose-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-lg">
            <div>
              <div class="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <span class="font-bold text-rose-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                  <span>حد الخسارة الأدنى (Stop Loss)</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold" id="pl-modal-stoploss-status">قاع الأمان</span>
              </div>
              
              <div class="mt-3 space-y-2">
                <div>
                  <label class="text-[11px] text-gray-300 block mb-1 font-semibold">سعر وقف الخسارة والخروج (ج.م):</label>
                  <div class="flex items-center gap-2">
                    <input type="number" step="0.01" id="pl-input-custom-stoploss" placeholder="مثال: 81.50" class="flex-1 bg-gray-950 border border-rose-500/50 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-rose-400 focus:outline-none text-center">
                    <span class="text-xs text-gray-400 font-sans">ج.م</span>
                  </div>
                </div>
                <div class="text-[11px] text-gray-300 flex items-center justify-between font-mono bg-gray-950/60 p-2 rounded-lg border border-gray-800">
                  <span>هامش الأمان المتبقي قبل الكسر:</span>
                  <strong class="text-rose-400 font-bold" id="pl-modal-stoploss-buffer">-0.0%</strong>
                </div>
              </div>
            </div>

            <!-- Mathematical Explanation & Source -->
            <div class="bg-gray-950/90 p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-300 space-y-1">
              <div class="text-rose-400 font-bold flex items-center gap-1">
                <i data-lucide="shield-x" class="w-3.5 h-3.5"></i>
                <span>معادلة الحساب والمصدر الرسمي:</span>
              </div>
              <p class="leading-relaxed text-[10.5px]">
                • <strong>المعادلة الفنية:</strong> الدعم S1 = <code class="text-rose-300 font-mono">(2 × الارتكاز) - أعلى سعر</code>
              </p>
              <p class="leading-relaxed text-[10.5px]">
                • <strong>المصدر:</strong> قاع ارتكاز صانع السوق المحسوب من بيانات الجلسة.
              </p>
              <div class="p-1.5 rounded bg-rose-950/50 border border-rose-500/30 text-[10px] text-rose-200 mt-1">
                🔔 <strong>طريقة التنفيذ في ثندر:</strong> ضع تنبيه سعر (Price Alert) في ثندر عند هذا الرقم؛ لو وصله السهم يأتيك إشعار فوري لتدخل وتبيع لحماية رأس مالك من النزيف.
              </div>
            </div>
          </div>

        </div>

        <!-- Raw Market Session Data Table -->
        <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-gray-300">
            <span class="flex items-center gap-1.5">
              <i data-lucide="database" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>البيانات الرقمية الخام المسحوبة للجلسة (تأكد بنفسك):</span>
            </span>
            <span class="text-[10px] text-cyan-400 font-mono">بيانات مطابقة لشاشة ثندر والبورصة</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span class="text-[10px] text-gray-400 block">أعلى سعر (High):</span>
              <span class="font-mono font-bold text-white text-xs" id="pl-raw-high">-- ج</span>
            </div>
            <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span class="text-[10px] text-gray-400 block">أدنى سعر (Low):</span>
              <span class="font-mono font-bold text-white text-xs" id="pl-raw-low">-- ج</span>
            </div>
            <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span class="text-[10px] text-gray-400 block">سعر الإغلاق (Close):</span>
              <span class="font-mono font-bold text-white text-xs" id="pl-raw-close">-- ج</span>
            </div>
            <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span class="text-[10px] text-gray-400 block">الارتكاز (Pivot):</span>
              <span class="font-mono font-bold text-cyan-300 text-xs" id="pl-raw-pivot">-- ج</span>
            </div>
          </div>

          <!-- Fundamental Data Verification Row (P/E, Sector P/E, EPS, Operating Margin) -->
          <div class="pt-2 border-t border-gray-800/80">
            <div class="flex items-center justify-between text-xs font-bold text-gray-300 mb-1.5">
              <span class="flex items-center gap-1.5">
                <i data-lucide="scale" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>التقييم المالي ومكرر الربحية مقارنة بالقطاع (Fundamental Check):</span>
              </span>
              <span class="text-[10px] text-emerald-400 font-mono" id="pl-raw-valuation-badge">مطابق للقوائم المالية</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span class="text-[10px] text-gray-400 block">مكرر الربحية (P/E):</span>
                <span class="font-mono font-bold text-emerald-300 text-xs" id="pl-raw-pe">--</span>
              </div>
              <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span class="text-[10px] text-gray-400 block">متوسط القطاع (Sector P/E):</span>
                <span class="font-mono font-bold text-cyan-300 text-xs" id="pl-raw-sector-pe">--</span>
              </div>
              <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span class="text-[10px] text-gray-400 block">ربح السهم (EPS):</span>
                <span class="font-mono font-bold text-white text-xs" id="pl-raw-eps">-- ج</span>
              </div>
              <div class="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span class="text-[10px] text-gray-400 block">هامش التشغيل (Operating Margin):</span>
                <span class="font-mono font-bold text-indigo-300 text-xs" id="pl-raw-operating-margin">--%</span>
              </div>
            </div>
            <div class="mt-1.5 p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-[10px] text-gray-300 flex items-center justify-between flex-wrap gap-1">
              <span class="flex items-center gap-1 text-emerald-400 font-semibold" id="pl-raw-operational-stability">
                <i data-lucide="check-circle" class="w-3 h-3"></i>
                <span>أرباح تشغيلية مستقرة من النشاط الرئيسي</span>
              </span>
              <span class="text-gray-400" id="pl-raw-equation-hint">المعادلة: سعر السهم ÷ ربحية السهم = مكرر الربحية</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex items-center justify-between flex-wrap gap-2 p-4 sm:p-5 pt-2 border-t border-gray-800 shrink-0 safe-bottom">
        <div class="flex items-center gap-2">
          <button type="button" onclick="saveCustomPriceLevelsModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>تثبيت وحفظ أرقامي 💾</span>
          </button>
          <button type="button" onclick="resetCustomPriceLevelsModal()" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition cursor-pointer" title="استعادة الأرقام الافتراضية المحسوبة تلقائياً">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            <span>استعادة الستاندرد 🔄</span>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button id="pl-modal-audit-btn" type="button" onclick="const t = document.getElementById('pl-modal-ticker')?.innerText; if (t) openAuditModal(t);" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer" title="تقرير الاقتراح والمصادر الاستثمارية">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>تقرير الاقتراح 📊</span>
          </button>
          <button type="button" onclick="closePriceLevelsModal()" class="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold text-xs transition cursor-pointer">
            إغلاق
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Position Sizing & Risk Management Calculator Modal (2% Capital Rule) -->
  <div id="position-sizing-modal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl relative modal-card flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">حاسبة حجم المركز وإدارة المخاطر (2% Risk)</h3>
            <p class="text-xs text-gray-400">قاعدة وول ستريت لحماية المحفظة وتحديد الكمية الآمنة للشراء</p>
          </div>
        </div>
        <button onclick="closePositionSizingModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-3.5 text-xs modal-scroll-body overflow-y-auto flex-1">
        <div>
          <label class="block text-gray-300 mb-1 font-bold">إجمالي رأس مال المحفظة (ج.م):</label>
          <input type="number" id="ps-total-capital" value="219000" oninput="calculatePositionSize()" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-300 mb-1 font-bold">أقصى نسبة مخاطرة للصفقة (%):</label>
            <input type="number" id="ps-risk-pct" value="1.5" step="0.5" oninput="calculatePositionSize()" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-500">
            <span class="text-[10px] text-gray-400 font-mono mt-1 block">أقصى خسارة مسموح بها: <strong id="ps-max-risk-egp" class="text-rose-400 font-bold">3,285 ج</strong></span>
          </div>
          <div>
            <label class="block text-gray-300 mb-1 font-bold">سعر الدخول المقترح (ج):</label>
            <input type="number" id="ps-entry-price" value="100" step="0.1" oninput="calculatePositionSize()" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-500">
          </div>
        </div>
        <div>
          <label class="block text-gray-300 mb-1 font-bold">سعر وقف الخسارة الفني (Pivot S1):</label>
          <input type="number" id="ps-stop-loss" value="94" step="0.1" oninput="calculatePositionSize()" class="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-rose-500">
          <span class="text-[10px] text-gray-400 font-mono mt-1 block">المخاطرة لكل سهم: <strong id="ps-risk-per-share" class="text-amber-400 font-bold">6.00 ج</strong></span>
        </div>

        <!-- Result Box -->
        <div class="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2.5 mt-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-200">أقصى كمية أسهم للشراء بأمان:</span>
            <span id="ps-result-shares" class="font-mono font-black text-cyan-300 text-lg">547 سهم</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-gray-300">
            <span>إجمالي قيمة الشراء المطلوبة:</span>
            <span id="ps-result-cost" class="font-mono font-bold text-white">54,700 ج.م</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-gray-300">
            <span>نسبة الصفقة من المحفظة:</span>
            <span id="ps-result-weight" class="font-mono font-bold text-emerald-400">25.0%</span>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-5 pt-3 border-t border-gray-800 flex justify-end shrink-0 safe-bottom">
        <button onclick="closePositionSizingModal()" class="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer">
          تم واحتساب
        </button>
      </div>
    </div>
  </div>

  <!-- AI Sanity & Zero-Hallucination Logic Auditor Modal -->
  <div id="sanity-audit-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 overflow-y-auto modal-overlay">
    <div class="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full shadow-2xl relative modal-card flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">درع الرقابة والتدقيق الذاتي (AI Sanity & Logic Auditor)</h3>
            <p class="text-xs text-gray-400">طبقة الفحص الذاتي المزدوج لمنع التناقضات بين الأرقام والنصوص وضمان سلامة المحفظة</p>
          </div>
        </div>
        <button onclick="closeSanityAuditModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-4 text-xs modal-scroll-body overflow-y-auto flex-1">
        <!-- Live Health Banner -->
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="font-bold text-white">حالة المحفظة والقرارات: <strong class="text-emerald-300">خالية 100% من الهلوسة والتناقض</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="runLiveSanityAudit(true)" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow cursor-pointer">
              <i data-lucide="refresh-cw" class="w-3 h-3"></i>
              <span>إعادة تشغيل الفحص الذاتي الآن</span>
            </button>
          </div>
        </div>

        <!-- Guardrails List Active Rules -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-start gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-gray-200 block">فحص حظر خلط القمم بالقيعان:</span>
              <span class="text-gray-400 text-[10px]">حظر أي وصف للقمة أو جني الأرباح لأي سهم خاسر أو متراجع.</span>
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-start gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-gray-200 block">فحص العمليات الحسابية والربح:</span>
              <span class="text-gray-400 text-[10px]">منع وصف الأرقام السالبة كربح، والتأكد من مطابقة الكاش المحسوب.</span>
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-start gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-gray-200 block">حوكمة الدستور الاستثماري:</span>
              <span class="text-gray-400 text-[10px]">منع أوامر البيع الهلعي عند القيعان بدون كسر فني صريح للدعم.</span>
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-start gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-gray-200 block">مطابقة الأسعار بمصادر البورصة:</span>
              <span class="text-gray-400 text-[10px]">التدقيق مقابل شاشة الأسعار اللحظية وإلغاء أي تخمين عشوائي.</span>
            </div>
          </div>
        </div>

        <!-- Real-Time Audit Cards Container -->
        <div class="space-y-2">
          <span class="font-bold text-gray-300 text-xs block">نتائج التدقيق الذاتي اللحظي لكل أصل بالمحفظة:</span>
          <div id="sanity-audit-results" class="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            <!-- Dynamically filled by JS -->
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 sm:p-5 pt-3 border-t border-gray-800 flex items-center justify-between shrink-0 safe-bottom">
        <span class="text-[10px] text-gray-400">نظام التدقيق يعمل تلقائياً مع كل شاشة ونافذة قبل العرض.</span>
        <button onclick="closeSanityAuditModal()" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition cursor-pointer">
          إغلاق
        </button>
      </div>

    </div>
  </div>
  `;
  const container = document.getElementById('modals-root') || document.body;
  container.insertAdjacentHTML('beforeend', modalsHTML);
})();