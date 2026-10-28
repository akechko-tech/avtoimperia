/* ================= 0.39: ПОГОДА И ВОЗДУХ =================
   Ветер по высоте (у земли слабее, выше сильнее и заходит по часовой), порывы, болтанка (термики днём над сушей, у холмов, в грозе),
   плотность воздуха по высоте и температуре (жара — мотор слабее, крыло держит хуже), дождь (видимость, мокрое поле, мотор капризнее),
   гроза (ячейки на пути: нисходящие потоки, шквал, молнии и гром), птицы у полей и воды. Сводка — в полёте под заданием.
   FL.wx — погода текущего полёта; wxWindAt(x,y,z,agl,t) — ветер в точке; wxTurb(agl,x,z) — болтанка 0…2; FL.wx.sig — поправка плотности. */
const WX_PLACE={channel:{sea:1,wind:1.6,rain:0.18,fog:0.25,dir:[-0.8,0.5]},england:{wind:1.2,rain:0.2,fog:0.2,dir:[-0.8,0.4]},atlantic:{sea:1,wind:2.2,rain:0.15,fog:0.1},med:{sea:1,wind:1.2,rain:-0.08,storm:0.05},
  alps:{wind:1.3,mount:1,temp:-8,storm:0.1,rain:0.05},pyrenees:{wind:1.1,mount:1,temp:-4,storm:0.08},russia:{wind:1,temp:-3,rain:0.05,storm:0.05},plain:{},strait:{sea:1,wind:1.5,rain:0.1},coast:{sea:1,wind:1.3},lagoon:{sea:1,wind:0.9},lake:{wind:0.8}};
function wxSeason(m){return m>=11||m<=1?'winter':m<=4?'spring':m<=7?'summer':'autumn';}
// 0.40: предел ветра по роду полёта — доля крейсерской скорости аэроплана, которую можно отдать ветру на высоте (на 100–600 м ветер
// в полтора раза сильнее, чем у земли): в сильный ветер не летали — ждали затишья. Раньше тихоходный аэроплан 1909 года мог попасть
// в ветер 13 м/с при своих 17 и шёл к цели боком, носом в поле (отзыв: «летим боком»)
const WX_KIND={test:0.15,circle:0.15,speed:0.25,rspeed:0.2,dist:0.25,rdist:0.25,alt:0.3,ralt:0.3,cross:0.3,trial:0.25,loop:0.2,war:0.45,other:0.3};
function wxCap(kind,vc){const k=WX_KIND[kind]||WX_KIND.other;return clamp((vc||70)/3.6*k/1.6,1.5,12);}
function wxMake(o){const rnd=mulberry32((o.seed|0)+7777),m=o.m|0,sea=!!o.sea,P=Object.assign({},WX_PLACE[o.place]||{},(o.bio&&WX_PLACE[o.bio])||{}),S=wxSeason(m),early=o.y<1912;
  // ветер у земли: чаще слабый; у моря и в горах свежее; ранние годы — летали в тихую погоду
  const D=(typeof DIF==='function'&&typeof G!=='undefined'&&G&&DIF().fly)||{wind:1};
  let ws=(rnd()*rnd()*9+rnd()*2)*(P.wind||1)*(early?0.6:1)*D.wind;if(S==='winter'||S==='autumn')ws*=1.2;ws=clamp(ws,0,early?6:13);/* до 1912 года в сильный ветер не летали */
  // 0.40: сильнее предела для этого полёта и аэроплана — ждали затишья: к вылету ветер стих до предела (сколько ждали — в сводке)
  const cap=o.vc?wxCap(o.kind,o.vc):(early?6:13);let wait=0;if(ws>cap){wait=Math.round(1+(ws-cap)*1.5+rnd()*3);ws=cap*(0.7+0.3*rnd());}
  let wa=rnd()*6.283;if(P.dir&&rnd()<0.6)wa=Math.atan2(P.dir[0],P.dir[1])+(rnd()-0.5)*0.8;
  const mood=o.mood||'clear';
  // дождь, туман, гроза — по сезону и месту
  let pr={winter:0.32,autumn:0.34,spring:0.24,summer:0.14}[S]+(P.rain||0);if(mood==='clear')pr*=0.35;if(mood==='overcast')pr+=0.35;
  const rain=rnd()<pr?0.35+rnd()*0.65:0;
  const fog=(mood==='morning'?0.5:0.12)+(P.fog||0);const vis=rnd()<fog?2+rnd()*6:rain?9+rnd()*8:40;/* км */
  const hour=o.hour===undefined?11+rnd()*6:o.hour,noon=S==='summer'?1:S==='winter'?0.3:0.65,land=!sea;
  let ps=(S==='summer'?0.2:S==='spring'||S==='autumn'?0.08:0.01)+(P.storm||0);if(hour<12||mood==='morning'||rain>0.6)ps*=0.4;if(early)ps*=0.6;ps*=D.wind;/* 0.40: на лёгких уровнях гроза реже */
  const storm=rnd()<ps&&land?wxStorm(rnd,o,wa,ws):null;
  // термики: летом после полудня над сушей; над морем и утром — почти нет; горы — болтанка у склонов
  const therm=(land?clamp((hour-9)/5,0,1)*noon*(mood==='clear'||mood==='cloudy'?1:0.5)*(0.4+rnd()*0.6):0.08)*D.wind;
  const temp=Math.round(({winter:2,spring:12,summer:24,autumn:11})[S]+(P.temp||0)+(rnd()-0.5)*8+(hour>13?2:0));
  const sig=288.15/(288.15+(temp-15)*0.85);
  const wx={ws,wa,w0:[Math.sin(wa)*ws,0,Math.cos(wa)*ws],gust:(0.2+rnd()*0.4+(storm?0.2:0))*(wait?0.6:1)*Math.min(1,D.wind+0.3),veer:0.26,/* рад на 1000 м */cap,kind:o.kind||'',wait,
    rain,vis,storm,therm,mount:!!P.mount,temp,sig,sea,t:0,ph:[rnd()*6.3,rnd()*6.3,rnd()*6.3],birds:[],flash:0,bolts:[],hour,season:S};
  wx.name=wxText(wx);return wx;}
// грозовые ячейки: 1–3, на пути между A и B (или у поля), с наковальней; дрейфуют с ветром наверху
function wxStorm(rnd,o,wa,ws){const n=1+Math.floor(rnd()*2.4),cells=[];const A=o.A||[0,0],B=o.B||null;
  for(let i=0;i<n;i++){let x,z;if(B){const k=0.25+rnd()*0.6;x=A[0]+(B[0]-A[0])*k+(rnd()-0.5)*5000;z=A[1]+(B[1]-A[1])*k+(rnd()-0.5)*7000;}else{const a=rnd()*6.3,d=3500+rnd()*5000;x=A[0]+Math.sin(a)*d;z=A[1]+Math.cos(a)*d;}
    cells.push({x,z,r:1500+rnd()*1400,base:650+rnd()*300,top:4200+rnd()*1500,ph:rnd()*6.3,next:2+rnd()*8,vx:Math.sin(wa)*(ws*1.4+2)*0.5,vz:Math.cos(wa)*(ws*1.4+2)*0.5});}
  return {cells,n};}
function wxText(wx){const dirs=['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'],from=dirs[Math.round(((wx.wa+Math.PI)%6.2832)/(Math.PI/4))%8];
  const w=wx.ws<1.5?'штиль':`ветер ${Math.round(wx.ws)} м/с с ${from}${wx.gust>0.45?', порывы':''}`;
  const L=[w];if(wx.ws>=1.5)L.push(`на 1000 м — ${Math.round(wx.ws*2)} м/с`);if(wx.rain)L.push(wx.rain>0.7?'ливень':'дождь');if(wx.vis<12)L.push(wx.vis<5?'туман':'дымка');
  if(wx.storm)L.push('гроза');if(wx.therm>0.55)L.push('болтанка');L.push(`${wx.temp>0?'+':''}${wx.temp}°`);if(wx.wait)L.push(`ждали затишья ${wx.wait} ч`);return L.join(' · ');}
// ---- ветер в точке: профиль по высоте (логарифм), заход по часовой, порывы (сумма синусов), термики, гроза
function wxN(t,ph){return 0.5*Math.sin(t*1.31+ph)+0.3*Math.sin(t*2.93+ph*1.7)+0.2*Math.sin(t*5.17+ph*0.4);}
function wxWindAt(x,y,z,agl,t){const wx=FL.wx;if(!wx)return FL.wind||[0,0,0];const h=Math.max(2,agl);
  const f=Math.log(h/0.1)/Math.log(100),ws=wx.ws*f,ang=wx.wa+wx.veer*Math.min(3,y/1000);
  const g=wx.gust*Math.max(0.25,1-h/1500);let vx=Math.sin(ang)*ws*(1+g*wxN(t*0.25,wx.ph[0])),vz=Math.cos(ang)*ws*(1+g*wxN(t*0.21,wx.ph[1])),vy=ws*g*0.35*wxN(t*0.5,wx.ph[2]);
  // термики: столбы тёплого воздуха (плюс), между ними — нисходящие (минус); слабеют выше 1500 м и у самой земли
  if(wx.therm>0.05&&h<1800){const k=wx.therm*clamp(h/120,0,1)*(1-h/1800);vy+=k*3.2*(Math.sin(x/430+wx.ph[0])*Math.sin(z/390+wx.ph[1])+0.5*Math.sin(x/170-z/210+t*0.03));}
  // горы: у склонов — восходящий с наветренной стороны и ротор с подветренной (грубо: по уклону вдоль ветра)
  if(wx.mount&&h<900&&typeof FW!=='undefined'&&FW&&FW.S){const d=120,hx=(fwHgt(FW.S,x+d,z)-fwHgt(FW.S,x-d,z))/(2*d),hz=(fwHgt(FW.S,x,z+d)-fwHgt(FW.S,x,z-d))/(2*d);vy+=(vx*hx+vz*hz)*clamp(1-h/900,0,1)*1.4;}
  // гроза: под ячейкой — нисходящий поток и шквал от центра; в облаке выше основания — мощный восходящий с рывками
  if(wx.storm)for(const c of wx.storm.cells){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d>c.r*1.6)continue;const ux=d>1?dx/d:0,uz=d>1?dz/d:1;
    if(d<c.r){const k=1-d/c.r;if(y<c.base+300){vy-=(4+6*k);const out=5+6*k;vx+=ux*out;vz+=uz*out;}else{vy+=6*k*(1+0.8*Math.sin(t*0.7+c.ph));}}
    else{const k=1-(d-c.r)/(c.r*0.6);const out=6*k;vx+=ux*out;vz+=uz*out;vy-=1.5*k;}}
  return [vx,vy,vz];}
// болтанка 0…2: термики днём (слабеют с высотой), механическая у земли по ветру, горы, дождь, гроза
function wxTurb(agl,x,z){const wx=FL.wx;if(!wx)return 0;const h=Math.max(0,agl);let tb=wx.therm*clamp(h/80,0,1)*clamp(1-h/2200,0,1)*0.9+clamp(wx.ws/12,0,1)*clamp(1-h/400,0,1)*0.6*(0.6+wx.gust);
  if(wx.mount&&h<1200)tb+=0.5*clamp(wx.ws/8,0,1);if(wx.rain)tb+=0.15;
  if(wx.storm)for(const c of wx.storm.cells){const d=Math.hypot(x-c.x,z-c.z);if(d<c.r*1.5)tb+=d<c.r?1.6:1.6*(1-(d-c.r)/(c.r*0.5));}
  return clamp(tb,0,2.2);}
// ---- такт погоды: ячейки дрейфуют, молнии, птицы; dt — игровые секунды
function wxTick(dt){const wx=FL.wx;if(!wx)return;wx.t+=dt;const me=FL.me;
  if(wx.storm)for(const c of wx.storm.cells){c.x+=c.vx*dt;c.z+=c.vz*dt;c.next-=dt;if(c.next<=0){c.next=3+Math.random()*9;wxBolt(c);}}
  if(wx.flash>0)wx.flash=Math.max(0,wx.flash-dt*(FL.k>1?0.4:1)*4);
  wx.bolts=wx.bolts.filter(b=>(b.age+=dt)<0.35);
  if(me&&!me.crash){wxBirdsTick(dt,me);
    // молния в аэроплан: редко, только внутри ячейки выше основания
    if(wx.storm&&!me.gnd)for(const c of wx.storm.cells){if(Math.hypot(me.p[0]-c.x,me.p[2]-c.z)<c.r&&me.p[1]>c.base-100&&Math.random()<dt*0.004){wx.flash=1;wx.bolts.push({x:me.p[0],z:me.p[2],age:0,top:me.p[1]+400,y:me.p[1]});
      if(me.eng.run){me.eng.run=0;me.eng.fail='заглох мотор';}me.dmg.wing=Math.min(1,me.dmg.wing+0.2);flMsg(me,'Молния! Мотор стал, обшивка опалена','bad');if(typeof wxThunder==='function')wxThunder(0);}}}}
function wxBolt(c){const wx=FL.wx;const x=c.x+(Math.random()-0.5)*c.r*1.2,z=c.z+(Math.random()-0.5)*c.r*1.2;wx.bolts.push({x,z,age:0,top:c.base+900+Math.random()*1200,y:Math.max(0,fwHgt(FW.S,x,z))});
  const me=FL.me,d=me?Math.hypot(me.p[0]-x,me.p[2]-z):1e9;wx.flash=Math.max(wx.flash,clamp(1.2-d/9000,0.25,1));if(typeof wxThunder==='function')wxThunder(d);}
// ---- птицы: стаи у полей, деревень и воды, на 20–140 м; столкновение — птица в винт или в крыло
function wxBirdsInit(S){const wx=FL.wx;if(!wx||!S)return;const rnd=mulberry32((S.seed|0)+313),L=[];const spots=[];
  (S.fields||[]).forEach(f=>{spots.push([f.x+(rnd()-0.5)*1600,f.z+(rnd()-0.5)*1600]);spots.push([f.x+(rnd()-0.5)*2400,f.z+(rnd()-0.5)*2400]);});(S.towns||[]).slice(0,10).forEach(t=>spots.push([t.x+(rnd()-0.5)*900,t.z+(rnd()-0.5)*900]));
  if(wx.sea||S.sea)for(let i=0;i<4;i++)spots.push([(rnd()-0.5)*14000,(rnd()-0.5)*14000]);
  for(const [x,z] of spots){if(rnd()<0.3)continue;const n=8+Math.floor(rnd()*18),kind=wx.sea&&rnd()<0.6?'gull':rnd()<0.5?'rook':'starling';
    L.push({x,z,y:Math.max(0,fwHgt(S,x,z))+25+rnd()*110,r:30+n*1.3,n,kind,a:rnd()*6.3,v:6+rnd()*5,turn:(rnd()-0.5)*0.12,ph:rnd()*6.3,hit:0,scat:0});if(L.length>=9)break;}
  wx.birds=L;}
function wxBirdsTick(dt,me){const wx=FL.wx;for(const b of wx.birds){b.a+=b.turn*dt;b.x+=Math.sin(b.a)*b.v*dt;b.z+=Math.cos(b.a)*b.v*dt;if(b.scat>0){b.scat-=dt;b.r+=dt*12;}
    const gy=Math.max(0,fwHgt(FW.S,b.x,b.z));b.y+=((gy+40+Math.sin(wx.t*0.1+b.ph)*35+(b.kind==='gull'?30:0))-b.y)*Math.min(1,dt*0.3);
    if(b.hit||me.gnd)continue;const d=Math.hypot(me.p[0]-b.x,me.p[1]-b.y,me.p[2]-b.z);
    if(d<b.r+me.gr.span*0.5&&me.V>9&&Math.random()<dt*0.9*Math.min(1.5,me.V/25)){b.hit=1;b.scat=6;const prop=Math.random()<0.6;
      if(prop){me.dmg.eng=Math.min(1,me.dmg.eng+0.3+Math.random()*0.25);flMsg(me,'Птица в винт! Мотор трясёт','bad');if(Math.random()<0.35){me.eng.run=0;me.eng.fail='мотор разбит';}}
      else{me.dmg.wing=Math.min(1,me.dmg.wing+0.12);flMsg(me,'Птица ударила в крыло — обшивка пробита','bad');}
      if(typeof auSfx==='function'){try{auSfx('thud',0.7);}catch(_){}}}
    else if(d<b.r*3&&!b.scat&&me.V>9){b.scat=5;}}}
// ---- что рисовать: грозовые облака (столбы с наковальней), завесы дождя под ячейками, птицы — пятнышки
function wxPuffs(cam){const wx=FL.wx;if(!wx)return [];const L=[];const e=cam?cam.eye:[0,0,0];
  if(wx.storm){const seed=mulberry32(5);for(const c of wx.storm.cells){const rnd=mulberry32(Math.round(c.ph*1000));const dark=wx.flash>0.3?0.5:0.17;
      for(let k=0;k<30;k++){const a=rnd()*6.3,d=rnd()*c.r*0.9,y=c.base+rnd()*(c.top-c.base)*0.7;const s=380+rnd()*420;L.push({x:c.x+Math.sin(a)*d,y:y+s*0.3,z:c.z+Math.cos(a)*d,s,g:dark+rnd()*0.1+Math.pow((y-c.base)/(c.top-c.base),1.5)*0.5,a:0.9});}
      for(let k=0;k<14;k++){const a=rnd()*6.3,d=rnd()*c.r*1.5;L.push({x:c.x+Math.sin(a)*d,y:c.top-200+rnd()*500,z:c.z+Math.cos(a)*d,s:700+rnd()*600,g:0.78+rnd()*0.12,a:0.7});}
      for(let k=0;k<10;k++){const a=rnd()*6.3,d=rnd()*c.r*0.8;L.push({x:c.x+Math.sin(a)*d,y:c.base*0.45,z:c.z+Math.cos(a)*d,s:c.base*0.55,g:0.3,a:0.2});}}}
  for(const b of wx.birds){const d=Math.hypot(b.x-e[0],b.y-e[1],b.z-e[2]);if(d>2600)continue;const rnd=mulberry32(Math.round(b.ph*997)),flap=Math.sin(wx.t*9+b.ph);
    for(let i=0;i<b.n;i++){const row=i%2?1:-1,k=Math.floor(i/2)+1;const back=k*(b.scat>0?9:4.5),side=row*k*(b.scat>0?7:3.2);
      const x=b.x-Math.sin(b.a)*back+Math.cos(b.a)*side+(rnd()-0.5)*2,z=b.z-Math.cos(b.a)*back-Math.sin(b.a)*side+(rnd()-0.5)*2,y=b.y+(rnd()-0.5)*4+flap*0.3*(i%3);
      L.push({x,y,z,s:(b.kind==='gull'?0.75:0.55)*(1+0.25*Math.abs(flap)),g:b.kind==='gull'?0.85:0.12,a:0.95});}}
  for(const bt of wx.bolts){const seg=14;let x=bt.x,z=bt.z;for(let i=0;i<=seg;i++){const y=bt.top-(bt.top-bt.y)*i/seg;x+=(Math.random()-0.5)*60;z+=(Math.random()-0.5)*60;L.push({x,y,z,s:14+Math.random()*10,g:1.9,a:0.9*(1-bt.age/0.35)});}}
  return L;}
// ---- освещение: дождь и гроза темнее и ближе туман; вспышка молнии — небо и земля белеют на миг
function wxEnv(E0){const wx=FL.wx;if(!wx||!E0)return E0;if(!wx.E0)wx.E0=JSON.parse(JSON.stringify(E0));const B=wx.E0,E=E0;const dark=clamp(wx.rain*0.45+(wx.storm?0.25:0),0,0.7),fl=wx.flash;
  const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];E.sunC=mul(B.sunC,(1-dark)*(1+fl*1.5));E.skyC=mul(B.skyC,(1-dark*0.6)*(1+fl*2.2));E.hzC=mul(B.hzC,(1-dark*0.5)*(1+fl*1.6));E.zeC=mul(B.zeC,(1-dark*0.5)*(1+fl*1.2));
  E.fogS=mul(B.fogS,(1-dark*0.4)*(1+fl*1.2));E.fogD=B.fogD*(wx.vis<40?clamp(28/wx.vis,1,7):1)*(1+wx.rain*1.2);E.exp=B.exp*(1-dark*0.25);return E;}
