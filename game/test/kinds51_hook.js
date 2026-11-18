// 0.51: замер спроса на новые виды техники у сложившейся компании. Раз в несколько лет ставит рядом с моделями бота по одной
// пробной модели каждого вида (копия эталона соперника по типичной цене) и печатает спрос в месяц и прибыль — без вмешательства в партию.
//   HOOK="$(cat game/test/kinds51_hook.js)" node game/test/ford51.js helper normal 1
const st0=step;
step=function(){const r=st0.apply(this,arguments);
  if(G.m===5&&[1913,1918,1925,1929].includes(G.y)){const s=G,kinds=['van','truck'].concat(Object.keys(KIND_NEW)).filter(k=>kindOpen(k,s));
    const extra=kinds.map((k,i)=>{const d=rivalDesign(k,s.y);const md={...d,id:7000+i,name:k,made:2000,vol:200,launched:mi(s)-24,status:'prod',price:0,stock:0,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,s)/10)*10;return md;});
    if(s.y>=1918)[['truck','b12'],['truck','b13']].forEach(([k,b],i)=>{if(byId(BODIES,b).y>s.y)return;const d=rivalDesign(k,s.y);const md={...d,b,id:7100+i,name:'truck-'+b,made:2000,vol:200,launched:mi(s)-24,status:'prod',price:0,stock:0,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,s)/10)*10;extra.push(md);});
    const keep=s.models;let out=[];
    extra.forEach(md=>{s.models=keep.concat([md]);let D;try{D=demandAll(s);}catch(e){out.push(md.name+' ERR '+e.message);return;}const q=Object.values(D.by[md.id]||{}).reduce((a,x)=>a+x,0),uc=unitCost({...md,vol:Math.max(5,q)},s),net=md.price*(1-dMargin(s));
      out.push(md.name+' '+q.toFixed(0)+'шт×$'+md.price+' (себест '+Math.round(uc)+', прибыль/мес '+Math.round(q*(net-uc)/1000)+'k)');});
    s.models=keep;const mine=keep.filter(m=>m.status==='prod').map(m=>(isTruck(m)?'груз':isMoto(m)?'мото':'легк')+' '+(m.lastSold||0)+'×$'+m.price).join(', ');
    console.log('  ['+G.y+'] мои: '+mine+' | выручка года '+((G.world.my.r12||0)/1e6).toFixed(1)+'M, прибыль мес '+Math.round((G.last.profit||0)/1000)+'k\n     новые: '+out.join('; '));}
  return r;};
