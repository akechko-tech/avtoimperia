/* ================= СЦЕНАРИЙ ТРАССЫ: города и сёла, лес и аллеи, поля, мост через реку, переезд, серпантин, берег моря ================= */
// Раньше пейзаж повторялся по кругу (городок каждые 600 м). Теперь у каждой гонки свой «сценарий»: старт и финиш в городе,
// между ними — поля и сёла, лес, аллеи, виноградники, мост через реку, железнодорожный переезд с поездом, в горах — серпантин
// со скалой с одной стороны и обрывом с другой, у моря — дорога по берегу. Сценарий один и тот же для одной и той же гонки.
const RSEG={fields:0,town:1,village:2,forest:3,avenue:4,bridge:5,rail:6,serp:7,coast:8,vine:9,tunnel:10};
const RIVERS={fr:['Сену','Луару','Марну','Рону','Сону','Уазу'],it:['По','Тибр','Адидже','Арно'],de:['Рейн','Майн','Неккар','Мозель','Эльбу'],uk:['Темзу','Северн','Трент'],
  us:['Гудзон','Огайо','Делавэр','Миссисипи'],be:['Маас','Шельду'],at:['Дунай','Инн','Мур'],ch:['Рейн','Аре','Рону'],es:['Эбро','Тахо'],ru:['Волхов','Мсту','Тверцу','Волгу'],ie:['Шаннон','Лиффи'],ly:['вади'],mc:['Вар'],other:['реку']};
const COASTS={mc:'Лазурный берег',it:'берег Тирренского моря',es:'берег Средиземного моря',fr:'берег Ла-Манша',uk:'берег Ла-Манша',ie:'берег Ирландского моря',us:'берег Атлантики',ly:'берег Средиземного моря'};
function planRoute(trk,rnd){
  const {n,cfg,rc,K}=trk,set=SCEN_SETS[cfg.host],S=new Uint8Array(n),list=[];trk.segT=S;trk.seg=list;trk.rivers=[];trk.rails=[];trk.coast=[];trk.bridge=new Uint8Array(n);trk.tunnels=[];trk.tunAt=new Uint8Array(n);
  // Монако: знаменитый тоннель у моря (с 1929 года)
  if(rc.track==='monaco'){const r=mulberry32(hashStr('tun|'+rc.key));planTunnel(trk,S,list,r,Math.round(n*0.45),Math.round(n*0.75),24,32,'Тоннель у моря: из солнца — в темноту и обратно');}
  if(cfg.oval||rc.track==='board'||cfg.sprint||rc.track==='brooklands'||rc.track==='indy'||rc.track==='monaco')return;
  const r=mulberry32(hashStr('route|'+rc.key)),hill=!!cfg.uphill,mount=hill||cfg.terr==='mount'||(!!set.mount&&cfg.hilly>=0.6),closed=cfg.closed;
  const s0=closed?0:trk.startIdx,f0=closed?n-1:trk.finishIdx,dry=!!set.dry||['it','es','ly','mc'].includes(cfg.host),wine=['fr','it','es','de','at'].includes(cfg.host);
  const put=(type,a,b,extra)=>{a=clamp(a,0,n-1);b=clamp(b,0,n-1);if(b<=a)return null;for(let i=a;i<=b;i++)S[i]=type;const o=Object.assign({type,i0:a,i1:b,i:Math.round((a+b)/2)},extra||{});list.push(o);return o;};
  const curvy=(i,len)=>{let m=0;for(let k=i;k<Math.min(n,i+len);k++)m=Math.max(m,Math.abs(K[k]));return m;};
  // 1) основа: чередование полей, сёл, леса, аллей, виноградников (в горах — серпантин и лес)
  let i=closed?0:Math.max(0,s0-40);const end=closed?n:Math.min(n,f0+40);let last=-1;
  while(i<end){const q=r();let type,len;
    if(mount&&curvy(i,60)>1/60&&q<0.55){type=RSEG.serp;len=90+Math.floor(r()*120);}
    else if(mount&&q<0.8){type=RSEG.forest;len=60+Math.floor(r()*80);}
    else{const w=[[RSEG.fields,dry?0.34:0.3],[RSEG.village,0.2],[RSEG.forest,dry?0.1:0.2],[RSEG.avenue,0.14],[RSEG.vine,wine?(dry?0.18:0.1):0]],tot=w.reduce((a,x)=>a+x[1],0);let z=r()*tot;type=RSEG.fields;for(const [t,p] of w){z-=p;if(z<=0){type=t;break;}}
      if(type===last)type=type===RSEG.fields?RSEG.village:RSEG.fields;len={0:70,2:55,3:70,4:40,9:60}[type]+Math.floor(r()*70);}
    put(type,i,i+len-1);last=type;i+=len;}
  // 2) города: старт и финиш дорожных гонок — в городе, по пути — раз в 1,6–2,4 км
  if(cfg.town!==false){
    if(!closed){put(RSEG.town,s0-50,s0+45,{cap:null});put(RSEG.town,f0-70,f0+25,{cap:'Финиш — в городе: мостовая и толпа'});}
    else put(RSEG.village,n-40,n-1);
    const step=420+Math.floor(r()*180);for(let j=(closed?s0+160:s0+step);j<(closed?n-120:f0-160);j+=step+Math.floor(r()*120)){if(mount&&S[j]===RSEG.serp)continue;put(RSEG.town,j,j+50+Math.floor(r()*30),{cap:'Городок: узкая улица, мостовая, зрители у домов'});}}
  // 3) мост через реку: прямой участок в полях или лесу, не у старта
  const riverN=mount?(r()<0.5?1:0):n>900?2:n>420?1:0,rn=RIVERS[cfg.host]||RIVERS.other;
  for(let k=0;k<riverN;k++){for(let t=0;t<40;t++){const j=(closed?s0+100:s0+80)+Math.floor(r()*((closed?n-200:f0-s0-200)));
      if(j<2||j>n-40||curvy(j-20,40)>1/120)continue;let ok=true;for(let a=j-30;a<=j+30;a++)if(a<0||a>=n||S[a]===RSEG.town||S[a]===RSEG.bridge||S[a]===RSEG.rail||S[a]===RSEG.serp)ok=false;if(!ok)continue;
      const span=9+Math.floor(r()*4),nm=rn[Math.floor(r()*rn.length)];put(RSEG.bridge,j-span,j+span,{cap:`Мост через ${nm}`,alt:34,w:3});for(let a=j-span;a<=j+span;a++)trk.bridge[a]=1;
      trk.rivers.push({i:j,w:14+r()*10,d:4.5+r()*2,ph:r()*6.28,name:nm});break;}}
  // 4) железнодорожный переезд: поезд может пройти перед самым носом
  if(rc.y>=1880&&!hill&&n>380){for(let t=0;t<40;t++){const j=(closed?s0+60:s0+60)+Math.floor(r()*((closed?n-120:f0-s0-120)));
      if(j<2||j>n-30||curvy(j-15,30)>1/200)continue;let ok=true;for(let a=j-25;a<=j+25;a++)if(a<0||a>=n||S[a]===RSEG.town||S[a]===RSEG.bridge||S[a]===RSEG.serp)ok=false;if(!ok)continue;
      put(RSEG.rail,j-6,j+6,{cap:'Железнодорожный переезд: смотрите на шлагбаум',alt:26,w:2});trk.rails.push({i:j,ang:(r()-0.5)*0.5});break;}}
  // 5) берег моря: дорога вдоль воды (Ривьера, Сицилия, Испания, Ла-Манш)
  const sea=!!set.sea||['targa','mc','x22765'].includes(rc.track)||/turbie|monte|nice|riviera|sitges|coppa|florio|boulogne|dieppe|brighton/i.test(rc.id+' '+rc.name);
  let yMin=1e9;trk.pts.forEach(p=>{yMin=Math.min(yMin,p[1]);});
  if(sea&&n>300&&!hill){for(let t=0;t<40;t++){const len=120+Math.floor(r()*90),j=(closed?60:s0+100)+Math.floor(r()*Math.max(1,(closed?n-len-120:f0-s0-len-160)));
      let ok=true,lo=1e9,hi=-1e9;for(let a=j;a<j+len;a++){if(a<0||a>=n||S[a]===RSEG.town||S[a]===RSEG.bridge||S[a]===RSEG.rail)ok=false;else{lo=Math.min(lo,trk.pts[a][1]);hi=Math.max(hi,trk.pts[a][1]);}}
      // у моря дорога идёт низко и ровно: вода — ниже всей трассы
      if(!ok||lo>yMin+9||hi-lo>14)continue;
      // море — с внешней стороны дуги (или где ниже)
      let kk=0;for(let a=j;a<j+len;a++)kk+=K[a];const side=kk>0?-1:1;put(RSEG.coast,j,j+len,{cap:COASTS[cfg.host]||'Дорога вдоль моря',alt:40,w:4,side});trk.coast.push({i0:j,i1:j+len,side});break;}}
  // 6) тоннель сквозь скалу: в горах — на пологом участке (свод, темнота, эхо мотора)
  if(mount&&n>300&&(!!set.mount||/turbie|klausen|semmering|alpen|pikes|targa/.test(rc.id))&&r()<0.8){const k=n>1100&&r()<0.5?2:1;for(let q=0;q<k;q++)planTunnel(trk,S,list,r,closed?s0+60:s0+90,closed?n-80:f0-120,26,44,'Тоннель сквозь скалу: темно, гулкое эхо мотора');}
  // подписи для заставки: самые приметные участки
  list.forEach(o=>{if(o.cap===undefined)o.cap=o.type===RSEG.serp?'Серпантин: скала с одной стороны, обрыв — с другой':o.type===RSEG.forest&&o.i1-o.i0>90?'Лесная дорога: тень и корни':o.type===RSEG.avenue?'Аллея: деревья у самой дороги':o.type===RSEG.vine?'Виноградники по обе стороны':null;});}
// Тоннель: пологий участок нужной длины подальше от городов, мостов, переезда и берега; кривизна — сначала самая малая
function planTunnel(trk,S,list,r,a0,a1,l0,l1,cap){const {n,K}=trk;if(a1-a0<l1+30)return null;
  const curvy=(i,len)=>{let m=0;for(let k=i;k<Math.min(n,i+len);k++)m=Math.max(m,Math.abs(K[k]));return m;};
  for(const kMax of [1/90,1/60,1/42])for(let t=0;t<50;t++){const len=l0+Math.floor(r()*(l1-l0+1)),j=a0+Math.floor(r()*Math.max(1,a1-a0-len));
    if(j<8||j+len>n-8)continue;if(curvy(j-4,len+8)>kMax)continue;let ok=true;
    for(let a=j-14;a<=j+len+14;a++){const b=trk.closed?((a%n)+n)%n:a;if(b<0||b>=n){ok=false;break;}const q=S[b];if(q===RSEG.town||q===RSEG.bridge||q===RSEG.rail||q===RSEG.coast||q===RSEG.tunnel){ok=false;break;}}
    if(!ok)continue;for(let a=j;a<=j+len;a++){S[a]=RSEG.tunnel;trk.tunAt[a]=1;}const o={type:RSEG.tunnel,i0:j,i1:j+len,i:Math.round(j+len/2),cap,alt:18,w:3};list.push(o);trk.tunnels.push({i0:j,i1:j+len});return o;}
  return null;}
// Тип участка у точки трассы
function segAt(trk,i){return trk.segT?trk.segT[((i%trk.n)+trk.n)%trk.n]:RSEG.fields;}
/* ---------- река и берег в рельефе: русло с берегами под мостом, спуск к морю ---------- */
// Река идёт поперёк дороги (с изгибами); вода — ниже моста, берега пологие
function riverLine(trk,rv){const p=trk.pts[rv.i],t=trk.T[rv.i],d=[t[1],-t[0]];return {p,d,t};}
function riverDist(trk,rv,x,z){const L=riverLine(trk,rv),dx=x-L.p[0],dz=z-L.p[2],s=dx*L.d[0]+dz*L.d[1],e=dx*L.t[0]+dz*L.t[1];
  const m=Math.sin(s/170+rv.ph)*22*sstep(20,120,Math.abs(s))+Math.sin(s/61+rv.ph*2)*6*sstep(20,120,Math.abs(s));return {s,e:e-m};}
function carveField(trk,F){if(!trk.rivers&&!trk.coast)return;const P=trk.pts;
  // русло режется от местной земли: где низина — река ещё ниже, под мостом — не выше отметки «дорога минус глубина»
  (trk.rivers||[]).forEach(rv=>{const y0=P[rv.i][1],bed=y0-rv.d,bank=rv.w/2+10,R=1300;
    for(let j=0;j<F.nz;j++)for(let k=0;k<F.nx;k++){const q=j*F.nx+k,x=F.x0+k*F.S,z=F.z0+j*F.S,dd=riverDist(trk,rv,x,z);if(Math.abs(dd.s)>R||Math.abs(dd.e)>bank+30)continue;
      const e=Math.abs(dd.e),prof=e<rv.w/2?1:1-sstep(rv.w/2,bank+26,e);if(prof<=0)continue;const bedL=Math.min(bed,F.H[q]-rv.d*0.7),h=F.H[q]+(bedL-F.H[q])*sstep(0,1,prof*1.4);F.H[q]=Math.min(F.H[q],h);F.G[q]=Math.min(F.G[q],F.H[q]);}});
  let yMin=1e9;P.forEach(p=>{yMin=Math.min(yMin,p[1]);});
  if(!(trk.coast||[]).length)return;
  // 0.18: берег без «игл». Каждой клетке — ближайшая точка дороги (волной от известных клеток); море — там, где ближайшая
  // точка — на участке берега и клетка по морскую сторону; суша — всегда выше уровня моря (нет случайных «озёр» в низинах)
  const sea=yMin-4,N=F.nx*F.nz,Ii=new Int32Array(N),Q=new Int32Array(N);let qh=0,qt=0;for(let q=0;q<N;q++){Ii[q]=F.I[q];if(Ii[q]>=0)Q[qt++]=q;}
  while(qh<qt){const q=Q[qh++],k=q%F.nx,i=Ii[q];for(const qq of [k>0?q-1:-1,k<F.nx-1?q+1:-1,q-F.nx,q+F.nx]){if(qq<0||qq>=N||Ii[qq]>=0)continue;Ii[qq]=i;Q[qt++]=qq;}}
  (trk.coast||[]).forEach(c=>{c.sea=sea;});
  for(let q=0;q<N;q++){const i=Ii[q];if(i<0)continue;const x=F.x0+(q%F.nx)*F.S,z=F.z0+Math.floor(q/F.nx)*F.S,p=P[i],nn=trk.N[i],sd=(x-p[0])*nn[0]+(z-p[2])*nn[1];let carved=false;
    for(const c of trk.coast){if(i<c.i0-12||i>c.i1+12||sd*c.side<=0)continue;const d=Math.hypot(x-p[0],z-p[2]);if(d<=trk.W/2+14)continue;
      const ends=sstep(-12,14,Math.min(i-c.i0,c.i1-i)),w=sstep(16,70,d-trk.W/2)*ends,tg=p[1]+(sea-6-p[1])*w;if(w>0.02){F.H[q]=Math.min(F.H[q],tg);F.G[q]=Math.min(F.G[q],F.H[q]);carved=w>0.5;}}
    if(!carved&&F.H[q]<sea+0.8){F.H[q]=sea+0.8;F.G[q]=Math.max(F.G[q],F.H[q]-0.45);}}}
