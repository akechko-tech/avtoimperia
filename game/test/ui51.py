# 0.51: карточка «Господство» в браузере — доля за последние десять лет. python3 game/test/ui51.py
from playwright.sync_api import sync_playwright
import os
out = '/home/claude/work/ui51/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    js("newGame('ford','us','Форд Мотор','normal','Модель V');G.helper={on:1};G.pending=[];try{sagaStop();}catch(_){};")
    # молодая компания: окна ещё нет — счёт с начала партии
    js("(()=>{for(let k=0;k<12*4;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}G.pending=[];})()")
    js("tab='empire';render();"); pg.wait_for_timeout(400)
    t = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    ok('больше половины мира за последние десять лет' in t and 'счёт с первого дня' in t, 'правило: половина мира за последние десять лет')
    ok('с начала партии — вы:' in t and 'за десять лет — вы:' not in t, 'компании четыре года: числа — с начала партии')
    card1 = js("domCard(G)")
    # через двенадцать лет: окно включилось
    js("(()=>{for(let k=0;k<12*8+2;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}G.pending=[];})()")
    js("tab='empire';render();"); pg.wait_for_timeout(400)
    t = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    d = js("(()=>{const T=domTable(G);return {win:T.scale.win,w:T.scale.worldW,all:T.scale.world,sn:Object.keys(G.world.sn||{}).length};})()")
    ok(d['win'] and d['w'] < d['all'] and d['sn'] >= 10, 'окно включилось: мир за десять лет меньше мира с начала (%d снимков)' % d['sn'])
    ok('за десять лет — вы:' in t and 'у вас с первого дня' in t, 'в строках — числа за десять лет и итог с первого дня против рекорда')
    ok('у вас с первого дня $0' not in t.split('Капитал')[1].split('Бренд')[0], 'капитал — стоимость сегодня, без «с первого дня»')
    ok('из 2' in t and 'по двум категориям из шести сразу' in t and 'у всех одна мерка' in t, 'остальной текст карточки на месте')
    card2 = js("domCard(G)")
    # сохранение и загрузка: снимки на месте
    r = js("(()=>{const J=JSON.stringify(G);const H=JSON.parse(J);return {n:Object.keys(H.world.sn||{}).length,kb:Math.round(JSON.stringify(H.world.sn).length/1024),all:Math.round(J.length/1024)};})()")
    ok(r['n'] >= 10 and r['kb'] < 120, 'снимки сохраняются: %d лет, %d КБ из %d КБ сохранения' % (r['n'], r['kb'], r['all']))
    ok(not errs, 'ошибок страницы нет: ' + '; '.join(errs[:3]))
    # снимки карточки — на чистой странице с теми же стилями (живые сцены 3D мешают снимку под программной отрисовкой)
    js("(()=>{try{sagaStop();}catch(_){};try{musicStop();}catch(_){};document.querySelectorAll('canvas,video,audio').forEach(e=>e.remove());})()")
    for name, card in (('1_young', card1), ('2_window', card2)):
        pg.evaluate("h=>{document.body.innerHTML='<main style=\"padding:10px\">'+h+'</main>';window.scrollTo(0,0);}", card); pg.wait_for_timeout(300)
        try: pg.screenshot(path=out + name + '.png', full_page=True, timeout=60000)
        except Exception as e: print('  снимок не снят:', name, str(e)[:80])
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
