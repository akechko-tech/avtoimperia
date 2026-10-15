# 0.36: проверки в браузере по отзыву — 3D-заставка, Россия от выбора пути до революции, шапка с флагом, фильм без музыки
# и с мужским голосом, «Рынок» (мотоциклы в продажах дома, дилеры выше, кнопки стран), карточка модели по разделам,
# «Путь к автомобилю», таблица гонки, прибой на пляже.  python3 game/test/ui36.py
from playwright.sync_api import sync_playwright
import os
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui36/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails += 1
QUIET = "for(let i=0;i<8;i++)try{closePaper();}catch(_){};try{closeSheet();}catch(_){};G.pending=[];"
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html')
    js = lambda s: pg.evaluate(s)
    # 1) 3D-заставка
    live = False
    for i in range(40):
        pg.wait_for_timeout(1000)
        if js("MS.classList.contains('live')&&MS.classList.contains('ready')"): live = True; break
    ok(live, '3D-заставка ожила за %d с' % (i + 1))
    acts = pg.eval_on_selector_all('#menuScreen button[data-act]', 'e=>e.map(x=>x.textContent.trim())')
    ok(any('Новая игра' in a for a in acts) and any('Звук и графика' in a for a in acts), 'меню: ' + ', '.join(acts))
    pg.screenshot(path=out + '1_menu.png')
    js("demoStop()"); pg.wait_for_timeout(500)   # дальше — без живой заставки: на программном рендере она отнимает весь процессор
    # 2) Россия: путь «Фабрикант» → Фрезе → страна Россия
    pg.click('[data-act=newgame]'); pg.wait_for_timeout(300)
    pg.click('[data-act=ngPath][data-v=maker]'); pg.wait_for_timeout(300)
    ok(pg.query_selector('#sheetBody [data-act=pion][data-v=frese]') is not None, 'у фабриканта есть Пётр Фрезе')
    pg.click('[data-act=pion][data-v=frese]'); pg.wait_for_timeout(300)
    r = js("({c:draft.country,co:draft.company})"); ok(r['c'] == 'ru' and r['co'] == 'Фрезе и Ко', 'Фрезе: ' + str(r))
    t = pg.inner_text('#sheetBody'); ok('Россия' in t and 'очень трудно' in t, 'страна «Россия» и предупреждение «очень трудно» на экране')
    pg.click('[data-act=startgame]', timeout=120000); pg.wait_for_timeout(1200)
    js("(()=>{" + QUIET + "tab='plant';render();})()"); pg.wait_for_timeout(400)
    co = pg.inner_text('#co'); ok('ПЕТЕРБУРГ' in co.upper(), 'в шапке — Петербург: ' + co)
    r = js("({cc:document.body.dataset.cc,fl:document.body.dataset.fl,right:Math.max(...[...document.querySelectorAll('.top .iconbtn')].map(e=>e.getBoundingClientRect().right))})")
    ok(r['cc'] == 'ru' and r['fl'] == 'ru1' and r['right'] <= 390, 'антураж России (cc=%s, флаг %s), кнопки шапки в экране (правый край %d)' % (r['cc'], r['fl'], r['right']))
    pg.screenshot(path=out + '2_ru_plant.png')
    # 3) фильм: музыка на паузе, рассказчик — мужской голос
    js("(()=>{" + QUIET + "sagaPlay('frese1',true);})()"); pg.wait_for_timeout(1500)
    r = js("({hold:AU.sagaHold,narr:sagaVoiceOf({say:'x'}),scr:!!document.getElementById('sagaScreen')})")
    ok(r['hold'] and r['narr'] == 'aidar' and r['scr'], 'фильм «Самобеглая коляска»: музыка на паузе, рассказчик — aidar')
    pg.screenshot(path=out + '3_saga.png')
    js("sagaStop()"); pg.wait_for_timeout(600); ok(js("!AU.sagaHold"), 'фильм закрыт — музыка снова может играть')
    # 4) революция: три пути
    js("(()=>{" + QUIET + "G.y=1917;G.m=10;G.ruRev=0;ruCheck(G);showEvent();})()"); pg.wait_for_timeout(700)
    ch = js("(G.pending[0]&&G.pending[0].choices||[]).map(c=>c[1])")
    ok(ch == ['ru:emig', 'ru:stay', 'ru:sell'], 'ноябрь 1917 года: ' + ', '.join(ch))
    pg.screenshot(path=out + '4_revolution.png')
    js("(()=>{resolve('ru:stay');" + QUIET + "G.y=1918;G.m=6;ruCheck(G);" + QUIET + "})()")
    ok(js("!!G.soviet&&G.country==='ru'"), 'остались — летом 1918 года национализация')
    # 5) «Рынок»: мотоциклы в продажах дома, дилеры выше, кнопки стран
    js("""(()=>{newMotoGame('custom','us','Мотор Компани','normal','Тип 1');""" + QUIET + """G.y=1913;G.m=4;G.cash=4e5;G.lines.car=1;G.cap=80;G.workers=160;G.rep=55;
      G.dealers.us=40;G.dealers.fr=6;G.imp=G.imp||{};G.imp.fr=1;const m=G.models[0];m.status='prod';m.price=Math.round(refPrice(m,G)/10)*10;
      const car={...m,id:G.nextId++,name:'Модель А',e:'e9',g:'g5',c:'c4',k:'k2',b:'b3',t:'t0',w:'w6',status:'prod',stock:0,totalSold:0,made:0,lastSold:0};car.price=Math.round(refPrice(car,G)/10)*10;G.models.push(car);
      for(let i=0;i<3;i++){G.pending=[];step();""" + QUIET + """}tab='market';render();window.scrollTo(0,0);})()""")
    pg.wait_for_timeout(600)
    t = pg.inner_text('#view'); ok('мотоцикл' in t, 'дома в продажах видны и мотоциклы')
    r = js("""(()=>{const H=[...document.querySelectorAll('#view h2')].map(h=>h.textContent.trim());return {H,chips:[...document.querySelectorAll('[data-act=dlrC]')].map(b=>b.dataset.c)};})()""")
    di = next((i for i, h in enumerate(r['H']) if 'Дилеры' in h), 99)
    ok(di <= 2, 'дилеры — высоко на «Рынке» (%d-й раздел из %d: %s)' % (di + 1, len(r['H']), ' · '.join(r['H'][:5])))
    ok('us' in r['chips'] and 'fr' in r['chips'], 'кнопки стран у дилеров: ' + ', '.join(r['chips']))
    pg.click('[data-act=dlrC][data-c=fr]'); pg.wait_for_timeout(400)
    ok(js("G.ui&&G.ui.dlrC==='fr'"), 'переключили на Францию одним нажатием')
    pg.screenshot(path=out + '5_market.png')
    # 6) карточка модели — разделы сворачиваются
    js("(()=>{const md=G.models.find(m=>!isMoto(m));G.models.forEach(m=>setOpen('md'+m.id,m===md));tab='models';render();})()"); pg.wait_for_timeout(500)
    ids = pg.eval_on_selector_all('#view .fold-h[data-act=fold]', 'e=>e.map(x=>x.dataset.k).filter(k=>/^m\\d+(pt|du|co|rv|sp|ar)$/.test(k))')
    ok(len(ids) >= 4, 'разделы карточки модели: ' + ', '.join(ids[:8]))
    if ids:
        k = ids[0]; was = js("isOpen('%s',false)" % k)
        js("document.querySelector('#view .fold-h[data-k=%s]').click()" % k); pg.wait_for_timeout(400)
        ok(js("isOpen('%s',false)" % k) != was and pg.query_selector('#view .fold-h[data-k=%s] + .fold-b' % k) is not None, 'раздел «%s» открывается и запоминается' % k)
    pg.screenshot(path=out + '6_model.png')
    # 7) «Путь к автомобилю» ведёт к автомобильному цеху
    js("""(()=>{newMotoGame('custom','fr','Мото','normal','М1');""" + QUIET + """G.y=1905;G.m=0;G.cash=3e4;tab='plant';render();window.scrollTo(0,0);})()"""); pg.wait_for_timeout(500)
    # совет «Путь к автомобилю» бывает ниже трёх главных — берём его из полного списка советов и жмём «Подробнее», как в карточке
    btn = js("(()=>{const t=adviceList(G).find(t=>/Путь к автомобилю/.test(t.text));if(!t)return null;TIPS=[t];window.scrollTo(0,0);ACT.tip({k:0});return t.btn;})()")
    pg.wait_for_timeout(900)
    r = js("(()=>{const e=document.getElementById('fc-carshop');if(!e)return null;const q=e.getBoundingClientRect();return {top:Math.round(q.top),hl:e.classList.contains('hl'),open:!e.classList.contains('folded'),tab};})()")
    ok(btn is not None and r is not None and -50 < r['top'] < 700 and r['open'] and r['tab'] == 'plant', 'совет «Путь к автомобилю» → «%s»: раздел автомобильного цеха открыт и на экране: %s' % (btn, r))
    pg.screenshot(path=out + '7_carpath.png')
    # 8) таблица гонки
    js("""(()=>{newGame('custom','us','Тестовая','normal');""" + QUIET + """G.y=1911;const rc=RACES.find(r=>r.key==='indy-1911');const md=G.models[0];const a=aiCarMd(1911);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});})()""")
    def film_go():   # кинохроника перед гонкой начинается не сразу (на программном рендере — секунды): дождаться, пропустить, «Поехали!»
        for _ in range(60):
            pg.wait_for_timeout(500)
            if js("!!(R&&R.film)"): break
        js("try{filmSkip()}catch(_){}"); pg.wait_for_timeout(1200)
        js("(()=>{const b=document.getElementById('rTipsGo');if(b&&!document.getElementById('rTips').hidden)b.click();})()")
    film_go(); pg.wait_for_timeout(9000)
    t = js("(()=>{const e=document.getElementById('rBoard');return e?e.innerText:'';})()") or ''
    ok('Вы' in t and ' из ' in t, 'таблица гонки: первые трое, вы с соседями и «N-й из M»: ' + t.replace('\n', ' | ')[:160])
    pg.screenshot(path=out + '8_race.png', timeout=120000)
    # 8б) живая дуэль с рысаком: в таблице один участник — табло не падает, гонка идёт (в 0.36 до правки табло падало, если участников меньше трёх)
    js("(()=>{try{finishRace(true);}catch(_){};" + QUIET + "closeSheet();})()"); pg.wait_for_timeout(800)
    k = js("""(()=>{newGame('custom','us','Тестовая','normal');""" + QUIET + """G.y=1905;G.m=3;let o=null;for(let i=0;i<60&&!o;i++){G.dxSeen={};o=dxOffer(G);}
      if(!o)return null;G.dx=o;o.acc=1;o.at=mi(G);dxToday(G,'dxDrive');return o.k;})()""")
    film_go(); pg.wait_for_timeout(2000)
    r1 = js("R?R.t:null"); pg.wait_for_timeout(3000)
    r = js("(()=>R?{t0:%s,t:R.t,board:(document.getElementById('rBoard')||{}).innerText||''}:null)()" % (r1 if r1 is not None else 'null'))
    ok(k is not None and r is not None and r['t0'] is not None and r['t'] > r['t0'] and '1-й из 1' in r['board'] and not errs, 'живая дуэль (%s): табло «%s», гонка идёт (%.2f → %.2f с)' % (k, (r or {}).get('board','').replace('\n',' · '), (r or {}).get('t0') or 0, (r or {}).get('t') or 0))
    js("(()=>{try{finishRace(true);}catch(_){};" + QUIET + "closeSheet();})()"); pg.wait_for_timeout(500)
    # 9) прибой на пляже Ормонд-Бич
    r = js("""(()=>{const rc=RACES.find(r=>r.key==='ormond-1905');try{if(R)R=null;}catch(_){};const T=buildTrack(rc,40,{});const E=ambEmitters(T);return {sea:E.sea.length,rec:E.seaRec};})()""")
    ok(r and r['sea'] > 0 and r['rec'] == 'surf_big', 'Ормонд-Бич: море рядом (%s), прибой — запись океанского наката' % r)
    ok(not errs, 'без ошибок в консоли' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
