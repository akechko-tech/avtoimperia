# 0.21: «проще и понятнее» — как игра выглядит для новичка: выбор сложности, первый месяц, экран «Мир» (экспорт),
# причины падения продаж, советы. python3 test/ui21.py → снимки в OUT (по умолчанию /tmp/ui21)
from playwright.sync_api import sync_playwright
import os, json
OUT = os.environ.get('OUT', '/tmp/ui21')
os.makedirs(OUT, exist_ok=True)
# полпартии за США с помощником: события — первый вариант (как игрок, который жмёт «дальше»)
SIM = """n=>{const pick=()=>{let g=0;while(G.pending.length&&g++<20){try{resolve(G.pending[0].choices[0][1]);}catch(e){G.pending.shift();}}};
  for(let k=0;k<n&&!G.over;k++){pick();
    // раз в 4 года — новая модель кнопкой «Подобрать детали повыгоднее» (как в test/kids.js), старые снимаются через полгода после запуска новой
    const dev=G.models.filter(m=>m.status==='dev');window.__ld=window.__ld??-99;
    if(!dev.length&&mi(G)-window.__ld>=48&&mi(G)>=6){const kind=G.y>=1908?'people':'middle',md=autoDesign(kind,G),dc=devCost(md,G);
      if(G.cash>dc*1.5){G.cash-=dc;const m={...md,id:G.nextId++,name:'Модель '+G.nextId,paint:'#333',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);window.__ld=mi(G);}}
    G.models.filter(m=>m.status==='prod').forEach(m=>{const newer=G.models.some(x=>x.status==='prod'&&x.id>m.id&&mi(G)-x.launched>=6);if(newer&&G.models.filter(x=>x.status==='prod').length>2){m.status='off';G.cash+=m.stock*m.price*0.6;m.stock=0;}});
    step();}
  pick();closeSheet();closePaper();render();return dstr(G)+' касса '+money(G.cash)+(G.over?' КОНЕЦ':'');}"""
res = {}
# что вылезает за ширину экрана (горизонтальной прокрутки быть не должно)
WIDE = """()=>{const W=document.documentElement.clientWidth,out=[];document.querySelectorAll('#view *,#empStrip *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.right>W+1){const p=e.parentElement;if(p&&p.getBoundingClientRect().right>W+1)return;out.push((e.id?'#'+e.id:'')+'.'+(e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right)+' '+(e.textContent||'').trim().slice(0,50));}});return {W,sw:document.documentElement.scrollWidth,out:out.slice(0,8)};}"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 393, 'height': 873}, device_scale_factor=2)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html'); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, '01_menu.png'))
    pg.click('[data-act=newgame]'); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('[data-act=diff]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(OUT, '02_diff.png'))
    pg.click('[data-act=pion][data-v=ford]'); pg.click('[data-act=startgame]'); pg.wait_for_timeout(700)
    pg.screenshot(path=os.path.join(OUT, '03_intro.png'))
    pg.evaluate("{let g=0;while(G.pending.length&&g++<20){try{resolve(G.pending[0].choices[0][1]);}catch(e){G.pending.shift();}}if(typeof sagaClose==='function'&&document.getElementById('sagaScreen'))try{sagaClose()}catch(e){};const s=document.getElementById('sagaScreen');if(s)s.remove();closeSheet();closePaper();tab='plant';render();window.scrollTo(0,0);}")
    pg.wait_for_timeout(400); pg.screenshot(path=os.path.join(OUT, '04_first_month.png'))
    for t in ('models', 'market', 'race', 'log'):
        pg.evaluate("t=>{tab=t;render();window.scrollTo(0,0);}", t); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(OUT, '05_start_%s.png' % t), full_page=True); res['wide_start_' + t] = pg.evaluate(WIDE)
    # помощник включён — полпартии
    pg.evaluate("G.helper=G.helper||{};G.helper.on=1;")
    res['1912'] = pg.evaluate(SIM, 17 * 12)
    for t in ('plant', 'models', 'market', 'log'):
        pg.evaluate("t=>{tab=t;render();window.scrollTo(0,0);}", t); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(OUT, '06_1912_%s.png' % t), full_page=True); res['wide_1912_' + t] = pg.evaluate(WIDE)
    # «Мир» — карточка экспорта
    ok = pg.evaluate("(()=>{tab='market';render();const e=document.querySelector('[data-act=world],[data-act=worldOpen],.world-card');if(e){e.scrollIntoView({block:'start'});return e.outerHTML.slice(0,120);}return null;})()")
    res['world_el'] = ok; pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(OUT, '07_world.png'))
    if os.environ.get('STOP') == '1912':
        print(json.dumps(res, ensure_ascii=False, indent=1)); b.close(); raise SystemExit
    res['1921'] = pg.evaluate(SIM, 9 * 12)
    for t in ('plant', 'models', 'log'):
        pg.evaluate("t=>{tab=t;render();window.scrollTo(0,0);}", t); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(OUT, '08_1921_%s.png' % t), full_page=True); res['wide_1921_' + t] = pg.evaluate(WIDE)
    res['errs'] = errs[:8]
    b.close()
print(json.dumps(res, ensure_ascii=False, indent=1))
