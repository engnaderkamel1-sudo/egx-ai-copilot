# -*- coding: utf-8 -*-
import re

EGX_VOICE_ALIASES = {
    'SWDY': ['السويدي', 'السويدى', 'السويدي للكابلات', 'السويدي اليكتريك', 'السويدي إليكتريك', 'كابلات', 'swdy'],
    'TMGH': ['طلعت مصطفى', 'طلعت', 'مجموعة طلعت', 'هشام طلعت', 'مدينتي', 'الرحاب', 'مجموعة طلعت مصطفى', 'tmgh'],
    'FWRY': ['فوري', 'فورى', 'فوري للمدفوعات', 'تكنولوجيا البنوك', 'مدفوعات فوري', 'fwry'],
    'COMI': ['البنك التجاري الدولي', 'التجاري الدولي', 'سي اي بي', 'cib', 'comi'],
}

def normalize_arabic(s):
    if not s: return ''
    s = s.lower()
    s = re.sub(r'[أإآ]', 'ا', s)
    s = s.replace('ة', 'ه').replace('ى', 'ي')
    s = re.sub(r'[\u064B-\u065F\u0670]', '', s)
    for i, d in enumerate('٠١٢٣٤٥٦٧٨٩'):
        s = s.replace(d, str(i))
    return s.strip()

def parse_voice(raw_transcript):
    norm = normalize_arabic(raw_transcript)

    matched_ticker = None
    for ticker, aliases in EGX_VOICE_ALIASES.items():
        for alias in aliases:
            norm_alias = normalize_arabic(alias)
            pattern = rf'(?:^|\s)(?:في\s+|ل|ب)?{re.escape(norm_alias)}(?:\s|$)'
            if re.search(pattern, norm) or norm_alias in norm:
                matched_ticker = ticker
                break
        if matched_ticker: break

    is_portfolio_query = bool(re.search(r'(?:محفظ(?:ة|تي)|رصيد(?:ي)?|كاش|فلوس(?:ي)?|ارباح(?:ي)?)', norm, re.I))
    is_market_query = bool(re.search(r'(?:سوق|بورص(?:ة)?|فرص|افضل\s*سهم|احسن\s*سهم|رشح|ترشيح)', norm, re.I))

    if not matched_ticker and not is_portfolio_query and not is_market_query:
        return {'success': False, 'error': 'لم نتمكن من تحديد السهم'}

    is_question = bool(re.search(r'(?:هل|ايه|إيه|رايك|رأيك|تنصحني|نصيحتك|اخبار|أخبار|موقف|وضع|تحليل|حلل|تقييم|كام|بكام|شايف|توقعات|مناسب|ممكن)', norm, re.I))

    action = None
    if not is_question:
        if re.search(r'امر\s*شراء\s*(?:محدد|معلق)?|طلب\s*شراء\s*محدد|شراء\s*محدد|شراء\s*عند', norm, re.I):
            action = 'LIMIT_BUY'
        elif re.search(r'امر\s*بيع\s*(?:محدد|معلق)?|طلب\s*بيع\s*محدد|بيع\s*محدد|بيع\s*عند', norm, re.I):
            action = 'LIMIT_SELL'
        elif re.search(r'(?:^|\s)(?:اشتريت|شريت|نفذت\s*شراء|عملت\s*شراء|زودت|تعزيز|عايز\s*اشتري|سجل\s*شراء|نفذ\s*شراء)(?:\s|$)|^(?:اشتري|شراء)(?:\s|$)', norm, re.I):
            action = 'BUY'
        elif re.search(r'(?:^|\s)(?:بيعت|بعت|نفذت\s*بيع|عملت\s*بيع|تخارجت|تخارج|عايز\s*ابيع|سجل\s*بيع|نفذ\s*بيع)(?:\s|$)|^(?:بيع|ابيع)(?:\s|$)', norm, re.I) and not re.search(r'حد\s*(?:ال)?بيع', norm, re.I):
            action = 'SELL'
        elif re.search(r'حد\s*(?:ال)?(?:بيع)?\s*(?:ال)?(?:امن|امان)|وقف\s*خساره|تعديل\s*حد|تغيير\s*حد|غير\s*حد', norm, re.I):
            action = 'SAFE_LIMIT'

    if action and matched_ticker:
        return {'success': True, 'intent': 'TRADE', 'action': action, 'ticker': matched_ticker}

    return {'success': True, 'intent': 'CONSULT', 'ticker': matched_ticker, 'is_portfolio': is_portfolio_query, 'is_market': is_market_query}

# Test cases
test_cases = [
    "سهم طلعت مصطفى",
    "طلعت مصطفى",
    "ايه رايك في سهم طلعت مصطفى",
    "هل السويدي مناسب للشراء؟",
    "مستويات الدعم والهدف لسهم السويدي",
    "اشتري 500 سهم في السويدي بسعر 52 جنيه",
    "بعت نص كمية فوري على سعر 8.20",
    "غير حد البيع الآمن لطلعت مصطفى إلى 85 جنيه",
    "ايه اخبار المحفظة ورصيد الكاش؟",
    "افضل سهم في البورصة النهاردة"
]

print("=== Running Parser Verification ===")
for t in test_cases:
    res = parse_voice(t)
    print(f"Transcript: '{t}' -> Intent: {res.get('intent')} | Action: {res.get('action')} | Ticker: {res.get('ticker')}")
