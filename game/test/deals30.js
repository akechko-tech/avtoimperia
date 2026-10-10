// 0.30: сделки — дочерняя компания или поглощение, ответ владельцев сразу, предложения к вам, торги после банкротств; доли рынка.
// node game/test/deals30.js
require('./harness.js')(require('./bot.js')+`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);};
newGame('renault','fr','Рено','normal');
G.helper={on:1};for(let k=0;k<12*13&&!G.over;k++){G.pending=[];step();}G.cash=Math.max(G.cash,2e7);
const s=G;console.log('год',s.y,'касса',Math.round(s.cash),'игра идёт:',!s.over);
// 1. доли рынка
{const W=sharesData(s,'world'),I=sharesData(s,'fr');ok(W.tot>I.tot&&W.L.length>10,'мир больше Франции');const me=I.L.find(r=>r.you);ok(me&&me.v>0,'ваши продажи во Франции: '+Math.round(me.v));
  ok(/Доли рынка/.test(sharesCard(s)),'карточка «Доли рынка»');}
const L=(COMPS.fr||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(s,'fr',o.i)).sort((a,b)=>maStat(s,'fr',b.i).v-maStat(s,'fr',a.i).v);
ok(L.length>=2,'французских марок для сделки: '+L.length+' — '+L.map(o=>o.cp.n).join(', '));
// 2. ответ сразу: мало — «мало», почти — своя цена, достаточно — «по рукам»
{const t=L[0],d={st:0.51,mode:'sub',pay:'cash'},Q=maAsk(s,'fr',t.i,d);ok(Q&&Q.R>0,'цена владельцев за 51% «'+t.cp.n+'»: '+money(Q.R));
  const a1=maAnswer(s,'fr',t.i,d,Q.R*0.5),a2=maAnswer(s,'fr',t.i,d,Q.R*0.9),a3=maAnswer(s,'fr',t.i,d,Q.R);
  ok(a1.k==='low'&&a2.k==='counter'&&a2.ask>=Q.R&&a3.k==='yes','ответы: '+a1.k+' / '+a2.k+' ('+money(a2.ask)+') / '+a3.k);
  // 3. дочерняя компания: своя марка на рынке, ваши — доля и дивиденды
  const c0=s.cash,h=maClose(s,'fr',t.i,d,Q.R);ok(h&&h.mode==='sub'&&Math.abs(h.st-0.51)<1e-6&&s.cash<c0,'куплено 51% — дочерняя компания');
  ok(compSplit('fr','middle',s,1000).some(o=>o.i===t.i)||compSplit('fr','people',s,1000).some(o=>o.i===t.i)||compSplit('fr','lux',s,1000).some(o=>o.i===t.i),'дочерняя марка остаётся на рынке со своими машинами');
  const row=sharesData(s,'fr').L.find(r=>r.sub);ok(row&&!row.you&&Math.abs(row.sub-0.51)<1e-6,'в долях рынка — отдельной строкой «ваши 51%»: '+(row&&row.n));
  ok(SEGK.every(g=>boughtShare('fr',g,s)===0),'её покупатели не записаны в ваши');
  let div=0;for(let k=0;k<6;k++){s.pending=[];s.pending=[];step();div+=s.last.div||0;}ok(div>0&&(h.divY||0)>0,'дивиденды за полгода: '+money(div));
  ok(/Ваши компании/.test(holdingsHTML(s))&&/Вложить/.test(holdingsHTML(s)),'карточка «Ваши компании»: вложить, докупить, продать');}
// 4. поглощение: марки больше нет, её покупатели — ваши
{const u=L.find(o=>!holdOf(s,'fr',o.i));if(u){const d={st:1,mode:'int',pay:'cash'},Q=maAsk(s,'fr',u.i,d);s.cash=Math.max(s.cash,Q.R*2+maIntCost(s,maStat(s,'fr',u.i))*2);
  const h=maClose(s,'fr',u.i,d,Q.R);ok(h&&acqHas(s,'fr',u.i),'поглощение «'+u.cp.n+'» под ваш бренд');
  ok(!compSplit('fr','middle',s,1000).some(o=>o.i===u.i),'поглощённая марка больше не конкурент');
  ok(SEGK.some(g=>boughtShare('fr',g,s)>0),'её покупатели переходят к вам');}}
// 5. торги после банкротства
{const w=(COMPS.fr||[]).map((cp,i)=>({cp,i})).find(o=>!holdOf(s,'fr',o.i)&&!dealBlock(s,'fr',o.i));if(w){s.pending=[];aucStart(s,'fr',w.i,{who:'кредиторы',kind:'bankrupt'});
  ok(s.auc&&s.auc.c==='fr'&&s.auc.start>0,'торги «'+s.auc.nm+'»: старт '+money(s.auc.start));ok(s.pending.length>0,'новость о торгах');
  const h=aucFinish(s,true,s.auc.start*1.2,'sub');ok(h&&h.how==='auction','выиграли торги — марка ваша ('+(h&&h.mode)+')');}}
// 6. предложения к вам: за два года хоть одно (марка ищет покупателя, финансист, слияние, торги)
{let n=0;const save=Math.random;for(let k=0;k<24;k++){s.pending=[];Math.random=()=>0.01;try{maInbound(s);}catch(e){console.log(e);}Math.random=save;if(s.pending.length||s.auc)n++;s.auc=null;s.pending=[];step();}
  ok(n>0,'предложений к вам за два года: '+n);}
console.log(fails?'FAILED '+fails:'ALL OK');
`);
