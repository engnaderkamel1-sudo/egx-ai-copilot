/**
 * EGX AI Copilot - Smart Rotation & Capital Rebalance (js/rotation.js)
 * Profit taking around the core, capital rotations, watchdog monitoring, and rebalance allocation.
 */

    // ============================================================
    // Smart Rotation & Peak Profit Taking (Trading Around The Core)
    // ============================================================
    let currentRotationRatio = 0.33;

    function openRotationPlanModal(index) {
      const item = portfolioData[index];
      if (!item) return;

      document.getElementById('rot-asset-index').value = index;
      document.getElementById('rot-stock-name').innerText = item.name;
      document.getElementById('rot-stock-ticker').innerText = item.ticker;

      const currentPrice = Number(item.currentPrice) || 0;
      const buyPrice = Number(item.buyPrice) || 0;
      const totalShares = parseInt(item.shares, 10) || 1;
      const profit = Math.round(item.profit) || 0;
      const returnPct = Number(item.returnPct) || 0;
      const isLosing = profit < 0;

      // Update Modal Header according to profit/loss status
      const titleEl = document.getElementById('rot-modal-title');
      const subtitleEl = document.getElementById('rot-modal-subtitle');
      const iconWrap = document.getElementById('rot-modal-icon-wrap');
      const iconEl = document.getElementById('rot-modal-icon');

      if (isLosing) {
        if (titleEl) titleEl.innerText = `خطة تدوير وتخفيف السهم المتراجع: ${item.name} (${item.ticker})`;
        if (subtitleEl) subtitleEl.innerText = 'تكتيك إعادة التوازن (Rebalancing) لتحرير السيولة المجمدة والتعويض في أسهم أقوى';
        if (iconWrap) iconWrap.className = 'w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400';
        if (iconEl) iconEl.setAttribute('data-lucide', 'refresh-cw');
      } else {
        if (titleEl) titleEl.innerText = `خطة جني أرباح القمة وإعادة الشراء في القاع: ${item.name} (${item.ticker})`;
        if (subtitleEl) subtitleEl.innerText = 'تكتيك المحترفين (Trading Around The Core) لتأمين المكسب وزيادة عدد الأسهم مجاناً';
        if (iconWrap) iconWrap.className = 'w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400';
        if (iconEl) iconEl.setAttribute('data-lucide', 'compass');
      }

      document.getElementById('rot-stock-price').innerText = `${currentPrice.toFixed(2)} ج`;
      document.getElementById('rot-stock-buyprice').innerText = `${buyPrice.toFixed(2)} ج`;
      document.getElementById('rot-stock-total-shares').innerText = `${totalShares.toLocaleString('en-US')} سهم`;
      
      const returnBadge = document.getElementById('rot-stock-return');
      if (returnBadge) {
        returnBadge.className = isLosing 
          ? 'px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold font-mono text-xs' 
          : 'px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono text-xs';
        returnBadge.innerText = `${profit >= 0 ? '+' : ''}${returnPct.toFixed(1)}% (${profit >= 0 ? '+' : ''}${profit.toLocaleString('en-US')} ج)`;
      }

      const zoneBadge = document.getElementById('rot-stock-zone');
      if (zoneBadge) {
        if (isLosing) {
          zoneBadge.className = 'text-[10px] text-rose-400 block mt-1 font-semibold';
          zoneBadge.innerText = '📉 في مسار هابط / قاع وتراجع مستمر (الأضعف أداءً)';
        } else {
          zoneBadge.className = 'text-[10px] text-amber-300 block mt-1 font-semibold';
          zoneBadge.innerText = '⚠️ في منطقة قمة وتشبع صاعد ومقاومة';
        }
      }

      currentRotationRatio = 0.33;
      setRotationRatio(0.33);

      // Real-time AI Sanity Shield Guard
      if (typeof AiSanityShield !== 'undefined') {
        const audit = AiSanityShield.auditAsset(item);
        const shieldText = document.getElementById('rot-sanity-shield-text');
        if (shieldText) shieldText.innerText = `تم التدقيق الذاتي بواسطة AI Sanity Shield: ${audit.verdictSummary}`;
      }

      const modal = document.getElementById('rotation-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      if (window.lucide) lucide.createIcons();
    }

    function closeRotationModal() {
      const modal = document.getElementById('rotation-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function setRotationRatio(ratio) {
      currentRotationRatio = ratio;
      
      const btn25 = document.getElementById('rot-btn-25');
      const btn33 = document.getElementById('rot-btn-33');
      const btn50 = document.getElementById('rot-btn-50');

      [btn25, btn33, btn50].forEach(b => {
        if (b) {
          b.className = 'px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition';
        }
      });

      if (ratio === 0.25 && btn25) btn25.className = 'px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition';
      if (ratio === 0.33 && btn33) btn33.className = 'px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition';
      if (ratio === 0.50 && btn50) btn50.className = 'px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition';

      recalcRotationModal();
    }

    function recalcRotationModal() {
      const index = parseInt(document.getElementById('rot-asset-index').value, 10);
      const item = portfolioData[index];
      if (!item) return;

      const totalShares = parseInt(item.shares, 10) || 1;
      const currentPrice = Number(item.currentPrice) || 0;
      const buyPrice = Number(item.buyPrice) || 0;
      const profit = Math.round(item.profit) || 0;
      const isLosing = profit < 0;

      // Selling calculations
      let sellShares = Math.max(1, Math.round(totalShares * currentRotationRatio));
      if (sellShares >= totalShares && totalShares > 1) sellShares = totalShares - 1;

      const totalOrigValue = Math.round(totalShares * currentPrice);
      const sellCash = Math.round(sellShares * currentPrice);
      const realizedProfit = Math.round(sellShares * (currentPrice - buyPrice));
      const remainingShares = totalShares - sellShares;
      const remainingValue = totalOrigValue - sellCash;
      const actualPct = Math.round((sellShares / totalShares) * 100);

      document.getElementById('rot-sell-shares-count').innerText = `${sellShares.toLocaleString('en-US')} أسهم`;
      document.getElementById('rot-sell-shares-pct').innerText = `(حوالي ${actualPct}% من إجمالي ملكيتك)`;
      document.getElementById('rot-cash-generated').innerText = `${sellCash.toLocaleString('en-US')} ج.م`;
      
      const cashCard = document.getElementById('rot-cash-card');
      const cashGenLabel = document.getElementById('rot-cash-generated-label');
      const cashGenValue = document.getElementById('rot-cash-generated');
      if (cashCard) {
        if (isLosing) {
          cashCard.className = 'bg-gray-900/90 p-2.5 rounded-xl border border-rose-500/30';
          if (cashGenLabel) cashGenLabel.className = 'text-rose-400 text-[10px] block font-sans';
          if (cashGenValue) cashGenValue.className = 'text-base font-bold text-rose-300';
        } else {
          cashCard.className = 'bg-gray-900/90 p-2.5 rounded-xl border border-emerald-500/30';
          if (cashGenLabel) cashGenLabel.className = 'text-emerald-400 text-[10px] block font-sans';
          if (cashGenValue) cashGenValue.className = 'text-base font-bold text-emerald-300';
        }
      }

      const profitPill = document.getElementById('rot-realized-profit-pill');
      if (profitPill) {
        if (isLosing) {
          profitPill.className = 'text-[9px] text-rose-400/90 block font-sans mt-0.5';
          profitPill.innerText = `مبلغ مسترد (تثبيت خسارة دفترية: -${Math.abs(realizedProfit).toLocaleString('en-US')} ج)`;
        } else {
          profitPill.className = 'text-[9px] text-emerald-400/80 block font-sans mt-0.5';
          profitPill.innerText = `منها +${realizedProfit.toLocaleString('en-US')} ج ربح كاش محقق`;
        }
      }

      document.getElementById('rot-remaining-shares').innerText = `${remainingShares.toLocaleString('en-US')} سهم`;
      document.getElementById('rot-remaining-value').innerText = `بقيمة ${remainingValue.toLocaleString('en-US')} ج (أصل دائم لا يُمس)`;
      
      const allocLabel = document.getElementById('rot-cash-allocated-label');
      if (allocLabel) allocLabel.innerText = `المبلغ المتاح للتنفيذ: ${sellCash.toLocaleString('en-US')} ج.م`;

      // CIB values
      const cibItem = portfolioData.find(p => p.ticker === 'COMI');
      const radarCib = (typeof fullMarketRadar !== 'undefined' && Array.isArray(fullMarketRadar)) ? fullMarketRadar.find(p => p.ticker === 'COMI') : null;
      const cibPrice = (cibItem && cibItem.currentPrice) ? Number(cibItem.currentPrice) : ((radarCib && radarCib.price) ? Number(radarCib.price) : 123.56);
      const cibSharesCanBuy = Math.floor(sellCash / cibPrice);

      // Technical support levels (S1 & S2) for disciplined re-entry zone
      const s1 = Number(item.pivotS1) || 0;
      const s2 = Number(item.pivotS2) || 0;
      let supportLow, supportHigh;

      if (s1 > 0 && s1 < currentPrice) {
        supportHigh = s1;
        supportLow = (s2 > 0 && s2 < s1) ? s2 : +(s1 * 0.97).toFixed(2);
      } else {
        supportLow = +(currentPrice * 0.88).toFixed(2);
        supportHigh = +(currentPrice * 0.92).toFixed(2);
      }
      const avgSupport = +(((supportLow + supportHigh) / 2).toFixed(2));
      const rebuyShares = Math.floor(sellCash / avgSupport);
      const netGainShares = rebuyShares - sellShares;
      const newTotalShares = remainingShares + rebuyShares;

      const step1Title = document.getElementById('rot-step1-title');
      const step1Note = document.getElementById('rot-step1-note');


      const scenATitle = document.getElementById('rot-scenario-a-title');
      const scenATag = document.getElementById('rot-scenario-a-tag');
      const scenADesc = document.getElementById('rot-scenario-a-desc');
      const scenASubdesc = document.getElementById('rot-scenario-a-subdesc');
      const scenAShares = document.getElementById('rot-scenario-a-shares');
      const scenAOutcome = document.getElementById('rot-scenario-a-outcome');
      const scenABtnText = document.getElementById('rot-scenario-a-btn-text');

      const scenBTitle = document.getElementById('rot-scenario-b-title');
      const scenBTag = document.getElementById('rot-scenario-b-tag');
      const scenBDesc = document.getElementById('rot-scenario-b-desc');
      const scenBSubdesc = document.getElementById('rot-scenario-b-subdesc');
      const scenBShares = document.getElementById('rot-scenario-b-shares');
      const scenBResult = document.getElementById('rot-scenario-b-result');
      const scenBBtnText = document.getElementById('rot-scenario-b-btn-text');

      const lessonTitle = document.getElementById('rot-lesson-title');
      const lessonDesc = document.getElementById('rot-lesson-desc');

      if (isLosing) {
        if (step1Title) step1Title.innerText = 'الخطوة 1: أمر التخفيف الجزئي الموصى به لتحرير السيولة المجمدة';
        if (step1Note) step1Note.innerText = 'تخفيف جزئي لحماية رأس المال وعدم التجميد الكامل';
        if (cashGenLabel) cashGenLabel.innerText = 'كاش مسترد يدخل محفظتك';

        // Scenario A: Rotate into strong asset (COMI / CIB)
        if (scenATitle) scenATitle.innerText = 'الخيار الأول (الموصى به للتعويض): تدوير السيولة إلى سهم قيادي صاعد (CIB)';
        if (scenATag) scenATag.innerText = 'تعويض سريع للخسارة';
        if (scenADesc) scenADesc.innerHTML = `بدلاً من حبس السيولة في سهم متراجع (${returnPct.toFixed(1)}%)، تدوير الـ <strong class="text-white font-mono">${sellCash.toLocaleString('en-US')} ج</strong> لشراء سهم البنك التجاري الدولي (CIB) بسعر <strong class="text-white font-mono">${cibPrice.toFixed(2)} ج</strong>.`;
        if (scenASubdesc) scenASubdesc.innerHTML = `شراء فوري في سهم CIB:`;
        if (scenAShares) scenAShares.innerText = `${cibSharesCanBuy} سهم جديد`;
        if (scenAOutcome) scenAOutcome.innerText = `النتيجة: تشغيل السيولة في محرك صعود سريع يعوض خسارة ${item.name}، مع بقاء ${remainingShares} سهم لديك كأصل للاستفادة في حال ارتداد السهم.`;
        if (scenABtnText) scenABtnText.innerText = `اعتمدت تدوير السيولة إلى سهم CIB 🎯 (تعويض الخسارة بسهم قيادي)`;

        // Scenario B: Wait for Technical Rebound to Sell at Better Price
        const reboundLow = +(currentPrice * 1.06).toFixed(2);
        const reboundHigh = +(currentPrice * 1.10).toFixed(2);
        if (scenBTitle) scenBTitle.innerText = 'الخيار الثاني: انتظار ارتداد فني لأقرب مقاومة لتخفيف الخسارة قبل التدوير';
        if (scenBTag) scenBTag.innerText = 'تقليل خسارة التخفيف';
        if (scenBDesc) scenBDesc.innerHTML = `مستويات المقاومة الفنية المتوقعة لارتداد السهم هي بين <strong class="text-amber-300 font-mono">${reboundLow.toFixed(2)} ج - ${reboundHigh.toFixed(2)} ج</strong>. وضع أمر بيع مشروط عند هذا النطاق يقلل الخسارة بمقدار ~1,000 ج.`;
        if (scenBSubdesc) scenBSubdesc.innerHTML = `المبلغ المتوقع عند البيع بالارتداد:`;
        if (scenBShares) scenBShares.innerText = `~${Math.round(sellShares * reboundLow).toLocaleString('en-US')} ج.م`;
        if (scenBResult) scenBResult.innerText = `النتيجة: الخروج بأفضل سعر ممكن خلال الموجة الارتدادية بدلاً من البيع بالقاع اللحظي.`;
        if (scenBBtnText) scenBBtnText.innerText = `تفعيل مراقبة ارتداد المقاومة للتخفيف 🎯 (إنذار عند وصول السعر للمقاومة)`;

        // Lesson
        if (lessonTitle) lessonTitle.innerText = 'لماذا التدوير الجزئي أفضل من التمسك الكامل بسهم خاسر؟';
        if (lessonDesc) lessonDesc.innerText = `لأن تجميد رأس المال كاملاً في سهم متراجع (${returnPct.toFixed(1)}%) يضيع عليك فرص السوق الصاعدة (تكلفة الفرصة البديلة)؛ تحرير جزء من السيولة ونقله لأقوى أسهم السوق يعوض الخسارة بسرعة ويدافع عن إجمالي محفظتك.`;

      } else {
        if (step1Title) step1Title.innerText = 'الخطوة 1: أمر البيع الجزئي المقترح في ثندر الآن (تأمين الكاش)';
        if (step1Note) step1Note.innerText = 'لا نبيع 100% أبداً لحماية المركز';
        if (cashGenLabel) cashGenLabel.innerText = 'كاش مضمون يدخل حسابك';

        // Scenario A: Buy back at support
        if (scenATitle) scenATitle.innerText = 'الخيار الأول (المفضل لك): إعادة شراء نفس السهم في القاع لزيادة عدد أسهمك';
        if (scenATag) scenATag.innerText = 'تكبير الملكية مجاناً';
        if (scenADesc) scenADesc.innerHTML = `السهم في منطقة قمة/مقاومة ومن المتوقع أن يصحح بنسبة 10-14% نحو منطقة الدعم الفني بين <strong class="text-white font-mono">${supportLow.toFixed(2)} ج - ${supportHigh.toFixed(2)} ج</strong>.`;
        if (scenASubdesc) scenASubdesc.innerHTML = `عند وصول السهم للدعم، تشتري بالـ <strong class="text-cyan-300" id="rot-scenario-a-cash">${sellCash.toLocaleString('en-US')} ج</strong>:`;
        if (scenAShares) scenAShares.innerText = `${rebuyShares.toLocaleString('en-US')} سهم`;
        if (scenAOutcome) scenAOutcome.innerText = `النتيجة: أمنت كاش محمي، وعدد أسهمك في ${item.name} يزيد من ${totalShares} إلى ${newTotalShares} سهم مجاناً (+${netGainShares} سهم مجاني)!`;
        if (scenABtnText) scenABtnText.innerText = `اعتمدت هذا الخيار وفعّل المراقبة 🎯 (رصد القاع لحظياً + إنذار لو هرب السهم)`;

        // Scenario B: Deploy into CIB
        if (scenBTitle) scenBTitle.innerText = 'الخيار الثاني: تعزيز سهم خسران في محفظتك (البنك التجاري الدولي CIB)';
        if (scenBTag) scenBTag.innerText = 'تعديل وخفض التكلفة';
        if (scenBDesc) scenBDesc.innerHTML = `سهم CIB متراجع حالياً بنسبة <strong class="text-rose-400 font-mono">-11.3%</strong> بسعر <strong class="text-white font-mono">${cibPrice.toFixed(2)} ج</strong> ومكرر ربحيته تاريخي.`;
        if (scenBSubdesc) scenBSubdesc.innerHTML = `شراء بالـ <strong class="text-indigo-300" id="rot-scenario-b-cash">${sellCash.toLocaleString('en-US')} ج</strong> في سهم CIB:`;
        if (scenBShares) scenBShares.innerText = `شراء ${cibSharesCanBuy} سهم جديد @ ${cibPrice.toFixed(2)} ج`;
        if (scenBResult) scenBResult.innerText = `النتيجة: تخفيض متوسط تكلفة سهم CIB فوراً من 139 ج إلى ~135 ج، وتسريع تحول السهم للربح مع أول ارتداد.`;
        if (scenBBtnText) scenBBtnText.innerText = `اعتمدت هذا الخيار لشراء CIB 🎯 (تعديل التكلفة بربح السهم الرابح)`;

        // Lesson
        if (lessonTitle) lessonTitle.innerText = 'لماذا يمنعك هذا التكتيك من تكرار خسارة الـ 25 ألف السابقة؟';
        if (lessonDesc) lessonDesc.innerText = 'لأنك لم تنتظر هبوط السهم ليأخذ أرباحك؛ بل حولت ثلث المكسب لكاش مضمون في جيبك، فإذا هبط السهم اشتريت أسهماً أكثر، وإذا صعد فأنت لسه تملك 70% من المركز.';
      }

      // Scenario C: Cash cushion
      document.getElementById('rot-scenario-c-cash').innerText = `${sellCash.toLocaleString('en-US')} ج`;
      if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // Real-Time Commitment & Watchdog Live Alarms System
    // ============================================================
    let activeRotationPlans = [];
    try {
      activeRotationPlans = JSON.parse(localStorage.getItem('egx_copilot_active_plans') || '[]');
      if (!Array.isArray(activeRotationPlans)) activeRotationPlans = [];
    } catch(e) {
      activeRotationPlans = [];
    }

    function commitRotationPlan(scenarioType) {
      const index = parseInt(document.getElementById('rot-asset-index').value, 10);
      const item = portfolioData[index];
      if (!item) return;

      const totalShares = parseInt(item.shares, 10) || 1;
      const currentPrice = Number(item.currentPrice) || 0;
      const buyPrice = Number(item.buyPrice) || 0;
      const profit = Math.round(item.profit) || 0;
      const isLosing = profit < 0;

      let sellShares = Math.max(1, Math.round(totalShares * currentRotationRatio));
      if (sellShares >= totalShares && totalShares > 1) sellShares = totalShares - 1;

      const grossSellCash = Number((sellShares * currentPrice).toFixed(2));
      const estCommission = Number((grossSellCash * 0.00175).toFixed(2));
      const sellCash = Math.max(0, Number((grossSellCash - estCommission).toFixed(2)));
      const realizedProfit = Number((sellShares * (currentPrice - buyPrice) - estCommission).toFixed(2));
      const remainingShares = totalShares - sellShares;
      // Technical support levels (S1 & S2) for disciplined re-entry zone
      const s1 = Number(item.pivotS1) || 0;
      const s2 = Number(item.pivotS2) || 0;
      let supportLow, supportHigh;

      if (s1 > 0 && s1 < currentPrice) {
        supportHigh = s1;
        supportLow = (s2 > 0 && s2 < s1) ? s2 : +(s1 * 0.97).toFixed(2);
      } else {
        supportLow = +(currentPrice * 0.88).toFixed(2);
        supportHigh = +(currentPrice * 0.92).toFixed(2);
      }
      const avgSupport = +(((supportLow + supportHigh) / 2).toFixed(2));
      const breakoutThreshold = +(currentPrice * 1.04).toFixed(2);

      let scenarioTitle = '';
      if (isLosing) {
        scenarioTitle = scenarioType === 'A' 
          ? 'تدوير السيولة المحررة إلى سهم البنك التجاري الدولي (CIB)' 
          : (scenarioType === 'B' ? 'مراقبة ارتداد المقاومة الفنية للتخفيف بأقل خسارة' : 'حفظ كاش أمان وقوة شرائية حرة');
      } else {
        scenarioTitle = scenarioType === 'A' 
          ? 'إعادة شراء في القاع لزيادة عدد الأسهم مجاناً' 
          : (scenarioType === 'B' ? 'تعزيز وشراء البنك التجاري الدولي (CIB)' : 'حفظ كاش أمان وقوة شرائية حرة');
      }

      const planId = 'plan_' + Date.now();
      const plan = {
        id: planId,
        ticker: item.ticker,
        name: item.name,
        scenario: scenarioType,
        scenarioTitle: scenarioTitle,
        decisionPrice: currentPrice,
        buyPrice: buyPrice,
        sellShares: sellShares,
        remainingShares: remainingShares,
        sellCash: sellCash,
        realizedProfit: realizedProfit,
        breakoutThreshold: breakoutThreshold,
        supportLow: supportLow,
        supportHigh: supportHigh,
        targetPrice: avgSupport,
        createdAt: Date.now(),
        createdAtCairo: (typeof formatCairoTime === 'function') ? formatCairoTime(new Date(), true, true) : new Date().toLocaleTimeString('ar-EG'),
        expiryTimestamp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7-day maximum window
        status: 'ACTIVE'
      };

      // Replace or update existing plan for this ticker
      activeRotationPlans = activeRotationPlans.filter(p => p.ticker !== item.ticker);
      activeRotationPlans.unshift(plan);

      // 1. Immediately deduct sold shares from portfolio position upon plan commitment
      item.shares = remainingShares;
      item.value = Math.round(remainingShares * currentPrice);
      const totalRemainingCost = Math.round(remainingShares * buyPrice);
      item.profit = item.value - totalRemainingCost;
      item.returnPct = totalRemainingCost > 0 ? parseFloat(((item.profit / totalRemainingCost) * 100).toFixed(2)) : 0;

      // 2. Deposit liberated sell cash into CASH reserve immediately (ensuring cash reserve exists)
      let cashItem = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      if (!cashItem) {
        cashItem = {
          ticker: 'CASH',
          name: 'المحفظة (الرصيد النقدي)',
          category: 'محفظة نقدية • سيولة حرة',
          shares: 1,
          buyPrice: 0,
          currentPrice: 0,
          value: 0,
          profit: 0,
          returnPct: 0,
          isCashReserve: true
        };
        portfolioData.push(cashItem);
      }
      cashItem.value = Number((Number(cashItem.value || 0) + sellCash).toFixed(2));
      cashItem.buyPrice = cashItem.value;
      cashItem.currentPrice = cashItem.value;
      savePortfolio();

      try {
        localStorage.setItem('egx_copilot_active_plans', JSON.stringify(activeRotationPlans));
      } catch(e) {
        console.error('Failed to save active plans:', e);
      }

      closeRotationModal();
      renderActivePlansRadar();
      renderPortfolioTable();

      setTimeout(() => {
        scrollToActiveRadar(planId);
      }, 150);

      const scenarioMsg = scenarioType === 'A' 
        ? `🎯 تم اعتماد الخطة بنجاح وتفعيل رادار المراقبة اللحظية لسهم ${item.name}!\n\n` +
          `• السعر المعتمد: ${currentPrice.toFixed(2)} ج\n` +
          `• كمية البيع: ${sellShares} أسهم (كاش مضمون: ${sellCash.toLocaleString('en-US')} ج)\n` +
          `• نطاق الشراء المستهدف في القاع: ${supportLow} - ${supportHigh} ج\n` +
          `• سقف إلغاء الخطة (Stop-Breakout): ${breakoutThreshold} ج (+4%)\n` +
          `• مهلة الانتظار القصوى: 7 أيام تداول لحماية كفاءة الكاش.\n\n` +
          `النظام الآن يراقب السهم لحظياً مع كل نبضة للبورصة المصرية وسينبهك فوراً!`
        : scenarioType === 'B'
        ? `🎯 تم اعتماد خطة تعزيز CIB بنجاح!\nسيتم توجيه مبلغ ${sellCash.toLocaleString('en-US')} ج المحقق من ${item.name} لشراء أسهم CIB لخفض متوسط التكلفة وتعديل المحفظة.`
        : `🎯 تم اعتماد حفظ كاش أمان بمبلغ ${sellCash.toLocaleString('en-US')} ج كسيولة استراتيجية في المحفظة.`;

      alert(scenarioMsg);
    }

    function cancelRotationPlan(planId) {
      const plan = activeRotationPlans.find(p => p.id === planId);
      const name = plan ? plan.name : 'السهم';
      if (!confirm(`هل أنت متأكد من إلغاء خطة المراقبة لسهم ${name}؟\n(ملاحظة: سيتم الاحتفاظ بالكاش المحرر ${plan ? plan.sellCash.toLocaleString('en-US') : ''} ج كسيولة نقدية حرة في محفظتك).`)) return;

      activeRotationPlans = activeRotationPlans.filter(p => p.id !== planId);
      try {
        localStorage.setItem('egx_copilot_active_plans', JSON.stringify(activeRotationPlans));
      } catch(e) {}

      renderActivePlansRadar();
      renderPortfolioTable();
    }

    function completeRotationPlan(planId, executionPrice) {
      const plan = activeRotationPlans.find(p => p.id === planId);
      if (!plan) return;

      // Deduct Egyptian Exchange & brokerage commission buffer (0.175%) so purchase orders in Thndr succeed
      const commissionRate = 0.00175;
      const effectiveCash = plan.sellCash / (1 + commissionRate);
      const sharesCanBuy = Math.max(1, Math.floor(effectiveCash / executionPrice));
      const actualTradeCost = sharesCanBuy * executionPrice;
      const commissionAmount = Math.round(actualTradeCost * commissionRate * 100) / 100;
      const actualUsedCash = Math.min(plan.sellCash, actualTradeCost + commissionAmount);
      const leftoverCash = Math.max(0, plan.sellCash - actualUsedCash);

      const confirmMsg = `هل قمت بالفعل بتنفيذ أمر الشراء في ثندر لسهم ${plan.name} بسعر ${executionPrice.toFixed(2)} ج؟\n\n` +
        `سيتم إضافة ${sharesCanBuy} سهم جديد إلى محفظتك تلقائياً وتحديث إجمالي الأسهم والأرباح.` +
        (leftoverCash > 0 ? `\n(باقي الكاش غير المستخدم: ${leftoverCash.toLocaleString('en-US')} ج سيبقى برصيدك النقدي).` : '');

      if (!confirm(confirmMsg)) return;

      const stock = portfolioData.find(s => s.ticker === plan.ticker);
      if (stock) {
        const prevShares = parseInt(stock.shares, 10) || 0;
        const newShares = prevShares + sharesCanBuy;
        const prevCost = prevShares * (stock.buyPrice || 0);
        const addedCost = actualUsedCash;
        const newBuyPrice = newShares > 0 ? (prevCost + addedCost) / newShares : stock.buyPrice;

        stock.shares = newShares;
        stock.buyPrice = +newBuyPrice.toFixed(2);
        stock.currentPrice = executionPrice;
        stock.value = Math.round(stock.shares * executionPrice);
        const totalCost = Math.round(stock.shares * stock.buyPrice);
        stock.profit = stock.value - totalCost;
        stock.returnPct = totalCost > 0 ? parseFloat(((stock.profit / totalCost) * 100).toFixed(2)) : 0;

        // Deduct actual used cash from cash reserve (unspent leftover stays in cash reserve)
        const cashAsset = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
        if (cashAsset) {
          cashAsset.value = Math.max(0, +(Number(cashAsset.value || 0) - actualUsedCash).toFixed(2));
          cashAsset.buyPrice = cashAsset.value;
          cashAsset.currentPrice = cashAsset.value;
        }

        savePortfolio();
      }

      activeRotationPlans = activeRotationPlans.filter(p => p.id !== planId);
      try {
        localStorage.setItem('egx_copilot_active_plans', JSON.stringify(activeRotationPlans));
      } catch(e) {}

      renderActivePlansRadar();
      renderPortfolioTable();

      alert(`🎉 ألف مبروك! اكتملت الدورة بنجاح.\nتمت إضافة ${sharesCanBuy} سهم مجاني إلى رصيدك في (${plan.name}).\nإجمالي أسهمك الحالي: ${stock ? stock.shares : newShares} سهم!`);
    }

    function completeRotationPlanToCIB(planId, executionPrice) {
      const plan = activeRotationPlans.find(p => p.id === planId);
      if (!plan) return;

      const commissionRate = 0.00175;
      const effectiveCash = plan.sellCash / (1 + commissionRate);
      const sharesCanBuy = Math.max(1, Math.floor(effectiveCash / executionPrice));
      const actualTradeCost = sharesCanBuy * executionPrice;
      const commissionAmount = Math.round(actualTradeCost * commissionRate * 100) / 100;
      const actualUsedCash = Math.min(plan.sellCash, actualTradeCost + commissionAmount);
      const leftoverCash = Math.max(0, plan.sellCash - actualUsedCash);

      const confirmMsg = `هل قمت بالفعل بشراء ${sharesCanBuy} سهم في البنك التجاري الدولي (CIB) بسعر ${executionPrice.toFixed(2)} ج في ثندر؟\n\n` +
        `سيتم تحديث رصيد CIB في محفظتك وخصم الكاش المستخدم (${actualUsedCash.toLocaleString('en-US')} ج) من الرصيد النقدي.` +
        (leftoverCash > 0 ? `\n(فائض الكاش غير المستخدم: ${leftoverCash.toLocaleString('en-US')} ج سيبقى برصيدك النقدي).` : '');

      if (!confirm(confirmMsg)) return;

      let cibStock = portfolioData.find(s => s.ticker === 'COMI');
      if (cibStock) {
        const prevShares = parseInt(cibStock.shares, 10) || 0;
        const newShares = prevShares + sharesCanBuy;
        const prevCost = prevShares * (cibStock.buyPrice || 0);
        const addedCost = actualUsedCash;
        const newBuyPrice = newShares > 0 ? (prevCost + addedCost) / newShares : cibStock.buyPrice;

        cibStock.shares = newShares;
        cibStock.buyPrice = +newBuyPrice.toFixed(2);
        cibStock.currentPrice = executionPrice;
        cibStock.value = Math.round(newShares * executionPrice);
        const totalCost = Math.round(newShares * cibStock.buyPrice);
        cibStock.profit = cibStock.value - totalCost;
        cibStock.returnPct = totalCost > 0 ? parseFloat(((cibStock.profit / totalCost) * 100).toFixed(2)) : 0;
        cibStock.status = cibStock.profit >= 0 ? 'ربح' : 'تراجع';
      } else {
        const radarCib = typeof fullMarketRadar !== 'undefined' ? fullMarketRadar.find(r => r.ticker === 'COMI') : null;
        cibStock = {
          ticker: 'COMI',
          name: (radarCib && radarCib.name) || 'البنك التجاري الدولي (CIB)',
          category: 'EGX30 • بنوك وخدمات مالية',
          shares: sharesCanBuy,
          buyPrice: executionPrice,
          currentPrice: executionPrice,
          value: Math.round(sharesCanBuy * executionPrice),
          profit: 0,
          returnPct: 0.0,
          status: 'متعادل',
          advice: 'سهم دفاعي قيادي تم شراؤه بنجاح',
          action: 'HOLD',
          thndrUrl: 'https://app.thndr.app'
        };
        portfolioData.push(cibStock);
      }

      // Deduct actual used cash from cash reserve
      const cashAsset = portfolioData.find(p => p.ticker === 'CASH' || p.isCashReserve);
      if (cashAsset) {
        cashAsset.value = Math.max(0, +(Number(cashAsset.value || 0) - actualUsedCash).toFixed(2));
        cashAsset.buyPrice = cashAsset.value;
        cashAsset.currentPrice = cashAsset.value;
      }

      savePortfolio();

      activeRotationPlans = activeRotationPlans.filter(p => p.id !== planId);
      try {
        localStorage.setItem('egx_copilot_active_plans', JSON.stringify(activeRotationPlans));
      } catch(e) {}

      renderActivePlansRadar();
      renderPortfolioTable();

      alert(`🎉 تم بنجاح تعزيز وتحديث محفظتك لشراء ${sharesCanBuy} سهم في البنك التجاري الدولي (CIB)!\nإجمالي أسهم CIB الحالية: ${cibStock.shares} سهم.`);
    }

    function switchPlanToCIB(planId) {
      const plan = activeRotationPlans.find(p => p.id === planId);
      if (!plan) return;

      plan.scenario = 'B';
      plan.scenarioTitle = 'تعزيز وشراء البنك التجاري الدولي (CIB)';
      try {
        localStorage.setItem('egx_copilot_active_plans', JSON.stringify(activeRotationPlans));
      } catch(e) {}

      renderActivePlansRadar();
      renderPortfolioTable();
      alert(`✅ تم تحويل الخطة وتوجيه مبلغ الكاش (${plan.sellCash.toLocaleString('en-US')} ج) نحو تعزيز سهم CIB الخسران لخفض متوسط التكلفة.`);
    }

    function scrollToActiveRadar(planId) {
      const el = document.getElementById(planId) || document.getElementById('active-plans-radar-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-cyan-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400'), 2000);
      }
    }

    function renderActivePlansRadar() {
      const container = document.getElementById('active-plans-radar-container');
      if (!container) return;

      if (!activeRotationPlans || activeRotationPlans.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
      }

      container.classList.remove('hidden');

      let cardsHtml = '';

      activeRotationPlans.forEach(plan => {
        const stock = portfolioData.find(s => s.ticker === plan.ticker);
        const livePrice = stock && stock.currentPrice ? Number(stock.currentPrice) : plan.decisionPrice;
        
        const msRemaining = plan.expiryTimestamp - Date.now();
        const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 3600 * 1000)));
        const isExpired = msRemaining <= 0;

        const priceDiffPct = plan.decisionPrice > 0 
          ? (((livePrice - plan.decisionPrice) / plan.decisionPrice) * 100) 
          : 0;

        const isBreakout = (plan.scenario === 'A') && (livePrice >= plan.breakoutThreshold);
        const isDipHit = (plan.scenario === 'A') && (livePrice <= plan.supportHigh) && !isBreakout;

        const expiryDateObj = new Date(plan.expiryTimestamp);
        const expiryDateStr = `${expiryDateObj.getDate()}/${expiryDateObj.getMonth()+1}/${expiryDateObj.getFullYear()}`;

        // CIB Live Info
        const cibStock = portfolioData.find(s => s.ticker === 'COMI');
        const radarCib = (typeof fullMarketRadar !== 'undefined' && Array.isArray(fullMarketRadar)) ? fullMarketRadar.find(p => p.ticker === 'COMI') : null;
        const cibLivePrice = (cibStock && cibStock.currentPrice) ? Number(cibStock.currentPrice) : ((radarCib && radarCib.price) ? Number(radarCib.price) : 123.56);
        const cibSharesCanBuy = Math.floor(plan.sellCash / cibLivePrice);

        if (plan.scenario === 'A') {
          if (isBreakout) {
            // ALARM 1: BREAKOUT STOP INVALIDATION 🚨
            cardsHtml += `
              <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/50 space-y-3 relative overflow-hidden transition">
                <div class="flex items-center justify-between flex-wrap gap-2 border-b border-rose-500/30 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span class="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-extrabold text-xs border border-rose-500/50 flex items-center gap-1.5">
                      <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400"></i>
                      <span>🚨 إنذار فوري: السهم كسر المقاومة للأعلى وتجاوز سعر البيع!</span>
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-rose-300 bg-rose-900/50 px-2 py-0.5 rounded border border-rose-800">
                      +${priceDiffPct.toFixed(1)}% ارتفاع مفاجئ
                    </span>
                    <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-rose-900/40 transition cursor-pointer" title="إلغاء الخطة">
                      ✕ إلغاء الخطة
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-rose-800/40">
                    <span class="text-gray-400 block text-[11px]">سعر البيع وقت القرار:</span>
                    <span class="text-white font-mono font-bold text-sm">${plan.decisionPrice.toFixed(2)} ج.م</span>
                    <span class="text-[10px] text-gray-500 block">سقف الهروب (+4%): ${plan.breakoutThreshold} ج</span>
                  </div>
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-rose-800/40">
                    <span class="text-gray-400 block text-[11px]">السعر اللحظي الآن:</span>
                    <span class="text-rose-400 font-mono font-extrabold text-base animate-pulse">${livePrice.toFixed(2)} ج.م</span>
                    <span class="text-[10px] text-rose-300 block">تجاوز سقف الأمان (${(livePrice - plan.breakoutThreshold).toFixed(2)} ج زيادة)</span>
                  </div>
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-rose-800/40">
                    <span class="text-gray-400 block text-[11px]">${plan.realizedProfit >= 0 ? 'الكاش المحمي معك:' : 'الكاش المسترد بالتخفيف:'}</span>
                    <span class="text-emerald-400 font-mono font-bold text-sm">${plan.sellCash.toLocaleString('en-US')} ج.م</span>
                    ${plan.realizedProfit >= 0 
                      ? `<span class="text-[10px] text-emerald-300 block">منها +${plan.realizedProfit.toLocaleString('en-US')} ج ربح محقق</span>` 
                      : `<span class="text-[10px] text-rose-400 block">تثبيت خسارة دفترية: -${Math.abs(plan.realizedProfit).toLocaleString('en-US')} ج</span>`
                    }
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-rose-900/30 border border-rose-500/40 text-xs text-rose-200 leading-relaxed flex items-start gap-2.5">
                  <i data-lucide="shield-alert" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5"></i>
                  <div>
                    <strong class="text-white block font-bold mb-1">الرؤية الاستشارية الصارمة: لا تطارد السهم في القمة!</strong>
                    السهم أظهر قوة شرائية غير متوقعة ورفض التصحيح نحو القاع. 
                    <strong>الإجراء الإلزامي:</strong> إلغاء أي أمر شراء معلق في ثندر فوراً. 
                    أنت لا تزال تملك <strong class="text-white">${plan.remainingShares} سهماً</strong> كأصل دائم تستفيد من صعودها، ومبلغ الكاش (<strong class="text-white">${plan.sellCash.toLocaleString('en-US')} ج</strong>) نوجهه فوراً لسهم CIB الخسران في قاعه بدلاً من المخاطرة.
                  </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-rose-500/20">
                  <div class="flex items-center gap-2">
                    <button onclick="switchPlanToCIB('${plan.id}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-950/40 transition cursor-pointer">
                      <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
                      <span>تحويل الكاش لشراء CIB فوراً (${cibSharesCanBuy} سهم)</span>
                    </button>
                    <a href="https://app.thndr.app" target="_blank" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 transition">
                      <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                      <span>فتح ثندر لإلغاء الأمر المعلق</span>
                    </a>
                  </div>
                  <button onclick="cancelRotationPlan('${plan.id}')" class="px-3 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition cursor-pointer">
                    إغلاق الإنذار وإنهاء الخطة
                  </button>
                </div>
              </div>
            `;
          } else if (isDipHit) {
            // ALARM 2: DIP TARGET HIT 🎯
            const sharesAtDip = +(plan.sellCash / livePrice).toFixed(1);
            const freeSharesGain = +(sharesAtDip - plan.sellShares).toFixed(1);

            cardsHtml += `
              <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/50 space-y-3 relative overflow-hidden transition animate-pulse">
                <div class="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/30 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/50 flex items-center gap-1.5">
                      <i data-lucide="crosshair" class="w-4 h-4 text-emerald-400"></i>
                      <span>🎯 إشارة تنفيذ فورية: سهم ${plan.name} وصل منطقة القاع المستهدفة!</span>
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                      ${priceDiffPct.toFixed(1)}% تصحيح مثالي
                    </span>
                    <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-emerald-900/40 transition cursor-pointer">
                      ✕ إلغاء
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-emerald-800/40">
                    <span class="text-gray-400 block text-[11px]">${plan.realizedProfit >= 0 ? 'سعر البيع في القمة:' : 'سعر بيع التخفيف والتدوير:'}</span>
                    <span class="text-white font-mono font-bold text-sm">${plan.decisionPrice.toFixed(2)} ج.م</span>
                    <span class="text-[10px] text-gray-500 block">بعت: ${plan.sellShares} أسهم</span>
                  </div>
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-emerald-800/40">
                    <span class="text-gray-400 block text-[11px]">سعر القاع الحالي (شراء الآن):</span>
                    <span class="text-emerald-400 font-mono font-extrabold text-base">${livePrice.toFixed(2)} ج.م</span>
                    <span class="text-[10px] text-emerald-300 block">نطاق الدعم: ${plan.supportLow} - ${plan.supportHigh} ج</span>
                  </div>
                  <div class="bg-gray-900/90 p-3 rounded-xl border border-emerald-800/40">
                    <span class="text-gray-400 block text-[11px]">الكاش المحمي المتاح:</span>
                    <span class="text-emerald-400 font-mono font-bold text-sm">${plan.sellCash.toLocaleString('en-US')} ج.م</span>
                    <span class="text-[10px] text-cyan-300 block">يشتري: ${sharesAtDip} سهم (+${freeSharesGain} سهم مجاناً!)</span>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                  <i data-lucide="sparkles" class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"></i>
                  <div>
                    <strong class="text-white block font-bold mb-1">لحظة حصد الثمار: زيادة عدد أسهمك مجاناً!</strong>
                    السهم وصل بالمللي لمنطقة الدعم الفني المحسوبة. الشراء الآن بالـ <strong class="text-white">${plan.sellCash.toLocaleString('en-US')} ج</strong> يعيد لك الـ ${plan.sellShares} أسهم المباعة ويمنحك <strong class="text-white font-mono">+${freeSharesGain} سهم زيادة</strong> بدون دفع مليم واحد إضافي من أموالك الخاصة.
                  </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-emerald-500/20">
                  <div class="flex items-center gap-2">
                    <a href="https://app.thndr.app" target="_blank" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition">
                      <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                      <span>فتح ثندر وتنفيذ أمر الشراء الآن ⚡</span>
                    </a>
                    <button onclick="completeRotationPlan('${plan.id}', ${livePrice})" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer">
                      <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                      <span>تم التنفيذ في ثندر وتحديث المحفظة ✅</span>
                    </button>
                  </div>
                  <button onclick="cancelRotationPlan('${plan.id}')" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
                    إلغاء الخطة
                  </button>
                </div>
              </div>
            `;
          } else if (isExpired) {
            // ALARM 3: HORIZON EXPIRED ⏳
            cardsHtml += `
              <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 space-y-3 relative overflow-hidden transition">
                <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-500/30 pb-3">
                  <div class="flex items-center gap-2.5">
                    <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
                    <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/50">
                      ⏳ انتهاء المهلة الزمنية (7 أيام تداول) دون وصول السهم للقاع
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-gray-400">انتهت الصلاحية: ${expiryDateStr}</span>
                    <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-amber-900/40 transition cursor-pointer">
                      ✕
                    </button>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-amber-900/30 border border-amber-500/40 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
                  <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5"></i>
                  <div>
                    <strong class="text-white block font-bold mb-1">تكلفة الفرصة البديلة (Opportunity Cost):</strong>
                    مرت 7 أيام تداول كاملة وسعر السهم يتذبذب عرضياً قرب <strong class="text-white">${livePrice.toFixed(2)} ج.م</strong> دون كسر المقاومة أو الوصول للدعم (${plan.supportHigh} ج). حبس السيولة لفترة أطول يضر بكفاءة المحفظة؛ يُنصح بإلغاء أمر الشراء المعلق ونقل الكاش المضمون (<strong class="text-white">${plan.sellCash.toLocaleString('en-US')} ج</strong>) لفرصة بديلة جاهزة كالبنك التجاري الدولي (CIB).
                  </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-500/20">
                  <button onclick="switchPlanToCIB('${plan.id}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
                    <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
                    <span>تحويل الكاش لشراء سهم CIB الخسران فوراً</span>
                  </button>
                  <button onclick="cancelRotationPlan('${plan.id}')" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer">
                    إلغاء الخطة وتحرير الكاش
                  </button>
                </div>
              </div>
            `;
          } else {
            // STATE 4: ACTIVE MONITORING 🟢
            const distToDip = Math.max(0, +(livePrice - plan.supportHigh)).toFixed(2);
            const distToDipPct = (( (livePrice - plan.supportHigh) / livePrice ) * 100).toFixed(1);
            const distToBreakout = Math.max(0, +(plan.breakoutThreshold - livePrice)).toFixed(2);
            const distToBreakoutPct = (( (plan.breakoutThreshold - livePrice) / livePrice ) * 100).toFixed(1);

            cardsHtml += `
              <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-gray-950 border border-cyan-500/40 shadow-xl space-y-3 relative overflow-hidden transition">
                <div class="flex items-center justify-between flex-wrap gap-2 border-b border-gray-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span class="font-extrabold text-white text-xs sm:text-sm">
                      مراقبة حية نشطة: ${plan.name} (${plan.ticker})
                    </span>
                    <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/30">
                      خطة تدوير القمة للقاع
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-gray-400 font-mono">
                      ⏳ باقي <strong class="text-amber-400">${daysRemaining} أيام</strong> على مهلة الانتظار
                    </span>
                    <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-500 hover:text-rose-400 text-xs font-bold transition cursor-pointer" title="إلغاء المراقبة">
                      ✕ إلغاء
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div class="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
                    <span class="text-gray-400 block text-[10px]">${plan.realizedProfit >= 0 ? 'سعر اعتماد البيع:' : 'سعر بيع التخفيف:'}</span>
                    <span class="text-white font-mono font-bold">${plan.decisionPrice.toFixed(2)} ج.م</span>
                    <span class="text-[9px] text-gray-500 block">${plan.realizedProfit >= 0 ? `كاش محقق: ${plan.sellCash.toLocaleString('en-US')} ج` : `كاش مسترد: ${plan.sellCash.toLocaleString('en-US')} ج`}</span>
                  </div>
                  <div class="bg-gray-900/90 p-2.5 rounded-xl border border-cyan-800/40">
                    <span class="text-gray-400 block text-[10px]">السعر اللحظي الآن:</span>
                    <span class="text-cyan-300 font-mono font-extrabold">${livePrice.toFixed(2)} ج.م</span>
                    <span class="text-[9px] ${priceDiffPct >= 0 ? 'text-rose-400' : 'text-emerald-400'} block">
                      ${priceDiffPct >= 0 ? '+' : ''}${priceDiffPct.toFixed(1)}% عن سعر البيع
                    </span>
                  </div>
                  <div class="bg-gray-900/90 p-2.5 rounded-xl border border-emerald-800/40">
                    <span class="text-emerald-400 block text-[10px]">نطاق شراء القاع:</span>
                    <span class="text-white font-mono font-bold">${plan.supportLow} - ${plan.supportHigh} ج</span>
                    <span class="text-[9px] text-emerald-300 block">باقي ${distToDip} ج (${distToDipPct}%)</span>
                  </div>
                  <div class="bg-gray-900/90 p-2.5 rounded-xl border border-rose-800/40">
                    <span class="text-rose-400 block text-[10px]">سقف إلغاء الخطة (+4%):</span>
                    <span class="text-white font-mono font-bold">${plan.breakoutThreshold} ج.م</span>
                    <span class="text-[9px] text-rose-300 block">باقي ${distToBreakout} ج (${distToBreakoutPct}%)</span>
                  </div>
                </div>

                <!-- Visual Distance Progress Tracker -->
                <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-800/80 space-y-1.5 text-[11px]">
                  <div class="flex items-center justify-between text-gray-400 text-[10px]">
                    <span class="text-emerald-400 font-bold flex items-center gap-1">
                      <i data-lucide="arrow-down" class="w-3 h-3"></i>
                      <span>القاع المستهدف (${plan.supportHigh} ج)</span>
                    </span>
                    <span class="text-cyan-300 font-mono font-bold">السعر الآن: ${livePrice.toFixed(2)} ج</span>
                    <span class="text-rose-400 font-bold flex items-center gap-1">
                      <span>سقف الهروب (${plan.breakoutThreshold} ج)</span>
                      <i data-lucide="arrow-up" class="w-3 h-3"></i>
                    </span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-gray-800 overflow-hidden flex">
                    <div class="bg-emerald-500 h-full" style="width: 35%"></div>
                    <div class="bg-cyan-500 h-full" style="width: 30%"></div>
                    <div class="bg-rose-500 h-full" style="width: 35%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-gray-500">
                    <span>🎯 اقتراب من القاع: باقي ${distToDip} ج</span>
                    <span>🚨 إنذار الهروب: باقي ${distToBreakout} ج</span>
                  </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span class="text-[10px] text-gray-400">
                    🛡️ رادار المراقبة يعمل تلقائياً مع كل تحديث لحظي للبورصة
                  </span>
                  <div class="flex items-center gap-2">
                    <a href="https://app.thndr.app" target="_blank" class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1 transition">
                      <i data-lucide="external-link" class="w-3 h-3"></i>
                      <span>متابعة في ثندر</span>
                    </a>
                    <button onclick="cancelRotationPlan('${plan.id}')" class="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-rose-400 border border-rose-900/50 text-xs font-bold transition cursor-pointer">
                      إلغاء الخطة
                    </button>
                  </div>
                </div>
              </div>
            `;
          }
        } else if (plan.scenario === 'B') {
          // Scenario B: Deploy to CIB
          cardsHtml += `
            <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-xl space-y-3 relative overflow-hidden transition">
              <div class="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-500/30 pb-3">
                <div class="flex items-center gap-2.5">
                  <i data-lucide="arrow-down-right" class="w-4 h-4 text-indigo-400"></i>
                  <span class="font-extrabold text-white text-xs sm:text-sm">
                    خطة معتمدة: تعزيز سهم CIB بكاش أرباح ${plan.name}
                  </span>
                </div>
                <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-indigo-900/40 transition cursor-pointer">
                  ✕ إلغاء
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div class="bg-gray-900/90 p-3 rounded-xl border border-indigo-800/40">
                  <span class="text-gray-400 block text-[10px]">الكاش المحصل من بيع ${plan.name}:</span>
                  <span class="text-emerald-400 font-mono font-bold text-sm">${plan.sellCash.toLocaleString('en-US')} ج.م</span>
                </div>
                <div class="bg-gray-900/90 p-3 rounded-xl border border-indigo-800/40">
                  <span class="text-gray-400 block text-[10px]">سعر سهم CIB اللحظي:</span>
                  <span class="text-white font-mono font-bold text-sm">${cibLivePrice.toFixed(2)} ج.م</span>
                </div>
                <div class="bg-gray-900/90 p-3 rounded-xl border border-indigo-800/40">
                  <span class="text-gray-400 block text-[10px]">عدد أسهم CIB الممكن شراؤها:</span>
                  <span class="text-indigo-300 font-mono font-extrabold text-sm">${cibSharesCanBuy} سهم جديد</span>
                </div>
              </div>

              <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-indigo-500/20">
                <a href="https://app.thndr.app" target="_blank" class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  <span>فتح ثندر لشراء ${cibSharesCanBuy} سهم في CIB ⚡</span>
                </a>
                <div class="flex items-center gap-2">
                  <button onclick="completeRotationPlanToCIB('${plan.id}', ${cibLivePrice})" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                    <span>تم الشراء في ثندر (تحديث المحفظة)</span>
                  </button>
                  <button onclick="cancelRotationPlan('${plan.id}')" class="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-rose-400 border border-rose-900/50 font-bold text-xs transition cursor-pointer">
                    إلغاء الخطة
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          // Scenario C: Cash Cushion
          cardsHtml += `
            <div id="${plan.id}" class="p-4 sm:p-5 rounded-2xl bg-gray-950 border border-emerald-500/30 shadow-xl space-y-3 relative overflow-hidden transition">
              <div class="flex items-center justify-between flex-wrap gap-2 border-b border-gray-800 pb-3">
                <div class="flex items-center gap-2.5">
                  <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
                  <span class="font-extrabold text-white text-xs sm:text-sm">
                    خطة معتمدة: كاش أمان محمي (${plan.sellCash.toLocaleString('en-US')} ج.م)
                  </span>
                </div>
                <button onclick="cancelRotationPlan('${plan.id}')" class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-gray-800 transition cursor-pointer">
                  ✕ إلغاء
                </button>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed">
                تم تجنيب هذا المبلغ كسيولة حرة في ثندر لاقتناص أي هبوط عام مفاجئ للبورصة أو المشاركة في اكتتابات جديدة دون تسييل استثماراتك الأساسية.
              </p>
            </div>
          `;
        }
      });

      container.innerHTML = `
        <div class="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4 flex-wrap gap-2">
            <div class="flex items-center gap-2.5">
              <div class="relative flex items-center justify-center">
                <span class="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping absolute"></span>
                <span class="w-3.5 h-3.5 rounded-full bg-amber-400 relative"></span>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>رادار المراقبة اللحظية للخطط المعتمدة وتنبيهات البورصة الحية</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">${activeRotationPlans.length} خطة نشطة</span>
                </h3>
                <p class="text-xs text-gray-400 mt-0.5">النظام يراقب حركة الأسعار لحظياً ضد القرارات التي اعتمدتها لتقديم إشارات البيع والشراء والإنذارات المبكرة</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="fetchLiveEGXPricesAndReevaluate()" class="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer">
                <i data-lucide="refresh-cw" class="w-3 h-3 text-cyan-400"></i>
                <span>فحص الأسعار الآن</span>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            ${cardsHtml}
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    }

    // Smart Rebalancing & Cash Allocation Calculator
    // Smart Dynamic Rebalancing & Cash Allocation Calculator (Zero Static Data)
    function calculateSmartAllocation() {
      const amount = parseFloat(document.getElementById('rebalance-amount-input').value) || 0;
      const container = document.getElementById('rebalance-suggestions-list');
      container.innerHTML = '';

      if (amount <= 0) {
        container.innerHTML = '<p class="text-rose-400 font-bold p-3">يرجى إدخال مبلغ سيولة صحيح لحساب التوزيع.</p>';
        return;
      }

      // Guardrail: Freeze equity allocation during systemic market crashes
      if (typeof getMarketRegimeCode === 'function' && getMarketRegimeCode() === 'SYSTEMIC_SHOCK') {
        container.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              <h4 class="font-bold text-rose-300 text-xs sm:text-sm">⚠️ وضع السوق الحالي: صدمة بيعية شاملة (Systemic Shock Alert)</h4>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed">
              وفقاً لقواعد إدارة المخاطر الصارمة، يُحظر توزيع أي سيولة جديدة لشراء أو تعزيز الأسهم أثناء موجات الهبوط الذعري الشامل لتجنب السكاكين الساقطة.
            </p>
            <div class="p-3 bg-gray-900/90 rounded-lg border border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs">
                <span class="text-white font-bold block">التوجيه الإلزامي للسيولة (100% كاش أمان):</span>
                <span class="text-gray-400 text-[11px]">الاحتفاظ بكامل مبلغ ${amount.toLocaleString('en-US')} ج كسيولة نقدية حرة أو في صندوق اليوم بيوم (NCS) بعائد 22.4% حتى استقرار المؤشرات.</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-amber-400 font-mono text-base">${amount.toLocaleString('en-US')} ج</span>
                <span class="block text-[10px] text-gray-400 font-mono">100% كاش محمي</span>
              </div>
            </div>
          </div>
        `;
        return;
      }

      // 1. Identify best Core Accumulation Candidate from current portfolio or top EGX30
      const ownedStocks = portfolioData.filter(p => p.ticker !== 'CASH' && p.ticker !== 'NCS' && p.ticker !== 'BSB' && (p.shares || 0) > 0);
      let coreCandidate = ownedStocks.find(p => p.action === 'ACCUMULATE') ||
                          ownedStocks.find(p => p.profit < 0 && p.currentPrice >= (p.pivotS1 || 0)) ||
                          ownedStocks[0];

      if (!coreCandidate && fullMarketRadar.length > 0) {
        coreCandidate = fullMarketRadar.find(s => s.index === 'egx30') || fullMarketRadar[0];
      }

      // 2. Identify best Tactical Satellite Opportunity from Full Market Radar (Highest R/R >= 2.0 or Momentum)
      let satelliteCandidate = fullMarketRadar.find(s => 
        s.ticker !== (coreCandidate ? coreCandidate.ticker : '') && 
        s.rrRatio >= 2.0 && 
        (s.tags && (s.tags.includes('momentum') || s.tags.includes('volume_surge')))
      ) || fullMarketRadar.find(s => s.ticker !== (coreCandidate ? coreCandidate.ticker : '') && s.rrRatio >= 1.8) || fullMarketRadar[1] || fullMarketRadar[0];

      const coreAmount = Math.round(amount * 0.45);
      const satAmount = Math.round(amount * 0.35);
      const cashCushion = Math.round(amount * 0.20);

      const corePrice = coreCandidate ? (coreCandidate.currentPrice || coreCandidate.price || 1) : 100;
      const satPrice = satelliteCandidate ? (satelliteCandidate.price || satelliteCandidate.currentPrice || 1) : 50;

      const coreShares = Math.floor(coreAmount / corePrice);
      const satShares = Math.floor(satAmount / satPrice);

      const coreName = coreCandidate ? `${coreCandidate.name} (${coreCandidate.ticker})` : 'سهم قيادي EGX30';
      const satName = satelliteCandidate ? `${satelliteCandidate.name} (${satelliteCandidate.ticker})` : 'فرصة طفرة سريعة';

      const coreJustification = coreCandidate && coreCandidate.profit != null
        ? `السهم عند سعر ${corePrice.toFixed(2)} ج قرب مستوى الدعم الفني ${coreCandidate.pivotS1 || coreCandidate.support || 'الأمان'}؛ الشراء هنا يعزز المركز الاستثماري ويخفض متوسط التكلفة.`
        : `سهم قيادي صلب يتداول عند ${corePrice.toFixed(2)} ج ويمثل ركيزة دفاعية في محفظتك طويلة الأجل.`;

      const satJustification = satelliteCandidate && satelliteCandidate.rrRatio
        ? `فرصة طفرة بزخم صاعد ونسبة عائد لمخاطرة ممتازة (${satelliteCandidate.rrDisplay || ('1:' + satelliteCandidate.rrRatio)}) مستهدفاً ${satelliteCandidate.target1 || 'المقاومة الأولى'} ووقف خسارة ${satelliteCandidate.stopLoss || 'صارم'}.`
        : `سهم واعد يتداول بنشاط وسيولة قوية لتنفيذ صفقة تكتيكية سريعة.`;

      container.innerHTML = `
        <!-- Candidate 1: Core Investment (45%) -->
        <div class="p-3.5 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
          <div class="max-w-md">
            <div class="font-bold text-white text-xs flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>شراء وتعزيز في ${coreName} • ${coreShares.toLocaleString('en-US')} سهم</span>
            </div>
            <p class="text-[11px] text-gray-400 mt-1 leading-relaxed">${coreJustification}</p>
          </div>
          <div class="text-right">
            <span class="font-bold text-emerald-400 font-mono text-sm">${coreAmount.toLocaleString('en-US')} ج</span>
            <span class="block text-[10px] text-gray-400 font-mono">45% من السيولة (${coreShares} سهم @ ${corePrice.toFixed(2)} ج)</span>
          </div>
        </div>

        <!-- Candidate 2: Tactical Satellite (35%) -->
        <div class="p-3.5 rounded-xl bg-gray-900 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-2">
          <div class="max-w-md">
            <div class="font-bold text-white text-xs flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>اقتناص طفرة في ${satName} • ${satShares.toLocaleString('en-US')} سهم</span>
            </div>
            <p class="text-[11px] text-gray-400 mt-1 leading-relaxed">${satJustification}</p>
          </div>
          <div class="text-right">
            <span class="font-bold text-cyan-400 font-mono text-sm">${satAmount.toLocaleString('en-US')} ج</span>
            <span class="block text-[10px] text-gray-400 font-mono">35% من السيولة (${satShares} سهم @ ${satPrice.toFixed(2)} ج)</span>
          </div>
        </div>

        <!-- Candidate 3: Emergency Cash Cushion (20%) -->
        <div class="p-3.5 rounded-xl bg-gray-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2">
          <div class="max-w-md">
            <div class="font-bold text-white text-xs flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>الاحتفاظ كسيولة أمان كاش (Safety Cash Reserve)</span>
            </div>
            <p class="text-[11px] text-gray-400 mt-1 leading-relaxed">وفق ميثاق إدارة المحفظة: الاحتفاظ بسيولة طوارئ (20%) لاقتناص أي تصحيحات سعرية مفاجئة للبورصة بدون تسييل الأسهم.</p>
          </div>
          <div class="text-right">
            <span class="font-bold text-amber-400 font-mono text-sm">${cashCushion.toLocaleString('en-US')} ج</span>
            <span class="block text-[10px] text-gray-400 font-mono">20% كاش أمان مضمون</span>
          </div>
        </div>
      `;
    }

    function setRebalanceAmount(val) {
      const input = document.getElementById('rebalance-amount-input');
      if (input) {
        input.value = val;
        calculateSmartAllocation();
      }
    }
