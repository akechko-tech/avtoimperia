/* ================= 0.32: МОТОЦИКЛ НА КАРТИНКЕ — ВИД СБОКУ ПО ДЕТАЛЯМ =================
   Рама (велосипедная, Вернера, с пружинной вилкой, колыбель, штампованная), мотор (одноцилиндровый, V-твин, «четвёрка» FN,
   оппозитный, двухтактный), передача (ремень, цепь, кардан), бак по эпохе и коляска (плетёная, с кузовом, двухместная).
   3D-мотоциклы для гонок — в 0.33; здесь — рисунок в карточке модели, конструкторе и на рынке. */
function motoSVG(md,opt={}){
  const e=byId(ENGINES,md.e)||ENGINES.find(x=>x.moto),c=byId(CHASSIS,md.c)||CHASSIS.find(x=>x.moto),g=byId(GEARBOX,md.g)||{id:'mt1'},b=byId(BODIES,md.b)||{id:'mb0',seats:1},w=byId(TYRES,md.w)||{id:'mw1'};
  const paint=md.paint||'#7a2d22',dark='#17181c',metal='#b9bcc2',brass='#c9a24a',rub='#141414';
  const fid=c.id,eid=e.id,late=['mf5','mf6'].includes(fid),cradle=['mf4','mf6'].includes(fid),sprung=!['mf1','mf2'].includes(fid),fender=sprung;
  const R=w.id==='mw3'?21:20,tyre=w.id==='mw1'?2.4:w.id==='mw2'?3.4:4.6,GY=94,wy=GY-R,rx=58,fx=152;
  let s='';
  const wheel=(cx,cy,r)=>{let o=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${rub}" stroke-width="${tyre}"/><circle cx="${cx}" cy="${cy}" r="${r-tyre/2-0.6}" fill="none" stroke="${metal}" stroke-width="0.8"/><g class="spin" style="transform-origin:${cx}px ${cy}px">`;
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;o+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*(r-tyre/2-1)).toFixed(1)}" y2="${(cy+Math.sin(a)*(r-tyre/2-1)).toFixed(1)}" stroke="${metal}" stroke-width="0.45"/>`;}
    return o+`</g><circle cx="${cx}" cy="${cy}" r="2.2" fill="${metal}"/>`;};
  // коляска — за мотоциклом её колесо и рама крепления
  const side=(b.seats||1)>1;
  if(side)s+=`<circle cx="112" cy="${GY-15}" r="15" fill="none" stroke="${rub}" stroke-width="3.2" opacity=".85"/><line x1="96" y1="72" x2="126" y2="78" stroke="${dark}" stroke-width="2"/>`;
  s+=wheel(rx,wy,R)+wheel(fx,wy,R);
  // крылья
  if(fender){const fen=(cx)=>`<path d="M${cx-R-3},${wy+1} A${R+4},${R+4} 0 0 1 ${cx+R+3},${wy-4}" fill="none" stroke="${late?paint:dark}" stroke-width="3"/>`;s+=fen(rx)+fen(fx);}
  // рама
  const head=[140,34],headB=[143,50],seat=[82,38],bb=[99,73];
  if(fid==='mf5')s+=`<path d="M${head[0]-2},${head[1]} L${head[0]+3},${head[1]+2} L${headB[0]},${headB[1]+4} Q118,82 92,80 L66,72 L${rx},${wy-2} L${seat[0]-2},${seat[1]+6} Q100,36 ${head[0]-2},${head[1]}Z" fill="${dark}"/>`;
  else{const tube=(a,b2,wd)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="${dark}" stroke-width="${wd||2.6}" stroke-linecap="round"/>`;
    s+=tube(seat,[head[0],head[1]+2])+tube([seat[0]+1,seat[1]],[rx,wy],2)+tube([rx,wy],cradle?[78,81]:bb,2.2);
    if(cradle){s+=tube([head[0]+1,head[1]+6],[120,82])+tube([120,82],[78,81])+tube(seat,[78,81]);}
    else if(fid==='mf2'){s+=tube([head[0]+1,head[1]+6],[112,78])+tube([112,78],bb)+tube(seat,bb);}
    else s+=tube([head[0]+1,head[1]+6],bb)+tube(seat,bb);}
  // вилка: жёсткая — прямая; пружинная — параллелограмм с пружиной
  s+=`<line x1="${headB[0]}" y1="${headB[1]-14}" x2="${fx}" y2="${wy}" stroke="${dark}" stroke-width="2.4" stroke-linecap="round"/>`;
  if(sprung)s+=`<line x1="${headB[0]-3}" y1="${headB[1]-12}" x2="${fx-4}" y2="${wy-3}" stroke="${dark}" stroke-width="1.6"/><path d="M${headB[0]-1},${headB[1]-8} l3,2 l-3,2 l3,2 l-3,2" fill="none" stroke="${metal}" stroke-width="1.1"/>`;
  // мотор
  const fins=(x,y,wd,n,st)=>{let o='';for(let i=0;i<n;i++)o+=`<line x1="${x-wd/2-1.5}" y1="${y+i*st}" x2="${x+wd/2+1.5}" y2="${y+i*st}" stroke="#56595f" stroke-width="1.1"/>`;return o;};
  const cyl=(x,y,h,wd,ang)=>`<g transform="rotate(${ang||0} ${x} ${y+h})"><rect x="${x-wd/2}" y="${y}" width="${wd}" height="${h}" rx="1.5" fill="#8b8e94"/>${fins(x,y+2,wd,Math.floor(h/3),3)}<rect x="${x-wd/2-1}" y="${y-3}" width="${wd+2}" height="4" rx="1" fill="#6d7076"/></g>`;
  const cx0=eid==='me4'?102:98,cy0=70;
  if(eid==='me5'||eid==='me6'||eid==='me10'){const big=eid==='me10'?1.2:1;s+=cyl(cx0-5,cy0-26*big,24*big,9*big,-24)+cyl(cx0+5,cy0-26*big,24*big,9*big,24);}
  else if(eid==='me4')s+=`<rect x="84" y="56" width="36" height="13" rx="2" fill="#8b8e94"/>${[0,1,2,3].map(i=>`<rect x="${86+i*8.5}" y="50" width="6.5" height="8" rx="1" fill="#6d7076"/>`).join('')}`;
  else if(eid==='me8')s+=`<circle cx="${cx0}" cy="${cy0-6}" r="10" fill="#8b8e94"/>${[...Array(4)].map((_,i)=>`<circle cx="${cx0}" cy="${cy0-6}" r="${9-i*2}" fill="none" stroke="#56595f" stroke-width="0.9"/>`).join('')}<circle cx="${cx0}" cy="${cy0-6}" r="2.5" fill="${dark}"/>`;
  else{const tall=eid==='me9'?30:eid==='me1'?20:24,wd=eid==='me7'||eid==='me11'?9:10;s+=cyl(cx0,cy0-tall,tall,wd,eid==='me1'?-6:-10);if(eid==='me9')s+=`<line x1="${cx0+6}" y1="${cy0-4}" x2="${cx0+2}" y2="${cy0-tall+1}" stroke="${metal}" stroke-width="1.3"/>`;}
  s+=`<ellipse cx="${cx0}" cy="${cy0}" rx="9" ry="7" fill="#7b7e84"/>`;
  // выхлоп
  s+=`<path d="M${cx0+4},${cy0-14} Q${cx0+10},${cy0+6} ${cx0-6},${cy0+10} L${rx+6},${wy+8}" fill="none" stroke="#3a3c40" stroke-width="2.2"/><rect x="${rx-4}" y="${wy+5}" width="16" height="5" rx="2.5" fill="#55585e"/>`;
  // передача: ремень, цепь, кардан; коробка
  if(g.id==='mt1'||g.id==='mt2')s+=`<circle cx="${rx}" cy="${wy}" r="13" fill="none" stroke="#6b4a2a" stroke-width="1.6"/><line x1="${cx0-6}" y1="${cy0-3}" x2="${rx}" y2="${wy-13}" stroke="#7a5631" stroke-width="2"/><line x1="${cx0-6}" y1="${cy0+4}" x2="${rx+2}" y2="${wy+13}" stroke="#7a5631" stroke-width="2"/>`;
  else if(g.id==='mt5')s+=`<rect x="${rx+2}" y="${wy-2}" width="${cx0-rx-10}" height="4" rx="2" fill="${metal}"/>`;
  else s+=`<circle cx="${rx}" cy="${wy}" r="6" fill="none" stroke="${dark}" stroke-width="1.5"/><line x1="${cx0-12}" y1="${cy0-2}" x2="${rx}" y2="${wy-6}" stroke="${dark}" stroke-width="1.2" stroke-dasharray="1.6 1"/><line x1="${cx0-12}" y1="${cy0+5}" x2="${rx}" y2="${wy+6}" stroke="${dark}" stroke-width="1.2" stroke-dasharray="1.6 1"/>`;
  if(g.id==='mt4'||g.id==='mt5')s+=`<rect x="${cx0-20}" y="${cy0-6}" width="11" height="10" rx="2" fill="#6d7076"/>`;
  // бак: до 1920-х — плоский между трубами, позже — «седлом» поверх трубы
  if(late)s+=`<path d="M${seat[0]+8},${seat[1]-2} Q${(seat[0]+head[0])/2},${seat[1]-12} ${head[0]-4},${head[1]-1} L${head[0]-6},${head[1]+8} Q${(seat[0]+head[0])/2},${seat[1]+6} ${seat[0]+8},${seat[1]+6}Z" fill="${paint}" stroke="${dark}" stroke-width="0.8"/><path d="M${(seat[0]+head[0])/2-8},${seat[1]-4} q8,-3 16,0" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"/>`;
  else s+=`<path d="M${seat[0]+6},${seat[1]+1} L${head[0]-6},${head[1]+3} L${head[0]-10},${head[1]+12} L${seat[0]+10},${seat[1]+10}Z" fill="${paint}" stroke="${dark}" stroke-width="0.8"/><line x1="${seat[0]+12}" y1="${seat[1]+5}" x2="${head[0]-12}" y2="${head[1]+7}" stroke="${brass}" stroke-width="0.9"/>`;
  // седло, руль, фара
  s+=`<path d="M${seat[0]-9},${seat[1]-3} Q${seat[0]-2},${seat[1]-9} ${seat[0]+9},${seat[1]-4} L${seat[0]+6},${seat[1]-1} L${seat[0]-7},${seat[1]}Z" fill="#3a2418"/><path d="M${seat[0]-4},${seat[1]} l-2,3 l4,0 l-2,3" fill="none" stroke="${metal}" stroke-width="0.9"/>`;
  s+=`<path d="M${head[0]},${head[1]} L${head[0]-6},${head[1]-8} L${head[0]-16},${head[1]-9}" fill="none" stroke="${dark}" stroke-width="2" stroke-linecap="round"/><rect x="${head[0]-20}" y="${head[1]-11}" width="6" height="3" rx="1.5" fill="#2b1d14"/>`;
  const lampY=head[1]+4,lamp=late||eid==='me8'?`<circle cx="${head[0]+9}" cy="${lampY}" r="5" fill="${dark}"/><circle cx="${head[0]+11}" cy="${lampY}" r="3.6" fill="#e9e4c9"/>`:`<rect x="${head[0]+5}" y="${lampY-4}" width="6" height="7" rx="1" fill="${brass}"/><circle cx="${head[0]+12}" cy="${lampY}" r="2.3" fill="#f2e8c2"/>`;s+=lamp;
  // коляска: плетёная корзина, кузов с крылом, двухместная
  if(side){const body=b.id==='mb1'?`<path d="M70,62 Q66,80 84,84 L132,84 Q150,82 152,70 Q150,60 136,60 L82,60 Q72,60 70,62Z" fill="#b8925a" stroke="#7a5a30" stroke-width="1"/>${[...Array(7)].map((_,i)=>`<line x1="${78+i*10}" y1="61" x2="${74+i*10}" y2="84" stroke="#8c6a3c" stroke-width="0.7"/>`).join('')}${[0,1].map(i=>`<line x1="70" y1="${68+i*8}" x2="151" y2="${68+i*8}" stroke="#8c6a3c" stroke-width="0.7"/>`).join('')}`
      :`<path d="M66,64 Q62,82 82,86 L136,86 Q156,84 158,70 Q156,58 140,58 L82,58 Q68,58 66,64Z" fill="${paint}" stroke="${dark}" stroke-width="1"/><path d="M72,66 L150,66" stroke="${metal}" stroke-width="0.9"/>${b.id==='mb3'?`<path d="M88,58 v-9 q0,-3 3,-3 h10 q3,0 3,3 v9z M114,58 v-9 q0,-3 3,-3 h10 q3,0 3,3 v9z" fill="#3a2418"/>`:`<path d="M96,58 v-8 q0,-3 3,-3 h12 q3,0 3,3 v8z" fill="#3a2418"/>`}`;
    s+=body+`<path d="M98,${GY-31} A16,16 0 0 1 128,${GY-31}" fill="none" stroke="${b.id==='mb1'?dark:paint}" stroke-width="2.6"/>`;}
  const shadow=`<ellipse cx="${(rx+fx)/2}" cy="${GY+2}" rx="${(fx-rx)/2+30}" ry="3" fill="#000" opacity=".28"/>`;
  return `<svg viewBox="0 0 220 100" class="car moto ${opt.anim?'anim':''}${opt.cls?' '+opt.cls:''}" role="img" aria-label="${esc(md.name||'Мотоцикл')}"${opt.w?` style="max-width:${opt.w}px"`:''}>${shadow}<g class="body">${s}</g></svg>`;}
