// 0.31: легенда трассы — механик читает повороты с углом и расстоянием, как штурман ралли: node test/legend31.js [id гонки]
require('./harness.js')(`
Math.random=(()=>{let a=41;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');G.cash=1e6;
const said=[];navBubble=(t)=>said.push([R.time,t,R.me?R.me.idx:0]);
function run(rc,secs){const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  said.length=0;startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'hard',gear:0}]});const me=R.me;me.player=false;const TR=R.trk;
  const dt=1/30;for(let f=0;f<secs*30&&R&&!R.done;f++){R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;navTick();}
  return {TR,me};}
const ids=process.argv[2]?[process.argv[2]]:['targa','pm1903','dieppe'];
for(const id of ids){const rc0=RACES.find(r=>r.id===id||r.key===id);if(!rc0){console.log('нет гонки',id);continue;}const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});
  const o=run(rc,200),LG=o.TR.leg,L=LG?LG.L:[];const cs=L.filter(c=>c.t==='c'),hz=L.filter(c=>c.t==='h');
  const byW={};cs.forEach(c=>{byW[c.w]=(byW[c.w]||0)+1;});
  console.log('\\n'+rc.name+' '+rc.y+': поворотов в легенде '+cs.length+', опасностей '+hz.length+' ('+[...new Set(hz.map(h=>h.w))].join(', ')+')');
  console.log('  углы: '+Object.entries(byW).sort().map(([k,v])=>k+'×'+v).join(' '));
  console.log('  первые записи: '+L.slice(0,10).map(c=>c.t==='c'?legWords(c,true).map(legSub).join(' ')+' ['+Math.round(c.deg)+'°, R'+Math.round(c.R)+']':LEG_SUB[c.w]).join(' | '));
  console.log('  что сказал механик (первые 25):');said.slice(0,25).forEach(x=>console.log('    '+x[0].toFixed(1)+' с: '+x[1]));
  const legN=said.filter(x=>/Правый|Левый|шпилька|гребень|мост|переезд|деревня|город|финиш|трамплин|серпантин|тоннель|грязь/.test(x[1])).length;
  ok(cs.length+hz.length>=5,'в легенде есть записи: поворотов '+cs.length+', опасностей '+hz.length);ok(legN>=5,'механик читает легенду: '+legN+' фраз за 200 с');
  ok(said.some(x=>/· (50|100|150|200|300|400|500|сразу)/.test(x[1])),'называет расстояние до следующего («сто», «сразу»)');
  // фраза звучит заранее: при чтении до поворота больше 1,1 с хода
  R=null;G.pending=[];}
ok(legLines().length>=40&&legLines().every(t=>t&&t.length<30),'слов легенды для записи: '+legLines().length);
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
