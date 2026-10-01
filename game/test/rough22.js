// 0.22: разбитая дорога — ямы, колея, «гребёнка»: сколько ям, сколько ударов, проколов, потерь времени (ИИ за рулём машины игрока)
require('./harness.js')(`
SCN_OFF=true;
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
const PK=[...RACES.filter(r=>r.y<=1912).slice(0,6),...RACES.filter(r=>r.y>1919).slice(0,4)];
for(const rough of [true,false])for(const rc of PK){let seed=7;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  G.pending=[];G.y=rc.y;G.m=rc.m;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const me=R.me;me.player=false;R.t=0;if(!rough)R.trk.rg=null;
  const G2=R.trk.rg,RR=R,TR=R.trk;const dt=1/60;let f=0;while(R&&!R.done&&f<60*400){f++;R.time+=dt;R.t+=dt;raceTick(dt);}
  const cars=RR.cars,hits=cars.reduce((a,c)=>a+(c.potN||0),0);
  console.log(rough?'ROUGH':'flat ',rc.y,rc.name.slice(0,26).padEnd(26),'terr',TR.cfg.terr.padEnd(8),'len',Math.round(TR.raceLen),'pots',G2?G2.pots.length:0,'hits',hits,'me',me.potN||0,'punct',cars.filter(c=>c.punctN).length,
    'dmg',Math.round(me.dmg),'t',me.fin!==null&&me.fin!==undefined?Math.round(me.fin):'-','dnf',cars.filter(c=>c.dnf).length);
  if(R)finishRace(true);closeSheet();closePaper();G.pending=[];}
`);
