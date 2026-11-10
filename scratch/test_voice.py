import re

EGX_VOICE_ALIASES = {
    'SWDY': ['السويدي', 'السويدى', 'السويدي للكابلات', 'السويدي اليكتريك', 'السويدي إليكتريك', 'كابلات', 'swdy'],
    'TMGH': ['طلعت مصطفى', 'طلعت', 'مجموعة طلعت', 'هشام طلعت', 'مدينتي', 'الرحاب', 'مجموعة طلعت مصطفى', 'tmgh'],
    'FWRY': ['فوري', 'فورى', 'فوري للمدفوعات', 'تكنولوجيا البنوك', 'مدفوعات فوري', 'fwry'],
    'SKPC': ['سيدي كرير', 'سيدى كرير', 'سيدبك', 'سيدي كرير للبتروكيماويات', 'skpc'],
    'ABUK': ['أبو قير', 'ابو قير', 'ابوقير', 'أسمدة أبو قير', 'ابو قير للاسمدة', 'أبو قير للأسمدة', 'abuk'],
    'EGAL': ['مصر للألومنيوم', 'مصر للالمنيوم', 'الألومنيوم', 'الالمنيوم', 'ألومنيوم', 'الومنيوم', 'مصر للالومنيوم', 'الالومنيوم', 'للألومنيوم', 'للألومنيوم', 'egal'],
    'ESRS': ['حديد عز', 'عز للصلب', 'عز', 'حديد', 'esrs'],
    'HRHO': ['هيرميس', 'المجموعة المالية هيرميس', 'المجموعة المالية', 'اي اف جي', 'إي إف جي', 'hrho'],
    'PHDC': ['بالم هيلز', 'بالم', 'بالم هيلز للتعمير', 'phdc'],
    'BTFH': ['بلتون', 'بلتون القابضة', 'بلتون المالية', 'btfh'],
    'JUFO': ['جهينة', 'جهينه', 'جهينة للصناعات الغذائية', 'ألبان جهينة', 'jufo'],
    'EAST': ['الشرقية للدخان', 'ايسترن كومباني', 'إيسترن كومباني', 'ايسترن', 'الشرقية', 'دخان', 'east'],
    'AMOC': ['أموك', 'اموك', 'الإسكندرية للزيوت', 'اسكندرية للزيوت', 'زيوت معدنية', 'amoc'],
    'ETRS': ['إيجيترانس', 'ايجيترانس', 'المصرية للنقل والخدمات', 'etrs'],
    'ISPH': ['ابن سينا', 'ابن سينا فارما', 'isph'],
    'MFPC': ['موبكو', 'مصر لإنتاج الأسمدة', 'أسمدة موبكو', 'mfpc'],
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

def test_parse(transcript, owned_shares=1000, default_live_price=10.0):
    norm = normalize_arabic(transcript)
    action = 'BUY'
    
    # 1. LIMIT orders
    if re.search(r'امر\s*شراء\s*(?:محدد|معلق)?|طلب\s*شراء\s*محدد|شراء\s*محدد|شراء\s*عند', norm):
        action = 'LIMIT_BUY'
    elif re.search(r'امر\s*بيع\s*(?:محدد|معلق)?|طلب\s*بيع\s*محدد|بيع\s*محدد|بيع\s*عند', norm):
        action = 'LIMIT_SELL'
    # 2. BUY actions
    elif re.search(r'اشتريت|شريت|نفذت\s*شراء|عملت\s*شراء|زودت|تعزيز|عايز\s*اشتري|(?:^|\s)شراء(?:\s|$)', norm):
        action = 'BUY'
    # 3. SELL actions
    elif re.search(r'بيعت|بعت|نفذت\s*بيع|عملت\s*بيع|تخارجت|تخارج|عايز\s*ابيع|(?:^|\s)بيع(?:\s|$)', norm) and not re.search(r'حد\s*(?:ال)?بيع', norm):
        action = 'SELL'
    # 4. SAFE LIMIT
    elif re.search(r'حد\s*(?:ال)?(?:بيع)?\s*(?:ال)?(?:امن|امان)|وقف\s*خساره|تعديل\s*حد|تغيير\s*حد|غير\s*حد', norm):
        action = 'SAFE_LIMIT'

    matched_ticker = None
    for ticker, aliases in EGX_VOICE_ALIASES.items():
        for alias in aliases:
            norm_alias = normalize_arabic(alias)
            pattern = rf'(?:^|\s)(?:في\s+|ل|ب)?{re.escape(norm_alias)}(?:\s|$)'
            if re.search(pattern, norm):
                matched_ticker = ticker
                break
        if matched_ticker: break

    # Extract Safe Limits
    safe_sell = None
    if action == 'SAFE_LIMIT':
        sm = re.search(r'(?:الى|الي|لـ|على|سعر)?\s*(\d+(?:\.\d+)?)\s*(?:جنيه|ج)?', norm)
        if sm:
            safe_sell = float(sm.group(1))
    else:
        sm = re.search(r'(?:و)?حد\s*(?:ال)?(?:بيع)?\s*(?:ال)?(?:امن|امان|سلامه)?\s*(?:هو|على|لـ|الي|إلى)?\s*(\d+(?:\.\d+)?)', norm)
        if not sm:
            sm = re.search(r'وقف\s*(?:ال)?خساره\s*(?:هو|على|لـ|الي|إلى)?\s*(\d+(?:\.\d+)?)', norm)
        if sm:
            safe_sell = float(sm.group(1))

    # Extract Price
    price = None
    if action != 'SAFE_LIMIT':
        pm = re.search(r'(?:بسعر|على\s*سعر|سعر|بـ|ب)\s*(\d+(?:\.\d+)?)', norm)
        if not pm:
            pm = re.search(r'(\d+(?:\.\d+)?)\s*(?:جنيه|ج(?:\.م)?|قرش)', norm)
        if pm:
            price = float(pm.group(1))
        else:
            price = default_live_price
    else:
        price = safe_sell

    # Extract Shares
    shares = None
    if re.search(r'نص\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|نصف\s*(?:الكميه|كميتي|المحفظه|الاسهم)?|50\s*%', norm):
        shares = owned_shares // 2
    elif re.search(r'كل\s*(?:الكميه|كميتي|المحفظه|الاسهم|اللي\s*معايا)?|كامل\s*(?:الكميه|الاسهم)?|100\s*%', norm):
        shares = owned_shares
    else:
        m = re.search(r'(\d+)\s*(?:سهم|اسهم)', norm) or re.search(r'عدد\s*(\d+)', norm)
        if m:
            shares = int(m.group(1))
        else:
            word_nums = [('الفين', 2000), ('الف', 1000), ('خمسميه', 500), ('ميتين', 200), ('ميه', 100)]
            for w, val in word_nums:
                if w in norm:
                    shares = val
                    break
        if not shares:
            shares = (action == 'SELL') and owned_shares or 100

    return {
        'action': action,
        'ticker': matched_ticker,
        'shares': shares,
        'price': price,
        'safe_sell': safe_sell
    }

# Test 1: Direct Buy
r1 = test_parse('اشتريت 500 سهم في السويدي بسعر 52 جنيه وحد البيع الآمن 58 جنيه')
print('Test 1:', r1)
assert r1['action'] == 'BUY'
assert r1['ticker'] == 'SWDY'
assert r1['shares'] == 500
assert r1['price'] == 52.0
assert r1['safe_sell'] == 58.0

# Test 2: Half Sell
r2 = test_parse('بعت نص كمية فوري على سعر 8.20', owned_shares=1000)
print('Test 2:', r2)
assert r2['action'] == 'SELL'
assert r2['ticker'] == 'FWRY'
assert r2['shares'] == 500
assert r2['price'] == 8.20

# Test 3: Limit Buy
r3 = test_parse('سجلت أمر شراء محدد لمصر للألومنيوم على سعر 105 وحد البيع الآمن 120')
print('Test 3:', r3)
assert r3['action'] == 'LIMIT_BUY'
assert r3['ticker'] == 'EGAL'
assert r3['shares'] == 100
assert r3['price'] == 105.0
assert r3['safe_sell'] == 120.0

# Test 4: Safe Limit modification
r4 = test_parse('غير حد البيع الآمن لطلعت مصطفى إلى 85 جنيه')
print('Test 4:', r4)
assert r4['action'] == 'SAFE_LIMIT'
assert r4['ticker'] == 'TMGH'
assert r4['safe_sell'] == 85.0

print('\n>>> ALL 4 VOICE PARSING BENCHMARKS PASSED 100% WITH ZERO ERRORS! <<<')
