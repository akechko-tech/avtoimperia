// Детали и оценка покупателей: эталон класса, «лучшие детали», дешёвые решения — сравнение по характеристикам и цене
require('./harness.js')(`
newGame('custom','us','T','normal');
const yrs=${JSON.stringify(process.argv[2]?process.argv[2].split(',').map(Number):[1895,1898,1901,1904,1908,1912,1916,1920,1924,1929])};
const seg=${JSON.stringify(process.argv[3]||'all')};
function mk(o,t){return Object.assign({id:-5,made:0,vol:500,launched:0,status:'prod',price:0,t},o);}
function best(arr,y,key,f){return bestPart(arr,y,key,f);}
function row(label,md){const s=G,cc=classCompare(md,s,s.country),uc=unitCost(md,s),ref=refPrice(md,s);
  return label.padEnd(10)+' S '+cc.S.toFixed(2)+' '+CHAR_K.map(k=>k+':'+cc.by[k].toFixed(2)).join(' ')+' | cost '+Math.round(uc)+' ref$ '+Math.round(ref)+' hp '+Math.round(cc.A.hp)+' kg '+cc.A.kg;}
for(const y of yrs){G.y=y;G.m=5;
  for(const g of ['people','middle','lux','van','truck']){if(seg!=='all'&&seg!==g)continue;
    const t=g==='lux'?'t2':g==='middle'?'t1':'t0',rc=rivalCar(g,y),refMd=mk(rc[2],t);
    const lines=[y+' '+g+' — '+rc[1]+' ('+rc[0]+')',row('эталон',refMd)];
    const truck=g==='van'||g==='truck',bodyF=truck?(x=>x.truck&&(g==='van'?x.id==='b6':x.id!=='b6')):(x=>!x.truck);
    if(!best(BODIES,y,'comf',bodyF))continue;const c=best(CHASSIS,y,'max'),e=best(ENGINES,y,'hp',x=>x.hp<=c.max);
    const top=mk({e:e.id,g:best(GEARBOX,y,'eff').id,c:c.id,k:best(BRAKES,y,'brk').id,b:best(BODIES,y,'comf',bodyF).id,w:best(TYRES,y,'grip').id},t);
    lines.push(row('лучшее',top));
    // дешёвое: самый дешёвый мотор не слабее 60% эталона, самые дешёвые остальные детали
    const refHp=byId(ENGINES,rc[2].e).hp,cheap=(arr,f)=>arr.filter(x=>x.y<=y&&(!f||f(x))).reduce((a,x)=>!a||partCost(x,G)<partCost(a,G)?x:a,null);
    const ce=cheap(ENGINES,x=>x.hp>=refHp*0.6),cc2=cheap(CHASSIS,x=>x.max>=ce.hp);
    const bud=mk({e:ce.id,g:cheap(GEARBOX).id,c:cc2.id,k:cheap(BRAKES).id,b:cheap(BODIES,bodyF).id,w:cheap(TYRES,x=>!x.solid||y<1895).id},t);
    lines.push(row('дешёвое',bud)+' ['+[bud.e,bud.g,bud.c,bud.k,bud.b,bud.w].join(',')+']');
    console.log(lines.join('\\n'));}
}
`);
