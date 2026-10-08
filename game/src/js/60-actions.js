/* ================= ACTIONS ================= */
function stopAuto(){if(auto){clearInterval(auto);auto=null;const ab=document.getElementById('autoBtn');if(ab){ab.textContent='▶';ab.classList.remove('on');}}}
function ngKeep(){const g=id=>document.getElementById(id);if(!draft)return;if(g('cname'))draft.company=g('cname').value;if(g('fname'))draft.first=g('fname').value;if(g('rname'))draft.rname=g('rname').value;}
function doStep(){if(step()){save();render();afterStep();return true;}return false;}
function flushToasts(){pendingToasts.forEach(toast);pendingToasts=[];}
function rerender(){const top=window.scrollY;save();render();window.scrollTo(0,top);}
// Второе нажатие подтверждает необратимое действие
let confirmKey='',confirmT=0;
function confirmOnce(k,msg){const now=Date.now();if(confirmKey===k&&now-confirmT<4000){confirmKey='';return true;}confirmKey=k;confirmT=now;toast(msg);return false;}
const ACT={
  tab:d=>{tab=d.t;render();const e=d.sec&&document.getElementById(d.sec);if(e){e.scrollIntoView({block:'start'});window.scrollBy(0,-86);}else window.scrollTo(0,0);},
  next:()=>doStep(),
  quarter:()=>{let ok=false;for(let i=0;i<3;i++){if(!step())break;ok=true;if(G.pending.length)break;}if(ok){save();render();afterStep();}},
  auto:()=>{if(auto){stopAuto();render();return;}auto=setInterval(()=>{if(!doStep()||G.pending.length)stopAuto();},1300);render();},
  // завод
  capAdd:d=>{if(capOrder(G,+d.n))rerender();},
  tip:d=>{const t=TIPS[+d.k];if(t&&t.run){t.run();save();render();flushToasts();}},
  helperToggle:()=>{if(!G)return;G.helper=G.helper||{};G.helper.on=!G.helper.on;toast(G.helper.on?'Помощник управляющего включён':'Помощник выключен');save();openSettings();render();},
  whAdd:d=>{if(whOrder(G,+d.n))rerender();},
  capSell:()=>{if(G.cap<=3)return;const n=Math.max(1,Math.round(G.cap*0.2)),v=Math.round(G.plantVal*n/G.cap*0.4);G.cap-=n;G.plantVal-=G.plantVal*n/(G.cap+n);G.cash+=v;addLog(`Часть цехов продана за ${money(v)}.`);rerender();},
  shifts:d=>{G.shifts=+d.v;rerender();},
  staffAuto:d=>{G.staffAuto=d.v==='1';rerender();},
  workers:d=>{const k=Math.max(1,Math.round(G.workers*0.1));G.workers=Math.max(3,G.workers+k*(+d.d));if(+d.d>0){G.cash-=k*8*cpi(G);}rerender();},
  wagePol:d=>{const w=WAGE_POL[d.v];if(w.y&&G.y<w.y-techEarly(G))return;const was=G.wagePol;G.wagePol=d.v;
    if(d.v==='five'&&was!=='five'){addLog('Объявлена зарплата «пять долларов в день» — вдвое выше рынка. У ворот завода очередь из желающих.','good');if(G.y<1914)recordFirst(G,'wage:five','Зарплата «пять долларов в день»',1914,'Ford');G.rep=clamp(G.rep+4,0,100);flushToasts();}rerender();},
  tech:d=>{const k=d.k,c=techCost(G,k);if(!techOpen(G,k)||G.techBuild||G.cash<c)return;G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:techMonths(G,k)};addLog(`Начато внедрение: ${techNext(G,k).name} (${money(c)}).`);rerender();},
  loan:d=>{const n=+d.n;if(!loanOpen(G)){toast(creditState(G).t);return;}if(G.loan+n<=maxLoan(G)){G.loan+=n;G.cash+=n;rerender();}},
  // 0.26: своя цена в стране — наценка или скидка к домашней
  pmk:d=>{const k=+d.v;G.pmk=G.pmk||{};if(Math.abs(k-1)<1e-6)delete G.pmk[d.c];else G.pmk[d.c]=k;addLog(`Цена в стране «${COUNTRIES[d.c].name}»: ${k===1?'как дома':(k>1?'+':'−')+Math.round(Math.abs(k-1)*100)+'% к домашней'}.`);rerender();},
  dpol:d=>{G.dpol=d.v;addLog(`Скидка дилерам: ${DPOL[d.v].n.toLowerCase()} (${Math.round(DPOL[d.v].m*100)}% цены).`);rerender();},
  // 0.25: кредит покупателям, вложения, спецакции
  finPol:d=>{if(!techLv(G,'credit'))return;G.finPol=d.v==='own'?'own':'bank';addLog(G.finPol==='own'?'Рассрочку покупателям теперь даёт своя кредитная компания: проценты — ваши, но деньги на рассрочку — тоже.':'Рассрочку покупателям снова дают банки — за комиссию.');rerender();},
  invBuy:d=>{if(invBuy(G,d.k,+d.n))rerender();else toast(d.k==='st'&&!stocksOpen(G)?'Биржа закрыта':'Не хватает денег');},
  invSell:d=>{if(invSell(G,d.k,+d.n))rerender();},
  supBuy:d=>{if(supBuy(G,d.k)){flushToasts();rerender();}},
  supSell:d=>{if(confirmOnce('sup'+d.k,'Нажмите ещё раз: продать за 60% стоимости'))if(supSell(G,d.k))rerender();},
  promo:d=>{const inSheet=!sheet.hidden;if(promoStart(G,d.c,d.g,d.k)){flushToasts();save();render();if(inSheet)promoSheet(d.c);}else toast('Не хватает денег');},
  promoSheet:d=>promoSheet(d.c),
  repay:d=>{const n=Math.min(G.loan,Math.floor(Math.max(0,G.cash)));if(n>0){G.loan=Math.round((G.loan-n)*100)/100;if(G.loan<1)G.loan=0;G.cash-=n;addLog(G.loan?`Погашено ${money(n)} кредита, осталось ${money(G.loan)}.`:`Кредит погашен полностью (${money(n)}).`,'good');rerender();}},
  // модели
  price:d=>{const md=G.models.find(m=>m.id===+d.id),st=Math.max(5,Math.round(md.price*0.05/5)*5);if(md.pPrevM!==mi(G)){md.pPrev=md.price;md.pPrevM=mi(G);}md.price=Math.max(20,md.price+st*(+d.d));rerender();},
  planManual:d=>{const md=G.models.find(m=>m.id===+d.id);if(md.plan==='auto'||md.plan===undefined)md.plan=autoPlan(md);rerender();},
  planAuto:d=>{const md=G.models.find(m=>m.id===+d.id);md.plan='auto';rerender();},
  plan:d=>{const md=G.models.find(m=>m.id===+d.id),base=md.plan==='auto'||md.plan===undefined?autoPlan(md):+md.plan;md.plan=Math.max(0,base+(+d.d));rerender();},
  retire:d=>{const md=G.models.find(m=>m.id===+d.id);if(md.stock>0){md.salePrev=md.price;md.price=Math.max(20,Math.round(md.price*0.7/10)*10);md.status='sale';md.plan='auto';md.backlog=0;addLog(`«${md.name}» снята с производства. Остаток ${fmtN(md.stock)} шт. распродаётся по ${money(md.price)} (−30%).`);}else{md.status='off';md.backlog=0;addLog(`«${md.name}» снята с производства.`);}rerender();},
  saleNow:d=>{const md=G.models.find(m=>m.id===+d.id),rev=Math.round(md.stock*md.price*0.5);G.cash+=rev;addLog(`Остаток «${md.name}» (${fmtN(md.stock)} шт.) отдан перекупщикам за ${money(rev)}.`);md.stock=0;md.status='off';rerender();},
  revive:d=>{const md=G.models.find(m=>m.id===+d.id);md.status='prod';md.launched=mi(G);addLog(`«${md.name}» снова в производстве.`);rerender();},
  design:()=>openDesigner(),
  legPaint:d=>{if(!draft||!draft.legendDraft)return;draft.paint=d.v;document.querySelectorAll('[data-act=legPaint]').forEach(b=>b.classList.toggle('on',b.dataset.v===d.v));},
  pick:d=>{draft[d.k]=d.v;
    // спортивное оснащение — только на открытом кузове: закрытый кузов переводит машину в люкс, спорт — ставит родстер
    if(d.k==='b'&&draft.t==='t3'&&!bodyOpen(d.v))draft.t='t2';
    if(d.k==='t'&&d.v==='t3'&&!bodyOpen(draft.b)){const b=unlockedP(BODIES,G).filter(x=>bodyOpen(x.id));draft.b=(b.find(x=>x.id==='b10')||b[b.length-1]||{id:'b1'}).id;}
    const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dsec:d=>{draft.open=draft.open===d.k?null:d.k;const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dclass:d=>{const was=designKind(draft),k=d.v;if(kindIsTruck(k)!==kindIsTruck(was)||(kindIsTruck(k)&&k!==was))Object.assign(draft,rivalDesign(k,G.y));else draft.t=KIND_TRIM[k];
    if(k==='sport'&&!bodyOpen(draft.b)){const b=unlockedP(BODIES,G).filter(x=>bodyOpen(x.id));draft.b=(b.find(x=>x.id==='b10')||b[b.length-1]||{id:'b1'}).id;}
    const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dcopy:()=>{Object.assign(draft,rivalDesign(designKind(draft),G.y));const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;},
  dauto:()=>{const k=designKind(draft),base={};PART_KEYS.forEach(x=>base[x]=draft[x]);const md=autoDesign(k,G,base);PART_KEYS.forEach(x=>draft[x]=md[x]);draft.t=md.t;const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;toast('Подобраны детали для наибольшей прибыли');},
  startdev:()=>{const md={...draft},dc=devCost(md,G);if(G.cash<dc)return;G.cash-=dc;const nm=(draft.name||'').trim()||('Тип '+G.nextId);
    const m={id:G.nextId++,name:nm,e:md.e,g:md.g,c:md.c,k:md.k,b:md.b,t:md.t,w:md.w,paint:md.paint,price:0,plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
    m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);
    addLog(`Начата разработка «${nm}» (${money(dc)}, ${devMonths(md)} мес.).`);closeSheet();tab='models';checkAch();save();render();},
  rdPick:()=>openRD(),
  legendOpen:d=>{openLegend(d.k);},
  legendStart:d=>{if(legendStart(G,d.k)){closeSheet();tab='models';checkAch();save();render();}},
  rdStart:d=>{const [kind,id]=d.k.split(':');const pj=rdProjects(G).find(x=>x.kind===kind&&x.id===id);if(pj&&!rdBegin(G,pj)&&G.cash<rdCost(pj,G))toast('Не хватает денег на опыты: '+money(rdCost(pj,G)));closeSheet();save();render();},
  rdW:d=>{const pj=G.rd.projs[+d.k];if(!pj)return;pj.w=clamp((pj.w||1)+(+d.d)*0.5,0.5,4);rerender();},
  reel:d=>{auInit();playReel(d.k);},
  rdStudy:d=>{if(studyStart(G,d.k)){closeSheet();checkAch();save();render();flushToasts();}},
  rdStop:d=>{const pj=G.rd.projs[+d.k];if(!pj)return;if(!confirmOnce('rdStop'+(+d.k),'Нажмите ещё раз: сделанное по проекту пропадёт'))return;G.rd.projs.splice(+d.k,1);addLog(`КБ остановило проект: ${pj.name}.`);rerender();},
  rdUp:()=>{const c=rdUpCost(G);if(G.rd.lvl<RD_MAX&&G.cash>=c){G.cash-=c;G.rd.lvl++;addLog(`Конструкторское бюро выросло: «${RD_LV[G.rd.lvl]}», ${G.rd.lvl}-й уровень.`,'good');checkAch();rerender();flushToasts();}},
  fold:d=>{setOpen(d.k,!isOpen(d.k,d.def==='1'));if(!sheet.hidden&&draft===null&&sb.querySelector('[data-k="'+d.k+'"]')){const top=sb.scrollTop;openRD();sb.scrollTop=top;return;}rerender();},
  // рынок
  dealers:d=>{const n=Math.min(+d.n,dealerRoom(G,d.c));if(n<1||G.cash<n*dealerCost(G))return;buyDealers(G,d.c,n);checkAch();rerender();flushToasts();},
  impUp:d=>{if(impUp(G,d.c)){checkAch();save();rerender();flushToasts();}},
  licEnd:d=>{if(!confirmOnce('lic'+d.c,'Нажмите ещё раз: отозвать лицензию — местный завод перестанет делать ваши машины'))return;licEnd(G,d.c);rerender();},
  brandBuy:d=>{if(!confirmOnce('brand'+d.c,'Нажмите ещё раз: покупка марки — большие деньги'))return;if(brandBuy(G,d.c,+d.i)){checkAch();save();rerender();flushToasts();}},
  licStart:d=>{if(licStart(G,d.c)){save();rerender();flushToasts();}},
  hubStart:d=>{if(hubStart(G)){save();rerender();}},
  dealerGrow:d=>{if(dealerGrow(G,d.c)){rerender();flushToasts();}},
  carGal:d=>{const md=G.models.find(m=>m.id===+d.id);if(md)openSheet(carGalHTML(md,d.k));},
  brand:d=>{const h=brandHTML(d.c,+d.i,G);if(h)openSheet(h);},
  drvBio:d=>{const dr=DRIVERS.find(x=>x.id===d.k);if(dr)openSheet(drvBioHTML(dr,G));},
  dealersCut:d=>{const was=dealerCount(G,d.c),n=Math.max(1,Math.round(was*0.2));G.dealers[d.c]=Math.max(d.c===G.country?1:0,was-n);rerender();},
  // окна
  close:()=>closeSheet(),
  choose:d=>{closeSheet();closePaper();resolve(d.k);},
  paperClose:()=>{closePaper();render();},
  paperChoose:()=>{closePaper();},
  reopenPaper:d=>{const k=+d.k,p=G.papers[k];if(p)showPaper({...p,deck:p.deck+' · '+p.d,choices:[['Закрыть','close']],act:'paperClose',kicker:p.kicker||'Из архива',arch:k},false);},
  paperAlso:d=>{const h=flavorHTML(d.k);if(h){PW.innerHTML=h;PW.scrollTop=0;auSfx('paper',1);}},
  paperBack:()=>{if(PAPER_CUR){PW.innerHTML=paperHTML(PAPER_CUR,G);PW.scrollTop=0;}},
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
  country:d=>{const top=sb.scrollTop;draft.country=d.v;ngKeep();openNewGame();sb.scrollTop=top;},
  diff:d=>{const top=sb.scrollTop;draft.diff=d.v;ngKeep();openNewGame();sb.scrollTop=top;},
  // 0.28: путь гонщика
  ngPath:d=>{const top=sb.scrollTop;ngKeep();draft.path=d.v;openNewGame();sb.scrollTop=top;},
  rpick:d=>{const top=sb.scrollTop;ngKeep();draft.racer=d.v;openNewGame();sb.scrollTop=top;},
  rcountry:d=>{const top=sb.scrollTop;ngKeep();draft.rc=d.v;openNewGame();sb.scrollTop=top;},
  ryear:d=>{const top=sb.scrollTop;ngKeep();draft.ry=+d.v;openNewGame();sb.scrollTop=top;},
  startracer:()=>{ngKeep();racerNew(draft.racer,draft.rc,draft.ry,draft.racer==='custom'?draft.rname:'',draft.diff);closeSheet();closePaper();hideMainMenu();tab='plant';shownCash=null;lastDate='';racerIntro(G);save();render();AU.lastY=null;},
  rxRace:d=>racerOpenRace(d.k),
  rxSet:d=>{if(!RRS)return;const k=d.k;RRS[k]=k==='works'||k==='tyre'||k==='mode'?d.v:+d.v;if(k==='works'){const rc=raceByKey(RRS.key);RRS.prep=d.v?aiPrep(rc):(G.racer.car&&G.racer.car.prod?1:2);}racerRaceSheet();},
  rxGo:()=>racerGo(),
  rxBuy:d=>racerBuy(d.k),rxRepair:()=>racerRepair(),rxSell:()=>racerSell(),rxMech:()=>racerMech(),rxQuit:()=>racerQuit(),rxJobQuit:()=>racerJobQuit(),
  rxFound:d=>racerFoundAsk(d.k),
  rxFoundGo:d=>{if(racerFound(d.k,d.n,+d.v)){closeSheet();tab='plant';shownCash=null;lastDate='';save();render();}},
  startgame:()=>{const f=document.getElementById('fname');if(f)draft.first=f.value;newGame(draft.pioneer,draft.country,(draft.company||'').trim(),draft.diff,(draft.first||'').trim());introPapers(G);sagaCheck(G);closeSheet();closePaper();hideMainMenu();tab='plant';shownCash=null;lastDate='';save();render();AU.lastY=null;},
  // звук и управление
  snd:()=>{auInit();AU.on.music=!AU.on.music;AU.paused=false;auApply();musUI();toast(AU.on.music?'Музыка включена':'Музыка выключена');},
  plPrev:()=>{auInit();musNext(-1);},plNext:()=>{auInit();musNext(1);},plPlay:()=>{auInit();musToggle();},plMode:()=>{auInit();musMode();},
  audio:d=>{AU.on[d.k]=!AU.on[d.k];auApply();openSettings();},
  ctlTilt:d=>{AU.on.steer=d.v;AU.on.tilt=d.v==='tilt';auApply();openSettings();},
  gfx:d=>{AU.on.gfx=d.v;auApply();openSettings();toast(d.v==='3d'?'Гонки — в объёмной графике':'Гонки — в простой графике');},
  sagaReplay:d=>{closeSheet();sagaPlay(d.k,true);},
  boardTake:d=>{boardTake(G,d.k);},
  trophy:d=>{trophyReplay(+d.k);},
  troRace:()=>{openRaceResult();},
  gq:d=>{AU.on.gq=d.v;auApply();openSettings();toast({eco:'Графика: экономно',hd:'Графика: HD',cine:'Графика: кино — максимум деталей'}[d.v]||'Графика');},
  demoToggle:()=>{AU.on.demo=AU.on.demo===false;auApply();openSettings();if(AU.on.demo===false&&typeof demoStop==='function')demoStop(true);},
  gfxPost:()=>{AU.on.post=AU.on.post===false;auApply();openSettings();toast(AU.on.post===false?'Кино-обработка выключена':'Кино-обработка включена');},
  plantLive:()=>{AU.on.plantImg=!AU.on.plantImg;auApply();openSettings();if(AU.on.plantImg&&typeof PLG!=='undefined'&&PLG.cv){PLG.cv.remove();PLG.ready=false;}render();toast(AU.on.plantImg?'Завод — картинкой':'Завод — вживую, в 3D');}
};
if(typeof RACE_ACT!=='undefined')Object.assign(ACT,RACE_ACT);
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(f)f(b.dataset,b);});
// Кнопка «Назад» на Android: закрываем окна по очереди
window.androidBack=function(){
  if(REEL){reelClose();return true;}
  if(R){finishRace(true);return true;}
  if(!PW.hidden){const b=PW.querySelector('.p-btn');if(b)b.click();else closePaper();return true;}
  if(!sheet.hidden){if((G&&G.pending.length&&!evHold)||(draft&&draft.ng&&G&&G.over)||(draft&&draft.lock))return true;closeSheet();return true;}
  if(!MS.hidden)return false;
  if(tab!=='plant'){tab='plant';render();window.scrollTo(0,0);return true;}
  ACT.toMenu();return true;
};
