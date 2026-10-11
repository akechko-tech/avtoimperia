/* ================= 0.31: ЛЕГЕНДА ТРАССЫ — МЕХАНИК ЧИТАЕТ СТЕНОГРАММУ, КАК ШТУРМАН РАЛЛИ =================
   Раньше механик кричал о повороте, когда тот уже показался. Штурман ралли ведёт иначе: заранее, ровно и по порядку
   читает легенду — каждый поворот с направлением и углом («Правый сорок пять», «Левый девяносто», «Правая шпилька»),
   его характер («крутой», «длинный», «затягивается», «открывается», «не режь», «осторожно»), расстояние до следующего
   («сто», «пятьдесят», «сразу») и то, что ждёт по пути («гребень», «трамплин», «мост», «переезд», «деревня», «грязь»).
   Гонщик едет по голосу, не видя поворота: потому и читают за 4–5 секунд, а связки «сразу» — одной фразой.
   Легенда считается по геометрии трассы перед стартом: угол — сумма поворота дороги, крутизна — по радиусу дуги,
   «не режь» — у внутренней бровки дерево, столб, стена или обрыв. Разведка трассы (оснащение команды) — читает раньше.
   Слова записаны по одному (голос механика — nav), фраза собирается из них подряд, без пауз между словами.
   Режимы (кнопка 🗣 в гонке): вся легенда, только опасное, молчит. */
const LEG_W={R15:'Правый пятнадцать',L15:'Левый пятнадцать',R30:'Правый тридцать',L30:'Левый тридцать',R45:'Правый сорок пять',L45:'Левый сорок пять',
  R60:'Правый шестьдесят',L60:'Левый шестьдесят',R90:'Правый девяносто',L90:'Левый девяносто',R120:'Правый сто двадцать',L120:'Левый сто двадцать',
  R150:'Правый сто пятьдесят',L150:'Левый сто пятьдесят',RH:'Правая шпилька',LH:'Левая шпилька',
  tight:'крутой',long:'длинный',tighten:'затягивается',open:'открывается',nocut:'не режь',care:'осторожно',
  now:'сразу',d50:'пятьдесят',d100:'сто',d150:'сто пятьдесят',d200:'двести',d300:'триста',d400:'четыреста',d500:'пятьсот',dlong:'длинная прямая',
  crest:'гребень',jump:'трамплин',bridge:'мост',rail:'переезд',vill:'деревня',town:'город',tunnel:'тоннель',serp:'серпантин',mud:'грязь',finish:'финиш'};
// как это видно в подписи
const LEG_SUB={RH:'Правая шпилька',LH:'Левая шпилька',tight:'крутой',long:'длинный',tighten:'затягивается',open:'открывается',nocut:'не режь',care:'осторожно',
  now:'сразу',d50:'50',d100:'100',d150:'150',d200:'200',d300:'300',d400:'400',d500:'500',dlong:'длинная прямая',crest:'гребень',jump:'трамплин',bridge:'мост',rail:'переезд',
  vill:'деревня',town:'город',tunnel:'тоннель',serp:'серпантин',mud:'грязь',finish:'финиш'};
const LEG_ANG=[15,30,45,60,90,120,150];
function legSub(w){const m=/^([RL])(\d+)$/.exec(w);return m?(m[1]==='R'?'Правый ':'Левый ')+m[2]:LEG_SUB[w]||w;}
function legLines(){return Object.values(LEG_W);}
// угол → ближайший из 15, 30, 45, 60, 90, 120, 150
function legAng(deg){let b=LEG_ANG[0];for(const a of LEG_ANG)if(Math.abs(a-deg)<Math.abs(b-deg))b=a;return b;}
// крутизна по радиусу — тоже «в градусах», как у штурманов: широкая дуга на 140° проходится как «тридцать», только длинная
function legAngR(R){return R>=250?15:R>=160?30:R>=100?45:R>=65?60:R>=40?90:R>=26?120:150;}
/* ---------- легенда по геометрии трассы ---------- */
function legBuild(T){const n=T.n,st=T.step,K=T.K,cl=!!T.closed,W=T.W,P=T.pts;if(!n||!K)return {L:[],b0:0,span:0};
  const i0=cl?0:(T.startIdx||0),i1=cl?n-1:(T.finishIdx||n-1);
  const Ks=new Float32Array(n);for(let i=0;i<n;i++){let s=0,c=0;for(let d=-2;d<=2;d++){let j=i+d;if(cl)j=(j%n+n)%n;else if(j<0||j>=n)continue;s+=K[j];c++;}Ks[i]=c?s/c:0;}
  const TH=1/260;
  // замкнутый круг читаем с прямого места, чтобы поворот не разрезало «швом» круга
  let b0=i0;if(cl){let best=0,bv=1e9;for(let i=0;i<n;i+=2){let v=0;for(let d=-6;d<=6;d++)v+=Math.abs(Ks[((i+d)%n+n)%n]);if(v<bv){bv=v;best=i;}}b0=best;}
  const span=cl?n:Math.max(0,i1-i0),ix=k=>cl?(b0+k)%n:i0+k,L=[];
  // 1) повороты
  for(let k=0;k<span;){const i=ix(k);if(Math.abs(Ks[i])<TH){k++;continue;}const dir=Math.sign(Ks[i]);let k1=k,gap=0;
    while(k1+1<span){const j=ix(k1+1),a=Math.abs(Ks[j]),sg=Math.sign(Ks[j]);if(sg===dir&&a>=TH*0.6){k1++;gap=0;}else if(sg===dir&&gap<2){k1++;gap++;}else break;}
    k1-=gap;let ang=0,kmax=0,ka=k;const m=k1-k+1;let a1=0,a2=0;
    for(let q=k;q<=k1;q++){const j=ix(q),a=Math.abs(Ks[j]);ang+=Math.abs(K[j])*st;if(a>kmax){kmax=a;ka=q;}if(q-k<m/3)a1+=a;else if(q-k>=m*2/3)a2+=a;}
    const deg=ang*180/Math.PI,R=1/Math.max(1e-6,kmax);
    if(deg>=10||R<80)L.push({t:'c',k0:k,k1,ka,dir,deg:Math.max(deg,12),R,len:m*st,a1:a1/Math.max(1,Math.ceil(m/3)),a2:a2/Math.max(1,Math.ceil(m/3))});
    k=k1+1;}
  // характер поворота
  const colAt=(k,lat,r)=>{const j=ix(k),p=P[j],nn=T.N[j],x=p[0]+nn[0]*lat,z=p[2]+nn[1]*lat;return (typeof colNear==='function'?colNear(T,x,z,r):[]).some(o=>Math.hypot(o.x-x,o.z-z)<(o.r||0.3)+r*0.6&&!/crowd|marsh|gend|photo/.test(o.kind||''));};
  for(const c of L){c.hair=c.deg>=140&&c.R<30;c.call=Math.min(legAng(c.deg),legAngR(c.R));c.w=c.hair?(c.dir<0?'RH':'LH'):(c.dir<0?'R':'L')+c.call;
    c.tight=!c.hair&&c.R<36&&c.deg>=40;c.long=!c.hair&&(c.deg>=c.call*1.6&&c.deg>=40||c.len>=90&&c.deg>=40);
    c.tighten=!c.hair&&c.deg>=40&&c.a2>c.a1*1.6;c.open=!c.hair&&c.deg>=40&&!c.tighten&&c.a1>c.a2*1.6;
    // внутренняя бровка — со стороны поворота (поворот налево: кривизна > 0, бровка слева, lat > 0)
    const inS=c.dir>0?1:-1;c.nocut=c.deg>=30&&(colAt(c.ka,inS*(W/2+1.3),1.6)||colAt(Math.round((c.k0+c.ka)/2),inS*(W/2+1.3),1.6));}
  // 2) опасности по пути: гребень и трамплин (по уклону), мост, тоннель, переезд, деревня и город, серпантин, грязь, финиш
  const H=[],add=(k,w,x)=>{if(k<0||k>=span)return;if(H.some(h=>h.w===w&&Math.abs(h.k0-k)*st<60))return;H.push(Object.assign({t:'h',k0:k,k1:k,w},x||{}));};
  const y=k=>P[ix(clamp(k,0,span-1))][1],gr=k=>(y(k+1)-y(k-1))/(2*st);
  for(let k=3;k<span-3;k++){const g0=gr(k-2),g1=gr(k+2),dg=g0-g1;if(g0>0.025&&g1<-0.015&&dg>0.05){let best=k,bv=dg;for(let q=k+1;q<Math.min(span-3,k+6);q++){const v=gr(q-2)-gr(q+2);if(v>bv){bv=v;best=q;}}add(best,bv>0.12?'jump':'crest');k=best+6;}}
  const S=T.segT;for(let k=1;k<span;k++){const j=ix(k),p=ix(k-1);
    if(T.bridge&&T.bridge[j]&&!T.bridge[p])add(k-2,'bridge');
    if(T.tunAt&&T.tunAt[j]&&!T.tunAt[p])add(k-2,'tunnel');
    if(S&&S[j]!==S[p]){if(S[j]===RSEG.town)add(k,'town');else if(S[j]===RSEG.village)add(k,'vill');else if(S[j]===RSEG.serp)add(k,'serp');}}
  for(const rl of T.rails||[]){if(rl.duel)continue;const k=cl?((rl.i-b0)%n+n)%n:rl.i-i0;add(k-1,'rail');}
  // грязь: ямы на раскисшей дороге идут через 150–350 м — штурман говорит «грязь» в начале грязного участка (и снова через километр), а не у каждой ямы
  {const ks=(T.patches||[]).filter(Pt=>Pt.kind==='mudhole'&&!Pt.rain).map(Pt=>cl?((Pt.i0-b0)%n+n)%n:Pt.i0-i0).filter(k=>k>=0&&k<span).sort((a,b)=>a-b);
    let z0=-1e9,last=-1e9;for(const k of ks){if((k-last)*st<400&&(k-z0)*st<1200){last=k;continue;}add(k,'mud');z0=last=k;}}
  if(!cl)add(span-1,'finish');
  // опасность внутри поворота — к самому повороту не пристраиваем, читаем перед ним
  const all=L.concat(H).sort((a,b)=>a.k0-b.k0||(a.t==='h'?-1:1));
  // «осторожно»: крутой поворот после длинной прямой или сразу за гребнем
  for(let q=0;q<all.length;q++){const c=all[q];if(c.t!=='c')continue;const prev=all[q-1];const straight=prev?(c.k0-prev.k1)*st:c.k0*st,sharp=c.hair||c.R<45;
    c.care=sharp&&(straight>=260||(prev&&prev.t==='h'&&(prev.w==='crest'||prev.w==='jump')&&(c.k0-prev.k0)*st<45));}
  return {L:all,b0,i0,span,cl,n};}
// слова одной записи легенды: поворот и характер; опасность — одно слово
function legWords(c,full){if(c.t==='h')return [c.w];const w=[c.w];if(c.care)w.unshift('care');if(c.tight)w.push('tight');if(c.long)w.push('long');
  if(full){if(c.tighten)w.push('tighten');else if(c.open)w.push('open');if(c.nocut)w.push('nocut');}return w;}
function legDist(d){return d<30?'now':d<75?'d50':d<125?'d100':d<175?'d150':d<250?'d200':d<350?'d300':d<450?'d400':d<700?'d500':d<1200?'dlong':null;}
// опасное (режим «только опасное»): крутые, длинные и «осторожно», шпильки; гребни, трамплины, мосты, переезды, финиш
function legDanger(c){return c.t==='h'?['crest','jump','bridge','rail','finish','mud'].includes(c.w):(c.hair||c.tight||c.care||c.deg>=85||c.nocut);}
/* ---------- чтение по ходу ---------- */
function legMode(){const m=AU.on&&AU.on.nav;return m==='danger'||m==='off'?m:'full';}
function legPos(T,me){const G2=T.leg;if(!G2)return 0;return G2.cl?((me.idx-G2.b0)%G2.n+G2.n)%G2.n:me.idx-G2.i0;}
function legTick(me,T,recon){if(!T.leg)T.leg=legBuild(T);const LG=T.leg,L=LG.L;if(!L.length)return;const mode=legMode();if(mode==='off')return;
  const st=T.step,kc=legPos(T,me);
  // новый круг или машину вернули на трассу назад — указатель заново
  if(NAV.legK===undefined||kc<NAV.legK-20||kc>NAV.legK+60){NAV.legI=L.findIndex(c=>c.k1>=kc);if(NAV.legI<0)NAV.legI=L.length;}
  NAV.legK=kc;
  while(NAV.legI<L.length&&L[NAV.legI].k1<kc)NAV.legI++;
  if(NAV.legI>=L.length)return;
  const v=Math.max(5,me.vx||0),lead=clamp(v*4.3+30,70,300)*(recon?1.25:1);
  let c=L[NAV.legI],dA=(c.k0-kc)*st;
  // только опасное — остальное пропускаем
  if(mode==='danger')while(c&&!legDanger(c)){NAV.legI++;c=L[NAV.legI];if(!c)return;dA=(c.k0-kc)*st;}
  if(dA>lead)return;
  if(R.time<NAV.until)return;
  // поздно: поворот уже почти под колёсами — простое опускаем, опасное говорим коротко
  const late=dA<v*1.1;if(late&&!legDanger(c)){NAV.legI++;return;}
  const words=[],sub=[];let q=NAV.legI,cnt=0;
  while(q<L.length&&cnt<3){const cur=L[q];const w=late&&cnt===0?legWords(cur,false).slice(0,2):legWords(cur,mode==='full');words.push(...w);sub.push(w.map(legSub).join(' '));cnt++;
    const nx=L[q+1];if(!nx){q++;break;}
    if(mode==='danger'&&!legDanger(nx)){q++;break;}
    const gap=(nx.k0-cur.k1)*st,dw=legDist(gap);
    // «сразу» — следующая запись этой же фразой (до трёх подряд); дальше — следующая фраза тотчас
    if(dw==='now'){if(cnt<3){words.push('now');sub.push(LEG_SUB.now);q++;continue;}q++;break;}
    if(dw&&mode==='full'){words.push(dw);sub.push(legSub(dw));}
    q++;break;}
  NAV.legI=q;NAV.legSaid=(NAV.legSaid||0)+1;
  navSpeak(words.map(w=>LEG_W[w]),sub.join(' · '),5);}
// «Тормози!» — следующий поворот близко, а скорость для него велика и гонщик не тормозит
function legBrake(me,T){const LG=T.leg;if(!LG||!LG.L.length)return;const kc=legPos(T,me),st=T.step;
  const c=LG.L.find(x=>x.t==='c'&&x.k0>kc&&(x.k0-kc)*st<80);if(!c||NAV.brkC===c)return;
  const v=Math.max(0,me.vx),mu=roadMuAt(T,me.idx)*me.grip*twAll(me)*1.08,vc=Math.sqrt(mu*GRAV*c.R),bdec=(me.brakeK||0.8)*mu*GRAV*0.8,need=v>vc?(v*v-vc*vc)/(2*bdec):0,d=(c.k0-kc)*st;
  if(need>d*0.95&&!(me.brk>0.5)){NAV.brkC=c;navSay('brk',10,0.9);}}
