/* ================= 0.37: ВОЗДУШНЫЕ БОИ 1914–1918 — ФРОНТ, ВЫЛЕТЫ, ПОБЕДЫ =================
   В войну во вкладке «Небо» — фронт: каждый месяц штаб даёт вылеты для ваших военных аэропланов (патруль, перехват разведчика,
   аэростат, фотосъёмка, бомбардировка). Лететь самому (3D) или доверить лётчику. Победы — слава в отрядах (военные заказы),
   у лётчика — счёт побед (пять — ас), газеты пишут об асах на ваших машинах. Противник — по истории: «Фоккеры» 1915 года,
   «Альбатросы», «Кэмелы», SPAD, «Фоккер D.VII»; в 1914 году — разведчики, стреляют из карабинов. */
const FR_T={patrol:{n:'Барьерный патруль',ico:'⚔',role:['fight'],d:'Пройти над окопами и не пустить вражеские аэропланы к нашим позициям.'},
  intercept:{n:'Перехват разведчика',ico:'🔭',role:['fight'],d:'Вражеский двухместный разведчик снимает наши позиции. Сбить, пока не ушёл.'},
  balloon:{n:'Аэростат наблюдения',ico:'🎈',role:['fight'],d:'Привязной аэростат корректирует огонь батарей. Поджечь — под огнём зениток.'},
  recon:{n:'Фотосъёмка позиций',ico:'📷',role:['recon','fight','sea'],d:'Пройти над тремя точками в тылу врага на высоте до 2 км и вернуться со снимками.'},
  bomb:{n:'Бомбардировка станции',ico:'💣',role:['bomb','recon'],d:'Сбросить бомбы на узловую станцию в 6 км за линией фронта.'}};
// противник: аэроплан другой стороны, самый свежий к этому месяцу
function frFoeMd(s,role,t){const foeDe=s.country!=='de';const L=(AIR_RIVAL[role]||[]).filter(e=>e[0]<=t+0.01&&((AIR_RIVAL_C[e[1]]==='de')===foeDe));const e=L[L.length-1];
  if(e)return {...e[2],role,name:e[1]};const any=(AIR_RIVAL[role]||[]).filter(x=>x[0]<=t+0.01);const q=any[any.length-1]||(AIR_RIVAL.recon||[])[0];return {...q[2],role,name:q[1]};}
function frFoeC(s,t){if(s.country!=='de')return 'de';return t<1917.3?'fr':['fr','uk'][Math.floor(t*7)%2];}
function frHasFighters(t){return t>=1915.3;}
// вылеты месяца: по ролям ваших военных аэропланов
function frModels(s,roles){return (s.air.models||[]).filter(m=>roles.includes(m.role)&&(m.status==='prod'||m.status==='tool'||m.status==='sale'||(m.status==='proto'&&m.flown)||m.lic));}
function frMissions(s){const A=s.air;if(!A||!A.lv||!airWarOn(s.country,tNow(s)))return [];const T=mi(s),t=tNow(s),r=mulberry32(hashStr(s.country+'|front|'+T));
  let types=Object.keys(FR_T).filter(k=>frModels(s,FR_T[k].role).length&&(frHasFighters(t)||k==='recon'||k==='bomb'));if(!frHasFighters(t)&&frModels(s,['recon','fight','train','sport']).length&&!types.includes('recon'))types.push('recon');
  types=types.sort(()=>r()-0.5).slice(0,3);
  return types.map((k,i)=>({id:T+'_'+k,k,T,foes:k==='intercept'?1:k==='balloon'?(t>=1917?1:0):k==='recon'?(t>=1915.3?1+(r()<0.4?1:0):1):k==='bomb'?(t>=1916?1+(r()<0.5?1:0):0):1+(r()<0.45?1:0)+(t>=1917&&r()<0.3?1:0),
    ace:t>=1916&&t<1918.85&&r()<0.18}));}
function frStatus(s,m){const F=(s.air.front||{});return F[m.id]||null;}
/* ---------- карточка «Фронт» во вкладке «Небо» ---------- */
function airFrontHTML(s){const A=s.air,t=tNow(s),L=frMissions(s),F=A.fr||{v:0,n:0,lost:0};
  const era=t<1915.3?'Война 1914 года: аэропланы — глаза армии; лётчики стреляют друг в друга из карабинов и пистолетов.':t<1916.3&&s.country!=='de'?'«Бич Фоккера»: немецкий моноплан стреляет через винт — у союзников такого пулемёта ещё нет.':t<1917.4?'Над Верденом и Соммой — первые отряды истребителей и первые асы.':t<1917.5?'«Кровавый апрель»: «Альбатросы» господствуют в небе.':'Тысячи аэропланов над фронтом: SPAD, «Кэмелы», «Фоккер D.VII».';
  const pv=Object.entries(A.pv||{}).filter(([,v])=>v>0).map(([id,v])=>{const P=id==='hero'?{n:PIONEERS[s.pioneer].name}:AIR_PILOTS.find(x=>x.id===id)||{n:id};return `${esc(P.n)} — ${v} ${v>=5?'(ас)':''}`;}).join(', ');
  const rows=L.map(m=>{const T=FR_T[m.k],st=frStatus(s,m),md=frModels(s,T.role)[0];return `<div class="race-item"><div class="row"><div><h3>${T.ico} ${T.n}</h3><p class="small muted">${T.d}${m.foes?` Противник: ${m.foes} × ${esc(frFoeMd(s,m.k==='intercept'?'recon':'fight',t).name)}${m.ace?' — говорят, ведёт сам ас':''}.`:''}</p>
    ${st?`<p class="small ${st.ok?'good':'bad'}">${esc(st.txt)}</p>`:''}</div>${st?'':`<button class="btn sm primary" data-act="frGo" data-k="${m.k}">Вылет</button>`}</div></div>`;}).join('');
  return `<section class="card"><h2>⚔ Фронт</h2><p class="small muted" style="margin-top:4px">${era}</p>
    <p class="small" style="margin-top:6px">Вылетов: ${F.n||0} · побед: <b>${F.v||0}</b> · потерь: ${F.lost||0}${pv?` · ${pv}`:''}</p>
    ${rows||`<p class="small muted" style="margin-top:8px">Штабу нужны ваши военные аэропланы: истребители, разведчики, бомбардировщики. Постройте их — и вылеты появятся.</p>`}</section>`;}
// выбор аэроплана и лётчика для вылета
let FRS=null;
function openFront(k){const s=G,L=frMissions(s),m=L.find(x=>x.k===k);if(!m)return;const T=FR_T[k],mds=frModels(s,T.role.concat(frHasFighters(tNow(s))?[]:['sport','train'])),pils=airPilotList(s);
  FRS=FRS&&FRS.k===k?FRS:{k,md:mds[0]?mds[0].id:null,pid:(airBestPilot(s)||{}).id};const md=mds.find(x=>x.id===FRS.md)||mds[0];
  openSheet(`<div class="row"><h2>${T.ico} ${T.n}</h2>${X}</div><p class="small" style="margin-top:6px">${T.d}</p>
    <div class="label" style="margin-top:12px">Аэроплан</div>${mds.length?`<div class="chips">${mds.map(x=>`<button class="chip ${md&&x.id===md.id?'on':''}" data-act="frMd" data-v="${x.id}">${esc(x.name)}<small>${airSt(airStats(x,tNow(s)))}</small></button>`).join('')}</div>`:'<p class="small bad">Нет подходящего аэроплана.</p>'}
    <div class="label" style="margin-top:12px">Лётчик</div><div class="chips">${pils.map(p=>`<button class="chip ${FRS.pid===p.id?'on':''}" data-act="frPil" data-v="${p.id}">${esc(p.hero?p.n+' (вы)':p.n)}<small>мастерство ${Math.round(p.sk*100)}${(s.air.pv||{})[p.id]?' · побед '+s.air.pv[p.id]:''}</small></button>`).join('')}</div>
    ${md?`<div class="btns" style="margin-top:14px"><button class="btn primary" data-act="frFly">✈ Лететь (3D)</button><button class="btn" data-act="frAuto">Доверить лётчику</button></div>`:''}`);}
/* ---------- итог вылета ---------- */
function frApply(s,m,md,P,r){const A=s.air;A.front=A.front||{};A.fr=A.fr||{v:0,n:0,lost:0};A.pv=A.pv||{};const T=FR_T[m.k],who=P.hero?PIONEERS[s.pioneer].name:P.n;
  A.fr.n++;A.fr.v+=r.v||0;if(r.v)A.pv[P.id]=(A.pv[P.id]||0)+r.v;if(r.lost)A.fr.lost++;
  md.milRep=clamp((md.milRep||0)+(r.ok?2+(r.v||0)*1.5:-1)+(r.ace?6:0),-40,60);A.fame=clamp(A.fame+(r.ok?1+(r.v||0)*0.5:0)+(r.ace?4:0),0,100);
  if(r.hurt){if(P.hero)A.heroHurt=mi(s)+r.hurt;else{const p=(A.pil||[]).find(x=>x.id===P.id);if(p)p.hurt=mi(s)+r.hurt;}}
  A.front[m.id]={ok:!!r.ok,txt:r.txt};
  const n=A.pv[P.id]||0,aceNow=r.v&&n>=5&&n-r.v<5;
  pushEvent({own:1,kicker:'Фронт',title:r.ace?`${who} сбил аса!`:aceNow?`${who} — ас: пять побед на «${md.name}»`:r.ok?`${T.n}: задание выполнено`:`${T.n}: неудача`,deck:`${who} на «${md.name}»`,
    text:`${r.txt}${r.v?`\nПобед в этом вылете: ${r.v}. Всего у ${P.hero?'вас':who}: ${n}.`:''}\n${r.ok?`Об аэроплане «${md.name}» говорят в отрядах — штаб охотнее заказывает такие.`:`В отрядах ворчат: «${md.name}» не вытянул.`}`},true);}
// без съёмки: по качеству аэроплана против противника, мастерству лётчика и удаче
function frAuto(k){const s=G,m=frMissions(s).find(x=>x.k===k);if(!m||!FRS)return;const md=s.air.models.find(x=>x.id===FRS.md),P=airPilotList(s).find(p=>p.id===FRS.pid)||airBestPilot(s);if(!md)return;
  const t=tNow(s),role=md.role,q=airQ(md,t,role).q,foe=airStats(frFoeMd(s,m.k==='intercept'?'recon':'fight',t),t),me=airStats(md,t),r=Math.random;
  const edge=(me.v-foe.v)/Math.max(60,foe.v)*1.2+(foe.turn-me.turn)/Math.max(8,foe.turn)*0.6+(me.gun-foe.gun)*0.5+(P.sk-0.7)*1.1-(m.ace?0.25:0);
  const p=clamp(0.5+edge*0.6-(m.foes>1?0.08*(m.foes-1):0),0.12,0.9),ok=r()<p,v=ok&&['patrol','intercept'].includes(m.k)&&m.foes?1+(r()<p*0.4?1:0):0,lost=!ok&&r()<0.35;
  const T=FR_T[m.k],txt=ok?{patrol:'Патруль прошёл над окопами: вражеский аэроплан сбит, остальные ушли.',intercept:'Разведчик сбит над нашими позициями — снимки сгорели вместе с ним.',balloon:'Аэростат вспыхнул факелом, наблюдатели выпрыгнули с парашютами.',recon:'Все три снимка — в штабе: батареи врага на карте.',bomb:'Бомбы легли на пути и склады станции — пожар виден с наших окопов.'}[m.k]
    :lost?'Аэроплан сбит над линией фронта; лётчик ранен и выбрался к своим.':'Вернулся ни с чем: противник оказался сильнее.';
  frApply(s,m,md,P,{ok,v,lost,hurt:lost?2:0,ace:ok&&m.ace&&v>0,txt});closeSheet();save();render();}
/* ---------- вылет в 3D: мир «Фронт», враги, пулемёты, зенитки ---------- */
function frBullet(sh,dir,spread,side,dmg){const B=FL.bul||(FL.bul=[]);if(B.length>260)B.shift();const r=()=>(Math.random()-0.5)*2*spread,d=v3n([dir[0]+r(),dir[1]+r(),dir[2]+r()]),v=760;
  B.push({p:sh.slice(),v:[d[0]*v+(sh.vx||0),d[1]*v+(sh.vy||0),d[2]*v+(sh.vz||0)],t:1.6,side,dmg:dmg||1,tr:(FL.bulN=(FL.bulN||0)+1)%3===0});}
function frHit(a,k,dmg,M){if(a.crash||a.down)return;const W=a.m||700,base=0.05*Math.sqrt(700/Math.max(200,W))*dmg;a.hp-=base;
  if(k==='eng'){a.dmg.eng=Math.min(1,a.dmg.eng+0.14*dmg);if(Math.random()<0.04)a.dmg.fire=1;}else if(k==='pil'){a.dmg.pil=Math.min(1,a.dmg.pil+0.22*dmg);}else if(k==='wing')a.dmg.wing=Math.min(1,a.dmg.wing+0.035*dmg);
  else if(k==='tail')a.dmg.tail=Math.min(1,a.dmg.tail+0.05*dmg);else if(Math.random()<0.03)a.dmg.fire=1;
  if(a===FL.me){FLY.shake=0.6;if(Math.random()<0.3)flToast('Попадание!','bad');}
  if(a.hp<=0||a.dmg.pil>=1||a.dmg.fire>0&&a!==FL.me&&a.hp<0.6){if(a!==FL.me){a.down=1;a.eng.run=Math.random()<0.5?0:a.eng.run;a.spin=Math.random()<0.5?-1:1;if(M&&M.onDown)M.onDown(a);}else if(a.hp<=0){a.dmg.wing=1;}}}
function frBullets(dt,M){const B=FL.bul;if(!B||!B.length)return;const me=FL.me,tg=[me,...(M.foes||[])];
  for(let i=B.length-1;i>=0;i--){const b=B[i];b.t-=dt;if(b.t<=0){B.splice(i,1);continue;}const p0=b.p,p1=[p0[0]+b.v[0]*dt,p0[1]+b.v[1]*dt,p0[2]+b.v[2]*dt];b.p=p1;
    if(b.tr&&b.t>0.15)fwPart(p1[0],p1[1],p1[2],0,0,0,b.side===0?0.55:0.45,0,0.05,b.side===0?[255,214,140]:[255,170,110],-1.4);
    let hit=false;for(const a of tg){if(a.side===b.side||a.crash)continue;const c=a.p,dx=c[0]-p1[0],dy=c[1]-p1[1],dz=c[2]-p1[2];if(dx*dx+dy*dy+dz*dz>(a.mesh.r+40)*(a.mesh.r+40))continue;
      for(const h of a.mesh.hit){const w=[c[0]+a.rt[0]*h.x+a.up[0]*h.y+a.fw[0]*h.z,c[1]+a.rt[1]*h.x+a.up[1]*h.y+a.fw[1]*h.z,c[2]+a.rt[2]*h.x+a.up[2]*h.y+a.fw[2]*h.z];
        const sx=p1[0]-p0[0],sy=p1[1]-p0[1],sz=p1[2]-p0[2],L2=sx*sx+sy*sy+sz*sz,tt=clamp(((w[0]-p0[0])*sx+(w[1]-p0[1])*sy+(w[2]-p0[2])*sz)/Math.max(1e-6,L2),0,1),qx=p0[0]+sx*tt-w[0],qy=p0[1]+sy*tt-w[1],qz=p0[2]+sz*tt-w[2];
        if(qx*qx+qy*qy+qz*qz<h.r*h.r){frHit(a,h.k,b.dmg,M);hit=true;fwPart(w[0],w[1],w[2],0,0.5,0,0.4,1.5,0.4,[60,56,50],0.5);break;}}if(hit)break;}
    if(!hit&&M.ball&&!M.ball.burn&&b.side===0){const q=M.ball,dx=q.x-p1[0],dy=q.y-p1[1],dz=q.z-p1[2];if(dx*dx+dy*dy*0.4+dz*dz*0.25<81){q.hp-=0.045*b.dmg;hit=true;if(q.hp<=0){q.burn=FL.t;if(M.onBall)M.onBall();}}}
    if(hit)B.splice(i,1);else if(p1[1]<Math.max(0,fwHgt(FW.S,p1[0],p1[2]))){B.splice(i,1);
      // 0.39: наземная мишень (щит) — попадания считает комиссия
      if(M.gtg&&b.side===0){const g=M.gtg,dx=p1[0]-g.x,dz=p1[2]-g.z,c=Math.cos(g.a||0),sn=Math.sin(g.a||0),u=dx*c-dz*sn,v=dx*sn+dz*c;if(Math.abs(u)<(g.w||6)&&Math.abs(v)<(g.h||2.5)){g.hits=(g.hits||0)+1;fwPart(p1[0],p1[1]+0.4,p1[2],0,1.5,0,0.5,2,0.6,[240,236,220],0.7);if(M.onGtg)M.onGtg(g.hits);continue;}}
      if(Math.random()<0.3)fwPart(p1[0],p1[1]+0.3,p1[2],0,1,0,0.6,2,0.8,[120,108,90],0.35);}}}
// огонь из пулемётов: курсовые — по ручке «огонь», стрелок — сам по ближнему врагу в задней полусфере
function frGuns(a,dt,want,M){const g=a.gun;if(!g)return;g.cd-=dt;g.cdo=(g.cdo||0)-dt;const sh=[a.p[0]+a.fw[0]*(a.mesh.len*0.35)+a.up[0]*0.5,a.p[1]+a.fw[1]*(a.mesh.len*0.35)+a.up[1]*0.5,a.p[2]+a.fw[2]*(a.mesh.len*0.35)+a.up[2]*0.5];sh.vx=a.v[0];sh.vy=a.v[1];sh.vz=a.v[2];
  if(want&&g.fwd&&g.ammo>0&&g.cd<=0){g.cd=1/g.rate;g.ammo-=g.n;for(let i=0;i<g.n;i++){const off=g.n>1?(i?0.2:-0.2):0;frBullet([sh[0]+a.rt[0]*off,sh[1],sh[2]+a.rt[2]*off],a.fw,g.spread,a.side,1);}
    if(Math.random()<0.5)fwPart(sh[0]+a.fw[0]*1.5,sh[1],sh[2]+a.fw[2]*1.5,0,0,0,0.35,0,0.04,[255,230,170],-2);if(a===FL.me)frSnd('gun',1);else frSnd('gun',0.6/(1+Math.hypot(a.p[0]-FL.me.p[0],a.p[1]-FL.me.p[1],a.p[2]-FL.me.p[2])/60));}
  if(g.obs&&g.cdo<=0){const foes=a.side===0?(M.foes||[]):[FL.me];let best=null,bd=420;for(const f of foes){if(f.crash||f.down)continue;const d=Math.hypot(f.p[0]-a.p[0],f.p[1]-a.p[1],f.p[2]-a.p[2]);if(d<bd){const dir=[(f.p[0]-a.p[0])/d,(f.p[1]-a.p[1])/d,(f.p[2]-a.p[2])/d];if(d3(dir,a.fw)<0.35){bd=d;best=[f,dir,d];}}}
    if(best){g.cdo=g.obsRate;const [f,dir,d]=best,lead=d/760,tp=[f.p[0]+f.v[0]*lead,f.p[1]+f.v[1]*lead,f.p[2]+f.v[2]*lead],aim=v3n([tp[0]-a.p[0],tp[1]-a.p[1],tp[2]-a.p[2]]);frBullet([a.p[0]+a.up[0]*1.2,a.p[1]+a.up[1]*1.2,a.p[2]+a.up[2]*1.2],aim,g.obsSpread,a.side,0.9);}}}
function frGunOf(md,skill){const a=airParts(md).a,id=a.id;const fwd=a.gun>=0.6&&!a.obs||id==='w7';return {fwd,n:id==='w6'?2:1,rate:id==='w3'?8:10,ammo:id==='w6'?1000:id==='w3'?400:500,spread:0.012+(1-skill)*0.02,obs:!!a.obs,obsRate:id==='w1'?1.6:0.11,obsSpread:id==='w1'?0.03:0.022+(1-skill)*0.02,cd:0};}
// звуки боя: короткие очереди, разрывы зенитных снарядов
function frSnd(k,v){const c=AU.ctx;if(!c||!AU.on.sfx||v<0.03)return;const t=c.currentTime;if(k==='gun'){vNoise(t,0.035,0.2*v,'bandpass',1500,AU.fx);vNoise(t,0.05,0.12*v,'lowpass',380,AU.fx);}
  else if(k==='aa'){vNoise(t,0.5,0.45*v,'lowpass',260,AU.fx);vNoise(t,0.15,0.2*v,'bandpass',900,AU.fx);}else if(k==='boom'){vNoise(t,1.2,0.7*v,'lowpass',180,AU.fx);vNoise(t,0.4,0.35*v,'bandpass',600,AU.fx);}}
// ИИ врага: найти, зайти в хвост, стрелять с упреждением; если сели на хвост ему — вираж в сторону; подбит — уходит к своим со снижением
function frAI(a,dt,M){const me=FL.me,c=a.ctl;if(a.crash)return;
  if(a.down){c.aCmd=null;c.sx=a.spin*0.7;c.sy=-0.15;c.thr=0;c.lvl=false;if(Math.random()<dt*14)fwPart(a.p[0],a.p[1],a.p[2],0,0.6,0,2,10,7,a.dmg.fire?[30,28,26]:[70,68,66],0.6);if(a.dmg.fire&&Math.random()<dt*20)fwPart(a.p[0],a.p[1],a.p[2],0,0,0,1.2,1,0.3,[255,150,60],-1.6);return;}
  if(a.dmg.eng>0.3&&Math.random()<dt*6)fwPart(a.p[0],a.p[1],a.p[2],0,0.5,0,1,5,3,[90,88,86],0.4);
  const tg=a.target==='me'?me:null,ai=a.ai;ai.t=(ai.t||0)+dt;
  if(a.kind==='recon'){// разведчик: ходит галсами над целью, стрелок отбивается
    const P=ai.track[ai.i];if(Math.hypot(P[0]-a.p[0],P[1]-a.p[2])<200)ai.i=(ai.i+1)%ai.track.length;flAuto(a,{x:P[0],z:P[1],alt:ai.alt,thr:0.9,bank:0.45,floor:300});frGuns(a,dt,false,M);
    if(ai.done||a.hp<0.35){ai.done=1;flAuto(a,{x:a.p[0],z:a.p[2]+(s_foeDir())*4000,alt:ai.alt,thr:1,bank:0.5});}return;}
  if(me.crash||!tg){flAuto(a,{x:a.p[0],z:a.p[2]+s_foeDir()*3000,alt:ai.alt,thr:0.8});return;}
  const d=[me.p[0]-a.p[0],me.p[1]-a.p[1],me.p[2]-a.p[2]],dist=l3(d);
  if(ai.st==='wait'){flAuto(a,{x:ai.home[0],z:ai.home[1],alt:ai.alt,thr:0.75,bank:0.4});if(dist<(ai.see||4200))ai.st='attack';frGuns(a,dt,false,M);return;}
  if(a.hp<0.35&&ai.st!=='flee'){ai.st='flee';}
  if(ai.st==='flee'){flAuto(a,{x:a.p[0],z:a.p[2]+s_foeDir()*5000,alt:a.p[1]-200,thr:1,bank:0.6,dive:0.3});frGuns(a,dt,false,M);return;}
  // на хвосте у нас враг (то есть игрок) — уходит виражом
  const back=[-d[0]/dist,-d[1]/dist,-d[2]/dist],meAim=d3(me.fw,[-back[0],-back[1],-back[2]]);
  if(ai.st==='attack'&&dist<320&&d3(a.fw,back)>0.4&&meAim<-0.85&&Math.random()<dt*0.6){ai.st='evade';ai.until=ai.t+1.5+Math.random()*2.5;ai.dir=Math.random()<0.5?-1:1;}
  if(ai.st==='evade'){flAuto(a,{hdg:flHdg(a)+ai.dir*1.6,alt:a.p[1]-30,thr:1,bank:1.35,edge:1,floor:150});if(ai.t>ai.until)ai.st='attack';frGuns(a,dt,false,M);return;}
  const lead=dist/760,tp=[me.p[0]+me.v[0]*lead,me.p[1]+me.v[1]*lead,me.p[2]+me.v[2]*lead];
  flAuto(a,{x:tp[0],z:tp[2],alt:tp[1],thr:1,bank:1.3,edge:1,floor:120,dive:0.45,climbK:1.2});
  const aim=v3n([tp[0]-a.p[0],tp[1]-a.p[1],tp[2]-a.p[2]]);frGuns(a,dt,dist<380&&d3(aim,a.fw)>0.993-(1-ai.sk)*0.006,M);}
function s_foeDir(){return 1;}// враг — на севере (z больше линии фронта)
function frMission(cfg,M){const s=G,t=tNow(s),md=cfg.md,P=cfg.pil,m=cfg.fm,T=FR_T[m.k],fz=FW_SC.front.front.z,me=()=>FL.me;
  M.title=T.n;M.place='front';M.mood=['clear','cloudy','cloudy','overcast','morning'][hashStr(m.id)%5];M.parked=[{...md,paint:md.paint}];M.warpMax=4;M.guns=true;M.bombs=airParts(md).a.bomb>0&&m.k==='bomb';M.foes=[];M.side=0;
  M.start={x:-60,z:-380,hdg:0};M.kills=0;M.obj=0;M.hits=0;
  const foeC=frFoeC(s,t),mk=(role,o)=>{const fm=frFoeMd(s,role,t);fm.paint=o.ace?'#b31d1d':s.country==='de'?(t<1917?'#b7bcc0':'#6c6a40'):(t<1916.5?'#b7a988':['#6c6a40','#7a5a3a','#5a6a4a'][Math.floor(Math.random()*3)]);
    const a=flCraft(fm,t,{trimK:3,lvlK:1.4,rnd:Math.random});a.md=fm;a.side=1;a.kind=role==='recon'?'recon':'fight';a.hp=1;a.target='me';a.mesh=null;a.c=foeC;a.ai={st:'wait',home:o.home,alt:o.alt,sk:o.ace?0.95:0.55+Math.random()*0.3,see:o.see,track:o.track,i:0};a.ace=o.ace;
    flPlace(a,o.p[0],o.p[2],o.hdg||Math.PI,{h:o.p[1],v:a.st.vc/3.6,thr:0.8});a.gun=frGunOf(fm,a.ai.sk);M.foes.push(a);return a;};
  const gy=()=>FW?FW.S.A.y:60,ace=m.ace?(AIR_ACES.filter(x=>x.c===foeC&&x.y[0]<=t&&x.y[1]>=t)[0]||null):null;
  if(m.k==='patrol'){for(let i=0;i<m.foes;i++)mk('fight',{p:[(i-0.5)*500,gy()+1500+i*150,fz+3800+i*300],home:[(i-0.5)*900,fz+600],alt:gy()+1400,see:3800,ace:ace&&i===0});
    M.goalT=()=>M.kills?`Сбито: ${M.kills}. Возвращайтесь за линию окопов.`:`Патрулируйте над окопами (${Math.round(fz/1000*10)/10} км к северу), ищите противника.`;M.tgt=()=>M.kills||M.obj?null:[0,undefined,fz,'окопы'];}
  if(m.k==='intercept'){const tr=[[-2500,fz-1600],[2500,fz-1200],[2500,fz-2600],[-2500,fz-2200]];mk('recon',{p:[-2500,gy()+1700,fz-1600],home:tr[0],alt:gy()+1700,track:tr,see:9e9,hdg:Math.PI/2});M.foes[0].ai.st='go';
    if(t>=1917&&m.foes>1)mk('fight',{p:[-2200,gy()+2000,fz-1300],home:[0,fz-1500],alt:gy()+1900,see:2500,ace:!!ace});
    M.goalT=()=>M.obj?'Разведчик сбит! Можно возвращаться.':'Найдите и сбейте разведчика над нашими позициями.';M.tgt=()=>M.obj?null:(f=>f?[f.p[0],f.p[1],f.p[2],'разведчик']:null)(M.foes[0]);}
  if(m.k==='balloon'){const bx=(hashStr(m.id)%3-1)*1500,bz=fz+1700;M.ball={x:bx,z:bz,y:0,hp:1,burn:0};M.objs.push({k:'aa',x:bx+300,z:bz+200},{k:'aa',x:bx-350,z:bz-150},{k:'aa',x:bx+50,z:bz-400});
    for(let i=0;i<m.foes;i++)mk('fight',{p:[bx,gy()+1300,bz+2500],home:[bx,bz],alt:gy()+1100,see:2600,ace:ace&&i===0});
    M.goalT=()=>M.ball.burn?'Аэростат горит! Уходите за линию окопов.':'Аэростат — в 1,7 км за окопами врага. Зенитки бьют — не летите прямо.';M.tgt=()=>M.ball.burn?null:[M.ball.x,M.ball.y,M.ball.z,'аэростат'];M.aaZ=[fz,bz+800];}
  if(m.k==='recon'){M.pts=[[-1200,fz+1500],[900,fz+2600],[-400,fz+3600]].map(p=>({x:p[0],z:p[1],ok:0}));M.aaZ=[fz,fz+4500];
    for(let i=0;i<m.foes;i++)mk('fight',{p:[(i?1:-1)*1800,gy()+1800,fz+5200],home:[0,fz+2600],alt:gy()+1600,see:3000,ace:ace&&i===0});
    M.goalT=()=>{const n=M.pts.filter(p=>p.ok).length;return n<3?`Снимки: ${n} из 3 — пройдите над точками ниже 2 000 м.`:'Снимки есть! Домой — за линию окопов.';};M.tgt=()=>{const p=M.pts.find(q=>!q.ok);return p?[p.x,undefined,p.z,'снимок']:null;};}
  if(m.k==='bomb'){const tx=(hashStr(m.id)%3-1)*1200,tz=fz+6000;M.objs.push({k:'station',x:tx,z:tz},{k:'aa',x:tx+400,z:tz+200},{k:'aa',x:tx-450,z:tz-250});M.tg={x:tx,z:tz,hit:0};M.aaZ=[fz,tz+1500];M.bombsLeft=Math.max(2,Math.min(8,Math.ceil(airParts(md).a.bomb/50)));
    for(let i=0;i<m.foes;i++)mk('fight',{p:[tx+(i?1:-1)*1000,gy()+1600,tz+1800],home:[tx,tz-1000],alt:gy()+1500,see:3200,ace:ace&&i===0});
    M.goalT=()=>M.tg.hit?`Попаданий: ${M.tg.hit}. Домой — за линию окопов!`:`Станция — в 6 км за линией фронта. Бомбы: ${M.bombsLeft}. Сбрасывайте над целью (кнопка «Бомбы»).`;M.tgt=()=>M.tg.hit?null:[M.tg.x,undefined,M.tg.z,'станция'];}
  M.onDown=a=>{M.kills++;if(a.kind==='recon'&&m.k==='intercept')M.obj=1;if(m.k==='patrol')M.obj=1;flToast(a.ace?`Сбит ас — ${ace?ace.n:''}!`:'Сбит!','good');if(a.ace)M.aceDown=1;};
  M.onBall=()=>{M.obj=1;flToast('Аэростат горит!','good');frSnd('boom',1);};
  M.goal=()=>`<b>${T.n}</b><span>${M.goalT()}${(FL.me&&FL.me.gun)?` · патроны ${FL.me.gun.ammo}`:''}</span>`;
  M.target=()=>{const t2=M.tgt();if(t2)return t2;return [0,undefined,0,'аэродром'];};
  M.board=()=>M.foes.length?`<b>Противник</b>${M.foes.map(a=>`<p>${esc(a.md.name)}${a.ace&&ace?' ('+esc(ace.n)+')':''} — ${a.crash||a.down?'сбит':a.hp<0.5?'подбит':'в воздухе'}</p>`).join('')}`:'';
  M.init=()=>{const a=me();a.side=0;a.gun=frGunOf(md,P.sk);a.mesh=FL.meMesh;M.foes.forEach(f=>{f.mesh=air3dMesh(f.md,t,f.c);});if(M.ball){M.ball.y=Math.max(0,fwHgt(FW.S,M.ball.x,M.ball.z))+750;M.ballMesh=frBallMesh();}};
  M.ai=(dt)=>{const a=me();if(!a.gun){M.init();}
    frGuns(a,dt,FL.fire&&!a.crash,M);for(const f of M.foes){frAI(f,dt,M);flStep(f,dt);}frBullets(dt,M);
    // зенитки: над вражеской стороной — разрывы рядом, точнее, если лететь прямо
    if(M.aaZ&&!a.crash&&a.p[2]>M.aaZ[0]+300&&a.p[2]<M.aaZ[1]+2000&&!a.gnd){M.aaT=(M.aaT||0)-dt;M.straight=(M.straight||0)+(Math.abs(a.w[0])+Math.abs(a.w[2])<0.08?dt:-dt*2);M.straight=clamp(M.straight,0,12);
      if(M.aaT<=0){M.aaT=1.2+Math.random()*1.8;const err=Math.max(18,140-M.straight*9),q=[a.p[0]+a.v[0]*1.5+(Math.random()-0.5)*err*2,a.p[1]+a.v[1]*1.5+(Math.random()-0.5)*err,a.p[2]+a.v[2]*1.5+(Math.random()-0.5)*err*2];
        for(let k=0;k<5;k++)fwPart(q[0]+(Math.random()-0.5)*4,q[1]+(Math.random()-0.5)*4,q[2]+(Math.random()-0.5)*4,(Math.random()-0.5)*2,(Math.random()-0.5)*2,(Math.random()-0.5)*2,5,14,6,[30,28,26],0.75);fwPart(q[0],q[1],q[2],0,0,0,4,4,0.15,[255,200,120],-2);
        const d=Math.hypot(q[0]-a.p[0],q[1]-a.p[1],q[2]-a.p[2]);frSnd('aa',Math.min(1,60/Math.max(20,d)));if(d<26){frHit(a,['wing','fus','tail','eng'][Math.floor(Math.random()*4)],2,M);flToast('Шрапнель!','bad');}}}
    // аэростат горит и падает
    if(M.ball&&M.ball.burn){const q=M.ball,k=FL.t-q.burn;if(k<20){q.y-=dt*(4+k*1.5);if(Math.random()<dt*30)fwPart(q.x+(Math.random()-0.5)*8,q.y+(Math.random()-0.5)*6,q.z+(Math.random()-0.5)*14,0,2,0,3,9,4,k<6?[255,140,40]:[40,36,32],k<6?-1.5:0.6);}}
    // снимки и бомбы
    if(M.pts){for(const p of M.pts){if(!p.ok&&Math.hypot(a.p[0]-p.x,a.p[2]-p.z)<320&&a.p[1]-Math.max(0,fwHgt(FW.S,p.x,p.z))<2000){p.ok=1;flToast('Снимок!','good');if(M.pts.every(q=>q.ok))M.obj=1;}}}
    frBombs(dt,M,a,(d)=>{if(d<75){M.tg.hit++;M.obj=1;flToast('Попадание в станцию!','good');}});};
  M.step=()=>{const a=me();if(a.crash){M.done(false);return;}const home=a.p[2]<fz-600;if(a.gnd&&a.Vg<2.5&&M.flew){M.done(!!M.obj&&Math.hypot(a.p[0],a.p[2])<1500||!!M.obj&&home);return;}if(!a.gnd)M.flew=1;};
  M.canLand=()=>{const a=me();return M.flew&&!a.gnd&&M.obj&&a.p[2]<fz-600;};M.land=()=>M.done(true);
  M.quitText=()=>'Вылет не засчитан — в отряде скажут, что вы повернули назад.';M.quit=()=>{M.res={ok:false,v:M.kills,txt:'Вернулся, не выполнив задания.'};M.over=true;M.apply();flyClose();};
  M.done=(ok)=>{const a=me(),lost=!!a.crash,overFoe=a.p[2]>fz;const txt=ok?{patrol:'Патруль выполнен.',intercept:'Разведчик сбит.',balloon:'Аэростат сожжён.',recon:'Снимки доставлены в штаб.',bomb:`Станция под бомбами: попаданий ${M.tg?M.tg.hit:0}.`}[m.k]+(M.kills?` Сбито: ${M.kills}.`:''):lost?(overFoe?`Сбит над вражескими окопами — ${P.hero?'вас':'лётчика'} вытащили пехотинцы ночью, ранен.`:`Аэроплан разбит (${a.crash}); ${P.hero?'вы ранены':'лётчик ранен'}.`):'Задание не выполнено.';
    M.res={ok:!!ok,v:M.kills,lost,hurt:lost?2:0,ace:!!M.aceDown,txt};M.fin(ok?'Задание выполнено!':lost?'Сбит':'Неудача',txt,M.res,ok?'good':'bad');};
  M.apply=()=>{frApply(s,m,md,P,M.res);};M.fallback=()=>{FRS={k:m.k,md:md.id,pid:P.id};frAuto(m.k);};
  return M;}
// бомбы: сброс по кнопке (не чаще раза в 0,6 с), падение с сопротивлением, разрыв у земли; onHit(d) — промах до цели M.tg (0.39: общее для фронта и военных конкурсов)
function frBombs(dt,M,a,onHit){if(M.tg&&FL.bomb&&!M.bombT&&M.bombsLeft>0&&!a.gnd){M.bombT=0.6;M.bombsLeft--;(M.drops||(M.drops=[])).push({p:a.p.slice(),v:a.v.slice(),h0:a.p[1]-Math.max(0,fwHgt(FW.S,a.p[0],a.p[2]))});if(M.onDrop)M.onDrop();}if(M.bombT)M.bombT=Math.max(0,M.bombT-dt);
  if(M.drops)for(let i=M.drops.length-1;i>=0;i--){const b=M.drops[i];b.v[1]-=FLG*dt;b.v[0]*=1-dt*0.05;b.v[2]*=1-dt*0.05;b.p[0]+=b.v[0]*dt;b.p[1]+=b.v[1]*dt;b.p[2]+=b.v[2]*dt;const g=Math.max(0,fwHgt(FW.S,b.p[0],b.p[2]));
    if(b.p[1]<=g){M.drops.splice(i,1);for(let k=0;k<14;k++)fwPart(b.p[0]+(Math.random()-0.5)*10,g+2,b.p[2]+(Math.random()-0.5)*10,(Math.random()-0.5)*8,6+Math.random()*10,(Math.random()-0.5)*8,4,16,5,k<4?[255,160,60]:[70,62,52],k<4?-1.5:0.7,3);frSnd('boom',Math.min(1,300/Math.max(50,Math.hypot(b.p[0]-a.p[0],b.p[2]-a.p[2]))));
      if(onHit)onHit(Math.hypot(b.p[0]-M.tg.x,b.p[2]-M.tg.z),b);}}}
// аэростат наблюдения «колбаса»: оболочка, стабилизаторы, корзина
function frBallMesh(){const C=G3.cache;if(C.frBall)return C.frBall;const mb=new MB();pBlob(mb,0,0,0,6.2,6.2,14,'#b8b090',()=>0.5,1,MID.cloth);for(const a of [0,2.1,4.2])pBlob(mb,Math.cos(a)*4.5,Math.sin(a)*4.5,-11,2.2,2.2,3.5,'#a8a080',()=>0.5,0,MID.cloth);
  pBox(mb,0,-12,2,0.8,1.1,0.8,'#6a5a40',MID.wood);mb.rod([0,-6,1],[0,-11,2],0.04,hex2rgb('#2a2a2a'),MID.metal);return C.frBall={mesh:{op:g3Mesh(mb),pr:null,disc:null,pil:null,props:[],r:16,span:12,hit:[]}};}
