# 0.31: дымовой прогон в браузере — КБ и оснащение сворачиваются; «Дальше» наверху открывает запись на гонку;
# совладельцы и выкуп долей; продажа компании → покупка другой марки; в гонке — кнопка 🗣 и никакой подписи механика.
# python3 game/test/ui31.py
from playwright.sync_api import sync_playwright
import os, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m31/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    clean="(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}G.pending=[];})()"
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300);js(clean)
    # 1) месяц, когда открыта запись на гонку: «Дальше» наверху — прямо в запись
    rk=None
    for i in range(60):
        js("(()=>{G.pending=[];if(G.cash<3e5)G.cash+=3e5;doStep();closeSheet();closePaper();G.pending=[];if(SAGAP)try{sagaStop();}catch(_){}})()")
        rk=js("(()=>{const rc=RACES.find(r=>raceOpen(r,G)&&raceEligible(r,G)&&!raceWarBlocked(r,G)&&!G.cres[r.key]&&G.raceDone[r.key]===undefined);return rc&&raceCarsFor(G).length&&nextStep(G).rk===rc.key?rc.key:null;})()")
        if rk: break
    print('date',js("dstr(G)"),'race',rk)
    ok(bool(rk),'открыта запись на гонку и «Дальше» знает её')
    if rk:
        js(clean);js("(()=>{tab='plant';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
        btn=pg.query_selector(f'[data-act=raceTo][data-k="{rk}"]')
        ok(btn is not None,'наверху кнопка ведёт в гонку')
        pg.screenshot(path=out+'1_strip.png')
        if btn:
            btn.click();pg.wait_for_timeout(400)
            ok(js("!!(typeof RS!=='undefined'&&RS&&RS.key)")==True and js("RS.key")==rk,'нажали — открылась запись на эту гонку, а не просто вкладка')
            pg.screenshot(path=out+'2_race_setup.png')
        js(clean)
    # 2) КБ: сворачивается; оснащение — свёрнуто одной строкой, цены высокие
    js("(()=>{G.y=1913;G.cash=6e5;G.rd.lvl=5;G.ui=G.ui||{};G.ui.f={};tab='models';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
    el=pg.query_selector('[data-k="rdcard"]');ok(el is not None,'у КБ есть заголовок-сворачивалка')
    if el:
        el.scroll_into_view_if_needed();pg.screenshot(path=out+'3_kb_open.png')
        el.click();pg.wait_for_timeout(250);el=pg.query_selector('[data-k="rdcard"]');el.scroll_into_view_if_needed();pg.screenshot(path=out+'4_kb_folded.png')
        ok(js("!isOpen('rdcard',true)")==True and pg.query_selector('[data-act=rdUp]') is None,'КБ свёрнуто: '+js("(document.querySelector('.card-sum')||{}).innerText||''")[:120])
        pg.query_selector('[data-k="rdcard"]').click();pg.wait_for_timeout(250)
    kb=pg.query_selector('[data-k="kitkb"]');ok(kb is not None and pg.query_selector('[data-act=kitBuy]') is None,'оснащение бюро свёрнуто в строку')
    if kb:
        kb.click();pg.wait_for_timeout(250);kb=pg.query_selector('[data-k="kitkb"]');kb.scroll_into_view_if_needed();pg.screenshot(path=out+'5_kit_open.png')
        ok(pg.query_selector('[data-act=kitBuy]') is not None,'развернули — видны покупки')
    # 3) совладельцы: в отчёте о прибыли — кнопка «Выкупить», лист «Совладельцы»; в «Сделках» — тоже
    js("(()=>{G.cash=5e6;G.partners=[{n:'Финансисты',sh:0.2,t:mi(G)-30},{n:'Darracq',sh:0.12,t:mi(G)-10}];G.pending=[];doStep();closeSheet();closePaper();G.pending=[];})()");js(clean);js("(()=>{tab='plant';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(300)
    go=pg.query_selector('[data-act=bbOpen]');ok(go is not None,'в отчёте о прибыли у доли совладельцев — «Выкупить»')
    if go:
        go.scroll_into_view_if_needed();pg.screenshot(path=out+'6a_pl_row.png');go.click();pg.wait_for_timeout(300)
        bb=pg.query_selector('#sheet [data-act=bbBuy][data-k="0"]');ok(bb is not None,'лист «Совладельцы» с ценами выкупа')
        pg.screenshot(path=out+'6b_sheet.png')
        if bb:
            c0=js("G.cash");bb.click();pg.wait_for_timeout(300)
            ok(js("G.partners.length")==1 and js("G.cash")<c0,'выкупили долю «Финансистов»: осталось совладельцев '+str(js("G.partners.length"))+', заплатили '+str(round(c0-js("G.cash"))))
            ok(pg.query_selector('#sheet [data-act=bbBuy][data-k="0"]') is not None,'лист обновился: остался Darracq')
            pg.screenshot(path=out+'6c_sheet_after.png')
    js(clean);js("(()=>{tab='market';render();})()");pg.wait_for_timeout(250)
    ok('можно выкупить' in (js("(()=>{const e=document.querySelector('[data-k=\"deals\"]');return e?e.closest('.card').innerText:'';})()") or ''),'свёрнутые «Сделки»: «совладельцы 12% — можно выкупить»')
    # 4) продажа компании → покупка другой марки
    js("""(()=>{const P=Math.round(companyValue(G)*1.3);G.pending=[{title:'Продажа',text:'тест',choices:[['Продать','ma:sell:Y:'+P],['Нет','ma:sell:N']]}];render();})()""")
    js("(()=>{resolve(G.pending[0].choices[0][1]);})()");pg.wait_for_timeout(300)
    pg.screenshot(path=out+'7a_sold_event.png')
    sold=js("!!(G.soldTo&&G.over)");ok(sold,'компания продана: '+str(js("G.soldTo&&JSON.stringify(G.soldTo)")))
    js(clean);js("(()=>{tab='log';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
    rb=pg.query_selector('[data-act=rbOpen]');ok(rb is not None,'в журнале — «Начать с другой марки»')
    pg.screenshot(path=out+'7_sold_log.png')
    if rb:
        rb.click();pg.wait_for_timeout(300);pg.screenshot(path=out+'8_rebuy_sheet.png')
        it=pg.query_selector('[data-act=rbC][data-v=it]')
        if it: it.click();pg.wait_for_timeout(300);pg.screenshot(path=out+'9_rebuy_it.png')
        bt=pg.query_selector('[data-act=rbBuy]:not([disabled])')
        ok(bt is not None,'есть марка по карману')
        if bt:
            bt.click();pg.wait_for_timeout(200);bt=pg.query_selector('[data-act=rbBuy]:not([disabled])');bt.click();pg.wait_for_timeout(400)
            ok(js("!G.over&&!!G.brandRef"),'купили «'+str(js("G.company"))+'» ('+str(js("G.country"))+'), денег '+str(js("Math.round(G.cash)")))
            pg.screenshot(path=out+'10_new_brand.png')
            for i in range(3): js("(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];if(SAGAP)try{sagaStop();}catch(_){}})()")
            for t in ['plant','models','market','race','log']:
                js(f"(()=>{{tab='{t}';render();window.scrollTo(0,0);}})()");pg.wait_for_timeout(200)
            pg.screenshot(path=out+'11_after.png')
            ok(js("!G.over"),'партия идёт дальше: '+str(js("dstr(G)"))+', моделей '+str(js("G.models.length")))
    # 5) гонка: кнопка 🗣, подписи механика на экране нет
    js(clean)
    r=js("""(()=>{const rc0=RACES.find(r=>r.t==='road'&&r.y>=1903&&r.y<=1908);const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});G.over=false;G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;
      const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'hard',gear:0}]});return rc.name+' '+rc.y;})()""")
    for i in range(60):
        if js("!!(R&&R.film)"): js("(()=>{filmSkip();})()");break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(2500)
    js("(()=>{if(R.film)try{filmSkip();}catch(_){}const t=document.getElementById('rTips');if(t)t.hidden=true;R.hold=false;R.cars.forEach(c=>{c.wait=false;});})()")
    pg.wait_for_timeout(9000)
    st=js("(()=>({nav:!!document.getElementById('rNav'),btn:(()=>{const b=document.getElementById('rNavB');return b?{hidden:b.hidden,text:b.innerText}:null;})(),mech:!!(R&&R.me&&R.me.mech),said:NAV.legSaid||0,last:NAV.last||'',t:R&&R.t}))()")
    print('race',r,json.dumps(st,ensure_ascii=False))
    ok(not st['nav'],'на экране нет подписи механика')
    ok(st['btn'] and not st['btn']['hidden'],'кнопка 🗣 в гонке: '+str(st['btn']))
    pg.screenshot(path=out+'12_race.png')
    tap="(()=>{document.getElementById('rNavB').click();return AU.on.nav;})()"
    m1=js(tap);m2=js(tap);m3=js(tap)
    ok([m1,m2,m3]==['danger','off','full'],'🗣 переключает: '+str([m1,m2,m3]))
    e=[x for x in errs if 'TUNNEL' not in x and 'NOT_FOUND' not in x and 'AudioContext' not in x]
    ok(not e,'ошибок на странице нет: '+str(e[:6]))
    print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
    b.close()
