# 0.39: проверки в браузере — вкладки одни для всех направлений (авиатор: «Завод», «Модели», «Рынок», «Гонки»); «Дела и советы»;
# «Другие направления» у авиатора (мотомастерская, автоцех); «как посчитано» для спроса на аэроплан; 12 слотов и код сохранения;
# подсказка «нужно …» ведёт к строке технологии и подсвечивает её; герои России — Гаккель и Григорович в списке.
# python3 game/test/ui39.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui39/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    # 1) новая игра: авиация · Россия — три героя
    js("openNewGame()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=ngDir][data-v=air]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=country][data-v=ru]').click()"); pg.wait_for_timeout(200)
    cards = js("[...document.querySelectorAll('[data-act=pion]')].map(e=>e.dataset.v)")
    ok(cards == ['sikorsky', 'gakkel', 'grigorovich', 'custom'], 'аэропланы · Россия: Сикорский, Гаккель, Григорович и свой персонаж: ' + ', '.join(cards))
    js("document.querySelector('[data-act=pion][data-v=grigorovich]').click()"); pg.wait_for_timeout(200)
    bio = js("document.querySelector('.ng-bio, .ng-hero p, #ngBio') ? (document.querySelector('.ng-bio, .ng-hero p, #ngBio').textContent) : document.body.textContent")
    ok('Щетинин' in bio or 'лодк' in bio, 'карточка Григоровича: завод Щетинина, летающие лодки')
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(1200)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    pg.wait_for_timeout(300)
    # 2) вкладки те же, что у авто-мото
    tabs = js("[...document.querySelectorAll('.tab')].map(b=>b.textContent.trim())")
    ok(tabs == ['Завод', 'Модели', 'Рынок', 'Гонки', 'Империя'], 'вкладки авиатора: ' + ' · '.join(tabs))
    r = json.loads(js("JSON.stringify({y:G.y,co:G.company,city:cityOf(G),md:G.air.models[0].name,role:G.air.models[0].role,sea:airStats(G.air.models[0],tNow(G)).sea})"))
    ok(r['y'] == 1913 and r['role'] == 'sea' and r['sea'] and 'Петербург' in r['city'], 'Григорович: 1913, Петербург, «%s» — летающая лодка' % r['md'])
    # 3) «Завод»: дела и советы, другие направления
    t = js("document.getElementById('view').textContent")
    ok('Дела' in t and 'Другие направления' in t, 'на «Заводе»: «Дела и советы» и «Другие направления: автомобили и мотоциклы»')
    js("setOpen('airLines',true);render()"); pg.wait_for_timeout(200)
    t = js("document.getElementById('view').textContent")
    ok('Мотоциклетная мастерская' in t and 'Автомобильный цех' in t and js("!!document.querySelector('[data-act=airMotoShop]')"), 'авиатор может открыть мотомастерскую и автоцех')
    pg.screenshot(path=out + '1_hangar.png', full_page=False)
    # 4) «Модели»: как посчитано (модель переводим в серию)
    js("const m=G.air.models[0];m.status='prod';m.flown=1;m.launched=mi(G);m.price=0;tab='models';render()"); pg.wait_for_timeout(300)
    ok(js("!!document.querySelector('[data-act=fold][data-k^=aex]')"), 'у модели в серии есть «Как посчитано: спрос и продажи»')
    js("setOpen('aex'+G.air.models[0].id,true);render()"); pg.wait_for_timeout(300)
    t = js("document.getElementById('view').textContent")
    ok('Спрос = рынок страны × ваша доля' in t and 'Рычаги' in t and 'по контрактам' in t, 'раскрыли: формула, пояснение про контракты для гидроаэроплана, рычаги')
    # спортивный аэроплан — таблица по странам
    js("const d=airRefMd('sport',tNow(G));const m2=airNewModel(G,{...d,role:'sport',name:'Спорт'},{status:'prod',flown:1});m2.status='prod';m2.flown=1;m2.launched=mi(G);setOpen('aex'+m2.id,true);setOpen('am'+m2.id,true);render()"); pg.wait_for_timeout(300)
    t = js("document.getElementById('view').textContent")
    ok('Россия' in t and 'рынок в год' in t and 'в месяц' in t, 'спортивный аэроплан: таблица по странам — Россия, рынок в год, доля, в месяц')
    pg.screenshot(path=out + '2_explain.png', full_page=True)
    # 5) сохранения: 12 слотов, код
    js("openSlots('save')"); pg.wait_for_timeout(300)
    n = js("document.querySelectorAll('[data-act=saveSlot]').length")
    ok(n == 12 and js("!!document.querySelector('[data-act=saveCopy]')"), 'сохранить: слотов %d, есть «Скопировать код сохранения»' % n)
    js("document.querySelector('[data-act=saveSlot][data-k=\"7\"]').click()"); pg.wait_for_timeout(400)
    info = json.loads(js("JSON.stringify(slotInfo('7'))"))
    ok(info and info['company'] == r['co'] and info.get('dir') == 'air', 'слот 7 записан: ' + str(info and info['company']))
    code = js("saveCode()")
    ok(isinstance(code, str) and code[:5] in ('AVTZ:', 'AVT1:') and len(code) > 2000, 'код сохранения: %s… (%d КБ)' % (code[:5], len(code) // 1024))
    js("G.company='Проверка';")
    loaded = js("loadCode(%s)" % json.dumps(code))
    ok(loaded and js("G.company") == r['co'], 'загрузка из кода вернула компанию: ' + js("G.company"))
    js("closeSheet()"); pg.wait_for_timeout(200)
    # 6) подсказка «нужно …» ведёт к делу (автомобильная игра)
    js("newGame('ford','us','','normal','');G.pending=[];tab='plant';render()"); pg.wait_for_timeout(300)
    js("setOpen('techc',true);setOpen('techFut',true);render()"); pg.wait_for_timeout(300)
    nb = js("document.querySelectorAll('.tech-row.off [data-act=go]').length")
    ok(nb > 0, 'в будущих технологиях «Нужно:» — кнопки: %d' % nb)
    r2 = json.loads(js("""(()=>{const b=document.querySelector('.tech-row.off [data-act=go]');const id=b.dataset.id;b.click();const e=document.getElementById(id);return JSON.stringify({id,hl:!!(e&&e.classList.contains('hl')),vis:!!(e&&e.offsetParent)});})()"""))
    ok(r2['hl'] and r2['vis'], 'нажали «%s»: строка технологии видна и подсвечена' % r2['id'])
    pg.screenshot(path=out + '3_go.png')
    # 7) «Дела» у автомобильной фирмы — с кнопками
    t = js("document.getElementById('view').textContent")
    ok('Дела' in t, 'у автомобильной фирмы — «Дела и советы»')
    ok(not errs, 'ошибок страницы нет' + ('' if not errs else ': ' + errs[0][:120]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
