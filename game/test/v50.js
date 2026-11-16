// 0.50: одна мелодия за раз (гимн/фанфары/тема — один канал, граммофон на паузе и возвращается после); боксы на линии — по делу,
// а не «медленно проехал»; надпись на щите читается с лица. node game/test/v50.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
/* ---------- звук: поддельный проигрыватель с событиями ---------- */
let ALL=[];Audio=function(src){const L={};const a={src:src||'',paused:true,ended:false,volume:1,currentTime:0,duration:20,preload:'',loop:false,
  addEventListener(e,f){(L[e]=L[e]||[]).push(f);},fire(e){(L[e]||[]).forEach(f=>f());},getAttribute(k){return k==='src'?a.src:null;},
  play(){a.paused=false;a.ended=false;return {then(f){f();return this;},catch(){return this;}};},pause(){if(a.paused)return;a.paused=true;a.fire('pause');},finish(){a.paused=true;a.ended=true;a.fire('pause');a.fire('ended');}};ALL.push(a);return a;};
setTimeout=(f,ms)=>{if((ms||0)<1000)try{f();}catch(e){console.log('timer',e);}return 0;};/* короткие отсрочки — сразу; долгие (предел длины, страховка) — никогда */clearTimeout=()=>{};setInterval=()=>0;
const playing=()=>ALL.filter(a=>!a.paused&&a!==AU.el&&a!==AU.reelEl);
seed(4);newGame('renault','fr','','normal','');AU.on.music=true;AU.paused=false;AU.pl=[{title:'Марш',src:'music/own_avto.m4a',own:1},{title:'Вальс',src:'music/own_valse.m4a',own:1}];AU.idx=0;AU.sig='x';
musicPlay(true);const el=AU.el;ok(el&&!el.paused&&el.src==='music/own_avto.m4a','граммофон играет «Марш»');
el.currentTime=37;
auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);const hymn=CUE.own_hymn_fr;
ok(hymn&&!hymn.paused&&el.paused,'гимн церемонии: граммофон на паузе целиком (раньше — приглушён и звучал под гимном)');
auCue('win',0.8,null);ok(!CUE.win||CUE.win.paused,'победная тема пари поверх гимна не звучит');
auCueSrc('fan_test','music/fan_test.m4a',0.85,()=>{ok(false,'запасная мелодия не должна звучать');},9);ok((!CUE.fan_test||CUE.fan_test.paused)&&playing().length===1,'фанфары поверх гимна — тоже: звучит одна мелодия');
musicPlay();ok(el.paused&&AU.cue&&AU.cue.want===1,'игра просит музыку (кончилась гонка, сменился экран) — граммофон ждёт конца гимна');
hymn.finish();ok(!AU.cue&&!el.paused&&el.src==='music/own_avto.m4a'&&el.currentTime===37,'гимн доиграл — граммофон продолжил «Марш» с того же места');
// фанфары, затем гимн: важная сменяет
auCueSrc('fan_test','music/fan_test.m4a',0.85,null,9);const fan=CUE.fan_test;ok(!fan.paused&&el.paused,'фанфары праздника: граммофон на паузе');
auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);ok(fan.paused&&!hymn.paused&&playing().length===1&&el.paused,'следом гимн — фанфары смолкли, звучит гимн, граммофон молчит');
hymn.finish();ok(!el.paused,'после гимна музыка игры вернулась');
// выигранный матч: фанфары праздника (сразу) и тема пари (через 0,1 с) — одна мелодия
auCueSrc('fan_test','music/fan_test.m4a',0.85,null,8);auCue('win',0.8,null);ok(playing().length===1&&!fan.paused,'выигранный матч: фанфары и тема пари вместе не звучат — только фанфары');fan.finish();
// музыка в гонке выключена: гимн начался при молчащем граммофоне, гонка кончилась — музыка не лезет поверх гимна
{const R0=R;R={};AU.on.race=false;musicPlay();ok(el.paused,'в гонке граммофон выключен');auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);R=R0;musicPlay();
  ok(el.paused&&!hymn.paused,'гонка кончилась при звучащем гимне — музыка игры не включается поверх него (это и была «каша»)');hymn.finish();ok(!el.paused,'гимн кончился — музыка игры пошла');AU.on.race=true;}
// игрок сам листает — мелодия уступает
auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);musNext(1,1);ok(hymn.paused&&!el.paused&&el.src==='music/own_valse.m4a'&&!AU.cue,'«следующая» во время гимна: гимн смолк, играет «Вальс»');
// фильм о герое и ролик: тишина
auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);AU.sagaHold=true;musicPlay();ok(hymn.paused&&el.paused,'начался фильм о герое — гимн и граммофон молчат');AU.sagaHold=false;musicPlay();ok(!el.paused,'фильм кончился — музыка идёт');
// музыку выключили — молчит и мелодия по поводу
auCueSrc('own_hymn_fr','music/own_hymn_fr.m4a',0.85,null,22,3);AU.on.music=false;musicPlay();ok(hymn.paused&&el.paused&&!AU.cue,'музыку выключили во время гимна — тишина');AU.on.music=true;
/* ---------- боксы на линии ---------- */
{const T={raceLen:3750,cfg:{laps:3,pits:true}};const car=o=>Object.assign({player:true,pitCall:false,wantPit:false,lap:1,prog:1250,vx:5,vtop:6.5,fuel:80,fuelRate:0.004,tyre:12,dmg:0,punct:false,limp:false},o);
  ok(!pitAtLine(car({}),T),'машина 1896 года (23 км/ч) на линии, бензина до финиша хватает — в боксы не зовут (раньше: медленнее 54 км/ч — стоп на каждом круге)');
  ok(!pitAtLine(car({player:false}),T),'соперник на такой же машине — тоже едет дальше');
  ok(!pitAtLine(car({fuel:14,vx:5}),T)&&pitAtLine(car({fuel:14,vx:2.4}),T),'бензина до финиша не хватит: сбросили ход у линии — боксы; на полном ходу — мимо (долить можно «Сервисом»)');
  ok(pitAtLine(car({punct:true,vx:2}),T)&&pitAtLine(car({tyre:70,vx:2}),T)&&pitAtLine(car({dmg:55,vx:2}),T),'прокол, стёртые шины, побитый кузов — тоже повод, если сбросили ход');
  ok(pitAtLine(car({player:false,wantPit:true,vx:11}),T)&&pitAtLine(car({pitCall:true}),T),'соперник заезжает, когда решил сам; ваша команда — по приказу');
  ok(!pitAtLine(car({vtop:45,vx:16,fuel:5}),T)&&pitAtLine(car({vtop:45,vx:14,fuel:5}),T),'быстрая машина: «сбросил ход» — ниже 54 км/ч, как раньше');
  ok(!pitAtLine(car({lap:3,prog:3750,punct:true,vx:1}),T)&&!pitAtLine(car({lap:0,punct:true,vx:1}),T),'на старте и на финише в боксы не заезжают');}
// целая гонка: овал 1896 года, три круга — никто не стоит в боксах без нужды
{seed(7);newGame('custom','us','Проба','normal','Модель 1');const s=G,base=RACES.find(r=>trackCfg(r).oval);const rc={...base,y:1896,m:5,key:'t-oval-1896'};s.y=1896;s.m=5;s.cash=1e6;
  {const a=aiCarMd(1896);['e','g','c','k','w'].forEach(k=>s.models[0][k]=a[k]);}
  let stops=0,idle=0;const was=new Map(),o=carStep;carStep=function(c,trk,h){const on=c.pitT>0;if(on&&!was.get(c)){stops++;const rem=Math.max(0,trk.raceLen-c.prog);
      if(!(c.wantPit||c.pitCall||c.punct||c.tyre>60||c.dmg>40||c.limp||(c.fuelRate&&c.fuel<rem*c.fuelRate*1.06+5)))idle++;}was.set(c,on);return o(c,trk,h);};const oF=carFailure;carFailure=function(c){};
  let res=null;const oR=raceResults;raceResults=function(r,rs,mode,inf){res=rs;};
  startRace({rc,mode:'sim',entries:[{drv:'me',md:s.models[0],prep:2,tyre:'soft',gear:0}]});carStep=o;carFailure=oF;raceResults=oR;
  const cfg=trackCfg(rc),nc=res?res.length:0;
  ok(cfg.pits&&cfg.laps>=3&&nc>=2,'овал '+rc.name+' в 1896 году: '+cfg.laps+' круга, боксы есть, машин '+nc);
  ok(idle===0&&stops<nc*(cfg.laps-1),'за всю гонку без нужды в боксах не стоял никто; остановок '+stops+' (все — за шинами или бензином; раньше — '+nc*(cfg.laps-1)+': каждый на каждом круге)');}
/* ---------- надписи: с лица — не зеркально ---------- */
{const s={u0:0.1,u1:0.4,v0:0.2,v1:0.3};
  // зритель стоит перед щитом (смотрит против нормали n), камера: вправо = вверх × вперёд
  const right=n=>[-n[2],n[0]];const reads=(p0,p1,n)=>{const uv=signUV(s,p0,p1,n),r=right(n),d=(p1[0]-p0[0])*r[0]+(p1[2]-p0[2])*r[1];return (uv[1][0]-uv[0][0])*d>0;};
  ok(reads([0.1,2.35,3.9],[0.1,2.35,-3.9],[1,0,0]),'щит объявления (углы шли справа налево — текст был зеркальным): теперь слева направо');
  {const uv=signUV(s,[0.1,2.35,3.9],[0.1,2.35,-3.9],[1,0,0]);ok(uv[0][0]===s.u1&&uv[1][0]===s.u0&&uv[0][1]===s.v1&&uv[2][1]===s.v0,'у такого щита текстура перевёрнута по горизонтали, верх и низ — на месте');}
  {const t=[0.6,0.8],nn=[-t[1],t[0]],P=(sd)=>[nn[0]*sd*6,5,nn[1]*sd*6];const uv=signUV(s,P(1),P(-1),[-t[0],0,-t[1]]);ok(uv[0][0]===s.u0&&uv[1][0]===s.u1,'растяжка «Финиш» была верной — не тронута');}
  let all=true;seed(9);for(let k=0;k<400;k++){const a=Math.random()*6.283,n=[Math.sin(a),0,Math.cos(a)],r=right(n),w=1+Math.random()*4,sg=Math.random()<0.5?1:-1,c=[Math.random()*50,2,Math.random()*50];
    if(!reads([c[0]-r[0]*w*sg,c[1],c[2]-r[1]*w*sg],[c[0]+r[0]*w*sg,c[1],c[2]+r[1]*w*sg],n))all=false;}
  ok(all,'любой щит, как бы ни были заданы его углы и куда бы он ни смотрел, читается с лица слева направо (400 случайных)');}
console.log(bad?('ОШИБОК: '+bad):'всё в порядке');
}`);
