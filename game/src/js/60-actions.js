/* ================= ACTIONS ================= */
function stopAuto(){if(auto){clearInterval(auto);auto=null;const ab=document.getElementById('autoBtn');if(ab){ab.textContent='▶';ab.classList.remove('on');}}}
function doStep(){if(step()){save();render();afterStep();return true;}return false;}
function flushToasts(){pendingToasts.forEach(toast);pendingToasts=[];}
function rerender(){const top=window.scrollY;save();render();window.scrollTo(0,top);}
// Второе нажатие подтверждает необратимое действие
let confirmKey='',confirmT=0;
function confirmOnce(k,msg){const now=Date.now();if(confirmKey===k&&now-confirmT<4000){confirmKey='';return true;}confirmKey=k;confirmT=now;toast(msg);return false;}
const ACT={
  tab:d=>{tab=d.t;render();window.scrollTo(0,0);},
  next:()=>doStep(),
  quarter:()=>{let ok=false;for(let i=0;i<3;i++){if(!step())break;ok=true;if(G.pending.length)break;}if(ok){save();render();afterStep();}},
  auto:()=>{if(auto){stopAuto();render();return;}auto=setInterval(()=>{if(!doStep()||G.pending.length)stopAuto();},1300);render();},
  // завод
  capAdd:d=>{const n=+d.n,c=n*capUnitCost(G);if(G.cash<c)return;G.cash-=c;G.plantVal+=c;G.capBuild.push({units:n,left:2});addLog(`Заложен новый цех: +${fmtN(n)} мест, ${money(c)}.`);rerender();},
  tip:d=>{const t=TIPS[+d.k];if(t&&t.run){t.run();save();render();flushToasts();}},
  helperToggle:()=>{if(!G)return;G.helper=G.helper||{};G.helper.on=!G.helper.on;toast(G.helper.on?'Помощник управляющего включён':'Помощник выключен');save();openSettings();render();},
  whAdd:d=>{const n=+d.n,c=n*whUnitCost(G);if(G.cash<c)return;G.cash-=c;G.plantVal+=c;G.whBuild=G.whBuild||[];G.whBuild.push({units:n,left:1});addLog(`Строится склад на ${fmtN(n)} машин (${money(c)}).`);rerender();},
  capSell:()=>{if(G.cap<=3)return;const n=Math.max(1,Math.round(G.cap*0.2)),v=Math.round(G.plantVal*n/G.cap*0.4);G.cap-=n;G.plantVal-=G.plantVal*n/(G.cap+n);G.cash+=v;addLog(`Часть цехов продана за ${money(v)}.`);rerender();},
  shifts:d=>{G.shifts=+d.v;rerender();},
  staffAuto:d=>{G.staffAuto=d.v==='1';rerender();},
  workers:d=>{const k=Math.max(1,Math.round(G.workers*0.1));G.workers=Math.max(3,G.workers+k*(+d.d));if(+d.d>0){G.cash-=k*8*cpi(G);}rerender();},
  wagePol:d=>{const w=WAGE_POL[d.v];if(w.y&&G.y<w.y-techEarly(G))return;const was=G.wagePol;G.wagePol=d.v;
    if(d.v==='five'&&was!=='five'){addLog('Объявлена зарплата «пять долларов в день» — вдвое выше рынка. У ворот завода очередь из желающих.','good');if(G.y<1914)recordFirst(G,'wage:five','Зарплата «пять долларов в день»',1914,'Ford');G.rep=clamp(G.rep+4,0,100);flushToasts();}rerender();},
  tech:d=>{const k=d.k,c=techCost(G,k);if(!techOpen(G,k)||G.techBuild||G.cash<c)return;G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:3};addLog(`Начато внедрение: ${techNext(G,k).name} (${money(c)}).`);rerender();},
  loan:d=>{const n=+d.n;if(G.loan+n<=maxLoan(G)){G.loan+=n;G.cash+=n;rerender();}},
  repay:d=>{const n=Math.min(+d.n,G.loan);if(n>0&&G.cash>=n){G.loan-=n;G.cash-=n;rerender();}},
  // модели
  price:d=>{const md=G.models.find(m=>m.id===+d.id),st=Math.max(5,Math.round(md.price*0.05/5)*5);md.price=Math.max(20,md.price+st*(+d.d));rerender();},
  planManual:d=>{const md=G.models.find(m=>m.id===+d.id);if(md.plan==='auto'||md.plan===undefined)md.plan=autoPlan(md);rerender();},
  planAuto:d=>{const md=G.models.find(m=>m.id===+d.id);md.plan='auto';rerender();},
  plan:d=>{const md=G.models.find(m=>m.id===+d.id),base=md.plan==='auto'||md.plan===undefined?autoPlan(md):+md.plan;md.plan=Math.max(0,base+(+d.d));rerender();},
  retire:d=>{const md=G.models.find(m=>m.id===+d.id);if(md.stock>0){md.salePrev=md.price;md.price=Math.max(20,Math.round(md.price*0.7/10)*10);md.status='sale';md.plan='auto';md.backlog=0;addLog(`«${md.name}» снята с производства. Остаток ${fmtN(md.stock)} шт. распродаётся по ${money(md.price)} (−30%).`);}else{md.status='off';md.backlog=0;addLog(`«${md.name}» снята с производства.`);}rerender();},
  saleNow:d=>{const md=G.models.find(m=>m.id===+d.id),rev=Math.round(md.stock*md.price*0.5);G.cash+=rev;addLog(`Остаток «${md.name}» (${fmtN(md.stock)} шт.) отдан перекупщикам за ${money(rev)}.`);md.stock=0;md.status='off';rerender();},
  revive:d=>{const md=G.models.find(m=>m.id===+d.id);md.status='prod';md.launched=mi(G);addLog(`«${md.name}» снова в производстве.`);rerender();},
  design:()=>openDesigner(),
  pick:d=>{draft[d.k]=d.v;const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dsec:d=>{draft.open=draft.open===d.k?null:d.k;const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dclass:d=>{const was=designKind(draft),k=d.v;if(kindIsTruck(k)!==kindIsTruck(was)||(kindIsTruck(k)&&k!==was))Object.assign(draft,rivalDesign(k,G.y));else draft.t=KIND_TRIM[k];const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dcopy:()=>{Object.assign(draft,rivalDesign(designKind(draft),G.y));const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dauto:()=>{const k=designKind(draft),base={};PART_KEYS.forEach(x=>base[x]=draft[x]);const md=autoDesign(k,G,base);PART_KEYS.forEach(x=>draft[x]=md[x]);draft.t=md.t;const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;toast('Подобраны детали для наибольшей прибыли');},
  startdev:()=>{const md={...draft},dc=devCost(md,G);if(G.cash<dc)return;G.cash-=dc;const nm=(draft.name||'').trim()||('Тип '+G.nextId);
    const m={id:G.nextId++,name:nm,e:md.e,g:md.g,c:md.c,k:md.k,b:md.b,t:md.t,w:md.w,paint:md.paint,price:0,plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
    m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);
    addLog(`Начата разработка «${nm}» (${money(dc)}, ${devMonths(md)} мес.).`);closeSheet();tab='models';checkAch();save();render();},
  rdPick:()=>openRD(),
  rdStart:d=>{const [kind,id]=d.k.split(':');const pj=rdProjects(G).find(x=>x.kind===kind&&x.id===id);if(pj&&rdActive(G).length<rdSlots(G)){G.rd.projs.push({...pj,prog:0});addLog(`КБ начало проект: ${pj.name}.`);}closeSheet();save();render();},
  rdW:d=>{const pj=G.rd.projs[+d.k];if(!pj)return;pj.w=clamp((pj.w||1)+(+d.d)*0.5,0.5,4);rerender();},
  rdStop:d=>{const pj=G.rd.projs[+d.k];if(!pj)return;if(!confirmOnce('rdStop'+(+d.k),'Нажмите ещё раз: сделанное по проекту пропадёт'))return;G.rd.projs.splice(+d.k,1);addLog(`КБ остановило проект: ${pj.name}.`);rerender();},
  rdUp:()=>{const c=rdUpCost(G);if(G.rd.lvl<RD_MAX&&G.cash>=c){G.cash-=c;G.rd.lvl++;addLog(`Конструкторское бюро выросло: «${RD_LV[G.rd.lvl]}», ${G.rd.lvl}-й уровень.`,'good');checkAch();rerender();flushToasts();}},
  fold:d=>{UIF[d.k]=!isOpen(d.k,d.def==='1');if(!sheet.hidden&&draft===null&&sb.querySelector('[data-k="'+d.k+'"]')){const top=sb.scrollTop;openRD();sb.scrollTop=top;return;}rerender();},
  // рынок
  dealers:d=>{const need=Math.round(dealerNeed(d.c,G)),have=dealerCount(G,d.c),mk=G.last&&G.last.mk[d.c],lost=mk&&mk.lostDlr||0,tpNeed=mk&&lost>0.5?Math.ceil(((mk.sold||0)+lost)/dealerTP(G)):0,target=Math.max(need,tpNeed);let n=Math.min(+d.n,target-have);if(n<1)return;const c=n*dealerCost(G);if(n<1||G.cash<c)return;G.cash-=c;const was=dealerCount(G,d.c);G.dealers[d.c]=was+n;if(!was&&d.c!==G.country)addLog(`Открыты первые дилеры: ${COUNTRIES[d.c].name}.`,'good');checkAch();rerender();flushToasts();},
  dealersCut:d=>{const was=dealerCount(G,d.c),n=Math.max(1,Math.round(was*0.2));G.dealers[d.c]=Math.max(d.c===G.country?1:0,was-n);rerender();},
  // окна
  close:()=>closeSheet(),
  choose:d=>{closeSheet();closePaper();resolve(d.k);},
  paperClose:()=>{closePaper();render();},
  paperChoose:()=>{closePaper();},
  reopenPaper:d=>{const p=G.papers[+d.k];if(p)showPaper({...p,deck:p.deck+' · '+p.d,choices:[['Закрыть','close']],act:'paperClose',kicker:p.kicker||'Из архива'},false);},
  menu:()=>{stopAuto();openMenuSheet();},
  help:()=>openHelp(),
  settings:()=>openSettings(),
  legacyInfo:()=>openLegacyInfo(),
  fame:()=>openFame(),
  about:()=>openAbout(),
  founder:()=>openFounder(),
  saveOpen:()=>openSlots('save'),
  loadOpen:()=>openSlots('load'),
  saveSlot:d=>{if(saveTo(d.k)){toast('Сохранено: слот '+d.k);closeSheet();}else toast('Не удалось сохранить');},
  loadSlot:d=>{if(loadSlot(d.k)){closeSheet();hideMainMenu();tab='plant';shownCash=null;lastDate='';save();render();AU.lastY=null;if(AU.pl&&AU.pl.length)musBuild(true);toast('Загружено: '+(d.k==='auto'?'автосохранение':'слот '+d.k));}},
  toMenu:()=>{if(G)save();closeSheet();closePaper();showMainMenu();},
  continue:()=>{if(loadSlot('auto')){hideMainMenu();tab='plant';shownCash=null;lastDate='';render();if(G.over&&G.final)openFinal();}},
  newgame:()=>{draft=null;stopAuto();openNewGame();},
  pion:d=>{const top=sb.scrollTop,f=document.getElementById('fname');if(f)draft.first=f.value;draft.pioneer=d.v;draft.diff=draft.diff||'normal';draft.country=PIONEERS[d.v].c;draft.company=PIONEERS[d.v].co;const keep=draft;openNewGame();draft=keep;sb.scrollTop=top;},
  country:d=>{const top=sb.scrollTop;draft.country=d.v;draft.company=document.getElementById('cname').value;draft.first=document.getElementById('fname').value;openNewGame();sb.scrollTop=top;},
  diff:d=>{const top=sb.scrollTop;draft.diff=d.v;draft.company=document.getElementById('cname').value;draft.first=document.getElementById('fname').value;openNewGame();sb.scrollTop=top;},
  startgame:()=>{const f=document.getElementById('fname');if(f)draft.first=f.value;newGame(draft.pioneer,draft.country,(draft.company||'').trim(),draft.diff,(draft.first||'').trim());introPapers(G);closeSheet();closePaper();hideMainMenu();tab='plant';shownCash=null;lastDate='';save();render();AU.lastY=null;},
  // звук и управление
  snd:()=>{auInit();AU.on.music=!AU.on.music;AU.paused=false;auApply();musUI();toast(AU.on.music?'Музыка включена':'Музыка выключена');},
  plPrev:()=>{auInit();musNext(-1);},plNext:()=>{auInit();musNext(1);},plPlay:()=>{auInit();musToggle();},plMode:()=>{auInit();musMode();},
  audio:d=>{AU.on[d.k]=!AU.on[d.k];auApply();openSettings();},
  ctlTilt:d=>{AU.on.steer=d.v;AU.on.tilt=d.v==='tilt';auApply();openSettings();},
  gfx:d=>{AU.on.gfx=d.v;auApply();openSettings();toast(d.v==='3d'?'Гонки — в объёмной графике':'Гонки — в простой графике');}
};
if(typeof RACE_ACT!=='undefined')Object.assign(ACT,RACE_ACT);
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(f)f(b.dataset,b);});
// Кнопка «Назад» на Android: закрываем окна по очереди
window.androidBack=function(){
  if(R){finishRace(true);return true;}
  if(!PW.hidden){const b=PW.querySelector('.p-btn');if(b)b.click();else closePaper();return true;}
  if(!sheet.hidden){if((G&&G.pending.length)||(draft&&draft.ng&&G&&G.over)||(draft&&draft.lock))return true;closeSheet();return true;}
  if(!MS.hidden)return false;
  if(tab!=='plant'){tab='plant';render();window.scrollTo(0,0);return true;}
  ACT.toMenu();return true;
};
