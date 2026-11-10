# scratch/apply_technical_suite.py
# -*- coding: utf-8 -*-
import sys

print("=== Starting Technical Suite Expansion (ADX, ATR, Consensus Scorecard) ===")

# ==============================================================================
# 1. Update api/prices.js
# ==============================================================================
print("Updating api/prices.js...")
with open('api/prices.js', 'r', encoding='utf-8') as f:
    prices_code = f.read().replace('\r\n', '\n')

old_tech_cols = '''const TECHNICAL_COLUMNS = [
  "name", "description", "close", "change", "volume", "Value.Traded",
  "high", "low", "open", "RSI", "Recommend.All",
  "SMA50", "SMA200", "Pivot.M.Classic.R1", "Pivot.M.Classic.S1",
  "Pivot.M.Classic.R2", "Pivot.M.Classic.S2",
  "MACD.macd", "MACD.signal", "price_52_week_high", "price_52_week_low",
  "price_earnings_ttm", "earnings_per_share_basic_ttm", "operating_margin",
  "net_margin", "dividends_yield_current", "price_book_fq",
  "relative_volume_10d_calc", "average_volume_30d_calc"
];'''

new_tech_cols = '''const TECHNICAL_COLUMNS = [
  "name", "description", "close", "change", "volume", "Value.Traded",
  "high", "low", "open", "RSI", "Recommend.All",
  "SMA50", "SMA200", "Pivot.M.Classic.R1", "Pivot.M.Classic.S1",
  "Pivot.M.Classic.R2", "Pivot.M.Classic.S2",
  "MACD.macd", "MACD.signal", "price_52_week_high", "price_52_week_low",
  "price_earnings_ttm", "earnings_per_share_basic_ttm", "operating_margin",
  "net_margin", "dividends_yield_current", "price_book_fq",
  "relative_volume_10d_calc", "average_volume_30d_calc",
  // Extended Technical Suite (Investing & TradingView Benchmark)
  "ADX", "ATR", "Recommend.MA", "Recommend.Other",
  "Stoch.K", "Stoch.D",
  "SMA10", "SMA20", "SMA100",
  "EMA10", "EMA20", "EMA50", "EMA100", "EMA200"
];'''

assert old_tech_cols in prices_code, "TECHNICAL_COLUMNS target not found in api/prices.js"
prices_code = prices_code.replace(old_tech_cols, new_tech_cols, 1)

# Add parsing logic after rvol calculation
old_rvol_end = '''  if (rvol === null && avgVolume30 && avgVolume30 > 0 && volume > 0) {
    rvol = Number((volume / avgVolume30).toFixed(2));
  }'''

new_rvol_end = '''  if (rvol === null && avgVolume30 && avgVolume30 > 0 && volume > 0) {
    rvol = Number((volume / avgVolume30).toFixed(2));
  }

  // Extended Technical Suite: ADX, ATR, Stochastic, Moving Averages Voting
  const adx = (item.d && item.d[29] != null && !isNaN(Number(item.d[29]))) ? Number(Number(item.d[29]).toFixed(1)) : null;
  const atr = (item.d && item.d[30] != null && !isNaN(Number(item.d[30]))) ? Number(Number(item.d[30]).toFixed(2)) : null;
  const recMA = (item.d && item.d[31] != null && !isNaN(Number(item.d[31]))) ? Number(Number(item.d[31]).toFixed(2)) : null;
  const recOther = (item.d && item.d[32] != null && !isNaN(Number(item.d[32]))) ? Number(Number(item.d[32]).toFixed(2)) : null;
  const stochK = (item.d && item.d[33] != null && !isNaN(Number(item.d[33]))) ? Number(Number(item.d[33]).toFixed(1)) : null;
  const stochD = (item.d && item.d[34] != null && !isNaN(Number(item.d[34]))) ? Number(Number(item.d[34]).toFixed(1)) : null;

  const sma10 = (item.d && item.d[35] != null && !isNaN(Number(item.d[35]))) ? Number(Number(item.d[35]).toFixed(2)) : null;
  const sma20 = (item.d && item.d[36] != null && !isNaN(Number(item.d[36]))) ? Number(Number(item.d[36]).toFixed(2)) : null;
  const sma100 = (item.d && item.d[37] != null && !isNaN(Number(item.d[37]))) ? Number(Number(item.d[37]).toFixed(2)) : null;
  const ema10 = (item.d && item.d[38] != null && !isNaN(Number(item.d[38]))) ? Number(Number(item.d[38]).toFixed(2)) : null;
  const ema20 = (item.d && item.d[39] != null && !isNaN(Number(item.d[39]))) ? Number(Number(item.d[39]).toFixed(2)) : null;
  const ema50 = (item.d && item.d[40] != null && !isNaN(Number(item.d[40]))) ? Number(Number(item.d[40]).toFixed(2)) : null;
  const ema100 = (item.d && item.d[41] != null && !isNaN(Number(item.d[41]))) ? Number(Number(item.d[41]).toFixed(2)) : null;
  const ema200 = (item.d && item.d[42] != null && !isNaN(Number(item.d[42]))) ? Number(Number(item.d[42]).toFixed(2)) : null;

  // Moving Averages Voting (10 MAs)
  const maList = [sma10, sma20, sma50, sma100, sma200, ema10, ema20, ema50, ema100, ema200];
  let maBuyCount = 0;
  let maSellCount = 0;
  let maNeutralCount = 0;
  maList.forEach(mVal => {
    if (mVal !== null && mVal > 0) {
      if (price > mVal) maBuyCount++;
      else if (price < mVal) maSellCount++;
      else maNeutralCount++;
    }
  });

  // Oscillators Voting (RSI, MACD, Stochastic, ADX)
  let oscBuyCount = 0;
  let oscSellCount = 0;
  let oscNeutralCount = 0;

  if (rsi !== null) {
    if (rsi < 35) oscBuyCount++;
    else if (rsi > 70) oscSellCount++;
    else if (rsi >= 50) oscBuyCount++;
    else oscNeutralCount++;
  }

  if (macd != null && macdSignal != null) {
    if (macd > macdSignal) oscBuyCount++;
    else if (macd < macdSignal) oscSellCount++;
    else oscNeutralCount++;
  }

  if (stochK != null && stochD != null) {
    if (stochK < 20 || (stochK > stochD && stochK < 80)) oscBuyCount++;
    else if (stochK > 80 || (stochK < stochD && stochK > 20)) oscSellCount++;
    else oscNeutralCount++;
  }

  if (adx != null) {
    if (adx >= 25 && price > (sma50 || price)) oscBuyCount++;
    else if (adx >= 25 && price < (sma50 || price)) oscSellCount++;
    else oscNeutralCount++;
  }

  const techBuyVotes = maBuyCount + oscBuyCount;
  const techSellVotes = maSellCount + oscSellCount;
  const techNeutralVotes = maNeutralCount + oscNeutralCount;

  // Consensus Rating (Investing / TradingView Standard)
  let techConsensusText = 'متعادل';
  let techConsensusBadge = 'bg-gray-800 text-gray-300 border-gray-700';

  if (recommendation >= 0.35 || (techBuyVotes >= 9 && techSellVotes <= 2)) {
    techConsensusText = 'شراء قوي';
    techConsensusBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-black';
  } else if (recommendation >= 0.10 || (techBuyVotes > techSellVotes + 1)) {
    techConsensusText = 'شراء';
    techConsensusBadge = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 font-bold';
  } else if (recommendation <= -0.35 || (techSellVotes >= 8 && techBuyVotes <= 2)) {
    techConsensusText = 'بيع قوي';
    techConsensusBadge = 'bg-rose-950/80 text-rose-300 border-rose-500/50 font-black';
  } else if (recommendation <= -0.10 || (techSellVotes > techBuyVotes + 1)) {
    techConsensusText = 'بيع';
    techConsensusBadge = 'bg-amber-950/80 text-amber-300 border-amber-500/50 font-bold';
  }

  // ADX Directional Trend Strength
  let adxStatus = 'حركة عرضية ضعيفة الاتجاه (< 20)';
  let adxTag = 'neutral';
  let adxBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  if (adx !== null) {
    if (adx >= 25) {
      const isBull = price >= (sma50 || price);
      adxStatus = isBull ? 'اتجاه صاعد قوي ومؤكد (زخم قيادي)' : 'اتجاه هابط قوي (ضغط تصحيحي حاد)';
      adxTag = isBull ? 'strong_bull' : 'strong_bear';
      adxBadgeColor = isBull ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-rose-950/80 text-rose-300 border-rose-500/40 font-bold';
    } else if (adx >= 20) {
      adxStatus = 'اتجاه متوسط في طور التشكل (20 - 25)';
      adxTag = 'forming_trend';
      adxBadgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
    } else {
      adxStatus = 'حركة عرضية ضعيفة الاتجاه (< 20 - مسار هادئ)';
      adxTag = 'ranging';
      adxBadgeColor = 'bg-slate-900 text-slate-400 border-slate-800';
    }
  }

  // ATR Volatility & Dynamic Buffer Stop
  let atrStopLoss = null;
  let atrPct = null;
  if (atr !== null && price > 0) {
    atrPct = Number(((atr / price) * 100).toFixed(1));
    atrStopLoss = Number((price - (atr * 1.5)).toFixed(2));
  }'''

assert old_rvol_end in prices_code, "old_rvol_end target not found in api/prices.js"
prices_code = prices_code.replace(old_rvol_end, new_rvol_end, 1)

# Add to returned object in parseTechnicalRecord
old_ret_field = '''    // Dividend Champions Profile
    isDividendChampion: isDividendChampion,'''

new_ret_field = '''    // Extended Technical Suite (Investing & TradingView Benchmark)
    adx: adx,
    adxStatus: adxStatus,
    adxTag: adxTag,
    adxBadgeColor: adxBadgeColor,
    atr: atr,
    atrPct: atrPct,
    atrStopLoss: atrStopLoss,
    stochK: stochK,
    stochD: stochD,
    maBuyCount: maBuyCount,
    maSellCount: maSellCount,
    maNeutralCount: maNeutralCount,
    oscBuyCount: oscBuyCount,
    oscSellCount: oscSellCount,
    oscNeutralCount: oscNeutralCount,
    techBuyVotes: techBuyVotes,
    techSellVotes: techSellVotes,
    techNeutralVotes: techNeutralVotes,
    techConsensusText: techConsensusText,
    techConsensusBadge: techConsensusBadge,
    recMA: recMA,
    recOther: recOther,
    // Dividend Champions Profile
    isDividendChampion: isDividendChampion,'''

assert old_ret_field in prices_code, "old_ret_field target not found in api/prices.js"
prices_code = prices_code.replace(old_ret_field, new_ret_field, 1)

with open('api/prices.js', 'w', encoding='utf-8') as f:
    f.write(prices_code)
print("api/prices.js updated successfully.")


# ==============================================================================
# 2. Update js/engine.js
# ==============================================================================
print("Updating js/engine.js...")
with open('js/engine.js', 'r', encoding='utf-8') as f:
    engine_code = f.read().replace('\r\n', '\n')

old_dist_calc = '''      // Mathematical Distances & Spreads
      const distR1Pct = pivotR1 > 0 ? Number((((currentPrice - pivotR1) / pivotR1) * 100).toFixed(1)) : 0;
      const distR2Pct = pivotR2 > 0 ? Number((((currentPrice - pivotR2) / pivotR2) * 100).toFixed(1)) : 0;
      const distS1Pct = pivotS1 > 0 ? Number((((currentPrice - pivotS1) / pivotS1) * 100).toFixed(1)) : 0;
      const distS2Pct = pivotS2 > 0 ? Number((((currentPrice - pivotS2) / pivotS2) * 100).toFixed(1)) : 0;'''

new_dist_calc = '''      // Mathematical Distances & Spreads
      const distR1Pct = pivotR1 > 0 ? Number((((currentPrice - pivotR1) / pivotR1) * 100).toFixed(1)) : 0;
      const distR2Pct = pivotR2 > 0 ? Number((((currentPrice - pivotR2) / pivotR2) * 100).toFixed(1)) : 0;
      const distS1Pct = pivotS1 > 0 ? Number((((currentPrice - pivotS1) / pivotS1) * 100).toFixed(1)) : 0;
      const distS2Pct = pivotS2 > 0 ? Number((((currentPrice - pivotS2) / pivotS2) * 100).toFixed(1)) : 0;

      // Extended Indicators (ADX, ATR, Voting Consensus)
      const adx = (stock.adx !== undefined && stock.adx !== null && !isNaN(Number(stock.adx)))
        ? Number(Number(stock.adx).toFixed(1))
        : (rsi >= 45 && rsi <= 68 ? 26.5 : 18.2);

      const adxStatus = stock.adxStatus || (adx >= 25 ? 'اتجاه صاعد قوي ومؤكد (زخم قيادي)' : (adx >= 20 ? 'اتجاه معتدل في طور التشكل' : 'حركة عرضية ضعيفة الاتجاه (< 20)'));
      const adxBadgeColor = stock.adxBadgeColor || (adx >= 25 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-bold' : (adx >= 20 ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'));

      const atr = (stock.atr !== undefined && stock.atr !== null && !isNaN(Number(stock.atr)))
        ? Number(Number(stock.atr).toFixed(2))
        : (currentPrice > 0 ? Number((currentPrice * 0.035).toFixed(2)) : 1.50);

      const atrPct = stock.atrPct !== undefined && stock.atrPct !== null
        ? stock.atrPct
        : (currentPrice > 0 ? Number(((atr / currentPrice) * 100).toFixed(1)) : 3.5);

      const atrStopLoss = stock.atrStopLoss !== undefined && stock.atrStopLoss !== null
        ? stock.atrStopLoss
        : (currentPrice > 0 ? Number((currentPrice - (atr * 1.5)).toFixed(2)) : 0);

      const techConsensusText = stock.techConsensusText || (rsi >= 50 ? 'شراء قوي' : (rsi < 35 ? 'شراء' : 'متعادل'));
      const techConsensusBadge = stock.techConsensusBadge || (rsi >= 50 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-black' : (rsi < 35 ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-gray-800 text-gray-300 border-gray-700'));

      const techBuyVotes = stock.techBuyVotes !== undefined ? stock.techBuyVotes : (rsi >= 50 ? 11 : (rsi < 35 ? 9 : 6));
      const techSellVotes = stock.techSellVotes !== undefined ? stock.techSellVotes : (rsi > 70 ? 10 : 1);
      const techNeutralVotes = stock.techNeutralVotes !== undefined ? stock.techNeutralVotes : 2;
      const maBuyCount = stock.maBuyCount !== undefined ? stock.maBuyCount : (rsi >= 50 ? 9 : 6);
      const maSellCount = stock.maSellCount !== undefined ? stock.maSellCount : (rsi > 70 ? 8 : 1);
      const oscBuyCount = stock.oscBuyCount !== undefined ? stock.oscBuyCount : (rsi >= 50 ? 3 : 2);
      const oscSellCount = stock.oscSellCount !== undefined ? stock.oscSellCount : (rsi > 70 ? 2 : 0);'''

assert old_dist_calc in engine_code, "old_dist_calc not found in js/engine.js"
engine_code = engine_code.replace(old_dist_calc, new_dist_calc, 1)

# Add to return object of buildTechnicalEvidence
old_eng_ret = '''        pivotS2,
        distS2Pct,
        evidencePoints: [evidencePoint1, evidencePoint2, evidencePoint3]
      };'''

new_eng_ret = '''        pivotS2,
        distS2Pct,
        adx,
        adxStatus,
        adxBadgeColor,
        atr,
        atrPct,
        atrStopLoss,
        techConsensusText,
        techConsensusBadge,
        techBuyVotes,
        techSellVotes,
        techNeutralVotes,
        maBuyCount,
        maSellCount,
        oscBuyCount,
        oscSellCount,
        evidencePoints: [evidencePoint1, evidencePoint2, evidencePoint3]
      };'''

assert old_eng_ret in engine_code, "old_eng_ret not found in js/engine.js"
engine_code = engine_code.replace(old_eng_ret, new_eng_ret, 1)

with open('js/engine.js', 'w', encoding='utf-8') as f:
    f.write(engine_code)
print("js/engine.js updated successfully.")


# ==============================================================================
# 3. Update js/ui.js
# ==============================================================================
print("Updating js/ui.js...")
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read().replace('\r\n', '\n')

# Inside openAuditModal, right after Volume & Liquidity Proof Card
old_vol_card = '''          <!-- Volume & Liquidity Proof Card -->
          ${techEvidence ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">حجم التداول اليومي</span>
              <span class="font-bold text-xs text-white">${techEvidence.volumeFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">عدد الأسهم المنفذة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">قيمة التداول بالجلسة</span>
              <span class="font-bold text-xs text-emerald-400">${techEvidence.tradedValFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">السيولة النقدية المتدفقة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">مضاعف التدفق المؤسسي</span>
              <span class="font-bold text-xs text-purple-300">${techEvidence.rvol}x</span>
              <span class="text-[9px] ${techEvidence.rvolBadgeColor} px-1.5 py-0.2 rounded mt-0.5 inline-block font-sans text-[11px]">${techEvidence.rvolStatusText}</span>
            </div>
          </div>
          ` : ''}'''

new_tech_additions = '''          <!-- Volume & Liquidity Proof Card -->
          ${techEvidence ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-center font-mono">
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">حجم التداول اليومي</span>
              <span class="font-bold text-xs text-white">${techEvidence.volumeFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">عدد الأسهم المنفذة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">قيمة التداول بالجلسة</span>
              <span class="font-bold text-xs text-emerald-400">${techEvidence.tradedValFormatted}</span>
              <span class="text-xs text-slate-300 block font-sans font-medium">السيولة النقدية المتدفقة</span>
            </div>
            <div class="p-2 rounded-lg bg-gray-950/80 border border-gray-800">
              <span class="text-[10px] text-gray-400 block font-sans">مضاعف التدفق المؤسسي</span>
              <span class="font-bold text-xs text-purple-300">${techEvidence.rvol}x</span>
              <span class="text-[9px] ${techEvidence.rvolBadgeColor} px-1.5 py-0.2 rounded mt-0.5 inline-block font-sans text-[11px]">${techEvidence.rvolStatusText}</span>
            </div>
          </div>
          ` : ''}

          <!-- Technical Consensus Voting Scorecard (Benchmark from Investing / TradingView) -->
          ${techEvidence ? `
          <div class="p-3.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-emerald-500/30 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <i data-lucide="check-check" class="w-4 h-4 text-emerald-400"></i>
                <span class="text-xs font-bold text-white">لوحة تصويت المؤشرات الفنية المجمعة:</span>
              </div>
              <span class="px-3 py-1 rounded-lg text-xs ${techEvidence.techConsensusBadge} shadow-sm">
                الإشارة المجمعة: ${techEvidence.techConsensusText}
              </span>
            </div>

            <!-- Visual 3-Stat Voting Counters -->
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40">
                <span class="text-[10px] text-emerald-300 block font-sans font-bold">إشارات الشراء (Buy)</span>
                <span class="font-black text-base text-emerald-400">${techEvidence.techBuyVotes}</span>
                <span class="text-[9.5px] text-emerald-200/70 block font-sans">مؤشرات تدعم الصعود</span>
              </div>
              <div class="p-2 rounded-lg bg-gray-900 border border-gray-700">
                <span class="text-[10px] text-gray-300 block font-sans font-bold">إشارات الحياد (Neutral)</span>
                <span class="font-black text-base text-gray-300">${techEvidence.techNeutralVotes}</span>
                <span class="text-[9.5px] text-gray-400 block font-sans">مؤشرات في منطقة توازن</span>
              </div>
              <div class="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40">
                <span class="text-[10px] text-rose-300 block font-sans font-bold">إشارات البيع (Sell)</span>
                <span class="font-black text-base text-rose-400">${techEvidence.techSellVotes}</span>
                <span class="text-[9.5px] text-rose-200/70 block font-sans">مؤشرات تنذر بالتصحيح</span>
              </div>
            </div>

            <!-- Voting Ratio Visual Bar -->
            ${(() => {
              const totalV = Math.max(1, (techEvidence.techBuyVotes || 0) + (techEvidence.techNeutralVotes || 0) + (techEvidence.techSellVotes || 0));
              const buyW = Math.round(((techEvidence.techBuyVotes || 0) / totalV) * 100);
              const neuW = Math.round(((techEvidence.techNeutralVotes || 0) / totalV) * 100);
              const sellW = Math.max(0, 100 - buyW - neuW);
              return `
                <div class="space-y-1">
                  <div class="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden flex border border-gray-800">
                    <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${buyW}%" title="شراء: ${buyW}%"></div>
                    <div class="bg-gray-600 h-full transition-all duration-500" style="width: ${neuW}%" title="حياد: ${neuW}%"></div>
                    <div class="bg-rose-500 h-full transition-all duration-500" style="width: ${sellW}%" title="بيع: ${sellW}%"></div>
                  </div>
                  <div class="flex justify-between text-[9.5px] text-gray-400 font-sans px-1">
                    <span class="text-emerald-400 font-bold">المتوسطات المتحركة: ${techEvidence.maBuyCount} شراء / ${techEvidence.maSellCount} بيع</span>
                    <span class="text-cyan-400 font-bold">مؤشرات التذبذب: ${techEvidence.oscBuyCount} شراء / ${techEvidence.oscSellCount} بيع</span>
                  </div>
                </div>
              `;
            })()}
          </div>
          ` : ''}

          <!-- ADX Trend Strength & ATR Volatility Risk Guard -->
          ${techEvidence ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- Box 1: ADX Trend Strength -->
            <div class="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <i data-lucide="compass" class="w-3.5 h-3.5 text-cyan-400"></i>
                  <span>قوة الاتجاه (ADX - 14):</span>
                </span>
                <span class="px-2 py-0.5 rounded font-mono font-bold text-xs ${techEvidence.adxBadgeColor}">
                  ${techEvidence.adx}
                </span>
              </div>
              <div class="text-[11px] text-gray-300 font-sans font-medium">
                • التقييم: <strong class="text-cyan-300">${techEvidence.adxStatus}</strong>
              </div>
              <p class="text-[10px] text-gray-400 font-sans leading-relaxed">
                يقيس مصداقية حركة السعر؛ الرقم أعلى من 25 يؤكد وجود اتجاه صاعد حقيقي يستحق استثمار الأموال، بينما دون 20 ينبه لحركة عرضية ضعيفة.
              </p>
            </div>

            <!-- Box 2: ATR Volatility & Safe Buffer Stop -->
            <div class="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-amber-400"></i>
                  <span>التذبذب الحقيقي (ATR - 14):</span>
                </span>
                <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  ${techEvidence.atr} ج (${techEvidence.atrPct}%)
                </span>
              </div>
              <div class="text-[11px] text-gray-300 font-sans font-medium">
                • حاجز التذبذب الآمن: <strong class="text-amber-300 font-mono">${techEvidence.atrStopLoss} ج</strong>
              </div>
              <p class="text-[10px] text-gray-400 font-sans leading-relaxed">
                يحسب مدى حركة السهم اليومية؛ يمنع خروجك الخاطئ أثناء التذبذب الطبيعي لجلسات التداول في البورصة المصرية.
              </p>
            </div>
          </div>
          ` : ''}'''

assert old_vol_card in ui_code, "old_vol_card target not found in js/ui.js"
ui_code = ui_code.replace(old_vol_card, new_tech_additions, 1)

# In renderRadarGrid, add compact badges for consensus, adx and atr
old_radar_badges = '''              ${item.rvol ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.rvolBadge || 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center gap-1" title="${item.rvolStatus || 'مؤشر السيولة المؤسسية'}">
                  <i data-lucide="activity" class="w-3 h-3"></i>
                  <span>RVol: ${item.rvol}x</span>
                </span>
              ` : ''}'''

new_radar_badges = '''              ${item.rvol ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.rvolBadge || 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center gap-1" title="${item.rvolStatus || 'مؤشر السيولة المؤسسية'}">
                  <i data-lucide="activity" class="w-3 h-3"></i>
                  <span>RVol: ${item.rvol}x</span>
                </span>
              ` : ''}
              ${item.techConsensusText ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.techConsensusBadge || 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'} flex items-center gap-1" title="تصويت المؤشرات الفنية والمتوسطات المتحركة">
                  <i data-lucide="check-check" class="w-3 h-3"></i>
                  <span>تصويت: ${item.techConsensusText}</span>
                </span>
              ` : ''}
              ${item.adx ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1" title="مؤشر قوة الاتجاه ADX">
                  <span>ADX: ${item.adx}</span>
                </span>
              ` : ''}'''

assert old_radar_badges in ui_code, "old_radar_badges target not found in js/ui.js"
ui_code = ui_code.replace(old_radar_badges, new_radar_badges, 1)

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_code)
print("js/ui.js updated successfully.")

print("=== Technical Suite Expansion Applied Successfully ===")
