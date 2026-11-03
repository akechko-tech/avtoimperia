# 0.41: проверки в браузере — награды: праздник с карточкой приза (рисунок, кто вручает, музыка), итоги гонки с призом,
# витрина с призом серии, гимн на церемонии своей мелодией (cue) и возврат музыки; награда в небе.
# python3 game/test/ui41.py
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
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    js("newGame('renault','fr','','normal','');G.pending=[];try{sagaStop();}catch(_){};tab='plant';render()"); pg.wait_for_timeout(300)
    # 1) приз гонки по серии: Кубок Вандербильта — Вандербильт, гимн США; Тарга — доска, Флорио
    r = json.loads(js("""(()=>{const vb=RACES.find(r=>r.id==='vanderbilt'),a=awardOf(vb,G),tg=awardOf(RACES.find(r=>r.id==='targa'),G);return JSON.stringify({cup:a.cup,by:a.by,mus:a.music.n,tune:a.music.tune||'',tk:tg.kind,tby:tg.by});})()"""))
    ok(r['cup']=='Кубок Вандербильта' and 'Вандербильт' in r['by'] and r['tune']=='hymn_us', 'Кубок Вандербильта: вручает %s, музыка %s' % (r['by'], r['mus']))
    ok(r['tk']=='targa' and 'Флорио' in r['tby'], 'Тарга Флорио — золотая доска, вручает %s' % r['tby'])
    # 2) праздник с карточкой приза: рисунок, кто вручает, музыка; держится дольше; закрывается касанием
    js("""(()=>{const rc=RACES.find(r=>r.id==='vanderbilt');AU.on.music=true;auInit();celebrate('Победа!',rc.name+' · пилот · «Машина»','🏁',null,{award:awardOf(rc,G),place:1});})()"""); pg.wait_for_timeout(600)
    t = js("(()=>{const e=document.querySelector('.cel-t.cel-aw');return e?e.textContent:'';})()")
    ok('Кубок Вандербильта' in t and 'Вручает' in t and 'Вандербильт' in t and ('Star-Spangled' in t), 'праздник: карточка приза с названием, вручителем и музыкой')
    ok(js("!!document.querySelector('.cel-aw .aw-i svg')") and js("!!document.querySelector('.cel-aw .aw-by')"), 'в карточке — рисунок приза (svg) и портрет/инициалы вручителя')
    pg.screenshot(path=out + '1_celebrate_cup.png')
    au = json.loads(js("JSON.stringify({ctx:!!AU.ctx,cue:!!(AU.synth&&AU.synth.cue),tune:AU.synth&&AU.synth.tune||'',st:AU.ctx?AU.ctx.state:''})"))
    ok(au['cue'] and au['tune']=='hymn_us', 'на церемонии звучит гимн своей мелодией (cue hymn_us), контекст %s' % au['st'])
    pg.wait_for_timeout(3600)
    ok(js("!!document.querySelector('.cel.has-aw')"), 'через 4 с карточка приза ещё на экране (обычный праздник уже ушёл бы)')
    js("document.querySelector('.cel.has-aw').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); pg.wait_for_timeout(700)
    ok(not js("!!document.querySelector('.cel.has-aw')"), 'касание закрывает карточку')
    # гимн доигрывает и музыка возвращается: прокрутим шаги
    st = json.loads(js("(()=>{let n=0;while(AU.synth&&AU.synth.cue&&!AU.synth.end&&n<4000){AU.next=AU.ctx.currentTime-0.2;auSched();n++;}return JSON.stringify({n,step:AU.step,len:TUNES.hymn_us.mel.replace(/\\|/g,' ').trim().split(/\\s+/).length});})()"))
    pg.wait_for_timeout(900)
    ok(abs(st['step']-st['len'])<=3 and js("!(AU.synth&&AU.synth.cue)"), 'гимн сыгран один раз (%d шагов из %d) — cue снят, музыка продолжается' % (st['step'], st['len']))
    # 3) второе место — серебряная медаль с тем же вручителем, марш
    js("""(()=>{const rc=RACES.find(r=>r.id==='targa');celebrate('Второе место!',rc.name,'🥈','medal',{award:awardOf(rc,G),place:2});})()"""); pg.wait_for_timeout(500)
    t = js("(()=>{const e=document.querySelector('.cel-t.cel-aw');return e?e.textContent:'';})()")
    ok('Серебряная медаль' in t and 'Награждает' in t and 'Флорио' in t, 'подиум: серебряная медаль, награждает Флорио')
    pg.screenshot(path=out + '2_celebrate_medal.png')   # снимок с конфетти на swiftshader долгий — карточка может уйти сама
    js("(()=>{const e=document.querySelector('.cel.has-aw');if(e)e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));})()"); pg.wait_for_timeout(600)
    # 4) итоги гонки с призом: 1-е место в Тарга Флорио
    js("""(()=>{const rc=RACES.find(r=>r.id==='targa');const md=G.models[0];G.y=rc.y;G.m=rc.m;
      const res=[{you:1,pos:1,fin:28000,label:md.name,drv:'Ваш пилот',md,prep:1,num:3},{name:'Itala',pos:2,fin:28400,drv:'Алессандро Каньо'},{name:'Fiat',pos:3,fin:28900,drv:'Винченцо Ланча'},{name:'Isotta Fraschini',dnf:'сошёл',fin:null,drv:'Минойя'}];
      raceResults(rc,res,'sim',{len:rc.km*1000});})()"""); pg.wait_for_timeout(800)
    sh = js("document.getElementById('sheetBody')?document.getElementById('sheetBody').textContent:(document.querySelector('.sheet')||{}).textContent||''")
    ok('Тарга Флорио' in sh and 'Вручает' in sh and 'Флорио' in sh, 'лист итогов гонки: карточка приза с вручителем')
    ok(js("!!document.querySelector('.sheet .aw-card svg, #sheet .aw-card svg')"), 'в итогах — рисунок приза')
    pg.screenshot(path=out + '3_result_sheet.png')
    tro = json.loads(js("JSON.stringify((G.trophies||[]).filter(t=>t.rk&&t.rk.startsWith('targa')).map(t=>({k:t.kind,t:t.title,rk:t.rk})))"))
    ok(len(tro)==1 and tro[0]['k']=='cup', 'кубок Тарга Флорио лёг в витрину: %s' % json.dumps(tro, ensure_ascii=False))
    # газета о победе упоминает приз
    pap = js("(()=>{const P=(G.papers||[]).slice(-1)[0];return P?P.text:'';})()")
    ok('Победителю' in pap and 'Флорио' in pap, 'газета: «Победителю — … вручает Винченцо Флорио»')
    js("try{closeSheet();}catch(_){};for(let i=0;i<6;i++)try{closePaper();}catch(_){};")
    # 5) витрина: лист кубка с настоящим призом серии
    js("(()=>{const i=(G.trophies||[]).findIndex(t=>t.rk&&t.rk.startsWith('targa'));openSheet(trophyHTML(G.trophies[i]));})()"); pg.wait_for_timeout(400)
    ok(js("!!document.querySelector('.tro-award svg')") and 'Вручает' in js("document.querySelector('.tro-award').parentElement.textContent"), 'витрина: у кубка — рисунок приза серии и вручитель')
    pg.screenshot(path=out + '4_trophy.png')
    js("closeSheet()")
    # 6) небо: приз авиационного состязания
    r = json.loads(js("""(()=>{const ev=AIR_EV.find(e=>e.key==='schneider-1913'),a=airAwardOf(ev,G);const ch=airAwardOf(AIR_EV.find(e=>e.key==='channel-1909'),G);return JSON.stringify({cup:a.cup,by:a.by,k:a.kind,ch:ch.by,chm:ch.music.n});})()"""))
    ok('Шнейдера' in r['cup'] and 'Шнейдер' in r['by'] and r['k']=='statue', 'Кубок Шнейдера — статуэтка, вручает Жак Шнейдер')
    ok('Нортклифф' in r['ch'] and 'Марсельеза' in r['chm'], 'перелёт через Ла-Манш: чек «Дейли Мейл» от Нортклиффа, Марсельеза (гонка во Франции)')
    # 7) плейлист: гимны не в «Мелодиях игры»
    ok(not js("musSynth().some(t=>t.tune&&TUNES[t.tune].cue)"), 'гимны не попадают в плейлист «Мелодия игры»')
    ok(not errs, 'ошибок страницы нет' + ('' if not errs else ': ' + errs[0][:200]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
