"""Русские имена примет и мест (0.22).
ru_label(name, host, kind) — имя приметы по-русски: родовые слова переводятся («Église» → «церковь», «Burgruine» → «руины замка»),
святые — по-русски в родительном падеже («Saint-Pierre» → «св. Петра»), собственные имена — русской транскрипцией по языку страны
(«Fargues» → «Фарг», «Brighton» → «Брайтон», «Klamm» → «Кламм»). Длинные имена укорачиваются до ~34 знаков.
ru_place(name, host) — имя города, реки: только транскрипция («Saint-Martin-en-Campagne» → «Сен-Мартен-ан-Кампань»).
Без сети и без сторонних библиотек — проверяется локально: python3 terrain_names.py"""
import re, unicodedata

MAXLEN = 34

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', (s or '').replace('ß', 'ss').replace('ẞ', 'SS')) if unicodedata.category(c) != 'Mn').lower()

def cap1(s):
    return s[:1].upper() + s[1:] if s else s

CYR = re.compile('[А-Яа-яЁё]')
CJK = re.compile('[㐀-鿿]')

# ---------------------------------------------------------------- транскрипция
VOWELS = 'aeiouyàâäéèêëîïôöûüùœæáíóúåø'
RU_V = set('аеёиоуыэюяй')

def _apply(word, rules):
    """rules: [(regex, замена)] — по очереди, каждое правило в позиции; на выходе — русские буквы."""
    out = ''; i = 0
    while i < len(word):
        for rx, rep in rules:
            m = rx.match(word, i)
            if m:
                out += rep(m) if callable(rep) else rep; i = m.end(); break
        else:
            out += BASE.get(word[i], word[i] if word[i].isalpha() and ord(word[i]) >= 0x400 else ''); i += 1
    return out

BASE = {'a': 'а', 'b': 'б', 'c': 'к', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н',
        'o': 'о', 'p': 'п', 'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'и', 'z': 'з',
        'à': 'а', 'â': 'а', 'á': 'а', 'ä': 'е', 'é': 'е', 'è': 'е', 'ê': 'е', 'ë': 'е', 'î': 'и', 'ï': 'и', 'í': 'и', 'ì': 'и', 'ô': 'о', 'ó': 'о',
        'ò': 'о', 'ö': 'ё', 'û': 'у', 'ú': 'у', 'ù': 'у', 'ü': 'ю', 'ç': 'с', 'ñ': 'нь', 'œ': 'ё', 'æ': 'е', 'ß': 'сс', 'å': 'о', 'ø': 'ё'}

def R(rx): return re.compile(rx)
C = '[bcdfghjklmnpqrstvwxzç]'
V = '[aeiouyàâäéèêëîïôöûüùœáíóú]'

# Французский: немые конечные согласные и e, носовые, сочетания гласных (практическая транскрипция, упрощённо)
FR_RULES = [
    (R('^aill'), 'ай'), (R('ay$'), 'е'), (R('^eu'), 'э'), (R('^ai'), 'э'), (R('euill'), 'ёй'), (R('ueill'), 'ёй'), (R('euil$'), 'ёй'), (R('ueil$'), 'ёй'), (R('ail$'), 'ай'), (R('eil$'), 'ей'),
    (R('aie$'), 'е'), (R('esn'), 'ен'), (R('x(?=[bcdfgjklmnpqrstvwz])'), ''), (R('eaux?'), 'о'), (R('aux?$'), 'о'), (R('ault?$'), 'о'), (R('ou[ie]ll'), 'уй'), (R('eill'), 'ей'), (R('aill'), 'ай'), (R('ouill'), 'уй'),
    (R('ville'), 'виль'), (R('mille'), 'миль'), (R('ill(?=' + V + ')'), 'ий'), (R('ill$'), 'ий'), (R('oin'), 'уэн'), (R('oi'), 'уа'), (R('oy'), 'уай'), (R('ou'), 'у'),
    (R('ain(?!' + V + '|n)'), 'ен'), (R('ein(?!' + V + '|n)'), 'ен'), (R('ai'), 'е'), (R('ei'), 'е'), (R('au'), 'о'), (R('eu'), 'ё'), (R('œu'), 'ё'),
    (R('ieu'), 'ьё'), (R('ie$'), 'и'), (R('iez$'), 'ье'), (R('ier$'), 'ье'), (R('ie'), 'ье'), (R('ié'), 'ье'), (R('ia'), 'ья'), (R('io'), 'ьо'),
    (R('amps?$'), 'ам'), (R('[ae]m(?=[pb])'), 'ам'), (R('om(?=[pb])'), 'ом'), (R('[iy]m(?=[pb])'), 'ем'),
    (R('[ae]n(?![aeiouyéèênm])'), 'ан'), (R('[ae]m$'), 'ам'), (R('[iy]n(?![aeiouyéèênm])'), 'ен'), (R('on(?![aeiouyéèênm])'), 'он'), (R('om$'), 'ом'), (R('un(?![aeiouyéèênm])'), 'ен'),
    (R('ch'), 'ш'), (R('gn'), 'нь'), (R('qu'), 'к'), (R('gu(?=[eiéèêy])'), 'г'), (R('g(?=[eiéèêy])'), 'ж'), (R('c(?=[eiéèêy])'), 'с'), (R('ç'), 'с'),
    (R('ph'), 'ф'), (R('th'), 'т'), (R('ss'), 'сс'), (R('(?<=' + V + ')s(?=' + V + ')'), 'з'), (R('ll'), 'лл'), (R('l(?=' + C + '|$)'), 'ль'),
    (R('j'), 'ж'), (R('w'), 'в'), (R('x'), 'кс'), (R('h'), ''), (R('y'), 'и'), (R('u'), 'ю'), (R('ü'), 'ю'), (R('û'), 'ю'), (R('ù'), 'ю'),
    (R('^[eéèê]'), 'э'), (R('ë'), 'э'), (R('é'), 'е'),
]
def fr_word(w):
    s = w.lower(); te = False
    if len(s) > 3 and s.endswith('es') and not s.endswith(('ées',)): s = s[:-2]; te = True          # Fargues → Fargu, Thillois — ниже
    elif len(s) > 2 and s.endswith('e') and not s.endswith(('ée', 'ie')): s = s[:-1]; te = True     # Roure → Rour
    elif len(s) > 2 and s.endswith('amps'): pass
    elif len(s) > 2 and s[-1] in 'stdxzp' and not s.endswith(('ez', 'ss', 'ct', 'amp')): s = s[:-1]   # Pontet → Ponte → «Понте»
    if te and s.endswith('gu'): s = s[:-1]   # Fargu → Farg
    if te and s.endswith('qu'): s = s[:-2] + 'k'
    if te and s.endswith('c'): s = s[:-1] + 'ç'    # Provence → «Прованс»
    if te and s.endswith('g') and not w.lower().endswith(('gue', 'gues')): s = s[:-1] + 'j'   # Arnage → «Арнаж»
    if s.startswith('h') and len(s) > 2: s = s[1:]
    r = _apply(s, FR_RULES)
    if te and len(r) > 3 and r[-1] == r[-2] and r[-1] in 'ртнмсп': r = r[:-1]   # Pierre → «Пьер», Rochette → «Рошет»
    return r

# Немецкий
DE_RULES = [
    (R('tsch'), 'ч'), (R('sch'), 'ш'), (R('^st'), 'шт'), (R('^sp'), 'шп'), (R('stein'), 'штайн'), (R('stadt'), 'штадт'), (R('strass'), 'штрасс'),
    (R('stätt'), 'штетт'), (R('stett'), 'штетт'), (R('stock'), 'шток'), (R('spitz'), 'шпиц'), (R('stuhl'), 'штуль'), (R('stahl'), 'шталь'), (R('^rh'), 'р'),
    (R('oo'), 'о'), (R('aa'), 'а'), (R('ee'), 'е'), (R('ae'), 'аэ'), (R('oe'), 'ё'), (R('ue'), 'ю'), (R('chs'), 'кс'), (R('ch'), 'х'), (R('ck'), 'к'), (R('tz'), 'ц'), (R('ie'), 'и'),
    (R('ei'), 'ай'), (R('ai'), 'ай'), (R('eu'), 'ой'), (R('äu'), 'ой'), (R('au'), 'ау'), (R('ph'), 'ф'), (R('qu'), 'кв'), (R('th'), 'т'),
    (R('ja'), 'я'), (R('je'), 'е'), (R('ju'), 'ю'), (R('jo'), 'йо'), (R('j'), 'й'),
    (R('(?<=' + V + ')h'), ''), (R('^h'), 'х'), (R('h'), 'х'), (R('ß'), 'с'), (R('ss'), 'сс'), (R('^s(?=' + V + ')'), 'з'), (R('(?<=' + V + '|[lnmr])s(?=' + V + ')'), 'з'),
    (R('z'), 'ц'), (R('v'), 'ф'), (R('w'), 'в'), (R('x'), 'кс'), (R('y'), 'и'), (R('ll'), 'лль'), (R('l(?=' + C + '|$)'), 'ль'),
    (R('^[eä]'), 'э'), (R('^ö'), 'э'), (R('^ü'), 'ю'), (R('ä'), 'е'), (R('ö'), 'ё'), (R('ü'), 'ю'),
]
def de_word(w):
    r = _apply(w.lower(), DE_RULES)
    return r.replace('ллль', 'лль')

# Итальянский
IT_RULES = [
    (R('chi(?=[aeou])'), 'кь'), (R('ghi(?=[aeou])'), 'гь'), (R('gli(?=[aeou])'), 'ль'), (R('gli'), 'льи'), (R('(?<=[bcdfglmnprstvz])ie'), 'ье'), (R('gn'), 'нь'), (R('sc(?=[ei])'), 'ш'), (R('sci(?=[aou])'), 'ш'), (R('ci(?=[aou])'), 'ч'), (R('c(?=[ei])'), 'ч'), (R('cc(?=[ei])'), 'чч'),
    (R('gi(?=[aou])'), 'дж'), (R('g(?=[ei])'), 'дж'), (R('ch'), 'к'), (R('gh'), 'г'), (R('qu'), 'кв'), (R('zz'), 'цц'), (R('z'), 'ц'), (R('h'), ''),
    (R('j'), 'й'), (R('y'), 'и'), (R('ll'), 'лл'), (R('l(?=' + C + '|$)'), 'ль'), (R('^[eèé]'), 'э'), (R('(?<=[aeiouàèéìòù])e'), 'е'),
    (R('ia'), 'ия'), (R('io'), 'ио'),
]
def it_word(w):
    s = w.lower()
    if s.startswith('h') and len(s) > 2: s = s[1:]
    return _apply(s, IT_RULES)

# Испанский и баскский
ES_RULES = [
    (R('tg(?=[ei])'), 'дж'), (R('tj'), 'дж'), (R('(?<=[aeiou])e'), 'э'), (R('tx'), 'ч'), (R('tz'), 'ц'), (R('ll'), 'й'), (R('ñ'), 'нь'), (R('ch'), 'ч'), (R('qu'), 'к'), (R('gü(?=[ei])'), 'гу'), (R('gu(?=[ei])'), 'г'),
    (R('g(?=[eiéí])'), 'х'), (R('c(?=[eiéí])'), 'с'), (R('j'), 'х'), (R('z'), 'с'), (R('h'), ''), (R('y$'), 'и'), (R('y(?=' + V + ')'), 'й'), (R('y'), 'и'),
    (R('x'), 'кс'), (R('l(?=' + C + '|$)'), 'ль'), (R('^[eé]'), 'э'), (R('ia'), 'ия'), (R('io'), 'ио'),
]
def es_word(w):
    s = w.lower()
    if s.startswith('h') and len(s) > 2: s = s[1:]
    return _apply(s, ES_RULES)

# Нидерландский
NL_RULES = [
    (R('sch'), 'сх'), (R('ij'), 'ей'), (R('ei'), 'ей'), (R('oe'), 'у'), (R('ui'), 'ёй'), (R('ou'), 'ау'), (R('au'), 'ау'), (R('eu'), 'ё'), (R('ie'), 'и'),
    (R('ch'), 'х'), (R('aa'), 'а'), (R('ee'), 'е'), (R('oo'), 'о'), (R('uu'), 'ю'), (R('g'), 'х'), (R('j'), 'й'), (R('w'), 'в'), (R('v'), 'ф'), (R('z'), 'з'),
    (R('u'), 'ю'), (R('y'), 'ей'), (R('c(?=[eiy])'), 'с'), (R('x'), 'кс'), (R('l(?=' + C + '|$)'), 'ль'), (R('^e'), 'э'),
]
def nl_word(w): return _apply(w.lower(), NL_RULES)

# Английский — приближённо (Brighton → Брайтон, Patcham → Патчем, Kendal → Кендал, Ossining → Оссининг)
EN_PARTS = {'street': 'стрит', 'road': 'роуд', 'avenue': 'авеню', 'park': 'парк', 'hill': 'хилл', 'house': 'хаус', 'hall': 'холл', 'green': 'грин',
            'lane': 'лейн', 'square': 'сквер', 'point': 'пойнт', 'beach': 'бич', 'lake': 'лейк', 'mount': 'маунт', 'new': 'нью', 'old': 'олд',
            'west': 'уэст', 'east': 'ист', 'north': 'норт', 'south': 'саут', 'middle': 'мидл', 'castle': 'касл', 'island': 'айленд', 'valley': 'вэлли',
            'york': 'йорк', 'george': 'джордж', 'john': 'джон', 'james': 'джеймс', 'thomas': 'томас', 'william': 'уильям', 'mary': 'мэри',
            'brighton': 'брайтон', 'hove': 'хоув', 'ireland': 'ирландия', 'dublin': 'дублин', 'savannah': 'саванна', 'chicago': 'чикаго',
            'monica': 'моника', 'santa': 'санта', 'evanston': 'эванстон', 'phoenix': 'феникс', 'wellington': 'веллингтон', 'douglas': 'дуглас',
            'ramsey': 'рамси', 'shap': 'шап', 'wey': 'уэй', 'thames': 'темза', 'teme': 'тим', 'tower': 'тауэр', 'wood': 'вуд', 'field': 'филд', 'ford': 'форд', 'bury': 'бери', 'ton': 'тон'}
EN_RULES = [
    (R('^new'), 'нью'), (R('^we'), 'уэ'), (R('^pye'), 'пай'), (R('ight'), 'айт'), (R('igh'), 'ай'), (R('augh'), 'о'), (R('ough$'), 'оу'), (R('ough'), 'о'), (R('tch'), 'ч'), (R('dge'), 'дж'), (R('sh'), 'ш'),
    (R('ch'), 'ч'), (R('th'), 'т'), (R('ph'), 'ф'), (R('wh'), 'у'), (R('ck'), 'к'), (R('qu'), 'кв'), (R('^kn'), 'н'), (R('^wr'), 'р'),
    (R('ee'), 'и'), (R('ea'), 'и'), (R('oo'), 'у'), (R('ou'), 'ау'), (R('ow$'), 'оу'), (R('ow'), 'ау'), (R('aw'), 'о'), (R('au'), 'о'),
    (R('ay'), 'ей'), (R('ey$'), 'и'), (R('ey'), 'ей'), (R('oy'), 'ой'), (R('oi'), 'ой'), (R('ai'), 'ей'), (R('ie$'), 'и'),
    (R('a(?=' + C + 'e$)'), 'ей'), (R('i(?=' + C + 'e$)'), 'ай'), (R('o(?=' + C + 'e$)'), 'оу'), (R('u(?=' + C + 'e$)'), 'ю'), (R('y(?=' + C + 'e$)'), 'ай'),
    (R('(?<=' + C + ')le$'), 'л'), (R('(?<=' + C + ')e$'), ''), (R('ham$'), 'хэм'), (R('^y'), 'й'), (R('y'), 'и'), (R('^w(?=' + V + ')'), 'у'),
    (R('w(?=e)'), 'у'), (R('w'), 'у'), (R('j'), 'дж'), (R('x'), 'кс'), (R('c(?=[eiy])'), 'с'), (R('c'), 'к'), (R('g(?=e$)'), 'дж'),
    (R('ge(?=r)'), 'ге'), (R('g(?=[eiy])'), 'дж'), (R('^e'), 'э'), (R('mb$'), 'м'),
]
def en_word(w):
    s = w.lower().replace("'", '')
    if s in EN_PARTS: return EN_PARTS[s]
    for suf in ('ton', 'ford', 'field', 'wood', 'bury', 'ley', 'combe', 'mouth', 'ville', 'burgh', 'borough', 'shire'):
        if s.endswith(suf) and len(s) > len(suf) + 2:
            tail = {'ton': 'тон', 'ford': 'форд', 'field': 'филд', 'wood': 'вуд', 'bury': 'бери', 'ley': 'ли', 'combe': 'комб', 'mouth': 'мут',
                    'ville': 'вилл', 'burgh': 'бург', 'borough': 'боро', 'shire': 'шир'}[suf]
            return _apply(s[:-len(suf)], EN_RULES) + tail
    return _apply(s, EN_RULES)

LANG = {'fr': fr_word, 'be': fr_word, 'mc': fr_word, 'ch': de_word, 'de': de_word, 'at': de_word, 'it': it_word, 'uk': en_word, 'ie': en_word,
        'us': en_word, 'es': es_word, 'nl': nl_word, 'ly': en_word}
LANGCODE = {'fr': 'fr', 'be': 'fr', 'mc': 'fr', 'ch': 'de', 'de': 'de', 'at': 'de', 'it': 'it', 'uk': 'en', 'ie': 'en', 'us': 'en', 'es': 'es', 'nl': 'nl', 'ly': 'en'}

def _tidy(r):
    r = re.sub('йи', 'и', r); r = re.sub('ьь', 'ь', r); r = re.sub('([жшчщц])ю', r'\1у', r); r = re.sub('([жшчщ])ы', r'\1и', r)
    r = re.sub('^ь', '', r); r = re.sub('ь([аоу])', lambda m: 'ь' + m.group(1), r)
    return r

PLACE_WORDS = {'fr': {'aix': 'Экс', 'marseille': 'Марсель', 'paris': 'Париж', 'lyon': 'Лион', 'nice': 'Ницца', 'reims': 'Реймс', 'tours': 'Тур', 'le mans': 'Ле-Ман', 'saint': 'Сен', 'sainte': 'Сент', 'sur': 'сюр', 'sous': 'су', 'les': 'ле', 'le': 'ле', 'la': 'ла', 'de': 'де', 'des': 'де', 'du': 'дю',
                      'en': 'ан', 'et': 'э', 'lès': 'ле', 'lez': 'ле', 'aux': 'о', 'au': 'о', 'mont': 'Мон', 'pont': 'Пон', 'vieux': 'Вьё', 'neuf': 'Нёф'},
               'de': {'sankt': 'Санкт', 'st.': 'Санкт', 'st': 'Санкт', 'bad': 'Бад', 'an': 'ан', 'der': 'дер', 'am': 'ам', 'im': 'им', 'auf': 'ауф', 'bei': 'бай',
                      'ob': 'об', 'unter': 'унтер', 'ober': 'обер', 'vor': 'фор', 'von': 'фон', 'zu': 'цу', 'zum': 'цум', 'zur': 'цур', 'und': 'унд'},
               'it': {'san': 'Сан', 'santa': 'Санта', 'santo': 'Санто', "sant'": 'Сант', 'sant': 'Сант', 'dell': 'делль', 'all': 'алль', 'nell': 'нелль', 'sull': 'сулль', 'di': 'ди', 'del': 'дель', 'della': 'делла', 'dei': 'деи', 'sul': 'суль',
                      'al': 'аль', 'in': 'ин', 'e': 'э'},
               'en': {'saint': 'Сент', 'st': 'Сент', 'st.': 'Сент', 'the': '', 'of': 'оф', 'and': 'энд', 'upon': 'апон', 'on': 'он', 'in': 'ин', 'by': 'бай',
                      'le': 'ле', 'la': 'ла'},
               'es': {'san': 'Сан', 'santa': 'Санта', 'santo': 'Санто', 'de': 'де', 'del': 'дель', 'la': 'ла', 'el': 'эль', 'los': 'лос', 'las': 'лас', 'y': 'и'},
               'nl': {'aan': 'ан', 'de': 'де', 'het': 'хет', 'van': 'ван', 'den': 'ден', 'der': 'дер', 'op': 'оп', "'s": 'с', 'sint': 'Синт'}}

def translit_word(w, host):
    if not w: return ''
    if CYR.search(w): return w
    lc = LANGCODE.get(host, 'en'); lw = w.lower()
    pw = PLACE_WORDS.get(lc, {})
    if lw in pw: return pw[lw]
    f = LANG.get(host, en_word)
    r = _tidy(f(w))
    return cap1(r) if w[:1].isupper() or w[:1].isdigit() else r

def ru_place(name, host, river=False):
    """Город, река, деревня — только транскрипция, с дефисами («Saint-Martin-en-Campagne» → «Сен-Мартен-ан-Кампань»).
    river — у рек артикль отбрасывается («La Vienne» → «Вьенна» по словарю, «Le Clain» → «Клен»)."""
    if not name: return ''
    if CYR.search(name): return name
    name = re.sub(r'\s*\(.*?\)', '', name).strip()
    if river: name = re.sub(r"^(?:[Ll]e|[Ll]a|[Ll]es|[Ll]['’]|[Ii]l|[Ll]o|[Ee]l|[Dd]e|[Hh]et|[Tt]he)\s*(?=[A-ZÀ-Ýa-z])", '', name).strip() or name
    name = re.sub(r"\b[Ll]['’]\s*", '', name); name = re.sub(r"\b([Dd])['’]\s*", 'd-', name)
    if LANGCODE.get(host) == 'it': name = re.sub(r"(\w)['’](\w)", r'\1 \2', name)
    parts = re.split(r"(\s+|-)", name); out = []
    for p in parts:
        if not p: continue
        if p.isspace() or p == '-':
            out.append(' ' if p.isspace() else '-'); continue
        if p in ('d', 'D'): out.append('д'); continue
        out.append(translit_word(p, host))
    t = re.sub(r'\s+', ' ', ''.join(out)).strip(' -')
    if not river: t = t.replace(' ', '-')
    t = re.sub(r'-+', '-', t)
    return cap1(t) if t else name

# ---------------------------------------------------------------- перевод родовых слов
# (рус., род: m — мужской, f — женский, n — средний, p — мн. число)
GEN = {
    # французский
    'eglise': ('церковь', 'f'), 'chapelle': ('часовня', 'f'), 'cathedrale': ('собор', 'm'), 'basilique': ('базилика', 'f'), 'abbaye': ('аббатство', 'n'),
    'abbatiale': ('аббатская церковь', 'f'), 'prieure': ('приорат', 'm'), 'collegiale': ('коллегиальная церковь', 'f'), 'monastere': ('монастырь', 'm'),
    'couvent': ('монастырь', 'm'), 'carmel': ('кармелитский монастырь', 'm'), 'chateau': ('замок', 'm'), 'fort': ('форт', 'm'), 'citadelle': ('цитадель', 'f'),
    'tour': ('башня', 'f'), 'donjon': ('донжон', 'm'), 'porte': ('ворота', 'p'), 'pont': ('мост', 'm'), 'moulin': ('мельница', 'f'), 'phare': ('маяк', 'm'),
    'gare': ('вокзал', 'm'), 'palais': ('дворец', 'm'), 'hotel': ('особняк', 'm'), 'manoir': ('усадьба', 'f'), 'monument': ('памятник', 'm'),
    'obelisque': ('обелиск', 'm'), 'statue': ('статуя', 'f'), 'colonne': ('колонна', 'f'), 'calvaire': ('распятие', 'n'), 'oratoire': ('часовня', 'f'),
    'remparts': ('крепостные стены', 'p'), 'enceinte': ('крепостная стена', 'f'), 'aqueduc': ('акведук', 'm'), 'arc': ('арка', 'f'), 'observatoire': ('обсерватория', 'f'),
    'viaduc': ('виадук', 'm'), 'ruines': ('руины', 'p'), 'vestiges': ('руины', 'p'), 'ermitage': ('скит', 'm'), 'synagogue': ('синагога', 'f'),
    'mosquee': ('мечеть', 'f'), 'beffroi': ('башня с часами', 'f'), 'mairie': ('мэрия', 'f'), 'temple': ('храм', 'm'), 'sanctuaire': ('святилище', 'n'),
    'tourelle': ('башенка', 'f'), 'maison': ('дом', 'm'), 'commanderie': ('командорство', 'n'), 'bastide': ('усадьба', 'f'), 'chartreuse': ('картезианский монастырь', 'm'),
    # немецкий
    'kirche': ('церковь', 'f'), 'kapelle': ('часовня', 'f'), 'dom': ('собор', 'm'), 'munster': ('собор', 'm'), 'basilika': ('базилика', 'f'),
    'kloster': ('монастырь', 'm'), 'abtei': ('аббатство', 'n'), 'stift': ('монастырь', 'm'), 'burg': ('замок', 'm'), 'schloss': ('замок', 'm'),
    'jagdschloss': ('охотничий замок', 'm'), 'burgruine': ('руины замка', 'p'), 'ruine': ('руины', 'p'), 'turm': ('башня', 'f'), 'tor': ('ворота', 'p'),
    'brucke': ('мост', 'm'), 'muhle': ('мельница', 'f'), 'windmuhle': ('ветряная мельница', 'f'), 'bahnhof': ('вокзал', 'm'), 'denkmal': ('памятник', 'm'),
    'saule': ('колонна', 'f'), 'warte': ('сторожевая башня', 'f'), 'rathaus': ('ратуша', 'f'), 'synagoge': ('синагога', 'f'),
    'wallfahrtskirche': ('паломническая церковь', 'f'), 'pfarrkirche': ('приходская церковь', 'f'), 'stadtkirche': ('городская церковь', 'f'),
    'dorfkirche': ('сельская церковь', 'f'), 'klosterkirche': ('монастырская церковь', 'f'), 'schlosskirche': ('замковая церковь', 'f'),
    'friedhofskapelle': ('кладбищенская часовня', 'f'), 'stadtmauer': ('городская стена', 'f'), 'stadttor': ('городские ворота', 'p'),
    'wasserturm': ('водонапорная башня', 'f'), 'aussichtsturm': ('смотровая башня', 'f'), 'mausoleum': ('мавзолей', 'm'), 'sternwarte': ('обсерватория', 'f'),
    'leuchtturm': ('маяк', 'm'), 'festung': ('крепость', 'f'), 'schanze': ('редут', 'm'), 'herrenhaus': ('усадьба', 'f'), 'gutshaus': ('усадьба', 'f'),
    'viadukt': ('виадук', 'm'), 'kaserne': ('казармы', 'p'), 'kreuz': ('крест', 'm'), 'wegkreuz': ('придорожный крест', 'm'), 'bildstock': ('придорожное распятие', 'n'),
    'munsterkirche': ('собор', 'm'), 'filialkirche': ('церковь', 'f'), 'hofkirche': ('придворная церковь', 'f'), 'gedachtniskirche': ('мемориальная церковь', 'f'),
    'stiftskirche': ('монастырская церковь', 'f'), 'kathedrale': ('собор', 'm'),
    # итальянский
    'chiesa': ('церковь', 'f'), 'cappella': ('часовня', 'f'), 'duomo': ('собор', 'm'), 'cattedrale': ('собор', 'm'), 'basilica': ('базилика', 'f'),
    'pieve': ('приходская церковь', 'f'), 'santuario': ('святилище', 'n'), 'abbazia': ('аббатство', 'n'), 'badia': ('аббатство', 'n'), 'convento': ('монастырь', 'm'),
    'monastero': ('монастырь', 'm'), 'castello': ('замок', 'm'), 'rocca': ('крепость', 'f'), 'fortezza': ('крепость', 'f'), 'forte': ('форт', 'm'),
    'torre': ('башня', 'f'), 'campanile': ('колокольня', 'f'), 'porta': ('ворота', 'p'), 'ponte': ('мост', 'm'), 'mulino': ('мельница', 'f'), 'faro': ('маяк', 'm'),
    'stazione': ('вокзал', 'm'), 'palazzo': ('дворец', 'm'), 'villa': ('вилла', 'f'), 'monumento': ('памятник', 'm'), 'colonna': ('колонна', 'f'),
    'mura': ('крепостные стены', 'p'), 'acquedotto': ('акведук', 'm'), 'oratorio': ('часовня', 'f'), 'battistero': ('баптистерий', 'm'), 'tempio': ('храм', 'm'),
    'arco': ('арка', 'f'), 'castellaccio': ('замок', 'm'), 'casa': ('дом', 'm'), 'certosa': ('картезианский монастырь', 'm'), 'collegiata': ('коллегиальная церковь', 'f'),
    'concattedrale': ('собор', 'm'), 'eremo': ('скит', 'm'), 'borgo': ('городок', 'm'),
    # испанский, каталанский, баскский
    'iglesia': ('церковь', 'f'), 'ermita': ('часовня', 'f'), 'capilla': ('часовня', 'f'), 'catedral': ('собор', 'm'), 'monasterio': ('монастырь', 'm'),
    'castillo': ('замок', 'm'), 'puente': ('мост', 'm'), 'molino': ('мельница', 'f'), 'estacion': ('вокзал', 'm'), 'palacio': ('дворец', 'm'),
    'murallas': ('крепостные стены', 'p'), 'acueducto': ('акведук', 'm'), 'parroquia': ('приходская церковь', 'f'), 'fuerte': ('форт', 'm'), 'puerta': ('ворота', 'p'),
    'esglesia': ('церковь', 'f'), 'castell': ('замок', 'm'), 'eliza': ('церковь', 'f'), 'baseliza': ('часовня', 'f'), 'torreon': ('башня', 'f'), 'atalaya': ('сторожевая башня', 'f'),
    # английский
    'church': ('церковь', 'f'), 'chapel': ('часовня', 'f'), 'cathedral': ('собор', 'm'), 'minster': ('собор', 'm'), 'abbey': ('аббатство', 'n'),
    'priory': ('приорат', 'm'), 'friary': ('монастырь', 'm'), 'convent': ('монастырь', 'm'), 'monastery': ('монастырь', 'm'), 'castle': ('замок', 'm'),
    'fortress': ('крепость', 'f'), 'tower': ('башня', 'f'), 'gate': ('ворота', 'p'), 'gateway': ('ворота', 'p'), 'bridge': ('мост', 'm'), 'mill': ('мельница', 'f'),
    'windmill': ('ветряная мельница', 'f'), 'watermill': ('водяная мельница', 'f'), 'lighthouse': ('маяк', 'm'), 'station': ('вокзал', 'm'),
    'depot': ('станция', 'f'), 'palace': ('дворец', 'm'), 'manor': ('усадьба', 'f'), 'pavilion': ('павильон', 'm'), 'pier': ('пирс', 'm'), 'memorial': ('мемориал', 'm'),
    'obelisk': ('обелиск', 'm'), 'column': ('колонна', 'f'), 'cross': ('крест', 'm'), 'folly': ('павильон', 'm'), 'mosque': ('мечеть', 'f'),
    'observatory': ('обсерватория', 'f'), 'viaduct': ('виадук', 'm'), 'aqueduct': ('акведук', 'm'), 'barracks': ('казармы', 'p'), 'kirk': ('церковь', 'f'),
    'meetinghouse': ('молитвенный дом', 'm'), 'mansion': ('особняк', 'm'), 'ruins': ('руины', 'p'), 'remains': ('руины', 'p'), 'oratory': ('часовня', 'f'),
    'tabernacle': ('молитвенный дом', 'm'), 'temple': ('храм', 'm'), 'shrine': ('святилище', 'n'), 'basilica': ('базилика', 'f'),
    # нидерландский
    'kerk': ('церковь', 'f'), 'kapel': ('часовня', 'f'), 'kathedraal': ('собор', 'm'), 'molen': ('мельница', 'f'), 'toren': ('башня', 'f'), 'kasteel': ('замок', 'm'),
    'slot': ('замок', 'm'), 'poort': ('ворота', 'p'), 'brug': ('мост', 'm'), 'klooster': ('монастырь', 'm'), 'abdij': ('аббатство', 'n'), 'vuurtoren': ('маяк', 'm'),
    'paleis': ('дворец', 'm'), 'buitenplaats': ('усадьба', 'f'), 'gemaal': ('насосная станция', 'f'),
}
# двухсловные и особые
GEN2 = {('hotel', 'de', 'ville'): ('ратуша', 'f'), ('town', 'hall'): ('ратуша', 'f'), ('city', 'hall'): ('ратуша', 'f'), ('meeting', 'house'): ('молитвенный дом', 'm'),
        ('friends', 'meeting', 'house'): ('молитвенный дом квакеров', 'm'), ('water', 'tower'): ('водонапорная башня', 'f'), ('clock', 'tower'): ('башня с часами', 'f'),
        ('bell', 'tower'): ('колокольня', 'f'), ('wind', 'mill'): ('ветряная мельница', 'f'), ('water', 'mill'): ('водяная мельница', 'f'),
        ('chateau', 'fort'): ('замок-крепость', 'm'), ('maison', 'forte'): ('укреплённый дом', 'm'), ('villa', 'reale'): ('королевская вилла', 'f'),
        ('round', 'tower'): ('круглая башня', 'f'), ('martello', 'tower'): ('башня Мартелло', 'f'), ('market', 'cross'): ('рыночный крест', 'm'),
        ('war', 'memorial'): ('военный мемориал', 'm'), ('railway', 'station'): ('вокзал', 'm'), ('train', 'station'): ('вокзал', 'm'),
        ('torre', 'civica'): ('городская башня', 'f'), ('torre', 'campanaria'): ('колокольня', 'f'), ('palazzo', 'comunale'): ('ратуша', 'f'),
        ('palazzo', 'pubblico'): ('ратуша', 'f'), ('palazzo', 'municipale'): ('ратуша', 'f'), ('casa', 'consistorial'): ('ратуша', 'f')}
# немецкие сложные слова: окончание → родовое слово; приставка — прилагательное или посвящение
DE_SUF = ['wallfahrtskirche', 'pfarrkirche', 'klosterkirche', 'schlosskirche', 'friedhofskapelle', 'gedachtniskirche', 'stiftskirche', 'hofkirche',
          'filialkirche', 'kirche', 'kapelle', 'munster', 'jagdschloss', 'schloss', 'burgruine', 'ruine', 'kloster', 'abtei', 'burg', 'turm', 'warte',
          'tor', 'brucke', 'windmuhle', 'muhle', 'denkmal', 'saule', 'bahnhof', 'festung', 'schanze', 'kreuz', 'dom', 'kerk', 'molen', 'toren', 'poort', 'kapel']
DE_PRE = {'pulver': 'пороховая', 'wasser': 'водонапорная', 'aussichts': 'смотровая', 'glocken': 'колокольная', 'uhr': 'часовая', 'wacht': 'сторожевая',
          'kirch': 'церковная', 'schloss': 'замковая', 'stadt': 'городская', 'dorf': 'сельская', 'friedhofs': 'кладбищенская', 'burg': 'замковая',
          'pfarr': 'приходская', 'wallfahrts': 'паломническая', 'kloster': 'монастырская', 'berg': 'горная', 'wind': 'ветряная', 'wasser-': 'водяная',
          'ober': 'верхняя', 'unter': 'нижняя', 'nieder': 'нижняя', 'alt': 'старая', 'neu': 'новая', 'haupt': 'главная', 'grenz': 'пограничная',
          'kaiser': 'императорская', 'konigs': 'королевская', 'jagd': 'охотничья', 'kriegs': 'военная', 'sieges': 'победная', 'oude': 'старая', 'nieuwe': 'новая',
          'grote': 'большая', 'westerkerk': 'западная', 'noorder': 'северная', 'zuider': 'южная', 'ooster': 'восточная', 'wester': 'западная'}
DEDIC = {  # посвящения без «св.»
    'marien': 'Девы Марии', 'frauen': 'Богоматери', 'liebfrauen': 'Богоматери', 'unserer lieben frau': 'Богоматери', 'notre-dame': 'Богоматери', 'notre dame': 'Богоматери',
    'our lady': 'Богоматери', 'madonna': 'Мадонны', 'nuestra senora': 'Богоматери', 'onze lieve vrouw': 'Богоматери', 'erloser': 'Спасителя', 'salvator': 'Спасителя',
    'sauveur': 'Спасителя', 'saviour': 'Спасителя', 'salvatore': 'Спасителя', 'redeemer': 'Спасителя', 'redentore': 'Спасителя', 'christus': 'Христа', 'christ': 'Христа',
    'cristo': 'Христа', 'friedens': 'Мира', 'herz-jesu': 'Сердца Иисуса', 'sacre-coeur': 'Святого Сердца', 'sacre coeur': 'Святого Сердца', 'sacred heart': 'Святого Сердца',
    'sacro cuore': 'Святого Сердца', 'dreifaltigkeits': 'Святой Троицы', 'dreifaltigkeit': 'Святой Троицы', 'trinite': 'Святой Троицы', 'sainte-trinite': 'Святой Троицы',
    'holy trinity': 'Святой Троицы', 'trinity': 'Святой Троицы', 'trinita': 'Святой Троицы', 'santissima trinita': 'Святой Троицы', 'heilig-kreuz': 'Святого Креста',
    'heiligkreuz': 'Святого Креста', 'sainte-croix': 'Святого Креста', 'holy cross': 'Святого Креста', 'santa croce': 'Святого Креста', 'santa cruz': 'Святого Креста',
    'heilig-geist': 'Святого Духа', 'heiliggeist': 'Святого Духа', 'saint-esprit': 'Святого Духа', 'holy spirit': 'Святого Духа', 'santo spirito': 'Святого Духа',
    'auferstehungs': 'Воскресения', 'resurrection': 'Воскресения', 'himmelfahrts': 'Вознесения', 'ascension': 'Вознесения', 'assumption': 'Успения',
    'assomption': 'Успения', 'annunciation': 'Благовещения', 'annonciation': 'Благовещения', 'all saints': 'Всех Святых', 'allerheiligen': 'Всех Святых',
    'tous-les-saints': 'Всех Святых', 'ognissanti': 'Всех Святых', 'holy family': 'Святого Семейства', 'familie': 'Святого Семейства', 'sainte-famille': 'Святого Семейства',
    'sacra famiglia': 'Святого Семейства', 'luther': 'Лютера', 'nepomuk': 'св. Иоанна Непомуцкого', 'emmanuel': 'Эммануила', 'immanuel': 'Эммануила',
    'gnaden': 'Благодати', 'visitation': 'Посещения', 'transfiguration': 'Преображения', 'epiphany': 'Богоявления', 'nativity': 'Рождества',
    'paulus': 'св. Павла', 'pauls': 'св. Павла', 'petri': 'св. Петра', 'nikolai': 'св. Николая', 'johannes': 'св. Иоанна', 'johannis': 'св. Иоанна',
    'jakobi': 'св. Иакова', 'marien-': 'Девы Марии', 'annen': 'св. Анны', 'georgs': 'св. Георгия', 'michaelis': 'св. Михаила', 'martini': 'св. Мартина',
}
SAINT_MARK = {'saint', 'sainte', 'saints', 'saintes', 'st', 'ste', 'sts', 'sankt', 'hl', 'heilige', 'heiliger', 'heiligen', 'san', 'santa', 'santo', 'santi',
              "sant'", 'sant', 's', 'sao', 'sint', 'sv', 'sw', 'saint-', 'ss'}
SAINTS = {
    'pierre': 'Петра', 'peter': 'Петра', 'petrus': 'Петра', 'pietro': 'Петра', 'pedro': 'Петра', 'pieter': 'Петра', 'pere': 'Петра', 'peters': 'Петра',
    'paul': 'Павла', 'paulus': 'Павла', 'paolo': 'Павла', 'pablo': 'Павла', 'pau': 'Павла', 'pauls': 'Павла',
    'jean': 'Иоанна', 'johannes': 'Иоанна', 'johann': 'Иоанна', 'john': 'Иоанна', 'giovanni': 'Иоанна', 'juan': 'Иоанна', 'jan': 'Иоанна', 'johns': 'Иоанна',
    'jacques': 'Иакова', 'jakob': 'Иакова', 'jacob': 'Иакова', 'james': 'Иакова', 'giacomo': 'Иакова', 'santiago': 'Иакова', 'jaime': 'Иакова', 'iago': 'Иакова',
    'michel': 'Михаила', 'michael': 'Михаила', 'michele': 'Михаила', 'miguel': 'Михаила', 'michiel': 'Михаила', 'michaels': 'Михаила',
    'nicolas': 'Николая', 'nikolaus': 'Николая', 'nicholas': 'Николая', 'nicola': 'Николая', 'nicolo': 'Николая', 'niklaus': 'Николая', 'nikolai': 'Николая', 'nicholass': 'Николая',
    'martin': 'Мартина', 'martino': 'Мартина', 'maarten': 'Мартина', 'martins': 'Мартина',
    'etienne': 'Стефана', 'stephan': 'Стефана', 'stephanus': 'Стефана', 'stefan': 'Стефана', 'stephen': 'Стефана', 'stefano': 'Стефана', 'esteban': 'Стефана', 'stephens': 'Стефана',
    'georges': 'Георгия', 'georg': 'Георгия', 'george': 'Георгия', 'giorgio': 'Георгия', 'jorge': 'Георгия', 'joris': 'Георгия', 'georgs': 'Георгия',
    'andre': 'Андрея', 'andreas': 'Андрея', 'andrew': 'Андрея', 'andrea': 'Андрея', 'andres': 'Андрея', 'andries': 'Андрея', 'andrews': 'Андрея',
    'marie': 'Марии', 'maria': 'Марии', 'mary': 'Марии', 'mariae': 'Марии', 'marys': 'Марии', 'mariä': 'Марии',
    'anne': 'Анны', 'anna': 'Анны', 'ana': 'Анны', 'annes': 'Анны',
    'joseph': 'Иосифа', 'josef': 'Иосифа', 'giuseppe': 'Иосифа', 'jose': 'Иосифа', 'josephs': 'Иосифа',
    'laurent': 'Лаврентия', 'lorenz': 'Лаврентия', 'laurentius': 'Лаврентия', 'lawrence': 'Лаврентия', 'laurence': 'Лаврентия', 'lorenzo': 'Лаврентия',
    'barthelemy': 'Варфоломея', 'bartholomaus': 'Варфоломея', 'bartholomew': 'Варфоломея', 'bartolomeo': 'Варфоломея', 'bartolome': 'Варфоломея',
    'denis': 'Дионисия', 'dionysius': 'Дионисия', 'remy': 'Ремигия', 'remi': 'Ремигия', 'remigius': 'Ремигия', 'germain': 'Германа', 'hilaire': 'Илария',
    'hilarius': 'Илария', 'aignan': 'Аньяна', 'gervais': 'Гервасия', 'protais': 'Протасия', 'pantaleon': 'Пантелеймона', 'lomer': 'Ломера', 'foy': 'Веры',
    'eutrope': 'Евтропия', 'saturnin': 'Сатурнина', 'sernin': 'Сатурнина', 'roch': 'Роха', 'rochus': 'Роха', 'rocco': 'Роха', 'roque': 'Роха',
    'sebastien': 'Себастьяна', 'sebastian': 'Себастьяна', 'sebastiano': 'Себастьяна', 'antoine': 'Антония', 'antonius': 'Антония', 'anton': 'Антония',
    'anthony': 'Антония', 'antonio': 'Антония', 'hubert': 'Губерта', 'hubertus': 'Губерта', 'lambert': 'Ламберта', 'lambertus': 'Ламберта',
    'remacle': 'Ремакля', 'remaclus': 'Ремакля', 'quirin': 'Квирина', 'quirinus': 'Квирина', 'vitus': 'Вита', 'veit': 'Вита', 'vito': 'Вита', 'guy': 'Вита',
    'simon': 'Симона', 'jude': 'Иуды', 'juda': 'Иуды', 'judas': 'Иуды', 'luc': 'Луки', 'lukas': 'Луки', 'luke': 'Луки', 'luca': 'Луки', 'lucas': 'Луки', 'lukes': 'Луки',
    'marc': 'Марка', 'markus': 'Марка', 'mark': 'Марка', 'marco': 'Марка', 'marcos': 'Марка', 'matthieu': 'Матфея', 'matthaus': 'Матфея', 'matthew': 'Матфея',
    'matteo': 'Матфея', 'mateo': 'Матфея', 'thomas': 'Фомы', 'tommaso': 'Фомы', 'tomas': 'Фомы', 'philippe': 'Филиппа', 'philipp': 'Филиппа', 'philip': 'Филиппа',
    'filippo': 'Филиппа', 'felipe': 'Филиппа', 'catherine': 'Екатерины', 'katharina': 'Екатерины', 'katherine': 'Екатерины', 'caterina': 'Екатерины',
    'catalina': 'Екатерины', 'marguerite': 'Маргариты', 'margarete': 'Маргариты', 'margaret': 'Маргариты', 'margherita': 'Маргариты', 'margarets': 'Маргариты',
    'madeleine': 'Марии Магдалины', 'magdalena': 'Марии Магдалины', 'magdalene': 'Марии Магдалины', 'maddalena': 'Марии Магдалины', 'magdalenes': 'Марии Магдалины',
    'agnes': 'Агнессы', 'barbara': 'Варвары', 'claire': 'Клары', 'klara': 'Клары', 'clare': 'Клары', 'chiara': 'Клары', 'clara': 'Клары', 'cecile': 'Цецилии',
    'cecilia': 'Цецилии', 'elisabeth': 'Елизаветы', 'elizabeth': 'Елизаветы', 'elisabetta': 'Елизаветы', 'gertrude': 'Гертруды', 'gertrud': 'Гертруды',
    'ursule': 'Урсулы', 'ursula': 'Урсулы', 'helene': 'Елены', 'helena': 'Елены', 'helen': 'Елены', 'elena': 'Елены', 'blaise': 'Власия', 'blasius': 'Власия',
    'biagio': 'Власия', 'clement': 'Климента', 'clemens': 'Климента', 'clemente': 'Климента', 'benoit': 'Бенедикта', 'benedikt': 'Бенедикта',
    'benedict': 'Бенедикта', 'benedetto': 'Бенедикта', 'francois': 'Франциска', 'franziskus': 'Франциска', 'francis': 'Франциска', 'francesco': 'Франциска',
    'francisco': 'Франциска', 'dominique': 'Доминика', 'dominikus': 'Доминика', 'dominic': 'Доминика', 'domenico': 'Доминика', 'augustin': 'Августина',
    'augustinus': 'Августина', 'augustine': 'Августина', 'agostino': 'Августина', 'ambroise': 'Амвросия', 'ambrosius': 'Амвросия', 'ambrogio': 'Амвросия',
    'gregoire': 'Григория', 'gregor': 'Григория', 'gregory': 'Григория', 'gregorio': 'Григория', 'leonard': 'Леонарда', 'leonhard': 'Леонарда',
    'leonardo': 'Леонарда', 'wolfgang': 'Вольфганга', 'ulrich': 'Ульриха', 'florian': 'Флориана', 'valentin': 'Валентина', 'valentine': 'Валентина',
    'valentino': 'Валентина', 'vincent': 'Викентия', 'vinzenz': 'Викентия', 'vincenzo': 'Викентия', 'vicente': 'Викентия', 'maurice': 'Маврикия',
    'mauritius': 'Маврикия', 'moritz': 'Маврикия', 'maurizio': 'Маврикия', 'gall': 'Галла', 'gallus': 'Галла', 'kilian': 'Килиана', 'bonifatius': 'Бонифация',
    'boniface': 'Бонифация', 'patrick': 'Патрика', 'patricks': 'Патрика', 'bridget': 'Бригитты', 'brigid': 'Бригитты', 'columba': 'Колумбы', 'colombe': 'Колумбы',
    'david': 'Давида', 'edward': 'Эдуарда', 'alban': 'Албана', 'cuthbert': 'Катберта', 'giles': 'Эгидия', 'gilles': 'Эгидия', 'egidio': 'Эгидия',
    'swithun': 'Свитина', 'wilfrid': 'Уилфрида', 'botolph': 'Ботольфа', 'dunstan': 'Дунстана', 'oswald': 'Освальда', 'kevin': 'Кевина', 'aidan': 'Айдана',
    'barnabas': 'Варнавы', 'barnabe': 'Варнавы', 'barnaba': 'Варнавы', 'bernard': 'Бернарда', 'bernhard': 'Бернарда', 'bernardo': 'Бернарда',
    'jerome': 'Иеронима', 'girolamo': 'Иеронима', 'eloi': 'Элигия', 'medard': 'Медарда', 'marcel': 'Марцелла', 'julien': 'Юлиана', 'julian': 'Юлиана',
    'maximin': 'Максимина', 'pons': 'Понтия', 'ruf': 'Руфа', 'agricol': 'Агрикола', 'didier': 'Дезидерия', 'symphorien': 'Симфориана', 'sidoine': 'Сидония',
    'elme': 'Эльма', 'erasme': 'Эразма', 'lazare': 'Лазаря', 'lazarus': 'Лазаря', 'gabriel': 'Гавриила', 'raphael': 'Рафаила', 'cyr': 'Кирика',
    'saturnino': 'Сатурнина', 'ignatius': 'Игнатия', 'ignace': 'Игнатия', 'ignazio': 'Игнатия', 'ignacio': 'Игнатия', 'agatha': 'Агаты', 'agata': 'Агаты',
    'lucie': 'Луции', 'lucia': 'Луции', 'margarethe': 'Маргариты', 'ottilie': 'Оттилии', 'odile': 'Оттилии', 'arbogast': 'Арбогаста', 'leger': 'Леодегария',
    'loup': 'Лупа', 'eustache': 'Евстафия', 'vaast': 'Ведаста', 'firmin': 'Фирмина', 'acheul': 'Ашёля', 'gaudens': 'Годенция', 'bertrand': 'Бертрана',
    'sulpice': 'Сульпиция', 'severin': 'Северина', 'apollinare': 'Аполлинария', 'vitale': 'Виталия', 'zeno': 'Зенона', 'zenone': 'Зенона', 'cetteo': 'Четтео',
    'emidio': 'Эмидия', 'domingo': 'Доминика', 'sebastia': 'Себастьяна', 'ines': 'Агнессы', 'mamés': 'Мамы', 'mames': 'Мамы', 'leodegar': 'Леодегария',
    'lufthildis': 'Луфтхильды', 'nepomuk': 'Иоанна Непомуцкого', 'esprit': 'Духа', 'gervasius': 'Гервасия', 'protasius': 'Протасия', 'aegidius': 'Эгидия',
    'konrad': 'Конрада', 'heinrich': 'Генриха', 'kunigunde': 'Кунигунды', 'wendelin': 'Венделина', 'pankratius': 'Панкратия', 'cyriakus': 'Кириака',
    'nazaire': 'Назария', 'celse': 'Цельса', 'bénézet': 'Бенезета', 'benezet': 'Бенезета', 'trophime': 'Трофима', 'pancrace': 'Панкратия', 'amand': 'Аманда',
}
EPITHET = {'baptiste': 'Крестителя', 'baptist': 'Крестителя', 'battista': 'Крестителя', 'bautista': 'Крестителя', 'taufer': 'Крестителя', 'evangeliste': 'Евангелиста',
           'evangelist': 'Евангелиста', 'evangelista': 'Евангелиста', 'apostle': 'Апостола', 'apotre': 'Апостола', 'majeur': 'Старшего', 'mineur': 'Младшего',
           'major': 'Старшего', 'minor': 'Младшего', 'maggiore': 'Старшего', 'magdalene': 'Магдалины', 'magdalena': 'Магдалины', 'madeleine': 'Магдалины',
           'nepomuk': 'Непомуцкого', 'nepomucene': 'Непомуцкого', 'the': ''}
ADJ = {  # женский род; другие формы — по правилам
    'protestant': 'протестантская', 'protestante': 'протестантская', 'protestantische': 'протестантская', 'evangelisch': 'евангелическая', 'evangelische': 'евангелическая',
    'ev': 'евангелическая', 'evangelical': 'евангелическая', 'evangelique': 'евангелическая', 'evangelica': 'евангелическая', 'catholic': 'католическая', 'catholique': 'католическая',
    'katholisch': 'католическая', 'katholische': 'католическая', 'kath': 'католическая', 'cattolica': 'католическая', 'catolica': 'католическая',
    'baptist': 'баптистская', 'baptiste': 'баптистская', 'methodist': 'методистская', 'methodiste': 'методистская', 'wesleyan': 'методистская', 'unitarian': 'унитарианская',
    'presbyterian': 'пресвитерианская', 'congregational': 'конгрегационалистская', 'lutheran': 'лютеранская', 'lutherische': 'лютеранская', 'reformed': 'реформатская',
    'reformee': 'реформатская', 'reformierte': 'реформатская', 'anglican': 'англиканская', 'orthodox': 'православная', 'orthodoxe': 'православная',
    'ortodossa': 'православная', 'greek': 'греческая', 'grecque': 'греческая', 'russian': 'русская', 'russe': 'русская', 'russische': 'русская',
    'episcopal': 'епископальная', 'spiritualist': 'спиритуалистская', 'adventist': 'адвентистская', 'old': 'старая', 'vieux': 'старая', 'vieille': 'старая',
    'vieil': 'старая', 'alt': 'старая', 'alte': 'старая', 'alter': 'старая', 'altes': 'старая', 'oude': 'старая', 'vecchio': 'старая', 'vecchia': 'старая', 'viejo': 'старая',
    'new': 'новая', 'neuf': 'новая', 'neuve': 'новая', 'neu': 'новая', 'neue': 'новая', 'neuer': 'новая', 'neues': 'новая', 'nieuwe': 'новая', 'nuovo': 'новая',
    'nuova': 'новая', 'nuevo': 'новая', 'royal': 'королевская', 'royale': 'королевская', 'konigliche': 'королевская', 'reale': 'королевская', 'real': 'королевская',
    'grand': 'большая', 'grande': 'большая', 'gross': 'большая', 'grosse': 'большая', 'grosser': 'большая', 'grosses': 'большая', 'grote': 'большая',
    'petit': 'малая', 'petite': 'малая', 'klein': 'малая', 'kleine': 'малая', 'kleiner': 'малая', 'kleines': 'малая', 'piccolo': 'малая',
    'upper': 'верхняя', 'haut': 'верхняя', 'haute': 'верхняя', 'lower': 'нижняя', 'bas': 'нижняя', 'basse': 'нижняя', 'parish': 'приходская',
    'paroissiale': 'приходская', 'parrocchiale': 'приходская', 'parroquial': 'приходская', 'ducal': 'герцогская', 'ducale': 'герцогская', 'imperial': 'императорская',
    'imperiale': 'императорская', 'kaiserliche': 'императорская', 'roman': 'римская', 'romain': 'римская', 'romaine': 'римская', 'romische': 'римская',
    'romano': 'римская', 'romana': 'римская', 'medieval': 'средневековая', 'medievale': 'средневековая', 'mittelalterliche': 'средневековая', 'united': 'объединённая',
    'christian': 'христианская', 'jewish': 'еврейская', 'military': 'военная', 'militaire': 'военная', 'municipal': 'городская', 'municipale': 'городская',
    'franciscain': 'францисканская', 'franciscaine': 'францисканская', 'franciscan': 'францисканская', 'francescano': 'францисканская', 'dominican': 'доминиканская',
    'benedictine': 'бенедиктинская', 'commemoratif': 'мемориальная', 'commemorative': 'мемориальная', 'national': 'национальная', 'nationale': 'национальная',
    'fortified': 'укреплённая', 'fortifie': 'укреплённая', 'fortifiee': 'укреплённая', 'wehr': 'укреплённая', 'collegiate': 'коллегиальная', 'abbatial': 'аббатская',
    'north': 'северная', 'south': 'южная', 'east': 'восточная', 'west': 'западная', 'nord': 'северная', 'sud': 'южная', 'est': 'восточная', 'ouest': 'западная',
    'nuestra': '', 'notre': '', 'heilige': '', 'saint': '',
}
GENNOUN = {'prefecture': 'префектуры', 'justice': 'правосудия', 'papes': 'пап', 'ducs': 'герцогов', 'rois': 'королей', 'eveques': 'епископов', 'eveque': 'епископа',
           'comtes': 'графов', 'templiers': 'тамплиеров', 'gouverneur': 'губернатора', 'ville': 'города', 'archeveche': 'архиепископа', 'senat': 'сената',
           'templars': 'тамплиеров', 'kings': 'королей', 'bishops': 'епископов', 'duke': 'герцога', 'dukes': 'герцогов', 'governor': 'губернатора',
           'angels': 'ангелов', 'ange': 'ангела', 'anges': 'ангелов', 'engel': 'ангелов', 'apostles': 'апостолов', 'apotres': 'апостолов', 'martyrs': 'мучеников',
           'innocents': 'Невинных младенцев', 'graces': 'Милостей', 'vierge': 'Девы', 'virgin': 'Девы', 'vergine': 'Девы', 'virgen': 'Девы'}

def adj_form(f, g):
    if not f: return ''
    if g == 'f': return f
    if f.endswith('ская') or f.endswith('цкая'): st = f[:-2]; return st + {'m': 'ий', 'n': 'ое', 'p': 'ие'}[g]
    if f.endswith('няя'): st = f[:-2]; return st + {'m': 'ий', 'n': 'ее', 'p': 'ие'}[g]
    if f.endswith('шая'): st = f[:-2]; return st + {'m': 'ой', 'n': 'ое', 'p': 'ие'}[g]
    if f.endswith(('кая', 'гая', 'хая')): st = f[:-2]; return st + {'m': 'ий', 'n': 'ое', 'p': 'ие'}[g]
    if f.endswith('ённая'): st = f[:-2]; return st + {'m': 'ый', 'n': 'ое', 'p': 'ые'}[g]
    if f.endswith('ая'): st = f[:-2]; return st + {'m': 'ый', 'n': 'ое', 'p': 'ые'}[g]
    return f

STOP = {'de', 'du', 'des', 'la', 'le', 'les', "l'", "d'", 'l', 'd', 'von', 'vom', 'zu', 'zum', 'zur', 'der', 'die', 'das', 'den', 'dem', 'di', 'del', 'della',
        'dei', 'degli', 'dello', 'delle', 'of', 'the', 'and', 'et', 'und', 'e', 'y', 'i', 'en', 'in', 'am', 'an', 'im', 'auf', 'bei', 'a', 'al', 'au', 'aux',
        'sur', 'sous', 'pres', 'lès', 'les', 'van', 'het', 'op', 'at', 'on', 'by', 'el', 'los', 'las', 'do', 'da', 'dos', 'das', "'s", 's'}
CUT = re.compile(r'\s+(?:actuellement|aujourd\'hui|dite?s?|genannt|heute|jetzt|now|currently|also known as|aka|detto|detta|oggi|attualmente|ora|ahora)\b.*$', re.I)
FORMER = re.compile(r'^\s*(?:ehem\.?|ehemalige[rsn]?|former|ancien(?:ne)?s?|ex[- ]|old site of|site of|remains of|vestiges? d[eu\']|ruins of|rovine|ruderi|resti)\b', re.I)

def _tokens(s):
    """→ [(слово, разделитель перед ним)] с отделёнными «l'»/«d'» и дефисами"""
    out = []; sep = ''
    for m in re.finditer(r"([^\s\-'’/]+'?|['’]|[\s/]+|-)", s):
        t = m.group(1)
        if t.isspace() or t == '/': sep = ' '; continue
        if t == '-': sep = '-'; continue
        if t in ("'", '’'): sep = "'"; continue
        out.append([t, sep]); sep = ''
    return out

def clean_name(name):
    s = re.sub(r'\s*[\(\[].*?[\)\]]', '', name or '').strip()
    s = CUT.sub('', s)
    for sp in (' - ', ' – ', ' — ', ', ', '; ', ' / ', ': '):
        if sp in s:
            a = s.split(sp)[0].strip()
            if len(a) >= 4: s = a
    s = re.sub(r"\b([ldLD])['’]\s*", r"\1' ", s)
    return s.strip()

def is_former(name):
    return bool(FORMER.search(name or ''))

def _join_saints(names):
    names = [n for n in names if n]
    if not names: return ''
    if len(names) == 1: return names[0]
    return ', '.join(names[:-1]) + ' и ' + names[-1]

KIND_RU = {'cathedral': ('собор', 'm'), 'church': ('церковь', 'f'), 'chapel': ('часовня', 'f'), 'castle': ('замок', 'm'), 'palace': ('дворец', 'm'),
           'manor': ('усадьба', 'f'), 'fort': ('крепость', 'f'), 'ruins': ('руины', 'p'), 'monastery': ('монастырь', 'm'), 'gate': ('ворота', 'p'),
           'wall': ('стена', 'f'), 'tower': ('башня', 'f'), 'lighthouse': ('маяк', 'm'), 'windmill': ('мельница', 'f'), 'watermill': ('водяная мельница', 'f'),
           'monument': ('памятник', 'm'), 'obelisk': ('обелиск', 'm'), 'statue': ('статуя', 'f'), 'column': ('колонна', 'f'), 'station': ('вокзал', 'm'),
           'mosque': ('мечеть', 'f'), 'pagoda': ('пагода', 'f'), 'aqueduct': ('акведук', 'm'), 'observatory': ('обсерватория', 'f'),
           'water_tower': ('водонапорная башня', 'f')}
EXACT = {'pont saint-benezet': 'Авиньонский мост', 'pont d\'avignon': 'Авиньонский мост', 'mauseturm': 'Мышиная башня', 'palais des papes': 'Папский дворец',
         'royal pavilion': 'Королевский павильон', 'wellington monument': 'Памятник Веллингтону', 'scrabo tower': 'Башня Скрабо',
         'trophee d\'auguste': 'Трофей Августа', 'trophee des alpes': 'Трофей Августа', 'grosse point lighthouse': 'Маяк Гросс-Пойнт',
         'old dutch church': 'Старая голландская церковь', 'magazine fort': 'Пороховой форт', 'phoenix monument': 'Колонна Феникса',
         'villa reale': 'Королевская вилла', 'castello sforzesco': 'Замок Сфорца', 'semmeringbahn': 'Земмерингская железная дорога',
         'funkturm berlin': 'Берлинская радиобашня', 'funkturm': 'Берлинская радиобашня', 'palace of fine arts': 'Дворец изящных искусств',
         'lady chapel': 'Часовня Богоматери', 'guildhall': 'Гилдхолл', 'market cross': 'Рыночный крест', 'monumento al leone': 'Памятник льву',
         'el leon': 'Львиный памятник', 'pulkovo observatory': 'Пулковская обсерватория'}
LATIN = ('fr', 'be', 'mc', 'it', 'es')
COMPOUND = ('de', 'at', 'ch', 'nl')
for _k, _v in {'dutch': 'голландская', 'french': 'французская', 'german': 'немецкая', 'english': 'английская', 'scottish': 'шотландская', 'scots': 'шотландская',
               'irish': 'ирландская', 'welsh': 'валлийская', 'italian': 'итальянская', 'swedish': 'шведская', 'norwegian': 'норвежская', 'danish': 'датская',
               'polish': 'польская', 'armenian': 'армянская', 'first': 'первая', 'congregationalist': 'конгрегационалистская', 'moravian': 'моравская',
               'quaker': 'квакерская', 'romanesque': 'романская', 'gothic': 'готическая', 'gothique': 'готическая', 'byzantine': 'византийская'}.items():
    ADJ[_k] = _v
DEDIC.update({'michael and all angels': 'св. Михаила и всех ангелов', 'st michael and all angels': 'св. Михаила и всех ангелов', 'all angels': 'всех ангелов',
              'our lady of': 'Богоматери', 'christ church': 'Христа', 'christchurch': 'Христа'})
DE_SUF[:] = [x for x in DE_SUF if x not in ('burg',)]

def ru_label(name, host, kind=None, kind_ru=None):
    """Имя приметы по-русски. kind — вид приметы (если в имени родового слова нет, берём по виду: «церковь», «замок»…)"""
    if not name: return ''
    if CYR.search(name): return shorten_ru(name)
    if CJK.search(name): return cn_label(name, kind)
    s = clean_name(name)
    s = FORMER.sub('', s).strip() or s
    s = re.sub(r"(?i)(\w)['’]s\b", r'\1', s)  # St Peter's → St Peter
    ex = EXACT.get(fold(s).strip())
    if ex: return ex
    if kind_ru is None: kind_ru = KIND_RU.get(kind)
    toks = _tokens(s)
    if not toks: return ''
    F = [fold(t).rstrip('.').replace('’', "'") for t, _ in toks]
    n_t = len(F); used = [False] * n_t
    generic = None; gpos = None; gender = 'f'; adjc = {}; pre_adj = []; saints = []; dedic = None; epi = []; gen_tail = []
    for n in (3, 2):  # двух- и трёхсловные родовые слова
        for i in range(n_t - n + 1):
            key = tuple(F[i:i + n])
            if key in GEN2 and generic is None and not any(used[i:i + n]):
                generic, gender = GEN2[key]; gpos = i
                for k in range(i, i + n): used[k] = True
    for n in (4, 3, 2):  # посвящения из нескольких слов
        for i in range(n_t - n + 1):
            if any(used[i:i + n]) or dedic: continue
            d = DEDIC.get(' '.join(F[i:i + n])) or DEDIC.get('-'.join(F[i:i + n]))
            if d:
                dedic = d
                for k in range(i, i + n): used[k] = True
    i = 0
    while i < n_t:
        if used[i]: i += 1; continue
        f = F[i]
        if generic is None and f in GEN:
            generic, gender = GEN[f]; gpos = i; used[i] = True; i += 1; continue
        if generic is None and host in COMPOUND:
            for suf in DE_SUF:
                if f.endswith(suf) and len(f) > len(suf) + 1 and suf in GEN:
                    pre = f[:-len(suf)].rstrip('-')
                    generic, gender = GEN[suf]; gpos = i; used[i] = True
                    if pre in DE_PRE: pre_adj.append(DE_PRE[pre])
                    elif pre in DEDIC: dedic = DEDIC[pre]
                    elif pre.rstrip('s') in DEDIC: dedic = DEDIC[pre.rstrip('s')]
                    elif pre in SAINTS: saints.append(SAINTS[pre])
                    elif pre.endswith('s') and pre[:-1] in SAINTS: saints.append(SAINTS[pre[:-1]])
                    elif len(pre) >= 3: gen_tail.append(cap1(translit_word(toks[i][0][:len(pre)], host)))
                    break
            if used[i]: i += 1; continue
        if f in DEDIC and not dedic:
            dedic = DEDIC[f]; used[i] = True; i += 1; continue
        if f in SAINT_MARK and i + 1 < n_t:
            j = i + 1; got = []
            while j < n_t:
                g = F[j]
                if used[j]: break
                if g in SAINT_MARK: j += 1; continue
                if g in DEDIC and not got and g not in SAINTS:
                    dedic = DEDIC[g]; j += 1; break
                if g in ('et', 'und', 'and', 'e', 'y', '&', 'i'):
                    if j + 1 < n_t and (F[j + 1] in SAINTS or F[j + 1] in SAINT_MARK): j += 1; continue
                    break
                if got and g in EPITHET:
                    if EPITHET[g]: epi.append(EPITHET[g])
                    j += 1; continue
                if g in ('der', 'le', 'la', 'il', 'the') and got and j + 1 < n_t and F[j + 1] in EPITHET: j += 1; continue
                if g in SAINTS: got.append(SAINTS[g]); j += 1; continue
                if not got and g not in GEN and g not in STOP:
                    got.append(cap1(translit_word(toks[j][0], host))); j += 1; continue
                break
            if got or dedic:
                saints += got
                for k in range(i, j): used[k] = True
                i = j; continue
        if f in ADJ:
            adjc[i] = ADJ[f]; i += 1; continue
        if f in GENNOUN and generic is not None:
            gen_tail.append(GENNOUN[f]); used[i] = True; i += 1; continue
        i += 1
    # прилагательные — только рядом с родовым словом (слева; во французском, итальянском, испанском — и справа)
    adjs = list(pre_adj)
    if gpos is not None:
        left = []; k = gpos - 1
        while k >= 0 and k in adjc and not used[k]: left.insert(0, k); k -= 1
        right = []; k = gpos + 1
        while host in LATIN and k < n_t and k in adjc and not used[k]: right.append(k); k += 1
        own = []
        for k in left + right:
            used[k] = True
            if adjc[k]: own.append(adjc[k])
        adjs = own + list(pre_adj)
    rest = [(k, t, sp) for k, (t, sp) in enumerate(toks) if not used[k]]
    while rest and fold(rest[0][1]).rstrip("'.") in STOP: rest.pop(0)
    while rest and fold(rest[-1][1]).rstrip("'.") in STOP: rest.pop()
    proper = ''
    if rest and not saints and not dedic:
        parts = []
        for k, t, sp in rest:
            ft = fold(t).rstrip("'")
            w = PLACE_WORDS.get(LANGCODE.get(host, 'en'), {}).get(ft)
            if w is None: w = translit_word(t, host)
            if not w: continue
            if parts: parts.append('-' if sp == '-' else ' ')
            parts.append(w)
        proper = re.sub(r'\s+', ' ', ''.join(parts)).strip(' -')
        proper = ' '.join(cap1(p) if fold(p) not in ('ле', 'ла', 'де', 'дю', 'ди', 'дель', 'фон', 'ван', 'оф', 'ан', 'сюр') else p for p in proper.split(' '))
    if generic is None and kind_ru: generic, gender = kind_ru
    if generic is None and not (saints or dedic or proper): return ''
    def head_of(ad): return ' '.join(x for x in ([adj_form(a, gender) for a in ad] + [generic or '']) if x)
    tail = ''
    if saints: tail = 'св. ' + _join_saints(saints) + ((' ' + ' '.join(epi)) if epi else '')
    elif dedic: tail = dedic
    if gen_tail: tail = (tail + ' ' if tail else '') + ' '.join(gen_tail)
    head = head_of(adjs)
    full = ' '.join(x for x in (head, tail, proper) if x).strip()
    if len(full) > MAXLEN and proper:
        full = ' '.join(x for x in (head, tail) if x).strip() or proper
    while len(full) > MAXLEN and adjs:
        adjs.pop(0); head = head_of(adjs); full = ' '.join(x for x in (head, tail) if x).strip()
    if len(full) > MAXLEN and tail and generic:
        full = generic
    if not full: return ''
    return cap1(full)

def shorten_ru(s):
    s = re.sub(r'\s*\(.*?\)', '', s).strip()
    s = re.sub(r'\s+в честь\s+', ' ', s)
    if len(s) > MAXLEN:
        m = re.match(r'^(.{8,}?)\s+(?:в|во|на|у|близ|около|при)\s+[А-ЯЁ].*$', s)
        if m: s = m.group(1)
    if len(s) > MAXLEN:
        w = s.split(' '); out = ''
        for x in w:
            if len(out) + len(x) + 1 > MAXLEN: break
            out = (out + ' ' + x).strip()
        s = out or s[:MAXLEN]
    return s

# ---------------------------------------------------------------- Китай: застава Цзюйюнгуань и Великая стена
CN_PLACES = {'居庸关': 'Цзюйюнгуань', '八达岭': 'Бадалин', '岔道': 'Чадао', '南口': 'Наньков', '昌平': 'Чанпин', '延庆': 'Яньцин', '上关': 'Шангуань',
             '弹琴峡': 'Таньциньсяо', '北京': 'Пекин', '青龙桥': 'Цинлунцяо', '詹天佑': 'Чжань Тяньюя', '十三陵': 'гробниц Мин', '明': 'Мин', '石佛寺': 'Шифосы',
             '水关': 'Шуйгуань', '残长城': 'Великая стена', '五郎像': 'Улансян', '望京': 'Ванцзин', '关沟': 'Гуаньгоу', '居庸': 'Цзюйюн', '南关': 'южной заставы',
             '北关': 'северной заставы', '西关': 'западной заставы', '东关': 'восточной заставы'}
CN_SUF = [('关城', 'Крепость заставы'), ('瓮城', 'Барбакан'), ('云台', 'Облачная терраса'), ('敌楼', 'Сторожевая башня'), ('烽火台', 'Сигнальная башня'),
          ('城楼', 'Надвратная башня'), ('长城', 'Великая Китайская стена'), ('寺', 'Монастырь'), ('庙', 'Храм'), ('宫', 'Дворец'), ('塔', 'Пагода'),
          ('楼', 'Башня'), ('门', 'Ворота'), ('桥', 'Мост'), ('城', 'Крепость'), ('关', 'Застава'), ('站', 'Станция'), ('碑', 'Стела'), ('陵', 'Гробница'),
          ('亭', 'Беседка'), ('台', 'Терраса'), ('堡', 'Крепость'), ('墩', 'Сигнальная башня')]
def cn_label(name, kind=None):
    s = re.sub(r'[\s\(\)（）0-9a-zA-Z#\-]+', '', name)
    if '长城' in s: return 'Великая Китайская стена'
    for suf, ru in CN_SUF:
        if s.endswith(suf):
            pre = s[:-len(suf)]
            if not pre: return ru
            for k in sorted(CN_PLACES, key=len, reverse=True):
                if pre == k or pre.endswith(k) or pre.startswith(k):
                    w = CN_PLACES[k]
                    return (ru + ' ' + w) if not w[0].islower() else (ru + ' ' + w)
            return ru
    for k in sorted(CN_PLACES, key=len, reverse=True):
        if k in s: return CN_PLACES[k]
    return ''

# ---------------------------------------------------------------- проверка
if __name__ == '__main__':
    T = [('Église Saint-Pierre', 'fr', 'church'), ('Château de Fargues', 'fr', 'castle'), ('Hôtel de Montaigu', 'fr', 'castle'), ('Abbaye Saint-Ruf', 'fr', 'monastery'),
         ('Tour Philippe le Bel', 'fr', 'tower'), ('Palais du Roure', 'fr', 'palace'), ('Fort Saint-André', 'fr', 'fort'), ('Pont Saint-Bénézet', 'fr', 'ruins'),
         ("Carmel d'Avignon", 'fr', 'monastery'), ('Porte Saint-Lazare', 'fr', 'gate'), ('Château de Boulard', 'fr', 'castle'), ('Église Saint-Hilaire', 'fr', 'church'),
         ('Église Sainte-Foy', 'fr', 'church'), ('Temple', 'fr', 'church'), ('Collégiale Saint-André', 'fr', 'church'), ('Chapelle Notre-Dame de la Brèche', 'fr', 'chapel'),
         ('Église Saint-Gervais-et-Saint-Protais', 'fr', 'church'), ('Fort du Mont Alban', 'fr', 'fort'), ('Citadelle Saint-Elme', 'fr', 'castle'),
         ('Fort de la Revère', 'fr', 'fort'), ('Monastère Franciscain de Cimiez', 'fr', 'monastery'), ('Ancienne abbaye de Saint-Pons actuellement hôpital Pasteur', 'fr', 'monastery'),
         ('Palais de la Préfecture (ancien palais des rois de Sardaigne)', 'fr', 'palace'), ('Monastère Sainte-Claire de Nice', 'fr', 'monastery'), ("Château d'Èze", 'fr', 'ruins'),
         ('Notre-Dame de Bon Conseil', 'fr', 'church'), ('Église Saint-Roch', 'fr', 'church'), ('Monastère', 'fr', 'monastery'),
         ('Monument commémoratif aux victimes de la Révolution dit aussi la Pyramide', 'fr', 'obelisk'), ('Château du Barroux', 'fr', 'castle'),
         ('Cathédrale Saints-Pierre-Paul-et-Quirin', 'be', 'cathedral'), ('Abbaye de Stavelot', 'be', 'monastery'), ('Monastère Saint-Remacle', 'be', 'monastery'),
         ('Église Protestante Baptiste', 'be', 'church'), ('Château de Rochette', 'be', 'manor'), ('Ermitage Saint-Antoine', 'be', 'church'),
         ('Burgruine Klamm', 'at', 'ruins'), ('Hl. Vitus', 'at', 'church'), ('Wallfahrtskirche und Passionistenkloster Maria Schutz', 'at', 'church'),
         ('Pfarrkirche Klamm', 'at', 'church'), ('Hl. Familie', 'at', 'church'), ('Carolus-Denkmal', 'at', 'monument'), ('Bahnhof Semmering', 'at', 'station'),
         ('Pulverturm', 'at', 'tower'), ('Hl. Johannes Nepomuk-Kapelle', 'at', 'chapel'), ('Großer Pulverturm', 'at', 'tower'), ('Nepomuk-Kapelle', 'at', 'chapel'),
         ('Jagdschloss Grunewald', 'de', 'palace'), ('Kloster St. Gabriel', 'de', 'monastery'), ('Grunewaldkirche', 'de', 'church'), ('Hochmeisterkirche', 'de', 'church'),
         ('Herz-Jesu-Kirche', 'de', 'church'), ('Friedenskirche', 'de', 'church'), ('Pauluskirche', 'de', 'church'), ('Die Christengemeinschaft Berlin', 'de', 'church'),
         ('Salvatorkirche', 'de', 'church'), ('St. Hubertus', 'de', 'church'), ('St. Simon und Juda', 'de', 'church'), ('St. Johannes der Täufer', 'de', 'church'),
         ('Ev. Erlöserkirche', 'de', 'church'), ('Marienkapelle', 'de', 'chapel'), ('St. Lufthildis', 'de', 'church'), ('St. Rochus und Sebastian', 'de', 'chapel'),
         ('Burg Rheinstein', 'de', 'castle'), ('Burg Reichenstein', 'de', 'castle'), ('Mäuseturm', 'de', 'tower'), ('Wernerkapelle', 'de', 'ruins'),
         ('West Pier', 'uk', 'ruins'), ('St Nicholas of Myra', 'uk', 'church'), ("St Peter's Church, Preston Park", 'uk', 'church'), ('Brighton Friends Meeting House', 'uk', 'church'),
         ('Brighton Unitarian Church', 'uk', 'church'), ("St Luke's Prestonville", 'uk', 'church'), ('Parish Church of St Paul', 'uk', 'church'),
         ('Middle Street Synagogue', 'uk', 'church'), ("St Mary Magdalene's", 'uk', 'church'), ('St Michael and All Angels', 'uk', 'church'),
         ('Brighton National Spiritualist Church', 'uk', 'church'), ("St Stephen's", 'uk', 'church'), ('Greek Orthodox Church of the Holy Trinity', 'uk', 'church'),
         ('Church of the Ascension', 'uk', 'church'), ('Royal Pavilion', 'uk', 'palace'), ('Shap Abbey', 'uk', 'ruins'), ('Grosse Point Lighthouse', 'us', 'lighthouse'),
         ('Old Dutch Church', 'us', 'church'), ('Philipsburg Manor', 'us', 'manor'), ('Wellington Monument', 'ie', 'obelisk'), ('Scrabo Tower', 'ie', 'tower'),
         ('Chiesa di San Pietro', 'it', 'church'), ("Basilica di Sant'Apollinare in Classe", 'it', 'church'), ('Castello Bonoris', 'it', 'castle'), ('Torre Civica', 'it', 'tower'),
         ('Iglesia de San Esteban', 'es', 'church'), ('Ermita de Santa María', 'es', 'chapel'), ('Riekermolen', 'nl', 'windmill'), ('Oude Kerk', 'nl', 'church'),
         ('居庸关关城', 'cn', 'castle'), ('岔道城', 'cn', 'castle'), ('南关瓮城', 'cn', 'castle'), ('延庆县长城段 1段', 'cn', 'wall'), ('八达岭关城', 'cn', 'castle'),
         ('居庸关云台', 'cn', 'gate'), ('南口城', 'cn', 'castle'),
         ('Церковь Александра Невского в Красном Селе', 'ru', 'church'), ('Храм в честь чуда Архистратига Михаила в Хонех', 'ru', 'church')]
    for n, h, k in T:
        print('%-60s → %s' % (n, ru_label(n, h, k)))
    for n, h in [('Saint-Martin-en-Campagne', 'fr'), ('Brighton', 'uk'), ('Patcham', 'uk'), ('Pyecombe', 'uk'), ('Kendal', 'uk'), ('Ossining', 'us'), ('Tarrytown', 'us'),
                 ('Sleepy Hollow', 'us'), ('Grunewald', 'de'), ('Trechtingshausen', 'de'), ('Niederheimbach', 'de'), ('Bacharach', 'de'), ('Châtellerault', 'fr'),
                 ('Rognonas', 'fr'), ('Le Pontet', 'fr'), ('Villefranche-sur-Mer', 'fr'), ('Montichiari', 'it'), ('Castiglione delle Stiviere', 'it'), ('Lasarte-Oria', 'es'),
                 ('Andoain', 'es'), ('Urnieta', 'es'), ('Ouderkerk aan de Amstel', 'nl'), ('Amstelveen', 'nl'), ('Stavelot', 'be'), ('Malmedy', 'be'), ('Francorchamps', 'be'),
                 ('Schottwien', 'at'), ('Spital am Semmering', 'at'), ('Comber', 'ie'), ('Newtownards', 'ie'), ('Evanston', 'us'), ('Wilmette', 'us'), ('Hicksville', 'us'),
                 ('Westbury', 'us'), ('Crawford Notch', 'us'), ('Bédoin', 'fr'), ('Malaucène', 'fr'), ('Beaulieu-sur-Mer', 'fr'), ('Èze', 'fr'), ('Saint-Gaudens', 'fr'),
                 ('Montréjeau', 'fr'), ('Envermeu', 'fr'), ('Criel-sur-Mer', 'fr'), ('Givors', 'fr'), ('Brignais', 'fr'), ('Gueux', 'fr'), ('Thillois', 'fr')]:
        print('   %-30s → %s' % (n, ru_place(n, h)))
