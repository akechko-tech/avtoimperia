/* ===== 0.51, этап 7: воздушный бой =====
   Письмо автора: в бою не видно, где враг, прицелиться трудно, а противник садится на хвост и висит там до конца.
   1) метка врага: на экране — красный ромб с расстоянием, за краем — красная стрелка; «ВРАГ НА ХВОСТЕ» — когда он сзади и носом на вас;
   2) прицел: крестик — куда летит очередь, кружок — куда целить с упреждением; нос рядом с кружком — очередь доводится сама
      (на лёгких уровнях конус шире и доводка полнее, на «Историке» её нет);
   3) противник — человек: целится с ошибкой, стреляет очередями, проскакивает вперёд на большой скорости,
      а повисев на хвосте, отваливает в сторону и заходит снова. */
const FR_RANGE=450;/* дальность действительного огня, м */
/* cone — конус автоприцела, рад; k — какая доля конуса доводится целиком («захват»); tail — сколько секунд враг держится на хвосте; err — ошибка прицеливания врага;
   pause — пауза между его очередями; burst — длина очереди; over — шанс проскочить вперёд; see — как далеко он вас замечает */
const FR_DIF={kids:{cone:0.16,k:1,tail:4,err:2.0,pause:1.8,burst:0.8,over:0.9,see:0.75},
  easy:{cone:0.12,k:0.85,tail:5.5,err:1.3,pause:1.4,burst:0.9,over:0.7,see:0.85},
  normal:{cone:0.075,k:0.6,tail:8,err:0.5,pause:0.6,burst:1.2,over:0.5,see:1},
  hard:{cone:0.05,k:0.5,tail:11,err:0.3,pause:0.35,burst:1.6,over:0.35,see:1},
  hist:{cone:0,k:0,tail:14,err:0.2,pause:0.25,burst:2,over:0.25,see:1}};
function frDif(){return FR_DIF[(typeof G!=='undefined'&&G&&G.diff)||'normal']||FR_DIF.normal;}
/* упреждение: куда направить нос стрелку a, чтобы пуля встретила цель f. Пуля летит 760 м/с от точки выстрела и скорости
   стрелка не наследует (так считает frBullet) — значит, в расчёте только путь цели за время полёта пули */
function frLead(a,f){const r=[f.p[0]-a.p[0],f.p[1]-a.p[1],f.p[2]-a.p[2]],vr=f.v,d=l3(r);let t=d/760,q=r;
  for(let i=0;i<2;i++){q=[r[0]+vr[0]*t,r[1]+vr[1]*t,r[2]+vr[2]*t];t=l3(q)/760;}const L=Math.max(1e-6,l3(q));
  return {dir:[q[0]/L,q[1]/L,q[2]/L],d,t,p:[a.p[0]+q[0],a.p[1]+q[1],a.p[2]+q[2]]};}
/* автоприцел игрока: ближайшая к носу точка упреждения в конусе; aim — куда пойдёт очередь */
function frAssist(a,M){const D=frDif();if(!D.cone||!a||a!==FL.me||!M)return null;let best=null,bc=Math.cos(D.cone);
  for(const f of (M.foes||[])){if(f.crash||f.down)continue;const L=frLead(a,f);if(L.d>FR_RANGE*1.15)continue;const c=d3(L.dir,a.fw);if(c>bc){bc=c;best=L;best.f=f;}}
  if(!best)return null;/* ошибку наводки до k·cone убираем целиком (это «захват» — кружок зелёный), дальше до края конуса — частично */
  const ang=Math.acos(Math.min(1,bc)),fix=D.k*D.cone,k=ang<=fix?1:fix/ang;best.lock=ang<=fix;best.aim=v3n([a.fw[0]+(best.dir[0]-a.fw[0])*k,a.fw[1]+(best.dir[1]-a.fw[1])*k,a.fw[2]+(best.dir[2]-a.fw[2])*k]);return best;}
/* враг на хвосте: ближе 500 м, в задней полусфере игрока и носом на него */
function frSix(M,me){if(!M||!me||me.crash||me.gnd)return null;let best=null;
  for(const f of (M.foes||[])){if(f.crash||f.down||f.kind!=='fight')continue;const r=[f.p[0]-me.p[0],f.p[1]-me.p[1],f.p[2]-me.p[2]],d=l3(r);if(d>500||d<1)continue;
    const u=[r[0]/d,r[1]/d,r[2]/d];if(d3(me.fw,u)>-0.35)continue;if(d3(f.fw,[-u[0],-u[1],-u[2]])<0.9)continue;if(!best||d<best.d)best={f,d,side:d3(me.rt,u)>0?1:-1};}
  return best;}
function frSixText(x){return x?`⚠ ВРАГ НА ХВОСТЕ — ${Math.round(x.d/10)*10} м, ${x.side>0?'справа':'слева'}`:'';}
/* что показать в кабине: враги ближе 3,5 км (ближний — первым), точка упреждения, предупреждение */
function frHud(M,me){if(!M||!me||!M.foes||M.over||me.crash)return null;const L=[];
  for(const f of M.foes){if(f.crash||f.down)continue;const d=Math.hypot(f.p[0]-me.p[0],f.p[1]-me.p[1],f.p[2]-me.p[2]);if(d<3500)L.push({f,d});}
  L.sort((x,y)=>x.d-y.d);const six=frSix(M,me),D=frDif();let lead=null;
  if(me.gun&&me.gun.fwd&&!me.gnd){for(const x of L){if(x.d>FR_RANGE*1.15)break;const q=frLead(me,x.f);if(d3(q.dir,me.fw)<0.5)continue;lead={f:x.f,d:x.d,dir:q.dir,lock:!!D.cone&&d3(q.dir,me.fw)>Math.cos(D.k*D.cone)};break;}}
  return {foes:L.slice(0,4),six,lead,gun:!!(me.gun&&me.gun.fwd&&!me.gnd)};}
/* ---- ошибки противника ---- */
function frAimErr(ai,dt){const D=frDif();ai.eT=(ai.eT||0)-dt;if(ai.eT<=0||!ai.e){ai.eT=0.5+Math.random()*0.9;const k=0.02*(1.35-ai.sk)*D.err;ai.e=[(Math.random()-0.5)*2*k,(Math.random()-0.5)*2*k,(Math.random()-0.5)*2*k];}return ai.e;}
/* очередь: секунда-две огня, потом пауза (пулемёт греется, цель надо поймать заново) */
function frBurst(ai,dt,want){const D=frDif();if(ai.hold>0){ai.hold-=dt;return false;}if(!want){ai.bT=Math.max(0,(ai.bT||0)-dt*2);return false;}
  ai.bT=(ai.bT||0)+dt;if(ai.bT>(1+ai.sk*1.2)*D.burst){ai.bT=0;ai.hold=(0.7+(1-ai.sk)*1.6)*D.pause;}return true;}
function frTailMax(ai){return frDif().tail*(0.7+0.6*ai.sk);}
/* отвалить в сторону с набором (how='break') или проскочить прямо (how='over') */
function frBreak(a,how,M){const ai=a.ai;ai.st=how;ai.dir=Math.random()<0.5?-1:1;ai.tail=0;ai.bT=0;ai.hold=0;
  if(how==='over'){ai.hdg=flHdg(a);ai.balt=a.p[1]+20;ai.until=ai.t+2.2+Math.random()*1.6;}
  else{ai.hdg=flHdg(a)+ai.dir*(1.7+Math.random()*0.9);ai.balt=a.p[1]+60+Math.random()*120;ai.until=ai.t+(4+Math.random()*3)*(1.3-0.4*ai.sk);}
  if(M&&how==='over'&&!M.tipOver&&frDif().cone){M.tipOver=1;if(typeof flToast==='function')flToast('Противник проскочил — он перед вами!','good');}}
/* шаг «человеческого» поведения в атаке: true — противник занят манёвром, атаку в этот кадр не ведёт */
function frHuman(a,dt,M,dist,d){const ai=a.ai,me=FL.me,D=frDif();
  if(ai.st==='break'||ai.st==='over'){flAuto(a,ai.st==='over'?{hdg:ai.hdg,alt:ai.balt,thr:1,bank:0.35,floor:150}:{hdg:ai.hdg,alt:ai.balt,thr:1,bank:1.25,edge:1,floor:150,climbK:1.2});frGuns(a,dt,false,M);if(ai.t>ai.until){ai.st='attack';ai.tail=0;}return true;}
  if(ai.st!=='attack')return false;const u=[d[0]/dist,d[1]/dist,d[2]/dist];
  const onTail=dist<350&&d3(me.fw,u)>0.3&&d3(a.fw,u)>0.7;/* счёт идёт только с дистанции огня: издалека догонять можно сколько угодно */ai.tail=onTail?(ai.tail||0)+dt:Math.max(0,(ai.tail||0)-dt*1.5);
  if(ai.tail>frTailMax(ai)){frBreak(a,'break',M);return true;}
  const close=-((me.v[0]-a.v[0])*u[0]+(me.v[1]-a.v[1])*u[1]+(me.v[2]-a.v[2])*u[2]);
  if(dist>220)ai.ovCk=0;else if(dist<90&&close>8&&!ai.ovCk){ai.ovCk=1;if(Math.random()<D.over*(1.25-ai.sk)){frBreak(a,'over',M);return true;}}
  return false;}
/* справка перед первым боевым вылетом (и по кнопке «?») */
function frHelpHTML(){const D=frDif();return `<p><b>Бой.</b> Красный ромб — враг; если он за краем экрана, туда показывает красная стрелка. Белый крестик — куда пойдёт очередь, жёлтый кружок — куда целить с упреждением: подведите крестик к кружку и жмите <b>ОГОНЬ</b> с 200–300 метров.${D.cone?' Кружок позеленел — прицел сам доведёт очередь.':' На этом уровне очередь идёт точно по крестику — доводки нет.'}</p><p><b>«ВРАГ НА ХВОСТЕ»</b> — не летите прямо: крутой вираж в сторону от него. Долго он за вами не удержится — отвалит или проскочит вперёд, и тогда он ваш.</p>`;}
/* ---- кабина: метки врага, прицел, предупреждение ---- */
function flyProj(p){const VP=typeof FWR!=='undefined'&&FWR?FWR.VPf:null;if(!VP)return null;const cw=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];
  let x=(VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12])/cw,y=(VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13])/cw;const on=cw>0&&Math.abs(x)<0.9&&Math.abs(y)<0.82;
  if(!on){if(cw<0){x=-x;y=-y;}const k=Math.min(0.8/Math.max(Math.abs(x),0.001),(y>0?0.36:0.4)/Math.max(Math.abs(y),0.001));x*=k;y*=k;}return {x,y,on};}
function flyFoeBox(){const host=document.getElementById('fMark');if(!host||!host.parentNode)return null;const box=host.parentNode;let w=box.querySelector('.f-foes');
  if(!w){w=document.createElement('div');w.className='f-foes';w.innerHTML='<div class="f-foe" hidden><i></i><b></b></div>'.repeat(4)+'<div class="f-lead" hidden><i></i></div><div class="f-gun" hidden></div><div class="f-six" id="fSix" hidden></div>';box.appendChild(w);}return w;}
function flyFoeMarks(){const w=flyFoeBox();if(!w)return;const M=FL.mi,me=FL.me,H=frHud(M,me),E=w.querySelectorAll('.f-foe'),ld=w.querySelector('.f-lead'),gn=w.querySelector('.f-gun'),sx=w.querySelector('.f-six');
  if(!H||!FWR.VPf){E.forEach(e=>{e.hidden=true;});ld.hidden=gn.hidden=sx.hidden=true;return;}
  const W=w.parentNode.clientWidth,Hh=w.parentNode.clientHeight,put=(el,q)=>{el.style.left=(q.x*0.5+0.5)*W+'px';el.style.top=(0.5-q.y*0.5)*Hh+'px';};
  E.forEach((el,i)=>{const x=H.foes[i];if(!x){el.hidden=true;return;}const q=flyProj(x.f.p);if(!q){el.hidden=true;return;}el.hidden=false;put(el,q);el.classList.toggle('edge',!q.on);el.classList.toggle('hot',!!(H.six&&H.six.f===x.f));
    el.querySelector('i').style.transform=q.on?'rotate(45deg)':`rotate(${Math.atan2(-q.y,q.x)}rad)`;el.querySelector('b').textContent=x.d<1000?Math.round(x.d/10)*10+' м':(Math.round(x.d/100)/10+' км').replace('.',',');});
  if(H.gun){const q=flyProj([me.p[0]+me.fw[0]*300,me.p[1]+me.fw[1]*300,me.p[2]+me.fw[2]*300]);gn.hidden=!(q&&q.on);if(q&&q.on)put(gn,q);}else gn.hidden=true;
  if(H.lead){const q=flyProj([me.p[0]+H.lead.dir[0]*H.lead.d,me.p[1]+H.lead.dir[1]*H.lead.d,me.p[2]+H.lead.dir[2]*H.lead.d]);ld.hidden=!(q&&q.on);if(q&&q.on){put(ld,q);ld.classList.toggle('lock',H.lead.lock);}}else ld.hidden=true;
  const t=frSixText(H.six);sx.hidden=!t;if(t&&sx.textContent!==t)sx.textContent=t;}
