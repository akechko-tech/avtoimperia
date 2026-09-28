// След одной машины: где она съезжает и застревает
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=+(${JSON.stringify(process.argv[4]||'5')});return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const key=${JSON.stringify(process.argv[2]||'gpacf-1906')},who=${JSON.stringify(process.argv[3]||'Mercedes')};
newGame('custom','fr','T','normal');
const rc=RACES.find(r=>r.key===key);G.y=rc.y;G.m=rc.m;G.cash=1e7;
{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>G.models[0][k]=a[k]);}G.rdept=1;
let lastT=-1;const origTick=raceTick;
raceTick=function(dt){origTick(dt);if(!R)return;const c=R.cars.find(x=>x.name===who);if(!c)return;const t=Math.floor(R.time);if(t!==lastT&&t%2===0){lastT=t;
  console.log('t',t,'idx',c.idx,'lat',c.lat.toFixed(1),'W',R.trk.W,'vx',c.vx.toFixed(1),'vy',c.vy.toFixed(1),'K',(R.trk.K[c.idx]*100).toFixed(2),'st2',(c.st2||0).toFixed(1),'off',c.off,'Rt',R.t.toFixed(1),'yawRel',angWrap(c.yaw-Math.atan2(R.trk.T[c.idx][0],R.trk.T[c.idx][1])).toFixed(2),'thr',c.thr.toFixed(1),'brk',c.brk.toFixed(1),'d',c.delta.toFixed(2),'stop',c.stopT>0?1:0,'punct',c.punct?1:0,'dmg',Math.round(c.dmg),'bar',JSON.stringify(R.trk.bar[c.idx]));}};
const origFail=carFailure;carFailure=function(c){if(c.you)return;return origFail(c);};
let info=null;raceResults=function(rc,res,mode,inf){info={res,inf};};
startRace({rc,mode:'sim',entries:[{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}]});
`);
