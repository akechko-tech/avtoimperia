# 0.35: новая игра — сначала путь (гонщик, мотомастерская, фабрикант, финансист, техник), потом его исторические фигуры;
# финансисты Дюрант и Роллс; мотоцикл — газ сплошной, «всё или ничего»; помощь (противобуксовка, АБС) работает молча — без надписей на кнопках;
# лошадь впереди повозки на заводской улице; дым из выхлопной трубы по мотору; свой фильм у мотомастерской; деньги выбора в фильме — по масштабу
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
    # 1) 0.38: первый экран — направление, страна, герои этой страны (ярлык — атрибут героя); старые пути (ngPath) — для совместимости
    pg.click('[data-act=newgame]');pg.wait_for_timeout(250)
    dirs=pg.eval_on_selector_all('#sheetBody [data-act=ngDir]','e=>e.map(x=>x.dataset.v)')
    ok(dirs==['car','moto','air'],'сверху — направление: '+', '.join(dirs))
    ok(pg.query_selector('#sheetBody [data-act=country]') is not None and pg.query_selector('#sheetBody [data-act=startgame]') is not None,'на том же экране — страна и старт')
    pg.screenshot(path=out+'1_paths.png')
    def heroes(dir,c):
        pg.click(f'[data-act=ngDir][data-v={dir}]');pg.wait_for_timeout(150);pg.click(f'[data-act=country][data-v={c}]');pg.wait_for_timeout(250)
        return pg.eval_on_selector_all('#sheetBody [data-act=pion],#sheetBody [data-act=rpick]','e=>e.map(x=>x.dataset.v)')
    exp={('car','us'):['ford','olds','durant','l_chevrolet','rickenbacker','custom','custom'],('car','de'):['benz','maybach','custom','custom'],('car','it'):['agnelli','lancia','a_maserati','ferrari','custom','custom'],
         ('car','ru'):['frese','ryabush','custom','custom'],('moto','fr'):['dedion','custom'],('moto','us'):['custom'],('air','de'):['fokker','junkers','custom'],('air','ru'):['sikorsky','custom']}
    for (dir,c),want in exp.items():
        h=heroes(dir,c);ok(h==want,'%s · %s: %s'%(dir,c,', '.join(h)))
    tags=pg.eval_on_selector_all('#sheetBody .pion .ng-tag','e=>e.map(x=>x.textContent)')
    ok(tags==['Авиатор','Авиатор'],'ярлыки героев: '+', '.join(tags))
    heroes('car','it');tags=pg.eval_on_selector_all('#sheetBody .pion .ng-tag','e=>e.map(x=>x.textContent)')
    ok(tags==['Фабрикант','Гонщик','Гонщик','Гонщик','Фабрикант','Гонщик'],'Италия, автомобили: '+', '.join(tags)+' (Феррари — гонщик)')
    pg.click('[data-act=rpick][data-v=lancia]');pg.wait_for_timeout(250)
    ok(pg.query_selector('#sheetBody [data-act=startracer]') is not None and js("draft.path")=='racer','Лянча — путь гонщика, кнопка «Выйти на старт»')
    pg.click('[data-act=country][data-v=fr]');pg.wait_for_timeout(250)
    r=js("({c:draft.country,h:draft.hero.k,co:draft.company})");ok(r['c']=='fr' and r['h']=='custom','сменили страну — герой другой страны не остаётся: '+str(r))
    ok(pg.query_selector('#sheetBody [data-act=pion][data-v=benz]') is None,'Бенца во Франции нет')
    # 2) финансист: Дюрант — Америка, «Дюрант-Дорт»; кредит больше, марки дешевле, контора дороже
    pg.click('[data-act=ngDir][data-v=car]');pg.wait_for_timeout(250);pg.click('[data-act=country][data-v=us]');pg.click('[data-act=pion][data-v=durant]');pg.wait_for_timeout(250)
    r=js("({c:draft.country,co:draft.company,p:draft.pioneer,role:draft.role})");ok(r['c']=='us' and r['co']=='Дюрант-Дорт' and r['role']=='money','Дюрант: '+str(r))
    pg.screenshot(path=out+'2_money.png')
    pg.click('[data-act=startgame]');pg.wait_for_timeout(600)
    r=js("""(()=>{const s=G,p0=s.pioneer;s.plantVal=2e5;const L1=maxLoan(s),a1=admParts(s,{made:2000}).k;s.pioneer='custom';const L0=maxLoan(s),a0=admParts(s,{made:2000}).k;s.pioneer=p0;
      s.y=1912;const x=brandCands(s,'fr')[0];let b1=0,b0=0;if(x){b1=brandPrice(s,'fr',x);s.pioneer='custom';b0=brandPrice(s,'fr',x);s.pioneer=p0;}s.y=1895;
      return {p:s.pioneer,c:s.country,L:L1/L0,a:a1/a0,b:b0?b1/b0:0,buick:pkIs(COMPS.us.find(c=>c.n==='Buick'),s)};})()""")
    ok(r['p']=='durant' and r['c']=='us' and abs(r['L']-1.3)<0.04 and abs(r['a']-1.15)<0.01 and abs(r['b']-0.8)<0.03 and r['buick'],'Дюрант в игре: кредит ×%.2f, контора ×%.2f, марки ×%.2f, Buick — его марка'%(r['L'],r['a'],r['b']))
    clean()
    # 2б) «Завод вживую»: лошадь впереди повозки (отзыв: «лошади толкают повозку, смотря назад»)
    js("(()=>{G.y=1906;G.m=5;G.pending=[];try{sagaStop();}catch(_){};tab='plant';render();})()")
    cart=None
    for i in range(120):
        cart=js("(()=>{const sc=typeof PLG!=='undefined'&&PLG.ready&&PLG.sc;if(!sc)return null;const c=sc.cars.find(c=>c.cart);if(!c)return null;const a=plgAt(c.pa,c.s,c.loop),L=plgDyn(sc).lits.find(l=>l.g===plgCart());return L?{dot:L.M[8]*a[2]+L.M[10]*a[3]}:null;})()")
        if cart: break
        pg.wait_for_timeout(250)
    ok(cart is not None and cart['dot']<-0.99,'«Завод вживую»: повозка едет лошадью вперёд (нос модели — против хода, лошадь в модели сзади): '+str(cart))
    smoke=None
    for i in range(80):
        smoke=js("(()=>{const sc=PLG.sc;if(!sc)return null;const c=sc.cars.find(c=>!c.cart&&c.ex&&(c.ex.acc>0||c.ex.ph>0));return c?{k:exhProfile(c).k,n:sc.parts.length}:null;})()")
        if smoke: break
        pg.wait_for_timeout(250)
    ok(smoke is not None,'машины на заводской улице дымят по мотору: '+str(smoke))
    js("(()=>{tab='home';render();})()")
    # 2в) мотомастерская, свой персонаж: свой фильм — «Мотор на велосипеде», без «доктора»; деньги выбора — по масштабу
    js("(()=>{newMotoGame('custom','fr','Мото','normal','М1');for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];G.saga=null;sagaCheck(G);})()")
    r=js("({L:sagaList(G)===SAGA.moto,p:(G.pending.find(p=>p.saga)||{}).title})")
    ok(r['L'] and 'Мотор на велосипеде' in (r['p'] or ''),'мотомастерская: первая глава фильма — '+str(r['p']))
    js("(()=>{G.pending=[];sagaPlay('moto1');sagaQuestion();})()");pg.wait_for_timeout(700)
    t=pg.inner_text('#sagaScreen');n=len(pg.query_selector_all('#sagaScreen .sg-o'))
    ok(n==3 and 'доктор' not in t and 'Чей мотор' in t,'глава «Мотор на велосипеде»: вопрос «Чей мотор…», выборов '+str(n))
    pg.screenshot(path=out+'5_moto_saga.png')
    js("(()=>{sagaStop();G.pending=[];})()");pg.wait_for_timeout(500)
    # большая фирма: «+$700» становится суммой по её масштабу — и на кнопке, и в кассе
    js("(()=>{newGame('custom','fr','Т','normal');for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];G.y=1911;const ci=cpi(G);G.cash=2e7*ci;G.last={mat:2.2e5*ci,wage:1.1e5*ci,ovh:4e4*ci,dlr:1e4*ci,ad:5e3*ci,rd:5e3*ci,int:0};G.saga={seen:[],pick:{},last:-9};sagaPlay('custom4');sagaQuestion();})()");pg.wait_for_timeout(700)
    r=js("(()=>{const o=SAGA.custom.find(c=>c.id==='custom4').o[0],b=document.querySelector('#sagaScreen .sg-o small');return {want:money(sagaCash(G,o.fx)),btn:b?b.textContent:'',k:Math.round(sagaScale(G))};})()")
    ok(r['want'] in r['btn'] and r['k']>100,'большая фирма (×%d): на кнопке «%s»'%(r['k'],r['btn']))
    pg.screenshot(path=out+'6_scaled.png')
    c0=js("G.cash");pg.click('#sagaScreen .sg-o[data-k="0"]');pg.wait_for_timeout(400);c1=js("G.cash")
    ok(abs((c1-c0)-js("sagaCash(G,SAGA.custom.find(c=>c.id==='custom4').o[0].fx)"))<1,'в кассу пришло столько же: %+d'%(c1-c0))
    js("(()=>{sagaStop();G.pending=[];})()");pg.wait_for_timeout(500)
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
    ex=js("(()=>{const m=R&&R.me;if(!m)return null;const P=exhProfile(m),c2=P.col.map(x=>Math.round(x*0.5+100)).join(',');return {k:P.k,n:R.parts.filter(p=>p.col===c2||p.col==='58,58,64').length};})()")
    ok(ex is not None and ex['n']>0,'из выхлопной трубы мотоцикла идёт дым по мотору: '+str(ex))
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
