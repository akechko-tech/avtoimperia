/* ================= ФИЛЬМ О ПЕРСОНАЖЕ: главы по настоящей истории, выбор в конце главы влияет на игру ================= */
// Семь глав на героя (25b-saga-a.js, 25c-saga-b.js): начало пути, первая машина, гонки, большой успех, война, кризис, 1929 год.
// Глава приходит, когда в игре наступил её момент (год, продажи, первая гонка…). Смотреть можно заново — во вкладке «Империя».
const SAGA={};
const BN_ADD={race:1,convEarly:1};
function sagaList(s){return SAGA[s.pioneer]||SAGA.custom||[];}
function sagaFill(t,s){const P=PIONEERS[s.pioneer]||PIONEERS.custom;return String(t||'').replace(/\{name\}/g,s.pioneer==='custom'?(s.hero||'Основатель'):P.name).replace(/\{co\}/g,s.company).replace(/\{city\}/g,(COUNTRIES[s.country]||{}).city||'').replace(/\{y\}/g,s.y);}
// Момент главы: год, первая машина, гонка, победа, продажи, война, кризис, 1929…
function sagaCond(s,w){const S=s.saga||{};
  if(w==='start')return true;
  if(w==='firstProd')return s.models.some(m=>m.id!==1&&(m.status==='prod'||m.status==='sale'))||mi(s)-(S.t0||0)>=10;
  if(w==='firstRace')return (s.raceLog||[]).length>0;
  if(w==='firstWin')return (s.raceLog||[]).some(r=>r.place===1);
  if(w==='cashLow')return s.cash<0;
  if(w==='war')return s.country==='us'?(s.y>1917||(s.y===1917&&s.m>=3)):(s.y>1914||(s.y===1914&&s.m>=7));
  if(w==='crisis')return s.y>=1920;
  if(w==='finale')return s.y>=1929;
  if(w==='tech:line')return ((s.tech||{}).line||0)>=1;
  if(w==='king')return (s.titles||[]).some(t=>/^king-/.test(t.id||''));
  const m=/^(y|sold|yearSold):(\d+)$/.exec(w);if(m){const v=+m[2];return m[1]==='y'?s.y>=v:m[1]==='sold'?totalSold(s)>=v:Math.max((s.peak||{}).year||0,s.yearSold||0)>=v;}
  return false;}
function sagaReady(s,ch){const W=Array.isArray(ch.when)?ch.when:[ch.when];if(W.every(w=>sagaCond(s,w)))return true;
  // запасной путь: глава не «застревает», если игрок не гоняется или продаёт мало — через три года после её даты она всё равно придёт
  return !W.includes('start')&&!W.includes('finale')&&ch.y>0&&s.y>=ch.y+3;}
// Проверка раз в месяц: не чаще одной главы в два месяца, по порядку
function sagaCheck(s){if(!s||s.over)return;const S=s.saga=s.saga||{seen:[],pick:{},last:-99,t0:mi(s)};if(!S.seen)S.seen=[];
  if(s.pending.some(p=>p.saga))return;if(S.seen.length&&mi(s)-S.last<2)return;
  const L=sagaList(s);for(let k=0;k<L.length;k++){const ch=L[k];if(S.seen.includes(ch.id))continue;if(!sagaReady(s,ch))continue;
    s.pending.push({saga:ch.id,title:'Фильм: '+ch.t,text:'',choices:[['Смотреть главу','saga']]});S.last=mi(s);return;}}
// Без экрана (проверки, автоигра): глава засчитывается с первым вариантом выбора
function sagaAuto(s,id){const ch=sagaList(s).find(c=>c.id===id),o=ch&&ch.o&&ch.o[0];if(o)sagaApply(s,o.fx);const S=s.saga=s.saga||{seen:[],pick:{}};if(!S.seen.includes(id))S.seen.push(id);S.pick=S.pick||{};if(o)S.pick[id]=0;
  const i=s.pending.findIndex(p=>p.saga===id);if(i>=0)s.pending.splice(i,1);}
/* ---------- что даёт выбор: деньги, репутация, временные бонусы, спрос, настроение пилотов ---------- */
const SAGA_B={lineCap:['Выпуск',1],quality:['Качество',1],workerEff:['Выработка рабочих',1],devTime:['Разработка',-1],devCost:['Стоимость разработки',-1],adEff:['Отдача рекламы',1],matCost:['Детали',-1],race:['Скорость в гонках',1],raceRep:['Слава побед',1],drvFee:['Гонорары пилотов',-1]};
function sagaMonths(n){return n>=24&&n%12===0?`${n/12} ${plural(n/12,'год','года','лет')}`:`${n} ${plural(n,'месяц','месяца','месяцев')}`;}
function sagaFxText(fx,s){const L=[];if(!fx)return '';
  if(fx.cash)L.push(`${fx.cash>0?'+':'−'}${money(Math.abs(fx.cash)*cpi(s))}`);
  if(fx.rep)L.push(`репутация ${fx.rep>0?'+':'−'}${Math.abs(fx.rep)}`);
  Object.entries(fx.b||{}).forEach(([k,[v,mo]])=>{const d=SAGA_B[k];if(!d)return;
    if(k==='race'){L.push(`скорость в гонках +${Math.round(v*100)}% на ${sagaMonths(mo)}`);return;}
    const pc=Math.round((v-1)*100);if(!pc)return;const good=pc*d[1]>0;
    L.push(k==='devTime'?`разработка ${pc<0?'быстрее':'медленнее'} на ${Math.abs(pc)}% (${sagaMonths(mo)})`:`${d[0].toLowerCase()} ${pc>0?'+':'−'}${Math.abs(pc)}% (${sagaMonths(mo)})`);});
  Object.entries(fx.seg||{}).forEach(([g,[v,mo]])=>{const pc=Math.round((v-1)*100);if(pc&&SEG[g])L.push(`спрос: ${SEG[g].name.toLowerCase()} класс ${pc>0?'+':'−'}${Math.abs(pc)}% (${sagaMonths(mo)})`);});
  if(fx.mood)L.push(`настроение пилотов ${fx.mood>0?'+':'−'}${Math.abs(fx.mood)}`);
  return L.join(' · ');}
function sagaApply(s,fx){if(!fx)return;const now=mi(s);
  if(fx.cash)s.cash+=Math.round(fx.cash*cpi(s));
  if(fx.rep)s.rep=clamp(s.rep+fx.rep,0,100);
  const B=s.sagaB=s.sagaB||{};Object.entries(fx.b||{}).forEach(([k,[v,mo]])=>{const o=B[k];if(o&&now<o.until){o.v=BN_ADD[k]?o.v+v:o.v*v;o.until=Math.max(o.until,now+mo);}else B[k]={v,until:now+mo};});
  const SG=s.sagaSeg=s.sagaSeg||{};Object.entries(fx.seg||{}).forEach(([g,[v,mo]])=>{const o=SG[g];if(o&&now<o.until){o.v*=v;o.until=Math.max(o.until,now+mo);}else SG[g]={v,until:now+mo};});
  if(fx.mood&&typeof moodAdd==='function')(s.drivers||[]).forEach(id=>moodAdd(s,id,fx.mood));}
// Бонусы глав действуют вместе с чертами героя (10-model.js: bn, segBonus)
function sagaBn(k,v){const S=G&&G.sagaB&&G.sagaB[k];if(!S||mi(G)>=S.until)return v;return BN_ADD[k]?v+S.v:v*S.v;}
function sagaSegK(g){const S=G&&G.sagaSeg&&G.sagaSeg[g];return S&&mi(G)<S.until?S.v:1;}
/* ---------- кинозал: титр главы, сцены с голосом, выбор, итог ---------- */
let SAGAP=null;
function sagaImg(key){const im=key&&IMG[key];return im&&im.src?im.src:'';}
function sagaPlay(id,replay){const s=G,L=sagaList(s),k=L.findIndex(c=>c.id===id),ch=L[k];if(!ch){if(!replay)sagaDone(id,-1);return;}
  sagaStop();const P=PIONEERS[s.pioneer]||PIONEERS.custom,el=document.createElement('div');el.className='sg';el.id='sagaScreen';
  el.innerHTML=`<div class="sg-bg"><img alt=""></div><div class="sg-shade"></div><div class="sg-bar top"></div><div class="sg-bar bot"></div>
    <div class="sg-body"></div><div class="sg-ctrl"><button class="sg-skip">Пропустить ▸▸</button></div>`;
  if(!el.querySelector||!el.querySelector('.sg-skip')){if(!replay)sagaAuto(s,id);return;}// без экрана (проверки)
  document.body.appendChild(el);SAGAP={id,ch,k,el,i:-1,replay:!!replay,timer:0,portrait:sagaImg(P.wiki)};
  el.querySelector('.sg-skip').onclick=()=>sagaQuestion();el.querySelector('.sg-body').onclick=()=>sagaNext();
  try{auInit();auReelFanfare();}catch(_){}
  sagaTitle();}
function sagaSetBg(src){const Q=SAGAP;if(!Q)return;const im=Q.el.querySelector('.sg-bg img');if(!src){Q.el.classList.add('noimg');im.removeAttribute('src');return;}
  Q.el.classList.remove('noimg');if(im.getAttribute('src')!==src){im.style.opacity=0;im.onload=()=>{im.style.opacity=1;};im.src=src;}
  // медленный наезд камеры по фото (каждый раз — в свою сторону)
  const a=Math.random()<0.5?-1:1;im.style.transition='none';im.style.transform=`scale(1.02) translate(${a*1.5}%,0)`;void im.offsetWidth;im.style.transition='transform 9s ease-out,opacity .8s';im.style.transform=`scale(1.14) translate(${-a*2}%,-1.5%)`;}
function sagaTitle(){const Q=SAGAP,s=G,ch=Q.ch,n=Q.k+1;
  sagaSetBg(sagaImg((ch.sc.find(x=>x.img)||{}).img)||Q.portrait);
  Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-title in"><div class="sg-kick">${esc(PIONEERS[s.pioneer]&&s.pioneer!=='custom'?PIONEERS[s.pioneer].name:sagaFill('{name}',s))} · фильм</div><div class="sg-ch">Глава ${n}</div><div class="sg-t">${esc(sagaFill(ch.t,s))}</div>${ch.y?`<div class="sg-y">${ch.y}</div>`:''}</div>`;
  clearTimeout(Q.timer);Q.timer=setTimeout(()=>sagaNext(),2600);}
function sagaNext(){const Q=SAGAP;if(!Q||Q.q)return;clearTimeout(Q.timer);ttsStop();Q.i++;const s=G,sc=Q.ch.sc[Q.i];if(!sc){sagaQuestion();return;}
  if(sc.img)sagaSetBg(sagaImg(sc.img)||Q.portrait);else if(Q.i===0)sagaSetBg(Q.portrait);
  const txt=sagaFill(sc.say||sc.line||'',s),who=sc.who?sagaFill(sc.who,s):'';
  Q.el.querySelector('.sg-body').innerHTML=sc.who?`<div class="sg-line in"><div class="sg-who">${esc(who)}</div><p>«${esc(txt.replace(/^[«"]|[»"]$/g,''))}»</p></div>`:`<div class="sg-say in"><p>${esc(txt)}</p></div>`;
  const dur=Math.max(3.8,1.6+txt.length/14)*1000;let spoke=false;
  if(reelVoiceOn()&&ttsReady()){spoke=true;ttsSay(txt,()=>{if(SAGAP===Q&&!Q.q){clearTimeout(Q.timer);Q.timer=setTimeout(()=>sagaNext(),700);}});}
  Q.timer=setTimeout(()=>sagaNext(),spoke?dur+6000:dur);}
function sagaQuestion(){const Q=SAGAP;if(!Q)return;clearTimeout(Q.timer);ttsStop();const s=G,ch=Q.ch;Q.q=1;
  if(Q.replay){const pk=(s.saga&&s.saga.pick||{})[ch.id],o=ch.o&&ch.o[pk];Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><h3>${esc(sagaFill(ch.q,s))}</h3>${o?`<p class="sg-res">Ваш выбор: «${esc(sagaFill(o.t,s))}». ${esc(sagaFill(o.res,s))}</p>`:''}<button class="sg-o" data-k="-1"><b>Закрыть</b></button></div>`;}
  else Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><h3>${esc(sagaFill(ch.q,s))}</h3>${(ch.o||[]).map((o,i)=>`<button class="sg-o" data-k="${i}"><b>${esc(sagaFill(o.t,s))}</b><small>${esc(sagaFxText(o.fx,s))}</small></button>`).join('')}</div>`;
  Q.el.querySelector('.sg-skip').style.visibility='hidden';
  Q.el.querySelectorAll('.sg-o').forEach(b=>b.onclick=e=>{e.stopPropagation();sagaPick(+b.dataset.k);});
  if(reelVoiceOn()&&ttsReady()&&!Q.replay)ttsSay(sagaFill(ch.q,s));}
function sagaPick(k){const Q=SAGAP;if(!Q)return;const s=G,ch=Q.ch,o=ch.o&&ch.o[k];
  if(Q.replay||k<0||!o){sagaStop();return;}
  sagaApply(s,o.fx);addLog(`🎬 «${sagaFill(ch.t,s)}»: ${sagaFill(o.t,s)}. ${sagaFill(o.res,s)}`,'hist');
  Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><p class="sg-res">${esc(sagaFill(o.res,s))}</p><p class="sg-fx">${esc(sagaFxText(o.fx,s))}</p><button class="sg-o" data-k="-1"><b>Дальше ▸</b></button></div>`;
  Q.el.querySelector('.sg-o').onclick=e=>{e.stopPropagation();sagaDone(ch.id,k);};
  if(reelVoiceOn()&&ttsReady())ttsSay(sagaFill(o.res,s));}
function sagaDone(id,k){const s=G,S=s.saga=s.saga||{seen:[],pick:{},last:mi(s)};if(!S.seen.includes(id))S.seen.push(id);if(k>=0){S.pick=S.pick||{};S.pick[id]=k;}
  sagaStop();const i=s.pending.findIndex(p=>p.saga===id);if(i>=0)s.pending.splice(i,1);save();render();}
function sagaStop(){const Q=SAGAP;SAGAP=null;ttsStop();if(!Q)return;clearTimeout(Q.timer);Q.el.classList.add('out');setTimeout(()=>{try{Q.el.remove();}catch(_){}},400);}
// Карточка «Фильм о вас»: просмотренные главы и следующая
function sagaCard(s){const L=sagaList(s),S=s.saga||{seen:[]},seen=L.filter(c=>(S.seen||[]).includes(c.id)),next=L.find(c=>!(S.seen||[]).includes(c.id));
  const P=PIONEERS[s.pioneer]||PIONEERS.custom;
  return `<section class="card sg-card"><div class="row"><h2>🎬 Фильм: ${esc(s.pioneer==='custom'?s.company:P.name)}</h2><span class="pill">${seen.length} из ${L.length}</span></div>
    <p class="small muted" style="margin-top:4px">Художественный фильм по настоящей истории: глава приходит, когда в игре наступает её момент. Выбор в конце главы влияет на компанию.</p>
    <div class="sg-list">${L.map((c,i)=>{const got=(S.seen||[]).includes(c.id),pk=S.pick&&S.pick[c.id];return `<button class="sg-li ${got?'got':''}" ${got?`data-act="sagaReplay" data-k="${c.id}"`:'disabled'}><b>${i+1}. ${esc(got?sagaFill(c.t,s):'Ещё впереди')}</b><small>${got?(c.y?c.y+' · ':'')+(pk!==undefined&&c.o[pk]?'выбор: '+esc(sagaFill(c.o[pk].t,s)):'смотреть снова ▸'):c===next?'следующая глава':''}</small></button>`;}).join('')}</div></section>`;}
