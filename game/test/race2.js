// Одна гонка в режиме «быстрый итог»: время расчёта, длительность, сходы, остановки
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const args=${JSON.stringify(process.argv.slice(2))};
const key=args[0]||'pbp-1895',N=+(args[1]||5);
newGame('custom','fr','T','normal');
const rc=RACES.find(r=>r.key===key);G.y=rc.y;G.m=rc.m;G.cash=1e7;
{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>G.models[0][k]=a[k]);}G.rdept=1;
const origTick=raceTick;let ticks=0;raceTick=function(dt){ticks++;return origTick(dt);};
let stats=[];
for(let i=0;i<N;i++){ticks=0;let simT=0,info=null;
  const orig=raceResults;raceResults=function(rc,res,mode,inf){info={res,inf};};
  const t0=Date.now();startRace({rc,mode:'sim',entries:[{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}]});const dt=Date.now()-t0;
  raceResults=orig;
  const k=rc.km*1000/info.inf.len,w=info.res[0];
  stats.push(dt+'ms ticks '+ticks+' len '+Math.round(info.inf.len)+' win '+w.name+' '+fmtRaceTime(w.fin*k)+' simT '+(w.fin||0).toFixed(1)+' dnf '+info.res.filter(r=>r.dnf).length+'/'+info.res.length+' me '+(info.res.find(r=>r.you).dnf||info.res.find(r=>r.you).pos));}
console.log(rc.name, rc.km+'km', 'dur', trackCfg(rc));
console.log(stats.join('\\n'));
`);
