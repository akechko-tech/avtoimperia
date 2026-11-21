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
    # ---- этап 2: бюро и гоночный отдел по обороту, кнопки «Сократить», оснастка, области в сравнении ----
    js("G.pending=[];G.over=false;G.world.my.r12=150e6;G.cash=5e7;G.rd.lvl=10;G.rd.projs=[];G.rdept=4;try{sagaStop();}catch(_){};tab='models';render();"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent")
    ok('% оборота: большой фирме — большое бюро' in t, 'карточка бюро: содержание названо долей оборота')
    ok(js("!!document.querySelector('[data-act=rdDown]')"), 'у бюро есть кнопка «Сократить»')
    js("document.querySelector('[data-act=rdDown]').click()"); pg.wait_for_timeout(300)
    ok(js("G.rd.lvl") == 9, 'нажатие «Сократить» — бюро на ступень ниже')
    js("tab='race';render();"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent")
    ok('% оборота' in t and 'сократить отдел' in t, 'карточка команды: доля оборота и «сократить отдел»')
    js("document.querySelector('[data-act=rdeptDown]').click()"); pg.wait_for_timeout(300)
    ok(js("G.rdept") == 3, 'нажатие — гоночный отдел на ступень ниже')
    r = js("(()=>{const md=G.models.find(m=>m.status==='prod');if(!md)return null;const E=ENGINES.filter(e=>!e.moto&&e.id!==md.e&&(e.y||1895)<=G.y).pop();G.plantVal=Math.max(G.plantVal,2e7);const n={...md,id:-5,e:E.id,status:'dev',vol:0};return {tc:toolingCost(n,G),base:toolingBase(n,G),nov:retoolNovelty(n,G),cmp:compareHTML(md,G,null)};})()")
    ok(r and r['tc'] > r['base'] * 5 and abs(r['nov'] - 0.35) < 1e-6, 'новый мотор на большом заводе: оснастка $%s против прежних $%s' % (r and r['tc'], r and r['base']))
    ok(r and '«С запасом» — лучше уже не ценят' in r['cmp'], 'сравнение с соперником объясняет области')
    # ---- гонки сезона одной кнопкой: строка в «Делах», команда играет сама, экран гонки не открывается ----
    js("try{demoStop();}catch(_){};if(R){try{finishRace(true);}catch(_){};R=null;}G.pending=[];try{closeSheet();}catch(_){};")   # прогон выше мог оставить начатый заезд (первый вариант в событии — «за руль»)
    js("G.pending=[];G.over=false;G.cash=Math.max(G.cash,5e6);G.tm=G.tm||{};G.tm.auto=false;tab='plant';render();"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent")
    ok('Гонки сезона: по вашей заявке' in t and js("!!document.querySelector('[data-act=raceAutoToggle]')"), 'на главном экране, в «Делах», — строка «Гонки сезона» с кнопкой')
    js("document.querySelector('[data-act=raceAutoToggle]').click()"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent")
    ok(js("G.tm.auto===true&&G.tm.cap>0") and 'команда участвует сама' in t, 'одно нажатие — команда участвует сама, бюджет года назначен')
    cap0 = js("G.tm.cap"); js("document.querySelector('[data-act=raceAutoBud][data-k=\"+\"]').click()"); pg.wait_for_timeout(300)
    ok(js("G.tm.cap") > cap0, 'кнопка «+» прибавляет бюджет года')
    r = js("(()=>{G.tm.cap=5e6;const n0=G.raceLog.length;let scr=0,msg='';for(let k=0;k<14;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();if(!document.getElementById('raceScreen').hidden)scr++;if(G.tmMsg&&G.tmMsg.list.length)msg=G.tmMsg.list.join('; ');}G.pending=[];return {ran:G.raceLog.length-n0,scr,msg,R:!!R};})()")
    ok(r['ran'] >= 1 and r['scr'] == 0 and not r['R'], 'за год команда сыграла %d гонок, экран заезда не открывался' % r['ran'])
    ok(len(r['msg']) > 5, 'итог — строкой: ' + r['msg'][:90])
    js("tab='plant';render();"); pg.wait_for_timeout(300); dash = js("(()=>{const e=document.querySelector('.card.advisor');return e?e.outerHTML:'';})()")
    # гонка за рулём: подсказка о повороте считает путь по настоящим тормозам и видит шпильку за дугой; смена шин у обочины — с подписью
    js("""(()=>{try{finishRace(true);}catch(_){};R=null;G.pending=[];AU.on.gfx='2d';const rc=RACES.find(r=>r.key==='klausen-1922');const md=G.models[0];const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);md.b=lastOf(BODIES,rc.y,x=>!x.truck&&!x.moto).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0},{drv:DRIVERS.find(d=>d.from<=rc.y&&d.to>=rc.y).id,md,prep:2,tyre:'hard',gear:0}]});})()""")
    pg.wait_for_timeout(6500)
    r = js("""(()=>{const me=R.me,T=R.trk;R.t=Math.max(R.t,1);me.wait=false;
      // ставим машину на прямую перед первой шпилькой на полном ходу
      let j=-1;for(let i=5;i<T.n-60;i++){if(Math.abs(T.K[i])>1/20){j=i;break;}}const i0=Math.max(2,j-Math.round(70/T.step)),p=T.pts[i0],t=T.T[i0];me.idx=i0;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.vx=24;me.vy=0;me.r=0;me.segT=0;trackLocal(T,me);
      const pn=paceNote(me);raceAssistHUD();const n=document.getElementById('rNote');return {pn,txt:n?n.textContent:'',cls:n?n.className:'',hid:n?n.hidden:true,j,i0,dec:brakeDec(me,1),cap:BRK_CAP};})()""")
    ok(r['pn'] and r['pn']['hair'] and r['pn']['need'] > 20, 'за 70 м до шпильки на 86 км/ч подсказка видит шпильку: %s км/ч, тормозной путь %.0f м' % (r['pn'] and r['pn']['kmh'], r['pn'] and r['pn']['need'] or 0))
    ok(not r['hid'] and str(r['pn']['kmh']) in r['txt'] and ('ТОРМОЗИ' in r['txt']) == (r['pn']['lvl'] == 'bad'), 'на экране: «%s» (%s)' % (r['txt'], r['cls']))
    r2 = js("""(()=>{const me=R.me;me.vx=30;const pn=paceNote(me);raceAssistHUD();return {lvl:pn&&pn.lvl,txt:document.getElementById('rNote').textContent};})()""")
    ok(r2['lvl'] == 'bad' and 'ТОРМОЗИ' in r2['txt'], 'быстрее — «ТОРМОЗИ!» заранее: ' + r2['txt'])
    r3 = js("""(()=>{const o=R.cars.find(c=>!c.player);o.wait=false;o.tyreSwap=true;o.vx=0;o.punct=false;o.stopT=0;document.getElementById('rBoard').dataset.t='';raceHUD();return document.getElementById('rBoard').textContent;})()""")
    ok('шины' in r3, 'соперник меняет стёртые шины у обочины — в таблице «🛞 шины»')
    js("(()=>{try{finishRace(true);closeSheet();closePaper();}catch(_){};R=null;G.pending=[];})()"); pg.wait_for_timeout(300)
    ok(not errs, 'ошибок на странице нет: ' + '; '.join(errs)[:200])
    # конструктор-воронка: вид техники → назначение → годные детали (нажатиями, как игрок)
    js("sagaCheck=()=>{};try{sagaStop();}catch(_){};G.y=1925;G.m=5;G.cash=5e7;G.pending=[];try{closeSheet();closePaper();}catch(_){};tab='models';render();")
    pg.wait_for_timeout(600)   # глава саги (год сменили на 1925-й) закрывается с анимацией — ждём, чтобы она не накрыла лист
    js("try{sagaStop();}catch(_){};document.querySelectorAll('.sg,.sg-wrap,.saga').forEach(e=>e.remove());if(typeof SAGAP!=='undefined'&&SAGAP){try{SAGAP.el.remove();}catch(_){};SAGAP=null;}openDesigner();")
    pg.wait_for_timeout(300)
    ok(js("document.querySelectorAll('#sheetBody .ktile').length") >= 7 and 'Шаг 1 из 3' in js("document.getElementById('sheetBody').textContent"), 'шаг 1: плитки видов техники')
    pg.click('#sheetBody .ktile[data-v=bus]'); pg.wait_for_timeout(250)
    ok(js("document.querySelectorAll('#sheetBody .krow').length") == 3 and 'Шаг 2 из 3' in js("document.getElementById('sheetBody').textContent"), 'шаг 2: три назначения автобуса')
    pg.click('#sheetBody .krow[data-v=coach]'); pg.wait_for_timeout(400)
    r = js("({kind:designKind(draft),b:draft.b,svg:!!document.querySelector('#sheetBody .carbox svg'),txt:document.getElementById('sheetBody').textContent})")
    ok(r['kind'] == 'coach' and r['b'] == 'b15' and r['svg'] and 'Междугородний автобус' in r['txt'] and 'пасс·км' in r['txt'], 'шаг 3: междугородний автобус — рисунок сбоку, мерка «пасс·км»')
    pg.click('#sheetBody .dsec-h[data-k=e]'); pg.wait_for_timeout(250)
    r = js("({n:document.querySelectorAll('#sheetBody .dsec.open .chip').length,hid:/Скрыто (\\d+)/.exec(document.getElementById('sheetBody').textContent)})")
    ok(r['n'] >= 1 and r['hid'] and int(r['hid'][1]) >= 5, 'моторы: показано %s, скрыто %s' % (r['n'], r['hid'] and r['hid'][1]))
    pg.click('#sheetBody [data-act=dall]'); pg.wait_for_timeout(250)
    ok(js("document.querySelectorAll('#sheetBody .dsec.open .chip').length") == r['n'] + int(r['hid'][1]) and js("document.querySelectorAll('#sheetBody .chip .ftag.bad').length") >= 5, '«Показать все» — с пометками')
    pg.click('#sheetBody [data-act=kgrp]'); pg.wait_for_timeout(250)
    ok('Шаг 2 из 3' in js("document.getElementById('sheetBody').textContent"), '«Изменить» — назад к назначению, одно нажатие')
    pg.click('#sheetBody .krow[data-v=bus]'); pg.wait_for_timeout(300)
    # модель нового вида в серии: месяц проходит, продажи идут в своей работе, карточка модели объясняет мерку
    r = js("""(()=>{const md={...draft,id:777,made:300,vol:60,launched:mi(G)-12,status:'prod',price:0,stock:0,eq:[]};delete md.open;md.price=Math.round(refPrice(md,G)/10)*10;G.models.push(md);closeSheet();
      let e='';try{step();}catch(x){e=String(x&&x.stack||x).slice(0,200);}G.pending=[];try{closeSheet();closePaper();}catch(_){};const m=G.models.find(x=>x.id===777);return {e,sold:m.lastSold||0,use:m.useD||{},hint:truckHint(m,G)};})()""")
    ok(not r['e'] and set(r['use'].keys()) <= {'bus'} and 'Пассажиро-километр' in r['hint'], 'городской автобус в серии: месяц без ошибок, продаётся только на маршрутах (%s шт.), в карточке — пассажиро-километр %s' % (r['sold'], r['e']))
    js("G.models=G.models.filter(m=>m.id!==777);render();")
    # этап 5: ход соперников — полоса на главном экране, экран «Соперники», карточка фирмы
    r = js("""(()=>{let e='';try{G.firms=G.firms||{};const c=G.country,L=COMPS[c],i=L.findIndex(x=>!x.imp&&compAlive(x,G)&&!pkIs(x,G)),cp=L[i],t=mi(G);
      const F=G.firms[c+':'+i]||firmMake(G,c,i,cp),g=firmSegs(cp)[0];F.h12=F.h12||2e6;F.r12=F.r12||1.5e6;F.u12=F.u12||900;F.p12=F.p12||5e4;F.cash=F.cash==null?2e5:F.cash;F.ld=0.8;F.pk[g]=0.9;F.md[g]={q:0.4,from:t-3,till:t+60,name:'Проба',who:'«'+G.company+'»',you:1};F.prog={k:'line',g,at:t+9,cost:1,ck:0.8,who:'«'+G.company+'»'};F.log=[{t:t-1,txt:'снизила цены на 10%',k:'cut'}];
      G.last=G.last||{};G.last.riv=[{n:compName(cp,G),bn:cp.n,c,i,t:compName(cp,G)+' снижает цены на 10%',txt:'Проверка хода.',w:3,k:'cut'},{n:compName(cp,G),bn:cp.n,c,i,t:compName(cp,G)+': новая модель «Проба»',txt:'Проверка хода.',w:4,k:'model'}];
      render();}catch(x){e=String(x&&x.stack||x).slice(0,300);}
      const strip=document.querySelector('.ec-row.riv');return {e,strip:strip?strip.textContent:'',act:strip?strip.dataset.act:''};})()""")
    ok(not r['e'] and 'Ход соперников' in r['strip'] and 'ещё 1' in r['strip'] and r['act'] == 'rivals', 'полоса «Ход соперников» на главном экране: %s %s' % (r['strip'][:70], r['e']))
    pg.click('.ec-row.riv'); pg.wait_for_timeout(300)
    r = js("({txt:document.getElementById('sheetBody').textContent,n:document.querySelectorAll('#sheetBody .tech-row[id^=firm]').length,hid:document.getElementById('sheet').hidden})")
    ok(not r['hid'] and 'Соперники' in r['txt'] and 'Их ход' in r['txt'] and r['n'] >= 1 and 'Проба' in r['txt'] and 'Готовит перестройку завода на поток' in r['txt'] and 'undefined' not in r['txt'] and 'NaN' not in r['txt'], 'экран «Соперники» одним нажатием: ход месяца и %s карточек фирм' % r['n'])
    ok('Цена: −10% к обычной' in r['txt'].replace('\u2212', '−') and 'ответ' in r['txt'], 'карточка фирмы: цена −10 %, модель-ответ, программа')
    js("closeSheet()")
    # этап 4б: свои линии — строка «Где собирать» и «Иначе» в конструкторе, «Самая прибыльная», строки в «Заводе» и «Делах»
    r = js("""(()=>{let e='';try{G.tech=G.tech||{};G.tech.line=2;G.cap=Math.max(G.cap,3000);G.cash=Math.max(G.cash,3e7);G.lines=G.lines||{};G.lines.car=true;G.xl=[];G.xlV=1;
      G.models=G.models.filter(m=>m.id<9000);[['people',2500],['middle',300],['lux',20]].forEach(([k,v],i)=>{const d=autoDesign(k,G);const m={...d,id:9000+i,name:'Л'+k,paint:'#8a1c1c',plan:'auto',status:'prod',launched:mi(G)-30,stock:0,backlog:0,made:5000,vol:v,fc:v,lastMade:v,totalSold:0,lastSold:0,lastDem:0};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);});
      const C=G.models.find(m=>m.id===9002),L=xlAdopt(G,60,C.id,'');L.src='own';G.xlMsg={m:mi(G),list:['«Ллюкс» — на свою линию: $90 тыс., окупится за 1,2 года']};
      tab='plant';render();}catch(x){e=String(x&&x.stack||x).slice(0,300);}
      return {e,plant:document.querySelector('main').textContent};})()""")
    ok(not r['e'] and 'Свои линии под модели' in r['plant'] and 'Ллюкс' in r['plant'], '«Завод»: строка «Свои линии под модели» %s' % r['e'])
    ok('Линии завода:' in r['plant'] and 'на свою линию' in r['plant'], '«Дела»: отчёт помощника о линиях строкой')
    js("openDesigner('sport')"); pg.wait_for_timeout(300)
    r = js("({txt:document.getElementById('sheetBody').textContent,btn:(document.querySelector('#sheetBody [data-act=dauto]')||{}).textContent||'',dxl:!!document.querySelector('#sheetBody [data-act=dxl]')})")
    ok('Где собирать:' in r['txt'] and r['dxl'], 'конструктор: строка «Где собирать» и кнопка «Иначе»')
    ok(r['btn'] == 'Самая прибыльная', 'кнопка подбора говорит, что ищет: «%s»' % r['btn'])
    w0 = js("(document.querySelector('#sheetBody [data-act=dxl]').parentElement.textContent)")
    pg.click('#sheetBody [data-act=dxl]'); pg.wait_for_timeout(300)
    w1 = js("(document.querySelector('#sheetBody [data-act=dxl]').parentElement.textContent)")
    ok(w0 != w1 and 'по вашему решению' in w1, '«Иначе» — одно нажатие меняет решение: %s → %s' % (w0[:60], w1[:60]))
    pg.click('#sheetBody [data-act=dcopy]'); pg.wait_for_timeout(200); pg.click('#sheetBody [data-act=dauto]'); pg.wait_for_timeout(500)
    t = js("(document.querySelector('#sheetBody .dnote')||{}).textContent||''")
    ok(t.startswith('Самая прибыльная:') and ('прибыль в месяц' in t or 'менять нечего' in t) and 'NaN' not in t and 'undefined' not in t, 'строка под кнопками: %s' % t[:150])
    js("closeSheet();G.models=G.models.filter(m=>m.id<9000);G.xl=[];G.xlMsg=null;render();")
    # этап 4в: опыт и «Своя разработка» — строка в карточке КБ, воронка, проект; свой авиамотор
    r = js("""(()=>{let e='';try{G.pending=[];G.y=1916;G.cash=Math.max(G.cash,5e6);G.rd.lvl=8;G.rd.projs=[];G.xp={eng:52,alloy:31,aero:27,brake:38,susp:22,mass:44};G.lines=G.lines||{};G.lines.car=true;G.world=G.world||worldInit(G);G.world.my.r12=3e7;
      tab='models';setOpen('rdcard',true);render();}catch(x){e=String(x&&x.stack||x).slice(0,300);}
      const c=document.getElementById('fc-rdcard');return {e,kb:c?c.textContent:'',btn:!!document.querySelector('[data-act=ownOpen]')};})()""")
    ok(not r['e'] and 'Опыт:' in r['kb'] and r['btn'], 'карточка КБ: строка опыта и кнопка «Своя разработка» %s' % r['e'])
    pg.click('[data-act=ownOpen]'); pg.wait_for_timeout(300)
    t = js("document.getElementById('sheetBody').textContent")
    ok('Опыт компании' in t and 'Шаг 1. Что делаем' in t and 'Массовое производство' in t and 'Авиамотор' in t and 'undefined' not in t and 'NaN' not in t, 'лист «Своя разработка»: шесть областей опыта и выбор узла')
    pg.click('#sheetBody [data-act=ownCat][data-k=e]'); pg.wait_for_timeout(300)
    pg.click('#sheetBody [data-act=ownTech][data-id=ohc]'); pg.wait_for_timeout(250)
    pg.click('#sheetBody [data-act=ownGoal][data-g=power]'); pg.wait_for_timeout(250)
    r = js("({t:document.getElementById('sheetBody').textContent,dis:document.querySelector('#sheetBody [data-act=ownStart]').disabled,n:document.querySelectorAll('#sheetBody .chip.on').length})")
    ok('Что получится' in r['t'] and 'Год по истории' in r['t'] and 'риск' in r['t'] and not r['dis'] and r['n'] >= 4 and 'NaN' not in r['t'], 'три нажатия — узел, приём, цель: итог виден до начала работ (год по истории, срок, риск)')
    js("document.getElementById('ownname').value='Мотор Проба'")
    pg.click('#sheetBody [data-act=ownStart]'); pg.wait_for_timeout(400)
    r = js("({n:G.rd.projs.filter(p=>p.kind==='own').length,nm:(G.rd.projs.find(p=>p.kind==='own')||{}).name,hid:document.getElementById('sheet').hidden,kb:(document.getElementById('fc-rdcard')||{}).textContent||''})")
    ok(r['n'] == 1 and r['nm'] == 'Мотор Проба' and r['hid'] and 'Своя разработка: Мотор Проба' in r['kb'], '«Начать» — проект «%s» в КБ' % r['nm'])
    js("ACT.aeOpen()"); pg.wait_for_timeout(300)
    t = js("document.getElementById('sheetBody').textContent")
    ok('Свой авиамотор' in t and 'Что получится' in t and 'л.с. на кг' in t and 'продажа авиазаводам' in t and 'NaN' not in t and 'undefined' not in t, 'лист «Свой авиамотор»: тип, цель, сравнение с лучшим мотором года и прикидка продаж')
    js("closeSheet();G.rd.projs=[];render();")
    # этап 5б: сделки и акционеры, группы фирм, люди
    r = js("""(()=>{BOTS_OFF=false;G.pending=[];G.cash=9e7;G.rd.lvl=3;G.firms=G.firms||{};const t=mi(G);
      const L=COMPS.us.map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,'us',o.i)&&maStat(G,'us',o.i)&&!(DEAL_PROUD[o.cp.n]>0)&&!(G.bots&&G.bots[coKey(o.cp.n)])&&compVol(o.cp,G)>300);
      const A=L[0],B=L[1],C=L[2],FA=firmGet(G,'us',A.i)||firmMake(G,'us',A.i,A.cp),FB=firmGet(G,'us',B.i)||firmMake(G,'us',B.i,B.cp),FC=firmGet(G,'us',C.i)||firmMake(G,'us',C.i,C.cp);
      [FA,FB,FC].forEach(F=>{F.h12=F.h12||3e6;F.r12=F.r12||3e6;F.p12=F.p12||1e5;F.cash=5e5;F.st='ok';F.u12=F.u12||5000;});
      FA.own=B.i;FA.ownT=t-30;FB.grp=[A.i];FB.gr=0.5;FB.grWhy='иск за «Мотор», 1905';FC.prog={k:'model',g:'people',at:t+8,cost:0,q:0.3,frac:0.5,who:'«Форд Мотор»',you:1,lq:0.5,q0:0};
      window.__T={a:A.i,b:B.i,c:C.i};openRivals('us');return {t:document.getElementById('sheetBody').textContent,btn:!!document.querySelector('#sheetBody [data-act=rivPoach][data-i="'+C.i+'"]')};})()""")
    ok('Принадлежит' in r['t'] and 'Группа: владеет' in r['t'] and 'Помнит обиду' in r['t'] and r['btn'] and 'undefined' not in r['t'] and 'NaN' not in r['t'], 'экран «Соперники»: группа, обида и кнопка «Переманить инженера»')
    c0 = js("G.cash"); pg.click('#sheetBody [data-act=rivPoach]'); pg.wait_for_timeout(400)
    r = js("({d:%f-G.cash,gr:firmGet(G,'us',__T.c).gr||0,b:bn('devTime'),t:document.getElementById('sheetBody').textContent})" % c0)
    ok(r['d'] > 0 and r['gr'] >= 0.35 and 'Помнит обиду' in r['t'], 'одно нажатие — инженер переманен: −$%d, обида запомнена' % r['d'])
    js("closeSheet();openDeal('us',__T.c,{st:1,mode:'int',pay:'cash'})"); pg.wait_for_timeout(400)
    t = js("document.getElementById('sheetBody').textContent")
    ok('переходят её долги' in t and 'помнят обиду' in t and 'undefined' not in t and 'NaN' not in t, 'переговоры: до подписи видны долги марки, убыточные годы и обида')
    js("""(()=>{try{NEG=null;}catch(_){};closeSheet();G.partners=[{n:'Братья Додж',sh:0.1,t:0}];G.shHoard=12;G.shT=-999;G.loan=0;G.cash=Math.max(G.cash,shRev12(G)*2+1e6);G.pending=[];shDemand(G);render();})()"""); pg.wait_for_timeout(500)
    r = js("({n:G.pending.length,t:document.body.textContent,k:(G.pending[0]||{choices:[[]]}).choices.map(c=>c[1]).join(',')})")
    ok(r['n'] == 1 and 'особый дивиденд' in r['t'] and 'sh:pay:' in r['k'] and 'sh:no:' in r['k'], 'событие «Совладельцы требуют особый дивиденд» — две кнопки')
    js("resolve(G.pending[0].choices[1][1]);G.pending=[];G.partners=[];G.shSuit=null;BOTS_OFF=true;render();")
    # этап 6: мировые рекорды и рекордный образец; испытания ведомств
    js("G.pending=[];try{closePaper();}catch(_){};G.cash=9e7;tab='race';render();"); pg.wait_for_timeout(400)
    ok(js("!!document.querySelector('[data-act=recOpen]')"), 'во вкладке «Гонки» — карточка «Мировые рекорды»')
    pg.click('[data-act=recOpen]'); pg.wait_for_timeout(300)
    t = js("document.getElementById('sheetBody').textContent")
    ok('Рекорд скорости на суше' in t and 'Суточный рекорд' in t and 'Держит:' in t and 'undefined' not in t and 'NaN' not in t, 'лист «Мировые рекорды»: строки рекордов и кто их держит')
    pg.click('#sheetBody [data-act=recBuild]'); pg.wait_for_timeout(300)
    pg.click('#sheetBody [data-act=recOpt][data-v=two]'); pg.wait_for_timeout(250)
    r = js("({t:document.getElementById('sheetBody').textContent,dis:document.querySelector('#sheetBody [data-act=recStart]').disabled})")
    ok('Что получится' in r['t'] and 'расчётная скорость' in r['t'] and 'Шанс рекорда' in r['t'] and 'NaN' not in r['t'] and 'undefined' not in r['t'], 'два нажатия — «Рекордный образец», «Два мотора»: скорость, шанс, цена и срок до начала работ')
    if not r['dis']:
        js("document.getElementById('recname').value='Стрела'"); pg.click('#sheetBody [data-act=recStart]'); pg.wait_for_timeout(400)
        ok(js("G.rd.projs.some(p=>p.kind==='rec'&&p.name==='Стрела')"), '«Начать» — проект «Стрела» в КБ')
        js("G.rd.projs=G.rd.projs.filter(p=>p.kind!=='rec');")
    js("""(()=>{closeSheet();G.y=1925;G.m=2;const md={...rivalDesign('armored',1925),id:9301,name:'Броневик',status:'prod',launched:mi(G)-5,stock:0,made:10,vol:5,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)/10)*10;G.models.push(md);tab='models';render();})()"""); pg.wait_for_timeout(500)
    ok(js("!!document.querySelector('[data-act=trOpen]')") and js("/На полигон/.test(trialModelLine(G.models.find(m=>m.id===9301),G))"), '«Модели»: строка «Испытания ведомств»; в карточке броневика — кнопка «На полигон»')
    pg.click('[data-act=trOpen]'); pg.wait_for_timeout(300)
    t = js("document.getElementById('sheetBody').textContent")
    ok('Испытания ведомств' in t and 'Приёмка по заявке' in t and 'Броневик' in t and 'undefined' not in t and 'NaN' not in t, 'лист «Испытания ведомств»: приёмка по заявке')
    pg.click('#sheetBody [data-act=trTest]'); pg.wait_for_timeout(400)
    ok(js("(G.trials.q||[]).some(q=>q.md===9301)"), 'одно нажатие — броневик на полигоне')
    js("G.models=G.models.filter(m=>m.id!==9301);G.trials.q=[];closeSheet();render();")
    ok(not errs, 'ошибок на странице нет: ' + '; '.join(errs)[:200])
    # снимки карточки — на чистой странице с теми же стилями (живые сцены 3D мешают снимку под программной отрисовкой)
    js("(()=>{try{sagaStop();}catch(_){};try{musicStop();}catch(_){};document.querySelectorAll('canvas,video,audio').forEach(e=>e.remove());})()")
    for name, card in (('1_young', card1), ('2_window', card2), ('4_dela', dash)):
        pg.evaluate("h=>{document.body.innerHTML='<main style=\"padding:10px\">'+h+'</main>';window.scrollTo(0,0);}", card); pg.wait_for_timeout(300)
        try: pg.screenshot(path=out + name + '.png', full_page=True, timeout=60000)
        except Exception as e: print('  снимок не снят:', name, str(e)[:80])
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
