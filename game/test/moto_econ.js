// 0.32: рынок мотоциклов без игрока — продажи по странам и годам против истории (±5%), формы рынка:
// спад в США после 1915 года, рост в Германии и Британии в 1920-х.  node game/test/moto_econ.js
require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let bad=0,worst=0;const res={};
for(const c of ['us','fr','uk','de','it']){newGame('custom',c,'T','normal');G.cash=1e9;G.models[0].status='off';G.helper=null;
  const yr={},exp={};
  for(let k=0;k<35*12;k++){G.pending=[];
    // ожидание — как в калибровке: годовая история по месяцам, с сезоном и событиями года
    const y=G.y,m=G.m,sf=[...Array(12).keys()].reduce((a,mm)=>a+SEASON[mm]*econ(y,mm,c).f,0),fm=SEASON[m]*econ(y,m,c).f*12/sf;
    exp[y]=(exp[y]||0)+MOTOSEG.reduce((a,g)=>a+segAnnual(c,g,G)/12*fm,0);
    step();const mk=G.last.mk[c];yr[y]=(yr[y]||0)+(mk.msize||0);}
  const L=[];for(const y in yr){const e=exp[y];if(e<300)continue;const d=yr[y]/e-1;worst=Math.max(worst,Math.abs(d));if(Math.abs(d)>0.05){bad++;L.push(y+': '+Math.round(yr[y])+' / '+Math.round(e)+' ('+(d*100).toFixed(1)+'%)');}}
  res[c]=yr;
  console.log(c,[1899,1905,1910,1913,1916,1920,1925,1929].map(y=>y+': '+Math.round(yr[y]||0)+' / '+Math.round(exp[y]||0)).join('  '));
  if(L.length)console.log('  вне ±5%:',L.join('; '));}
// формы рынка
const sh=[];
if(!(res.us[1913]>res.us[1920]*1.5&&res.us[1913]>res.us[1925]*2))sh.push('США: нет спада после 1915 года');
if(!(res.de[1928]>res.de[1922]*5))sh.push('Германия: нет роста в 1920-х');
if(!(res.uk[1925]>res.uk[1913]*2))sh.push('Британия: нет роста в 1920-х');
console.log('худшее отклонение '+(worst*100).toFixed(1)+'%, лет вне ±5%: '+bad+(sh.length?' | ФОРМЫ: '+sh.join('; '):' | формы рынка на месте'));
if(bad||sh.length)process.exitCode=1;
`);
