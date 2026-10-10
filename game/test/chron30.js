// 0.30: сцены из хроники стоят у дороги: node test/chron30.js
require('./harness.js')(`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');
const seen={};let tot=0,staged=0;
for(const id in SCN){const S=SCN[id];if(!(S.ev||[]).some(e=>scnEvKind(e).k==='chron'))continue;const rc0=RACES.find(r=>r.id===id||r.key===id);if(!rc0)continue;
  const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});const md=G.models[0];
  try{startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'hard',gear:0}]});}catch(e){console.log('  !! '+id+': '+e.message);continue;}
  const T=R.trk,ch=(T.evx||[]).filter(e=>e.k==='chron');
  ch.forEach(e=>{tot++;const st=e.st||'-';if(e.a!==undefined&&e.a>=0){staged++;seen[st]=(seen[st]||0)+1;}
    console.log('  '+rc.name+' '+rc.y+': «'+e.t+'» → '+st+(e.a>=0?' у точки '+e.a+', титр за '+Math.round((e.a-(T.closed?0:T.startIdx))*T.step-e.at)+' м':' (только титр)'));});
  const L=T.chron||[];if(L.length)console.log('     в 3D: '+L.map(o=>o.kind).join(', '));
  const boards=T.spr.flat().filter(x=>x.t==='cboard');if(boards.length)console.log('     доски: '+boards.map(b=>'«'+b.txt+'»').join(' '));
  R=null;}
ok(tot>=15,'событий хроники в сценариях: '+tot);ok(staged>=tot*0.8,'поставлены у дороги: '+staged+' из '+tot+' — '+JSON.stringify(seen));
ok(['dog','wreck','forge','camel','board'].every(k=>seen[k]),'есть собака, авария, кузница, верблюды, доски');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
