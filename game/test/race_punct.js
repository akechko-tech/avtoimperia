// Когда случаются проколы и как греется мотор: ранние гонки, машиной игрока правит ИИ
require('./harness.js')(`
Math.random=(()=>{let a=3;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
const keys=RACES.filter(r=>r.y<=1912).slice(0,14).map(r=>r.key);
for(const key of keys){const rc=RACES.find(r=>r.key===key);G.pending=[];G.y=rc.y;G.m=rc.m;const md=G.models[0];md.e=lastOf(ENGINES,rc.y).id;md.c=lastOf(CHASSIS,rc.y).id;md.w=lastOf(TYRES,rc.y).id;md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;if(overpower(md))md.e=ENGINES.filter(e=>e.y<=rc.y&&e.hp<=byId(CHASSIS,md.c).max).pop().id;
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const me=R.me;me.player=false;R.t=0;
  const first={};let heatMax=0,heatAvg=0,n=0;const dt=1/60;let f=0;
  const RL=R.trk.raceLen,cars=R.cars,trkLen=Math.round(R.trk.raceLen);let tEnd=0;
  while(R&&!R.done&&f<60*400){f++;R.time+=dt;R.t+=dt;tEnd=R.time;raceTick(dt);if(!R)break;R.cars.forEach(c=>{if(c.punct&&first[c.num]===undefined)first[c.num]={t:R.t,prog:c.prog/RL,tyre:Math.round(c.tyre),off:c.off,worn:c.tyre>=100};});heatMax=Math.max(heatMax,me.heat);heatAvg+=me.heat;n++;}
  const fr=Object.values(first);const early=fr.filter(x=>x.prog<0.1).length;
  console.log(rc.y,rc.name.slice(0,28).padEnd(28),'km',rc.km,'len',trkLen,'dur',Math.round(tEnd)+'s','cars',cars.length,'punct',fr.length,'в первые 10%:',early,'me:',first[me.num]?JSON.stringify(first[me.num]):'—','heat max',Math.round(heatMax),'avg',Math.round(heatAvg/n),'tyre at end',Math.round(me.tyre));
  if(R)finishRace(true);closeSheet();closePaper();G.pending=[];}
`);
