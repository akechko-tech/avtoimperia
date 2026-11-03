// 0.41: проверки модели в node — награды (приз у каждой серии гонок и каждого состязания в небе, рисунок, музыка церемонии,
// гимны по нотам), мировой итог и господство (16-world.js), живые соперники (17b-bots.js).
// node game/test/v41.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
/* ---------- награды ---------- */
{const s={country:'fr',company:'Тест'};let n=0,noA=0,kinds={},byW=0,bad=[];
  RACES.forEach(rc=>{const a=awardOf(rc,s);if(!a){bad.push(rc.key);return;}n++;if(!AWARDS[rc.id])noA++;kinds[a.kind]=(kinds[a.kind]||0)+1;if(a.byWiki)byW++;
    if(!a.music||!a.music.n)bad.push('music '+rc.key);const svg=awardSVG(a,{place:1});if(!/^<svg/.test(svg)||svg.length<300)bad.push('svg '+rc.key);
    [2,3].forEach(p=>{if(!awardSVG(a,{place:p}).includes('<circle'))bad.push('medal '+rc.key);});if(!awardCard(a,1).includes('Вручает'))bad.push('card '+rc.key);});
  ok(bad.length===0&&n===RACES.length,'приз есть у каждой из '+n+' гонок (видов: '+JSON.stringify(kinds)+'), без своего приза — только '+noA+' (приз клуба страны)'+(bad.length?' | '+bad.slice(0,3).join(', '):''));
  ok(byW>=n*0.5,'у большинства — портрет вручителя (статья Википедии): '+byW+' из '+n);
  let m=0,bad2=[];AIR_EV.forEach(ev=>{const a=airAwardOf(ev,s);if(!a||!a.music)bad2.push(ev.key);else if(a.cup==='Приз аэроклуба')m++;});
  ok(!bad2.length&&m===0,'приз есть у каждого из '+AIR_EV.length+' состязаний в небе, безымянных нет');
  const vb=awardOf(RACES.find(r=>r.id==='vanderbilt'),s),tg=awardOf(RACES.find(r=>r.id==='targa'),s),gb=awardOf(RACES.find(r=>r.id==='gb1904'),{country:'us'}),ind=awardOf(RACES.find(r=>r.id==='indy'),s);
  ok(vb.cup==='Кубок Вандербильта'&&/Вандербильт/.test(vb.by)&&vb.music.tune==='hymn_us','Кубок Вандербильта: вручает Вандербильт, гимн США своей мелодией');
  ok(tg.kind==='targa'&&/Флорио/.test(tg.by)&&/Аиды/.test(tg.music.n),'Тарга Флорио: золотая доска, Флорио, марш из «Аиды»');
  ok(gb.kind==='statue'&&gb.c==='us'&&/Беннетт/.test(gb.by),'Кубок Гордона Беннетта (Таунус 1904) у американца: статуэтка, музыка страны победителя — США');
  ok(ind.kind==='wreath'&&/Фишер/.test(ind.by),'Индианаполис: венок, Карл Фишер');
  const de1=awardMusicOf('de',1907),de2=awardMusicOf('de',1926),ru1=awardMusicOf('ru',1913),ru2=awardMusicOf('ru',1917.5),ru3=awardMusicOf('ru',1925);
  ok(de1.tune==='hymn_uk'&&/Siegerkranz/.test(de1.n)&&!de2.tune&&/товарищи/.test(de2.n),'Германия: до 1919 — «Heil dir im Siegerkranz» (мелодия английского гимна), после — марш «Старые товарищи»');
  ok(ru1.rec[0]==='tsar_hymn'&&ru2.rec[0]==='free_russia_hymn'&&ru3.rec[0]==='slavianka','Россия: «Боже, Царя храни» → «Гимн свободной России» (1917) → «Прощание славянки»');
  const sch=airAwardOf(AIR_EV.find(e=>e.key==='schneider-1913'),s),ch=airAwardOf(AIR_EV.find(e=>e.key==='channel-1909'),s),ort=airAwardOf(AIR_EV.find(e=>e.key==='orteig-1927'),s);
  ok(sch.kind==='statue'&&/Шнейдер/.test(sch.by)&&/Нортклифф/.test(ch.by)&&/Ортейг/.test(ort.by)&&ort.music.tune==='hymn_us','небо: Кубок Шнейдера — статуэтка от Шнейдера; «Дейли Мейл» — Нортклифф; приз Ортейга — Ортейг, гимн США');
  // гимны: разметка по тактам, аккорды, не в плейлисте, один проход
  let tb=[];['hymn_uk','hymn_fr','hymn_us'].forEach(k=>{const T=TUNES[k],bars=T.mel.split('|').map(b=>b.trim().split(/\\s+/)),spb=T.div*T.beats;
    bars.forEach((b,i)=>{if(b.length!==spb)tb.push(k+' такт '+(i+1)+': '+b.length);b.forEach(t=>{if(t!=='-'&&t!=='.'&&!/^[A-G](#|b)?\\d$/.test(t))tb.push(k+' нота '+t);});});
    if(T.ch.trim().split(/\\s+/).length!==bars.length)tb.push(k+' аккордов '+T.ch.trim().split(/\\s+/).length+' на '+bars.length+' тактов');T.ch.trim().split(/\\s+/).forEach(chordOf);
    if(!T.cue||T.passes!==1||T.sty!=='hymn')tb.push(k+' cue/passes/sty');});
  ok(!tb.length,'гимны «God Save the King», «Марсельеза», «The Star-Spangled Banner» записаны по тактам, аккорд на такт, один проход, стиль hymn'+(tb.length?' | '+tb.slice(0,3).join('; '):''));
  ok(!musSynth().some(t=>t.tune&&TUNES[t.tune].cue)&&ARR.hymn&&ARR.hymn.mel==='trumpet','гимны не в плейлисте «Мелодия игры»; оркестровка hymn — духовые');
  // шаги гимна в node: tuneStep проходит всю мелодию и зовёт musEnd один раз
  AU.ctx={currentTime:0};let ended=0;const SY={synth:true,st:'tune',tune:'hymn_uk',cue:1};AU.synth=SY;AU.step=0;const _me=musEnd;
  try{let t=0,n=0;const len=TUNES.hymn_uk.mel.replace(/\\|/g,' ').trim().split(/\\s+/).length;while(n<len){t+=tuneStep(SY,t,false);AU.step++;n++;}
    // play=false — musEnd не зовётся; проверяем длину
    ok(Math.abs(t-len*60/TUNES.hymn_uk.bpm/TUNES.hymn_uk.div)<0.01,'«God Save the King»: '+len+' шагов по '+(60/TUNES.hymn_uk.bpm/TUNES.hymn_uk.div).toFixed(3)+' с — '+Math.round(len*60/TUNES.hymn_uk.bpm/TUNES.hymn_uk.div)+' с звучания');}finally{AU.synth=null;AU.ctx=null;}
}
/* ---------- живые соперники ---------- */
{BOTS_OFF=false;const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
  const run=(diff,years,off)=>{seed(11);newGame('custom','fr','Проба',diff,'Ласточка');G.helper={on:1};if(off)G.botsOff=1;const mk={};
    for(let k=0;k<years*12;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);if(G.m%3===0&&rdActive(G).length<rdSlots(G)){const pj=suggestProject(G);if(pj&&G.cash>rdCost(pj,G)*3)rdBegin(G,pj);}
      step();if(G.m===11){mk[G.y]={};for(const c in COUNTRIES)mk[G.y][c]=G.mY[c]||0;}if(G.over){G.over=false;G.cash=Math.max(G.cash,0);}}
    return {s:G,mk};};
  const A=run('normal',35,false),s=A.s,B=s.bots;
  ok(B&&Object.keys(B).length===12,'35 лет на «Норме»: двенадцать живых марок созданы');
  const alive=Object.values(B).filter(b=>!b.dead);ok(alive.length>=8&&alive.every(b=>(b.log||[]).length>0),'живых к 1930 году '+alive.length+', у каждой есть ходы в журнале');
  let badV=[];Object.values(B).forEach(b=>{if(!isFinite(b.cash)||!isFinite(b.r12||0))badV.push(b.n+' деньги');for(const g in b.pk)if(b.pk[g]<0.85-1e-9||b.pk[g]>1.12+1e-9)badV.push(b.n+' pk '+g);for(const g in b.q)if(b.q[g]>BOT_Q_MAX+1e-9)badV.push(b.n+' q');if(b.capK>BOT_CAP_MAX+1e-9)badV.push(b.n+' cap');});
  ok(!badV.length,'состояние ботов в границах: цены 0,85…1,12, привлекательность ≤ '+BOT_Q_MAX+', мощности ≤ '+BOT_CAP_MAX+(badV.length?' | '+badV.slice(0,3).join(', '):''));
  let mxSh=0,who='';Object.values(B).forEach(b=>{for(const g in (b.sh[b.c]||{})){if(b.sh[b.c][g]>mxSh){mxSh=b.sh[b.c][g];who=b.n+' '+g;}}});
  ok(mxSh<=0.95,'ни один бот не берёт больше 95 % класса дома (максимум '+Math.round(mxSh*100)+' % — '+who+')');
  ok((s.botNews||[]).length>=20&&(s.botNews||[]).length<=30&&(s.log||[]).filter(l=>l.kind==='hist').length>0,'газета получала заметки о ходах ботов (хранится '+(s.botNews||[]).length+' последних), журнал — строки');
  const nAcq=Object.keys(s.botAcq||{}).length,nF=Object.keys(s.botFirsts||{}).length;ok(nAcq<=24&&Object.values(B).every(b=>(b.acq||[]).length<=2)&&nF<=18,'сделки ботов — не больше двух на марку ('+nAcq+' всего), первенств у ботов '+nF+' (не чаще раза в два года)');
  const L=worldCo(s),bots=L.filter(o=>o.bot);ok(bots.length>=8&&bots.some(o=>o.n==='Ford'&&o.hp>1e7),'в мировом итоге боты помечены, Ford — больше 10 млн л. с.');
  const T=domTable(s);ok(!!T&&DOM_K.every(k=>T[k]&&isFinite(T[k].share)),'таблица господства считается с ботами'+(s.domLost?'; к 1930 году господствует '+s.domLost.n+' ('+s.domLost.k+')':''));
  // первенство, взятое ботом, игроку уже не достаётся
  {s.botFirsts['part:zz']={n:'Opel',y:s.y-1,hy:s.y+2};const n0=Object.keys(s.firsts||{}).length;recordFirst(s,'part:zz','проба',s.y+2,'кто-то');ok(Object.keys(s.firsts||{}).length===n0&&!s.firsts['part:zz'],'первенство, взятое ботом раньше, игроку не засчитывается');}
  // сохранение и загрузка
  {const raw=JSON.stringify(s);const s2=JSON.parse(raw);G=s2;let err=null;try{for(let k=0;k<3;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);step();}}catch(e){err=e;}ok(!err&&G.bots&&Object.keys(G.bots).length===12,'после сохранения и загрузки боты продолжают играть'+(err?' | '+err.message:''));}
  // без ботов — как раньше
  const C=run('normal',12,true);ok(!C.s.bots&&C.s.botsOff===1,'партия «по истории»: ботов нет');
  const mkA=A.mk[1906],mkC=C.mk[1906];let dev=0;for(const c in mkA)dev=Math.max(dev,Math.abs(mkA[c]-mkC[c])/Math.max(1,mkC[c]));ok(dev<=0.25,'размер рынков стран в 1906 году с ботами и без — в пределах ±25 % (максимум '+Math.round(dev*100)+' %)');
  // сложность: на «Историке» боты сильнее, чем на «Юном»
  const K=run('kids',22,false),H=run('hist',22,false);const fh=X=>{const o=worldCo(X.s).find(q=>q.n==='Ford');return o?o.hp/Math.max(1,X.s.world.hp):0;};
  ok(fh(H)>=fh(K)*0.98,'доля Ford в мировых л. с. к 1917 году: «Историк» '+Math.round(fh(H)*100)+' % ≥ «Юный» '+Math.round(fh(K)*100)+' %');
  ok((H.s.botNews||[]).length>=(K.s.botNews||[]).length*0.8,'на «Историке» боты делают не меньше ходов, чем на «Юном» ('+(H.s.botNews||[]).length+' против '+(K.s.botNews||[]).length+' заметок)');
  BOTS_OFF=true;}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
