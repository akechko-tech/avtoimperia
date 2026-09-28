// Прогон сезонов: бот ведёт завод и заявляется на все доступные гонки в режиме «быстрый итог»
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const args=${JSON.stringify(process.argv.slice(2))};
const country=args[0]||'fr',years=+(args[1]||35),pion=args[2]||'custom';
newGame(pion,country,'T','normal');G.cash+=40000;
const log=[];let entered=0,wins=0,dnfAll=0,ms=0,maxMs=0,finCars=0,cars=0;const byEra={};
for(let k=0;k<years*12;k++){G.pending=[];botMonth('grow');
  if(G.y>=1900&&(G.rdept||0)<1&&G.cash>rdeptCost(G)*3)RACE_ACT.rdeptUp();
  if(G.y>=1910&&(G.rdept||0)<2&&G.cash>rdeptCost(G)*4)RACE_ACT.rdeptUp();
  if(G.y>=1920&&(G.rdept||0)<3&&G.cash>rdeptCost(G)*4)RACE_ACT.rdeptUp();
  if(G.drivers.length<2){const f=availDrivers(G).sort((a,b)=>b.sk-a.sk)[0];if(f&&G.cash>driverFee(f,G)*5)RACE_ACT.hire({k:f.id});}
  RACES.filter(rc=>raceStatus(rc,G)[2]).forEach(rc=>{
    if(G.cash<5000)return;
    openRaceSetup(rc.key);if(!RS)return;
    const nWant=rc.major?3:1;while(RS.entries.length<nWant)RACE_ACT.rAdd();
    RS.entries.forEach((e,i)=>{if(!e.drv){const f=availDrivers(G).filter(d=>!RS.entries.some(x=>x.drv===d.id)).sort((a,b)=>b.sk-a.sk)[0];if(f)e.drv=f.id;}});
    if(RS.entries.some(e=>!e.drv))RS.entries=RS.entries.filter(e=>e.drv);
    RS.mode='sim';const tot=setupTotal(rc,G);if(G.cash<tot.total){RS=null;return;}
    const t0=Date.now();RACE_ACT.raceGo();const dt=Date.now()-t0;ms+=dt;maxMs=Math.max(maxMs,dt);entered++;
    const L=lastRace;const team=L.res.filter(r=>r.you);cars+=team.length;finCars+=team.filter(r=>!r.dnf).length;
    const era=rc.y<1906?'1895-05':rc.y<1915?'1906-14':rc.y<1925?'1915-24':'1925-29';const E=byEra[era]=byEra[era]||{n:0,cars:0,fin:0,aiC:0,aiF:0,w:0};
    E.n++;E.cars+=team.length;E.fin+=team.filter(r=>!r.dnf).length;const ai=L.res.filter(r=>!r.you);E.aiC+=ai.length;E.aiF+=ai.filter(r=>!r.dnf).length;if(L.best===1)E.w++;
    if(L.best===1)wins++;if(!L.best)dnfAll++;
    if(entered%9===1)log.push(rc.y+' '+rc.name.slice(0,26).padEnd(26)+' best '+L.best+' team '+team.map(r=>r.dnf?'DNF':r.pos).join(',')+' win '+L.res[0].name+' '+fmtRaceTime(L.res[0].fin*L.k)+' ('+dt+'ms)');
  });
  step();if(G.over)break;}
console.log(log.join('\\n'));
console.log('entered',entered,'wins',wins,'allDNF',dnfAll,'avg ms',Math.round(ms/Math.max(1,entered)),'max ms',maxMs,'team finish rate',(finCars/cars).toFixed(2));
Object.keys(byEra).forEach(k=>{const E=byEra[k];console.log(k,'races',E.n,'teamFin',(E.fin/E.cars).toFixed(2),'aiFin',(E.aiF/E.aiC).toFixed(2),'wins',E.w);});
console.log('titles',JSON.stringify(G.titles));
console.log('seasons',Object.keys(G.season).join(' '));
console.log('final y',G.y,'cash',Math.round(G.cash),'rep',Math.round(G.rep),'legacy',Math.round(playerLegacy(G).total), 'sport', Math.round(playerLegacy(G).sport));
`);
