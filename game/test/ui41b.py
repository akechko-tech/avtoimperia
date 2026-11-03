# 0.41: проверки в браузере — живые соперники: выбор в новой игре, ход ботов после хода игрока, пометки в таблице «Доли рынка»,
# заметка о ходе бота в «Также в номере», карточка «Господство» с пометкой живого лидера; «по истории» — ботов нет.
# python3 game/test/ui41b.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui41/'
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
    # 1) новая игра: переключатель «Соперники»
    js("openNewGame()"); pg.wait_for_timeout(300)
    t = js("document.getElementById('sheetBody')?document.getElementById('sheetBody').textContent:sb.textContent")
    ok('Соперники' in t and 'Живые' in t and 'По истории' in t and js("!!document.querySelector('[data-act=ngbots][data-v=live].on')"), 'в новой игре — выбор «Соперники: Живые / По истории», живые по умолчанию')
    pg.screenshot(path=out + 'b1_newgame.png', full_page=True)
    js("document.querySelector('[data-act=ngbots][data-v=hist]').click()"); pg.wait_for_timeout(300)
    ok(js("!!document.querySelector('[data-act=ngbots][data-v=hist].on')"), 'переключается на «По истории»')
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(800)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    ok(js("G.botsOff===1"), 'партия «по истории»: G.botsOff=1')
    js("G.pending=[];doStep();"); pg.wait_for_timeout(500)
    ok(js("!G.bots"), 'после хода ботов нет (как в прежних версиях)')
    # 2) живые: новая партия, 14 месяцев
    js("newGame('custom','fr','Проба','normal','Ласточка');G.pending=[];try{sagaStop();}catch(_){};")
    for i in range(14):
        js("G.pending=[];doStep();"); pg.wait_for_timeout(120)
        js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    st = json.loads(js("JSON.stringify({n:Object.keys(G.bots||{}).length,alive:Object.values(G.bots||{}).filter(b=>!b.dead).length,news:(G.botNews||[]).length,logs:Object.values(G.bots||{}).reduce((a,b)=>a+(b.log||[]).length,0),cash:Object.values(G.bots||{}).filter(b=>!b.dead).map(b=>Math.round(b.cash))})"))
    ok(st['n']==12 and st['alive']>=2, 'боты созданы: %d марок, живых в 1896 году %d (Peugeot и Daimler; остальные — с года основания)' % (st['n'], st['alive']))
    ok(st['news']>=3 and st['news']<=14 and st['logs']>=3, 'за 14 месяцев — ходы ботов (записей в журналах %d), заметок в газете %d (не больше одной в месяц)' % (st['logs'], st['news']))
    # 3) таблица «Доли рынка» — пометка «живой» и последний ход
    js("tab='market';G.ui=G.ui||{};G.ui.mkC='fr';setOpen('shares',true);render()"); pg.wait_for_timeout(400)
    t = js("(()=>{const e=document.querySelector('.shares-t');return e?e.textContent:'';})()")
    ok('живой' in t, 'в таблице долей Франции у Peugeot/Renault — пометка «живой»')
    pg.screenshot(path=out + 'b2_shares.png', full_page=True)
    # 4) заметка о ходе бота попадает в «Также в номере»
    r = json.loads(js("""(()=>{const s=G;const picks=[];for(let k=0;k<6;k++)picks.push(...flavorPick(s,s.y,s.m,3,k+100,false));const bt=(s.botNews||[]).map(x=>x.t);const hit=picks.find(p=>bt.includes(p));const html=hit?flavorHTML(hit):'';return JSON.stringify({hit:hit||'',ok:!!hit&&html.includes('Также в номере')&&html.length>200,len:html.length});})()"""))
    ok(r['ok'], 'ход бота — среди «Также в номере», открывается заметкой: «%s»' % r['hit'])
    # 5) карточка «Господство»: лидер-бот помечен
    js("tab='empire';render()"); pg.wait_for_timeout(400)
    t = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    ok('Господство' in t and ('живой' in t), 'карточка «Господство»: у лидера-бота пометка «живой»')
    pg.screenshot(path=out + 'b3_dom.png', full_page=True)
    # 6) сохранение и загрузка с ботами
    r2 = json.loads(js("""(()=>{save();const raw=localStorage.getItem('avtoimperia')||localStorage.getItem('avt-save')||'';const keys=Object.keys(localStorage);let hit='';for(const k of keys){const v=localStorage.getItem(k)||'';if(v.includes('"bots"')){hit=k;break;}}return JSON.stringify({hit,n:Object.keys(G.bots).length});})()"""))
    ok(r2['hit']!='', 'в сохранении есть боты (ключ %s)' % r2['hit'])
    ok(not errs, 'ошибок страницы нет' + ('' if not errs else ': ' + errs[0][:200]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
