// 0.30: бот-«эксперт» — как сильный игрок: Лянча основывает Lancia в 1906 году, помощник ведёт цены и завод,
// а бот жмёт на все рычаги сразу: лучшая машина, экспорт во все страны, дилеры до нужды, реклама, гоночная слава весь год.
// node game/test/expert30.js [год_конца=1911] [сделки=0|1] [сложность=normal]
const A=process.argv.slice(2),Y1=+(A[0]||1911),DEALS=+(A[1]||0),DIFF=A[2]||'normal';
require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
racerNew('lancia','it',1900,'Винченцо Лянча','${DIFF}');G.y=1906;G.m=10;G.cash=60000;G.racer.fame=60;
racerFound('partner','',0);const s=G;s.helper={on:1};s.pending=[];s.cash+=+(process.env.CASH0||40000);
function sh(c){const W=sharesData(s,c);const me=W.L.find(r=>r.you);return me?me.v/Math.max(1,W.tot):0;}
let lastNew=mi(s);
for(let k=0;k<12*(${Y1}-1906)+2&&!s.over;k++){
  s.pending=[];
  // лучшая машина раз в три года: средний класс (или спортивный, если выгоднее)
  const act=s.models.filter(m=>m.status==='prod'),dev=s.models.filter(m=>m.status==='dev');
  if(!dev.length&&(mi(s)-lastNew>=30||!act.length)){let best=null,bv=-1e18;for(const g of ['middle','sport','lux']){if(g==='sport'&&!sportOpen(s))continue;const md=autoDesign(g,s);const v=designValue(md,s);if(v>bv){bv=v;best=md;}}
    const dc=devCost(best,s);if(s.cash>dc*1.3){s.cash-=dc;const m={...best,id:s.nextId++,name:'Эксп '+s.nextId,paint:'#8a1c1c',plan:'auto',status:'dev',devLeft:devMonths(best),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);lastNew=mi(s);}}
  s.models.filter(m=>m.status==='prod').forEach(m=>{const nw=!m.from&&s.models.some(x=>x.status==='prod'&&!x.from&&x.id>m.id&&mi(s)-x.launched>=4);if(nw){m.status='off';}});
  // экспорт, дилеры, реклама, цены и цеха — помощник (как у сильного бота)
  // гонки: победы весь год (слава модели) и титул сезона
  s.models.filter(m=>m.status==='prod').forEach(m=>{m.raceBoost=mi(s)+3;});if(s.y>=1908)s.titleBoost=mi(s)+3;
  ${DEALS?`if(s.m%2===1&&s.y>=1908){const C=[];for(const c of Object.keys(COUNTRIES)){(COMPS[c]||[]).forEach((cp,i)=>{if(dealBlock(s,c,i))return;const V=dealValue(s,c,i),st=dealStat(s,c,i);if(st.v>0)C.push({c,i,V,ppu:V/st.v});});}
    C.sort((a,b)=>a.ppu-b.ppu);for(const o of C){if(s.cash>o.V*1.3*1.4){const r=dealDo(s,o.c,o.i,'buy',1.3);if(r&&r.ok)console.log('   КУПЛЕНА',r.nm,o.c,Math.round(r.price));break;}}}`:''}
  step();
  if(s.m===0||k%6===0){const L=s.last||{};console.log(dstr(s),'продано/мес',Math.round(L.sold||0),'прибыль/мес',Math.round(L.profit||0),'касса',Math.round(s.cash),'мощн',Math.round(s.cap),'реп',Math.round(s.rep),'доли: мир',(sh('world')*100).toFixed(1)+'%',Object.keys(COUNTRIES).map(c=>c+' '+(sh(c)*100).toFixed(1)+'%').join(' '),'| легаси место',legacyTable(s).place,Math.round(legacyTable(s).me.total));}
}
const t=legacyTable(s);console.log('ИТОГ',dstr(s),'место в наследии',t.place,JSON.stringify(Object.fromEntries(Object.entries(t.me).map(([k,v])=>[k,Math.round(v)]))));
console.log('Ford в таблице:',JSON.stringify(t.rows.slice(0,5).map(r=>[r.n,Math.round(r.L.total)])));
`);
