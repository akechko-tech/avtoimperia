// 0.36: Россия — новая страна. Герои (Фрезе, Рябушинский, Меллер), город по эпохе, выставки и вызовы, фильмы с вариантами после
// революции и три пути в ноябре 1917 года: уехать, остаться (национализация, нэп, план треста) или продать дело.
// node game/test/russia36.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const quiet=()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];};
// ---------- 1) страна и герои ----------
ok(COUNTRIES.ru&&COUNTRIES.ru.name==='Россия','страна в списке: '+Object.values(COUNTRIES).map(c=>c.name).join(', '));
for(const k of ['frese','ryabush','meller']){const P=PIONEERS[k];ok(P&&P.c==='ru','герой '+P.name+' ('+(P.moto?'мотоциклы':P.role)+'): '+P.bio.slice(0,70)+'…');}
newGame('frese','ru','Фрезе и Ко','normal');quiet();
ok(cityOf(G)==='Петербург'&&G.log.some(l=>/Петербург/.test(l.text)),'Фрезе начинает в Петербурге: «'+G.log[0].text.slice(0,80)+'…»');
ok(G.log.some(l=>/Машин в России — десятки/.test(l.text)),'первая запись о русском рынке есть');
G.y=1915;ok(cityOf(G)==='Петроград','1915 год — Петроград');G.y=1925;ok(cityOf(G)==='Ленинград','1925 год — Ленинград');G.y=1895;
newGame('ryabush','ru','АМО','normal');quiet();ok(cityOf(G)==='Москва','Рябушинский — Москва');
ok(legendsOf(G).some(L=>L.id==='amo_f15'),'легенда Рябушинского — АМО-Ф-15');
newGame('custom','ru','Своя','normal');quiet();ok(legendsOf(G).map(L=>L.id).join()==='c_rb24,c_nami1','свой персонаж в России: легенды «С24» и «НАМИ-1»');
newMotoGame('meller','ru','Дукс','normal','Д1');quiet();ok(G.motoStart&&sagaList(G)===SAGA.meller,'Меллер — мотомастерская и свой фильм «'+SAGA.meller.map(c=>c.t).join(' → ')+'»');
// ---------- 2) выставки, вызовы, спонсоры, гонщики-любители ----------
ok(SHOWS.filter(sh=>SHOW_HOST[sh.h].c==='ru').length>=4,'выставки в России: '+SHOWS.filter(sh=>SHOW_HOST[sh.h].c==='ru').map(sh=>showName(sh)).join(', '));
ok(MATCH_VENUES.some(v=>v.c==='ru'&&v.k==='match')&&MATCH_VENUES.some(v=>v.c==='ru'&&v.k==='record'),'матч и спор о скорости под Петербургом: '+MATCH_VENUES.filter(v=>v.c==='ru').map(v=>v.name).join(', '));
ok(TRIAL_ROUTES.ru&&trialRoute('ru',1913)[1].includes('Псков'),'пробег 1913 года — '+trialRoute('ru',1913)[1]);
ok(RX_SPONS.ru&&AMATEUR.ru&&NAT_C['Россия']==='ru'&&ELEG_VENUE.ru&&MREC_VENUE.ru&&DX_KIND.train.route.ru,'спонсоры, любители, пилоты, смотр, мерная верста и курьерский поезд — свои');
ok(CHANCE.some(c=>c.id==='tsar'&&c.cc==='ru'),'карточка «Машина для Царского Села»');
// ---------- 3) фильмы: главы целы, варианты после революции ----------
{const T=new Set(allTitles()),BK=Object.keys(SAGA_B),SK=Object.keys(SEG),FX=['cash','cashK','rep','b','seg','mood','legal','roy','sup','ruSafe'];
  const check=(k,L)=>{const bad=[];L.forEach(c=>[{}].concat(c.v||[]).forEach(v=>{const sc=v.sc||c.sc,o=v.o||c.o,q=v.q||c.q;
      if(!sc||sc.length<3)bad.push(c.id+': мало сцен');if(!q)bad.push(c.id+': нет вопроса');if(!o||o.length<2)bad.push(c.id+': мало выборов');if(!(v.t||c.t))bad.push(c.id+': без названия');
      (o||[]).forEach(x=>{const f=x.fx||{};if(!x.t||!x.res)bad.push(c.id+': выбор без текста');Object.keys(f).forEach(z=>{if(!FX.includes(z))bad.push(c.id+': fx.'+z);});
        Object.keys(f.b||{}).forEach(z=>{if(!BK.includes(z))bad.push(c.id+': b.'+z);});Object.keys(f.seg||{}).forEach(z=>{if(!SK.includes(z))bad.push(c.id+': seg.'+z);});
        if(!sagaFxText(f,G))bad.push(c.id+': у выбора «'+x.t+'» нет последствий');});
      (sc||[]).forEach(x=>{[].concat(x.img&&typeof x.img==='object'?Object.values(x.img):x.img||[]).forEach(k=>{if(!T.has(k))bad.push(c.id+': фото «'+k+'» не в списке');});const t=x.say||x.line||'';if(/\\{(co|y|city|name)\\}/.test(t))bad.push(c.id+': подстановка в голосе');});}));
    ok(!bad.length,k+': '+L.length+' глав — сцены, вопрос, выборы с последствиями, фото в списке, без подстановок'+(bad.length?' — '+bad.slice(0,6).join('; '):''));};
  ['frese','ryabush','meller'].forEach(k=>check(k,SAGA[k]));
  const seen=new Set(),dup=[];Object.values(SAGA).forEach(L=>L.forEach(c=>{if(seen.has(c.id))dup.push(c.id);seen.add(c.id);}));ok(!dup.length,'имена глав не повторяются'+(dup.length?': '+dup.join(', '):''));
  newGame('custom','ru','Своя','normal');quiet();G.y=1922;G.soviet={t:mi(G)};ok(sagaChapter(G,SAGA.custom.find(c=>c.id==='custom6'),false).t==='Красный директор','свой персонаж, остался: глава о кризисе — «Красный директор»');
  G.soviet=null;G.emig={from:'ru',to:'fr'};ok(sagaChapter(G,SAGA.custom.find(c=>c.id==='custom7'),false).t==='Чёрный четверг на чужбине','уехал: 1929 год — «Чёрный четверг на чужбине»');
  newGame('custom','fr','Своя','normal');quiet();G.y=1929;ok(sagaChapter(G,SAGA.custom.find(c=>c.id==='custom7'),false).t==='Чёрный четверг','во Франции глава прежняя');}
// ---------- 4) три пути в 1917 году ----------
function play(mk,yEnd,path){mk();quiet();let n=0;while(G.y<yEnd&&!G.over&&n++<700){let g=0;while(G.pending.length&&g++<50){const ev=G.pending[0],K=(ev.choices||[]).map(x=>x[1]);
    const r=K.includes('ru:emig')?'ru:'+path:K.find(k=>/^ru:to:/.test(k))?'ru:to:fr':K.includes('saga')?'saga':K.includes('tskip')?'tskip':K.find(x=>!/^reel:/.test(x))||'ok';resolve(r);}
  if(G.over)break;G.cash=Math.max(G.cash,2e5*cpi(G));step();}}
{play(()=>newGame('frese','ru','Фрезе и Ко','normal'),1921,'emig');
  ok(G.emig&&G.country==='fr'&&!dealerCount(G,'ru')&&!G.over,'уехали: «'+G.company+'» во Франции ('+cityOf(G)+'), дилеров в России нет, касса '+money(G.cash));
  const S=(G.saga&&G.saga.seen)||[];ok(S.includes('frese7')&&sagaChapter(G,SAGA.frese.find(c=>c.id==='frese7'),false).t==='На чужбине','фильм Фрезе: глава «На чужбине» ('+S.length+' глав просмотрено)');}
{play(()=>newGame('ryabush','ru','АМО','normal'),1923,'stay');
  ok(G.soviet&&G.soviet.nep&&G.country==='ru'&&!G.over,'остались: трест на хозрасчёте, «'+G.company+'», город — '+cityOf(G));
  ok(warCut(G,'fr')&&tradeRule('fr','ru',1923).ban,'за границу трест не торгует: '+tradeRule('fr','ru',1923).why);
  const L=G.log.filter(l=>/План 1922|План 1923|главк заказал|Главк ждёт/.test(l.text)).map(l=>l.text);ok(L.length>=1,'план главка: '+(L[0]||'нет'));
  const S=(G.saga&&G.saga.seen)||[];ok(S.includes('ryab6'),'глава «Костлявая рука» (август 1917) просмотрена');}
{play(()=>newGame('custom','ru','Своя','normal'),1919,'sell');ok(G.over&&G.soldTo&&G.soldTo.price>0,'продали: '+money(G.soldTo&&G.soldTo.price)+', игра окончена (можно купить марку за границей)');}
{play(()=>newMotoGame('meller','ru','Дукс','normal','Д1'),1930,'stay');const S=(G.saga&&G.saga.seen)||[];
  ok((!G.over||G.y>=1930)&&G.soviet&&S.includes('mel7')&&sagaChapter(G,SAGA.meller.find(c=>c.id==='mel7'),false).t==='Великий перелом','Меллер остался: «Дукс» — трест, 1929 год — «Великий перелом»; глав '+S.length+'; '+(G.log.filter(l=>/главк заказал/.test(l.text)).map(l=>l.text).pop()||'плана нет'));}
// ---------- 5) советский трест: ни выставок, ни сделок за границей ----------
{newGame('custom','ru','Своя','normal');quiet();G.y=1925;G.m=8;G.soviet={t:mi(G),nep:1};
  ok(!SHOWS.filter(sh=>sh.y===1925).some(sh=>showRelevant(sh,G)),'выставки 1925 года тресту не шлют приглашений');
  ok(dealBlock(G,'fr',0)==='нельзя','купить иностранную марку тресту нельзя');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
