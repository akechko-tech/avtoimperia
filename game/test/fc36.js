// 0.36: прогноз продаж по цене совпадает с продажами месяца — у машин и у мотоциклов (отзыв: «при работе с ценой модели неверно
// прогнозирует продажи» — мотоциклы упирались в места у дилеров для машин). node game/test/fc36.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const quiet=()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];};
const rnd=seed=>{let a=seed;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
function trial(label,setup,pick,ks){const res=[];
  for(const k of ks){rnd(4242);setup();quiet();G.pending=[];step();quiet();   // месяц разгона: план выпуска знает спрос (как у модели, что давно в продаже)
    const md=pick();md.price=Math.round(md.price0*k/10)*10;md.plan='auto';
    const f=brandFc(md,G,md.price);const was=JSON.stringify(G.models.map(m=>m.totalSold));
    // месяц без событий: газеты и вызовы не мешают
    G.pending=[];rnd(777);step();quiet();const got=md.lastSold||0;
    res.push({k,p:md.price,fc:f.d,got,lim:f.lim,want:f.want});}
  const line=res.map(r=>'×'+r.k+' $'+r.p+': прогноз '+r.fc.toFixed(1)+(r.lim?' ('+r.lim+')':'')+' — продано '+r.got).join('; ');
  const bad=res.filter(r=>Math.abs(r.got-r.fc)>Math.max(2,0.25*Math.max(r.fc,r.got)));
  ok(!bad.length,label+': '+line);return res;}
// 1) своя мастерская 1912 года: машина и мотоцикл, дилеры во Франции
function shop(){newMotoGame('custom','fr','Мото','normal','М1');G.y=1912;G.m=4;G.cash=5e5;G.lines.car=1;G.cap=60;G.workers=120;G.rep=55;
  G.dealers.fr=25;const m=G.models[0];m.status='prod';m.price0=m.price=Math.round(refPrice(m,G)/10)*10;m.stock=0;
  const car={...G.models[0],id:G.nextId++,name:'Машина',e:'e9',g:'g5',c:'c4',k:'k2',b:'b3',t:'t1',w:'w6',status:'prod',stock:0,totalSold:0,made:0,lastSold:0};car.price0=car.price=Math.round(refPrice(car,G)/10)*10;G.models.push(car);}
trial('мотоцикл, рядом машина',shop,()=>G.models.find(isMoto),[0.85,1,1.2]);
trial('машина, рядом мотоцикл',shop,()=>G.models.find(m=>!isMoto(m)),[0.85,1,1.2]);
// 2) мало дилеров: прогноз упирается в сеть и честно говорит об этом
function few(){shop();G.dealers.fr=3;}
const r=trial('три дилера — мотоцикл',few,()=>G.models.find(isMoto),[0.8,1]);
// 3) автомобильная фирма 1925 года без мотоциклов
function cars(){newGame('custom','de','Т','normal');G.y=1925;G.m=3;G.cash=2e6;G.cap=400;G.workers=900;G.rep=60;G.dealers.de=80;const m=G.models[0];
  m.e='e9';m.g='g6';m.c='c4';m.k='k5';m.b='b3';m.w='w7';m.t='t0';m.status='prod';m.price0=m.price=Math.round(refPrice(m,G)/10)*10;m.stock=0;}
trial('машина 1925 года',cars,()=>G.models[0],[0.8,1,1.25]);
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
