/* ================= 0.60, этап 3 (доводка): рисунки кузовов и видов 1930–1960 =================
   Прежний рисунок (carSVG) строит машину на раме с отдельными крыльями — так выглядели автомобили до тридцатых.
   У кузовов 1934–1959 годов свой силуэт: обтекаемый, понтонный, вагонный. Здесь — десять рисунков в том же поле
   (220×100, земля на 94, нос вправо), в цвете модели; колёса вращаются тем же классом .spin. */
const ART60={b30:'stream',b31:'micro',b32:'pontoon',b33:'hardtop',b34:'small',b35:'roadster',b36:'jeep',b37:'offroad',b38:'minibus',b39:'mtank',b40:'pickup',b41:'wagon'};
function carSVG60(md,opt){opt=opt||{};let p;try{p=parts(md);}catch(_){return null;}const k=p&&p.b?ART60[p.b.id]:null;if(!k)return null;
  const paint=md.paint||'#1b1d22',dark='#15161a',glass='#a9c6db',chrome='#cfd3da',lite=typeof shade==='function'?shade(paint,0.55):'#e8e4d8',deep=typeof shade==='function'?shade(paint,-0.25):dark,GY=94,lux=md.t==='t2';
  const wheel=(cx,R,o)=>{o=o||{};const wy=GY-R;let w=`<circle cx="${cx}" cy="${wy}" r="${R}" fill="${dark}"${o.knob?' stroke="#2c2d31" stroke-width="2.4" stroke-dasharray="2.2 2"':''}/>`;
    if(lux&&!o.knob)w+=`<circle cx="${cx}" cy="${wy}" r="${R-2.2}" fill="none" stroke="#e8e6df" stroke-width="1.8"/>`;
    if(o.wire){w+=`<g class="spin" style="transform-origin:${cx}px ${wy}px">`;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;w+=`<line x1="${cx}" y1="${wy}" x2="${(cx+Math.cos(a)*(R-3)).toFixed(1)}" y2="${(wy+Math.sin(a)*(R-3)).toFixed(1)}" stroke="${chrome}" stroke-width=".7"/>`;}w+=`</g><circle cx="${cx}" cy="${wy}" r="2" fill="${chrome}"/>`;}
    else w+=`<circle cx="${cx}" cy="${wy}" r="${R-4}" fill="${o.hub||chrome}"/><g class="spin" style="transform-origin:${cx}px ${wy}px"><circle cx="${cx}" cy="${wy}" r="${R-6}" fill="none" stroke="${dark}" stroke-width="1" stroke-dasharray="2.5 3"/></g><circle cx="${cx}" cy="${wy}" r="1.8" fill="${dark}"/>`;
    return w;};
  const arch=(cx,R)=>`<path d="M${cx-R-3},${GY-R+2} A${R+3},${R+3} 0 0 1 ${cx+R+3},${GY-R+2}Z" fill="${dark}"/>`;
  const r=(x,y,w,h,f,rx,op)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx?` rx="${rx}"`:''} fill="${f}"${op?` opacity="${op}"`:''}/>`;
  const drv=(x,y)=>`<rect x="${x-5}" y="${y}" width="10" height="11" rx="3" fill="#3c3f47"/><circle cx="${x}" cy="${y-4}" r="4.2" fill="#e0b894"/><path d="M${x-5},${y-5} q5,-6 10,0 z" fill="${dark}"/>`;
  let b='',w='',sh=[110,84];
  if(k==='pontoon'||k==='hardtop'){const ht=k==='hardtop',x0=ht?14:22,R=11,rx=ht?62:64,fx=158,roof=ht?lite:paint,ry=ht?37:35;
    b+=`<path d="M${x0},80 V66 Q${x0},58 ${x0+10},57 H78 L${ht?92:88},${ry+3} Q${ht?94:90},${ry} ${ht?100:96},${ry} H128 Q134,${ry} 138,${ry+5} L150,56 L192,58 Q202,60 202,68 V80Z" fill="${paint}"/>`;
    if(ht)b+=`<path d="M80,57 L92,${ry+3} Q94,${ry} 100,${ry} H128 Q134,${ry} 138,${ry+5} L149,56Z" fill="${roof}"/><path d="M${x0},58 l8,-7 h6 l6,6z" fill="${paint}"/>`;
    b+=ht?`<path d="M96,54 L101,${ry+4} H130 L143,54Z" fill="${glass}"/>`:`<path d="M92,54 L96,39 H110 V54Z" fill="${glass}"/><path d="M114,54 V39 H129 L142,54Z" fill="${glass}"/>`;
    b+=r(x0+6,67,180-x0+10,1.6,chrome)+r(200,74,6,4,chrome,1.5)+r(x0-4,74,6,4,chrome,1.5)+`<circle cx="199" cy="65" r="3" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(x0,61,3,5,'#b8322a',1)+r(196,69,6,3,chrome,1);
    b+=arch(rx,R)+arch(fx,R);w=wheel(rx,R)+wheel(fx,R);sh=[(rx+fx)/2,96];}
  else if(k==='wagon'){const R=11,rx=64,fx=158;
    b+=`<path d="M22,80 V44 Q22,36 32,35 H128 Q134,35 138,40 L150,56 L192,58 Q202,60 202,68 V80Z" fill="${paint}"/>`;
    b+=`<path d="M28,54 V40 H56 V54Z" fill="${glass}"/><path d="M60,54 V40 H88 V54Z" fill="${glass}"/><path d="M92,54 V40 H110 V54Z" fill="${glass}"/><path d="M114,54 V40 H129 L142,54Z" fill="${glass}"/>`;
    b+=r(28,67,168,1.6,chrome)+r(200,74,6,4,chrome,1.5)+r(18,74,6,4,chrome,1.5)+`<circle cx="199" cy="65" r="3" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(22,60,3,5,'#b8322a',1)+r(196,69,6,3,chrome,1);
    b+=arch(rx,R)+arch(fx,R);w=wheel(rx,R)+wheel(fx,R);sh=[111,96];}
  else if(k==='pickup'){const R=13,rx=62,fx=156;
    b+=`<path d="M106,80 V58 L112,40 Q114,34 122,34 H140 Q146,34 150,40 L158,56 L190,60 Q202,62 202,70 V80Z" fill="${paint}"/>`+r(24,54,82,24,paint,1)+r(22,52,86,3,deep)+r(24,76,82,4,dark);
    for(let i=1;i<5;i++)b+=r(24+i*16.4,56,1,20,deep,0,0.6);b+=`<path d="M118,56 L121,39 H140 Q144,40 146,44 L152,56Z" fill="${glass}"/>`;
    for(let i=0;i<4;i++)b+=r(196,62+i*3,7,1.6,chrome);b+=r(200,76,7,4,chrome,1.5)+r(18,76,8,4,dark,1)+`<circle cx="192" cy="64" r="3.2" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(24,58,2.5,5,'#b8322a',1);
    b+=`<path d="M${rx-R-5},80 Q${rx-R-5},${GY-2*R-6} ${rx},${GY-2*R-6} Q${rx+R+5},${GY-2*R-6} ${rx+R+5},80Z" fill="${paint}" stroke="${deep}" stroke-width="1"/>`+arch(rx,R)+arch(fx,R);w=wheel(rx,R)+wheel(fx,R);sh=[110,98];}
  else if(k==='stream'){const R=13,rx=60,fx=156;
    b+=`<path d="M24,80 L22,72 Q30,54 70,42 Q90,31 112,31 H128 Q136,32 142,41 L152,55 Q176,54 192,60 Q205,65 205,74 V80Z" fill="${paint}"/>`;
    b+=`<path d="M136,80 Q138,60 158,60 Q178,60 182,80Z" fill="${deep}"/><path d="M40,80 Q42,62 60,62 Q78,62 82,80Z" fill="${deep}"/>`;   // крылья-обтекатели
    b+=`<path d="M96,52 L102,36 H114 V52Z" fill="${glass}"/><path d="M118,52 V36 H128 Q133,37 137,43 L143,52Z" fill="${glass}"/><path d="M74,52 Q84,42 92,38 L90,52Z" fill="${glass}"/>`;
    for(let i=0;i<5;i++)b+=r(194+i*2.2,60+i*0.6,1,16-i*1.2,chrome);b+=r(203,76,6,3.5,chrome,1.5)+r(18,76,8,3.5,chrome,1.5)+`<circle cx="190" cy="62" r="3.2" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(84,80,50,2,dark);
    w=wheel(rx,R)+wheel(fx,R)+`<path d="M${rx-R-2},${GY-R} Q${rx},${GY-2*R-4} ${rx+R+2},${GY-R}Z" fill="${deep}"/>`;sh=[108,98];}
  else if(k==='micro'||k==='small'){const mc=k==='micro',R=10,rx=mc?78:74,fx=mc?142:146,x0=mc?56:44,xf=mc?166:174;
    b+=mc?`<path d="M56,80 V66 Q58,58 68,56 L74,44 Q78,36 88,36 H112 Q120,36 124,44 L132,58 L158,62 Q166,64 166,72 V80Z" fill="${paint}"/><path d="M80,54 L84,40 H112 Q117,41 120,46 L125,54Z" fill="${glass}"/>`
      :`<path d="M44,80 V68 Q46,60 56,55 L70,40 Q74,34 84,34 H118 Q126,34 130,42 L140,56 L166,62 Q174,64 174,72 V80Z" fill="${paint}"/><path d="M76,54 L80,38 H98 V54Z" fill="${glass}"/><path d="M102,54 V38 H118 Q123,39 126,44 L132,54Z" fill="${glass}"/>`;
    if(mc)for(let i=0;i<4;i++)b+=r(160+i*1.6,64,0.8,10,chrome);else{for(let i=0;i<4;i++)b+=r(47+i*2.4,62+i*0.4,1,8,dark,0,0.6);b+=r(166,66,7,1.2,chrome)+r(166,69,7,1.2,chrome);}
    b+=r(xf-2,75,6,3.5,chrome,1.5)+r(x0-4,75,6,3.5,chrome,1.5)+`<circle cx="${xf-8}" cy="${mc?63:65}" r="2.8" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(x0,63,2.5,4,'#b8322a',1);
    b+=arch(rx,R)+arch(fx,R);w=wheel(rx,R)+wheel(fx,R);sh=[(rx+fx)/2,mc?68:76];}
  else if(k==='roadster'){const R=12,rx=62,fx=150;
    b+=`<path d="M26,79 Q24,66 40,62 Q60,56 84,62 L96,65 L118,63 Q124,55 132,55 L176,57 Q200,61 204,73 V79Z" fill="${paint}"/>`;
    b+=r(92,58,14,8,'#4a2f1f',2)+drv(104,50)+`<path d="M120,63 L113,45" stroke="${chrome}" stroke-width="1.6"/><path d="M119,62 L113,46 L111,46 L116,62Z" fill="${glass}" opacity=".8"/>`;
    b+=`<ellipse cx="200" cy="70" rx="2.6" ry="5" fill="${dark}" stroke="${chrome}" stroke-width="1"/><circle cx="190" cy="63" r="3" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(26,68,2.5,4,'#b8322a',1)+r(150,66,26,1,dark,0,0.5);
    b+=arch(rx,R)+arch(fx,R);w=wheel(rx,R,{wire:1})+wheel(fx,R,{wire:1});sh=[106,100];}
  else if(k==='jeep'||k==='offroad'){const jp=k==='jeep',R=13,rx=66,fx=146,top='#d9d5c6';
    b+=r(40,56,80,22,paint,1)+r(118,57,56,21,paint,1)+r(172,55,5,24,paint)+r(126,69,44,3,deep)+r(176,74,7,4,dark,1)+r(34,74,8,4,dark,1);
    for(let i=0;i<6;i++)b+=r(173,58+i*3,3,1.6,dark);
    if(jp){b+=r(88,56,22,8,dark,0,0.85)+drv(98,44)+`<path d="M119,57 L114,34" stroke="${deep}" stroke-width="2.4"/><path d="M117,56 L113,36 L111,36 L114,56Z" fill="${glass}" opacity=".8"/>`+r(70,50,16,7,deep,2);}
    else{b+=r(40,32,80,24,top,2)+r(38,29,84,4,top,2)+r(46,37,26,15,glass,1)+r(78,37,34,15,glass,1);}
    b+=`<circle cx="33" cy="62" r="9" fill="${dark}"/><circle cx="33" cy="62" r="4" fill="${deep}"/><circle cx="168" cy="62" r="2.6" fill="#f4eccc" stroke="${dark}" stroke-width="1"/>`;
    w=wheel(rx,R,{knob:1,hub:deep})+wheel(fx,R,{knob:1,hub:deep});sh=[106,90];}
  else if(k==='minibus'){const R=11,rx=66,fx=150;
    b+=`<path d="M28,80 V42 Q28,28 42,28 H176 Q192,28 196,44 L200,62 Q202,70 202,80Z" fill="${paint}"/><path d="M28,56 V42 Q28,28 42,28 H176 Q192,28 196,44 L199,56Z" fill="${typeof shade==='function'?shade(paint,0.84):'#e9e6da'}"/>`;
    for(let i=0;i<5;i++)b+=r(38+i*26,36,22,15,glass,2);b+=`<path d="M172,36 H184 Q190,37 192,44 L195,52 H172Z" fill="${glass}"/>`;
    b+=`<path d="M199,58 L190,72" stroke="${chrome}" stroke-width="1.4"/><circle cx="198" cy="68" r="3" fill="#f4eccc" stroke="${chrome}" stroke-width="1"/>`+r(200,76,6,3.5,chrome,1.5)+r(24,76,6,3.5,chrome,1.5)+r(28,62,2.5,4,'#b8322a',1)+r(30,56,168,1.2,chrome);
    b+=arch(rx,R)+arch(fx,R);w=wheel(rx,R)+wheel(fx,R);sh=[112,96];}
  else{// средний танк: гусеница с шестью катками, корпус с наклонным лбом, башня, длинная пушка
    b+=r(24,70,172,24,'#2a2b2e',12)+r(30,74,160,16,'#1b1c1f',8);for(let i=0;i<6;i++)b+=`<circle cx="${48+i*24}" cy="84" r="8" fill="${deep}" stroke="${dark}" stroke-width="1.5"/><circle cx="${48+i*24}" cy="84" r="2.4" fill="${dark}"/>`;
    b+=`<circle cx="32" cy="80" r="6" fill="${deep}" stroke="${dark}" stroke-width="1.5"/><circle cx="188" cy="80" r="6" fill="${deep}" stroke="${dark}" stroke-width="1.5"/>`;
    b+=`<path d="M26,70 L32,58 L44,54 H168 L196,66 V70Z" fill="${paint}"/>`+r(24,68,174,3,deep)+`<path d="M92,54 Q92,38 106,36 H132 Q144,38 146,54Z" fill="${paint}"/>`+r(144,43,60,3.4,'#2a2b2e',1)+r(202,42,5,5.4,'#2a2b2e',1)+r(138,40,10,10,deep,2)+r(104,30,14,7,deep,3)+r(170,58,10,2,dark,1);
    sh=[110,100];}
  const shadow=`<ellipse cx="${sh[0]}" cy="${GY+2}" rx="${sh[1]}" ry="3" fill="#000" opacity=".28"/>`,xmlns=opt.standalone?' xmlns="http://www.w3.org/2000/svg" width="220" height="100"':'';
  return `<svg${xmlns} viewBox="0 0 220 100" class="car ${opt.anim?'anim':''}" role="img" aria-label="${esc(md.name||'Автомобиль')}">${shadow}<g class="body">${b}</g>${w}</svg>`;}
