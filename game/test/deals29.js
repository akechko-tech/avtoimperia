// 0.29: сделки по инициативе игрока — покупка и слияние марок; доли рынка по странам; менеджер команды. node game/test/deals29.js
require('./harness.js')(require('./bot.js')+`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);};
// партия за FIAT (Аньелли), 1910 год: деньги есть
newGame('agnelli','it','FIAT','normal');
for(let k=0;k<12*14;k++){G.pending=[];botMonth('std');step();}if(G.cash<4e5)G.cash=4e5;
const s=G;console.log('год',s.y,'касса',Math.round(s.cash),'мощность',Math.round(s.cap));
// 1. доли рынка: мир и страны
{const W=sharesData(s,'world'),I=sharesData(s,'it');ok(W.tot>I.tot&&W.L.length>10,'мир больше Италии: '+Math.round(W.tot)+' > '+Math.round(I.tot));
  const me=I.L.find(r=>r.you);ok(me&&me.v>0,'ваши продажи в Италии: '+Math.round(me.v));ok(sharesData(s,'fr').L.some(r=>/Renault|Peugeot/.test(r.n)),'во Франции — французские марки');
  const html=sharesCard(s);ok(/Доли рынка/.test(html)&&/data-act="mkC"/.test(html),'карточка «Доли рынка» с выбором страны');}
// 2. сделки: список, оценка, шанс
{setOpen('deals',true);const html=dealsCard(s);ok(/Переговоры/.test(html),'карточка «Сделки»: есть с кем говорить');
  const L=(COMPS.it||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(s,'it',o.i));ok(L.length>=2,'итальянских марок для сделки: '+L.length);
  const t=L.sort((a,b)=>dealStat(s,'it',a.i).v-dealStat(s,'it',b.i).v)[0],V=dealValue(s,'it',t.i);
  console.log('     цель',t.cp.n,'продажи',Math.round(dealStat(s,'it',t.i).v),'оценка',V,'шансы',[0.8,1,1.2,1.4].map(k=>Math.round(dealChance(s,'it',t.i,k)*100)+'%').join(' '));
  ok(dealChance(s,'it',t.i,1.4)>dealChance(s,'it',t.i,0.8),'щедрее предложение — выше шанс');
  // покупка (повторяем, пока не согласятся или не кончатся попытки)
  const cap0=s.cap,sh0=boughtShare('it','middle',s)+boughtShare('it','people',s);let r=null;s.cash=Math.max(s.cash,V*3);
  for(let k=0;k<8;k++){delete (s.dealNo||{})['it'+t.i];r=dealDo(s,'it',t.i,'buy',1.4);if(r&&r.ok)break;}
  ok(r&&r.ok,'покупка состоялась');ok(acqHas(s,'it',t.i)&&dealBlock(s,'it',t.i)==='ваша','марка теперь ваша');ok(s.cap>cap0,'мощности выросли: '+Math.round(cap0)+' → '+Math.round(s.cap));
  ok(!compSplit('it','middle',s,1000).some(o=>o.i===t.i),'купленная марка больше не конкурент');
  const sold0=s.last.mk.it.sold;for(let k=0;k<3;k++){s.pending=[];botMonth('std');step();}ok(s.last.mk.it.sold>=sold0*0.9,'продажи в Италии не упали: '+Math.round(sold0)+' → '+Math.round(s.last.mk.it.sold));
  // слияние с другой маркой
  const u=L.filter(o=>o.i!==t.i&&!dealBlock(s,'it',o.i))[0];if(u){let rr=null;for(let k=0;k<10;k++){delete (s.dealNo||{})['it'+u.i];rr=dealDo(s,'it',u.i,'merge',1);if(rr&&rr.ok)break;}
    ok(rr&&rr.ok&&(s.partners||[]).length===1,'слияние: совладельцы получили '+Math.round(partnersShare(s)*100)+'% прибыли');
    s.pending=[];botMonth('std');step();ok(s.last.invSh>0||s.last.profit<=0,'доля совладельцев вычитается из прибыли');}
  // отказ — пауза на год
  const w=(COMPS.fr||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(s,'fr',o.i))[0];if(w){s.cash=Math.max(s.cash,dealValue(s,'fr',w.i)*2);const save=Math.random;Math.random=()=>0.999;const rr=dealDo(s,'fr',w.i,'buy',0.8);Math.random=save;
    ok(rr&&!rr.ok&&dealBlock(s,'fr',w.i)==='пауза','отказ — год без переговоров');}
  ok(dealBlock(s,'us',(COMPS.us||[]).findIndex(cp=>cp.n==='Buick'))==='в концерне'||s.y<1908,'Buick в концерне GM не продаётся');}
// 3. менеджер команды: заявка в пределах бюджета
{const rc=RACES.filter(r=>r.y===s.y&&!r.match)[0]||RACES.find(r=>r.y===s.y);if(rc){
  ['eco','std','max'].forEach(p=>{const M=managerLineup(s,rc,p);console.log('     '+p,M.entries.length,'машин, расходы',M.total,'бюджет',M.budget,M.entries.map(e=>e.drv).join(','));});
  const E=managerLineup(s,rc,'eco'),X=managerLineup(s,rc,'max');ok(E.entries.length===1,'«Экономно» — одна машина');ok(X.entries.length>=E.entries.length,'«Не жалеть» — не меньше машин');
  ok(E.entries.every(e=>e.drv&&e.car),'у каждого экипажа пилот и машина');ok(X.total<=Math.max(X.budget,entryCost(rc,X.entries[0],s).total)+1,'в пределах бюджета');}}
console.log(fails?'FAILED '+fails:'ALL OK');
`);
