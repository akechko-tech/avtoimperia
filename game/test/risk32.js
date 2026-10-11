// 0.32: технический риск — передний край против обкатанной технологии: зрелость деталей, детские болезни, «не по ТЗ», доводка, наладка.   node game/test/risk32.js
require('./harness.js')(`
Math.random=(()=>{let a=9;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');const s=G;s.y=1905;s.cash=1e6;
const e9=ENGINES.find(x=>x.id==='e9'),e1=ENGINES.find(x=>x.id==='e1');
ok(partMat(e9,1905)===0&&partRisk(e9,1905)>0.5,'мотор Model T в 1905 году — прототип: зрелость 0, риск '+Math.round(partRisk(e9,1905)*100)+'%');
ok(partMat(e1,1905)===1&&partRisk(e1,1905)===0,'старый мотор обкатан: риск 0');
const md=JSON.parse(JSON.stringify(s.models[0]));md.id=99;md.e='e9';md.c='c3';md.name='Проба';s.rd.early.push('e9');
const r0=carBase({...md},0,1912).rel,r1=carBase(md,0,1905).rel;ok(r1<r0,'детские болезни: надёжность в 1905 году (прототип) против 1912 года (обкатан) '+(r0*100).toFixed(1)+'% → '+(r1*100).toFixed(1)+'%');
let dev=0,N=200;for(let i=0;i<N;i++){const m2={...md};if(devRoll(s,m2).length)dev++;}ok(dev/N>0.35&&dev/N<0.75,'запуск с прототипом мотора: не по ТЗ в '+Math.round(dev/N*100)+'% случаев');
const m3={...md};let out=[];for(let i=0;i<50&&!out.length;i++)out=devRoll(s,m3);const hp0=engineHp(e9,{...md}),hp1=engineHp(e9,m3);
ok(out.length&&(m3.dv.e?hp1<hp0:true),'мотор вышел слабее: '+Math.round(hp0)+' → '+Math.round(hp1)+' л.с. ('+out.map(o=>o.k).join(',')+')');
s.y=1908;s.m=0;const later=engineHp(e9,m3);ok(!m3.dv.e||later>hp1,'через 3 года отклонение тает: '+Math.round(later)+' л.с.');
s.models.push(m3);m3.status='prod';ok(fixStart(s,m3.id)&&rdActive(s).some(p=>p.kind==='fix'),'доводка в КБ начата');
const pj=rdActive(s).find(p=>p.kind==='fix');pj.prog=pj.need;s.pending=[];step();ok(!m3.dv,'доводка завершена — машина по ТЗ');
ok(techRisk({...s,y:1909,tech:{tools:2,elec:1,parts:1,line:1}},'line')>0.5,'конвейер в 1909 году: риск наладки '+Math.round(techRisk({...s,y:1909,tech:{tools:2,elec:1,parts:1,line:1}},'line')*100)+'%');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');if(fails)process.exitCode=1;
`);
