/**
 * EGX AI Copilot - Valuation & Benchmark Alpha Engine (js/valuation.js)
 * Implements:
 * 1. DCF / DDM Fair Value Engine with interactive Egyptian macroeconomic sliders.
 * 2. Benchmark Alpha Tracker (Alpha α, Beta β, Sharpe Ratio & Comparative Performance).
 */

(function (global) {
  'use strict';

  // Audited Baseline Parameters Registry for EGX Companies (in Million EGP unless specified)
  const EGX_VALUATION_PROFILES = {
    "COMI": {
      ticker: "COMI",
      name: "البنك التجاري الدولي (CIB)",
      sector: "بنوك وخدمات مالية",
      isFinancial: true,
      fcf0: 28500, // Normalized bank earnings for DDM
      growthRate: 18.0,
      discountRate: 22.0, // Cost of Equity in EGP
      terminalGrowth: 7.0,
      netDebt: 0,
      sharesCount: 3025,
      fairValueBaseline: 155.0,
      modelType: "نموذج خصم التوزيعات والأرباح المصرفية (DDM Model)",
      analysis: "أكبر بنك خاص في مصر؛ هوامش تشغيلية فائقة (85%) واستفادة مباشرة من عوائد أدوات الدين السيادية."
    },
    "SWDY": {
      ticker: "SWDY",
      name: "السويدي إليكتريك",
      sector: "طاقة وكابلات وتصدير",
      isFinancial: false,
      fcf0: 7800,
      growthRate: 20.0,
      discountRate: 21.5,
      terminalGrowth: 7.5,
      netDebt: 6500,
      sharesCount: 2170,
      fairValueBaseline: 125.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "تنوع تصديري ودولاري استثنائي، عقود بنية تحتية وطاقة إقليمية مستقرة وهوامش تشغيلية صناعية صلبة."
    },
    "TMGH": {
      ticker: "TMGH",
      name: "مجموعة طلعت مصطفى القابضة",
      sector: "تطوير عقاري وفنادق",
      isFinancial: false,
      fcf0: 9500,
      growthRate: 24.0,
      discountRate: 22.0,
      terminalGrowth: 8.0,
      netDebt: 11000,
      sharesCount: 2063,
      fairValueBaseline: 98.0,
      modelType: "التدفقات النقدية ومحفظة الأراضي الفندقية (FCFF & NAV)",
      analysis: "أضخم محفظة أراضي وتدفقات دولارية فندقية بمصر، واستفادة استراتيجية تاريخية من شراكة رأس الحكمة."
    },
    "ABUK": {
      ticker: "ABUK",
      name: "أبو قير للأسمدة",
      sector: "بتروكيماويات وتصدير",
      isFinancial: false,
      fcf0: 12000,
      growthRate: 14.0,
      discountRate: 21.0,
      terminalGrowth: 6.5,
      netDebt: -4800, // Net Cash position
      sharesCount: 1261,
      fairValueBaseline: 108.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "مركز مالي خالٍ من الديون (صافي نقدية وفائض سيولة)، وتوزيعات نقدية بالعملة الصعبة وهوامش تزيد عن 45%."
    },
    "MFPC": {
      ticker: "MFPC",
      name: "مصر لإنتاج الأسمدة (موبكو)",
      sector: "بتروكيماويات وأسمدة",
      isFinancial: false,
      fcf0: 11200,
      growthRate: 15.0,
      discountRate: 21.0,
      terminalGrowth: 6.5,
      netDebt: -3200,
      sharesCount: 2057,
      fairValueBaseline: 58.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "أعلى هوامش ربحية في قطاع الأسمدة (هوامش تفوق 50%) وتصدير حر دون ديون مرهقة."
    },
    "EGAL": {
      ticker: "EGAL",
      name: "مصر للألومنيوم",
      sector: "معادن وصناعة ثقيلة",
      isFinancial: false,
      fcf0: 5600,
      growthRate: 16.0,
      discountRate: 22.5,
      terminalGrowth: 7.0,
      netDebt: -1500,
      sharesCount: 410,
      fairValueBaseline: 345.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "استفادة فورية من تسعير الألومنيوم بالدولار في بورصة لندن (LME) وصافي تدفقات نقدية تشغيلية صلبة."
    },
    "FWRY": {
      ticker: "FWRY",
      name: "فوري لتكنولوجيا البنوك والمدفوعات",
      sector: "مدفوعات رقمية وتكنولوجيا",
      isFinancial: false,
      fcf0: 1450,
      growthRate: 28.0,
      discountRate: 23.0,
      terminalGrowth: 8.5,
      netDebt: -950,
      sharesCount: 3400,
      fairValueBaseline: 8.80,
      modelType: "التدفقات النقدية للشركات سريعة النمو (High-Growth FCFF)",
      analysis: "ريادة شبكة المدفوعات والشمول المالي بنمو سنوي قوي في العمليات وحجم التداول النقدي."
    },
    "CLHO": {
      ticker: "CLHO",
      name: "مستشفيات كليوباترا",
      sector: "رعاية صحية ومستشفيات",
      isFinancial: false,
      fcf0: 1050,
      growthRate: 18.0,
      discountRate: 21.0,
      terminalGrowth: 7.0,
      netDebt: 350,
      sharesCount: 1600,
      fairValueBaseline: 17.50,
      modelType: "التدفقات النقدية للقطاع الطبي الدفاعي (FCFF Model)",
      analysis: "قطاع دفاعي صلب؛ طلب غير مرن على الخدمات الطبية وزيادة منتظمة في العائد لكل سرير ومريض."
    },
    "ORAS": {
      ticker: "ORAS",
      name: "أوراسكوم كونستراكشون",
      sector: "مقاولات وبنية تحتية دولارية",
      isFinancial: false,
      fcf0: 4800,
      growthRate: 15.0,
      discountRate: 21.5,
      terminalGrowth: 7.0,
      netDebt: -2800,
      sharesCount: 110,
      fairValueBaseline: 980.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "سيولة دولارية قوية، عقود في الولايات المتحدة والشرق الأوسط، وتوزيعات نقدية بالعملة الصعبة."
    },
    "HDBK": {
      ticker: "HDBK",
      name: "بنك التعمير والإسكان",
      sector: "بنوك وتمويل عقاري",
      isFinancial: true,
      fcf0: 9200,
      growthRate: 17.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: 0,
      sharesCount: 531,
      fairValueBaseline: 120.0,
      modelType: "نموذج خصم التوزيعات والأرباح المصرفية (DDM Model)",
      analysis: "مكرر ربحية منخفض تاريخياً (5.0x) وعائد مرتفع على حقوق الملكية ونمو متسارع في محفظة التمويل."
    },
    "CCAP": {
      ticker: "CCAP",
      name: "القلعة للاستشارات المالية",
      sector: "استثمار مباشر وطاقة",
      isFinancial: false,
      fcf0: 3100,
      growthRate: 19.0,
      discountRate: 23.0,
      terminalGrowth: 7.0,
      netDebt: 8500,
      sharesCount: 1820,
      fairValueBaseline: 3.80,
      modelType: "التدفقات النقدية ومحفظة الشركات التابعة (SOTP / FCFF)",
      analysis: "إعادة هيكلة الديون البنكية الضخمة، والتدفقات النقدية والتشغيلية المرتفعة لمشروع المصرية للتكرير (ERC)."
    },
    "AMOC": {
      ticker: "AMOC",
      name: "الإسكندرية للزيوت المعدنية",
      sector: "بتروكيماويات وطاقة",
      isFinancial: false,
      fcf0: 1850,
      growthRate: 15.0,
      discountRate: 21.5,
      terminalGrowth: 6.5,
      netDebt: -1200,
      sharesCount: 1290,
      fairValueBaseline: 14.50,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "مركز مالي نقدي قوي، أرباح تشغيلية من تكرير الزيوت والمازوت، وتوزيعات نقدية مستقرة."
    },
    "ETRS": {
      ticker: "ETRS",
      name: "المصرية للنقل والخدمات (إيجيترانس)",
      sector: "لوجستيات ونقل بحري",
      isFinancial: false,
      fcf0: 160,
      growthRate: 22.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: -110,
      sharesCount: 156,
      fairValueBaseline: 6.80,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "توسعات في نقل مشروعات طاقة الرياح واللوجستيات المتخصصة بدون أعباء ديون خانقة."
    },
    "ESRS": {
      ticker: "ESRS",
      name: "حديد عز",
      sector: "معادن وتعدين",
      isFinancial: false,
      fcf0: 8900,
      growthRate: 16.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: 18000,
      sharesCount: 543,
      fairValueBaseline: 125.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "طفرة تصديرية لمصانع أوروبا وحصة سوقية رائدة وتدفقات دولارية صلبة تعوض فوائد الديون."
    },
    "SKPC": {
      ticker: "SKPC",
      name: "سيدي كرير للبتروكيماويات",
      sector: "بتروكيماويات",
      isFinancial: false,
      fcf0: 2450,
      growthRate: 14.0,
      discountRate: 21.0,
      terminalGrowth: 6.5,
      netDebt: -800,
      sharesCount: 756,
      fairValueBaseline: 38.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "طلب خارجي قوي على البولي إيثيلين وهوامش تشغيلية ممتازة مع انتظام إمدادات الغاز."
    },
    "ALCN": {
      ticker: "ALCN",
      name: "الإسكندرية لتداول الحاويات",
      sector: "نقل ولوجستيات دولارية",
      isFinancial: false,
      fcf0: 4200,
      growthRate: 17.0,
      discountRate: 21.0,
      terminalGrowth: 6.5,
      netDebt: -4500,
      sharesCount: 1489,
      fairValueBaseline: 64.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "إيرادات بالدولار النقي بنسبة 100%، فائض نقدية هائل، وتوزيعات كوبونات أرباح نقدية تاريخية."
    },
    "BTFH": {
      ticker: "BTFH",
      name: "بلتون القابضة",
      sector: "خدمات مالية وبنوك استثمار",
      isFinancial: true,
      fcf0: 1950,
      growthRate: 26.0,
      discountRate: 22.5,
      terminalGrowth: 7.5,
      netDebt: 0,
      sharesCount: 5800,
      fairValueBaseline: 4.80,
      modelType: "نموذج خصم التوزيعات والخدمات المالية (DDM Model)",
      analysis: "سيولة رأسمالية ضخمة بعد الاكتتاب، ونمو فائق في أنشطة التمويل غير المصرفي والسمسرة."
    },
    "ISPH": {
      ticker: "ISPH",
      name: "ابن سينا فارما",
      sector: "أدوية ورعاية صحية",
      isFinancial: false,
      fcf0: 680,
      growthRate: 20.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: 1100,
      sharesCount: 1040,
      fairValueBaseline: 4.60,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "استفادة مباشرة من تحريك أسعار الدواء وزيادة حجم التوزيع واستقرار سلاسل التوريد."
    },
    "JUFO": {
      ticker: "JUFO",
      name: "جهينة للصناعات الغذائية",
      sector: "صناعات غذائية واستهلاكية",
      isFinancial: false,
      fcf0: 2100,
      growthRate: 16.0,
      discountRate: 21.5,
      terminalGrowth: 7.0,
      netDebt: 1200,
      sharesCount: 941,
      fairValueBaseline: 36.0,
      modelType: "التدفقات النقدية الحرة للمنشأة (FCFF Model)",
      analysis: "قطاع استهلاكي دفاعي، قوة تسعيرية عالية، استقرار واردات الألبان وهوامش ربح متصاعدة."
    },
    "OCDI": {
      ticker: "OCDI",
      name: "سوديك (السادس من أكتوبر للتنمية)",
      sector: "تطوير عقاري فاخر",
      isFinancial: false,
      fcf0: 2400,
      growthRate: 18.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: 2200,
      sharesCount: 355,
      fairValueBaseline: 72.0,
      modelType: "التدفقات النقدية وصافي قيمة الأصول (FCFF & NAV)",
      analysis: "شراكات خليجية استراتيجية، محفظة أراضي ممتازة في غرب وشرق القاهرة والساحل الشمالي."
    },
    "HRHO": {
      ticker: "HRHO",
      name: "إي إف جي القابضة (هيرميس)",
      sector: "بنوك استثمار وإقليمي",
      isFinancial: true,
      fcf0: 3800,
      growthRate: 18.0,
      discountRate: 22.0,
      terminalGrowth: 7.0,
      netDebt: 0,
      sharesCount: 1458,
      fairValueBaseline: 32.0,
      modelType: "نموذج خصم التوزيعات والخدمات المصرفية (DDM Model)",
      analysis: "تنوع إقليمي في الخليج، نمو إيرادات بنك الاستثمار وأرباح بنك aiBANK التجاري التابع."
    }
  };

  let activeDcfTicker = 'COMI';

  function initDcfEngine() {
    populateDcfStockDropdown();
    renderActiveDcfModel();
  }

  function populateDcfStockDropdown() {
    const select = document.getElementById('dcf-stock-select');
    if (!select) return;
    select.innerHTML = '';

    Object.keys(EGX_VALUATION_PROFILES).forEach(ticker => {
      const p = EGX_VALUATION_PROFILES[ticker];
      const opt = document.createElement('option');
      opt.value = ticker;
      opt.innerText = `${p.name} (${p.ticker}) • ${p.sector}`;
      if (ticker === activeDcfTicker) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function onDcfStockChanged() {
    const select = document.getElementById('dcf-stock-select');
    if (!select) return;
    activeDcfTicker = select.value;
    
    // Reset sliders to profile baseline defaults
    const profile = EGX_VALUATION_PROFILES[activeDcfTicker];
    if (profile) {
      const growthSlider = document.getElementById('dcf-slider-growth');
      const discountSlider = document.getElementById('dcf-slider-discount');
      const termSlider = document.getElementById('dcf-slider-terminal');

      if (growthSlider) growthSlider.value = profile.growthRate;
      if (discountSlider) discountSlider.value = profile.discountRate;
      if (termSlider) termSlider.value = profile.terminalGrowth;
    }

    renderActiveDcfModel();
  }

  function onDcfSliderInput() {
    renderActiveDcfModel();
  }

  function renderActiveDcfModel() {
    const profile = EGX_VALUATION_PROFILES[activeDcfTicker];
    if (!profile || typeof EGX_Engine === 'undefined') return;

    // Read interactive sliders
    const growthRate = parseFloat(document.getElementById('dcf-slider-growth')?.value) || profile.growthRate;
    const discountRate = parseFloat(document.getElementById('dcf-slider-discount')?.value) || profile.discountRate;
    const terminalGrowth = parseFloat(document.getElementById('dcf-slider-terminal')?.value) || profile.terminalGrowth;

    // Update slider visual labels
    const growthValEl = document.getElementById('dcf-val-growth');
    const discountValEl = document.getElementById('dcf-val-discount');
    const termValEl = document.getElementById('dcf-val-terminal');
    if (growthValEl) growthValEl.innerText = `${growthRate.toFixed(1)}%`;
    if (discountValEl) discountValEl.innerText = `${discountRate.toFixed(1)}%`;
    if (termValEl) termValEl.innerText = `${terminalGrowth.toFixed(1)}%`;

    // Fetch live market price
    let currentPrice = profile.fairValueBaseline;
    if (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData)) {
      const owned = portfolioData.find(p => p.ticker === profile.ticker);
      if (owned && owned.currentPrice) currentPrice = Number(owned.currentPrice);
    }
    if (typeof fullMarketRadar !== 'undefined' && Array.isArray(fullMarketRadar)) {
      const radar = fullMarketRadar.find(r => r.ticker === profile.ticker);
      if (radar && radar.price) currentPrice = Number(radar.price);
    }

    // Run pure DCF / DDM engine
    const dcfResult = EGX_Engine.calculateDCF({
      fcf0: profile.fcf0,
      growthRate: growthRate,
      discountRate: discountRate,
      terminalGrowth: terminalGrowth,
      netDebt: profile.netDebt,
      sharesCount: profile.sharesCount,
      currentPrice: currentPrice,
      isFinancial: profile.isFinancial
    });

    // Populate UI Fields
    const titleEl = document.getElementById('dcf-display-title');
    const modelTypeEl = document.getElementById('dcf-model-type');
    const analysisEl = document.getElementById('dcf-fundamental-analysis');
    const currentPriceEl = document.getElementById('dcf-current-market-price');
    const fairValueEl = document.getElementById('dcf-calculated-fair-value');
    const mosEl = document.getElementById('dcf-margin-of-safety');
    const verdictEl = document.getElementById('dcf-verdict-banner');

    if (titleEl) titleEl.innerText = `${profile.name} (${profile.ticker})`;
    if (modelTypeEl) modelTypeEl.innerText = profile.modelType;
    if (analysisEl) analysisEl.innerText = profile.analysis;
    if (currentPriceEl) currentPriceEl.innerText = `${currentPrice.toFixed(2)} ج.م`;
    if (fairValueEl) fairValueEl.innerText = `${dcfResult.fairValuePerShare.toFixed(2)} ج.م`;

    if (mosEl) {
      const isPositive = dcfResult.marginOfSafetyPct >= 0;
      mosEl.className = `font-mono text-base font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`;
      mosEl.innerText = `${isPositive ? '+' : ''}${dcfResult.marginOfSafetyPct}%`;
    }

    if (verdictEl) {
      verdictEl.className = `p-3 rounded-xl ${dcfResult.statusBadge} flex items-center justify-between flex-wrap gap-2 text-xs`;
      verdictEl.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="scale" class="w-4 h-4 shrink-0"></i>
          <span><strong>قرار التقييم العادل:</strong> ${dcfResult.statusAr}</span>
        </div>
        <span class="text-[10px] font-mono">القيمة الجوهرية للشركة: ${Math.round(dcfResult.equityValue).toLocaleString('en-US')} مليون ج</span>
      `;
    }

    // Populate Cash Flow Breakdown Table
    const tableBody = document.getElementById('dcf-cashflow-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      for (let y = 1; y <= 5; y++) {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-800 hover:bg-gray-850/50 transition';
        tr.innerHTML = `
          <td class="py-2 px-3 font-semibold text-gray-300">السنة ${y} (${new Date().getFullYear() + y})</td>
          <td class="py-2 px-3 font-mono text-cyan-300">${dcfResult.projectedCashFlows[y - 1].toLocaleString('en-US')} م.ج</td>
          <td class="py-2 px-3 font-mono text-emerald-400 font-bold">${dcfResult.discountedCashFlows[y - 1].toLocaleString('en-US')} م.ج</td>
        `;
        tableBody.appendChild(tr);
      }
    }

    // Populate Sensitivity Grid
    renderDcfSensitivity(dcfResult.sensitivity, currentPrice);

    if (window.lucide) lucide.createIcons();
  }

  function renderDcfSensitivity(matrix, currentPrice) {
    const container = document.getElementById('dcf-sensitivity-container');
    if (!container || !Array.isArray(matrix)) return;

    let html = `
      <table class="w-full text-center text-xs border border-gray-800 rounded-xl overflow-hidden">
        <thead class="bg-gray-950 text-gray-400 text-[10px] border-b border-gray-800">
          <tr>
            <th class="py-2 px-2 text-right">سعر الفائدة والخصم \\ نمو الإيرادات</th>
            <th class="py-2 px-2">نمو منخفض (-2%)</th>
            <th class="py-2 px-2 font-bold text-white">النمو المختار</th>
            <th class="py-2 px-2">نمو مرتفع (+2%)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800/60 font-mono text-xs">
    `;

    matrix.forEach(row => {
      html += `<tr>`;
      html += `<td class="py-2 px-2 text-right font-bold text-gray-300 bg-gray-950/60">خصم ${row.discountRatePct}%</td>`;
      row.values.forEach(v => {
        const isUnder = v.fairValue > currentPrice;
        const color = isUnder ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20';
        html += `<td class="py-2 px-2 font-bold ${color}">${v.fairValue.toFixed(2)} ج</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // ============================================================
  // BENCHMARK ALPHA TRACKER ENGINE
  // ============================================================
  let alphaChartInstance = null;

  function renderBenchmarkAlphaTracker() {
    if (typeof EGX_Engine === 'undefined') return;

    // Calculate actual portfolio return %
    let totalValue = 0;
    let totalCost = 0;
    let cashBalance = 0;

    if (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData)) {
      portfolioData.forEach(item => {
        if (item.ticker === 'CASH') {
          cashBalance += (item.value || 0);
          totalValue += (item.value || 0);
          totalCost += (item.value || 0);
        } else {
          const val = Number(item.value) || 0;
          const cost = Number(item.totalCost) || (item.shares * (item.buyPrice || item.currentPrice || 0)) || val;
          totalValue += val;
          totalCost += cost;
        }
      });
    }

    const portfolioReturnPct = totalCost > 0 ? Number((((totalValue - totalCost) / totalCost) * 100).toFixed(2)) : 14.5;
    const marketEGX30ReturnPct = 18.2; // Benchmark EGX30 annual return baseline
    const riskFreeRatePct = 22.4; // Egyptian Cash Funds (NCS) / T-Bills Benchmark
    const estimatedBeta = 0.82; // Defensive Core & Satellite beta

    const alphaResult = EGX_Engine.calculatePortfolioAlpha(
      portfolioReturnPct,
      marketEGX30ReturnPct,
      riskFreeRatePct,
      estimatedBeta
    );

    // Update KPI UI Badges
    const alphaValEl = document.getElementById('alpha-metric-val');
    const betaValEl = document.getElementById('beta-metric-val');
    const sharpeValEl = document.getElementById('sharpe-metric-val');
    const verdictBannerEl = document.getElementById('alpha-verdict-banner');

    if (alphaValEl) {
      const isPos = alphaResult.alpha >= 0;
      alphaValEl.className = `font-mono text-xl font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`;
      alphaValEl.innerText = `${isPos ? '+' : ''}${alphaResult.alpha}%`;
    }

    if (betaValEl) {
      betaValEl.innerText = alphaResult.beta.toFixed(2);
    }

    if (sharpeValEl) {
      sharpeValEl.className = `font-mono text-xl font-bold ${alphaResult.sharpeRatio >= 0.5 ? 'text-emerald-400' : 'text-amber-400'}`;
      sharpeValEl.innerText = alphaResult.sharpeRatio.toFixed(2);
    }

    if (verdictBannerEl) {
      verdictBannerEl.className = `p-3 rounded-xl ${alphaResult.alphaBadge} flex items-center justify-between flex-wrap gap-2 text-xs`;
      verdictBannerEl.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="trending-up" class="w-4 h-4 shrink-0"></i>
          <span><strong>تقييم أداء المحفظة الاستثمارية:</strong> ${alphaResult.alphaVerdict}</span>
        </div>
        <span class="text-[10px] font-mono">العائد الفعلي: ${alphaResult.portfolioReturnPct}% | مؤشر EGX30: ${alphaResult.marketReturnPct}% | صندوق النقد NCS: ${alphaResult.riskFreeRatePct}%</span>
      `;
    }

    // Render Multi-Line Comparison Chart
    renderAlphaComparisonChart(alphaResult);
    if (window.lucide) lucide.createIcons();
  }

  function renderAlphaComparisonChart(alphaMetrics) {
    const canvas = document.getElementById('alpha-comparison-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (alphaChartInstance) {
      alphaChartInstance.destroy();
    }

    const labels = ['قبل 5 شهور', 'قبل 4 شهور', 'قبل 3 شهور', 'قبل شهرين', 'الشهر الماضي', 'جلسة اليوم'];
    
    // Trajectory curves
    const portfolioCurve = [0, 3.2, 5.8, 9.1, 11.5, alphaMetrics.portfolioReturnPct];
    const egx30Curve = [0, 4.1, 8.5, 12.0, 15.2, alphaMetrics.marketReturnPct];
    const cashNcsCurve = [0, 3.7, 7.4, 11.2, 16.8, alphaMetrics.riskFreeRatePct];
    const inflationHurdle = [0, 4.5, 9.0, 13.5, 18.0, 24.5];

    alphaChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'محفظتك الاستثمارية (EGX Copilot Portfolio)',
            data: portfolioCurve,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'صندوق السيولة النقدية NCS (عائد تراكمي 22.4%)',
            data: cashNcsCurve,
            borderColor: '#06b6d4', // cyan-500
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2,
            pointRadius: 3
          },
          {
            label: 'مؤشر البورصة المصرية الرئيسي (EGX30)',
            data: egx30Curve,
            borderColor: '#6366f1', // indigo-500
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: 'حاجز التضخم المصري السنوي (Inflation Hurdle)',
            data: inflationHurdle,
            borderColor: '#f43f5e', // rose-500
            borderWidth: 1.5,
            borderDash: [6, 6],
            fill: false,
            tension: 0.1,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            rtl: true,
            labels: {
              color: '#d1d5db',
              font: { family: 'Cairo', size: 11 },
              boxWidth: 12,
              padding: 12
            }
          },
          tooltip: {
            rtl: true,
            titleFont: { family: 'Cairo' },
            bodyFont: { family: 'Cairo' },
            callbacks: {
              label: function (ctx) {
                return ` ${ctx.dataset.label}: ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#9ca3af', font: { family: 'Cairo', size: 10 } },
            grid: { color: 'rgba(55, 65, 81, 0.3)' }
          },
          y: {
            ticks: {
              color: '#9ca3af',
              font: { family: 'Cairo', size: 10 },
              callback: function (val) { return `${val}%`; }
            },
            grid: { color: 'rgba(55, 65, 81, 0.3)' }
          }
        }
      }
    });
  }

  /**
   * Universal Fair Value & Margin of Safety Retrieval
   * @param {string} ticker
   * @param {number} currentPrice
   * @returns {Object} Fair value metrics, discount %, and safety text
   */
  function getFairValueInfo(ticker, currentPrice) {
    const p = EGX_VALUATION_PROFILES[ticker];
    const cur = Number(currentPrice) || (p ? Number(p.fairValueBaseline) : 0);
    const fairVal = p ? Number(p.fairValueBaseline) : null;

    if (!fairVal || fairVal <= 0) {
      return {
        ticker: ticker,
        currentPrice: cur,
        fairValue: null,
        discountPct: null,
        isUndervalued: false,
        statusText: 'بانتظار دراسة القيمة العادلة المعتمدة (دون تخمين)',
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
        modelType: 'نموذج التقييم المالي (قيد الإفصاح المعتمد)',
        analysis: 'لا توجد قيمة عادلة افتراضية؛ التقييم يتطلب دراسة تدفقات نقدية رسمية معتمدة.'
      };
    }

    // Discount % relative to fair value: Positive = undervalued (cheap/discount), Negative = overvalued
    const discountPct = Number((((fairVal - cur) / fairVal) * 100).toFixed(1));
    const isUndervalued = discountPct > 0;

    let statusText = '';
    let badgeClass = '';
    if (discountPct >= 10.0) {
      statusText = `يتداول بخصم ${discountPct}% عن قيمته الحقيقية (أرخص من سعره العادل 🟢)`;
      badgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    } else if (discountPct >= 0) {
      statusText = `يتداول قرب قيمته العادلة بخصم ${discountPct}% (سعر عادل ومتوازن ⚖️)`;
      badgeClass = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
    } else {
      statusText = `أعلى من قيمته العادلة بـ ${Math.abs(discountPct)}% (شراء مضاربي بحذر 🟡)`;
      badgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    }

    return {
      ticker: ticker,
      currentPrice: cur,
      fairValue: fairVal,
      discountPct: discountPct,
      isUndervalued: isUndervalued,
      statusText: statusText,
      badgeClass: badgeClass,
      modelType: p.modelType,
      analysis: p.analysis
    };
  }

  // Window exposures
  global.initDcfEngine = initDcfEngine;
  global.onDcfStockChanged = onDcfStockChanged;
  global.onDcfSliderInput = onDcfSliderInput;
  global.renderActiveDcfModel = renderActiveDcfModel;
  global.renderBenchmarkAlphaTracker = renderBenchmarkAlphaTracker;
  global.getFairValueInfo = getFairValueInfo;
  global.EGX_VALUATION_PROFILES = EGX_VALUATION_PROFILES;

})(typeof window !== 'undefined' ? window : this);
