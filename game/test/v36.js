// 0.36: проверки по отзыву — гоночная команда и КБ, флаги и города эпохи, голос фильма по частям, море в гонке, торговля Советов.
// node game/test/v36.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const quiet=()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];};
// ---------- 1) гоночная команда помогает КБ и доводит модели — но не заменяет КБ ----------
{const R=[];for(const lv of [0,1,3,6]){newGame('custom','fr','T','normal');quiet();G.y=1910;G.m=0;G.rdept=lv;G.cash=1e6;G.rd.lvl=3;const md=G.models[0];md.e='e4';
    G.rd.projs=[{kind:'part',id:'e4',name:'Мотор',need:40,prog:0},{kind:'part',id:'g6',name:'Коробка',need:40,prog:0}];const per=rdPtsOf(G,G.rd.projs[0]);
    for(let m=3;m<=10;m++){G.m=m;raceTeamLearn(G,{name:'Гонка',km:400},[{you:1,md,stops:[],dnf:null}]);}
    R.push({lv,own:G.rd.projs[0].prog/per,oth:G.rd.projs[1].prog/per,rr:md.rr||0,rp:md.rp||0,k:G.rd.raceK||0});}
  const t=R.map(r=>'отдел '+r.lv+': КБ +'+Math.round(r.k*100)+'%, проекты +'+r.own.toFixed(1)+'/'+r.oth.toFixed(1)+' мес., поломок −'+Math.round(r.rr*100)+'%, мощность +'+(r.rp*100).toFixed(1)+'%').join('; ');
  ok(R[0].own===0&&R[0].rr===0,'без гоночного отдела гонка КБ не помогает');
  ok(R.slice(1).every(r=>r.own>=1&&r.own<=3.5&&r.oth<=1&&r.rr>=0.08&&r.rr<=RR_MAX&&r.rp<=RP_MAX),'сезон из 8 гонок по 400 км — '+t);
  ok(R[3].own>R[1].own&&R[3].rr>R[1].rr,'чем выше уровень отдела, тем больше пользы');
  newGame('custom','fr','T','normal');quiet();G.y=1912;const md=G.models[0];md.rr=0.15;const a=carStats(md,0,G.y).rel;md.rr=0;const b=carStats(md,0,G.y).rel;
  ok(a>b,'доводка видна в надёжности модели: '+b.toFixed(3)+' → '+a.toFixed(3));}
// ---------- 2) флаги и города по эпохе ----------
{newGame('custom','de','T','normal');quiet();G.y=1918;const a=flagKey(G);G.y=1919;ok(a==='de1'&&flagKey(G)==='de2','Германия: имперский флаг до 1919 года, потом веймарский');
  newGame('frese','ru','Фрезе и Ко','normal');quiet();G.y=1917;const r1=flagKey(G);G.y=1918;ok(r1==='ru1'&&flagKey(G)==='ru2','Россия: трёхцветный до 1918 года, потом красный');
  G.y=1914;G.m=7;const c1=cityOf(G);G.m=8;ok(c1==='Петербург'&&cityOf(G)==='Петроград','Петербург становится Петроградом осенью 1914 года');
  newGame('custom','us','T','normal');quiet();ok(cityOf(G)==='Детройт','у остальных — столица отрасли страны: '+cityOf(G));}
// ---------- 3) фильм: рассказчик — мужской голос, строки с подстановками — по частям ----------
{ok(SAGA_NARR==='aidar','рассказчик фильма — диктор aidar, а не рассказчица baya');
  const VL=JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(),'tools/media/voice_lines.json'),'utf8')),H=new Set(VL.map(e=>e.h));
  newGame('custom','fr','Моя марка','normal');quiet();G.y=1903;G.hero='Иван';
  let n=0,bad=[];const chk=(t,v)=>{if(!/[{}]/.test(t))return;n++;const P=sagaVoiceParts(t,G);if(!P){bad.push('нет частей: '+t.slice(0,50));return;}P.forEach(p=>{if(/[{}]/.test(p)||!H.has(voiceHash(p,v)))bad.push('нет записи: '+p.slice(0,60));});};
  Object.values(SAGA).forEach(L=>L.forEach(ch=>[ch].concat(ch.v||[]).forEach(c=>{(c.sc||[]).forEach(sc=>chk(sc.who?sc.line:sc.say,sc.who?voiceOfWho(sc.who):SAGA_NARR));if(c.q)chk(c.q,SAGA_NARR);(c.o||[]).forEach(o=>chk(o.res,SAGA_NARR));})));
  ok(n>80&&!bad.length,'строк с подстановками: '+n+' — у всех есть записанные части'+(bad.length?' — '+bad.slice(0,4).join('; '):''));
  const P=sagaVoiceParts('{y} год. Первая машина «{co}» выезжает из ворот мастерской.',G);ok(P&&P[0]==='1903 год.'&&P[1]==='Первая машина выезжает из ворот мастерской.','«1903 год.» — своей записью, название фирмы опущено: '+JSON.stringify(P));
  const Q=sagaVoiceParts('Как «{co}» встретить «Тур»?',G);ok(Q&&Q[0]==='Как фирме встретить «Тур»?','в вопросе — «фирме»: '+JSON.stringify(Q));
  ok(['dedion2'].every(id=>{const ch=SAGA.dedion.find(c=>c.id===id);return ch.sc.some(x=>x.img==='x:saga-lauto-1900');}),'де Дион, «Трость на ипподроме»: на экране — сама газета «Л’Ото-Вело»');
  const war=SAGA.custom.find(c=>c.id==='custom5').sc[0].img;G.country='de';const w1=sagaImg(war);G.country='uk';const w2=sagaImg(war);ok(typeof war==='object'&&war.de!==war.uk,'война в фильме — своя для страны: Германия «'+war.de+'», Британия «'+war.uk+'»');}
// ---------- 4) море в гонке: прибой — источник-линия ----------
{const E={sea:[{P:[[0,0],[0,500],[0,1000]],x:0,z:500,rad:500}],beach:true};AMB.lis={x:30,z:500,fx:0,fz:1,rx:1,rz:0,N:50,occ:0};const a=ambSea(E);AMB.lis.x=300;const b=ambSea(E);
  const La=AMB_L.surfBeach-10*Math.log10(30),Lb=AMB_L.surfBeach-10*Math.log10(300);ok(a.g>b.g&&Math.abs((La-Lb)-10)<0.01,'берег — линия: в 10 раз дальше — тише на 10 дБ (а не на 20, как точка); громкость '+a.g.toFixed(2)+' → '+b.g.toFixed(2));}
// ---------- 5) Советская Россия не торгует машинами за границей; трест получает план ----------
{ok(tradeRule('fr','ru',1919).ban&&tradeRule('uk','ru',1925).ban&&!tradeRule('fr','ru',1913).ban,'вывоз из России: до революции можно, с 1918 года — нет');
  ok(!tradeRule('ru','fr',1913).ban&&tradeRule('ru','fr',1919).ban&&tradeRule('ru','fr',1924).quota===300,'ввоз в Россию: пошлина 35% до революции, блокада, потом квота Внешторга');
  newGame('custom','ru','Трест','normal');quiet();G.y=1922;G.m=0;G.soviet={t:mi(G),nep:1};const tr={...G.models[0],id:G.nextId++,name:'Грузовик',b:'b7',e:'e9',g:'g5',c:'c4',k:'k2',w:'w6',status:'prod'};G.models.push(tr);
  ruCheck(G);const o=(G.orders||[]).find(x=>/план 1922/i.test(x.who));ok(o&&o.md===tr.id&&o.price>unitCost(tr,G),'январь 1922 года: главк заказал грузовики — '+(o?o.n+' шт. по '+money(o.price):'нет'));}
// ---------- 6) газета о пошлинах: о России — только тем, кто там торгует, и без пророчеств ----------
{const news=(c,dl,y0,y1)=>{newGame(c==='ru'?'frese':'custom',c,'T','normal');quiet();G.y=y0;G.m=0;dl.forEach(k=>{G.dealers[k]=5;});const out=[],pe=pushEvent;
    pushEvent=(e,x)=>{if(e.kicker==='Торговля')out.push({t:G.y+G.m/12,title:e.title});return pe(e,x);};
    try{while(G.y<y1){tradeNews(G);G.m++;if(G.m>11){G.m=0;G.y++;}}}finally{pushEvent=pe;}return out;};
  const a=news('us',[],1900,1930),b=news('us',['ru'],1900,1930),w=news('fr',[],1912,1916),r=news('ru',['fr'],1912,1925);
  ok(!a.some(n=>/^Россия/.test(n.title)),'США без дилеров в России — без русских новостей ('+a.length+' заметок о пошлинах за 30 лет)');
  const ban=b.find(n=>/Россия: ввоз машин закроют/.test(n.title)),op=b.find(n=>/Россия: ввоз машин откроют/.test(n.title));
  ok(ban&&ban.t>=1917.9&&op,'с дилерами в России: о закрытии ввоза — только после переворота ('+(ban?dstr({y:Math.floor(ban.t),m:Math.round(ban.t%1*12)}):'нет')+'), об открытии по квоте — '+(op?dstr({y:Math.floor(op.t),m:Math.round(op.t%1*12)}):'нет'));
  ok(!w.some(n=>/Германия: ввоз машин закроют/.test(n.title)),'войну газета весной 1914 года не предсказывает');
  ok(!r.some(n=>n.t>=1917.5),'русской фирме с лета 1917 года — без заметок о пошлинах каждой страны (было пять сразу)');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
