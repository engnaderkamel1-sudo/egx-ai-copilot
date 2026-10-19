/**
 * EGX AI Copilot - State Management & Utilities (js/state.js)
 * Global state variables, Latin digits observer, Cairo time & formatting utilities.
 */

    // ============================================================
    // Strict General Rule: All Numbers in English (0-9) - No Eastern Arabic Digits
    // ============================================================
    function toEnDigits(str) {
      if (str === null || str === undefined) return '';
      const arabicDigits = ['Ù ', 'Ù¡', 'Ù¢', 'Ù£', 'Ù¤', 'Ù¥', 'Ù¦', 'Ù§', 'Ù¨', 'Ù©'];
      return String(str).replace(/[Ù -Ù©]/g, d => arabicDigits.indexOf(d));
    }

    function formatNum(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return toEnDigits(Number(num).toLocaleString('en-US'));
    }

    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function getCairoParts(date = new Date()) {
      const d = date instanceof Date ? date : new Date(date);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'short'
      });
      const parts = formatter.formatToParts(d);
      const map = {};
      parts.forEach(p => map[p.type] = p.value);
      return map;
    }

    function isCairoSessionOpen(date = new Date()) {
      const parts = getCairoParts(date);
      const isTradingDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(parts.weekday);
      const hour = parseInt(parts.hour, 10);
      const minute = parseInt(parts.minute, 10);
      const timeInMinutes = hour * 60 + minute;
      return isTradingDay && (timeInMinutes >= 600 && timeInMinutes <= 870); // 10:00 AM to 02:30 PM Cairo
    }

    function formatCairoDateOnly(date = new Date()) {
      const parts = getCairoParts(date);
      const day = parts.day;
      const monthIdx = parseInt(parts.month, 10) - 1;
      const monthName = MONTHS_SHORT[monthIdx] || 'Oct';
      return `${day} ${monthName}`;
    }

    function formatCairoTime(date = new Date(), includeSeconds = false, timeOnly = false) {
      const d = date instanceof Date ? date : new Date(date);
      const timeStr = d.toLocaleTimeString('ar-EG-u-nu-latn', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        second: includeSeconds ? '2-digit' : undefined,
        numberingSystem: 'latn'
      });
      if (timeOnly) return toEnDigits(timeStr);
      const dateStr = formatCairoDateOnly(d);
      return toEnDigits(`${timeStr} (${dateStr})`);
    }

    function formatDateTimeDisplay(str) {
      if (!str || str === 'Ø¬Ù„Ø³Ø© Ø§Ù„ÙŠÙˆÙ…' || str === 'Ø¬Ù„Ø³Ø© Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„ÙŠÙˆÙ…') return str || 'Ø¬Ù„Ø³Ø© Ø§Ù„ÙŠÙˆÙ…';
      let s = toEnDigits(String(str)).trim();
      s = s.replace(/^Ø§Ù„Ø³Ø§Ø¹Ø©\s+/, '');
      s = s.replace(/\(?(\d{1,2})\/(\d{1,2})\)?/g, (match, p1, p2) => {
        let d = parseInt(p2, 10);
        let m = parseInt(p1, 10) - 1;
        if (parseInt(p1, 10) > 12) {
          d = parseInt(p1, 10);
          m = parseInt(p2, 10) - 1;
        }
        const mName = MONTHS_SHORT[m] || 'Oct';
        return `(${d} ${mName})`;
      });
      s = s.replace(/\(\(([^\)]+)\)\)/g, '($1)');
      return s;
    }

    function formatDecisionTimeString(str) {
      const formatted = formatDateTimeDisplay(str);
      if (!formatted || formatted === 'Ø¬Ù„Ø³Ø© Ø§Ù„ÙŠÙˆÙ…' || formatted === 'Ø¬Ù„Ø³Ø© Ø§Ù„Ø¨ÙˆØ±ØµØ© Ø§Ù„ÙŠÙˆÙ…') {
        return 'Ø¬Ù„Ø³Ø© Ø§Ù„ÙŠÙˆÙ…';
      }
      return `Ø§Ù„Ø³Ø§Ø¹Ø© ${formatted}`;
    }

    function enforceEnglishNumbers(root = document.body) {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (/[Ù -Ù©]/.test(node.nodeValue)) {
          node.nodeValue = toEnDigits(node.nodeValue);
        }
      }
    }

    // Auto-intercept any dynamic Arabic numerals across the entire DOM
    if (typeof MutationObserver !== 'undefined') {
      const englishDigitsObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                if (/[Ù -Ù©]/.test(node.nodeValue)) {
                  node.nodeValue = toEnDigits(node.nodeValue);
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                enforceEnglishNumbers(node);
              }
            });
          } else if (mutation.type === 'characterData') {
            if (/[Ù -Ù©]/.test(mutation.target.nodeValue)) {
              mutation.target.nodeValue = toEnDigits(mutation.target.nodeValue);
            }
          }
        });
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          enforceEnglishNumbers(document.body);
          englishDigitsObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
      } else {
        enforceEnglishNumbers(document.body);
        englishDigitsObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
    }

    // Pure Single Source of Truth: Delegated to EGX_Portfolio (js/portfolio.js)
    const defaultPortfolioData = (typeof EGX_Portfolio !== 'undefined')
      ? EGX_Portfolio.getDefaultData()
      : [];

    // Comprehensive EGX Market Universe (18 Active Stocks)
    let fullMarketRadar = [
      {
        ticker: 'COMI',
        name: 'Ø§Ù„Ø¨Ù†Ùƒ Ø§Ù„ØªØ¬Ø§Ø±ÙŠ Ø§Ù„Ø¯ÙˆÙ„ÙŠ',
        index: 'egx30',
        sector: 'Ø¨Ù†ÙˆÙƒ ÙˆØ®Ø¯Ù…Ø§Øª Ù…Ø§Ù„ÙŠØ©',
        price: 79.20,
        high: 80.50,
        low: 78.10,
        close: 79.20,
        changePct: '+0.85%',
        volumeMultiplier: '1.4x',
        catalyst: 'Ø¥Ø¹Ù„Ø§Ù† Ù†ØªØ§Ø¦Ø¬ Ø£Ø¹Ù…Ø§Ù„ Ø±Ø¨Ø¹ Ø³Ù†ÙˆÙŠØ© Ù‚ÙŠØ§Ø³ÙŠØ© ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª Ù†Ù‚Ø¯ÙŠØ© Ù‚ÙˆÙŠØ©',
        type: 'Ø³Ù‡Ù… Ù‚ÙŠØ§Ø¯ÙŠ â€¢ ØªØ¬Ù…ÙŠØ¹ Ø¹Ù†Ø¯ Ø§Ù„ØªØµØ­ÙŠØ­',
        score: 95,
        support: '77.80 Ø¬',
        target1: '88.00 Ø¬',
        target2: '94.00 Ø¬',
        stopLoss: '75.50 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø± (ØªØ¯Ø§ÙˆÙ„ Ø¹Ø´Ø±Ø§Øª Ø§Ù„Ù…Ù„Ø§ÙŠÙŠÙ†)',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'SWDY',
        name: 'Ø§Ù„Ø³ÙˆÙŠØ¯ÙŠ Ø¥Ù„ÙŠÙƒØªØ±ÙŠÙƒ',
        index: 'egx30',
        sector: 'Ø·Ø§Ù‚Ø© ÙˆØµÙ†Ø§Ø¹Ø©',
        price: 51.40,
        high: 52.20,
        low: 50.00,
        close: 51.40,
        changePct: '+2.10%',
        volumeMultiplier: '2.1x',
        catalyst: 'Ø¹Ù‚ÙˆØ¯ ØªÙˆØ±ÙŠØ¯ ÙƒØ§Ø¨Ù„Ø§Øª Ø¶Ø®Ù…Ø© ÙˆÙ…Ø´Ø±ÙˆØ¹Ø§Øª Ø±Ø¨Ø· ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠ Ø®Ù„ÙŠØ¬ÙŠ',
        type: 'Ø·Ø§Ù‚Ø© ÙˆØªØµØ¯ÙŠØ± â€¢ Ø§ØªØ¬Ø§Ù‡ ØµØ§Ø¹Ø¯ Ù‚ÙˆÙŠ',
        score: 94,
        support: '48.50 Ø¬',
        target1: '58.00 Ø¬',
        target2: '65.00 Ø¬',
        stopLoss: '46.80 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx30', 'low_risk']
      },
      {
        ticker: 'AMOC',
        name: 'Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ© Ù„Ù„Ø²ÙŠÙˆØª Ø§Ù„Ù…Ø¹Ø¯Ù†ÙŠØ©',
        index: 'egx70',
        sector: 'Ø¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª ÙˆØ·Ø§Ù‚Ø©',
        price: 10.85,
        high: 11.20,
        low: 10.40,
        close: 10.85,
        changePct: '+4.32%',
        volumeMultiplier: '3.4x',
        catalyst: 'Ø¯Ø®ÙˆÙ„ Ø³ÙŠÙˆÙ„Ø© Ù…Ø¤Ø³Ø³Ø§ØªÙŠØ© ØºÙŠØ± Ù…Ø¹ØªØ§Ø¯Ø© ÙˆØªÙˆÙ‚Ø¹Ø§Øª Ø¹ÙˆØ§Ø¦Ø¯ ØªØµØ¯ÙŠØ±ÙŠØ© Ù…Ø¬Ø²ÙŠØ©',
        type: 'Ø·ÙØ±Ø© EGX70 ÙˆØ§Ø¹Ø¯Ø© â€¢ ÙÙˆÙ„ÙŠÙˆÙ… Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠ',
        score: 92,
        support: '9.80 Ø¬',
        target1: '12.40 Ø¬',
        target2: '14.00 Ø¬',
        stopLoss: '9.30 Ø¬',
        liquidityStatus: 'Ø¹Ø§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹ ÙˆÙ†Ø´Ø·Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'ETRS',
        name: 'Ø§Ù„Ù…ØµØ±ÙŠØ© Ù„Ù„Ù†Ù‚Ù„ ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª (Ø¥ÙŠØ¬ÙŠØªØ±Ø§Ù†Ø³)',
        index: 'egx70',
        sector: 'Ù„ÙˆØ¬Ø³ØªÙŠØ§Øª ÙˆÙ†Ù‚Ù„ Ø¨Ø­Ø±ÙŠ',
        price: 4.65,
        high: 4.80,
        low: 4.35,
        close: 4.65,
        changePct: '+5.68%',
        volumeMultiplier: '4.1x',
        catalyst: 'Ø§Ø³ØªØ­ÙˆØ§Ø°Ø§Øª Ù„ÙˆØ¬Ø³ØªÙŠØ© ÙˆØªÙˆØ³Ø¹Ø§Øª Ù†Ù‚Ù„ ØªÙˆØ±Ø¨ÙŠÙ†Ø§Øª Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ÙŠØ§Ø­',
        type: 'Ø·ÙØ±Ø© ØµØ§Ø¹Ø¯Ø© â€¢ ÙƒØ³Ø± Ù‚Ù…Ø© Ø³Ø§Ø¨Ù‚Ø©',
        score: 90,
        support: '4.15 Ø¬',
        target1: '5.50 Ø¬',
        target2: '6.20 Ø¬',
        stopLoss: '3.90 Ø¬',
        liquidityStatus: 'Ù†Ø´Ø·Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'FWRY',
        name: 'ÙÙˆØ±ÙŠ Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª',
        index: 'egx30',
        sector: 'ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ù…Ø§Ù„ÙŠØ©',
        price: 7.85,
        high: 8.00,
        low: 7.65,
        close: 7.85,
        changePct: '+1.42%',
        volumeMultiplier: '1.8x',
        catalyst: 'Ù†Ù…Ùˆ Ù…ØªØ³Ø§Ø±Ø¹ ÙÙŠ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØªÙ…ÙˆÙŠÙ„ Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§ÙƒÙŠ ÙˆØ§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ©',
        type: 'Ø³Ù‡Ù… ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ù‚ÙŠØ§Ø¯ÙŠ â€¢ Ù‚Ø§Ø¹Ø¯Ø© Ø³Ø¹Ø±ÙŠØ© Ù‚ÙˆÙŠØ©',
        score: 89,
        support: '7.30 Ø¬',
        target1: '9.00 Ø¬',
        target2: '10.50 Ø¬',
        stopLoss: '7.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['egx30', 'low_risk']
      },
      {
        ticker: 'MFPC',
        name: 'Ù…ØµØ± Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø£Ø³Ù…Ø¯Ø© (Ù…ÙˆØ¨ÙƒÙˆ)',
        index: 'egx30',
        sector: 'Ø£Ø³Ù…Ø¯Ø© ÙˆØ¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª',
        price: 46.20,
        high: 47.00,
        low: 44.80,
        close: 46.20,
        changePct: '+2.80%',
        volumeMultiplier: '2.5x',
        catalyst: 'Ø¥ÙŠØ±Ø§Ø¯Ø§Øª Ø¯ÙˆÙ„Ø§Ø±ÙŠØ© Ù†Ù‚ÙŠØ© ÙˆÙ‡ÙˆØ§Ù…Ø´ Ø±Ø¨Ø­ÙŠØ© Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© Ù…Ù† ØªØµØ¯ÙŠØ± Ø§Ù„ÙŠÙˆØ±ÙŠØ§',
        type: 'Ø¹Ù…Ù„Ø§Ù‚ Ø£Ø³Ù…Ø¯Ø© Ø¯ÙˆÙ„Ø§Ø±ÙŠ â€¢ Ø§Ø³ØªØ«Ù…Ø§Ø± Ø¢Ù…Ù†',
        score: 93,
        support: '43.00 Ø¬',
        target1: '54.00 Ø¬',
        target2: '60.00 Ø¬',
        stopLoss: '41.50 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30', 'volume_surge']
      },
      {
        ticker: 'TMGH',
        name: 'Ù…Ø¬Ù…ÙˆØ¹Ø© Ø·Ù„Ø¹Øª Ù…ØµØ·ÙÙ‰ Ø§Ù„Ù‚Ø§Ø¨Ø¶Ø©',
        index: 'egx30',
        sector: 'ØªØ·ÙˆÙŠØ± Ø¹Ù‚Ø§Ø±ÙŠ ÙˆÙÙ†Ø¯Ù‚ÙŠ',
        price: 54.00,
        high: 55.20,
        low: 52.80,
        close: 54.00,
        changePct: '+0.95%',
        volumeMultiplier: '1.2x',
        catalyst: 'Ù…Ø¨ÙŠØ¹Ø§Øª ØªØ§Ø±ÙŠØ®ÙŠØ© ÙÙŠ Ø±Ø£Ø³ Ø§Ù„Ø­ÙƒÙ…Ø© ÙˆÙ…Ø´Ø±ÙˆØ¹ Ø³Ø§ÙˆØ« Ù…ÙŠØ¯ ÙˆØ¹ÙˆØ§Ø¦Ø¯ ÙÙ†Ø¯Ù‚ÙŠØ© Ø¯ÙˆÙ„Ø§Ø±ÙŠØ©',
        type: 'Ø³Ù‡Ù… Ø¹Ù‚Ø§Ø±ÙŠ Ù‚ÙŠØ§Ø¯ÙŠ â€¢ Ø§Ø³ØªØ«Ù…Ø§Ø± Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠ',
        score: 88,
        support: '50.00 Ø¬',
        target1: '64.00 Ø¬',
        target2: '72.00 Ø¬',
        stopLoss: '48.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['egx30', 'low_risk']
      },
      {
        ticker: 'ESRS',
        name: 'Ø­Ø¯ÙŠØ¯ Ø¹Ø²',
        index: 'egx30',
        sector: 'Ù…Ø¹Ø§Ø¯Ù† ÙˆØªØ¹Ø¯ÙŠÙ†',
        price: 94.50,
        high: 96.00,
        low: 92.50,
        close: 94.50,
        changePct: '+3.10%',
        volumeMultiplier: '2.3x',
        catalyst: 'Ø·ÙØ±Ø© ØªØµØ¯ÙŠØ±ÙŠØ© Ù„Ù…ØµØ§Ù†Ø¹ Ø£ÙˆØ±ÙˆØ¨Ø§ Ù…Ø¹ Ø§Ø³ØªÙØ§Ø¯Ø© ÙƒØ§Ù…Ù„Ø© Ù…Ù† Ø®ÙØ¶ Ø§Ù„Ø¬Ù†ÙŠÙ‡',
        type: 'Ø³Ù‡Ù… ØªØµØ¯ÙŠØ± Ø«Ù‚ÙŠÙ„ â€¢ Ø§Ø®ØªØ±Ø§Ù‚ Ù…Ø³ØªÙˆÙŠØ§Øª Ù…Ù‚Ø§ÙˆÙ…Ø©',
        score: 91,
        support: '88.00 Ø¬',
        target1: '108.00 Ø¬',
        target2: '120.00 Ø¬',
        stopLoss: '85.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx30']
      },
      {
        ticker: 'ORAS',
        name: 'Ø£ÙˆØ±Ø§Ø³ÙƒÙˆÙ… ÙƒÙˆÙ†Ø³ØªØ±Ø§ÙƒØ´ÙˆÙ†',
        index: 'egx30',
        sector: 'Ù…Ù‚Ø§ÙˆÙ„Ø§Øª ÙˆØ¨Ù†ÙŠØ© ØªØ­ØªÙŠØ©',
        price: 305.00,
        high: 310.00,
        low: 298.00,
        close: 305.00,
        changePct: '+1.65%',
        volumeMultiplier: '1.5x',
        catalyst: 'Ø¹Ù‚ÙˆØ¯ Ø¨Ù†ÙŠØ© ØªØ­ØªÙŠØ© Ø¯ÙˆÙ„Ø§Ø±ÙŠØ© ÙˆÙ…Ø´Ø§Ø±ÙŠØ¹ ÙƒØ¨Ø±Ù‰ Ø¨Ø§Ù„Ø´Ø±Ù‚ Ø§Ù„Ø£ÙˆØ³Ø· ÙˆØ§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…ØªØ­Ø¯Ø©',
        type: 'Ø³Ù‡Ù… Ø¯ÙˆÙ„Ø§Ø±ÙŠ Ù…Ù…ØªØ§Ø² â€¢ ØµÙ„Ø¨ ÙˆÙ‚Øª Ø§Ù„Ø£Ø²Ù…Ø§Øª',
        score: 92,
        support: '285.00 Ø¬',
        target1: '345.00 Ø¬',
        target2: '380.00 Ø¬',
        stopLoss: '275.00 Ø¬',
        liquidityStatus: 'Ø¹Ø§Ù„ÙŠØ© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'ABUK',
        name: 'Ø£Ø¨Ùˆ Ù‚ÙŠØ± Ù„Ù„Ø£Ø³Ù…Ø¯Ø©',
        index: 'egx30',
        sector: 'Ø¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª',
        price: 58.50,
        high: 59.80,
        low: 57.20,
        close: 58.50,
        changePct: '+0.50%',
        volumeMultiplier: '1.3x',
        catalyst: 'ØªÙˆØ²ÙŠØ¹Ø§Øª Ù†Ù‚Ø¯ÙŠØ© Ø¯ÙˆØ±ÙŠØ© ÙˆÙ…ÙØ§ÙˆØ¶Ø§Øª Ø­ØµØµ Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠØ© Ù„Ù…Ø³ØªØ«Ù…Ø±ÙŠÙ† Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠÙŠÙ†',
        type: 'Ø¹Ø§Ø¦Ø¯ Ù†Ù‚Ø¯Ù‰ ÙˆØ§Ø³ØªÙ‚Ø±Ø§Ø± Ù…Ø§Ù„ÙŠ',
        score: 90,
        support: '55.00 Ø¬',
        target1: '68.00 Ø¬',
        target2: '75.00 Ø¬',
        stopLoss: '53.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'SKPC',
        name: 'Ø³ÙŠØ¯ÙŠ ÙƒØ±ÙŠØ± Ù„Ù„Ø¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª',
        index: 'egx70',
        sector: 'Ø¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª',
        price: 28.40,
        high: 29.20,
        low: 27.50,
        close: 28.40,
        changePct: '+3.65%',
        volumeMultiplier: '2.7x',
        catalyst: 'Ø§Ù†ØªØ¸Ø§Ù… Ø¥Ù…Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ØºØ§Ø² ÙˆØ§Ø±ØªÙØ§Ø¹ Ø§Ù„Ø·Ù„Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙˆÙ„ÙŠ Ø¥ÙŠØ«ÙŠÙ„ÙŠÙ† Ø¨Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©',
        type: 'Ø·ÙØ±Ø© Ø¨ØªØ±ÙˆÙƒÙŠÙ…Ø§ÙˆÙŠØ§Øª â€¢ ØªØ¹Ø§ÙÙŠ Ø³Ø±ÙŠØ¹',
        score: 87,
        support: '26.00 Ø¬',
        target1: '33.00 Ø¬',
        target2: '36.50 Ø¬',
        stopLoss: '24.80 Ø¬',
        liquidityStatus: 'Ù†Ø´Ø·Ø© Ø¬Ø¯Ø§Ù‹ ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'ALCN',
        name: 'Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ© Ù„ØªØ¯Ø§ÙˆÙ„ Ø§Ù„Ø­Ø§ÙˆÙŠØ§Øª',
        index: 'egx30',
        sector: 'Ù†Ù‚Ù„ ÙˆÙ„ÙˆØ¬Ø³ØªÙŠØ§Øª Ø¯ÙˆÙ„Ø§Ø±ÙŠØ©',
        price: 48.90,
        high: 49.50,
        low: 47.80,
        close: 48.90,
        changePct: '+1.88%',
        volumeMultiplier: '1.7x',
        catalyst: 'Ø¹ÙˆØ§Ø¦Ø¯ Ø´Ø­Ù† Ø¨Ø­Ø±ÙŠ Ø¨Ø§Ù„Ø¯ÙˆÙ„Ø§Ø± Ù…Ø¹ ØªÙˆØ²ÙŠØ¹ ÙƒÙˆØ¨ÙˆÙ†Ø§Øª Ø£Ø±Ø¨Ø§Ø­ ØªØ§Ø±ÙŠØ®ÙŠØ©',
        type: 'Ø³Ù‡Ù… ØªØ¯ÙÙ‚Ø§Øª Ù†Ù‚Ø¯ÙŠØ© Ø¯ÙˆÙ„Ø§Ø±ÙŠØ© Ù†Ù‚ÙŠØ©',
        score: 93,
        support: '45.50 Ø¬',
        target1: '56.00 Ø¬',
        target2: '62.00 Ø¬',
        stopLoss: '44.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'BTFH',
        name: 'Ø¨Ù„ØªÙˆÙ† Ø§Ù„Ù‚Ø§Ø¨Ø¶Ø©',
        index: 'egx30',
        sector: 'Ø®Ø¯Ù…Ø§Øª Ù…Ø§Ù„ÙŠØ© ÙˆØ¨Ù†ÙˆÙƒ Ø§Ø³ØªØ«Ù…Ø§Ø±',
        price: 3.35,
        high: 3.45,
        low: 3.22,
        close: 3.35,
        changePct: '+2.14%',
        volumeMultiplier: '2.8x',
        catalyst: 'ØªÙˆØ³Ø¹Ø§Øª ÙƒØ¨Ø±Ù‰ ÙÙŠ Ø§Ù„ØªØ£Ø¬ÙŠØ± Ø§Ù„ØªÙ…ÙˆÙŠÙ„ÙŠ ÙˆØ§Ù„ØªÙ…ÙˆÙŠÙ„ Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ Ø¨Ø¹Ø¯ Ø²ÙŠØ§Ø¯Ø© Ø±Ø£Ø³ Ø§Ù„Ù…Ø§Ù„',
        type: 'Ø®Ø¯Ù…Ø§Øª Ù…Ø§Ù„ÙŠØ© ÙˆÙ†Ù…Ùˆ Ù…ØªØ³Ø§Ø±Ø¹',
        score: 86,
        support: '3.10 Ø¬',
        target1: '4.10 Ø¬',
        target2: '4.60 Ø¬',
        stopLoss: '2.95 Ø¬',
        liquidityStatus: 'Ø£Ø¹Ù„Ù‰ Ø³ÙŠÙˆÙ„Ø© ÙÙŠ Ø§Ù„Ø¨ÙˆØ±ØµØ© ÙˆØ«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx30']
      },
      {
        ticker: 'ISPH',
        name: 'Ø§Ø¨Ù† Ø³ÙŠÙ†Ø§ ÙØ§Ø±Ù…Ø§',
        index: 'egx70',
        sector: 'Ø£Ø¯ÙˆÙŠØ© ÙˆØ±Ø¹Ø§ÙŠØ© ØµØ­ÙŠØ©',
        price: 3.20,
        high: 3.32,
        low: 3.05,
        close: 3.20,
        changePct: '+4.25%',
        volumeMultiplier: '3.2x',
        catalyst: 'ØªØ­Ø±ÙŠÙƒ Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø£Ø¯ÙˆÙŠØ© ÙˆØ§Ø³ØªÙ‚Ø±Ø§Ø± Ø³Ù„Ø§Ø³Ù„ Ø§Ù„Ø¥Ù…Ø¯Ø§Ø¯ ÙˆØªØ­Ø³Ù† Ù‡ÙˆØ§Ù…Ø´ Ø§Ù„ØªÙˆØ²ÙŠØ¹',
        type: 'Ø·ÙØ±Ø© Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø¯ÙˆØ§Ø¡ â€¢ Ù†Ù…ÙˆØ°Ø¬ Ø§Ø±ØªØ¯Ø§Ø¯ Ù‚Ø§Ø¹',
        score: 88,
        support: '2.95 Ø¬',
        target1: '3.90 Ø¬',
        target2: '4.35 Ø¬',
        stopLoss: '2.80 Ø¬',
        liquidityStatus: 'Ø¹Ø§Ù„ÙŠØ© ÙˆÙ†Ø´Ø·Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx70']
      },
      {
        ticker: 'JUFO',
        name: 'Ø¬Ù‡ÙŠÙ†Ø© Ù„Ù„ØµÙ†Ø§Ø¹Ø§Øª Ø§Ù„ØºØ°Ø§Ø¦ÙŠØ©',
        index: 'egx30',
        sector: 'ØµÙ†Ø§Ø¹Ø§Øª ØºØ°Ø§Ø¦ÙŠØ© ÙˆØ§Ø³ØªÙ‡Ù„Ø§ÙƒÙŠØ©',
        price: 27.80,
        high: 28.40,
        low: 27.10,
        close: 27.80,
        changePct: '+1.10%',
        volumeMultiplier: '1.3x',
        catalyst: 'Ù‚ÙˆØ© ØªØ³Ø¹ÙŠØ±ÙŠØ© Ù‡Ø§Ø¦Ù„Ø© ÙˆÙ†Ù…Ùˆ Ù…Ø·Ø±Ø¯ ÙÙŠ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª ÙˆØªÙˆØ²ÙŠØ¹Ø§Øª Ø£Ø±Ø¨Ø§Ø­ Ù…Ù†ØªØ¸Ù…Ø©',
        type: 'Ø³Ù‡Ù… Ø§Ø³ØªÙ‡Ù„Ø§ÙƒÙŠ Ø¯ÙØ§Ø¹ÙŠ â€¢ Ù†Ù…Ùˆ Ø«Ø§Ø¨Øª',
        score: 89,
        support: '25.50 Ø¬',
        target1: '32.00 Ø¬',
        target2: '35.00 Ø¬',
        stopLoss: '24.50 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'OCDI',
        name: 'Ø³ÙˆØ¯ÙŠÙƒ (Ø§Ù„Ø³Ø§Ø¯Ø³ Ù…Ù† Ø£ÙƒØªÙˆØ¨Ø± Ù„Ù„ØªÙ†Ù…ÙŠØ©)',
        index: 'egx30',
        sector: 'ØªØ·ÙˆÙŠØ± Ø¹Ù‚Ø§Ø±ÙŠ ÙØ§Ø®Ø±',
        price: 52.00,
        high: 53.50,
        low: 50.80,
        close: 52.00,
        changePct: '+2.35%',
        volumeMultiplier: '1.9x',
        catalyst: 'ØªØ­Ø§Ù„ÙØ§Øª Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ù…Ø¹ Ù…Ø³ØªØ«Ù…Ø±ÙŠÙ† Ø¥Ù…Ø§Ø±Ø§ØªÙŠÙŠÙ† ÙˆÙ…Ø­ÙØ¸Ø© Ø£Ø±Ø§Ø¶ÙŠ ØºØ±Ø¨ ÙˆØ´Ø±Ù‚ Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©',
        type: 'Ø¹Ù‚Ø§Ø±Ø§Øª ÙØ§Ø®Ø±Ø© â€¢ Ø¯Ø¹Ù… Ù…Ø¤Ø³Ø³ÙŠ Ù‚ÙˆÙŠ',
        score: 90,
        support: '48.00 Ø¬',
        target1: '61.00 Ø¬',
        target2: '68.00 Ø¬',
        stopLoss: '46.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'HRHO',
        name: 'Ø¥ÙŠ Ø¥Ù Ø¬ÙŠ Ø§Ù„Ù‚Ø§Ø¨Ø¶Ø© (Ù‡ÙŠØ±Ù…ÙŠØ³)',
        index: 'egx30',
        sector: 'Ø¨Ù†ÙˆÙƒ Ø§Ø³ØªØ«Ù…Ø§Ø± ÙˆØ¥Ù‚Ù„ÙŠÙ…ÙŠ',
        price: 23.40,
        high: 24.00,
        low: 22.90,
        close: 23.40,
        changePct: '+1.52%',
        volumeMultiplier: '1.6x',
        catalyst: 'Ø¥ÙŠØ±Ø§Ø¯Ø§Øª Ø¨Ù†Ùƒ Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø± ÙˆØ§Ù„Ø³Ù…Ø³Ø±Ø© Ø¨Ø§Ù„Ø®Ù„ÙŠØ¬ ÙˆÙ†Ù…Ùˆ Ø¨Ù†Ùƒ aiBANK Ø§Ù„ØªØ¬Ø§Ø±ÙŠ',
        type: 'Ø³Ù‡Ù… Ù…Ø§Ù„ÙŠ Ø¥Ù‚Ù„ÙŠÙ…ÙŠ Ù‚ÙŠØ§Ø¯ÙŠ',
        score: 91,
        support: '21.80 Ø¬',
        target1: '27.50 Ø¬',
        target2: '31.00 Ø¬',
        stopLoss: '20.90 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['low_risk', 'egx30']
      },
      {
        ticker: 'EGAL',
        name: 'Ù…ØµØ± Ù„Ù„Ø£Ù„ÙˆÙ…Ù†ÙŠÙˆÙ…',
        index: 'egx30',
        sector: 'Ù…Ø¹Ø§Ø¯Ù† ÙˆØµÙ†Ø§Ø¹Ø© Ø«Ù‚ÙŠÙ„Ø©',
        price: 109.00,
        high: 112.00,
        low: 106.00,
        close: 109.00,
        changePct: '+2.90%',
        volumeMultiplier: '2.2x',
        catalyst: 'Ø§Ø±ØªÙØ§Ø¹ Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø£Ù„ÙˆÙ…Ù†ÙŠÙˆÙ… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© ÙˆØªØ·ÙˆÙŠØ± Ù…ØµÙ†Ø¹ Ù†Ø¬Ø¹ Ø­Ù…Ø§Ø¯ÙŠ Ù…Ø¹ Ø´Ø±ÙŠÙƒ Ø£Ø¬Ù†Ø¨ÙŠ',
        type: 'Ø³Ù‡Ù… Ø³Ù„Ø¹ Ø£Ø³Ø§Ø³ÙŠØ© ÙˆØªØµØ¯ÙŠØ±',
        score: 91,
        support: '102.00 Ø¬',
        target1: '128.00 Ø¬',
        target2: '140.00 Ø¬',
        stopLoss: '98.00 Ø¬',
        liquidityStatus: 'Ù…Ù…ØªØ§Ø²Ø© ÙÙŠ Ø«Ù†Ø¯Ø±',
        tags: ['volume_surge', 'egx30']
      }
    ];

    // Load from LocalStorage or use default
    // Load from LocalStorage or use default via EGX_Portfolio
    const PORTFOLIO_VERSION_KEY = 'egx_copilot_portfolio_ver';
    const CURRENT_PORTFOLIO_VER = (typeof EGX_Portfolio !== 'undefined') ? EGX_Portfolio.version : '2026_10_clean_modular_v3_production';
    let portfolioData = [];

    function loadPortfolio() {
      if (typeof EGX_Portfolio !== 'undefined') {
        portfolioData = EGX_Portfolio.load();
      } else {
        portfolioData = JSON.parse(JSON.stringify(defaultPortfolioData));
      }
      if (!Array.isArray(portfolioData) || portfolioData.length === 0) {
        portfolioData = (typeof EGX_Portfolio !== 'undefined') ? EGX_Portfolio.getDefaultData() : JSON.parse(JSON.stringify(defaultPortfolioData));
      }
    }

    function savePortfolio() {
      if (typeof EGX_Portfolio !== 'undefined') {
        EGX_Portfolio.save(portfolioData);
      } else {
        localStorage.setItem('egx_copilot_portfolio', JSON.stringify(portfolioData));
      }
      updateMetrics();
      renderPortfolioTable();
      renderAllocationChart();
    }

    function resetToDefaultPortfolio() {
      if (confirm('Ù‡Ù„ ØªØ±ØºØ¨ ÙÙŠ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù…Ø­ÙØ¸Ø© Ø§Ù„Ø£ØµÙ„ÙŠØ© Ù…Ù† Ø«Ù†Ø¯Ø±ØŸ')) {
        portfolioData = (typeof EGX_Portfolio !== 'undefined') 
          ? EGX_Portfolio.getDefaultData() 
          : JSON.parse(JSON.stringify(defaultPortfolioData));
        savePortfolio();
      }
    }


    function getMarketRegimeCode() {
      if (!window.currentMarketRegime) return 'NORMAL_CONSOLIDATION';
      if (typeof window.currentMarketRegime === 'object') {
        return window.currentMarketRegime.regime || 'NORMAL_CONSOLIDATION';
      }
      return String(window.currentMarketRegime);
    }


    // Toast Notification System
    // ============================================================
    function showToast(message, type = 'success') {
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-6 left-6 z-[99999] flex flex-col gap-2 max-w-sm pointer-events-none';
        document.body.appendChild(toastContainer);
      }
      
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/80' :
                 type === 'error' ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/80' :
                 'bg-slate-900/95 border-cyan-500/60 text-cyan-100 shadow-cyan-950/80';
      
      toast.className = `p-4 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 flex items-start gap-3 text-xs font-semibold ${bg}`;
      toast.innerHTML = `
        <div class="shrink-0 mt-0.5 text-base">
          ${type === 'success' ? 'âœ…' : type === 'error' ? 'âŒ' : 'â„¹ï¸'}
        </div>
        <div class="flex-1 leading-relaxed">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white shrink-0 p-1 text-sm font-bold cursor-pointer">Ã—</button>
      `;
      
      toastContainer.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 350);
      }, 6500);
    }

    function showSuccessNotification(message) {
      showToast(message, 'success');
    }
