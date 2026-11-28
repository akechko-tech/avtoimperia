# 0.60 — правки 28 ноября: управление (без переключателя «Авто | Авиа», свёрнутые разделы, быстрый переход),
# оснащение в карточке, своя разработка в три шага, испытания в «Моделях». python3 game/test/ui_fix60.py
from playwright.sync_api import sync_playwright
import os
out = '/home/claude/work/ui_fix60/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1)
    pg.set_default_timeout(240000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s, a=None: pg.evaluate(s, a) if a is not None else pg.evaluate(s)
    js("demoStop();hideMainMenu();newGame('ford','us','Форд Мотор','normal','Модель V');try{sagaStop();}catch(_){}")
    r = js("""()=>{const R=render;window.render=()=>{};G.helper={on:true};let n=0;
      const clr=()=>{let g=0;while(G.pending.length&&g++<40){const ev=G.pending[0],K=(ev.choices||[['ok','ok']]).map(x=>x[1]);const k=K.includes('saga')?'saga':K.includes('tskip')?'tskip':(K.find(x=>!/^(reel:|go:)/.test(x))||'ok');try{if(k==='saga'){sagaAuto(G,ev.saga);G.pending.shift();}else resolve(k);}catch(e){G.pending.shift();}if(G.pending[0]===ev)G.pending.shift();}};
      clr();while(G.y<1916&&!G.over&&n++<300){if(G.cash<30000*cpi(G))G.cash+=60000*cpi(G);try{step();}catch(e){return {err:String(e)};}clr();}
      airInit(G);G.air.b=null;G.y=1943;G.m=11;G.cash=5e8;clr();window.render=R;try{closeSheet();}catch(_){};for(let i=0;i<6;i++)try{closePaper();}catch(_){};try{if(typeof R!=='undefined'&&R)finishRace(true);}catch(_){};try{document.getElementById('raceScreen').hidden=true;}catch(_){};G.pending=[];render();return {y:G.y,air:airOn(G),sw:airSwitchOn(G)};}""")
    ok('err' not in r, 'партия дошла до декабря 1943 года: %s' % r)
    ok(not r.get('sw'), 'переключателя «Автомобили | Аэропланы» нет')
    H = {}
    for t in ['plant', 'models', 'market', 'race']:
        h = js("(t)=>{tab=t;render();window.scrollTo(0,0);return document.documentElement.scrollHeight}", t)
        H[t] = round(h / 915, 1)
        pg.screenshot(path=out + 'tab_%s.png' % t, full_page=True)
    print('  длина вкладок, экранов:', H)
    ok(js("()=>!document.getElementById('linesw')"), 'полосы переключателя на вкладках нет')
    # быстрый переход
    js("()=>{openMenuSheet();}")
    ok(js("()=>!!document.querySelector('[data-act=jumpOpen]')"), 'в меню — «Быстрый переход к разделу»')
    js("()=>{ACT.jumpOpen();}"); pg.wait_for_timeout(200); pg.screenshot(path=out + 'jump.png')
    ok(js("()=>document.querySelectorAll('[data-act=jump]').length>=20"), 'в быстром переходе — все разделы')
    js("()=>{ACT.jump({t:'plant',k:'fin',mk:''});}"); pg.wait_for_timeout(200)
    ok(js("()=>tab==='plant'&&isOpen('fin',false)&&!!document.getElementById('fc-fin')"), 'переход: «Финансы» на «Заводе», раскрыты')
    pg.screenshot(path=out + 'jump_fin.png')
    js("()=>{ACT.jump({t:'market',k:'dealers',mk:'home'});}"); pg.wait_for_timeout(200)
    ok(js("()=>tab==='market'&&/Нанять дилеров/.test(document.getElementById('view').textContent)"), 'переход: «Нанять дилеров» в «Рынке»')
    # модель без оснащения — кнопка в карточке
    js("""()=>{tab='models';const md=G.models.find(m=>m.status==='prod');md.eq=[];G.ui=G.ui||{};G.ui.f=G.ui.f||{};G.ui.f['md'+md.id]=true;render();}""")
    ok(js("()=>!!document.querySelector('[data-act=eqFit]')"), 'в карточке модели — «Поставить оснащение»')
    pg.screenshot(path=out + 'model_card.png', full_page=True)
    ok(js("()=>/Испытания и госзаказы/.test(document.getElementById('view').textContent)"), 'в «Моделях» — карточка испытаний')
    js("()=>{document.querySelector('[data-act=eqFit]').click();}"); pg.wait_for_timeout(200)
    ok(js("()=>!document.querySelector('[data-act=eqFit]')"), 'оснащение поставлено — кнопки больше нет')
    # своя разработка
    js("()=>{ACT.ownOpen();}"); pg.wait_for_timeout(200); pg.screenshot(path=out + 'own1.png')
    ok(js("()=>/Шаг 1\\. Тип узла/.test(document.getElementById('sheetBody')?document.getElementById('sheetBody').textContent:document.body.innerText)"), 'своя разработка: шаг 1 — тип узла')
    js("()=>{document.querySelector('[data-act=ownCat][data-k=e]').click();}"); pg.wait_for_timeout(200); pg.screenshot(path=out + 'own2.png')
    js("()=>{document.querySelector('[data-act=ownPick]').click();}"); pg.wait_for_timeout(200); pg.screenshot(path=out + 'own3.png', full_page=False)
    ok(js("()=>document.querySelectorAll('[data-act=ownBase]').length>5"), 'шаг 2: больше пяти моторов на выбор')
    js("()=>{closeSheet();}")
    ok(not errs, 'ошибок страницы нет: %s' % errs[:3])
    b.close()
print('ui_fix60: ошибок', fails)
if fails: raise SystemExit(1)
