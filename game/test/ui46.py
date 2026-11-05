# 0.46: проверки в браузере — карточка «Господство»: «N из 2», две категории, «уже ваши», одна мерка бренда и капитала; газета о
# победе по двум категориям; сохранение 0.45 с победой по одной категории — победа снята. python3 game/test/ui46.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui46/'
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
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    js("newGame('ford','us','Форд Мотор','normal','Модель V');G.helper={on:1};G.pending=[];try{sagaStop();}catch(_){};")
    js("(()=>{for(let k=0;k<12*9;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}G.pending=[];})()")
    js("tab='empire';render();"); pg.wait_for_timeout(500)
    t = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    ok('из 2' in t and 'по двум категориям из шести сразу' in t and 'у всех одна мерка' in t and 'рекорд эпохи (1895–1930) — Cadillac: 7' in t, 'карточка «Господство» в ' + str(js("G.y")) + ' году: «N из 2», «по двум категориям из шести сразу», одна мерка, рекорд инноваций Cadillac 7')
    ok('полторы годовые выручки' in t and 'доля покупателей страны' in t and 'перелёт' in t, 'пояснения: капитал — полторы годовые выручки, бренд — доля покупателей, первенства — и перелёты')
    js("try{raceLoadUI(false);document.getElementById('raceScreen').hidden=true;if(typeof R!=='undefined'&&R&&R.gl)try{r3dDispose();}catch(_){};R=null;}catch(_){};try{closeSheet();}catch(_){};for(let i=0;i<10;i++)try{closePaper();}catch(_){};G.pending=[];tab='empire';render();")
    pg.wait_for_timeout(400); pg.evaluate("document.getElementById('sec-dom').scrollIntoView()"); pg.wait_for_timeout(200); pg.screenshot(path=out + '1_dom_card.png', full_page=False)
    # две категории — победа: газета
    js("""(()=>{const W=G.world,T=domTable(G);W.my.hp=Math.max(T.scale.hist.v*1.01,W.hp);W.hp=W.my.hp/0.6;W.my.rev=Math.max(T.market.hist.v*1.01,W.rev);W.rev=W.my.rev/0.6;domCheck(G);render();})()""")
    pg.wait_for_timeout(800)
    ok(js("!!(G.dom&&G.dom.ks&&G.dom.ks.length===2)"), 'победа по двум категориям: ' + str(js("G.dom?G.dom.ks.join('+'):''")))
    js("try{closeSheet();}catch(_){};(()=>{const e=G.pending.find(x=>/господствует/.test(x.title||''));if(e)showEvent(e);})()"); pg.wait_for_timeout(900)
    pt = js("(()=>{const e=document.getElementById('paper');return e?e.textContent:document.body.textContent;})()")
    ok('господствует: масштаб и рынок' in pt and 'двух из шести' in pt and 'Рекорд всей эпохи 1895–1930 — Ford' in pt, 'газета: «господствует: масштаб и рынок», «двух из шести категорий», рекорды эпохи позади')
    pg.screenshot(path=out + '2_paper.png', full_page=False)
    js("for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.pending=[];tab='empire';render();"); pg.wait_for_timeout(500)
    t2 = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    ok('победа: масштаб и рынок' in t2, 'карточка после победы: «победа: масштаб и рынок»')
    # сохранение 0.45 с победой по одной категории — снимается
    js("newGame('custom','fr','Проба','normal','Ласточка');G.helper={on:1};G.pending=[];(()=>{for(let k=0;k<12*3;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}G.pending=[];})();G.dom={k:'innov',y:1897,m:5,who:'you'};domCheck(G);tab='empire';render();")
    pg.wait_for_timeout(400)
    ok(js("!G.dom") and 'из 2' in js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()"), 'сохранение 0.45 с победой по инновациям: победа снята, карточка снова «N из 2»')
    ok(not errs, 'ошибок в консоли нет' + ('' if not errs else ': ' + errs[0][:200]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
raise SystemExit(1 if fails else 0)
