// Личный зачёт гонщиков, настроение пилотов, вызовы конкурентов и «короли года»: прогон нескольких сезонов
const bot=require('./bot.js');
require('./harness.js')(bot+`
const seed=+${JSON.stringify(process.argv[2]||'3')},pio=${JSON.stringify(process.argv[3]||'renault')},cc=${JSON.stringify(process.argv[4]||'fr')};
Math.random=(()=>{let a=seed*7919;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame(pio,cc,'T','normal');G.cash=3e5;G.rdept=2;
let races=0,chal={race:0,sales:0},acc=0,poach=0,papers=[];
const yEnd=+${JSON.stringify(process.argv[5]||'1914')};
while(G.y<yEnd){
  while(G.pending.length){const ev=G.pending[0];if(/вызов/i.test(ev.title)){chal[G.chal&&G.chal.type||'race']++;}if(/собирается уйти/.test(ev.title))poach++;if(/Короли|король|гонщик .* года|Король|—.*года!/.test(ev.title))papers.push(dstr(G)+' | '+ev.title+' | '+ev.text.split('\\n').length+' строк');
    const k=ev.choices[0][1];if(k==='chalYes')acc++;resolve(k);}
  if(G.drivers.length<2){const d=availDrivers(G).sort((a,b)=>b.sk-a.sk)[0];if(d&&G.cash>driverFee(d,G))RACE_ACT.hire({k:d.id});}
  // заявляемся на половину гонок: пилоты злятся за пропуски
  RACES.filter(r=>r.y===G.y&&r.m===G.m&&raceOpen(r,G)&&raceEligible(r,G)&&!raceWarBlocked(r,G)&&G.raceDone[r.key]===undefined).forEach((rc,i)=>{
    if((races+i)%2&&!(G.chal&&G.chal.rk===rc.key))return;
    openRaceSetup(rc.key);if(!RS)return;while(RS.entries.length<Math.min(3,1+G.drivers.length))RACE_ACT.rAdd();RS.entries.forEach((e,j)=>{if(e.drv==='me'&&G.drivers[j])e.drv=G.drivers[j];});
    RS.mode='sim';RACE_ACT.raceGo();races++;});
  botMonth('');step();
  if(G.m===0){const y=G.y-1,tb=dchTable(G,y);console.log('== '+y+' гонщики:',tb.slice(0,3).map(r=>r.n+' ('+r.mq+') '+r.pts+(r.mine?' *':'')).join('; '));
    console.log('   короли:',(G.kings&&G.kings.y===y?G.kings.lines:[]).join(' | '));
    console.log('   настроение:',G.drivers.map(id=>id+' '+Math.round(moodOf(G,id).v)+' ('+moodOf(G,id).why+')').join('; '),'· титулы',G.titles.length,'· касса',Math.round(G.cash));}
}
console.log('гонок',races,'вызовов',JSON.stringify(chal),'принято',acc,'уходов',poach);
console.log(papers.join('\\n'));
`);
