// 0.37: бот-авиатор — герои и свой авиатор играют до 1930 года: без ошибок, фильмы приходят, касса не NaN, фирма жива
// HEROES=bleriot,fokker node game/test/airbots37.js  (по умолчанию — все 11 героев и свой авиатор во Франции и России)
require('./harness.js')(`{
const list=(process.env.HEROES||Object.keys(PIONEERS).filter(k=>PIONEERS[k].air).join(',')+',custom:fr,custom:ru').split(',');let bad=0;
const pick=ev=>{const ch=ev.choices||[['ok','ok']];let k=ch.find(x=>/^air:test:/.test(x[1]));if(k)return k[1];k=ch.find(x=>/^air:prod:/.test(x[1]));if(k)return k[1];
  k=ch.find(x=>/^air:fix:/.test(x[1]));if(k)return k[1];k=ch.find(x=>x[1]==='air:sign'||x[1]==='air:lic'||x[1]==='air:abroad');if(k)return k[1];
  k=ch.find(x=>x[1]==='ru:emig');if(k)return k[1];k=ch.find(x=>/^ru:to:us$/.test(x[1]));if(k)return k[1];
  k=ch.find(x=>/^(saga|ok)$/.test(x[1]));return k?k[1]:ch[ch.length-1][1];};
for(const item of list){const [h,cc]=item.split(':'),c=cc||PIONEERS[h].c;let errs=[];const t0=Date.now();
  Math.random=mulberry32(hashStr('airbots38|'+item));   // 0.38: воспроизводимая партия (боты играют на грани — без зерна итог плавал)
  newAirGame(h,c,'','normal','');airIntroPapers(G);sagaCheck(G);
  const clear=()=>{let g=0;while(G.pending.length&&g++<30){const ev=G.pending[0],key=pick(ev);try{resolve(key);}catch(e){errs.push('resolve '+key+': '+e.message);G.pending.shift();}if(G.pending[0]===ev)G.pending.shift();}};
  clear();let minCash=G.cash,films=0,trials=0,wins=0;
  while(G.y<1930&&!G.over){const A=G.air,t=tNow(G);
    try{if(airDevBusy(G)<airDevSlots(G)&&G.cash>20000*cpi(G)){const roles=['sport','train','recon','fight','bomb','sea','mail','pax'].filter(r=>t>=AIR_ROLES[r].y);for(const r of roles){if(A.models.some(m=>m.role===r&&m.status!=='off'&&airQ(m,t).q>0.9))continue;const d={...airRefMd(r,t),name:'Бот-'+r+'-'+G.y};delete d.ref;
        if(!airDesignErr(G,d).length&&airDevCost(G,d)<G.cash*0.4&&airDesignStart(G,d))break;}}
      const need=A.orders.reduce((a,o)=>a+o.left*airStats(A.models.find(m=>m.id===o.md)||A.models[0],t).W/1000,0)/4+A.models.filter(m=>m.status==='prod').reduce((a,m)=>a+(m.fc||0)*airStats(m,t).W/1000,0);
      if(need>A.cap*0.95&&!A.capB.length){const k=need-A.cap>20&&t>=1915&&G.cash>airCapCost(G,'plant')*1.2?'plant':need-A.cap>3&&t>=1912&&G.cash>airCapCost(G,'shop')*1.2?'shop':G.cash>airCapCost(G,'hangar')*1.5?'hangar':null;if(k&&airCapCan(G,k))airCapStart(G,k);}
      // опытный аэроплан — облетать (без 3D: как «Облетать» в отчёте), готовый — в серию
      A.models.forEach(m=>{if(m.status==='proto'&&!m.flown){try{resolve('air:test:'+m.id);}catch(_){}}});
      // 0.38: конкурс министерства открыт — заявляем лучшую машину назначения, быстрый итог
      airEvList(G).filter(e=>e.dyn&&airEvStatus(G,e)==='open').forEach(e=>{const L=airEvMds(G,e).filter(m=>m.status==='prod'||m.status==='proto');if(!L.length)return;const best=L.slice().sort((a,b)=>airQ(b,t,e.mil.role).q-airQ(a,t,e.mil.role).q)[0],P=airBestPilot(G);if(P)airEvQuick(e.key,best.id,P.id);trials++;if((A.ev[e.key]||{}).place===1)wins++;});}catch(e){errs.push('policy '+G.y+': '+e.message);}
    try{if(!step()){clear();if(!step()){errs.push('застряли '+G.y+'.'+G.m+': '+G.pending.map(e=>e.title).join(' / '));break;}}}catch(e){errs.push('step '+G.y+'.'+G.m+': '+e.message);break;}
    clear();if(!isFinite(G.cash)){errs.push('касса NaN '+G.y);break;}minCash=Math.min(minCash,G.cash);}
  films=((G.saga||{}).seen||[]).length;const L=sagaList(G).length,A=G.air;let place='?';try{place=legacyTable(G).place;}catch(e){errs.push('наследие: '+e.message);}
  const ok=!errs.length&&films===L&&(G.y>=1930||G.over);if(!ok)bad++;
  console.log((ok?'  ok  ':'  FAIL ')+item.padEnd(11)+' '+G.y+(G.over?' (конец игры)':'')+' · касса '+money(G.cash)+' (мин '+money(minCash)+') · продано '+fmtN(A.sold||0)+' · конкурсов '+trials+' (побед '+wins+') · контрактов '+(A.ordN||0)+' · слава '+Math.round(A.fame)+' · фильм '+films+'/'+L+' · место '+place+' · '+((Date.now()-t0)/1000).toFixed(0)+' с'+(errs.length?'\\n      '+errs.slice(0,4).join('\\n      '):''));}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');if(bad)process.exitCode=1;}`);
