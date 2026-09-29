// Изучение машин конкурентов и «подтягивание»: покупка, завершение проекта, прототипы, доводка, скидки
require('./harness.js')(`
Math.random=(()=>{let a=77;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame('ford','us','T','normal');G.y=1915;G.m=2;G.cash=1e6;G.rd.lvl=4;
console.log('список:',studyList(G).map(c=>c.kind+':'+c.name+' '+c.y+' $'+c.price+' новые:'+studyGain(c,G).fut.map(x=>x.id).join(',')+' доводка:'+studyGain(c,G).ups.map(x=>x.id).join(',')).join(' | '));
const ok=studyStart(G,'lux');console.log('старт lux',ok,'проекты',G.rd.projs.map(p=>p.kind+':'+p.name+' '+p.need).join(','));
let n=0;while(G.rd.projs.some(p=>p.kind==='study')&&n<24){G.pending=[];step();n++;}
console.log('через мес.',n,'early',G.rd.early.join(','),'upg',JSON.stringify(G.rd.upg),'know',Object.keys(G.rd.know||{}).join(','),'ins',JSON.stringify(G.rd.ins));
const e6=ENGINES.find(x=>x.id==='e6');console.log('e6 доступен',unlockedP(ENGINES,G).some(x=>x.id==='e6'),'год детали',e6.y,'сейчас',G.y);
console.log('studied',JSON.stringify(G.rd.studied),'повтор',studyStart(G,'lux'));
const pr=rdProjects(G).filter(p=>p.kind==='upg'&&(p.know||p.mass)).slice(0,6).map(p=>p.id+' need '+p.need+(p.know?' know':'')+(p.mass?' mass':''));console.log('скидки КБ:',pr.join('; '));
const md=G.models[0];const k=designKind(md);G.rd.ins[k]=mi(G)+10;console.log('insight',k,studyIns(md,G),'devCost',devCost(md,G),'devMonths',devMonths(md));delete G.rd.ins[k];console.log('без insight devCost',devCost(md,G),'devMonths',devMonths(md));
// техника: старые технологии дешевле
['tools','elec','parts','line','qc'].forEach(k=>console.log('tech',k,'catch',techCatch(G,k).toFixed(2),'cost',techCost(G,k),'мес',techMonths(G,k)));
// соперники копируют
G.segYPrev={people:5000};G.segYTPrev={people:10000};const best=G.models[0];console.log('S до',classScore(best,G).toFixed(3),designKind(best));
for(let i=0;i<4;i++)rivalsCopy(G);console.log('copy',JSON.stringify(G.copy),'S после',classScore(best,G).toFixed(3),'события',G.pending.map(e=>e.title).join('; '));
`);
// соперники копируют сильную модель
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame('ford','us','T','normal');G.y=1912;G.m=0;G.cash=1e6;G.rd.lvl=7;
const md=autoDesign('people',G);Object.assign(G.models[0],md,{status:'prod'});const m=G.models[0];PART_KEYS.forEach(k=>G.rd.upg[m[k]]=5);
const k=designKind(m);G.segYPrev={[k==='van'||k==='truck'?'truck':k]:40000};G.segYTPrev={[k==='van'||k==='truck'?'truck':k]:100000};
console.log('класс',k,'S до',classScore(m,G).toFixed(3));
for(let i=0;i<6;i++){rivalsCopy(G);console.log(' год',i+1,'copy',(G.copy[k]||0).toFixed(2),'S',classScore(m,G).toFixed(3));}
console.log('газеты:',G.pending.map(e=>e.title).join(' | '));
`);
