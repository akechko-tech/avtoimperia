// 0.17: кинохроника года и ролики прямо в газете — прогон нескольких лет, проверка кадров и разметки газеты
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=5*7919;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
global.IMG={};
newGame('renault','fr','T','normal');G.cash=3e5;G.rdept=2;
let races=0,papers=0,withReel=0,cel=0,errs=0;
while(G.y<1912){
  while(G.pending.length){const ev=G.pending[0];if(ev.cel)cel++;
    if(ev.paper){papers++;try{const h=paperHTML({...ev,act:'choose'},G);if(/class="p-reel"/.test(h)){withReel++;if(/data-k="reel:/.test(h))errs++;}}catch(e){errs++;console.log('paper err',e.message);}}
    resolve(ev.choices[0][1]);}
  if(G.drivers.length<2){const d=availDrivers(G).sort((a,b)=>b.sk-a.sk)[0];if(d&&G.cash>driverFee(d,G))RACE_ACT.hire({k:d.id});}
  RACES.filter(r=>r.y===G.y&&r.m===G.m&&raceOpen(r,G)&&raceEligible(r,G)&&!raceWarBlocked(r,G)&&G.raceDone[r.key]===undefined).forEach(rc=>{
    openRaceSetup(rc.key);if(!RS)return;while(RS.entries.length<Math.min(3,1+G.drivers.length))RACE_ACT.rAdd();RS.entries.forEach((e,j)=>{if(e.drv==='me'&&G.drivers[j])e.drv=G.drivers[j];});
    RS.mode='sim';RACE_ACT.raceGo();races++;});
  botMonth('');step();
}
const ys=Object.keys(G.yrec||{});console.log('годов в хронике',ys.length,ys.join(','));
ys.forEach(y=>{const R=reelGet('year:'+y,G);console.log(y,R?R.sh.length+' кадров: '+R.sh.map(x=>x.c!==undefined?'['+x.c+']':x.plant?'завод':x.car?'машина':x.i?'фото':'?').join(' · '):'НЕТ');
  if(R)R.sh.forEach(x=>{if(x.say)console.log('   🎙',reelFill(x.say,G));});});
console.log('газет',papers,'с роликом',withReel,'праздников',cel,'ошибок',errs,'гонок',races);
console.log('в архиве с роликом:',G.papers.filter(p=>p.reel).map(p=>p.d+' '+p.reel).join('; '));
console.log('роликов открыто:',(G.reels||[]).join(', '));
`);
