// 0.32: не больше двух легендарных моделей на марку; бонус наследия за пари — в пределах шкалы бренда.   node game/test/legend32.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const pk=Object.keys(PIONEERS).find(k=>{try{newGame(k,PIONEERS[k].c,'T','normal');return legendsOf(G).length>=3;}catch(_){return false;}});
ok(!!pk,'есть марка с тремя и больше легендами: '+pk);
newGame(pk,PIONEERS[pk].c,'T','normal');const s=G;s.y=1929;s.cash=1e8;Object.keys(TECH).forEach(k=>s.tech[k]=TECH[k].max);
const L=legendsOf(s);ok(L.filter(x=>legendState(s,x)==='open').length>=3,'в 1929 году открыты '+L.filter(x=>legendState(s,x)==='open').length+' легенды');
ok(legendStart(s,L[0].id)&&legendStart(s,L[1].id),'две легенды начаты');
ok(legendState(s,L[2])==='limit'&&!legendStart(s,L[2].id),'третья — нельзя: «'+L[2].name+'» в состоянии '+legendState(s,L[2]));
ok(/2 из 2|выбрано: 2/.test(legendCardHTML(s)),'карточка легенд: выбрано 2 из 2');
s.legBonus=500;const P=playerLegacy(s);ok(P.brand<=LEG_MAX.brand+1e-6,'бонус за пари не выводит бренд за шкалу: '+Math.round(P.brand)+' из '+LEG_MAX.brand);
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');if(fails)process.exitCode=1;
`);
