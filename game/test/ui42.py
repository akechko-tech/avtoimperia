# 0.42: проверки в браузере — приз зачёта мотоциклов на празднике и в итогах, приз выставки с вручителем, блок «Энциклопедия»
# и «Зачем это нужно» в газете о детали и в справке конструктора, «Господство» с пояснением «как считается», путь к автомобилю
# пройден покупкой автозавода. python3 game/test/ui42.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui42/'
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
    # 1) зачёт мотоциклов: приз гонки на празднике и в итогах
    js("newMotoGame('custom','it','Проба','normal','Ласточка');G.pending=[];try{sagaStop();}catch(_){};")
    js("""(()=>{const rc=RACES.find(r=>r.id==='targa');const md=G.models[0];G.y=rc.y;G.m=rc.m;
      const res=[{name:'Itala',pos:1,fin:28000,drv:'Алессандро Каньо'},{name:'Fiat',pos:2,fin:28400,drv:'Винченцо Ланча'}];
      const mres=[{you:1,cls:'moto',pos:1,fin:30000,label:md.name,drv:'Ваш гонщик',md,prep:1,num:5},{cls:'moto',name:'Bianchi',pos:2,fin:30500,drv:'любитель'}];
      raceResults(rc,res.concat(mres),'sim',{len:rc.km*1000});})()"""); pg.wait_for_timeout(700)
    t = js("(()=>{const e=document.querySelector('.cel-t.cel-aw');return e?e.textContent:'';})()")
    ok('зачёт мотоциклов' in t and 'Флорио' in t and 'Тарга' in t, 'праздник зачёта мотоциклов: приз Тарга Флорио «— зачёт мотоциклов», вручает Флорио')
    pg.screenshot(path=out + '1_moto_award.png')
    js("(()=>{const e=document.querySelector('.cel.has-aw');if(e)e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));})()"); pg.wait_for_timeout(300)
    sh = js("document.getElementById('sheetBody')?document.getElementById('sheetBody').textContent:''")
    ok('зачёт мотоциклов' in sh and js("!!document.querySelector('#sheetBody .aw-card svg')"), 'в итогах гонки — карточка приза для зачёта мотоциклов')
    cr = json.loads(js("JSON.stringify(G.cres[RACES.find(r=>r.id==='targa').key])"))
    ok(cr.get('mw') == 'Проба' and cr.get('mo') == 0 and cr.get('w') == 'Itala', 'запись итога: победитель Itala, зачёт мотоциклов — ваш (mw), машины были (mo=0)')
    js("try{closeSheet();}catch(_){};for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.pending=[];")
    # 2) приз выставки на празднике
    js("""(()=>{const a=showAwardOf('paris',1905,G);pushEvent({own:1,kicker:'Выставка',title:'Парижский автосалон',deck:'проба',cel:['Приз прессы «Лучшая машина салона»','«Ласточка» · Парижский автосалон','🥇','medal',{award:a,place:1}],text:'Текст.'},true);showEvent();})()"""); pg.wait_for_timeout(700)
    t = js("(()=>{const e=document.querySelector('.cel-t.cel-aw');return e?e.textContent:'';})()")
    ok('Парижского салона' in t and 'ван Зюйлен' in t and 'Марсельеза' in t, 'выставка: «Золотая медаль Парижского салона», вручает барон ван Зюйлен, «Марсельеза»')
    pg.screenshot(path=out + '2_show_award.png')
    js("(()=>{const e=document.querySelector('.cel.has-aw');if(e)e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));})();for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.pending=[];")
    # 3) газета о детали: «Зачем это нужно» и «Энциклопедия»
    js("""(()=>{G.rd.early=G.rd.early||[];reelOffer(G,'part:me7','Прототип готов: Двухтактный 2½ л.с.','На 1 год раньше рынка','В истории такую деталь первыми сделали Scott в 1913 году.',{wk:partWiki('me7'),why:partWhy(G,ALL_PARTS().find(q=>q.id==='me7'))});showEvent();})()"""); pg.wait_for_timeout(900)
    pt = js("(()=>{const e=document.querySelector('#paperWrap .paper');return e?e.textContent:'';})()")
    ok('Зачем это нужно' in pt and 'цена ниже' in pt and 'сравнение с' in pt, 'газета о двухтактном моторе: «Зачем это нужно» — сравнение с мотором вашей «Ласточки» (дешевле, легче)')
    ok(js("!!document.querySelector('#paperWrap .p-wiki')") and 'Энциклопедия' in pt, 'в заметке есть блок «Энциклопедия» (статья подгружается с Википедии; без сети — заглушка)')
    pg.screenshot(path=out + '3_paper_wiki.png', full_page=True)
    js("for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.pending=[];")
    # 4) справка конструктора: «Зачем и откуда»
    js("openDesigner('moto');"); pg.wait_for_timeout(400)
    js("(()=>{const b=document.querySelector('[data-act=dsec][data-k=e]');if(b)b.click();})()"); pg.wait_for_timeout(300)
    hasBtn = js("!!document.querySelector('[data-act=partInfo]')")
    js("(()=>{const b=document.querySelector('[data-act=partInfo]');if(b)b.click();})()"); pg.wait_for_timeout(400)
    st = js("document.getElementById('sheetBody')?document.getElementById('sheetBody').textContent:''")
    ok(hasBtn and 'Зачем это нужно' in st and 'Энциклопедия' in st, 'конструктор: кнопка «Зачем и откуда» открывает справку о детали со сравнением и энциклопедией')
    pg.screenshot(path=out + '4_part_info.png')
    js("try{closeSheet();}catch(_){}")
    # 5) «Господство»: как считается
    js("G.pending=[];doStep();try{sagaStop();}catch(_){};for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.pending=[];tab='empire';render()"); pg.wait_for_timeout(400)
    dt = js("(()=>{const e=document.getElementById('sec-dom');return e?e.textContent:'';})()")
    ok('большая гонка 6 очков' in dt and 'зачёт мотоциклов 2/1' in dt and 'вы:' in dt, 'карточка «Господство»: под каждой шкалой — как считается, ваши очки и мир')
    pg.screenshot(path=out + '5_dom.png', full_page=True)
    # 6) мотомастерская купила автозавод — путь к автомобилю пройден
    r = json.loads(js("""(()=>{const i=COMPS.us.findIndex(cp=>!cp.imp&&compAlive(cp,{y:1912,m:0}));G.y=1912;G.m=3;G.hold=G.hold||[];G.hold.push({c:'us',i,n:COMPS.us[i].n,mode:'int',st:1,t:mi(G)});G.pending=[];G.cash=1e6;doStep();try{sagaStop();}catch(_){};
      for(let k=0;k<6;k++)try{closePaper();}catch(_){};const ev=G.pending.find(e=>/автомобили — вместе с/.test(e.title||''));G.pending=[];tab='plant';render();
      return JSON.stringify({car:lineOn(G,'car'),ev:!!ev,card:!!document.getElementById('fc-carshop')||/Путь к автомобилю/.test(document.getElementById('view').textContent)});})()"""))
    ok(r['car'] and r['ev'] and not r['card'], 'после покупки автозавода в США: автомобили открыты, заметка пришла, карточки «Путь к автомобилю» на «Заводе» нет')
    js("tab='models';render()"); pg.wait_for_timeout(300)
    ok(js("!/когда будет оборудование для автомобилей/.test(document.getElementById('view').textContent)"), '«Модели»: подсказки «когда будет оборудование для автомобилей» больше нет')
    ok(not errs, 'ошибок страницы нет' + ('' if not errs else ': ' + errs[0][:200]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
