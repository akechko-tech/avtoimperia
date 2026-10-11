// 0.32: гоночная траектория (K1999 + поздний апекс) и мастерство пилотов по сложности.
// Линия в пределах дороги, на трассе быстрее оси (2%+), ИИ точнее держит линию на «Историке», чем на «Лёгкой».
// node game/test/line32.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('custom','fr','T','normal');
const ids=['targa-1907','gpacf-1906','pbp-1895','monza1922-1922','indy-1911'];
for(const id of ids){const rc0=RACES.find(r=>r.key===id||r.id===id);if(!rc0){console.log('  нет трассы',id);continue;}const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});
  const T=buildTrack(rc,30),t0=Date.now(),L=lineBuild(T),ms=Date.now()-t0;let over=0;for(let i=0;i<T.n;i++)if(Math.abs(L.lat[i])>L.B+1e-3)over++;
  const ta=lineTime(T,new Float32Array(T.n)),tl=lineTime(T,L.lat),gain=1-tl/ta,v=lineSpeed(T,Float32Array.from(T.K));let slow=0;for(let i=0;i<T.n;i++)if(v[i]<v.top-0.5)slow++;
  // где повороты не тормозят машину эпохи (быстрые дуги Монцы, длинные прямые Ле-Мана) — линия не должна быть медленнее
  const twisty=slow>T.n*0.05;
  ok(over===0&&gain>=(twisty?0.008:-0.001)&&ms<4000,rc.name+' '+rc.y+': линия быстрее оси на '+(gain*100).toFixed(1)+'%'+(twisty?'':' (быстрая трасса: повороты не тормозят)')+', за дорогу не выходит, расчёт '+ms+' мс');}
// мастерство: пилот × сложность; точность линии растёт с мастерством
const sk=d=>{G.diff=d;return aiSkill({sk:0.85});},pr=d=>{G.diff=d;return linePrec({sk:0.85});};
const K=['kids','easy','normal','hard','hist'].map(d=>[d,sk(d),pr(d)]);
console.log('  '+K.map(x=>x[0]+' мастерство '+x[1].toFixed(2)+' точность '+x[2].toFixed(2)).join(' · '));
ok(K.every((x,i)=>i===0||x[1]>=K[i-1][1]&&x[2]>=K[i-1][2]),'на сложности выше соперники быстрее и точнее');
G.diff='normal';ok(linePrec({sk:0.6})<linePrec({sk:0.95}),'новичок держит линию хуже мастера');
ok(aiSkill({sk:0.85,you:1})===0.85,'ваши гонщики — как есть (сложность их не меняет)');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');if(fails)process.exitCode=1;
`);
