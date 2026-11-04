// 0.43: первая модель — легенда марки, если она ровесница старта («Вело» Бенца 1895, «Яковлев и Фрезе» 1896): имя, детали, бонусы,
// место среди двух легенд, класс — как у обычной первой модели. node game/test/v43.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
newGame('frese','ru','Фрезе и Ко','normal','');let m=G.models[0];
ok(m.name==='Яковлев и Фрезе'&&m.legend==='frese_yak'&&m.e==='e1'&&m.g==='g1'&&m.w==='w1','Фрезе начинает с «Яковлев и Фрезе»: имя, детали легенды (мотор Де Диона, ремень, сплошные шины)');
ok(m.t==='t1'&&G.legends&&G.legends.frese_yak&&G.legends.frese_yak.start===1&&legendCount(G)===1,'класс — средний, как у обычной первой модели; легенда занимает одно из двух мест');
ok(legendK(m,'appeal')===1.2&&legendState(G,LEGEND_BY.frese_yak)==='done','бонусы легенды действуют (спрос ×1,2), в карточке легенд — «уже ваша»');
setOpen('legend',true);ok(legendCardHTML(G).includes('Ваша первая модель — с неё началась марка')&&!legendCardHTML(G).includes('Разработать «Яковлев'),'карточка «Легенды марки»: «ваша первая модель», кнопки разработки нет');
newGame('frese','ru','Фрезе и Ко','normal','Ласточка');ok(G.models[0].name==='Ласточка'&&G.models[0].legend==='frese_yak','своё имя первой модели сохраняется — легенда под вашим именем');
newGame('benz','de','Бенц','normal','');m=G.models[0];ok(m.name==='Вело'&&m.legend==='benz_velo'&&m.paint===PNT.green,'Бенц начинает с «Вело» — зелёного, как в истории');
newGame('maybach','de','Даймлер','normal','');ok(G.models[0].name==='Тип 1'&&!G.models[0].legend,'у Майбаха ранняя легенда — грузовик: первая модель по-прежнему «Тип 1»');
newGame('ford','us','Форд','normal','');ok(G.models[0].name==='Тип 1'&&!G.models[0].legend&&legendCount(G)===0,'у Форда легенды позже (1908) — старт прежний');
newGame('custom','ru','Своя','normal','');ok(G.models[0].name==='Тип 1'&&!G.models[0].legend,'свой персонаж в России: С24 (1909) на старте недоступен — «Тип 1»');
// экономика старта: Бенц с «Вело» за два года продаёт не хуже двух третей прежнего «Типа 1»
const sim=(set)=>{Math.random=(()=>{let a=3;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();newGame('benz','de','Бенц','normal','');const m=G.models[0];if(set){Object.assign(m,set);delete m.legend;G.legends={};m.price=Math.round(refPrice(m,G)/10)*10;}
  for(let k=0;k<24;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}return {cash:Math.round(G.cash),sold:G.models[0].totalSold};};
const a=sim(null),b=sim({name:'Тип 1',g:'g2',w:'w2',t:'t1'});ok(a.sold>=b.sold*0.6&&a.cash>=b.cash*0.9,'старт Бенца с «Вело» за 24 месяца: продано '+a.sold+' (было «Типом 1» '+b.sold+'), касса '+a.cash+' против '+b.cash);
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
