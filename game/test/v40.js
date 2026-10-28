// 0.40: поворачиваемость (держалка гасит только лишнее), руль с кнопок, лёгкие уровни (DIFFS, полёт, соперники в небе),
// предел ветра по роду полёта («летим боком»), камера полёта, перелёт — посадка и зачёт у цели, наклон кузова и стена серпантина.
// node game/test/v40.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
SCN_OFF=true;Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
/* ---------- уровни сложности ---------- */
{const D=DIFFS;ok(D.kids.cash>D.easy.cash&&D.easy.cash>D.normal.cash&&D.normal.cash>D.hard.cash,'деньги на старте: Юный > Лёгкая > Норма > Магнат');
  ok(D.kids.race<D.easy.race&&D.easy.race<D.normal.race&&D.normal.race<1&&D.hard.race>=1,'соперники в гонках: на Юном, Лёгкой и Норме медленнее, на Магнате — нет ('+[D.kids.race,D.easy.race,D.normal.race,D.hard.race].join('/')+')');
  ok(D.kids.air<D.normal.air&&D.normal.air<1&&D.hard.air===1&&D.hist.air===1,'соперники в небе: Юный '+D.kids.air+', Норма '+D.normal.air+', Магнат и Историк — как в истории');
  ok(D.kids.fly.stall<0&&D.easy.fly.stall<0&&D.normal.fly.stall<D.hard.fly.stall&&D.hard.fly.stall===D.hist.fly.stall,'полёт: на Юном и Лёгкой ручка не пускает за срыв, Магнат и Историк без изменений');
  ok(D.kids.fly.wind<D.easy.fly.wind&&D.easy.fly.wind<D.normal.fly.wind&&D.normal.fly.wind<=1&&D.kids.fly.fuel>1&&D.kids.fly.fail<1,'ветер, бензин и отказы по уровням');
  ok(D.normal.debt>15000&&D.kids.debt>D.easy.debt,'кредит больше: Норма '+D.normal.debt+', Юный '+D.kids.debt);}
/* ---------- поворачиваемость автомобиля ---------- */
newGame('renault','fr','T','normal');G.cash=1e6;
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:1910,key:'v40-steer',terr:'macadam'});
const mdC=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>mdC[k]=a[k]);mdC.b=lastOf(BODIES,rc.y,x=>!x.truck&&!x.moto).id;}
const mdM=Object.assign({},mdC,{cls:'moto'});{const a=aiMotoMd(rc.y);['e','g','c','k','w'].forEach(k=>{if(a[k]!==undefined)mdM[k]=a[k];});mdM.b=lastOf(BODIES,rc.y,x=>x.moto&&!x.side).id;}
const su0=surfUnder;
function drive(md,script,T,V0,win){startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});
  const me=R.me;R.cars=[me];R.t=0.001;me.vx=V0;me.gear=me.gr.length;me.lat=0;const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;
  R.trk.bar=R.trk.bar.map(()=>null);R.trk.segCol=[];R.trk.col=[];surfUnder=(c,trk,lat)=>su0(c,trk,0);const dr0=dropUnder,gr0=gradeAt;dropUnder=()=>0;gradeAt=()=>0;
  const dt=1/60;let f=0,acc={r:0,v:0,d:0,b:0,n:0},mxB=0,maxSteer=0;
  while(f<T*60){f++;const tt=f*dt,k=script(tt);rKeys.left=!!k.l;rKeys.right=!!k.r;rKeys.gas=me.vx<V0;rKeys.brake=false;R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;
    const b=Math.atan2(me.vy,Math.max(1,me.vx));mxB=Math.max(mxB,Math.abs(b));maxSteer=Math.max(maxSteer,Math.abs(me.steer));
    if(win&&tt>win[0]&&tt<win[1]){acc.n++;acc.r+=me.r;acc.v+=me.vx;acc.d+=me.delta;acc.b+=b;}}
  const out={lat:me.lat,mxB:mxB*57.3,mu:me.muNow,L:me.L,maxSteer};if(acc.n){out.R=(acc.v/acc.n)/Math.max(1e-3,Math.abs(acc.r/acc.n));out.Rk=me.L/Math.max(1e-3,Math.abs(Math.tan(acc.d/acc.n)));out.g=(acc.v/acc.n)*Math.abs(acc.r/acc.n)/9.81;out.b=acc.b/acc.n*57.3;}
  surfUnder=su0;dropUnder=dr0;gradeAt=gr0;finishRace(true);closeSheet();closePaper();G.pending=[];return out;}
{const a=drive(mdC,t=>({r:t>0.2&&t<2.7}),3,25/3.6,[1.8,2.6]);
  ok(a.R<a.Rk*1.8&&a.g>0.7,'автомобиль, 25 км/ч, руль до упора: радиус '+a.R.toFixed(1)+' м при геометрии '+a.Rk.toFixed(1)+' м, '+a.g.toFixed(2)+' g (было 11,6 м и 0,42 g — «как по рельсам»)');
  const b=drive(mdC,t=>({r:t>0.2&&t<2.7}),3,40/3.6,[1.8,2.6]);
  ok(b.g>0.8&&b.g<b.mu*1.05,'40 км/ч: '+b.g.toFixed(2)+' g при сцеплении '+b.mu.toFixed(2)+' — шины работают, фальшивой прибавки нет');
  const c=drive(mdC,t=>({r:t>0.2&&t<2.7}),3,80/3.6,[1.8,2.6]);
  ok(c.g<c.mu*1.08&&c.g>c.mu*0.85&&c.mxB<9,'80 км/ч: '+c.g.toFixed(2)+' g при сцеплении '+c.mu.toFixed(2)+' (было 1,20 g), занос не больше '+c.mxB.toFixed(1)+'°');
  const d=drive(mdC,t=>({r:t>0.2&&t<0.7,l:t>1.3&&t<1.8}),3.5,40/3.6);
  ok(Math.abs(d.lat)>5&&d.mxB<5,'перестроение на 40 км/ч за полсекунды руля — '+Math.abs(d.lat).toFixed(1)+' м вбок (было 4,1), без заноса');
  const e=drive(mdC,t=>({r:t>0.2&&t<0.35}),2.5,40/3.6);
  ok(Math.abs(e.lat)>0.4&&Math.abs(e.lat)<2,'касание 0,15 с — лёгкая поправка на '+Math.abs(e.lat).toFixed(1)+' м');
  const m=drive(mdM,t=>({r:t>0.2&&t<2.7}),3,25/3.6,[1.8,2.6]);
  ok(m.R<7.5&&m.g>0.65&&m.mxB<10,'мотоцикл, 25 км/ч: радиус '+m.R.toFixed(1)+' м, '+m.g.toFixed(2)+' g (было 7,5 м и 0,66 g)');
  const m2=drive(mdM,t=>({r:t>0.2&&t<2.7}),3,60/3.6,[1.8,2.6]);
  ok(m2.g<m2.mu*1.08&&m2.mxB<9,'мотоцикл, 60 км/ч: '+m2.g.toFixed(2)+' g при сцеплении '+m2.mu.toFixed(2)+' (было 1,11 g — больше, чем держит шина)');}
/* ---------- стена серпантина и наклон кузова ---------- */
{const T=R&&R.trk;let trk=null;for(const r of RACES){if(!/serp|mount|alp/.test((r.terr||'')+(r.key||'')+(r.t||'')))continue;}
  // ищем трассу с серпантином: в DIFF-независимой сборке трасс достаточно горных гонок
  const cand=RACES.filter(r=>r.terr==='mount'||r.uphill||/klausen|semmering|arlberg|turbie|targa/.test(r.key||''));let found=null;
  for(const r of cand){try{startRace({rc:Object.assign({},r,{y:Math.max(r.y||1906,1906)}),mode:'drive',entries:[{drv:'me',md:mdC,prep:2,tyre:'soft',gear:0}]});}catch(e){continue;}
    const S=R.trk.segT;for(let i=0;i<R.trk.n;i++)if(S[i]===RSEG.serp&&R.trk.bar[i]&&(R.trk.bar[i].L||R.trk.bar[i].R)){found={key:r.key,i,bar:R.trk.bar[i],W:R.trk.W,K:R.trk.K[i]};break;}
    finishRace(true);closeSheet();closePaper();G.pending=[];if(found)break;}
  ok(!!found,'на серпантине со стороны скалы стоит стена: '+(found?found.key+' сегмент '+found.i+' '+JSON.stringify(found.bar)+' при W/2+3,2 = '+(found.W/2+3.2).toFixed(1):'не найдено'));
  if(found){const side=found.K>0?'L':'R';ok(found.bar[side]===found.W/2+3.2&&!found.bar[side==='L'?'R':'L'],'стена — со стороны горы ('+side+'), к обрыву стены нет');}
  // наклон кузова: clamp ±0.5 в r3dCarUpdate
  const src=r3dCarUpdate.toString();ok(/clamp\\(\\(T\\.pts\\[i2\\]\\[1\\]-T\\.pts\\[i1\\]\\[1\\]\\)\\/\\(2\\*T\\.step\\)\\+pm,-0\\.5,0\\.5\\)/.test(src)&&/,-0\\.5,0\\.5\\),ls=clamp\\(/.test(src),'наклон кузова по дороге ограничен ±0,5 (27°) и вдоль, и поперёк');}
/* ---------- полёт: уровни, ветер, перелёт ---------- */
{const land={H:()=>30,surf:()=>'grass',obst:()=>null,S:{seed:1,fields:[{x:0,z:0,r:450}],towns:[{x:1800,z:0,city:0}]}};FW=land;FL.noFail=true;fwHgt=()=>30;
  const mk=(y,role,o)=>{const e=airRefEntry(role,y),md={...e[2],role,name:e[1]};return flCraft(md,y,{rnd:()=>0.3,...(o||{})});};
  G.diff='kids';const k=mk(1912,'sport');G.diff='hard';const h=mk(1912,'sport');G.diff='normal';
  ok(k.dif.stall<0&&h.dif.stall>0&&k.dif.fuel>1&&h.dif.fuel===1,'аэроплан берёт уровень: Юный stall '+k.dif.stall+' fuel '+k.dif.fuel+', Магнат stall '+h.dif.stall);
  // ручка на себя до упора: на Юном угол атаки не доходит до срыва, на Магнате — срыв
  const pull=(ac)=>{flPlace(ac,0,0,0,{h:300,v:ac.Vs*1.5,thr:0.8});let st=0,T=0;const dt=1/120;while(T<6&&!ac.crash){ac.ctl.sy=1;ac.ctl.thr=0.8;flStep(ac,dt);T+=dt;if(ac.stall)st++;}return st;};
  const sK=pull(k),sH=pull(h);ok(sK===0&&sH>0,'ручка до упора: на Юном срыва нет ('+sK+' шагов), на Магнате крыло срывается ('+sH+')');
  // бензин: на Юном расход меньше
  const burn=(ac)=>{flPlace(ac,0,0,0,{h:300,v:ac.Vs*1.5,thr:1});const f0=ac.fuel;for(let i=0;i<1200;i++){ac.ctl.thr=1;ac.ctl.sy=0;flStep(ac,1/60);}return f0-ac.fuel;};
  const bK=burn(mk(1912,'sport',{dif:Object.assign({},FLY_DIF0,{fuel:1.3})})),bH=burn(mk(1912,'sport',{dif:FLY_DIF0}));ok(bK<bH*0.85,'расход бензина на Юном в 1,3 раза меньше: '+bK.toFixed(2)+' против '+bH.toFixed(2)+' кг');
  // ветер: предел по роду полёта и скорости
  const c1=wxCap('cross',60),c2=wxCap('cross',180),c3=wxCap('test',60);
  ok(c1<c2&&c3<c1&&c1<3.5&&c1>2,'предел ветра: перелёт на 60 км/ч — '+c1.toFixed(1)+' м/с, на 180 км/ч — '+c2.toFixed(1)+', первый полёт на 60 — '+c3.toFixed(1));
  let capped=0,waited=0,N=0;for(let sd=1;sd<60;sd++){const wx=wxMake({place:'channel',y:1909,m:7,seed:sd,sea:true,kind:'cross',vc:60});N++;if(wx.ws<=wx.cap+1e-9)capped++;if(wx.wait)waited++;}
  ok(capped===N&&waited>0,'Ла-Манш 1909, аэроплан 60 км/ч: ветер всегда в пределе ('+capped+' из '+N+'), в '+waited+' случаях ждали затишья');
  const w0=wxMake({place:'channel',y:1909,m:7,seed:3,sea:true,kind:'cross',vc:60});ok(!w0.wait||/ждали затишья/.test(w0.name),'в сводке — сколько ждали: '+w0.name);
  // на Юном ветер слабее
  G.diff='kids';const wk=wxMake({place:'atlantic',y:1925,m:10,seed:11,sea:true,kind:'cross',vc:200});G.diff='hard';const wh=wxMake({place:'atlantic',y:1925,m:10,seed:11,sea:true,kind:'cross',vc:200});G.diff='normal';
  ok(wk.ws<wh.ws*0.8&&wk.therm<=wh.therm,'Атлантика 1925, одно зерно: ветер на Юном '+wk.ws.toFixed(1)+' м/с, на Магнате '+wh.ws.toFixed(1));
  // камера полёта смотрит больше по носу, чем по пути
  ok(/v\\[0\\]\\/sp\\*0\\.25\\+me\\.fw\\[0\\]\\*0\\.75/.test(flyCam.toString()),'камера сзади: 0,25 по пути + 0,75 по носу');
  // соперники в небе слабее на Юном
  const ev=AIR_EV.find(e=>e.kind==='speed');if(ev){G.diff='normal';const Fn=airEvField(G,ev);G.diff='kids';const Fk=airEvField(G,ev);G.diff='hard';const Fh=airEvField(G,ev);G.diff='normal';
    ok(Fk[0].v<Fn[0].v&&Fn[0].v<Fh[0].v&&Math.abs(Fk[0].v/Fh[0].v-DIFFS.kids.air)<0.02,'соперники в гонке «'+ev.name+'»: Юный '+Fk[0].v+' км/ч, Норма '+Fn[0].v+', Магнат '+Fh[0].v);}
  FW=undefined;FL.noFail=false;}
/* ---------- перелёт: автопилот садится у цели, прибытие ---------- */
{G.diff='normal';const evc=AIR_EV.find(e=>e.kind==='cross'&&e.place==='channel')||AIR_EV.find(e=>e.kind==='cross');
  const y=Math.max(evc.y||1909,1909);const e=airRefEntry('sport',y),md={...e[2],role:'sport',name:e[1],id:901};airInit(G).models.push(md);
  let landed=0,msg=[];flToast=(t)=>msg.push(t);
  const W={H:()=>30,surf:()=>'grass',obst:()=>null,S:{seed:1,fields:[{x:-9500,z:0,r:450},{x:9500,z:0,r:450}],towns:[],B:{y:30},A:{y:30}},sea:false};FW=W;fwHgt=()=>30;
  FL.me=null;FL.mi=null;FL.noFail=true;FLY.landing=null;FLY.auto=true;FLY.thrT=1;FL.t=3600;FL.k=1;
  const P=airPilotList(G)[0]||{id:1,n:'лётчик',sk:0.8};const M=flMission({md,pil:P,ev:evc,kind:'cross',place:'channel'});FL.mi=M;
  const ac=flCraft(md,y,{rnd:()=>0.3});FL.me=ac;M.flew=1;
  // стоим на земле у цели — прибытие: газ убран, зачёт при остановке
  flPlace(ac,9000,0,Math.PI/2);ac.v=[6,0,0];ac.Vg=6;ac.gnd=1;let fin=null;M.fin=(t,x,res)=>{fin=res;};
  M.step();ok(M.arrived===1&&FLY.thrT===0&&ac.ctl.thr===0&&msg.some(m=>/Газ убран/.test(m)),'сели в 500 м от цели: прибытие, газ убран — «'+msg[msg.length-1]+'»');
  ac.Vg=1;M.step();ok(fin&&fin.ok&&/долетел/.test(fin.txt),'остановились — перелёт засчитан: '+(fin&&fin.txt));
  // в воздухе в 2 км от цели автопилот сам заходит на посадку
  const M2=flMission({md,pil:P,ev:evc,kind:'cross',place:'channel'});FL.mi=M2;M2.flew=1;M2.fin=()=>{};const ac2=flCraft(md,y,{rnd:()=>0.3});FL.me=ac2;flPlace(ac2,7400,0,Math.PI/2,{h:400,v:ac2.Vs*1.5,thr:0.8});
  FLY.landing=null;FLY.auto=true;const gE=document.getElementById;document.getElementById=()=>({classList:{remove(){},add(){},toggle(){}},textContent:''});M2.auto();document.getElementById=gE;
  ok(!!FLY.landing&&FLY.auto===false&&Math.abs(FLY.landing.at[0]-9500)<1,'в 2,1 км от цели автопилот передал лётчику посадку у финиша: '+JSON.stringify(FLY.landing&&FLY.landing.at.map(Math.round)));
  ok(flySkipStop()==='посадка','«Долететь» при этом останавливается — посадку видно');
  // неудача: где и далеко ли
  const M3=flMission({md,pil:P,ev:evc,kind:'cross',place:'channel'});FL.mi=M3;M3.flew=1;let f3=null;M3.fin=(t,x,res)=>{f3=res;};const ac3=flCraft(md,y,{rnd:()=>0.3});FL.me=ac3;flPlace(ac3,0,0,Math.PI/2,{h:200,v:ac3.Vs*1.5});
  ac3.crash='крыло сложилось от перегрузки';M3.step();ok(f3&&/км от цели/.test(f3.txt)&&/над лугами|над водой|над полями/.test(f3.txt),'неудача описана с местом и расстоянием: '+(f3&&f3.txt));
  FLY.landing=null;FLY.auto=false;FL.me=null;FL.mi=null;FW=undefined;FL.noFail=false;}
/* ---------- газета: аэроплан в заметке об аэроплане, без рисунка — где машины ни при чём ---------- */
{newGame('renault','fr','T','normal');const A=airInit(G);const e=airRefEntry('sport',1912),md={...e[2],role:'sport',name:e[1],id:7,status:'prod'};A.models.push(md);G.y=1912;G.m=5;
  const h1=paperHTML({own:1,airId:7,kicker:'Небо',title:'Перелёт',text:'Текст'},G);ok(/p-fig p-air/.test(h1)&&!/car-art|<figure class="p-fig" /.test(h1)&&/«Блерио|«/.test(h1),'заметка с airId — рисунок аэроплана, не автомобиль');
  const h2=paperHTML({own:1,kicker:'Авиацех',title:'Завод',text:'Текст',noArt:1},G);ok(!/<figure/.test(h2),'заметка с noArt — без рисунка машины');
  const h3=paperHTML({own:1,kicker:'Рекорд',title:'Сотая машина',text:'Текст'},G);ok(/<figure class="p-fig"/.test(h3)&&!/p-air/.test(h3),'обычная заметка о компании — по-прежнему с автомобилем');
  G.pending=[];pushEvent({own:1,airId:7,noArt:0,kicker:'Небо',title:'Т',text:'т'});ok(G.pending[G.pending.length-1].airId===7,'pushEvent передаёт airId в газету');G.pending=[];}
/* ---------- сводка месяца по направлениям ---------- */
{newGame('renault','fr','T','normal');const h0=monthSumCard(G);ok(/Итоги месяца/.test(h0)&&/первый месяц впереди/.test(h0),'до первого хода — заглушка с кассой');
  G.last={label:'май 1912',made:12,sold:9,milN:2,ordN:1,ord:5000,rev:40000,mrev:3000,mmade:5,msold:4,profit:1200,air:{made:2,sold:1,ordN:1,rev:9000,ord:8000,lic:0,net:2500}};G.lines={car:1,moto:1};airInit(G).lv=1;
  const h=monthSumCard(G);ok(/Автомобили/.test(h)&&/Мотоциклы/.test(h)&&/Аэропланы/.test(h)&&/Всего/.test(h),'три направления и итог');
  ok(/армии 2, по заказам 1/.test(h)&&/контракты 1/.test(h),'продано — с разбивкой: армии, по заказам, контракты');
  const ha=monthSumCard(G,{air:1});ok(/Слава/.test(ha)&&/Аэропланы/.test(ha),'в ангаре — та же сводка со славой');
  ok(vPlant.toString().includes('monthSumCard(s)')&&airPlantView.toString().includes('monthSumCard(s,{air:1})'),'сводка стоит наверху «Завода» и «Ангара»');}
/* ---------- антураж: у крутого поворота без построек; Дворец изящных искусств — ротонда ---------- */
{const M=lmMesh({k:'pagoda',n:'Дворец изящных искусств',l:67.4,w:58.3,h:48},'us',()=>0),b=lmkBox3(M);
  ok(M.F.length>600&&b[4]>40&&b[4]<50&&(b[3]-b[0])>60,'ротонда: '+M.F.length+' граней, высота '+b[4].toFixed(0)+' м, ширина '+(b[3]-b[0]).toFixed(0)+' м');
  const T=lmMesh({k:'pagoda',n:'Храм Конг Чоу',l:19.3,w:17.1,h:16},'us',()=>0),I=lmMesh({k:'pagoda',n:'Пагода',l:12,w:12,h:22},'us',()=>0);
  ok(T.F.length>150&&I.F.length<120,'в США храм — пагода ('+T.F.length+' граней), безымянная пагода — судейская башня Инди ('+I.F.length+')');
  // выдуманная трасса с крутыми поворотами: в 10 сегментах от шпильки нет домов
  newGame('renault','fr','T','normal');G.cash=1e6;const rc2=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:1910,key:'v40-bend',terr:'macadam'});const md2=G.models[0];
  let tried=0,badH=0,sharpN=0,houses=0;for(let k=0;k<4&&sharpN<3;k++){startRace({rc:Object.assign({},rc2,{key:'v40-bend'+k}),mode:'drive',entries:[{drv:'me',md:md2,prep:2,tyre:'soft',gear:0}]});const T2=R.trk,n=T2.n;tried++;
    const sh=i=>Math.abs(T2.K[((i%n)+n)%n])>1/40,H=/house|barn|villa|cafe|fachwerk|izba|dacha|cottage|farm/;
    for(let i=0;i<n;i++){const L=T2.spr[i].filter(o=>H.test(o.t));houses+=L.length;if(!L.length)continue;let near=false;for(let q=-10;q<=10;q++)if(sh(i+q))near=true;if(near)badH+=L.length;}
    for(let i=0;i<n;i++)if(sh(i))sharpN++;finishRace(true);closeSheet();closePaper();G.pending=[];}
  ok(badH===0&&houses>0,'дома у крутых поворотов: '+badH+' из '+houses+' (трасс '+tried+', крутых сегментов '+sharpN+')');}
console.log(bad?('ОШИБОК: '+bad):'всё в порядке');process.exitCode=bad?1:0;}`);
