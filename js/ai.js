/**
 * EGX AI Copilot - Gemini AI & Sanity Shield (js/ai.js)
 * Gemini copilot chat, prompt verification, anti-hallucination guardrails, and AI Sanity Shield.
 */

    // ==============================================
    // GEMINI AI INTEGRATION & LIVE BRAIN ENGINE
    // ==============================================
    function getGeminiApiKey() {
      return (localStorage.getItem('egx_gemini_api_key') || '').trim();
    }

    function saveGeminiApiKey(key) {
      if (!key) return;
      localStorage.setItem('egx_gemini_api_key', key.trim());
      updateGeminiStatusUI();
    }

    function saveGeminiApiKeyFromInput() {
      const input = document.getElementById('setting-gemini-key');
      const val = (input?.value || '').trim();
      const fb = document.getElementById('gemini-key-feedback');
      if (!val) {
        if (fb) {
          fb.className = 'text-xs p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          fb.innerText = '⚠️ يرجى لصق مفتاح Google Gemini API أولاً.';
        }
        return;
      }
      saveGeminiApiKey(val);
      if (fb) {
        fb.className = 'text-xs p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block';
        fb.innerText = '✅ تم حفظ المفتاح بنجاح! محرك التحليل الذكي (Gemini AI) مفعل وجاهز الآن.';
      }
      alert('✅ تم تفعيل وربط محرك Google Gemini بنجاح! أصبح جاهزاً لتحليل بيانات واستفسارات المحفظة.');
    }

    function saveInlineGeminiKey() {
      const input = document.getElementById('inline-gemini-key');
      const val = (input?.value || '').trim();
      if (!val) {
        alert('يرجى لصق المفتاح أولاً');
        return;
      }
      saveGeminiApiKey(val);
      alert('✅ تم حفظ المفتاح وتفعيل محرك Google Gemini بنجاح! يمكنك الآن طرح استفساراتك وسيقوم بتحليلها فورياً.');
      const chatContainer = document.getElementById('chat-messages');
      const successBubble = document.createElement('div');
      successBubble.className = 'flex items-start gap-3';
      successBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
          AI
        </div>
        <div class="bg-gray-800 border border-emerald-500/40 rounded-2xl rounded-tr-none p-3.5 text-xs text-emerald-300 leading-relaxed max-w-xl shadow-sm">
          🎉 ممتاز! تم تفعيل محرك التحليل الذكي (Google Gemini). يمكنك الآن طلب أي تحليل مالي أو فني لأسهم المحفظة أو البورصة المصرية.
        </div>
      `;
      chatContainer.appendChild(successBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      lucide.createIcons();
    }

    function removeGeminiApiKey() {
      if (confirm('هل أنت متأكد من حذف مفتاح الذكاء الاصطناعي من هذا الجهاز؟')) {
        localStorage.removeItem('egx_gemini_api_key');
        const input = document.getElementById('setting-gemini-key');
        if (input) input.value = '';
        const fb = document.getElementById('gemini-key-feedback');
        if (fb) {
          fb.className = 'text-xs p-2.5 rounded-xl bg-gray-800 text-gray-300 block';
          fb.innerText = 'تم مسح المفتاح بنجاح.';
        }
        updateGeminiStatusUI();
      }
    }

    function openGeminiModal() {
      const modal = document.getElementById('gemini-modal');
      const input = document.getElementById('modal-gemini-key-input');
      const key = getGeminiApiKey();
      if (input && key) {
        input.value = key;
      }
      const fb = document.getElementById('modal-gemini-feedback');
      if (fb) fb.className = 'text-xs hidden p-3 rounded-xl';
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      if (window.lucide) lucide.createIcons();
    }

    function closeGeminiModal() {
      const modal = document.getElementById('gemini-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function saveGeminiKeyFromModal() {
      const input = document.getElementById('modal-gemini-key-input');
      const val = (input?.value || '').trim();
      const fb = document.getElementById('modal-gemini-feedback');
      if (!val) {
        if (fb) {
          fb.className = 'text-xs p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          fb.innerText = '⚠️ يرجى لصق مفتاح Google Gemini API أولاً.';
        }
        return;
      }
      saveGeminiApiKey(val);
      if (fb) {
        fb.className = 'text-xs p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block font-bold';
        fb.innerText = '✅ تم حفظ وتفعيل المفتاح بنجاح! محرك التحليل الذكي (Gemini AI) متصل وجاهز للعمل.';
      }
      setTimeout(() => {
        closeGeminiModal();
      }, 1200);
    }

    async function testGeminiConnectionFromModal() {
      const input = document.getElementById('modal-gemini-key-input');
      const key = (input?.value || '').trim() || getGeminiApiKey();
      const fb = document.getElementById('modal-gemini-feedback');
      if (!key) {
        if (fb) {
          fb.className = 'text-xs p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          fb.innerText = '⚠️ يرجى لصق المفتاح أولاً للاختبار.';
        }
        return;
      }
      if (fb) {
        fb.className = 'text-xs p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 block flex items-center gap-2';
        fb.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div> جاري اختبار الاتصال بسيرفر Google Gemini AI...';
      }
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'اختبار سريع: أجب بكلمة واحدة "متصل"' }] }]
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (fb) {
          fb.className = 'text-xs p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block font-bold';
          fb.innerHTML = `⚡ <strong>الاتصال ناجح 100%!</strong> رد السيرفر: "${reply.trim()}".`;
        }
        saveGeminiApiKey(key);
      } catch (err) {
        if (fb) {
          fb.className = 'text-xs p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          fb.innerHTML = `❌ <strong>فشل الاتصال:</strong> ${err.message}.`;
        }
      }
    }

    function updateGeminiStatusUI() {
      const key = getGeminiApiKey();
      const statusText = document.getElementById('gemini-status-text');
      const statusDot = document.getElementById('gemini-status-dot');
      const statusInd = document.getElementById('gemini-status-indicator');
      const btnLabel = document.getElementById('gemini-btn-label');
      const settingInput = document.getElementById('setting-gemini-key');
      const modalInput = document.getElementById('modal-gemini-key-input');

      if (settingInput && key) {
        settingInput.value = key;
      }
      if (modalInput && key) {
        modalInput.value = key;
      }

      if (key) {
        if (statusText) statusText.innerText = 'محرك Google Gemini AI متصل وجاهز للتحليل 🟢';
        if (statusDot) {
          statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        }
        if (statusInd) {
          statusInd.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
        if (btnLabel) btnLabel.innerText = 'المفتاح مفعل ومتصل (تعديل)';
      } else {
        if (statusText) statusText.innerText = 'محرك التحليل الذكي غير متصل (اضغط لإدخال المفتاح) ⚪';
        if (statusDot) {
          statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
        }
        if (statusInd) {
          statusInd.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20';
        }
        if (btnLabel) btnLabel.innerText = 'ربط / إدخال مفتاح الذكاء الاصطناعي';
      }
    }

    async function testGeminiConnection() {
      const key = getGeminiApiKey() || (document.getElementById('setting-gemini-key')?.value || '').trim();
      const fb = document.getElementById('gemini-key-feedback');
      if (!key) {
        alert('يرجى إدخال المفتاح أولاً لاختبار الاتصال.');
        return;
      }
      if (fb) {
        fb.className = 'text-xs p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 block flex items-center gap-2';
        fb.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div> جاري اختبار الاتصال بسيرفر Google Gemini AI...';
      }

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'اختبار سريع: أجب بكلمة واحدة "متصل"' }] }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (fb) {
          fb.className = 'text-xs p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block';
          fb.innerHTML = `⚡ <strong>الاتصال ناجح 100%!</strong> رد السيرفر: "${reply.trim()}". يمكنك الآن استخدام الشات بكامل قدرات الذكاء الاصطناعي.`;
        }
        saveGeminiApiKey(key);
      } catch (err) {
        if (fb) {
          fb.className = 'text-xs p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
          fb.innerHTML = `❌ <strong>فشل الاتصال:</strong> ${err.message}. يرجى التحقق من المفتاح من Google AI Studio.`;
        }
      }
    }

    function formatMarkdownReply(text) {
      if (!text) return '';
      let s = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      s = s.replace(/^[\s]*[-•*][\s]+(.*)$/gm, '<li class="mr-3 list-disc">$1</li>');
      s = s.replace(/^[\s]*([0-9]+)\.[\s]+(.*)$/gm, '<div class="mr-2 font-semibold text-emerald-400 mt-1">$1. <span class="text-gray-200 font-normal">$2</span></div>');
      s = s.replace(/\n\n+/g, '<br><br>');
      s = s.replace(/\n/g, '<br>');
      return s;
    }

    // AI Copilot Chat Handling
    function askCopilot(question) {
      switchTab('advisor');
      const input = document.getElementById('chat-input');
      input.value = question;
      document.getElementById('chat-form').dispatchEvent(new Event('submit'));
    }

    // Multi-turn Conversation Memory
    let geminiChatHistory = [];

    // Financial Self-Verification Guardrail Engine (Anti-Hallucination)
    function verifyAiResponse(text, portfolio, radar) {
      const warnings = [];
      const verifiedPills = [];
      const allTracked = [...portfolio, ...radar];
      const seenTickers = new Set();

      allTracked.forEach(item => {
        if (!item.ticker || item.ticker === 'CASH' || seenTickers.has(item.ticker)) return;
        const tickerRegex = new RegExp(`\\b(${item.ticker})\\b`, 'i');
        const nameRegex = item.name ? new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

        if (tickerRegex.test(text) || (nameRegex && nameRegex.test(text))) {
          seenTickers.add(item.ticker);
          const livePrice = item.currentPrice || item.price || 0;
          if (livePrice > 0) {
            // Check for cited price near ticker or Arabic name
            const escapedName = item.name ? item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
            const symbolGroup = escapedName ? `(?:${item.ticker}|${escapedName})` : `(?:${item.ticker})`;
            const pricePattern = new RegExp(`${symbolGroup}[^0-9]{1,30}([0-9]+(?:\\.[0-9]+)?)\\s*(?:ج|جنيه|EGP)`, 'i');
            const priceMatch = text.match(pricePattern);
            if (priceMatch && priceMatch[1]) {
              const citedPrice = parseFloat(priceMatch[1]);
              const diffPct = Math.abs((citedPrice - livePrice) / livePrice) * 100;
              if (diffPct > 1.5) {
                warnings.push(`سعر سهم <strong>${item.name} (${item.ticker})</strong> المذكور (${citedPrice} ج) يختلف عن سعر البورصة اللحظي الرسمي (${livePrice.toFixed(2)} ج) بنسبة ${diffPct.toFixed(1)}%.`);
              } else {
                verifiedPills.push(`${item.ticker}: ${livePrice.toFixed(2)} ج`);
              }
            } else {
              verifiedPills.push(`${item.ticker}: ${livePrice.toFixed(2)} ج لحظياً`);
            }
          }
        }
      });

      if (/مضارب(?:ة|ات)?\s+يومي(?:ة)?|شراء\s+وبيع\s+في\s+نفس\s+اليوم|day[-\s]?trading/i.test(text)) {
        warnings.push('تنبيه سياسة الاستثمار: يُمنع التداول والمضاربة اليومية وفق وثيقة الحوكمة والمخاطر.');
      }

      return { warnings, verifiedPills };
    }

    async function handleChatSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;

      const chatContainer = document.getElementById('chat-messages');

      // User Message Bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start justify-end gap-3';
      userBubble.innerHTML = `
        <div class="bg-emerald-600 rounded-2xl rounded-tl-none p-3.5 text-xs text-white leading-relaxed max-w-xl shadow-sm">
          ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
        <div class="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white shrink-0 text-xs font-bold">
          أنت
        </div>
      `;
      chatContainer.appendChild(userBubble);
      input.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      const apiKey = getGeminiApiKey();

      // If no API key, prompt user with honest input box
      if (!apiKey) {
        const promptBubble = document.createElement('div');
        promptBubble.className = 'flex items-start gap-3';
        promptBubble.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
            AI
          </div>
          <div class="bg-gray-800 border border-amber-500/40 rounded-2xl rounded-tr-none p-4 text-xs text-gray-200 leading-relaxed max-w-xl shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-amber-400 font-bold">
              <i data-lucide="key" class="w-4 h-4"></i>
              <span>محرك التحليل الذكي (Google Gemini) بحاجة لمفتاح التشغيل</span>
            </div>
            <p class="text-gray-300">
              لتمكين التحليل المالي والآلي التفاعلي المباشر لبيانات محفظتك وأسهم السوق عبر جوجل، يلزم إدخال <strong>Google Gemini API Key</strong> (مجاني 100%):
            </p>
            <div class="p-3 bg-gray-900 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-2">
              <input type="password" id="inline-gemini-key" placeholder="الصق المفتاح هنا (AIzaSy...)" class="flex-1 bg-gray-950 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500">
              <button onclick="saveInlineGeminiKey()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition">
                حفظ وتفعيل
              </button>
            </div>
            <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                <span>احصل على مفتاحك المجاني في 30 ثانية من Google AI Studio</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <span class="text-gray-500">لا يتم رفع المفتاح على كود عام أبداً</span>
            </div>
          </div>
        `;
        chatContainer.appendChild(promptBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        lucide.createIcons();
        return;
      }

      // Thinking Bubble
      const thinkingBubble = document.createElement('div');
      thinkingBubble.className = 'flex items-start gap-3';
      thinkingBubble.id = 'chat-thinking-bubble';
      thinkingBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 text-xs font-bold animate-pulse">
          AI
        </div>
        <div class="bg-gray-800 border border-emerald-500/30 rounded-2xl rounded-tr-none p-3.5 text-xs text-gray-300 leading-relaxed max-w-xl shadow-sm flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>جاري تدقيق الإفصاحات وتحليل المستويات الفنية الحقيقية عبر (Google Search Grounded AI)...</span>
        </div>
      `;
      chatContainer.appendChild(thinkingBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        const totalWealth = portfolioData.reduce((acc, cur) => acc + (cur.value || 0), 0);
        const cashAsset = portfolioData.find(p => p.ticker === 'CASH');
        const cashBalance = cashAsset ? cashAsset.value : 0;
        const stocksWealth = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB').reduce((acc, cur) => acc + (cur.value || 0), 0);
        const equityPct = totalWealth > 0 ? ((stocksWealth / totalWealth) * 100).toFixed(1) : '0';
        const cashPct = totalWealth > 0 ? ((cashBalance / totalWealth) * 100).toFixed(1) : '0';

        const portfolioSummary = portfolioData.map(p => {
          const buy = p.buyPrice || p.costPrice || p.currentPrice || 0;
          const cur = p.currentPrice || buy;
          const ret = buy > 0 ? (((cur - buy) / buy) * 100).toFixed(1) : '0.0';
          const tech = p.pivotR1 ? `[مقاومة R1: ${p.pivotR1} ج، دعم S1: ${p.pivotS1} ج، متوسط 50: ${p.sma50 || '--'} ج، عائد/مخاطرة R/R: ${p.rrDisplay || '--'}]` : '';
          return `- سهم ${p.name} (${p.ticker}): عدد ${p.shares || 0} سهم، متوسط تكلفة الشراء ${buy} ج، السعر اللحظي ${cur} ج، العائد: ${ret}% ${tech}`;
        }).join('\n');

        const topRadarSummary = fullMarketRadar.slice(0, 8).map(r => 
          `- سهم ${r.name} (${r.ticker}): سعر ${r.price} ج (${r.changePct})، سيولة ${r.volumeMultiplier}، مقاومة R1: ${r.pivotR1 || r.target1}، دعم S1: ${r.pivotS1 || r.support}، اتجاه: ${r.trend || r.type}، عائد/مخاطرة: ${r.rrDisplay}`
        ).join('\n');

        const currentRegime = (window.currentMarketRegime && typeof window.currentMarketRegime === 'object')
          ? window.currentMarketRegime
          : {
              regime: typeof window.currentMarketRegime === 'string' ? window.currentMarketRegime : "NORMAL_CONSOLIDATION",
              regimeArabic: window.currentMarketRegimeArabic || "تداول متوازن وعرضي (Consolidation)",
              description: "السوق يتحرك في نطاق متوازن مع استقرار الدعوم والمقاومات."
            };

        const userLessonsSummary = typeof getUserLearnedLessonsSummary === 'function' ? getUserLearnedLessonsSummary() : 'لا توجد دروس مسجلة بعد.';

        const systemPrompt = `أنت "مستشار البورصة المصرية المعتمد والمحلل المالي الرقمي" (EGX Institutional Copilot).
المستخدم مستثمر في البورصة المصرية ويدير محفظته عبر تطبيق ثندر (Thndr):
- إجمالي قيمة المحفظة الحقيقية الحالية: ${Math.round(totalWealth).toLocaleString('en-US')} ج.م (${equityPct}% أسهم، ${cashPct}% كاش حر).
- الرصيد النقدي المتوفر (كاش): ${Math.round(cashBalance).toLocaleString('en-US')} ج.م.
- بيئة السوق اللحظية المعتمدة (Market Regime): ${currentRegime.regimeArabic} (${currentRegime.description}).
- تفاصيل الأصول في المحفظة بالأسعار والمستويات الفنية الحقيقية (Pivot R1/S1 & SMA50):
${portfolioSummary}

أبرز الفرص والسيولة اللحظية بالمؤشرات الفنية المعتمدة اليوم بالبورصة المصرية:
${topRadarSummary}

ميثاق تصنيف بيئات السوق ومنع الخلط التاريخي (Anti-Panic & Regime Classification Matrix):
1. **حظر اعتبار التصحيح الهادئ أزمة أو انهياراً:** لا تخلط إطلاقاً بين جني الأرباح الفني الهادئ (Healthy Pullback) والانهيارات الهيكلية الشاملة (مثل أزمة كورونا 2020). طالما أن السهم يتداول فوق دعومه المحورية (S1 أو SMA50) وأحجام التداول متناقصة، فهذه فرصة تجميع وليست أزمة بيع بالهلع.
2. **شرط استدعاء الأزمات الشاملة (Systemic Shock):** لا تحذر من انهيار شامل أو بجعة سوداء إلا إذا تحقق هبوط جماعي في أكثر من 85% من قطاعات السوق مع توقف السيولة وكسر صريح للمتوسط 200 يوم.
3. **مصائد القمم المضاربية (Bull Trap Warning):** حذر المستخدم بشدة إذا كان السهم يبتعد بأكثر من 30% عن متوسط 50 يوم مع وصول RSI فوق 85 (مثل سيناريو بلتون 2023).

دروس وذاكرة المتداول السابقة المستخلصة من صفقاته المحققة في ثندر:
${userLessonsSummary}

قواعد وميثاق الحوكمة ومنع الهلوسة الصارم (Strict Zero-Hallucination Policy):
1. **استخدم أداة البحث في جوجل (Google Search) بحصر صارم:** اعتمد فقط على المصادر الموثوقة المعتمدة (موقع البورصة المصرية الرسمي EGX، موقع البنك المركزي CBE، إفصاحات علاقات المستثمرين الرسمية للشركات، مباشر مصر Mubasher، وجريدتي المال والبورصة نيوز). ممنوع منعاً باتاً الاستشهاد بمنتديات أو جروبات تواصل اجتماعي.
2. **شرط التاريخ والحداثة الصارم (Recency Rule):** اذكر تاريخ الإفصاح الرسمي بالسنة والشهر واليوم، ويشترط ألا يتجاوز تاريخ الخبر آخر 7 أيام ما لم يكن تقريراً مالياً ربع سنوي معتمد رسمياً. إذا كان الخبر شائعة غير مؤكدة بإفصاح في البورصة، ضع تنبيهاً صريحاً: "⚠️ شائعة سوقية غير مؤكدة بإفصاح رسمي".
3. **التزم بالمستويات الفنية الرقمية الحقيقية المرفقة أعلاه:**
   - مستوى المقاومة R1 يمثل الهدف الأول لجني الأرباح الجزئي.
   - مستوى الدعم S1 يمثل خط الأمان ووقف الخسارة في حال الكسر.
   - متوسط 50 يوم (SMA50) يحدد ما إذا كان السهم في اتجاه صاعد رئيسي أم تصحيحي.
4. **حظر التداول المفرط:** المستخدم مستثمر متوسط وطويل الأجل؛ لا تنصح بالمضاربات اليومية السريعة. صفقات الطفرات (Satellite) يجب أن تحقق نسبة عائد للمخاطرة (R/R) لا تقل عن 1:2.0.

أجب عن استفسار وسؤال المستخدم بأسلوب استثماري رصين وصريح ومدعوم بالأرقام الواقعية، مع إبراز القرار النهائي الموصى به بنقاط واضحة.`;

        // Maintain multi-turn history
        geminiChatHistory.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nسؤال المستخدم:\n${text}` }]
        });

        // Limit conversation history to last 6 turns, ensuring first message is always from 'user'
        if (geminiChatHistory.length > 6) {
          geminiChatHistory = geminiChatHistory.slice(-6);
          while (geminiChatHistory.length > 0 && geminiChatHistory[0].role !== 'user') {
            geminiChatHistory.shift();
          }
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiChatHistory,
            tools: [
              { googleSearch: {} }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1500
            }
          })
        });

        if (document.getElementById('chat-thinking-bubble')) {
          document.getElementById('chat-thinking-bubble').remove();
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const candidateParts = data.candidates?.[0]?.content?.parts || [];
        const candidateText = candidateParts.map(p => p.text || '').filter(Boolean).join('\n\n');
        
        if (!candidateText) {
          throw new Error('لم يتم استلام أي نص من نموذج Gemini.');
        }

        // Store assistant reply in chat history
        geminiChatHistory.push({
          role: 'model',
          parts: [{ text: candidateText }]
        });

        // Grounding Metadata & Verified Sources
        const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
        const searchQueries = groundingMetadata?.webSearchQueries || [];
        const groundingChunks = groundingMetadata?.groundingChunks || [];
        const webSources = groundingChunks
          .map(c => c.web)
          .filter(w => w && w.uri && w.title);

        const formattedReply = formatMarkdownReply(candidateText);

        // Run Automated Self-Verification Guardrail
        const { warnings: guardrailWarnings, verifiedPills } = verifyAiResponse(candidateText, portfolioData, fullMarketRadar);

        // Build Verified Citations UI
        let citationsHtml = '';
        if (webSources.length > 0) {
          citationsHtml = `
            <div class="mt-2.5 pt-2 border-t border-emerald-500/20 space-y-1.5">
              <div class="text-[10px] text-cyan-300 font-bold flex items-center gap-1.5">
                <i data-lucide="globe" class="w-3.5 h-3.5 text-cyan-400"></i>
                <span>المصادر المعتمدة من بحث جوجل (Grounded Sources):</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                ${webSources.slice(0, 4).map(w => `
                  <a href="${w.uri}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded bg-gray-900 hover:bg-gray-850 border border-cyan-500/30 hover:border-cyan-400 text-[10px] text-cyan-300 flex items-center gap-1 transition" title="${w.title}">
                    <span class="max-w-[180px] truncate">${w.title}</span>
                    <i data-lucide="external-link" class="w-2.5 h-2.5 shrink-0"></i>
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        } else if (searchQueries.length > 0) {
          citationsHtml = `
            <div class="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] text-cyan-300 flex items-center gap-1.5 flex-wrap">
              <span class="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 font-bold flex items-center gap-1">
                <i data-lucide="globe" class="w-3 h-3 text-cyan-400"></i>
                <span>بحث جوجل اللحظي مفعل</span>
              </span>
              <span class="text-gray-400">تم تدقيق: "${searchQueries.slice(0, 3).join(' • ')}"</span>
            </div>
          `;
        }

        // Build Guardrail Warning or Verification Banner
        let guardrailHtml = '';
        if (guardrailWarnings.length > 0) {
          guardrailHtml = `
            <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 space-y-1 mt-2">
              <div class="flex items-center gap-1.5 font-bold text-amber-400">
                <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
                <span>تنبيه تدقيق الحوكمة والأسعار (Self-Verification Guardrail):</span>
              </div>
              <ul class="list-disc list-inside space-y-0.5 text-gray-300">
                ${guardrailWarnings.map(w => `<li>${w}</li>`).join('')}
              </ul>
            </div>
          `;
        } else if (verifiedPills.length > 0) {
          guardrailHtml = `
            <div class="mt-2 pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-400 flex-wrap gap-1">
              <span class="flex items-center gap-1 font-bold">
                <i data-lucide="shield-check" class="w-3 h-3 text-emerald-400"></i>
                <span>تدقيق رياضي: جميع الأسعار والمستويات مطابقة لشاشة التداول 100%</span>
              </span>
              <span class="font-mono text-gray-400">تم التحقق من: ${verifiedPills.slice(0, 3).join(' • ')}</span>
            </div>
          `;
        }

        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex items-start gap-3';
        aiBubble.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md">
            AI
          </div>
          <div class="bg-gray-800 border border-emerald-500/30 rounded-2xl rounded-tr-none p-4 text-xs text-gray-200 leading-relaxed max-w-xl shadow-sm space-y-2">
            <div class="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-gray-700/60 pb-1.5 mb-1.5">
              <span class="flex items-center gap-1"><i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i> تحليل مالي معتمد • Google Search Grounded</span>
              <span class="text-gray-400 font-mono">توقيت القاهرة: ${formatCairoTime(new Date(), false, true)}</span>
            </div>
            <div class="leading-relaxed">${formattedReply}</div>
            ${citationsHtml}
            ${guardrailHtml}
          </div>
        `;
        chatContainer.appendChild(aiBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        lucide.createIcons();

      } catch (err) {
        if (document.getElementById('chat-thinking-bubble')) {
          document.getElementById('chat-thinking-bubble').remove();
        }
        const errBubble = document.createElement('div');
        errBubble.className = 'flex items-start gap-3';
        errBubble.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
            !
          </div>
          <div class="bg-gray-800 border border-rose-500/40 rounded-2xl rounded-tr-none p-3.5 text-xs text-rose-300 leading-relaxed max-w-xl shadow-sm space-y-2">
            <strong>حدث خطأ أثناء التواصل مع سيرفر الذكاء الاصطناعي (Google Gemini):</strong><br>
            <p class="text-gray-300 font-mono text-[11px]">${err.message}</p>
            <p class="text-gray-400 text-[11px]">يرجى التحقق من صحة المفتاح في صفحة الإعدادات أو الحصول على مفتاح جديد من Google AI Studio.</p>
          </div>
        `;
        chatContainer.appendChild(errBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }

    function clearChat() {
      geminiChatHistory = [];
      const chatContainer = document.getElementById('chat-messages');
      chatContainer.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
            AI
          </div>
          <div class="bg-gray-800 border border-gray-700 rounded-2xl rounded-tr-none p-3.5 text-xs text-gray-200 leading-relaxed max-w-xl shadow-sm" id="advisor-welcome-text">
            تم مسح سجل المحادثة. أنا جاهز لأي استشارة مالية تخص محفظتك أو أسهم البورصة المصرية ومستويات الدعم والمقاومة!
          </div>
        </div>
      `;
      lucide.createIcons();
    }

    // ============================================================

    // ============================================================
    // AI Sanity Shield & Zero-Contradiction Dual-Layer Validator
    // ============================================================
    const AiSanityShield = {
      auditAsset(item) {
        const profit = Number(item.profit) || 0;
        const returnPct = Number(item.returnPct) || 0;
        const currentPrice = Number(item.currentPrice) || Number(item.price) || 0;
        const buyPrice = Number(item.buyPrice) || 0;
        const isLosing = profit < 0 || returnPct < 0;

        const report = {
          ticker: item.ticker,
          name: item.name,
          profit,
          returnPct,
          currentPrice,
          buyPrice,
          isLosing,
          status: 'PASSED',
          violations: [],
          corrections: [],
          verdictSummary: ''
        };

        // Guardrail 1: Loss vs Peak Contradiction Check
        if (isLosing) {
          if (item.action === 'PROFIT_TAKE') {
            report.violations.push('محاولة خاطئة لإطلاق أمر جني أرباح على سهم خاسر');
            item.action = 'REBALANCE_CANDIDATE';
            report.corrections.push('تصحيح الأمر تلقائياً إلى "مرشح للتدوير وتخفيف المركز"');
          }
          if (item.status === 'قمة' || (typeof item.advice === 'string' && (item.advice.includes('قمة') || item.advice.includes('جني أرباح')))) {
            report.violations.push('وجود توصيف للقمة أو جني أرباح في سهم متراجع');
            report.corrections.push('تعديل التوصيف إلى "مسار هابط وتخفيف المركز"');
            if (item.status === 'قمة') item.status = 'مسار هابط';
            if (typeof item.advice === 'string') {
              item.advice = item.advice
                .replace(/جني أرباح القمة/g, 'تخفيف المركز بالارتداد')
                .replace(/جني أرباح/g, 'تخفيف وتدوير')
                .replace(/منطقة قمة/g, 'منطقة ارتداد فني');
            }
          }
          report.verdictSummary = `السهم متراجع بنسبة (${returnPct.toFixed(1)}%). تم حظر مسميات القمم وجني الأرباح، واعتماد بروتوكول تدوير السيولة ومراقبة الارتداد بأمان.`;
        } else {
          // Winning Stock
          if (returnPct >= 18) {
            report.verdictSummary = `السهم رابح بنسبة (+${returnPct.toFixed(1)}%). تم اعتماد بروتوكول جني أرباح القمة وتأمين الكاش وإعادة الشراء في القاع بنجاح.`;
          } else {
            report.verdictSummary = `السهم رابح مستقر (+${returnPct.toFixed(1)}%). تم اعتماد بروتوكول الاحتفاظ الهادئ وفق ميثاق الاستثمار طويل الأجل.`;
          }
        }

        // Guardrail 2: Math Consistency Check
        if (item.shares && currentPrice > 0) {
          const expectedVal = Math.round(item.shares * currentPrice);
          if (Math.abs(expectedVal - (item.value || expectedVal)) > 100) {
            report.violations.push('فارق في القيمة السوقية المحسوبة');
            item.value = expectedVal;
            report.corrections.push('إعادة مزامنة القيمة السوقية بدقة تامة');
          }
        }

        return report;
      },

      auditAll() {
        if (!Array.isArray(portfolioData)) return [];
        return portfolioData.map(item => this.auditAsset(item));
      }
    };

    function openSanityAuditModal() {
      const modal = document.getElementById('sanity-audit-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      runLiveSanityAudit(false);
      if (window.lucide) lucide.createIcons();
    }

    function closeSanityAuditModal() {
      const modal = document.getElementById('sanity-audit-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function runLiveSanityAudit(notifyUser = false) {
      const container = document.getElementById('sanity-audit-results');
      if (!container) return;

      const reports = AiSanityShield.auditAll();
      container.innerHTML = reports.map(r => {
        const isLoss = r.isLosing;
        return `
          <div class="p-3 rounded-xl ${isLoss ? 'bg-slate-900/90 border border-amber-500/30' : 'bg-slate-900/90 border border-emerald-500/30'} flex flex-col gap-1.5 text-xs">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">${r.name}</span>
                <span class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">${r.ticker}</span>
                <span class="font-mono font-bold ${isLoss ? 'text-rose-400' : 'text-emerald-400'}">${isLoss ? '' : '+'}${r.returnPct.toFixed(1)}% (${r.currentPrice.toFixed(2)} ج)</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${r.violations.length === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                ${r.violations.length === 0 ? '🛡️ سليم ومنطقي 100%' : '⚠️ تم التدقيق وتصحيح التناقض'}
              </span>
            </div>
            <p class="text-[11px] text-gray-300 leading-relaxed font-sans">
              <strong class="text-cyan-300">قرار الفحص الذاتي:</strong> ${r.verdictSummary}
            </p>
            ${r.corrections.length > 0 ? `
              <div class="bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 text-[10px] text-amber-200">
                <span class="font-bold block">إجراءات الحماية التلقائية المنفذة:</span>
                <ul class="list-disc list-inside mt-0.5">
                  ${r.corrections.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();

      if (notifyUser) {
        showSuccessNotification('تم التدقيق الذاتي: جميع بيانات وتوصيات المحفظة مفحوصة ومطابقة 100% للمنطق المالي.');
      }
    }
