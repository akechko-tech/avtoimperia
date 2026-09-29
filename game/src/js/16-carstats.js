/* ================= CAR STATS: physics from components ================= */
// Подготовка к гонке: серийная машина, облегчённая (без тента, крыльев и задних сидений), заводской гоночный кузов
const PREP=[{id:0,name:'Серийная',desc:'как в продаже',cost:0},{id:1,name:'Облегчённая',desc:'без тента, крыльев и фонарей',cost:0.2},{id:2,name:'Заводской гоночный кузов',desc:'узкий кузов, форсированный мотор',cost:0.55}];
function mechanicEra(y){return y<1925;}
function racingCd(y){return y<1906?0.85:y<1914?0.75:y<1922?0.65:0.55;}
// Вес, мощность, тормоза, сцепление и надёжность — без расчёта разгона (быстро, для рынка)
function carBase(md,prep,y){
  const p=parts(md),U=id=>upgOf(md,id);prep=prep||0;y=y||(G?G.y:1895);
  let bodyKg=p.b.kg*(1-0.03*U(p.b.id)),cd=p.b.cd,cg=p.b.cg,hpK=1,relK=1;
  if(p.t.id==='t2')bodyKg+=40;else if(p.t.id==='t1')bodyKg+=15;
  // спортивное оснащение: облегчённый кузов, настроенный мотор (чуть меньше запас прочности)
  if(p.t.id==='t3'){bodyKg*=0.85;hpK=1.08;relK=0.98;}
  // гоночный кузов легче серийного, но класс остаётся: четырёхместная база тяжелее двухместной; грузовику гоночный кузов не поставить
  if(prep===2&&p.b.truck)prep=1;
  if(prep===1){bodyKg*=p.b.truck?0.9:0.72;cd*=0.88;hpK*=1.05;relK*=0.98;cg-=0.03;}
  if(prep===2){bodyKg=50+0.4*p.b.kg+(y<1905?40:0);cd=Math.min(cd,racingCd(y)*(0.9+0.12*Math.min(5,p.b.seats||2)/5));cg=0.6+0.04*(Math.min(5,p.b.seats||2)-2)/3;hpK=1.25;relK=0.93;}
  const hp=engineHp(p.e,md)*hpK,crew=75+(mechanicEra(y)?70:0);
  const m=p.e.kg+p.g.kg+p.k.kg+p.c.kg*(1-0.04*U(p.c.id))+bodyKg+p.w.kg+crew+40;
  // передача: КПД коробки (прямая передача и кардан теряют меньше, чем ремни и цепи)
  const eff=p.g.eff*(1+0.01*U(p.g.id)),P=hp*745.7*0.82*eff/0.9,kd=0.5*1.2*cd,crr=p.w.solid?0.03:0.016;
  const grip=(p.w.grip||1)*(1+0.06*U(p.w.id)),brk=p.k.brk*(1+0.05*U(p.k.id));
  // надёжность: мотор, коробка, запас прочности рамы, проколы
  const load=p.e.hp/Math.max(1,chassisMax(p.c,md)),durK=1.02-0.06*clamp(load-0.5,0,0.5);
  const rel=clamp(p.e.rel*(1+0.02*U(p.e.id))*p.g.relK*(1+0.01*U(p.g.id))*durK*(1-0.03*(p.w.punct||0))/0.99*relK*(overpower(md)?0.75:1),0.3,0.99);
  return {hp,kg:Math.round(m),P,kd,crr,cd,cg,brk,grip,rel,wb:p.c.wb+(p.e.hp>40?0.3:0),wire:!!p.w.wire,mech:mechanicEra(y),hpKg:hp/m*1000};
}
function carStats(md,prep,y){
  y=y||(G?G.y:1895);const st=carBase(md,prep,y),{P,kd,crr}=st,m=st.kg,p=parts(md),g=9.81;
  let v=20;for(let i=0;i<30;i++){const f=kd*v*v*v+crr*m*g*v-P,df=3*kd*v*v+crr*m*g;v=Math.max(3,v-f/df);}
  let t=0,vv=0.5,t30=999;const muT=0.75*(p.w.grip||1);while(vv<16.7&&t<120){const a=Math.min(muT*g*0.56,(P/Math.max(vv,3.5)-kd*vv*vv-crr*m*g)/m);if(a<=0.02){t=999;break;}vv+=a*0.05;t+=0.05;if(vv>=8.33&&t30===999)t30=t;}
  st.vmax=v;st.acc=t;st.acc30=t30;return st;
}
// Какие колёса рисовать: деревянные, проволочные или стальные диски
function wheelKind(md,y){const w=parts(md).w;return w.wire?'wire':w.disc?'disc':y>=1912?'wire':'wood';}
function accText(st){return st.acc<999?`0–60 за ${st.acc.toFixed(1).replace('.',',')} с`:st.acc30<999?`0–30 за ${st.acc30.toFixed(1).replace('.',',')} с`:'разгон медленный';}
function statsLine(st){return `${Math.round(st.vmax*3.6)} км/ч · ${accText(st)} · ${st.kg} кг · ${Math.round(st.hp)} л.с.`;}
