// 0.34: «как посчитано» — разбор черт, итога и себестоимости сходится с расчётом игры (нет строки «прочее»)
// на сотнях конструкций: все классы машин и мотоциклов, разные годы и страны, улучшения ★, «не по ТЗ», легенды.
// node game/test/explain34.js
require('./harness.js')(`
Math.random=(()=>{let a=4242;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;if(fails<15)console.log('  FAIL '+m);}};
const KINDS=['people','middle','lux','sport','van','truck','moto','moside'];
for(const [pio,c,y] of [['ford','us',1903],['renault','fr',1910],['custom','de',1920],['agnelli','it',1926],['custom','uk',1914]]){
  newGame(pio,c,'Т','normal');const s=G;s.y=y;s.m=5;s.cash=1e7;s.rd.lvl=4;
  // улучшения ★ на нескольких деталях — у игрока свои, у соперника свои
  ['e1','e3','g2','c2','w2','k2','b3','e5','c4','me2'].forEach((id,i)=>{s.rd.upg=s.rd.upg||{};s.rd.upg[id]=1+i%5;});
  for(const kind of KINDS){
    if(isMotoSeg(kind)&&y<1897)continue;
    for(let n=0;n<14;n++){const md={...rivalDesign(kind,y),name:'X'+n,id:900+n};
      // случайные замены деталей из доступных (как в конструкторе): класс не меняется
      PART_CATS.forEach(cat=>{if(Math.random()<0.6){const L=unlockedP(cat.arr(),s,isMotoSeg(kind)).filter(x=>{const m2={...md,[cat.k]:x.id};return rivalKind(m2)===rivalKind(md)&&segOf(m2)===segOf(md);});if(L.length)md[cat.k]=L[Math.floor(Math.random()*L.length)].id;}});
      if(n%5===3)md.dv={e:{k:0.85,t:mi(s)-2,sev:0.8},w:{k:0.9,t:mi(s)-1,sev:0.5}};
      if(n%7===5&&!isMotoSeg(kind)){const L=Object.values(LEGEND_BY).find(x=>x.kind===kind&&x.y<=y);if(L)md.legend=L.id;}
      md.vol=5+Math.floor(Math.random()*2000);md.made=Math.floor(Math.random()*5000);md.status='prod';md.price=1000;
      const C=classCompare(md,s,s.country);
      for(const k of CHAR_K){const D=xCharData(md,s,k),rest=D.extra.find(r=>r.rest);
        ok(!rest,y+' '+c+' '+kind+' '+k+': разбор '+D.tot.toFixed(4)+' против '+C.by[k].toFixed(4)+' ('+[md.e,md.g,md.c,md.k,md.b,md.w,md.t].join(',')+')');
        ok(Math.abs(D.by-C.by[k])<1e-12,'показанный процент равен расчёту');
        const h=xpopChar(md,s,k,n%2===0);ok(h.includes('Итого')&&!h.includes('undefined')&&!h.includes('NaN')&&!h.includes('null'),kind+' '+k+': окно без undefined/NaN');}
      const S=xScoreData(md,s);ok(!S.X.some(r=>r.rest),y+' '+kind+': итог разобран '+S.S.toFixed(4));
      const hs=xpopScore(md,s,true);ok(!hs.includes('undefined')&&!hs.includes('NaN'),'окно итога без undefined/NaN');
      const K=xCostData(md,s);ok(Math.abs(K.rest)<0.5,y+' '+kind+': себестоимость разобрана '+K.uc.toFixed(2)+' остаток '+K.rest.toFixed(3));
      const hc=xpopCost(md,s);ok(!hc.includes('undefined')&&!hc.includes('NaN'),'окно себестоимости без undefined/NaN');}}}
// лучшая замена действительно поднимает черту и не меняет класс
{newGame('renault','fr','Т','normal');const s=G;s.y=1912;const md={...rivalDesign('middle',1912),name:'T',id:950,vol:100,made:0,status:'prod',price:1000};
  const b=xBestSwap(md,s,'rel'),C=classCompare(md,s,s.country);ok(!b||b.v>C.by.rel,'совет: замена поднимает надёжность ('+(b?b.x.name+' '+b.v.toFixed(2):'нет')+')');
  const bs=xBestSwap(md,s,'S');ok(!bs||bs.v>C.S,'совет: замена поднимает итог');}
// кнопки-помощники конструктора: «Передовая модель» без устаревших деталей, тот же кузов; строка «что изменилось» без NaN —
// машины, грузовики, мотоциклы, разные годы и страны
for(const [pio,c,y] of [['ford','us',1903],['renault','fr',1910],['custom','de',1920],['agnelli','it',1926],['custom','uk',1914],['custom','us',1929]]){
  newGame(pio,c,'Т','normal');const s=G;s.y=y;s.m=5;s.cash=1e7;s.rd.lvl=4;s.pending=[];s.lines={car:true,moto:true};
  for(const kind of KINDS){openDesigner(kind);const b0=draft.b;ACT.dfront();const a=dNote&&dNote.txt||'';
    ok(draft.b===b0&&FRONT_KEYS.every(k=>!partObsolete(k,draft[k],s)),y+' '+c+' '+kind+': передовая — тот же кузов, без устаревших деталей ('+FRONT_KEYS.map(k=>draft[k]).join(' ')+')');
    ACT.dauto();const b=dNote&&dNote.txt||'',t=a+' | '+b;
    ok(a.startsWith('Передовая модель: ')&&b.startsWith('Детали для наибольшей прибыли: ')&&!/NaN|undefined|null|Infinity/.test(t),y+' '+c+' '+kind+': строка под кнопками — '+t);
    ok(!isTruck(draft)||/спрос фирм|менять нечего/.test(b),y+' '+kind+': у грузовика — спрос фирм');}}
console.log('проверок: '+checks+(fails?', ОШИБОК: '+fails:' — всё в порядке'));
`);
