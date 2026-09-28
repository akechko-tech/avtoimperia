const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame('custom','fr','T','normal');
const rc=RACES.find(r=>r.key==='pbp-1895');G.y=rc.y;G.m=rc.m;G.cash=1e7;G.rdept=1;
const origFail=carFailure;carFailure=function(c){if(c.you)return;return origFail(c);};
let dumped=false;const origTick=raceTick;
raceTick=function(dt){origTick(dt);if(!R||dumped)return;const c=R.cars.find(x=>x.name==='De Dion-Bouton');if(c&&R.time>36){dumped=true;const T=R.trk;
  console.log('car',c.x.toFixed(1),c.z.toFixed(1),'idx',c.idx,'thr',c.thr,'brk',c.brk,'shift',c.shift,'gear',c.gear,'follow',c.follow&&c.follow.name,'laneT',c.laneT,'stopT',c.stopT,'pitT',c.pitT,'punct',c.punct,'fuel',c.fuel,'P',c.P,'dmg',c.dmg,'overheat',c.overheat,'heat',c.heat);
  T.col.forEach(o=>{const d=Math.hypot(o.x-c.x,o.z-c.z);if(d<10)console.log('col',o.kind,o.r,'d',d.toFixed(1));});
  R.cars.forEach(o=>{if(o!==c){const d=Math.hypot(o.x-c.x,o.z-c.z);if(d<15)console.log('car near',o.name,'d',d.toFixed(1),'dnf',o.dnf,'parked',o.parked,'lat',o.lat.toFixed(1),'prog',o.prog.toFixed(0));}});
  console.log('bar',JSON.stringify(T.bar[c.idx]),'W',T.W,'lat',c.lat);
  const vx0=c.vx;for(let i=0;i<5;i++){carStep(c,T,1/60);console.log('step',i,'vx',c.vx,'vy',c.vy,'x',c.x.toFixed(2),'z',c.z.toFixed(2),'thr',c.thr,'brk',c.brk,'grip',c.grip,'crr',c.crr,'m',c.m,'gr',c.gr.map(g=>g.toFixed(1)).join('/'),'shift',c.shift.toFixed(2));}
  }};
raceResults=function(){};
startRace({rc,mode:'sim',entries:[{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}]});
`);
