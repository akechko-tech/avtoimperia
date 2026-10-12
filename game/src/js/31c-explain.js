/* ================= 0.34: «КАК ПОСЧИТАНО» — маленькое всплывающее окно-таблица =================
   Отзыв: «нужна подсказка, как посчитан тот или иной параметр — надёжность, комфорт новой модели; не длинным листом,
   а небольшим всплывающим окном-таблицей». Тап по строке черты (или по ⓘ) в конструкторе, карточке модели и карточке
   легенды, по итогу «против соперника» и по себестоимости открывает окно: из чего сложилась цифра у вас и у соперника
   класса и во сколько раз каждая строка меняет итог. Произведение множителей всегда равно показанному проценту: если
   формулу в 16-carstats.js / 10-model.js поменяют, а разбор здесь нет, разница уйдёт в строку «прочее»
   (test/explain34.js проверяет, что её нет). */
const xn=(x,d)=>(isFinite(x)?x:0).toFixed(d).replace('.',',');
const xk=f=>'×'+xn(f,2);
const xpc=f=>Math.round(f*100)+'%';
function xStar(S,id){const u=S.U(id);return u>0.04?' ★'+xn(u,Math.abs(u-Math.round(u))<0.05?0:1):'';}
// одна сторона сравнения: ваша машина или соперник класса (у соперника ★ — его доработка по годам)
function xSide(md,y){const p=parts(md),U=id=>upgOf(md,id),st=carBase(md,0,y),truck=!!p.b.truck,pay=truck?(p.b.pay||1)*(1+0.05*U(p.b.id)):0;
  return {md,p,U,st,truck,pay,mass:st.kg+pay*500,eff:p.g.eff*(1+0.01*U(p.g.id)),kc:kitCarK(md),mo:!!p.b.moto};}
// строка таблицы: va, vr — множители черты у вас и у соперника; e — степень; ta, tr — что показать (текст или функция значения)
function xRow(l,va,vr,e,ta,tr,sa,sr){const f=t=>typeof t==='function'?t:null,fa=f(ta),fr=f(tr)||fa;
  return {l,va,vr,f:Math.pow(va/vr,e),ta:fa?fa(va):ta,tr:fr?fr(vr):(tr==null?ta:tr),sa:sa||'',sr:sr||''};}
const X_TRIM={t0:'базовое',t1:'комфорт',t2:'люкс',t3:'спортивное'};
function xPartName(mo,k){return mo?({e:'Мотор',g:'Передача',c:'Рама и вилка',w:'Шины',k:'Тормоз',b:'Седло или коляска'})[k]:({e:'Мотор',g:'Коробка',c:'Рама',w:'Шины',k:'Тормоза',b:'Кузов'})[k];}
// надёжность деталей (доля машин без серьёзной поломки) — множители, как в carBase
function xRelParts(S){const p=S.p,cm=chassisMax(p.c,S.md),load=p.e.hp/Math.max(1,cm);
  return {e:p.e.rel*(1+0.02*S.U(p.e.id)),g:p.g.relK*(1+0.01*S.U(p.g.id)),dur:1.02-0.06*clamp(load-0.5,0,0.5),w:1-0.03*(p.w.punct||0),t:p.t.id==='t3'?0.98:1,kit:S.kc?S.kc.rel:1,op:overpower(S.md)?0.75:1,cm};}
// строки черты k (кроме надёжности — у неё своя таблица): произведение множителей = отношение черты к сопернику
function xCharRows(k,A,R){const a=A.p,r=R.p,nm=(S,x)=>x.name+xStar(S,x.id),L=[],P=c=>xPartName(A.mo,c);
  if(k==='perf'){
    L.push(xRow(P('e'),A.st.hp,R.st.hp,1,v=>xn(v,v<10?1:0)+' л.с.',null,nm(A,a.e),nm(R,r.e)));
    L.push(xRow(P('g'),A.eff,R.eff,1,v=>'КПД '+Math.round(v*100)+'%',null,nm(A,a.g),nm(R,r.g)));
    L.push(xRow(A.truck?'Масса с полгрузом':'Масса',A.mass,R.mass,-1,v=>fmtN(v)+' кг'));}
  else if(k==='comf'){const sm=S=>({1:0.75,2:0.85,4:1,6:1.15,8:1.25}[S.p.e.cyl]||1)*(S.p.e.sleeve?1.1:1),TK={t0:1,t1:1.25,t2:1.6,t3:0.95},cy=e=>(e.cyl||1)+' цил.'+(e.sleeve?', гильзы':'');
    L.push(xRow(A.mo?P('c'):'Рама и рессоры',a.c.ride*(1+0.03*A.U(a.c.id)),r.c.ride*(1+0.03*R.U(r.c.id)),1,v=>'ход '+Math.round(v*100),null,nm(A,a.c),nm(R,r.c)));
    L.push(xRow(P('w'),(a.w.ride||1)*(1+0.02*A.U(a.w.id)),(r.w.ride||1)*(1+0.02*R.U(r.w.id)),1,xk,null,nm(A,a.w),nm(R,r.w)));
    L.push(xRow(P('b'),(a.b.comf||1)*(1+0.04*A.U(a.b.id)),(r.b.comf||1)*(1+0.04*R.U(r.b.id)),1,xk,null,nm(A,a.b),nm(R,r.b)));
    L.push(xRow('Мотор: плавность',sm(A),sm(R),1,xk,null,cy(a.e),cy(r.e)));
    if(!A.mo)L.push(xRow('Оснащение',TK[a.t.id]||1,TK[r.t.id]||1,1,xk,null,X_TRIM[a.t.id]||'',X_TRIM[r.t.id]||''));}
  else if(k==='ease'){
    L.push(xRow(P('g'),a.g.ease*(1+0.04*A.U(a.g.id)),r.g.ease*(1+0.04*R.U(r.g.id)),1,xk,null,nm(A,a.g),nm(R,r.g)));
    L.push(xRow(P('k')+': педаль',0.6+0.4*a.k.ease,0.6+0.4*r.k.ease,1,xk,null,nm(A,a.k),nm(R,r.k)));
    if(a.w.solid||r.w.solid)L.push(xRow('Литые шины',a.w.solid?0.85:1,r.w.solid?0.85:1,1,xk,null,nm(A,a.w),nm(R,r.w)));
    L.push(xRow(A.truck?'Масса с полгрузом':'Масса',1000/Math.max(500,A.mass),1000/Math.max(500,R.mass),0.2,fmtN(A.mass)+' кг',fmtN(R.mass)+' кг'));}
  else if(k==='safe'){
    L.push(xRow(P('k'),A.st.brk,R.st.brk,1,v=>'сила '+Math.round(v*100),null,nm(A,a.k),nm(R,r.k)));
    L.push(xRow(P('w')+': сцепление',A.st.grip,R.st.grip,1,v=>'×'+xn(v,2),null,nm(A,a.w),nm(R,r.w)));
    if(a.b.closed||r.b.closed)L.push(xRow('Закрытый кузов',a.b.closed?1.12:1,r.b.closed?1.12:1,1,v=>v>1?'да':'нет'));}
  else if(k==='econ'){const mt=S=>1/Math.max(0.01,1-S.st.rel);
    L.push(xRow(P('e')+': расход',a.e.fuel,r.e.fuel,-0.8,v=>'расход '+Math.round(v*100),null,nm(A,a.e),nm(R,r.e)));
    L.push(xRow(A.truck?'Масса с полгрузом':'Масса',A.mass,R.mass,-0.48,v=>fmtN(v)+' кг'));
    L.push(xRow(P('g'),A.eff,R.eff,0.8,v=>'КПД '+Math.round(v*100)+'%',null,nm(A,a.g),nm(R,r.g)));
    L.push(xRow(P('w')+': ресурс',(a.w.life||300)*(1+0.1*A.U(a.w.id)),(r.w.life||300)*(1+0.1*R.U(r.w.id)),0.05,v=>fmtN(v)+' км',null,nm(A,a.w),nm(R,r.w)));
    L.push(xRow('Ремонт',mt(A),mt(R),0.1,v=>'ломается '+Math.round(100/v)+' из 100'));}
  else if(k==='cap'){
    if(A.truck||R.truck)L.push(xRow('Груз',A.pay||0.01,R.pay||0.01,1,v=>xn(v,1)+' т',null,nm(A,a.b),nm(R,r.b)));
    else L.push(xRow('Места',a.b.seats||2,r.b.seats||2,1,v=>String(v),null,nm(A,a.b),nm(R,r.b)));}
  return L;}
/* ---------- окно черты: таблица, итог, совет ---------- */
// md — ваша машина (из конструктора, карточки модели или легенды); draftTip — подсказать лучшую замену детали
function xCharData(md,s,k){const y=s.y,C=classCompare(md,s,s.country),A=xSide(md,y),R=xSide(C.ref.md,y),LC=md.legend?legendCh(md):null,out={k,C,A,R,rows:[],extra:[]};
  if(k==='rel'){const fa=xRelParts(A),fr=xRelParts(R),pa=A.st.rel,pr=R.st.rel,nm=(S,x)=>x.name+xStar(S,x.id),a=A.p,r=R.p,P=c=>xPartName(A.mo,c);
    const row=(l,va,vr,t,sa,sr)=>({l,va,vr,ta:t(va),tr:t(vr),sa:sa||'',sr:sr||'',rel:1});
    out.rows.push(row(P('e'),fa.e,fr.e,v=>xpc(v),nm(A,a.e),nm(R,r.e)));
    out.rows.push(row(P('g'),fa.g,fr.g,xk,nm(A,a.g),nm(R,r.g)));
    out.rows.push(row('Рама: запас',fa.dur,fr.dur,xk,`${Math.round(a.e.hp)} из ${Math.round(fa.cm)} л.с.`,`${Math.round(r.e.hp)} из ${Math.round(fr.cm)} л.с.`));
    if(fa.w!==1||fr.w!==1)out.rows.push(row(P('w')+': проколы',fa.w,fr.w,xk,nm(A,a.w),nm(R,r.w)));
    if(fa.t!==1||fr.t!==1)out.rows.push(row('Спортивная настройка',fa.t,fr.t,xk));
    if(fa.kit!==1)out.rows.push(row('Оснащение КБ',fa.kit,fr.kit,xk));
    if(fa.op!==1||fr.op!==1)out.rows.push(row('Рама не держит мотор',fa.op,fr.op,xk));
    const dv=typeof dvFail==='function'?dvFail(md):1;
    const ma=1/Math.max(0.01,1-pa),mr=1/Math.max(0.01,1-pr);let tot=Math.sqrt(ma/mr);
    out.relSum={pa,pr,dv,fa:100*(1-pa),fr:100*(1-pr)};
    if(LC&&LC.rel){tot*=LC.rel;out.extra.push({l:'Легенда марки',f:LC.rel,ta:xk(LC.rel),tr:'—'});}
    out.tot=tot;}
  else{out.rows=xCharRows(k,A,R);let tot=out.rows.reduce((a,r)=>a*r.f,1);
    if(LC&&LC[k]){tot*=LC[k];out.extra.push({l:'Легенда марки',f:LC[k],ta:xk(LC[k]),tr:'—'});}
    out.tot=tot;}
  // предел сравнения (×0,25…×4) и сверка с расчётом игры: «прочее» — если разбор разошёлся с формулой
  const by=C.by[k],cl=clamp(out.tot,0.25,4);if(Math.abs(cl/out.tot-1)>1e-9)out.extra.push({l:'Предел сравнения',f:cl/out.tot,ta:xk(cl/out.tot),tr:''});
  const rest=by/cl;if(Math.abs(rest-1)>0.002)out.extra.push({l:'Прочее',f:rest,ta:xk(rest),tr:'',rest:1});
  out.by=by;return out;}
// грузовик фирмы выбирают по цене тонно-километра (105-market.js, truckMarket): привлекательность для фирм по видам перевозок при цене P
// (совет сравнивает детали при одной цене: лучше ли машина для фирм, а не дороже ли она)
function xTruckU(md,s,P){const c=s.country,PT=prefP('truck',c,s),sh=truckUseSh(c,s);let U=0;
  TUSE.forEach(u=>{if(sh[u]<=0)return;const ref=truckRef(u,s.y),Pref=PT*payK(ref),cR=truckCost(ref,u,c,s,Pref).cpk,cp=truckCost(md,u,c,s,P).cpk;
    U+=sh[u]*Math.exp(-BTC*Math.log(cp/cR)-TRUCK_USE[u].bp*Math.log(P/Pref)+TQ*truckSoft(md,ref,s.y));});return U;}
// лучшая замена одной детали для черты k (или для итога 'S') — из тех, что можно поставить сейчас; итог (у грузовика — выбор фирм) не хуже
function xBestSwap(md,s,k){const mo=isMoto(md),rk=rivalKind(md),sg=segOf(md),C0=classCompare(md,s,s.country),base=k==='S'?C0.S:C0.by[k],S0=C0.S,p0=parts(md),tr=isTruck(md),P0=tr?refPrice(md,s):0,T0=tr?xTruckU(md,s,P0):0;let best=null;
  PART_CATS.forEach(cat=>{unlockedP(cat.arr(),s,mo).forEach(x=>{if(x.id===md[cat.k])return;const md2={...md,[cat.k]:x.id};
    if(rivalKind(md2)!==rk||segOf(md2)!==sg)return;if(cat.k==='b'&&!mo&&rk!=='truck'&&rk!=='van'&&(x.truck||(sg==='sport'&&!bodyOpen(x.id))))return;
    let v;try{const C=classCompare(md2,s,s.country);if(k!=='S'&&C.S<S0*0.99)return;if(tr&&xTruckU(md2,s,P0)<T0*0.99)return;v=k==='S'?C.S:C.by[k];}catch(_){return;}
    if(v>base*1.01&&(!best||v>best.v))best={ck:cat.k,x,v,dc:partCost(x,s)-partCost(p0[cat.k],s),op:overpower(md2)};});});
  return best;}
function xTipHTML(md,s,k,mo){const b=xBestSwap(md,s,k);
  if(!b)return `<p class="xp-tip muted">${k==='S'?'Лучше деталей, чем у вас, сейчас нет':'Поднять эту черту, не потеряв в итоге, другой деталью сейчас нельзя'}: помогут улучшения ★ в КБ.</p>`;
  return `<p class="xp-tip">▲ Больше всего ${k==='S'?'поднимет итог':'поднимет'}: ${xPartName(mo,b.ck).toLowerCase()} «${esc(b.x.name)}» — до <b class="good">${xpc(b.v)}</b>${Math.abs(b.dc)>=1?` <span class="muted">(${b.dc>0?'+':'−'}${money(Math.abs(b.dc))} к себестоимости)</span>`:''}${b.op?' <span class="bad">— но рама его не держит</span>':''}</p>`;}
const X_WHAT={perf:'Лошадиные силы на тонну: мощность мотора с потерями в передаче, делённая на массу.',
  rel:'Надёжность деталей перемножается: это доля машин без серьёзных поломок. Покупатель сравнивает, как часто машина ломается.',
  comf:'Перемножаются плавность хода рамы, шин и кузова, плавность мотора и оснащение.',
  ease:'Лёгкость коробки, педаль тормоза и вес машины (тяжёлой труднее править).',
  safe:'Сила тормозов, умноженная на сцепление шин; закрытый кузов — ещё +12%.',
  econ:'Расход бензина (мотор, масса, КПД передачи), ресурс шин и ремонт.',
  cap:'Сколько мест (у грузовика — сколько тонн груза).'};
function xpopTable(rows,extra,rn,tot,totTxt,preTot){const tone=f=>f>1.005?'good':f<0.995?'bad':'muted';
  // деталь у вас и у соперника — отдельной строкой под цифрами (только если детали разные): цифры не теснятся
  const relT=r=>r.ta===r.tr?['muted','=']:r.va>r.vr?['good','лучше']:['bad','хуже'];
  const tr=r=>{const sub=r.sa!==r.sr&&(r.sa||r.sr),[rc,rt]=r.rel?relT(r):[tone(r.f),xk(r.f)];
    return `<tr${sub?' class="xp-has"':''}><td>${esc(r.l)}</td><td>${esc(String(r.ta))}</td><td>${esc(String(r.tr))}</td><td class="${rc}">${rt}</td></tr>${sub?`<tr class="xp-sub"><td colspan="4">вы: ${esc(r.sa||'—')} · ${esc(rn)}: ${esc(r.sr||'—')}</td></tr>`:''}`;};
  return `<table class="xp-t"><tr><th></th><th>Вы</th><th>${esc(rn)}</th><th>→</th></tr>${rows.map(tr).join('')}${preTot||''}${extra.map(r=>`<tr${r.rest?' class="muted"':''}><td>${esc(r.l)}</td><td>${esc(r.ta)}</td><td>${esc(r.tr||'')}</td><td class="${tone(r.f)}">${xk(r.f)}</td></tr>`).join('')}
    <tr class="xp-tot"><td>Итого</td><td colspan="2">${totTxt||''}</td><td class="${tot>=1.05?'good':tot<0.95?'bad':'muted'}">${xpc(tot)}</td></tr></table>`;}
function xpopChar(md,s,k,tip){const D=xCharData(md,s,k),C=D.C,w=C.W[k]||0,mo=isMoto(md),rn=C.ref.name;
  const imp=w>0?`для покупателей класса «${esc(KIND_NAME[rivalKind(md)])}» — ${Math.round(w*100)}% оценки ${wDots(w)}`:`покупателям класса «${esc(KIND_NAME[rivalKind(md)])}» не важно`;
  let body;
  if(k==='rel'){const R=D.relSum,ratio=R.fa/Math.max(0.01,R.fr);
    const pre=`<tr class="xp-sum"><td>Без поломок</td><td>${xpc(R.pa)}${R.dv>1.001?`<small class="bad">не по ТЗ: поломок ×${xn(R.dv,1)}</small>`:''}</td><td>${xpc(R.pr)}</td><td></td></tr><tr class="xp-sum"><td>Ломается из 100</td><td>${Math.round(R.fa)}</td><td>${Math.round(R.fr)}</td><td></td></tr>`;
    const why=ratio>1.02?`ломается в ${xn(ratio,1)} раза чаще → 1/√${xn(ratio,1)}`:ratio<0.98?`ломается в ${xn(1/ratio,1)} раза реже → √${xn(1/ratio,1)}`:'ломается так же часто';
    body=xpopTable(D.rows,D.extra,rn,D.by,`<small>${why}</small>`,pre);}
  else body=xpopTable(D.rows,D.extra,rn,D.by,'');
  return `<div class="xp-h"><b>${CHAR_NAMES[k]} · <span class="${D.by>=1.05?'good':D.by<0.95?'bad':''}">${xpc(D.by)}</span></b><button class="iconbtn xp-x" data-act="xpopClose" aria-label="Закрыть">×</button></div>
    <p class="xp-w">${X_WHAT[k]} ${k==='rel'?'':'Справа — во сколько раз строка меняет итог; итог — их произведение.'} <span class="muted">${imp}.</span></p>
    ${body}${tip?xTipHTML(md,s,k,mo):''}`;}
/* ---------- итог «против соперника»: вклад каждой черты по её важности ---------- */
function xScoreData(md,s){const C=classCompare(md,s,s.country),L=[];
  CHAR_K.forEach(k=>{if(!C.W[k])return;L.push({l:CHAR_NAMES[k],sa:wDots(C.W[k])+' '+Math.round(C.W[k]*100)+'%',ta:xpc(C.by[k]),f:Math.pow(C.by[k],C.W[k]),k});});
  const X=[];if(segOf(md)==='lux'){let lo=0;CHAR_K.forEach(k=>{if(C.W[k]>0.05)lo=Math.min(lo,Math.log(C.by[k]));});if(lo<0)X.push({l:'Люкс без слабых мест',sa:'худшая черта тянет вниз',f:Math.exp(0.35*lo)});}
  const q=bn('quality');if(Math.abs(q-1)>1e-9)X.push({l:'Конструктор-основатель',f:q});
  if(overpower(md))X.push({l:'Рама не держит мотор',f:0.85});
  const la=md.legend?legendK(md,'appeal'):1;if(Math.abs(la-1)>1e-9)X.push({l:'Имя легенды',f:la});
  const prod=L.concat(X).reduce((a,r)=>a*r.f,1),rest=C.S/prod;if(Math.abs(rest-1)>0.002)X.push({l:'Прочее',f:rest,rest:1});
  return {C,L,X,S:C.S};}
function xpopScore(md,s,tip){const D=xScoreData(md,s),tone=f=>f>1.005?'good':f<0.995?'bad':'muted',qt=qLabel(D.S)[1];
  return `<div class="xp-h"><b>Итог против соперника · <span class="${qt}">${xpc(D.S)}</span></b><button class="iconbtn xp-x" data-act="xpopClose" aria-label="Закрыть">×</button></div>
    <p class="xp-w">Покупатели класса сравнивают каждую черту с ${esc(D.C.ref.name)} и взвешивают по важности: множитель черты — её процент в степени её веса. Итог — произведение. <span class="muted">Ниже 85% — «хуже соперников», выше 108% — «лучше».</span></p>
    <table class="xp-t"><tr><th></th><th>Вес</th><th>Черта</th><th>→</th></tr>${D.L.map(r=>`<tr><td>${esc(r.l)}</td><td>${r.sa.replace(/^(\S+) /,'<span class="xp-dots">$1</span> ')}</td><td class="${r.f>1.005?'good':r.f<0.995?'bad':''}">${r.ta}</td><td class="${tone(r.f)}">${xk(r.f)}</td></tr>`).join('')}
    ${D.X.map(r=>`<tr${r.rest?' class="muted"':''}><td>${esc(r.l)}</td><td colspan="2">${r.sa?`<small>${esc(r.sa)}</small>`:''}</td><td class="${tone(r.f)}">${xk(r.f)}</td></tr>`).join('')}
    <tr class="xp-tot"><td>Итого</td><td colspan="2"></td><td class="${qt}">${xpc(D.S)}</td></tr></table>${isTruck(md)?xTruckHTML(md,s):''}${tip?xTipHTML(md,s,'S',isMoto(md)):''}`;}
function xTruckHTML(md,s){const c=s.country,P=md.price||refPrice(md,s),PT=prefP('truck',c,s),sh=truckUseSh(c,s),tone=f=>f>1.005?'good':f<0.995?'bad':'muted';
  const rows=TUSE.filter(u=>sh[u]>0.005).map(u=>{const ref=truckRef(u,s.y),cR=truckCost(ref,u,c,s,PT*payK(ref)).cpk,cM=truckCost(md,u,c,s,P).cpk,f=cR/cM;
    return `<tr><td>${esc(TRUCK_USE[u].n)}</td><td>${cpkTxt(cM)}</td><td>${cpkTxt(cR)}</td><td class="${tone(f)}">${xk(f)}</td></tr>`;}).join('');
  return `<p class="xp-w" style="margin-top:8px">Грузовик фирмы покупают по цене тонно-километра — машина за годы службы, ремонт, бензин, шофёр; этот итог задаёт лишь «типичную цену».</p><table class="xp-t"><tr><th>Тонно-км</th><th>Вы</th><th>Соперники</th><th>→</th></tr>${rows}</table>`;}
/* ---------- себестоимость: детали по прайсу, скидки, объём и опыт, работа ---------- */
function xCostData(md,s){const p=parts(md),tc=s.tech||{},mo=isMoto(md),L=[];let base=0;
  PART_KEYS.forEach(k=>{const x=p[k],c=partCost(x,s)*(1+0.03*upgOf(md,x.id));base+=c;L.push({l:xPartName(mo,k),s:x.name+(upgL(x.id)?' ★'+upgL(x.id):''),v:c});});
  const tr=p.t.c*cpi(s);if(tr>0.5){base+=tr;L.push({l:'Оснащение',s:X_TRIM[p.t.id]||'',v:tr});}
  const eq=typeof eqCost==='function'?eqCost(md,s):0;if(eq>0.5){base+=eq;L.push({l:'Новинки оснащения',s:eqOf(md).map(id=>(EQ_BY[id]||{}).name||'').filter(Boolean).join(', '),v:eq});}
  const D=[];let c=base;
  if(tc.foundry){const d=partCost(p.e,s)*0.18;c-=d;D.push({l:'Своя литейка',s:'мотор −18%',v:-d});}
  if(tc.press&&!isTruck(md)){const d=partCost(p.b,s)*0.15;c-=d;D.push({l:'Кузовной пресс',s:'кузов −15%',v:-d});}
  const M=[],vol=modelVol(md),mul=(l,f,sub)=>{if(Math.abs(f-1)>0.004)M.push({l,s:sub||'',f});return f;};
  const K=mul('Объём',volFactor(vol,s),`≈ ${fmtD(vol)} в месяц: ${volFactor(vol,s)>1?'мало — поставщики берут дороже':'скидка поставщиков'}`)*mul('Опыт',learn(md),`сделано ${fmtN(md.made||0)}`)*mul('Основатель',bn('matCost'))
    *mul('Перебои поставок',s.supplyNow||1)*mul('Цены на сталь',worldMat(s))*mul('Легенда',md.legend?legendK(md,'cost'):1)*mul('Свои поставщики',typeof supK==='function'?supK(s):1);
  const mat=Math.max(10,c*K),h=hoursPerCar(md,s),hw=hoursPerWorker(s),wg=wageNow(s),lab=h/hw*wg,uc=unitCost(md,s),rest=uc-(mat+lab);
  return {L,base,D,M,mat,h,hw,wg,lab,uc,rest};}
function xpopCost(md,s){const D=xCostData(md,s),mo=isMoto(md),row=(l,sub,v,cls)=>`<tr${cls?` class="${cls}"`:''}><td>${esc(l)}${sub?`<small>${esc(sub)}</small>`:''}</td><td>${v}</td></tr>`;
  return `<div class="xp-h"><b>Себестоимость · ${money(D.uc)}</b><button class="iconbtn xp-x" data-act="xpopClose" aria-label="Закрыть">×</button></div>
    <p class="xp-w">Детали по ценам поставщиков, скидки за объём и опыт — и работа: часы на ${mo?'мотоцикл':'машину'} по зарплате эпохи.</p>
    <table class="xp-t xp-c">${D.L.map(r=>row(r.l,r.s,money(r.v))).join('')}
    ${row('Детали по прайсу','',money(D.base),'xp-sum')}
    ${D.D.map(r=>row(r.l,r.s,'−'+money(-r.v))).join('')}${D.M.map(r=>row(r.l,r.s,`<span class="${r.f<1?'good':'bad'}">${xk(r.f)}</span>`)).join('')}
    ${row('Материалы','',money(D.mat),'xp-sum')}
    ${row('Работа',`${fmtN(D.h)} ч — ${xn(D.h/D.hw,1)} мес. рабочего × ${money(D.wg)} в месяц`,money(D.lab))}
    ${Math.abs(D.rest)>=1?row('Прочее','',money(D.rest),'muted'):''}
    ${row('Итого','',money(D.uc),'xp-tot')}</table>`;}
/* ---------- окно: рядом со строкой, в пределах экрана; закрывается тапом мимо, ×, прокруткой ---------- */
let XPOP_SC=null;   // прокрутка при открытии: окно закрывается, когда лист или страницу заметно прокрутили
function xpopClose(){const a=document.getElementById('xpop'),b=document.getElementById('xpopBg');if(a&&a.remove)a.remove();if(b&&b.remove)b.remove();XPOP_SC=null;}
function xpopScroll(){if(!XPOP_SC)return;const t=(typeof sb!=='undefined'&&sb?sb.scrollTop:0),w=window.scrollY||0;if(Math.abs(t-XPOP_SC[0])>24||Math.abs(w-XPOP_SC[1])>24)xpopClose();}
function xpopShow(html,anchor){xpopClose();const bg=document.createElement('div');bg.id='xpopBg';bg.className='xpop-bg';bg.addEventListener('click',e=>{e.stopPropagation();xpopClose();});
  const el=document.createElement('div');el.id='xpop';el.className='xpop';el.setAttribute('role','dialog');el.innerHTML=html;document.body.appendChild(bg);document.body.appendChild(el);
  const vw=window.innerWidth,vh=window.innerHeight,w=el.offsetWidth,h=el.offsetHeight,r=anchor&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;
  let left=(vw-w)/2,top=(vh-h)/2;
  if(r){left=clamp(r.left+r.width/2-w/2,8,Math.max(8,vw-w-8));top=r.bottom+6+h<=vh-8?r.bottom+6:r.top-6-h>=8?r.top-6-h:Math.max(8,(vh-h)/2);}
  el.style.left=Math.round(left)+'px';el.style.top=Math.round(top)+'px';XPOP_SC=[typeof sb!=='undefined'&&sb?sb.scrollTop:0,window.scrollY||0];}
// какая машина: 'd' — проект в конструкторе, 'L:…' — легенда, число — модель
function xMdOf(id){const s=G;if(!s)return null;if(id==='d')return draft&&!draft.ng&&!draft.legendDraft?designMd(s,draft):null;
  if(String(id).startsWith('L:')){const L=LEGEND_BY[String(id).slice(2)];return L?legendModel(s,L):null;}return s.models.find(m=>m.id===+id)||null;}
const XP_ACT={
  chx:(d,el)=>{const md=xMdOf(d.id);if(!md)return;const tip=d.id==='d';let h='';try{h=d.k==='S'?xpopScore(md,G,tip):d.k==='cost'?xpopCost(md,G):xpopChar(md,G,d.k,tip);}catch(e){console.warn('explain',e);return;}xpopShow(h,el);},
  xpopClose:()=>xpopClose()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')xpopClose();});
if(typeof sb!=='undefined'&&sb)sb.addEventListener('scroll',xpopScroll,{passive:true});window.addEventListener('scroll',xpopScroll,{passive:true});
window.addEventListener('resize',()=>xpopClose());
