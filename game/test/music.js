// 0.24: вся музыка игры — записи оркестра; «оркестриона» (синтезатора) в плейлисте нет. Свои пьесы игры вшиты в игру
// и играют без сети; три чужие записи подряд не загрузились — играют свои; не загрузилось ничего — тишина, а не «пиканье».
// node game/test/music.js
require('./harness.js')(`
global.location={protocol:'https:'};let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
AU.on.music=true;AU.paused=false;AU.on.mode='era';
// чужие записи (фонотека из сети): по 2 на эпоху
ORCH.idx={rec_march:{cap:'Марш (запись)',st:'march',y:1900,mood:'triumph'},rec_rag:{cap:'Регтайм (запись)',st:'rag',y:1905,mood:'lively'},rec_jazz:{cap:'Джаз (запись)',st:'jazz',y:1921,mood:'lively'},rec_fox:{cap:'Фокстрот (запись)',st:'fox',y:1916,mood:'calm'}};
newGame('custom','us','T','normal');
for(const y of [1896,1905,1914,1918,1925]){G.y=y;AU.sig='';AU.pl=[];AU.badSrc={};AU.remoteOff=0;AU.noMusic=0;musBuild(true);
  const L=AU.pl,own=L.filter(t=>t.own).map(t=>t.id);
  ok(L.length>0&&!L.some(t=>t.synth),y+': в плейлисте '+L.length+' записей, синтезатора нет; свои: '+own.join(', '));
  ok(L[0].id==='own_avto','первой звучит «Автоимперия» (оркестр)');}
// новые свои пьесы 0.24 — в своё время
G.y=1918;AU.sig='';musBuild(true);const ids=AU.pl.map(t=>t.id);
ok(['own_jazz','own_fox','own_cake'].every(k=>ids.includes(k)),'1918: «Гаражный джаз», «Фокстрот на набережной», «Кекуок клаксонов» — в плейлисте');
G.y=1925;AU.sig='';musBuild(true);ok(AU.pl.some(t=>t.id==='own_charl'),'1925: чарльстон «Полный газ» — в плейлисте');
ok(Object.keys(OWN_MUSIC).every(k=>/оркестр|бэнд/.test(OWN_MUSIC[k].cap+OWN_MUSIC[k].by)),'все свои пьесы — в оркестровке ('+Object.keys(OWN_MUSIC).length+')');
// сеть подводит: три чужие записи подряд не загрузились — играют только свои
G.y=1918;AU.sig='';AU.badSrc={};AU.remoteErr=0;musBuild(true);let k=0;
AU.pl=AU.pl.filter(t=>!t.own).concat(AU.pl.filter(t=>t.own));AU.idx=0;
for(let i=0;i<3;i++){AU.nowPlaying=AU.pl[AU.idx];musErr();k++;}
ok(AU.pl.length>0&&AU.pl.every(t=>t.own)&&!remoteOk(),'три чужие записи не загрузились — играют свои ('+AU.pl.length+'), чужие отложены на 10 минут');
AU.sig='';musBuild(false);ok(AU.pl.every(t=>t.own),'пока сеть подводит, чужих записей в плейлисте нет');
// не загрузилось вообще ничего — тишина
for(let i=0;i<20&&AU.pl.length;i++){AU.nowPlaying=AU.pl[AU.idx];musErr();}
ok(AU.pl.length===0&&AU.noMusic&&!AU.pl.some(t=>t.synth),'ни одна запись не загрузилась — тишина, синтезатор не включается');
// семплов нет — инструменты молчат, а не пищат генератором
{let osc=0;const c0=AU.ctx;AU.ctx={currentTime:0,createOscillator(){osc++;return {connect(){},start(){},stop(){},frequency:{value:0}};},createGain(){return {connect(){},gain:{setValueAtTime(){},setTargetAtTime(){},value:0}};}};
  INS.idx=null;inst('cornet',72,0,0.5,0.5);inst('bass',40,0,0.5,0.5);AU.ctx=c0;ok(osc===0,'без семплов инструмент молчит (генераторов: '+osc+')');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
