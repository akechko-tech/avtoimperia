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
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
