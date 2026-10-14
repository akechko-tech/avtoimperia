/* ---------- 0.35: дым из выхлопной трубы — по мотору, как было в истории ----------
   Отзыв: «не хватает газового выхлопа из трубы сзади; выхлоп должен отличаться в зависимости от двигателя».
   · До 1900 года: богатая смесь, калильное зажигание, масло летит в цилиндр — сизый дым; одно- и двухцилиндровые моторы
     выдыхают отдельными клубами («тук-тук» De Dion и Benz слышно и видно).
   · Двухтактный мотор (Scott, DKW): масло налито прямо в бензин — густой синеватый дым.
   · Гильзовый Knight: гильзы смазываются обильно, мотор жжёт масло — за Daimler, Minerva и Willys-Knight тянулась сизая дымка.
   · 1900-е — серый дым, 1910-е — светлее, 1920-е — почти прозрачная дымка: карбюраторы и смазка под давлением.
   · Большой гоночный мотор под полным газом — тёмные клубы (смесь богатая, чтобы не перегреть клапаны); у мощных моторов
     с 1908 года выхлоп в гонке открытый, без глушителя: на сбросе газа на высоких оборотах в трубе хлопает вспышка.
   · Мотор изношен или побит — дым густеет и синеет (масло в цилиндрах). */
function exhProfile(c){if(c.exhP)return c.exhP;let e=null;try{e=c.md?parts(c.md).e:c.e?byId(ENGINES,c.e):null;}catch(_){}e=e||{};
  // год: гонки — её год; на заводской улице (23c-plant-live.js) — год партии
  const ry=c.exhY||(typeof R!=='undefined'&&R&&R.rc&&R.rc.y)||1910,ey=e.y||ry,hp=(c.P||0)/745.7||e.hp||10,two=/Двухтакт/.test(e.name||''),cyl=e.cyl||4;let P;
  if(two)P={k:'two',col:[146,170,218],a:0.5,rate:12,size:0.15,grow:1.9,life:2.0};
  else if(e.sleeve)P={k:'sleeve',col:[158,174,206],a:0.46,rate:10,size:0.16,grow:2.0,life:2.2};
  else if(ey<1900)P={k:'early',col:[172,180,198],a:0.48,rate:10,size:0.16,grow:2.0,life:2.1};
  else if(ey<1910)P={k:'1900s',col:[188,190,198],a:0.36,rate:8,size:0.15,grow:1.8,life:1.8};
  else if(ey<1920)P={k:'1910s',col:[204,204,210],a:0.26,rate:6,size:0.14,grow:1.6,life:1.5};
  else P={k:'1920s',col:[214,214,220],a:0.17,rate:5,size:0.13,grow:1.4,life:1.3};
  // одно- и двухцилиндровые — отдельными клубами: реже, но крупнее
  if(cyl<=2&&!two){P.rate*=0.6;P.size*=1.35;P.a=Math.min(0.55,P.a*1.2);P.pulse=1;}
  P.puff=hp>=35&&!two;P.flame=hp>=45&&ry>=1908&&!two;return c.exhP=P;}
// Сколько клубов выпустить за кадр: многоцилиндровый мотор дымит ровной струйкой, одно- и двухцилиндровый — толчками
// («тук-тук»: чем выше обороты, тем чаще); h — где хранить счётчики (у машины в 3D и в 2D — свои)
function exhEmit(P,h,dt,thr,rpm,dmg,k){const r=P.rate*(0.3+thr*rpm*1.4)*(1+dmg*1.5)*k;
  if(P.pulse){const f=1.2+rpm*5;h.ph=(h.ph||0)+dt*f;if(h.ph<1)return 0;h.ph-=Math.floor(h.ph);return Math.max(1,Math.round(r/f));}
  h.acc=(h.acc||0)+dt*r;const n=Math.min(6,Math.floor(h.acc));h.acc-=n;return n;}
// Подпись к мотору в конструкторе: какой у него дым
function exhNote(e){if(!e)return '';const two=/Двухтакт/.test(e.name||'');
  if(two)return 'Выхлоп: густой синеватый дым — масло налито прямо в бензин.';
  if(e.sleeve)return 'Выхлоп: сизая дымка — гильзы смазываются обильно, мотор жжёт масло.';
  if(e.y<1900)return (e.cyl||1)<=2?'Выхлоп: сизые клубы, по одному на каждую вспышку в цилиндре.':'Выхлоп: сизый дым — смесь богатая, масло летит в цилиндр.';
  if(e.y<1910)return 'Выхлоп: серый дым, под полным газом гуще.';
  if(e.y<1920)return 'Выхлоп: светлый дымок.';
  return 'Выхлоп: почти прозрачная дымка.';}
// Дым в двухмерном виде: из той же точки трубы, что и в 3D (спрайт — та же модель под тем же углом)
function exh2d(o,sx,sy,scale,me){if(o.dnf||!o.spec3)return;const P=exhProfile(o);if(!P.rate)return;const dt=R.fdt||0.016;
  const thr=Math.max(0,o.thr||0),rpm=clamp(o.rpm||0.3,0.15,1.1),dmg=clamp((o.dmg||0)/100,0,1);
  const h=o.ex2||(o.ex2={}),cnt=exhEmit(P,h,dt,thr,rpm,dmg,me?0.8:0.5);if(!cnt&&!(P.flame&&(h.thrP||0)>0.8&&thr<0.25))return h.thrP=thr;
  let M=null;try{M=carModelFor(o.spec3,false);}catch(_){}const E=M&&M.exh&&M.exh.length?M.exh:[[0.4,0.3,((M&&M.len)||[-1.6])[0]+0.12]];
  const yaw=(typeof ANG3!=='undefined'&&o.angI!==undefined?ANG3[o.angI]:0)||0,pit=o.angN?0.5:0.16,cy=Math.cos(yaw),sn=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit);
  const at=e=>{const x=e[0]*cy+e[2]*sn,z=-e[0]*sn+e[2]*cy;return [sx+x*scale,sy-(e[1]*cp+z*sp)*scale,x];},kk=scale/40,v=Math.max(0,o.vx);
  // на картинке без 3D дым — плоские клубы без света: цвет ближе к серому, прозрачнее; дым остаётся позади и летит к камере тем быстрее,
  // чем быстрее едет машина (на месте — медленно поднимается)
  const c2=P.col.map(x=>Math.round(x*0.5+200*0.5)).join(',');
  for(let q=0;q<cnt;q++){h.k=((h.k||0)+1)%E.length;const p=at(E[h.k]),dark=P.puff&&thr>0.85&&rpm>0.55&&Math.random()<0.3,
      col=dark?'58,58,64':dmg>0.45?'150,160,186':c2,sd=p[2]<0?-1:1;
    R.parts.push({x:p[0]+(Math.random()-0.5)*0.06*scale*q,y:p[1],vx:sd*(2+Math.random()*6)*kk,vy:(Math.min(v,30)*(9+Math.random()*6)-3)*kk,r:P.size*scale*(P.pulse?1.25:1),gr:P.grow*scale*(dark?1.3:1)*(0.8+Math.random()*0.4)*(1+Math.min(v,30)/20),life:P.life*0.8,max:P.life*0.8,col,a:(dark?0.36:(P.a+dmg*0.12)*0.75)*(me?0.9:1)});}
  if(P.flame&&(h.thrP||0)>0.8&&thr<0.25&&rpm>0.8&&Math.random()<0.35){const p=at(E[0]);R.parts.push({x:p[0],y:p[1],vx:0,vy:2*kk,r:0.06*scale,gr:0.1*scale,life:0.12,max:0.12,col:'255,176,72',a:0.9});}
  h.thrP=thr;}
