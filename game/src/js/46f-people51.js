/* ================= 0.51, тема 10: ЛЮДИ — РАЗНЫЕ ФИГУРЫ, ОДЕЖДА ПО ЭПОХЕ И СТРАНЕ =================
   Отзыв автора (16 ноября): «гонщики и экипажи — не одинаковые „человечки из конструктора“, а разные фигуры, одежда по эпохе и стране,
   лица; зрители разнообразнее».
   Было: у всех мужчин один рост и одна фигура; одежда зрителей — пиджак или пальто трёх эпох, одна на все страны; экипаж —
   четыре цвета пыльника на эпоху, одинаковые для Франции и Америки; жандарм везде французский.
   Стало:
   • фигура — рост, ширина плеч, живот, сутулость стариков (personBuild; у экипажа — crewBuild);
   • лицо — ширина, нос, четыре вида усов и четыре бороды, очки, седина, тон кожи по месту;
   • зрители — по сословиям: господин, горожанин, рабочий, крестьянин, военный, старик; дама, горожанка, крестьянка; мальчик и девочка.
     Доли сословий и сама одежда зависят от страны гонки и года (PPL_MIX, personLook51);
   • страж порядка — свой в каждой стране (policeLook): жандарм, констебль, карабинер, шуцман, городовой…;
   • экипаж — по эпохе, стране и роду машины (crewKit51): пыльник, кожанка, доха, вязаная фуфайка национального цвета, светлый
     комбинезон; шофёр автобуса и такси — в мундире и фуражке, пожарный — в каске, военный — в форме, тракторист — в рубахе и комбинезоне.
   Одежда нарисована по общим приметам времени; точность покроя и формы по источникам не сверялась. */
const PPL_SKIN={eu:['#e6bd9c','#dcae8a','#d4a47c','#e8c4a6','#c8966e','#deb492'],med:['#d4a47c','#c8966e','#c08c62','#dcae8a','#b98460'],
  af:['#b07a50','#9a6840','#c08c62','#a87452'],as:['#dcb48a','#d2a87c','#c89c70'],us:['#e6bd9c','#dcae8a','#d4a47c','#e8c4a6','#c8966e','#deb492','#e2b894','#d8aa84','#8a5a3a']};
const PPL_HAIR=['#2a1f18','#3b2a1e','#5a4028','#1c1714','#6b5a48','#8a6a3a','#a0784a','#4a2e1e'];
function pplSkin(c){return PPL_SKIN[c==='it'||c==='es'||c==='mc'?'med':c==='ly'?'af':c==='cn'?'as':c==='us'?'us':'eu'];}
// Сословия зрителей-мужчин по стране: g — господин, b — горожанин, w — рабочий, p — крестьянин, s — военный, o — старик; loc — местные в халатах
const PPL_MIX={def:{g:.14,b:.34,w:.24,p:.16,s:.04,o:.08},us:{g:.1,b:.42,w:.2,p:.17,s:.03,o:.08},ru:{g:.07,b:.2,w:.2,p:.38,s:.07,o:.08},it:{g:.1,b:.24,w:.2,p:.32,s:.06,o:.08},
  es:{g:.1,b:.24,w:.2,p:.32,s:.06,o:.08},mc:{g:.34,b:.4,w:.1,p:.04,s:.04,o:.08},uk:{g:.18,b:.34,w:.26,p:.1,s:.04,o:.08},ie:{g:.08,b:.26,w:.22,p:.32,s:.04,o:.08},
  ly:{g:.08,b:.08,w:0,p:.02,s:.12,o:.04,loc:.66},cn:{g:.04,b:.04,w:0,p:0,s:.04,o:.02,loc:.86},at:{g:.14,b:.3,w:.2,p:.24,s:.05,o:.07},ch:{g:.14,b:.3,w:.2,p:.24,s:.05,o:.07}};
// Форма военного по стране и году: мундир, штаны, головной убор, околыш, ноги
function soldierLook(c,y){const U=(coat,tr,hat,hatc,band,legs,o)=>Object.assign({top:'tunic',coat,trousers:tr,hat,hatc,band,legs:legs||'boots',belt:'#4a3424',brass:'#c9a24a'},o||{});
  if(c==='fr'||c==='mc'||c==='be')return y<1915?U('#1f2b4a','#8e2a24','kepi','#1f2b4a','#b8322a','puttee',{shin:'#1f2b4a'}):U('#7f96ad','#7f96ad','kepi','#7f96ad','#7f96ad','puttee',{shin:'#7f96ad'});
  if(c==='uk'||c==='ie')return U('#7a6a44','#7a6a44','peak','#7a6a44','#6a5a38','puttee',{shin:'#7a6a44',badge:'#c9a24a'});
  if(c==='de')return y<1910?U('#1f2a44','#2a2a30','pickel','#161616',''):U('#5d6658','#5d6658','peak','#5d6658','#8e2a24');
  if(c==='at')return U('#7d8590','#7d8590','kepi','#7d8590','#7d8590');
  if(c==='it'||c==='ly')return U('#6a7460','#6a7460','tyrol','#6a7460','','puttee',{shin:'#6a7460'});
  if(c==='us')return U('#6f6a44','#6f6a44','campaign','#8a7a52','','puttee',{shin:'#8a7a52'});
  if(c==='ru')return Object.assign(U('#7c7a56','#3a3f4a','peak','#7c7a56','#7c7a56'),{top:'shirt',belt:'#4a3424'});
  return U('#6a6a5a','#6a6a5a','peak','#6a6a5a','#4a4a40');}
// Страж порядка у дороги — свой в каждой стране
function policeLook(c,y){const P=(coat,tr,hat,hatc,o)=>Object.assign({type:'gend',top:'tunic',coat,trousers:tr,hat,hatc,belt:'#161616',brass:'#d8c070',legs:'plain',gloves:'#f1ece0',hands:'back',y},o||{});
  if(c==='uk'||c==='ie')return c==='ie'&&y>=1923?P('#1f2a44','#1f2a44','peak','#1f2a44',{band:'#161a2a',badge:'#c8ccd2'}):P('#1c2238','#1c2238','custodian','#1c2238',{brass:'#c8ccd2'});
  if(c==='it')return P('#1a1c26','#1a1c26','bicorne','#16161a',{stripe:'#b8322a',band:'#b8322a',epaul:'#c8ccd2',sabre:1});
  if(c==='ly')return P('#e8e4d8','#e8e4d8','pith','#e8e2d0',{belt:'#4a3424',gloves:0});
  if(c==='es')return P('#4a5448','#4a5448','bicorne','#16161a',{band:'#c9a24a',belt:'#c9a24a'});
  if(c==='de')return y<1919?P('#1f2a44','#2a2a30','pickel','#161616',{sabre:1}):P('#3f5a4a','#3f5a4a','peak','#3f5a4a',{band:'#2a3a30',legs:'boots'});
  if(c==='at')return P('#2f4a3a','#3a3f4a','peak','#2f4a3a',{band:'#8e2a24'});
  if(c==='ch'||c==='nl')return P('#1f2b4a','#1f2b4a','kepi','#1f2b4a',{band:'#1f2b4a'});
  if(c==='us')return y<1908?P('#1c2238','#1c2238','custodian','#6a6e78',{brass:'#c9a24a'}):P('#1c2238','#1c2238','peak','#1c2238',{band:'#161a2a',badge:'#c9a24a'});
  if(c==='ru')return y<1917?P(y%2?'#e8e4d8':'#1c1c22','#1c1c22','peak','#1c1c22',{band:'#8e2a24',badge:'#c8ccd2',legs:'boots',sabre:1,stache:2}):P('#4a5a6a','#3a3f4a','peak','#4a5a6a',{band:'#8e2a24',legs:'boots'});
  if(c==='cn')return P('#2a2f3a','#2a2f3a','peak','#2a2f3a',{band:'#c9a24a',legs:'puttee',shin:'#e8e4d8'});
  if(c==='be')return P('#1f2b4a','#1f2b4a','kepi','#1f2b4a',{band:'#c9a24a'});
  return P('#1f2b4a',c==='mc'?'#e8e4d8':'#8e2a24','kepi','#1f2b4a',{band:'#b8322a',top:'',legs:'plain',gloves:'#f1ece0',hands:'back'});}
// Фигура: рост, ширина, живот; cls — сословие (у господ и стариков живот чаще)
function personBuild(rnd,type,cls){const g=()=>(rnd()+rnd()+rnd())/3*2-1;   // колокол −1…1
  if(type==='child')return {bh:0.8+rnd()*0.4,bw:0.92+rnd()*0.14,belly:0};
  if(type==='woman')return {bh:clamp(1+g()*0.07,0.92,1.07),bw:clamp(1+g()*0.11+(cls==='P'?0.04:0),0.9,1.14),belly:rnd()<0.2?0.02+rnd()*0.04:0};
  const fat=rnd()<(cls==='g'||cls==='o'?0.5:cls==='b'?0.35:0.18);
  return {bh:clamp(1+g()*0.085,0.9,1.09),bw:clamp(1+g()*0.12+(fat?0.05:0),0.88,1.18),belly:fat?0.03+rnd()*0.07:0};}
function personFace(rnd,o,y,c){const man=o.type==='man'||o.type==='gend'||o.type==='marsh',sk=pplSkin(c),pick=a=>a[Math.floor(rnd()*a.length)];
  o.skin=o.skin||pick(sk);o.hair=pick(PPL_HAIR);o.fw=0.95+rnd()*0.1;o.nose=0.85+rnd()*0.4;
  if(man){const p=y<1915?0.62:0.36;if(o.stache===undefined)o.stache=rnd()<p?pick(y<1915?[1,2,2,3,1]:[1,4,1,2]):0;
    if(o.beard===undefined)o.beard=rnd()<(y<1910?0.16:0.05)?pick([1,2,4,2]):0;if(o.glasses===undefined)o.glasses=rnd()<0.1?(rnd()<0.5?2:1):0;}
  else{o.stache=0;o.beard=0;if(o.type==='woman'&&o.glasses===undefined)o.glasses=rnd()<0.05?1:0;}
  return o;}
// Зритель: сословие по стране и году, одежда, фигура, лицо, поза
function personLook51(rnd,y,kind,c){c=c||'fr';const late=y>=1919,mid=y>=1906&&!late,pick=a=>a[Math.floor(rnd()*a.length)],ch=p=>rnd()<p;
  const fin=(o,cls)=>{o.y=y;Object.assign(o,personBuild(rnd,o.type,cls));personFace(rnd,o,y,c);o.shoe=o.shoe||pick(['#1c1612','#3a2618','#2a2420']);
    if(o.type==='man'&&!o.hands)o.hands=o.item==='cane'||o.item==='binoc'?'down':pick(['down','back','pocket','cross','hips','down','shade','back']);
    if(o.type==='woman'&&!o.hands)o.hands=pick(['down','front','hips','front','shade','down']);
    if(o.type==='child'&&!o.hands)o.hands=pick(['down','hips','shade','down']);
    if(o.top==='robe'&&(o.hands==='pocket'||o.hands==='hips'))o.hands='cross';return o;};
  if(kind==='gend')return fin(policeLook(c,y),'s');
  if(kind==='marsh'){const o={type:'marsh',coat:'#e8e2d0',trousers:'#5a5048',hat:c==='us'?'boater':c==='ru'?'peak':c==='it'||c==='es'||c==='ly'?'straw':'cap',hatc:c==='ru'?'#2a2a30':'#3a3026',item:'flag',flag:ch(0.5)?'#f0c330':'#b8322a',wave:1,hands:'down',armband:'#b8322a'};
    if(c==='uk'||c==='ie')Object.assign(o,{coat:pick(['#6a5e44','#5a5a48']),trousers:'#4a4438'});return fin(o,'b');}
  const force=kind==='worker'?'w':kind==='gent'?'g':kind==='town'?'b':null;   // заводской рабочий, господин, горожанин — без жребия
  const wom=kind==='crowd'&&ch(c==='ly'||c==='cn'?0.14:0.34),kid=!wom&&kind==='crowd'&&ch(0.13),mix=PPL_MIX[c]||PPL_MIX.def,war=y>=1914&&y<=1921?3:1;
  const darks=late?['#3a3f4a','#5a5048','#4a4a44','#2f3a4a','#6a5e4e','#3a3a42','#54483c']:['#2b2f3a','#3a302a','#4a3a2a','#2f3a2f','#3a3a42','#2a2a30','#4a4038'];
  const tweed=['#6a5e44','#7a6a4a','#5a5a48','#6e6450','#4f5a44','#7d6e58'],ties=['#2a2226','#6a2a2a','#2a3a5a','#3a4a2a','#5a3a2a'],shirts=['#f2efe6','#e8e4d8','#dfe6ea','#e6dcc8'];
  if(wom){// дама, горожанка, крестьянка
    const pP=(mix.p||0)+(mix.loc||0)*0.5,r=rnd(),cls=r<(c==='mc'?0.6:0.3)?'L':r<1-pP*1.1?'T':'P',o={type:'woman',shirt:pick(shirts)};
    if(c==='ly'||c==='cn'){if(cls!=='L')return fin(Object.assign(o,{coat:c==='ly'?'#ece6d4':pick(['#3a4a6a','#5a4a5a','#2f3a4a']),skirt:c==='ly'?'#ece6d4':pick(['#2b2f3a','#3a3a42']),hem:0.05,hat:c==='ly'?'kerchief':'',hatc:'#ece6d4',shawl:c==='ly'?'#ece6d4':0}),'P');}
    if(cls==='L'){Object.assign(o,{coat:pick(['#f1ece0','#e8d9c0','#c9d6e0','#e6c9c9','#d8d0e8','#dfe8d6']),skirt:pick(late?['#2b2f3a','#5a3a4a','#3a4a5a','#8a4a3a','#e8e2d0','#b9c4a8','#c9a8b0']:['#2b2f3a','#5a3a4a','#3a4a5a','#6a5a48','#8a4a3a','#e8e2d0']),
        hat:late?'cloche':ch(0.8)?'fhat':'wstraw',hatc:pick(['#e8d9a0','#f1ece0','#3a2a2a','#8a4a5a','#b9c4a8','#5a4a6a']),flower:pick(['#b8322a','#e87aa0','#6a8ad0','#e8c040']),item:ch(late?0.14:0.3)?'umb':ch(0.4)?'hanky':'',umb:pick(['#f1ece0','#e6c9c9','#c9d6e0','#e8e0b0'])});
      if(late&&ch(0.4))Object.assign(o,{wtop:'wcoat',coat:pick(['#5a4a3a','#3a4a5a','#6a3a3a','#8a8272','#4a5a4a']),collar:pick(['#4a3424','#2a2420','#8a7a60']),item:''});
      if(late){o.hem=0.3+rnd()*0.12;o.shin=pick(['#c8b098','#d8c4a8','#3a3a3a']);}
      return fin(o,'L');}
    if(cls==='T'){Object.assign(o,{coat:pick(['#e8e4d8','#d8d0c0','#c9c0b0','#b8c4cc','#d8c8c8']),skirt:pick(['#2b2f3a','#3a3a42','#4a3a3a','#3a4a4a','#5a5048']),hat:ch(0.45)?(late?'cloche':'wstraw'):ch(0.3)?'kerchief':'',hatc:pick(['#3a3a42','#5a4a3a','#e2cf92','#6a3a3a','#e8e4d8']),flower:pick(['#3a4a6a','#6a2a2a','#2a2226']),
        apron:ch(0.3)?pick(['#f1ece0','#e8e4d8','#c9d6e0']):0,shawl:ch(0.25)?pick(['#5a4a3a','#3a3a42','#6a3a3a','#4a5a4a']):0,item:ch(0.2)?'basket':ch(0.3)?'hanky':''});
      if(late)o.hem=0.22+rnd()*0.14;return fin(o,'T');}
    // крестьянка: платок, шаль, передник, длинная юбка и в 1920-е
    const ru=c==='ru',south=c==='it'||c==='es'||c==='mc';Object.assign(o,{coat:ru?pick(['#f1ece0','#e8e0d0','#d8c8b8']):south?pick(['#e8e4d8','#3a3a42','#d8d0c0']):pick(['#e8e4d8','#c9c0b0','#b8a898','#d8d0c0']),
      skirt:ru?pick(['#8e2a24','#3a4a6a','#5a3a2a','#2f4a3a','#6a3a4a']):south?pick(['#1c1c22','#3a2a2a','#2b2f3a','#5a2a2a']):pick(['#3a3a42','#4a3a2a','#3a4a4a','#5a4a3a','#2b2f3a']),hem:0.05+rnd()*0.08,
      hat:ch(0.85)?'kerchief':'',hatc:ru?pick(['#b8322a','#f1ece0','#e8c040','#3a5a8a','#e8e0d0']):south?pick(['#1c1c22','#3a3a42','#e8e4d8']):pick(['#e8e4d8','#f1ece0','#5a4a3a','#3a4a6a']),
      apron:ch(0.6)?pick(ru?['#f1ece0','#e8e0d0','#b8322a']:['#f1ece0','#e8e4d8','#3a4a6a','#5a5048']):0,shawl:ch(0.4)?pick(south?['#1c1c22','#3a2a2a']:['#5a4a3a','#3a3a42','#6a3a3a','#8a7a60']):0,item:ch(0.25)?'basket':''});
    return fin(o,'P');}
  if(kid){const girl=ch(0.42),o={type:'child',girl,shirt:'#f2efe6'};
    if(girl)Object.assign(o,{coat:pick(['#f1ece0','#e6c9c9','#c9d6e0','#e8e0b0','#dfe8d6']),skirt:pick(['#f1ece0','#c9d6e0','#e6c9c9','#3a4a6a','#8a4a3a']),hat:ch(0.35)?'wstraw':ch(0.2)&&(c==='ru'||c==='it')?'kerchief':'bow',hatc:pick(['#e2cf92','#f1ece0','#b8322a']),flower:pick(['#b8322a','#e87aa0','#6a8ad0']),shin:pick(['#f1ece0','#3a3a3a']),item:ch(0.3)?'hanky':''});
    else{const sailor=ch(0.28)&&c!=='ru'&&c!=='ly'&&c!=='cn';Object.assign(o,{coat:sailor?'#f1ece0':pick(['#3a4a6a','#6a3a2a','#5a5a48','#4a4038','#e8e2d0']),top:sailor?'sailor':ch(0.4)?'sweater':c==='ru'&&ch(0.6)?'shirt':'jacket',trim:sailor?'#2a3a6a':pick(['#b8322a','#2a3a6a']),belt:c==='ru'?'#3a2618':undefined,
        trousers:sailor?'#2a3a6a':pick(['#3a3a42','#4a4038','#5a5048']),legs:c==='ru'&&ch(0.5)?'plain':ch(0.75)?'shorts':'plain',sock:pick(['#e8e4d8','#3a3a3a','#5a5048']),hat:sailor&&ch(0.6)?'beret':ch(0.7)?'cap':ch(0.5)?'straw':'',hatc:sailor?'#2a3a6a':pick(['#3a3026','#4a4a44','#5a4a3a']),item:ch(0.25)?'flag':'',flag:pick(['#f0c330','#b8322a','#2a5aa0'])});
      if(o.hat==='straw')o.hatc='#d9c27a';if(!o.hat)o.hair=undefined;}
    return fin(o,'b');}
  // мужчины: сословие
  let r=rnd()*((mix.g+mix.b+mix.w+mix.p+mix.o+(mix.loc||0))+mix.s*war),cls='b';for(const k of ['loc','g','b','w','p','s','o']){const w=(mix[k]||0)*(k==='s'?war:1);if(r<w){cls=k;break;}r-=w;}
  if(force)cls=force;const o={type:'man',shirt:pick(shirts),tie:pick(ties)};let old=cls==='o';if(old)cls=pick(['g','b','p','p','w']);
  if(cls==='loc'){// местные: Триполи — халат и феска или чалма; Китай — длинный халат, шапочка или коническая шляпа
    if(c==='ly')Object.assign(o,{top:'robe',coat:pick(['#ece6d4','#e8e0c8','#d8ceb0','#c9bfa0','#8a6a4a']),hat:pick(['fez','turban','turban','fez']),hatc:undefined,shoe:'#8a6a4a',beard:ch(0.5)?pick([1,3,2]):0,stache:ch(0.6)?1:0,item:ch(0.15)?'cane':''});
    else Object.assign(o,{top:'robe',coat:pick(['#2f3a5a','#3a3a42','#4a4a52','#5a4a3a','#2a3a3a']),hat:pick(['conic','fez','conic','']),hatc:undefined,shoe:'#1c1612',beard:ch(0.2)?2:0,stache:ch(0.3)?4:0});
    if(o.hat==='fez'&&c==='cn')o.hatc='#1c1c22';return fin(o,'p');}
  if(cls==='s'){Object.assign(o,soldierLook(c,y),{type:'man',hands:pick(['back','down','hips','cross']),stache:ch(0.5)?pick([1,2]):0,beard:0,glasses:0});return fin(o,'s');}
  if(cls==='g'){// господин: цилиндр и сюртук, позже — котелок, федора, трость, пенсне
    const sport=(c==='uk'||c==='ie'||c==='us')&&ch(0.3);Object.assign(o,{coat:sport?pick(tweed):pick(['#1e1e24','#2a2a30','#2b2f3a','#3a302a','#24282e']),top:!sport&&ch(late?0.15:mid?0.35:0.55)?'frock':'jacket',
      hat:sport?'cap':late?pick(['fedora','bowler','fedora','boater','top']):mid?pick(['bowler','top','boater','fedora','top']):pick(['top','top','bowler','top','boater']),hatc:'#1e1a18',
      item:ch(0.4)?'cane':ch(0.14)?'binoc':ch(0.3)?'hat':'',glasses:ch(0.22)?2:undefined,cane:pick(['#1c1612','#3a2618','#5a4028'])});
    if(sport)Object.assign(o,{hatc:o.coat,legs:'breeches',shin:pick(['#8a8272','#6a6a5a','#a89a80']),trousers:o.coat});
    if(o.hat==='fedora')o.hatc=pick(['#4a4a44','#5a5048','#3a3a42','#6a5e4e']);if((c==='at'||c==='ch'||c==='de')&&ch(0.2))Object.assign(o,{hat:'tyrol',hatc:'#3f5a3a',coat:pick(['#4a5a48','#5a5a50','#3f4a3a'])});
    if(c==='ru'&&ch(0.4))Object.assign(o,{top:'frock',coat:pick(['#1c1c22','#2a2a30','#24282e']),hat:'peak',hatc:'#1c1c22',band:'#1c1c22',legs:'boots',beard:ch(0.6)?3:undefined,tie:''});
    if(c==='ly'||c==='cn'||((c==='it'||c==='es'||c==='mc')&&ch(0.25)))Object.assign(o,{coat:pick(['#e8e2d0','#d8d0b8','#c9c0a8']),trousers:'#e8e2d0',top:'jacket',hat:c==='ly'||c==='cn'?'pith':'boater',hatc:'#e8e2d0'});}
  else if(cls==='b'){// горожанин: пиджак, котелок, канотье, кепка или федора
    Object.assign(o,{coat:pick(darks.concat(c==='uk'||c==='ie'?tweed:[])),top:ch(0.15)?'frock':ch(0.2)?'vest':'jacket',vestC:pick(['#3a3a42','#5a4a3a','#4a4038','#2f3a2f','#6a5e4e']),watch:ch(0.5),
      hat:c==='us'?pick(late?['fedora','boater','cap','fedora','boater']:['bowler','boater','cap','boater','fedora']):late?pick(['cap','fedora','boater','bowler','fedora','beret']):pick(['bowler','cap','boater','bowler','top','fedora']),
      item:ch(0.32)?'hat':ch(0.08)?'binoc':ch(0.08)?'cane':''});
    if(o.hat==='beret'&&c!=='fr'&&c!=='be'&&c!=='es'&&c!=='mc')o.hat='cap';
    o.hatc=o.hat==='cap'?pick(['#3a3026','#4a4a44','#5a4a3a','#6a5e44']):o.hat==='fedora'?pick(['#4a4a44','#5a5048','#3a3a42','#6a5e4e']):o.hat==='beret'?pick(['#1c1c22','#2a3a5a']):'#1e1a18';
    if(c==='ru'&&ch(0.45))Object.assign(o,{hat:'peak',hatc:pick(['#1c1c22','#2a2a30','#3a3a42']),band:undefined,legs:ch(0.5)?'boots':'plain',top:late&&ch(0.4)?'leather':o.top,coat:late&&o.top==='leather'?'#2a2420':o.coat});
    if(o.top==='leather'){o.coat='#2a2420';o.belt='#1c1612';o.tie='';}
    if((c==='at'||c==='ch')&&ch(0.25))Object.assign(o,{hat:'tyrol',hatc:'#3f5a3a'});}
  else if(cls==='w'){// рабочий: блуза и берет, жилет и кепка, комбинезон, косоворотка
    const cap=()=>pick(['#3a3026','#4a4a44','#5a4a3a','#2a2a30']);o.tie='';
    if(c==='fr'||c==='be'||c==='mc')Object.assign(o,{top:'smock',coat:pick(['#3a5a8a','#44608a','#34507a','#5a6a80']),belt:0,trousers:pick(['#3a4a6a','#4a4038','#5a5048']),hat:late&&ch(0.5)?'beret':'cap',hatc:late?'#1c1c22':cap(),scarfC:'#b8322a'});
    else if(c==='us')Object.assign(o,ch(0.55)?{top:'overall',trousers:pick(['#3f5578','#4a5a78','#5a5a50']),shirt:pick(['#d8d2c2','#b8c4cc','#c8b8a0','#a85a4a']),hat:pick(['cap','straw','fedora']),hatc:cap()}:{top:'vest',vestC:pick(['#3a3a42','#4a4038']),trousers:pick(['#3a3a42','#4a4038','#5a5048']),hat:'cap',hatc:cap()});
    else if(c==='ru')Object.assign(o,late&&ch(0.4)?{top:'leather',coat:'#2a2420',belt:'#1c1612',trousers:'#2a2a30',legs:'boots',hat:'peak',hatc:'#2a2420',band:undefined}:{top:'shirt',coat:pick(['#8e2a24','#3a4a6a','#e8e0d0','#2f4a3a','#3a3a42']),trim:'#e8e0d0',belt:'#3a2618',trousers:pick(['#2a2a30','#3a3a42']),legs:'boots',hat:'peak',hatc:pick(['#1c1c22','#2a2a30','#3a3a42']),band:undefined});
    else if(c==='de'||c==='at'||c==='ch'||c==='nl')Object.assign(o,{top:ch(0.5)?'jacket':'vest',coat:pick(['#3a3f4a','#4a4a44','#3a3a42','#4a5060']),vestC:'#3a3a42',trousers:pick(['#3a3a42','#4a4038']),hat:ch(0.6)?'peak':'cap',hatc:pick(['#2a2f3a','#3a3a42','#1c1c22']),band:undefined});
    else Object.assign(o,{top:ch(0.55)?'vest':'jacket',coat:pick(['#4a4038','#5a5048','#3a3a42','#6a5e4e']),vestC:pick(['#3a3a42','#4a4038','#5a4a3a']),trousers:pick(['#3a3a42','#4a4038','#5a5048','#6a5e4e']),hat:'cap',hatc:cap()});
    if(o.top==='jacket')o.tie=ch(0.3)?pick(ties):'';if(c==='it'||c==='es')o.sash=ch(0.4),o.belt=o.sash?'#8e2a24':undefined;
    o.item=ch(0.3)?'hat':'';o.shoe=pick(['#1c1612','#3a2618']);}
  else{// крестьянин: по стране
    o.tie='';
    if(c==='ru')Object.assign(o,{top:'shirt',coat:pick(['#e8e0d0','#8e2a24','#3a4a6a','#d8c8a8','#5a6a50','#f1ece0']),trim:pick(['#b8322a','#e8e0d0','#3a4a6a']),belt:pick(['#3a2618','#b8322a','#1c1612']),sash:ch(0.4),trousers:pick(['#2a2a30','#3a3a42','#4a4a60']),legs:ch(0.8)?'boots':'puttee',shin:'#c8b890',
      hat:ch(0.8)?'peak':'',hatc:pick(['#1c1c22','#2a2a30','#3a3a42']),band:undefined,beard:ch(0.7)?pick([3,3,1]):0,stache:1});
    else if(c==='us')Object.assign(o,{top:'overall',trousers:pick(['#3f5578','#4a5a78','#5a5a50','#6a6048']),shirt:pick(['#d8d2c2','#b8c4cc','#c8b8a0','#a85a4a','#e8e4d8']),hat:ch(0.7)?'straw':'cap',hatc:undefined});
    else if(c==='uk'||c==='ie')Object.assign(o,{top:ch(0.7)?'jacket':'vest',coat:pick(tweed),vestC:pick(tweed),trousers:pick(tweed),legs:ch(0.6)?'breeches':'plain',shin:pick(['#5a4a3a','#3a3026','#6a6a5a']),hat:'cap',hatc:pick(tweed)});
    else if(c==='at'||c==='ch'||c==='de')Object.assign(o,{top:ch(0.6)?'jacket':'vest',coat:pick(['#4a5a48','#5a5a50','#3f4a3a','#6a6458']),vestC:pick(['#8e2a24','#3f5a3a','#3a3a42']),trousers:pick(['#3a3026','#4a4038','#5a5048']),legs:c==='de'&&ch(0.5)?'boots':'breeches',shin:pick(['#e8e4d8','#8a8272','#5a6a50']),
      hat:c==='de'&&ch(0.5)?'fedora':'tyrol',hatc:pick(['#3f5a3a','#4a4a44','#5a5048']),stache:ch(0.6)?pick([2,3]):0});
    else if(c==='fr'||c==='be'||c==='nl')Object.assign(o,{top:'smock',coat:pick(['#3a5a8a','#44608a','#5a6a80','#34507a']),belt:0,trousers:pick(['#4a4038','#5a5048','#3a4a6a']),hat:ch(0.4)?'straw':late?'beret':'cap',hatc:late?'#1c1c22':'#3a3026'});
    else Object.assign(o,{top:'vest',vestC:pick(['#1c1c22','#3a2a2a','#3a3a42','#5a4a3a']),shirt:pick(['#f2efe6','#e8e4d8','#e6dcc8']),sash:ch(0.6),belt:'#8e2a24',trousers:pick(['#2a2a30','#3a3a42','#4a4038','#5a5048']),hat:ch(0.5)?'straw':'cap',hatc:pick(['#1c1c22','#3a3026','#4a4a44']),stache:ch(0.7)?pick([1,2,3]):0});
    if(o.hat==='straw')o.hatc='#d9c27a';if(!o.sash&&o.belt==='#8e2a24')o.belt=undefined;o.item=ch(0.25)?'hat':'';o.shoe=pick(['#3a2618','#2a1e16','#4a3424']);}
  if(old){o.grey=ch(0.5)?2:1;o.stoop=0.08+rnd()*0.13;o.item='cane';o.cane=pick(['#3a2618','#5a4028','#1c1612']);if(o.beard===undefined&&ch(0.6))o.beard=pick([3,1,4,3]);if(ch(0.3))o.glasses=1;return fin(o,'o');}
  return fin(o,cls);}
/* ---------- экипаж: род машины, одежда, фигура ---------- */
function crewRole(S){if(S.style==='moto')return 'race';let b=null;try{b=S.b?byId(BODIES,S.b):null;}catch(_){}const k=b&&typeof bodyKind==='function'?bodyKind(b):'';
  if(k==='bus'||k==='coach'||k==='school'||k==='taxi')return 'chauffeur';if(k==='fire')return 'fire';if(k==='staff'||k==='mamb'||k==='armored'||k==='ltank')return 'army';
  if(k==='tractor'||k==='crawler')return 'farm';if(k==='amb')return 'medic';if(k==='mail')return 'post';if(b&&b.truck)return 'trucker';return 'race';}
function crewRnd(S,mech,salt){return mulberry32(hashStr('kit|'+(salt||'')+'|'+(S.num|0)+'|'+(S.mq||'')+'|'+(S.cc||'')+(mech?'m':'d')+S.y+(S.drv||'')));}
function crewBuild(S,mech,kit){const r=crewRnd(S,mech,'b'),g=()=>(r()+r()+r())/3*2-1,role=kit&&kit.role||'race',fat=r()<(role==='race'?(mech?0.25:0.14):0.4);
  return {bw:clamp(1+g()*0.11+(fat?0.05:0),0.9,1.17),th:clamp(1+g()*0.055,0.95,1.06),belly:fat?0.02+r()*0.05:0,head:0.97+r()*0.07};}
// Национальный гоночный цвет страны (для фуфайки и шарфа); белый немецкий — тёмно-красная отделка
function crewNat(c){const n=typeof COUNTRIES!=='undefined'&&COUNTRIES[c]&&COUNTRIES[c].race;return n||null;}
function crewKit51(S,mech){const K=crewKit51raw(S,mech);if(K.cap==='straw')K.hat='#d9c27a';return K;}
function crewKit51raw(S,mech){const y=S.y,c=S.cc||'',r=crewRnd(S,mech),pick=a=>a[Math.floor(r()*a.length)],ch=p=>r()<p,role=crewRole(S),nat=crewNat(c);
  const work={fr:'#3a5a8a',be:'#3a5a8a',mc:'#3a5a8a',uk:'#7a6a50',ie:'#7a6a50',it:'#5a6a78',es:'#5a6a78',de:'#6a6e72',at:'#6a6e72',ch:'#6a6e72',us:'#c8c2b0',ru:'#3a3a40'}[c]||'#4a4f5a';
  if(role==='chauffeur'){// шофёр автобуса и такси: мундир и фуражка; до 1908 года — кожаное пальто и очки на фуражке
    const col=pick(c==='us'?['#4a4f58','#2a2f3a','#3a3f4a']:c==='uk'||c==='ie'?['#1c2238','#2a2f3a']:c==='ru'?['#1c1c22','#2a2a30']:['#22262e','#1f2b4a','#2a2a30']);
    if(mech)return {own:1,role,top:'tunic',coat:col,cap:'peak',hat:col,hband:shade(col,-0.3),goggles:false,scarf:0,brass:'#c8ccd2',glove:0};   // кондуктор
    return y<1908?{role,top:'leather',coat:'#2a2420',cap:'peak',hat:'#2a2420',hband:'#1c1612',badge:'#c9a24a',gogUp:true,scarf:0}:{role,top:'tunic',coat:col,cap:'peak',hat:col,hband:shade(col,-0.3),badge:'#c9a24a',goggles:false,scarf:0,brass:'#c9a24a',belt:'#161616',glove:'#3a2a1c'};}
  if(role==='fire')return {own:1,role,top:'tunic',coat:c==='fr'||c==='be'?'#1c2238':c==='ru'?'#3a3f38':'#1f2a44',cap:'brass',hat:'#c9a24a',goggles:false,scarf:0,brass:'#d8c070',belt:'#161616',collar:'#8e2a24',glove:'#3a2a1c'};
  if(role==='army'){const U=soldierLook(c||'fr',y);return {own:1,role,top:'tunic',coat:U.coat,cap:U.hat==='pickel'||U.hat==='tyrol'?'peak':U.hat,hat:U.hatc||U.coat,hband:U.band||shade(U.coat,-0.25),badge:'#c9a24a',goggles:y<1917,gogUp:true,scarf:0,brass:'#c9a24a',belt:'#4a3424',epaul:shade(U.coat,-0.2),glove:'#4a3424'};}
  if(role==='medic')return {own:1,role,top:'tunic',coat:mech?'#e8e6de':'#2a2f3a',cap:'peak',hat:mech?'#e8e6de':'#2a2f3a',hband:'#8e2a24',goggles:false,scarf:0,brass:'#c8ccd2',belt:mech?0:'#161616',glove:0};
  if(role==='post'){const col=c==='de'||c==='at'?'#2a3a5a':c==='us'?'#5a6478':'#1f2b4a';return {own:1,role,top:'tunic',coat:col,cap:c==='fr'||c==='be'||c==='ch'?'kepi':'peak',hat:col,hband:c==='de'||c==='at'?'#e8c040':c==='uk'?'#8e2a24':shade(col,-0.3),goggles:false,scarf:0,brass:'#c9a24a',belt:'#161616',glove:0};}
  if(role==='farm'){// тракторист: рубаха и комбинезон, блуза, косоворотка; соломенная шляпа или кепка; без очков и перчаток
    if(c==='ru')return {own:1,role,top:'coat',coat:pick(['#8e2a24','#e8e0d0','#3a4a6a']),belt:'#3a2618',cap:'peak',hat:'#2a2a30',hband:'#2a2a30',goggles:false,scarf:0,glove:0};
    if(c==='fr'||c==='be')return {own:1,role,top:'coat',coat:'#3a5a8a',belt:0,cap:ch(0.5)?'straw':y>=1919?'beret':'cap',hat:y>=1919?'#1c1c22':'#3a3026',goggles:false,scarf:ch(0.5)?'#b8322a':0,glove:0};
    return {own:1,role,top:'shirt',shirt:pick(['#d8d2c2','#b8c4cc','#c8b8a0','#a85a4a']),coat:'#3f5578',bib:pick(['#3f5578','#4a5a78','#5a5a50']),cap:ch(0.65)?'straw':'cap',hat:'#3a3026',goggles:false,scarf:ch(0.3)?'#b8322a':0,glove:0};}
  if(role==='trucker'){const col=pick(['#5a5048','#4a4038','#3a3f4a','#6a5e4e',work]);
    return {own:1,role,top:ch(0.25)?'leather':'coat',coat:col,belt:0,cap:mech?(c==='fr'&&y>=1919?'beret':'cap'):ch(0.25)&&y>=1910?'peak':'cap',hat:pick(['#3a3026','#4a4a44','#2a2a30']),hband:'#1c1c22',goggles:y<1912,scarf:!mech&&ch(0.35)?pick(['#b8322a','#2e4a78','#e8e2cc']):0,glove:ch(0.5)?0:'#5b3e28'};}
  // гонщик и механик гоночной машины
  if(mech){const wc=y>=1922&&ch(0.5)?pick(['#d8d4c8','#c8c2b0',work]):work;return {own:1,role,top:y<1906?'coat':'overall',coat:wc,belt:shade(wc,-0.3),cap:c==='fr'&&y>=1919&&ch(0.5)?'beret':y>=1908&&ch(0.4)?'helmet':'cap',hat:pick(['#3a3026','#4a3524','#2a2620','#4a4a44']),goggles:true,scarf:0,glove:'#5b3e28'};}
  const scarf=()=>nat&&ch(0.45)&&hex2rgb(nat).reduce((a,b)=>a+b,0)<=620?nat:pick(['#ece6d4','#b8322a','#e8e2cc','#2e4a78','#d9c9a0','#1c1c22']),lh=()=>pick(['#5a3f28','#4a3524','#2a2420','#6a4a2e','#3a3026']);
  const jersey=()=>{const white=!nat||hex2rgb(nat).reduce((a,b)=>a+b,0)>620,col=white?pick(['#e8e4d8','#2a3a5a','#3a3a42','#6a2a2a']):nat;return {role,top:'jersey',coat:col,band:white&&col==='#e8e4d8'?pick(['#8e2a24','#1c2238','#1c1c22']):'#f2efe6',cap:y<1908?'cap':ch(0.75)?'helmet':'cloth',hat:lh(),scarf:ch(0.3)?scarf():0};};
  let K;
  if(y<1906){const v=Math.floor(r()*5);K=v===0?{top:'coat',coat:pick(['#8a7a60','#7d6e58','#6b5a44']),cap:'cap',hat:'#4a4038'}:v===1?{top:'leather',coat:pick(['#2a2622','#3a2c20']),cap:'peak',hat:'#2a2622',hband:'#1c1612',gogUp:true}
      :v===2?{top:'fur',coat:pick(['#5a4632','#6a5a48','#3c3228','#8a7a60']),cap:'cap',hat:'#3a3026'}:v===3?{top:'coat',coat:pick(['#6b6458','#4a4038','#3c3a38']),cap:'helmet',hat:lh()}:{top:'coat',coat:pick(['#d2cbbb','#c8c0a8']),cap:'cap',hat:'#5a4a3a'};}
  else if(y<1915){const v=Math.floor(r()*5);K=v===0?{top:'coat',coat:pick(['#7a6a55','#8a7a60','#6a5e4a']),cap:'helmet',hat:lh()}:v===1?{top:'coat',coat:pick(['#d2cbbb','#dcd6c6']),cap:'cloth',hat:pick(['#e2dccb','#d8d0bc'])}
      :v===2?{top:'leather',coat:pick(['#3a2c20','#2a2420','#4a3828']),cap:'helmet',hat:lh()}:v===3?jersey():{top:'coat',coat:pick(['#4a3f36','#5a5048']),cap:ch(0.5)?'cap':'helmet',hat:lh()};}
  else if(y<1922){const v=Math.floor(r()*5);K=v===0?{top:'coat',coat:pick(['#8a8272','#6a5e4a','#7a7460']),cap:'helmet',hat:lh()}:v===1?{top:'leather',coat:pick(['#2e2a26','#3a3632','#3a2c20']),cap:'helmet',hat:lh()}
      :v===2?{top:'overall',coat:pick(['#cfc8b8','#d8d2c2']),cap:'cloth',hat:'#e2dccb'}:v===3?jersey():{top:'overall',coat:pick(['#8a8272','#9a927e']),cap:'helmet',hat:lh()};}
  else{const v=Math.floor(r()*6),light=c==='fr'?['#e2ded2','#b9c4cc','#d8d4c8']:c==='it'?['#e6e2d8','#c9d0d6']:c==='us'?['#e8e4d8','#d8ceb8']:['#e2ded2','#d8d4c8','#e6e2d8'];
    K=v<2?{top:'overall',coat:pick(light),cap:ch(0.6)?'cloth':'helmet',hat:ch(0.5)?'#e8e4d8':lh()}:v===2?jersey():v===3?{top:'leather',coat:pick(['#3a3a3c','#2a2420','#4a3828']),cap:'helmet',hat:lh()}
      :v===4?{top:'overall',coat:pick(['#7a6e5a','#8a8272','#5a6478']),cap:'helmet',hat:lh()}:jersey();
    if(K.top==='overall'&&(c==='uk'||c==='ie'||ch(0.2)))K.tie=pick(['#2a3a2a','#2a2226','#5a2a2a','#2a3a5a']);if((c==='uk'||c==='ie')&&K.top==='overall'&&ch(0.4))K.cap='cap';}
  if(K.cap==='cloth'&&!K.hat)K.hat='#e2dccb';if(K.scarf===undefined)K.scarf=K.tie?0:ch(0.82)?scarf():0;K.role=role;K.own=1;return K;}
// Лётчик: первые авиаторы — в кепке и пиджаке или фуфайке; с 1912 года — кожаный шлем, кожанка, шарф; военные — кожанка или мундир
function airKit51(S,mil){const y=S.y,c=S.cc||'fr',r=crewRnd(S,false,'air'),pick=a=>a[Math.floor(r()*a.length)],lh=()=>pick(['#5a3f28','#4a3524','#2a2420','#6a4a2e']),sc=()=>pick(['#ece6d4','#e8e2cc','#f2efe6','#b8322a']);
  if(mil){const U=soldierLook(c,y),lea=r()<0.6;return {own:1,role:'air',top:lea?'leather':'tunic',coat:lea?pick(['#3a2c20','#2a2420','#4a3828']):U.coat,cap:'helmet',hat:lh(),scarf:r()<0.7?sc():0,brass:'#c9a24a',belt:'#4a3424',collar:lea?undefined:shade(U.coat,-0.25)};}
  if(y<1912){const top=pick(['coat','jersey','leather','coat']);return {own:1,role:'air',top,coat:top==='leather'?pick(['#3a2c20','#2a2420']):top==='jersey'?pick(['#e8e4d8','#2a3a5a','#6a2a2a','#3a3a42']):pick(['#4a4038','#5a5048','#6a5e4a','#3a3f4a']),band:'#f2efe6',belt:top==='coat'?shade('#4a4038',-0.3):undefined,
    cap:r()<0.7?'cap':'helmet',hat:pick(['#4a4038','#3a3026','#5a3f28']),scarf:r()<0.5?sc():0};}
  if(y<1920)return {own:1,role:'air',top:'leather',coat:pick(['#3a2c20','#2a2420','#4a3828','#5a4630']),cap:'helmet',hat:lh(),scarf:r()<0.8?sc():0};
  const suit=r()<0.45;return {own:1,role:'air',top:suit?'overall':'leather',coat:suit?pick(['#8a7a52','#7a7460','#9a8e6a']):pick(['#3a2c20','#2a2420','#4a3828']),cap:'helmet',hat:lh(),scarf:r()<0.75?sc():0};}
