/* ================= 0.37: АЭРОПЛАН В ПРОФИЛЬ (SVG) — по схеме, мотору, шасси, вооружению и кабине =================
   Рисунок 320×140: нос справа. Толкающие схемы (Фарман, Райт) — гондола впереди, мотор и винт за крылом, хвост на балках;
   тянущие — фюзеляж, мотор и винт в носу. В войну у военных — опознавательные знаки страны (кокарды, кресты) и полосы на руле. */
const AIR_PAINTS=[{id:'#d9cfb2',n:'Лён под лаком'},{id:'#b7bcc0',n:'Серебро'},{id:'#6c6a40',n:'Хаки'},{id:'#4f5a33',n:'Олива'},{id:'#b07a45',n:'Фанера'},{id:'#a8261d',n:'Красный'},{id:'#2e4a7a',n:'Синий'},{id:'#d8b13a',n:'Жёлтый'},{id:'#232323',n:'Чёрный'}];
function airShade(c,k){const v=hex2rgb(c);return '#'+v.map(x=>Math.max(0,Math.min(255,Math.round(x*k))).toString(16).padStart(2,'0')).join('');}
// знаки: кокарда (кольца от края к центру) или крест; полосы руля (от передней кромки к задней)
const AIR_MARK={fr:{ring:['#c8102e','#ffffff','#1f3e8c'],rud:['#1f3e8c','#ffffff','#c8102e']},uk:{ring:['#1f3e8c','#ffffff','#c8102e'],rud:['#1f3e8c','#ffffff','#c8102e']},
  it:{ring:['#c8102e','#ffffff','#1b7a3a'],rud:['#1b7a3a','#ffffff','#c8102e']},us:{ring:['#c8102e','#1f3e8c','#ffffff'],rud:['#c8102e','#ffffff','#1f3e8c']},
  ru:{ring:['#ffffff','#1f3e8c','#c8102e'],rud:null},de:{cross:1,rud:null},su:{star:1,rud:null}};
function airMarkKey(c,t){if(c==='ru'&&t>=1918)return 'su';return c;}
function airArtSVG(md,o){o=o||{};const y=o.y||1912,P=airParts(md),f=P.f.id,col=md.paint||'#d9cfb2',dk=airShade(col,0.72),lt=airShade(col,1.12),wood='#8a5a32',metal='#7d8186',dark='#2a2724',rib=airShade(col,0.86);
  const n=Math.max(1,md.n||1),mil=['recon','fight','bomb','sea'].includes(md.role),marked=mil&&(y>=1914.6||o.mark),mk=AIR_MARK[airMarkKey(o.c||'fr',y)]||AIR_MARK.fr,anim=o.anim?' class="prop-spin"':'';
  const out=[];const L=(x1,y1,x2,y2,w,c)=>out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c||dark}" stroke-width="${w||0.8}" stroke-linecap="round"/>`);
  const Pp=(d,fill,st,w)=>out.push(`<path d="${d}" fill="${fill||'none'}" stroke="${st||dark}" stroke-width="${w||0.8}" stroke-linejoin="round"/>`);
  const C=(cx,cy,r,fill,st,w)=>out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill||'none'}" stroke="${st||dark}" stroke-width="${w||0.8}"/>`);
  const wheel=(x,yy,r)=>{C(x,yy,r,'#1d1d1f','#000',0.6);C(x,yy,r*0.45,'#5a5c60','none');};
  const ground=122,sea=P.g.sea||P.f.boat;
  // крыло в профиль: тонкая выпуклая пластина (x0 — задняя кромка, x1 — передняя)
  const wingSide=(x0,x1,yy,th)=>{const c=x1-x0,t=th||Math.max(2.2,c*0.07);Pp(`M${x0} ${yy} Q${x0+c*0.55} ${yy-t*1.4} ${x1} ${yy-t*0.2} Q${x1+1.5} ${yy+t*0.5} ${x1-c*0.12} ${yy+t*0.55} L${x0} ${yy+0.6}Z`,col,dk,0.7);
    for(let i=1;i<4;i++)L(x0+c*i/4,yy-t*0.9*(1-Math.abs(i/4-0.55)),x0+c*i/4,yy+0.4,0.3,rib);};
  const prop=(x,yy,r,vert)=>{out.push(`<g${anim}><ellipse cx="${x}" cy="${yy}" rx="${vert?2.2:r}" ry="${vert?r:2.2}" fill="rgba(60,40,25,.18)" stroke="rgba(60,40,25,.45)" stroke-width="0.5"/>`);
    out.push(vert?`<path d="M${x-1.2} ${yy-r} L${x+1.2} ${yy-r} L${x+0.8} ${yy+r} L${x-0.8} ${yy+r}Z" fill="${wood}" opacity=".85"/>`:`<path d="M${x-r} ${yy-1} L${x+r} ${yy-1} L${x+r} ${yy+1} L${x-r} ${yy+1}Z" fill="${wood}" opacity=".85"/>`);out.push('</g>');};
  const engNose=(x,yy,h)=>{const e=P.e.cool;if(e==='r'){Pp(`M${x} ${yy-h*0.55} Q${x+9} ${yy-h*0.6} ${x+10} ${yy} Q${x+9} ${yy+h*0.6} ${x} ${yy+h*0.55}Z`,metal,'#55585c',0.7);for(let i=-2;i<=2;i++)L(x+3,yy+i*h*0.2,x+9,yy+i*h*0.21,0.5,'#4a4d50');return x+10;}
    if(e==='a'&&P.e.id==='a5'){C(x+4,yy-h*0.15,h*0.32,metal,'#55585c',0.7);L(x+4,yy,x+4,yy-h*0.6,1.5,'#4a4d50');L(x+4,yy,x+9,yy-h*0.4,1.5,'#4a4d50');L(x+4,yy,x-1,yy-h*0.4,1.5,'#4a4d50');return x+8;}
    if(e==='a'){Pp(`M${x} ${yy-h*0.5} L${x+8} ${yy-h*0.62} L${x+8} ${yy+h*0.62} L${x} ${yy+h*0.5}Z`,'#3c3f43','#2a2c2f',0.7);for(let i=-2;i<=2;i++)Pp(`M${x+3} ${yy+i*h*0.24-1.6} h6 v3.2 h-6Z`,metal,'#3a3d40',0.4);return x+9;}
    Pp(`M${x} ${yy-h*0.5} L${x+12} ${yy-h*0.42} L${x+14} ${yy-h*0.1} L${x+14} ${yy+h*0.35} L${x} ${yy+h*0.5}Z`,metal,'#55585c',0.7);
    for(let i=0;i<3;i++)L(x+3+i*3.6,yy-h*0.5,x+3+i*3.6,yy-h*0.85,1.4,'#3a3a3a');Pp(`M${x+10.5} ${yy-h*0.08} h3.5 v${h*0.45} h-3.5Z`,'#6b6f73','#3a3d40',0.5);return x+14;};
  const pilot=(x,yy)=>{C(x,yy-3.2,2.4,'#5a3e2a','#2d2018',0.5);Pp(`M${x-2.6} ${yy-0.8} q2.6 -2 5.2 0 v2 h-5.2Z`,'#4a3424','#2d2018',0.5);};
  const tailT=(xT,yy,big)=>{const h=big?14:10;Pp(`M${xT+18} ${yy} L${xT+2} ${yy-1.5} L${xT} ${yy+1} L${xT+16} ${yy+1.8}Z`,col,dk,0.7);
    const rd=mk.rud&&marked;Pp(`M${xT+12} ${yy} L${xT+4} ${yy-h} Q${xT-1} ${yy-h} ${xT-1} ${yy-h+4} L${xT} ${yy+1}Z`,rd?'#fff':col,dk,0.7);
    if(rd){const w=(xT+12-(xT-1))/3;mk.rud.forEach((c,i)=>out.push(`<path d="M${xT+12-w*(i)} ${yy} L${xT+12-w*(i+1)} ${yy} L${xT+12-w*(i+1)-2} ${yy-h+3} L${xT+12-w*i-2} ${yy-h+2}Z" fill="${c}" opacity=".95"/>`));}};
  const mark=(x,yy,r)=>{if(!marked)return;if(mk.cross){Pp(`M${x-r} ${yy-r} h${2*r} v${2*r} h-${2*r}Z`,'#fff','none');const a=r*0.3;Pp(`M${x-a} ${yy-r} h${2*a} v${r-a} h${r-a} v${2*a} h-${r-a} v${r-a} h-${2*a} v-${r-a} h-${r-a} v-${2*a} h${r-a}Z`,'#111','none');return;}
    if(mk.star){C(x,yy,r,'#fff','none');out.push(`<path d="${starPath(x,yy,r*0.9)}" fill="#c8102e"/>`);return;}mk.ring.forEach((c,i)=>C(x,yy,r*(1-i*0.33),c,'none'));};
  const gearW=(x,yy,r,top)=>{if(sea)return;if(P.g.rail){Pp(`M${x-28} ${yy} L${x+18} ${yy} Q${x+24} ${yy} ${x+26} ${yy-5}`,'none',wood,2);L(x-10,top,x-14,yy,1,wood);L(x+8,top,x+10,yy,1,wood);return;}
    L(x-4,top,x,yy,1.1,wood);L(x+6,top,x,yy,1.1,wood);wheel(x,yy,r);};
  const floats=(x0,x1,top,fy2)=>{if(!P.g.sea||P.f.boat)return;const yy=fy2||top+24;Pp(`M${x0} ${yy} L${x1-10} ${yy} Q${x1} ${yy} ${x1+4} ${yy-6} L${x0+6} ${yy-6} Q${x0} ${yy-5} ${x0} ${yy}Z`,'#d6d2c4','#5a5a52',0.7);
    L((x0+x1)/2-12,yy-6,(x0+x1)/2-16,top,0.9,metal);L((x0+x1)/2+12,yy-6,(x0+x1)/2+10,top,0.9,metal);};
  if(f==='fp'||f==='fc'){// толкающая «этажерка»: гондола справа, крылья, мотор и винт сзади крыла, хвост на балках
    const wy1=40,wy2=82,x0=112,x1=190,mid=(wy1+wy2)/2;
    if(f==='fc'){Pp(`M244 ${mid-10} L292 ${mid-10} M244 ${mid+6} L292 ${mid+6}`,'none',col,3.4);L(226,mid-4,292,mid-9,0.6);L(226,mid+4,292,mid+5,0.6);}
    else if(y<1913){wingSide(258,300,60,3.4);L(206,mid+8,262,61,0.8,wood);L(206,mid-4,262,59,0.6,wood);}
    wingSide(x0,x1,wy1,4.6);wingSide(x0+4,x1-4,wy2,4.2);for(const sx of [x0+8,x0+38,x1-10])L(sx,wy1+2,sx,wy2,1,wood);L(x0+8,wy1+2,x0+38,wy2,0.35);L(x0+38,wy1+2,x0+8,wy2,0.35);L(x0+38,wy1+2,x1-10,wy2,0.35);
    if(f==='fp'){Pp(`M176 ${wy2-14} L238 ${wy2-17} Q262 ${wy2-15} 266 ${wy2-7} L252 ${wy2-1} L174 ${wy2-1}Z`,col,dk,0.9);pilot(228,wy2-16);if(P.k.seats>1||P.a.obs)pilot(206,wy2-15);
      if(P.a.obs)L(240,wy2-19,262,wy2-29,1.4,'#2b2b2b');}else pilot(196,wy2-4);
    const ex=x0-4,ey=mid+2;if(P.e.cool==='r')C(ex+5,ey,7,metal,'#4a4d50');else Pp(`M${ex-2} ${ey-7} h16 v14 h-16Z`,metal,'#4a4d50',0.6);
    if(f==='fc'){prop(x0+12,wy1+11,15,true);prop(x0+12,wy2-9,15,true);}else prop(ex-5,ey,18,true);
    for(const yy of [wy1+4,wy2-2])L(x0+6,yy,40,mid+(yy<mid?-9:7),0.9,wood);
    if(f==='fc')Pp(`M28 ${mid-17} L38 ${mid-17} L38 ${mid+15} L28 ${mid+15}Z`,col,dk,0.8);
    else{wingSide(14,58,mid-9,2.8);wingSide(16,58,mid+7,2.6);Pp(`M30 ${mid-9} L20 ${mid-30} L13 ${mid-30} L14 ${mid+7}Z`,mk.rud&&marked?'#fff':col,dk,0.8);
      if(mk.rud&&marked)mk.rud.forEach((c,i)=>out.push(`<path d="M${30-i*5.6} ${mid-9} L${24.4-i*5.6} ${mid-9} L${19-i*2.4} ${mid-29} L${21.4-i*2.4} ${mid-29}Z" fill="${c}"/>`));}
    const gb=wy2+24;if(P.g.rail)gearW(160,gb,6,wy2);else if(!sea){L(146,wy2,142,gb-3,1.1,wood);L(184,wy2,188,gb-3,1.1,wood);Pp(`M114 ${gb+3} L238 ${gb+3} Q252 ${gb+3} 256 ${gb-6}`,'none',wood,2);wheel(146,gb,8.5);wheel(184,gb,8.5);}
    floats(124,236,wy2,wy2+24);
    if(marked)mark(204,wy2-8,4.5);}
  else if(f==='fw'){// летающая лодка: корпус с реданом, крылья сверху, моторы между крыльями
    Pp(`M34 86 L60 86 L246 94 Q284 94 296 82 L300 74 Q292 66 246 66 L70 64 L34 74Z`,col,dk,1);Pp(`M60 86 L246 94 Q284 94 296 82 L168 104 L60 92Z`,airShade(col,0.62),dk,0.8);
    L(168,104,168,94,1.2,dk);wingSide(140,214,30,5);wingSide(146,208,58,4.6);for(const sx of [150,202])L(sx,33,sx,58,1.1,wood);L(150,33,202,58,0.35);
    for(let i=0;i<Math.min(2,n);i++){const ex=168-i*4,ey=44;Pp(`M${ex} ${ey-6} h26 v12 h-26Z`,metal,'#4a4d50',0.7);prop(ex+28,ey,17,true);}
    Pp(`M54 66 L36 34 L26 34 L30 70Z`,mk.rud&&marked?'#fff':col,dk,0.8);wingSide(22,64,62,3);
    pilot(252,66);if(P.k.seats>2)for(let i=0;i<4;i++)Pp(`M${216-i*16} 72 h9 v6 h-9Z`,'#b8d0dc','#3a3d40',0.5);
    if(marked)mark(104,80,6);}
  else{// тянущие схемы: фюзеляж, мотор в носу
    const fk=f==='fk',fr=f==='fr',multi=f==='fx',big=multi||fk&&(P.k.seats>4||n>1),noseX=fr?290:big?280:276,tailX=fr?36:big?24:36,fh=fr?20:big?32:26,fy=fr?70:big?60:62;
    const mono=P.m.id==='m3'||P.m.id==='m5'||fr,open=f==='fm'&&!mono,cx=noseX-(big?96:70);
    // фюзеляж: полный (монокок, металл) или открытая ферма сзади (Блерио)
    const top=x=>x>cx?fy-fh*0.5+(x-cx)/(noseX-cx)*fh*0.06:fy-fh*0.5+(cx-x)/(cx-tailX)*(fh*0.5-4),bot=x=>x>cx?fy+fh*0.5:fy+fh*0.5-(cx-x)/(cx-tailX)*(fh*0.5-3);
    if(open){Pp(`M${noseX} ${top(noseX)} L${cx} ${top(cx)} L${cx} ${bot(cx)} L${noseX} ${bot(noseX)}Z`,col,dk,0.9);
      Pp(`M${cx} ${top(cx)} L${tailX+14} ${top(tailX+14)} M${cx} ${bot(cx)} L${tailX+14} ${bot(tailX+14)}`,'none',wood,1.3);for(let i=0;i<=6;i++){const xx=cx-i*((cx-tailX-14)/6);L(xx,top(xx),xx,bot(xx),0.7,wood);if(i<6)L(xx,top(xx),xx-((cx-tailX-14)/6),bot(xx-((cx-tailX-14)/6)),0.35,'#777');}}
    else Pp(`M${noseX} ${top(noseX)} L${cx} ${top(cx)} Q${(cx+tailX)/2} ${top((cx+tailX)/2)-1} ${tailX+8} ${top(tailX+8)} L${tailX+4} ${(top(tailX+4)+bot(tailX+4))/2} L${tailX+8} ${bot(tailX+8)} Q${(cx+tailX)/2} ${bot((cx+tailX)/2)+1} ${cx} ${bot(cx)} L${noseX} ${bot(noseX)}Z`,mono&&P.m.id==='m3'?'#b07a45':col,dk,1);
    if(P.m.id==='m4')for(let i=0;i<12;i++){const xx=noseX-14-i*((noseX-14-tailX-8)/12);L(xx,top(xx)+0.5,xx,bot(xx)-0.5,0.35,'#5a5d61');}
    // хвост: стабилизатор и киль с рулём
    const th=big?36:fr?22:28,ty=top(tailX+10);wingSide(tailX-4,tailX+34,ty+2,3);
    const rd=mk.rud&&marked;Pp(`M${tailX+22} ${ty} L${tailX+6} ${ty-th} Q${tailX-2} ${ty-th-1} ${tailX-4} ${ty-th+6} L${tailX-2} ${bot(tailX+2)-2} L${tailX+6} ${bot(tailX+6)}Z`,rd?'#fff':col,dk,0.9);
    if(rd){const w=6;mk.rud.forEach((c,i)=>out.push(`<path d="M${tailX+6-i*4} ${ty+2} L${tailX+6-(i+1)*4} ${ty+2} L${tailX+3-(i+1)*2.2} ${ty-th+3} L${tailX+3-i*2.2} ${ty-th+2}Z" fill="${c}"/>`));}
    // крылья
    const chord=big?76:fr?44:58,wx1=noseX-(big?40:fr?58:36),wx0=wx1-chord;
    if(f==='fm'||fr){const wy=fr?fy+fh*0.3:fy-fh*0.38;wingSide(wx0,wx1,wy,fr?3:4.2);if(!fr){const kx=(wx0+wx1)/2+10;L(kx,top(kx),kx,top(kx)-14,1.2,wood);L(kx,top(kx)-14,wx0+4,wy,0.4);L(kx,top(kx)-14,wx1-4,wy,0.4);L(kx,bot(kx),wx0+4,wy+1,0.4);L(kx,bot(kx),wx1-4,wy+1,0.4);}}
    else if(fk){const hi=P.m.id!=='m4';wingSide(wx0,wx1+6,hi?top(wx1)-2:bot(wx1)-4,8);if(hi){L(wx0+20,bot(wx0+20),wx0+10,top(wx1),1,metal);}}
    else{const gap=multi?48:f==='ft'?21:36,tw=top(wx1)-(f==='ft'?14:16),rows=f==='ft'?3:2;let yb=tw;
      for(let r=0;r<rows;r++){const yy=tw+r*gap,k=f==='fs'&&r===rows-1?0.56:1;yb=yy;wingSide(wx0+(wx1-wx0)*(1-k)*0.55,wx1-(wx1-wx0)*(1-k)*0.25,yy,multi?5.2:4.2);}
      if(f==='fs'){L(wx0+14,tw+2,(wx0+wx1)/2+4,yb,1.2,wood);L(wx1-10,tw+2,(wx0+wx1)/2+4,yb,1.2,wood);}
      else{L(wx0+10,tw+2,wx0+10,yb,1.2,wood);L(wx1-12,tw+2,wx1-12,yb,1.2,wood);L(wx0+10,tw+2,wx1-12,yb,0.4);L(wx1-12,tw+2,wx0+10,yb,0.4);}
      L(noseX-52,top(noseX-52),noseX-48,tw+2,0.9,wood);L(noseX-30,top(noseX-30),noseX-34,tw+2,0.9,wood);
      if(multi&&n>1){for(let i=0;i<Math.min(2,n-1);i++){const ex=wx1-22-i*12,ey=(tw+yb)/2+4;Pp(`M${ex-14} ${ey-6} h28 v12 h-28Z`,metal,'#4a4d50',0.7);prop(ex+16,ey,15,true);}}}
    // мотор и винт в носу (у многомоторного с чётным числом моторов — нос остеклён)
    const nx=(multi&&n%2===0)?null:engNose(noseX,fy,fh*0.95);if(nx)prop(nx+1.5,fy,fr?22:big?26:24,true);
    if(fk&&n>1){const ex=wx1-16,ey=bot(wx1)+6;Pp(`M${ex-16} ${ey-5} h24 v10 h-24Z`,metal,'#4a4d50',0.7);prop(ex+10,ey,13,true);}
    if(multi&&n%2===0){Pp(`M${noseX} ${top(noseX)} Q${noseX+12} ${fy-fh*0.3} ${noseX+14} ${fy} Q${noseX+12} ${fy+fh*0.3} ${noseX} ${bot(noseX)}Z`,col,dk,0.9);Pp(`M${noseX+2} ${fy-fh*0.3} q8 4 9 12 h-9Z`,'#b8d0dc','#3a3d40',0.5);}
    // кабина: пилот, наблюдатель, пассажирские окна
    const ck=noseX-(big?54:48);
    if(P.k.closed){const nw=P.k.seats>6?6:3;for(let i=0;i<nw;i++)Pp(`M${ck-22-i*15} ${fy-fh*0.25} h9 v${fh*0.3} h-9Z`,'#b8d0dc','#3a3d40',0.5);Pp(`M${ck+12} ${top(ck+12)} l-12 -3 l-3 8 h15Z`,'#b8d0dc','#3a3d40',0.5);}
    else if(!fr){pilot(ck,top(ck)+1);if(P.k.seats>1||P.a.obs)pilot(ck-(big?26:22),top(ck-22)+1);}
    else Pp(`M${cx-10} ${top(cx-10)} q7 -8 16 -1Z`,'#b8d0dc','#3a3d40',0.5);
    // оружие: курсовой пулемёт, турель стрелка, бомбы
    const gy=top(noseX-24)-2;if(P.a.gun>=0.6&&!P.a.obs&&P.a.id!=='w3'){L(noseX-34,gy,noseX-6,gy,1.8,'#2b2b2b');if(P.a.id==='w6')L(noseX-34,gy+2,noseX-8,gy+2,1.3,'#2b2b2b');}
    if(P.a.id==='w3'){const ty2=top(wx1)-18;L(noseX-60,ty2,noseX-30,ty2,1.8,'#2b2b2b');}
    if(P.a.obs){const ox=ck-(big?26:22);L(ox,top(ox)-6,ox-18,top(ox)-13,1.6,'#2b2b2b');if(P.a.id==='w7')L(noseX-34,gy,noseX-8,gy,1.8,'#2b2b2b');}
    if(P.a.bomb>0)for(let i=0;i<Math.min(4,Math.ceil(P.a.bomb/150));i++)Pp(`M${cx-6-i*14} ${bot(cx)+3} h10 q3 2.5 0 5 h-10 q-2.5 -2.5 0 -5Z`,'#3d4034','#222',0.5);
    // шасси
    const gx=noseX-(big?66:52),gb=bot(gx)+(big?24:20);if(!sea)gearW(gx,gb,big?11:9,bot(gx));if(!sea&&!P.g.rail)L(tailX+14,bot(tailX+14),tailX+9,bot(tailX+14)+7,1.2,wood);
    floats(noseX-118,noseX-8,bot(noseX-60),bot(noseX-60)+24);
    mark(cx-(big?40:44),fy+1,big?8:6.5);}
  if(P.f.boat)Pp(`M0 ${ground-6} Q40 ${ground-9} 80 ${ground-6} T160 ${ground-6} T240 ${ground-6} T320 ${ground-6}`,'none','rgba(40,90,120,.35)',1);
  return `<svg viewBox="0 0 320 130" class="airart" role="img" aria-label="${esc(md.name||'')}"><g>${out.join('')}</g></svg>`;}
function starPath(cx,cy,r){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.42:r;d+=(i?'L':'M')+(cx+Math.cos(a)*rr).toFixed(1)+' '+(cy+Math.sin(a)*rr).toFixed(1);}return d+'Z';}
