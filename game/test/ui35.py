# 0.35: новая игра — сначала путь (гонщик, мотомастерская, фабрикант, финансист, техник), потом его исторические фигуры;
# финансисты Дюрант и Роллс; мотоцикл — газ сплошной, «всё или ничего»; помощь (противобуксовка, АБС) работает молча — без надписей на кнопках
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui35/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    def clean(): js("(()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};try{closeSheet();}catch(_){};if(typeof SAGAP!=='undefined'&&SAGAP)try{sagaStop();}catch(_){};G.pending=[];})()")
    # 1) первый экран — только пути
    pg.click('[data-act=newgame]');pg.wait_for_timeout(250)
    paths=pg.eval_on_selector_all('#sheetBody [data-act=ngPath]','e=>e.map(x=>x.dataset.v)')
    ok(paths==['racer','moto','maker','money','tech'],'сначала — путь: '+', '.join(paths))
    ok(pg.query_selector('#sheetBody [data-act=pion]') is None and pg.query_selector('#sheetBody [data-act=startgame]') is None,'на первом экране — ни персонажей, ни кнопки старта')
    t=pg.inner_text('#sheetBody')
    ok(all(n in t for n in ('Лянча','Дион','Форд','Дюрант','Бенц')),'на карточках путей — их исторические фигуры')
    pg.screenshot(path=out+'1_paths.png')
    def heroes(v):
        pg.click(f'[data-act=ngPath][data-v={v}]');pg.wait_for_timeout(250)
        return pg.eval_on_selector_all('#sheetBody [data-act=rpick]' if v=='racer' else '#sheetBody [data-act=pion]','e=>e.map(x=>x.dataset.v)')
    exp={'maker':['ford','olds','renault','agnelli','custom'],'tech':['benz','maybach','lanchester','bugatti','custom'],'money':['peugeot','durant','rolls','custom'],'moto':['dedion','morris','wanderer','bianchi','custom']}
    for v,want in exp.items():
        h=heroes(v);ok(sorted(h)==sorted(want),v+': '+', '.join(h))
        ok(pg.query_selector('#sheetBody [data-act=ngBack]') is not None and pg.query_selector('#sheetBody [data-act=startgame]') is not None,v+': «← Другой путь» и старт')
        pg.click('[data-act=ngBack]');pg.wait_for_timeout(200)
    h=heroes('racer');ok('ferrari' in h and 'lancia' in h and pg.query_selector('#sheetBody [data-act=startracer]') is not None,'гонщик: '+', '.join(h)+' (Феррари — здесь, а не у марки)')
    pg.click('[data-act=ngBack]');pg.wait_for_timeout(200)
    ok(pg.query_selector('#sheetBody [data-act=ngPath][data-v=money]') is not None,'«← Другой путь» — снова выбор пути')
    # 2) финансист: Дюрант — Америка, «Дюрант-Дорт»; кредит больше, марки дешевле, контора дороже
    pg.click('[data-act=ngPath][data-v=money]');pg.wait_for_timeout(250);pg.click('[data-act=pion][data-v=durant]');pg.wait_for_timeout(250)
    r=js("({c:draft.country,co:draft.company,p:draft.pioneer,role:draft.role})");ok(r['c']=='us' and r['co']=='Дюрант-Дорт' and r['role']=='money','Дюрант: '+str(r))
    pg.screenshot(path=out+'2_money.png')
    pg.click('[data-act=startgame]');pg.wait_for_timeout(600)
    r=js("""(()=>{const s=G,p0=s.pioneer;s.plantVal=2e5;const L1=maxLoan(s),a1=admParts(s,{made:2000}).k;s.pioneer='custom';const L0=maxLoan(s),a0=admParts(s,{made:2000}).k;s.pioneer=p0;
      s.y=1912;const x=brandCands(s,'fr')[0];let b1=0,b0=0;if(x){b1=brandPrice(s,'fr',x);s.pioneer='custom';b0=brandPrice(s,'fr',x);s.pioneer=p0;}s.y=1895;
      return {p:s.pioneer,c:s.country,L:L1/L0,a:a1/a0,b:b0?b1/b0:0,buick:pkIs(COMPS.us.find(c=>c.n==='Buick'),s)};})()""")
    ok(r['p']=='durant' and r['c']=='us' and abs(r['L']-1.3)<0.04 and abs(r['a']-1.15)<0.01 and abs(r['b']-0.8)<0.03 and r['buick'],'Дюрант в игре: кредит ×%.2f, контора ×%.2f, марки ×%.2f, Buick — его марка'%(r['L'],r['a'],r['b']))
    clean()
    # 3) мотоцикл 40 л.с. на «Клаузене»: газ — у нижнего края кнопки тоже полный; помощник придерживает газ и тормоз молча (отзыв: «зачем надпись АБС на тормоз?»)
    js("""(()=>{newGame('custom','de','Тест','normal');for(let i=0;i<8;i++)try{closePaper();}catch(_){};closeSheet();G.pending=[];
      const rc=RACES.find(r=>r.key==='klausen-1925');G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=5e5;G.rdept=1;G.lines={car:1,moto:1};
      const d=rivalDesign('moto',rc.y);G.models.push(Object.assign({},G.models[0],{id:77,name:'Мото 25',e:'me10',g:d.g,c:d.c,k:d.k,b:d.b,w:d.w,t:'t0',dv:undefined}));
      tab='race';render();openRaceSetup(rc.key);})()""");pg.wait_for_timeout(400)
    pg.click('#sheetBody [data-act=rAdd][data-k=moto]');pg.wait_for_timeout(400)
    js("(()=>{AU.on.gfx='2d';const e=RS.entries.find(x=>entryIsMoto(G,x));e.drv='me';RS.entries=[e];RS.mode='drive';RACE_ACT.raceGo();})()");pg.wait_for_timeout(1500)
    js("(()=>{try{filmSkip();}catch(_){}})()");pg.wait_for_timeout(400)
    go=pg.query_selector('#raceScreen button:has-text("Поехали")')
    if go and go.is_visible(): go.click();pg.wait_for_timeout(300)
    # горный подъём — раздельный старт: пока ждём своей очереди, гонку «перематываем»
    js("(()=>{if(R)R.speed=6;})()")
    for i in range(150):
        if js("!!(R&&R.me&&!R.me.wait&&R.t>0.3)"): break
        pg.wait_for_timeout(200)
    js("(()=>{if(R)R.speed=1;})()")
    ok(js("!!(R&&R.me&&R.me.cls==='moto')"),'в гонке — мотоцикл игрока: '+str(js("R&&R.me?Math.round(R.me.P/745.7)+' л.с.':'—'")))
    g=pg.query_selector('#raceScreen .r-ctrl .gas');bk=pg.query_selector('#raceScreen .r-ctrl .brk')
    tc=False;full=True;shot=False;plain=True
    if g:
        bb=g.bounding_box();pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']*0.92);pg.mouse.down()
        for i in range(30):
            pg.wait_for_timeout(100);plain=plain and g.inner_text().strip()=='ГАЗ';full=full and js("rKeys.gas===true&&rKeys.gasLv===undefined")
            if js("!!(R&&R.me&&R.me.asTC>R.time&&R.me.thr<0.9)"):
                tc=True
                if not shot: pg.screenshot(path=out+'3_tc.png');shot=True
        pg.mouse.up()
    ok(full,'газ «всё или ничего»: палец у нижнего края кнопки — газ полный')
    ok(tc and plain,'мотоцикл на старте: помощник придерживает газ (заднее колесо не срывается), на кнопке — только «ГАЗ»')
    # тормоза мотоциклов 1920-х на прямой колесо не блокируют (тормоз слабее сцепления) — АБС нужна в повороте: тормоз «в пол» с рулём до упора
    v=js("(()=>{rKeys.right=true;return R&&R.me?R.me.vx*3.6:0;})()");abs_on=False
    plain=True
    if bk:
        bb=bk.bounding_box();pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2);pg.mouse.down()
        for i in range(15):
            pg.wait_for_timeout(80);plain=plain and 'АБС' not in bk.inner_text()
            if js("!!(R&&R.me&&R.me.asABS>R.time)"):
                abs_on=True;pg.screenshot(path=out+'4_abs.png');break
        pg.mouse.up()
    js("rKeys.right=false");ok(abs_on and plain,'тормоз «в пол» в повороте на %d км/ч: колёса не блокируются (АБС), надписи на кнопке нет'%round(v))
    js("(()=>{try{if(R)finishRace(true);}catch(e){console.warn(e)};R=null;try{closeSheet();}catch(_){};G.pending=[];})()");pg.wait_for_timeout(300)
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
