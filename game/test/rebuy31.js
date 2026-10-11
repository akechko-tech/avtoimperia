// 0.31: продали компанию — купили другую марку и ведём её; выкуп долей совладельцев: node test/rebuy31.js
require('./harness.js')(`
Math.random=(()=>{let a=31;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','Рено','normal');G.helper={on:1};for(let k=0;k<12*16&&!G.over;k++){G.pending=[];step();}
const s=G;console.log('год',s.y,'касса',Math.round(s.cash),'стоимость',Math.round(companyValue(s)),'продаж в год',Math.round(s.yearSold||0));
// 1) выкуп совладельцев
s.partners=[{n:'Финансисты',sh:0.2,t:mi(s)}];s.cash=Math.max(s.cash,companyValue(s));const c0=s.cash,pr=bbPrice(s,s.partners[0]);
ok(/Выкупить/.test(bbHTML(s)),'в «Сделках» — совладельцы и кнопка «Выкупить»');ok(bbBuy(s,0)&&!s.partners.length&&Math.abs(c0-s.cash-pr)<1,'выкупили 20% за '+money(pr)+' ('+Math.round(pr/companyValue(s)*100)+'% стоимости)');
s.investor={sh:0.3,until:mi(s)+60};ok(bbInvPrice(s)>0&&bbInv(s)&&!s.investor,'выкупили долю партнёра-инвестора');
// 2) продажа компании
const P=Math.round(companyValue(s)*1.3/1e4)*1e4;s.pending=[{title:'x',choices:[['Продать','ma:sell:Y:'+P]]}];maResolve(s,'ma:sell:Y:'+P);
ok(s.over&&s.soldTo&&s.soldTo.mine===P&&s.pastCos.length===1,'продали «Рено» за '+money(P)+', прежняя компания в архиве: '+s.pastCos[0].leg+' очков');
const ev=s.pending[0];ok(ev&&ev.choices.some(c=>c[1]==='ma:rebuy'),'в газете: «Купить другую марку»');
ok(/Купить другую марку|Выбрать марку/.test(vLog()),'на «Империи» — карточка «Начать с другой марки»');
// 3) список марок и покупка
const L=rbList(s,'it'),afford=L.filter(o=>o.price<=s.soldTo.mine);console.log('   Италия: '+L.map(o=>o.M.nm+' '+money(o.price)).join(', '));
ok(L.length>=2,'в Италии продаются марки: '+L.length);const pk1=afford.sort((a,b)=>b.price-a.price)[0]||L[L.length-1];
s.soldTo.mine=Math.max(s.soldTo.mine,pk1.price*1.5);
ok(rbBuy(s,'it',pk1.i),'купили «'+pk1.M.nm+'» за '+money(pk1.price));
ok(!s.over&&s.company===pk1.M.nm&&s.country==='it'&&s.models.length>=1&&s.models.every(m=>m.status==='prod'&&m.price>0),'новая компания: «'+s.company+'», '+s.models.map(m=>m.name+' $'+m.price).join(', '));
ok(s.cap>=6&&s.dealers.it>=3&&s.workers>=12,'заводы '+s.cap+' в месяц, дилеров '+s.dealers.it+', рабочих '+s.workers);
ok(!compSplit('it',maMainClass(pk1.cp,s,'it'),s,1000).some(o=>o.i===pk1.i),'купленная марка — больше не соперник');
const ren=(COMPS.fr||[]).findIndex(cp=>cp.n==='Renault');ok(ren<0||compSplit('fr','middle',s,1000).some(o=>o.i===ren)||compSplit('fr','people',s,1000).some(o=>o.i===ren)||compSplit('fr','lux',s,1000).some(o=>o.i===ren),'«исторический Renault» снова на рынке (вы его продали)');
// 4) год работы: продажи идут, всё считается
let sold=0;for(let k=0;k<12&&!s.over;k++){s.pending=[];step();sold+=s.last?s.last.sold:0;}
ok(!s.over&&sold>0,'за год продано '+Math.round(sold)+' машин, касса '+money(s.cash));
const t=legacyTable(s);ok(t.me.prev>0&&t.place>0,'наследие: прежние компании +'+t.me.prev+', место '+t.place);
// 5) все вкладки рисуются
let err='';for(const f of [vPlant,vModels,vMarket,vRace,vLog]){try{f();}catch(e){err+=f.name+': '+e.message+'; ';}}ok(!err,'вкладки рисуются'+(err?' — '+err:''));
try{openRebuy();}catch(e){err=e.message;}ok(!err,'лист «Купить марку» открывается');
// 6) сохранение 0.30: компанию продали, цена легла в кассу — после обновления можно купить марку на эти деньги
{const X=JSON.parse(JSON.stringify(s));X.over=true;X.pastCos=[];const Pold=5e6;X.cash+=Pold;X.soldTo={price:Pold,y:X.y,m:X.m};const cash=X.cash;
  migrate(X);ok(X.soldTo.mine===Math.round(cash)&&X.soldTo.co===X.company&&X.pastCos.length===1,'старое сохранение: ваши деньги '+money(X.soldTo.mine)+', прежняя компания в архиве');
  G=X;let e2='';try{openRebuy();}catch(e){e2=e.message;}ok(!e2,'лист «Купить марку» для старого сохранения');
  const L2=rbList(X,'de').filter(o=>o.price<=X.soldTo.mine);ok(L2.length>0&&rbBuy(X,'de',L2[0].i)&&Number.isFinite(X.cash)&&X.cash>=0,'купили «'+X.company+'», в кассе '+money(X.cash));}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
