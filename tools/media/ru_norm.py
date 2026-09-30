"""Нормализация русского текста для диктора (Silero не читает цифры и латиницу):
годы и даты — порядковыми числительными в нужном падеже («в 1906 году» → «в тысяча девятьсот шестом году»),
остальные числа — словами (с родом по следующему слову), %, $, км, км/ч, л. с., №, латиница — по-русски."""
import re

UNITS_M = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
UNITS_F = ['ноль', 'одна', 'две'] + UNITS_M[3:]
UNITS_N = ['ноль', 'одно', 'два'] + UNITS_M[3:]
TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
HUND = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']
ORD_U = ['', 'первый', 'второй', 'третий', 'четвёртый', 'пятый', 'шестой', 'седьмой', 'восьмой', 'девятый']
ORD_T = ['десятый', 'одиннадцатый', 'двенадцатый', 'тринадцатый', 'четырнадцатый', 'пятнадцатый', 'шестнадцатый', 'семнадцатый', 'восемнадцатый', 'девятнадцатый']
ORD_TENS = ['', '', 'двадцатый', 'тридцатый', 'сороковой', 'пятидесятый', 'шестидесятый', 'семидесятый', 'восьмидесятый', 'девяностый']
ORD_H = ['', 'сотый', 'двухсотый', 'трёхсотый', 'четырёхсотый', 'пятисотый', 'шестисотый', 'семисотый', 'восьмисотый', 'девятисотый']

def plural(n, one, few, many):
    n = abs(n) % 100
    if 11 <= n <= 19: return many
    n %= 10
    return one if n == 1 else few if 2 <= n <= 4 else many

def card3(n, g='m'):
    u = UNITS_M if g == 'm' else UNITS_F if g == 'f' else UNITS_N
    w = []
    if n >= 100: w.append(HUND[n // 100]); n %= 100
    if 10 <= n <= 19: w.append(TEENS[n - 10]); return w
    if n >= 20: w.append(TENS[n // 10]); n %= 10
    if n: w.append(u[n])
    return w

def card(n, g='m'):
    if n == 0: return 'ноль'
    w = []
    if n >= 1_000_000:
        m = n // 1_000_000; w += card3(m, 'm') + [plural(m, 'миллион', 'миллиона', 'миллионов')]; n %= 1_000_000
    if n >= 1000:
        t = n // 1000; w += card3(t, 'f') + [plural(t, 'тысяча', 'тысячи', 'тысяч')]; n %= 1000
    if n: w += card3(n, g)
    return ' '.join(w)

GEN_U = ['ноля', 'одного', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти']
GEN_UF = ['ноля', 'одной', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти']
GEN_TEENS = ['десяти', 'одиннадцати', 'двенадцати', 'тринадцати', 'четырнадцати', 'пятнадцати', 'шестнадцати', 'семнадцати', 'восемнадцати', 'девятнадцати']
GEN_TENS = ['', '', 'двадцати', 'тридцати', 'сорока', 'пятидесяти', 'шестидесяти', 'семидесяти', 'восьмидесяти', 'девяноста']
GEN_H = ['', 'ста', 'двухсот', 'трёхсот', 'четырёхсот', 'пятисот', 'шестисот', 'семисот', 'восьмисот', 'девятисот']
def gen3(n, g='m'):
    u = GEN_UF if g == 'f' else GEN_U; w = []
    if n >= 100: w.append(GEN_H[n // 100]); n %= 100
    if 10 <= n <= 19: w.append(GEN_TEENS[n - 10]); return w
    if n >= 20: w.append(GEN_TENS[n // 10]); n %= 10
    if n: w.append(u[n])
    return w
def card_gen(n, g='m'):
    if n == 0: return 'ноля'
    w = []
    if n >= 1_000_000:
        m = n // 1_000_000; w += gen3(m) + ['миллиона' if m % 10 == 1 and m % 100 != 11 else 'миллионов']; n %= 1_000_000
    if n >= 1000:
        t = n // 1000; w += gen3(t, 'f') + ['тысячи' if t % 10 == 1 and t % 100 != 11 else 'тысяч']; n %= 1000
    if n: w += gen3(n, g)
    return ' '.join(w)
PREP_GEN = {'до', 'из', 'от', 'около', 'более', 'менее', 'свыше', 'без', 'для', 'после', 'вокруг', 'среди', 'кроме', 'против', 'больше', 'меньше', 'порядка'}

def ord_nom(n):
    """Порядковое, мужской род, именительный: 1906 → «тысяча девятьсот шестой»."""
    pre = []
    if n >= 1000:
        t = n // 1000; r = n % 1000
        if r == 0: return ('тысячный' if t == 1 else ' '.join(card3(t, 'f')) + 'тысячный')
        pre += (['тысяча'] if t == 1 else card3(t, 'f') + [plural(t, 'тысяча', 'тысячи', 'тысяч')]); n = r
    if n >= 100:
        h = n // 100; r = n % 100
        if r == 0: return ' '.join(pre + [ORD_H[h]])
        pre.append(HUND[h]); n = r
    if 10 <= n <= 19: return ' '.join(pre + [ORD_T[n - 10]])
    if n >= 20:
        t = n // 10; r = n % 10
        if r == 0: return ' '.join(pre + [ORD_TENS[t]])
        pre.append(TENS[t]); n = r
    return ' '.join(pre + [ORD_U[n]])

def ord_case(n, case='nom', num='sg', gen='m'):
    """Падеж порядкового (прилагательное): последнее слово склоняется, остальные — как в именительном."""
    w = ord_nom(n).split(' '); last = w[-1]
    if last == 'третий':
        forms = {'nom': 'третий', 'gen': 'третьего', 'dat': 'третьему', 'acc': 'третий', 'ins': 'третьим', 'prep': 'третьем', 'pl_nom': 'третьи', 'pl_gen': 'третьих', 'pl_prep': 'третьих', 'pl_dat': 'третьим', 'pl_ins': 'третьими',
                 'f_nom': 'третья', 'f_gen': 'третьей', 'n_nom': 'третье'}
    else:
        st = last[:-2]
        forms = {'nom': last, 'gen': st + 'ого', 'dat': st + 'ому', 'acc': last, 'ins': st + 'ым', 'prep': st + 'ом', 'pl_nom': st + 'ые', 'pl_gen': st + 'ых', 'pl_prep': st + 'ых', 'pl_dat': st + 'ым', 'pl_ins': st + 'ыми',
                 'f_nom': st + 'ая', 'f_gen': st + 'ой', 'n_nom': st + 'ое'}
    key = ('pl_' + case) if num == 'pl' else (case if gen == 'm' else gen + '_' + case)
    w[-1] = forms.get(key, forms['nom'])
    return ' '.join(w)

YEAR_CASE = {'год': 'nom', 'года': 'gen', 'году': None, 'годом': 'ins', 'годе': 'prep', 'годы': 'pl_nom', 'годов': 'pl_gen', 'годах': 'pl_prep', 'годам': 'pl_dat', 'годами': 'pl_ins'}
PREP_DAT = {'к', 'по', 'ко'}
MONTHS = 'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря'
FEM_FEW = re.compile(r'^[а-яё]+[ыи]$')

def gender_for(next_word, n):
    """Род числа 1/2 по следующему слову: «две мили», «одна машина», «один год»."""
    w = (next_word or '').lower()
    last = n % 10 if n % 100 not in range(11, 20) else 0
    if last == 1:
        if re.search(r'[ая]$', w) and not re.search(r'(судья|дядя|мужчина)$', w): return 'f'
        if re.search(r'[ое]$', w) and not re.search(r'(кофе)$', w): return 'n'
        return 'm'
    if last == 2:
        if FEM_FEW.match(w) and not re.search(r'(часы)$', w): return 'f'
        return 'm'
    return 'm'

LAT = {
    'Mercedes-Benz': 'Мерседес-Бенц', 'Mercedes': 'Мерседес', 'Benz': 'Бенц', 'Daimler': 'Даймлер', 'Fiat': 'Фиат', 'FIAT': 'Фиат', 'Renault': 'Рено', 'Peugeot': 'Пежо',
    'Panhard': 'Панар', 'Levassor': 'Левассор', 'Darracq': 'Даррак', 'Dietrich': 'Дитрих', 'Mors': 'Морс', 'Itala': 'Итала', 'Opel': 'Опель', 'Bugatti': 'Бугатти',
    'Ford': 'Форд', 'Packard': 'Паккард', 'Duesenberg': 'Дюзенберг', 'Miller': 'Миллер', 'Stutz': 'Штутц', 'Mercer': 'Мерсер', 'Bentley': 'Бентли', 'Sunbeam': 'Санбим',
    'Delage': 'Делаж', 'Ballot': 'Балло', 'Alfa': 'Альфа', 'Romeo': 'Ромео', 'Lancia': 'Лянча', 'Napier': 'Нейпир', 'Rolls-Royce': 'Роллс-Ройс', 'Austin': 'Остин',
    'Morris': 'Моррис', 'Talbot': 'Тальбо', 'Maserati': 'Мазерати', 'Steyr': 'Штайр', 'Austro-Daimler': 'Аустро-Даймлер', 'Porsche': 'Порше', 'Brasier': 'Бразье',
    'Richard-Brasier': 'Ришар-Бразье', 'Clément-Bayard': 'Клеман-Байяр', 'Gobron-Brillié': 'Гоброн-Брийе', 'Serpollet': 'Серполле', 'Winton': 'Уинтон', 'Thomas': 'Томас',
    'Locomobile': 'Локомобиль', 'Oldsmobile': 'Олдсмобиль', 'Cadillac': 'Кадиллак', 'Buick': 'Бьюик', 'Chevrolet': 'Шевроле', 'Dodge': 'Додж', 'Marmon': 'Мармон',
    'National': 'Нэшнл', 'Simplex': 'Симплекс', 'Lozier': 'Лозье', 'Hotchkiss': 'Хочкис', 'Vauxhall': 'Воксхолл', 'Minerva': 'Минерва', 'Protos': 'Протос', 'Züst': 'Цюст',
    'Russo-Balt': 'Руссо-Балт', 'Lorraine-Dietrich': 'Лорен-Дитрих', 'Chenard': 'Шенар', 'Salmson': 'Сальмсон', 'Amilcar': 'Амилькар', 'Citroën': 'Ситроен', 'Citroen': 'Ситроен',
    'Le': 'Ле', 'Matin': 'Матэн', 'Petit': 'Пти', 'Journal': 'Журналь', 'Chicago': 'Чикаго', 'Times-Herald': 'Таймс-Геральд', 'Speedway': 'Спидвей', 'Park': 'Парк',
    'Coppa': 'Коппа', 'della': 'делла', 'Velocità': 'Велочита', 'Grand': 'Гран', 'Prix': 'при', 'Tourist': 'Турист', 'Trophy': 'Трофи', 'Cup': 'Кап', 'Mille': 'Милле', 'Miglia': 'Милья',
    'AAA': 'три А', 'ACF': 'А-Се-Эф', 'RAC': 'Эр-Эй-Си', 'JCC': 'Джей-Си-Си', 'GP': 'Гран-при', 'TT': 'Ти-Ти', 'MG': 'Эм-Джи', 'GM': 'Джи-Эм', 'DKW': 'Де-Ка-Ве', 'BMW': 'Бэ-Эм-Вэ',
    'Model': 'Модель', 'T': 'Т', 'A': 'А', 'Type': 'Тип', 'Silver': 'Сильвер', 'Ghost': 'Гост', 'Twin': 'Твин', 'Six': 'Сикс', 'Blitzen': 'Блитцен', 'Wasp': 'Уосп',
    'Flyer': 'Флаер', 'Curved': 'Кёрвд', 'Dash': 'Дэш', 'Old': 'Олд', 'Kaiserpreis': 'Кайзерпрайс', 'Targa': 'Тарга', 'Florio': 'Флорио', 'Brooklands': 'Бруклендс',
    'Indianapolis': 'Индианаполис', 'Daytona': 'Дейтона', 'Ormond': 'Ормонд', 'Beach': 'Бич', 'Monza': 'Монца', 'Monaco': 'Монако', 'Pikes': 'Пайкс', 'Peak': 'Пик',
    'Double': 'Дабл', 'Twelve': 'Твелв', 'Herald': 'Геральд', 'Times': 'Таймс', 'Motor': 'Мотор', 'Company': 'Компани', 'Club': 'Клуб', 'Automobile': 'Автомобиль',
}
TR = [('shch', 'щ'), ('sch', 'ш'), ('ch', 'ч'), ('sh', 'ш'), ('zh', 'ж'), ('kh', 'х'), ('ph', 'ф'), ('th', 'т'), ('ts', 'ц'), ('ya', 'я'), ('yu', 'ю'), ('yo', 'ё'), ('ee', 'и'), ('oo', 'у'), ('ou', 'у'), ('qu', 'кв'),
      ('a', 'а'), ('b', 'б'), ('c', 'к'), ('d', 'д'), ('e', 'е'), ('f', 'ф'), ('g', 'г'), ('h', 'х'), ('i', 'и'), ('j', 'дж'), ('k', 'к'), ('l', 'л'), ('m', 'м'), ('n', 'н'), ('o', 'о'),
      ('p', 'п'), ('q', 'к'), ('r', 'р'), ('s', 'с'), ('t', 'т'), ('u', 'у'), ('v', 'в'), ('w', 'в'), ('x', 'кс'), ('y', 'и'), ('z', 'з'), ('é', 'е'), ('è', 'е'), ('à', 'а'), ('ü', 'ю'), ('ö', 'ё'), ('ä', 'э'), ('ç', 'с')]

def translit(word):
    if word in LAT: return LAT[word]
    low = word.lower(); out = ''; i = 0
    while i < len(low):
        for a, b in TR:
            if low.startswith(a, i): out += b; i += len(a); break
        else: out += low[i]; i += 1
    return out.capitalize() if word[:1].isupper() else out

def norm(text):
    t = ' ' + text + ' '
    t = t.replace(' ', ' ')
    # латиница: сначала составные названия из словаря, потом слова
    t = re.sub(r'\b(Вильгельм|Николай|Эдуард|Георг|Виктор|Умберто|Альфонс|Франц|Людовик|Пий|Лев)\s+(VIII|VII|VI|IV|V|III|II|I)\b', lambda m: m.group(1) + ' ' + {'I': 'Первый', 'II': 'Второй', 'III': 'Третий', 'IV': 'Четвёртый', 'V': 'Пятый', 'VI': 'Шестой', 'VII': 'Седьмой', 'VIII': 'Восьмой'}[m.group(2)], t)
    t = re.sub(r'\bXX\b', 'двадцатый', t); t = re.sub(r'\bXIX\b', 'девятнадцатый', t)
    for k in sorted(LAT, key=len, reverse=True):
        if ' ' in k or '-' in k: t = re.sub(r'(?<![A-Za-zÀ-ÿ])' + re.escape(k) + r'(?![A-Za-zÀ-ÿ])', LAT[k], t)
    t = re.sub(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’\-]*", lambda m: translit(m.group(0)), t)
    t = t.replace('№', ' номер ').replace('л. с.', 'л.с.')
    # время на часах: 3:45 → «три сорок пять», 12:00 → «двенадцать ноль-ноль»
    t = re.sub(r'(?<![\d:])(\d{1,2}):(\d{2})(?![\d:])', lambda m: card(int(m.group(1))) + ' ' + ('ноль-ноль' if m.group(2) == '00' else ('ноль ' + card(int(m.group(2)[1])) if m.group(2)[0] == '0' else card(int(m.group(2))))), t)
    # 1 200 → 1200
    t = re.sub(r'(?<=\d)[  ](?=\d{3}(?!\d))', '', t)
    # годы с «год…»: «в 1906 году», «к 1910 году», «1896 года», «1920-х годах»
    def yr(m):
        prep, y, suf, g = (m.group(1) or ''), int(m.group(2)), (m.group(3) or ''), m.group(4)
        case = YEAR_CASE.get(g, 'nom')
        if case is None: case = 'dat' if prep.strip().lower() in PREP_DAT else 'prep'
        if case.startswith('pl_'): w = ord_case(y, case[3:], 'pl')
        else: w = ord_case(y, case)
        return prep + w + ' ' + g
    t = re.sub(r'(\b[А-Яа-яё]{1,3}\s)?(1[6-9]\d\d)(-[а-я]+)?\s+(год|года|году|годом|годе|годы|годов|годах|годам|годами)(?![а-яё])', yr, t)
    # «1920-х», «1920-е», «1896-м», «1896-го»
    def yrs(m):
        y, suf = int(m.group(1)), m.group(2)
        return {'х': ord_case(y, 'gen', 'pl'), 'е': ord_case(y, 'nom', 'pl'), 'м': ord_case(y, 'prep'), 'го': ord_case(y, 'gen'), 'й': ord_case(y, 'nom'), 'ому': ord_case(y, 'dat')}.get(suf, ord_nom(y))
    t = re.sub(r'\b(1[6-9]\d\d)-(х|е|м|го|й|ому)(?![а-яё])', yrs, t)
    # даты: «28 ноября» → «двадцать восьмого ноября»
    t = re.sub(r'\b([1-9]|[12]\d|3[01])\s+(' + MONTHS + r')\b', lambda m: ord_case(int(m.group(1)), 'gen') + ' ' + m.group(2), t)
    # диапазоны лет «1906–1908» → «тысяча девятьсот шестой — тысяча девятьсот восьмой»
    t = re.sub(r'\b(1[6-9]\d\d)\s*[–—-]\s*(1[6-9]\d\d)\b', lambda m: ord_nom(int(m.group(1))) + ' — ' + ord_nom(int(m.group(2))), t)
    # проценты, доллары, скорость, мощность, километры
    t = re.sub(r'(\d+)\s*%', lambda m: card(int(m.group(1))) + ' ' + plural(int(m.group(1)), 'процент', 'процента', 'процентов'), t)
    t = re.sub(r'\$\s*(\d+)', lambda m: card(int(m.group(1))) + ' ' + plural(int(m.group(1)), 'доллар', 'доллара', 'долларов'), t)
    t = re.sub(r'(\d+)\s*км/ч', lambda m: card(int(m.group(1))) + ' ' + plural(int(m.group(1)), 'километр', 'километра', 'километров') + ' в час', t)
    t = re.sub(r'(\d+)\s*л\.с\.', lambda m: card(int(m.group(1)), 'f') + ' ' + plural(int(m.group(1)), 'лошадиная сила', 'лошадиные силы', 'лошадиных сил'), t)
    t = re.sub(r'(\d+)\s*км\b', lambda m: card(int(m.group(1))) + ' ' + plural(int(m.group(1)), 'километр', 'километра', 'километров'), t)
    # дроби «4,5»
    t = re.sub(r'(\d+),(\d)\b', lambda m: card(int(m.group(1)), 'f') + ' ' + plural(int(m.group(1)), 'целая', 'целых', 'целых') + ' ' + card(int(m.group(2)), 'f') + ' ' + plural(int(m.group(2)), 'десятая', 'десятых', 'десятых'), t)
    # «XX век», римские
    t = re.sub(r'\bXX\b', 'двадцатый', t); t = re.sub(r'\bXIX\b', 'девятнадцатый', t)
    t = re.sub(r'\b(Вильгельм|Николай|Эдуард|Георг|Виктор|Умберто|Альфонс|Франц)\s+(II|III|IV|VII|V|I)\b', lambda m: m.group(1) + ' ' + {'I': 'Первый', 'II': 'Второй', 'III': 'Третий', 'IV': 'Четвёртый', 'V': 'Пятый', 'VII': 'Седьмой'}[m.group(2)], t)
    # остальные числа — словами (род по следующему слову)
    def num(m):
        n = int(m.group(1)); nxt = m.group(2) or ''
        if n > 999_999_999: return m.group(0)
        return card(n, gender_for(nxt, n)) + (m.group(3) or '') + nxt
    def num2(m):
        pre, n, sp, nxt = m.group(1) or '', int(m.group(2)), m.group(3), m.group(4) or ''
        g = gender_for(nxt, n)
        if pre.strip().lower() in PREP_GEN: return pre + card_gen(n, g) + sp + nxt
        return pre + card(n, g) + sp + nxt
    t = re.sub(r'(\b[А-Яа-яё]+\s)?(?<![\d,])(\d+)(\s*)([а-яёА-ЯЁ]+)?', num2, t)
    t = t.replace('«', '').replace('»', '').replace('„', '').replace('“', '').replace('"', '')
    t = re.sub(r'\s+', ' ', t).strip()
    return t

if __name__ == '__main__':
    for s in ['Детройт, 1896 год. В сарае за домом пятьдесят восемь.', 'В 1903 году дюжина компаньонов вложила 28 тысяч долларов.', 'К 1910 году.', 'Осенью 1913 года на заводе.',
              'Первая автогонка в Америке прошла 28 ноября по улицам Чикаго.', 'Трасса: Speedway Park, Мэйвуд (доски, 2 мили).', 'с виражами до 45 градусов: гонщики AAA мчались',
              'в 1920-х годах', 'Гонка Chicago Times-Herald. 1895 год.', 'Мотор в 35 л.с. и 60 км/ч, цена $850, доля 30%.', 'Кайзер Вильгельм II приехал 1 мая.', '1 машина, 2 машины, 21 год, 22 года, 2 часа',
              'Индианаполис 500. 1911 год. Трасса из 3 200 000 кирпичей.', 'Сезон 1906–1908 и 1900 год', 'в 1900 году', 'Le Matin предложила доехать']:
        print(s, '\n   →', norm(s))
