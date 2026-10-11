// 0.30: механик рядом с гонщиком ведёт по маршруту голосом: node test/nav30.js [ключ гонки]
require('./harness.js')(`
Math.random=(()=>{let a=41;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');G.cash=1e6;
const said=[];navBubble=(t)=>said.push([R.time.toFixed(1),t]);
function run(rc,T){const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  said.length=0;startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'hard',gear:0}]});const me=R.me;me.player=false;   // ведёт ИИ, механик говорит
  const TR=R.trk,dt=1/30;for(let f=0;f<T*30&&R&&!R.done;f++){R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;navTick();}
  const n={};said.forEach(x=>{n[x[1]]=(n[x[1]]||0)+1;});return {me,n,mech:me.mech,TR};}
const key=process.argv[2]||'';const list=key?[RACES.find(r=>r.key===key||r.id===key)]:[RACES.find(r=>r.t==='road'&&r.y>=1903&&r.y<=1908),RACES.find(r=>r.t==='circuit'&&r.y>=1906&&r.y<=1913)||RACES.find(r=>r.y>=1906&&r.y<=1913&&r.t!=='road')];
for(const rc0 of list.filter(Boolean)){const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});
  const o=run(rc,240);console.log('\\n'+rc.name+' '+rc.y+' ('+rc.t+') — механик в машине: '+o.mech+', фраз '+said.length);
  console.log('  '+said.slice(0,40).map(x=>x[0]+'с '+x[1]).join('\\n  '));
  ok(o.mech,'в машине сидит механик');ok(said.length>=8,'механик говорит: '+said.length+' фраз за 4 минуты');
  const curves=Object.keys(o.n).filter(t=>/Правый|Левый|шпилька/i.test(t)).reduce((a,t)=>a+o.n[t],0),sharp=(()=>{const T=o.TR;let k=0;for(let i=1;i<T.n;i++)if(Math.abs(T.K[i])>1/40&&Math.abs(T.K[i-1])<=1/40)k++;return k;})();
  ok(!sharp||curves>=Math.min(3,sharp),'называет повороты: '+curves+' (крутых поворотов на трассе '+sharp+')');
  // «Тормози!», «Держись!», шлагбаум, собака — перебивают на полуслове; остальное — по очереди, не наскакивая
  const cut=new Set(['brk','gate','crash','dog'].map(k=>NAV_L[k]));
  let gap=99;for(let i=1;i<said.length;i++)if(!cut.has(said[i][1]))gap=Math.min(gap,+said[i][0]-+said[i-1][0]);ok(gap>=0.5,'не тараторит: самый короткий промежуток '+gap.toFixed(1)+' с');
  const mud=said.filter(x=>/^грязь/.test(x[1])).length;ok(mud<=4,'«грязь» — на участок, а не у каждой ямы: '+mud+' раз');
  R=null;G.pending=[];}
// после 1925 года механика в гоночной машине нет — и голоса нет
{const rc0=RACES.find(r=>r.y>=1926&&r.t!=='rally'&&r.t!=='endurance');if(rc0){const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});const o=run(rc,40);ok(!o.mech&&said.length===0,rc.name+' '+rc.y+': гонщик один, механик молчит');R=null;}}
// все фразы механика есть в списке для записи голоса
ok(navLines().length>=80&&Object.values(NAV_L).every(t=>/[!.]$/.test(t))&&legLines().every(t=>navLines().includes(t)),'фраз для записи: '+navLines().length+' (слов легенды '+legLines().length+')');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
