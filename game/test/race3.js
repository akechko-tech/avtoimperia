// Разбор одной гонки: куда уходит время у каждой машины
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=+(${JSON.stringify(process.argv[4]||'5')});return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const key=${JSON.stringify(process.argv[2]||'gpacf-1906')},mode=${JSON.stringify(process.argv[3]||'sim')};
newGame('custom','fr','T','normal');
const rc=RACES.find(r=>r.key===key);G.y=rc.y;G.m=rc.m;G.cash=1e7;
G.models[0].e=lastOf(ENGINES,rc.y).id;G.models[0].c=lastOf(CHASSIS,rc.y).id;G.models[0].w=lastOf(TYRES,rc.y).id;G.rdept=1;
const acc=new Map();const origStep=carStep;
carStep=function(c,trk,h){let a=acc.get(c);if(!a){a={stop:0,pit:0,fix:0,move:0,dist:0,slow:0,off:0,resp:0,hits:0};acc.set(c,a);}
  if(c.stopT>0)a.stop+=h;else if(c.pitT>0)a.pit+=h;else if(c.punct&&c.vx<1.2)a.fix+=h;else {a.move+=h;a.dist+=Math.max(0,c.vx)*h;if(c.vx<5)a.slow+=h;if(c.off)a.off+=h;}
  return origStep(c,trk,h);};
const origResp=respawn;respawn=function(c){const a=acc.get(c);if(a)a.resp++;return origResp(c);};
const origFail=carFailure;carFailure=function(c){if(c.you)return;return origFail(c);};
let info=null;raceResults=function(rc,res,mode,inf){info={res,inf};};
startRace({rc,mode:'sim',entries:[{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}]});
`+`
console.log(rc.name,'len',Math.round(info.inf.len),'dur',R===null?'':'',trackCfg(rc).t||'');
for(const [c,a] of acc){console.log((c.name+'/'+(c.drvName||'')).slice(0,30).padEnd(30),'vtop',(c.vtop*3.6).toFixed(0),'rel',c.rel.toFixed(2),'fin',c.fin!==null?c.fin.toFixed(0):'-','dnf',c.dnf||'-','move',a.move.toFixed(0),'avg',(a.dist/Math.max(1,a.move)*3.6).toFixed(0),'stop',a.stop.toFixed(0),'pit',a.pit.toFixed(0),'fix',a.fix.toFixed(0),'slow',a.slow.toFixed(0),'off',a.off.toFixed(0),'resp',a.resp,'punct',c.punctN||0,'prog',Math.round(c.prog));}
`);
