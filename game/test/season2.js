// Проверка: очки чемпионата совпадают с местами игрока; ИИ-сезон досчитывается; титул присуждается
const bot=require('./bot.js');
require('./harness.js')(bot+`
let bad=0,titles=0,runs=0;
for(let seed=1;seed<=12;seed++){
  Math.random=(()=>{let a=seed*7919;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
  newGame('bugatti','fr','T','normal');G.y=1925;G.m=3;G.cash=1e6;G.rdept=3;G.dealers.us=10;
  const md=G.models[0];md.e='e7';md.c='c5';md.w='w6';md.b='b1';md.t='t0';
  G.drivers=availDrivers(G).sort((a,b)=>b.sk-a.sk).slice(0,2).map(d=>d.id);
  for(const key of AIACR_RACES[1925]){const rc=RACES.find(r=>r.key===key);while(G.m<rc.m){G.pending=[];step();}
    openRaceSetup(key);while(RS.entries.length<3)RACE_ACT.rAdd();RS.entries.forEach(e=>{if(!e.drv){const f=availDrivers(G).filter(d=>!RS.entries.some(x=>x.drv===d.id)).sort((a,b)=>b.sk-a.sk)[0];e.drv=f.id;}});
    RS.mode='sim';RACE_ACT.raceGo();runs++;
    const ch=G.season['aiacr-1925'],v=ch.rows[G.company].r[key],d=G.raceDone[key],exp=d>0?(d<=3?d:4):5;
    if(v!==exp){bad++;console.log('MISMATCH',seed,key,'recorded',v,'raceDone',d);}}
  while(G.y===1925){G.pending=[];step();}
  const ch=G.season['aiacr-1925'];if(ch.win===G.company)titles++;
  console.log(seed,'champ',ch.done,ch.win,'me',JSON.stringify(ch.rows[G.company].r),'total',champTotal('aiacr',ch,ch.rows[G.company]),'titles',G.titles.length);
}
console.log('runs',runs,'mismatch',bad,'titles',titles);
`);
