// Подбор силы реальных конкурентов: без игрока их продажи должны совпасть с историей.
// Запуск: node test/calib.js [--write]  → src/js/106-calib.js
const fs=require('fs'),path=require('path');
const write=process.argv.includes('--write');
require('./harness.js')(`
const out={k:{},fleet:{}},warn=[],diag=[];
for(const c of Object.keys(COUNTRIES)){
  out.k[c]={people:{},middle:{},lux:{},truck:{}};out.fleet[c]={};
  const s={y:1895,m:0,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:FLEET0[c]},pw:{},rep:50,diff:'normal'};G=s;
  const kap={people:-4,middle:-4,lux:-4,truck:-4};
  for(let y=1895;y<=1930;y++){
    out.fleet[c][y]=Math.round(s.fleet[c]);if(y===1930)break;
    const ya={people:0,middle:0,lux:0,truck:0},yn={people:0,middle:0,lux:0,truck:0},ymax={people:-99,middle:-99,lux:-99,truck:-99};let conv=0,shop=0,sold=0,probe='';
    for(let m=0;m<12;m++){s.y=y;s.m=m;
      const tgt={};SEGK.forEach(g=>tgt[g]=segAnnual(c,g,s)/12*SEASON[m]);
      let R;for(let it=0;it<80;it++){R=mkCountry(c,s,[],null,kap);let err=0;
        for(const g of SEGK){const d=R.segs[g].inc,T=tgt[g];if(T<=1e-6){kap[g]=-14;continue;}const dl=Math.log(T/Math.max(1e-12,d));kap[g]=clamp(kap[g]+dl*0.9,-14,9);if(kap[g]<9)err=Math.max(err,Math.abs(dl));}
        if(err<2e-4)break;}
      SEGK.forEach(g=>{if(kap[g]<9){ya[g]+=kap[g];yn[g]++;}else warn.push(c+' '+y+' '+g+' не хватает покупателей');ymax[g]=Math.max(ymax[g],kap[g]);});
      const cars=tgt.people+tgt.middle+tgt.lux;sold+=cars;shop+=R.shop-R.segs.truck.pool;
      if(m===5){const pr=[];for(const g of ['people','middle','lux']){const P=prefP(g,c,s);const pb={id:'pb',probe:{g,q:QG[g]*1.05,P,fair:P,e:1.3*(30-50)/50}};const R2=mkCountry(c,s,[pb],null,kap,1);pr.push(g[0]+Math.round(R2.by.pb));}const PT=prefP('truck',c,s);const R3=mkCountry(c,s,[{id:'tb',probe:{g:'truck',q:QG.truck*1.05,P:PT,e:-0.52}}],null,kap,1);pr.push('t'+Math.round(R3.by.tb));probe=pr.join(' ');}
      s.fleet[c]+=cars-s.fleet[c]/(12*tabAt(CAR_LIFE,yf(s)));}
    SEGK.forEach(g=>{ya[g]=yn[g]?ya[g]/yn[g]:ymax[g];out.k[c][g][y+0.5]=+ya[g].toFixed(3);});
    diag.push(c+' '+y+' sold '+Math.round(sold)+' shoppers '+Math.round(shop)+' conv '+(sold/shop*100).toFixed(2)+'% k '+SEGK.map(g=>g[0]+ya[g].toFixed(2)).join(' ')+' fleet '+Math.round(s.fleet[c])+' | новичок/мес '+probe);
  }
}
global.__calib={out,warn,diag};
`);
const {out,warn,diag}=global.__calib;
console.log(diag.filter(l=>/ (1895|1896|1897|1900|1903|1905|1908|1910|1913|1916|1920|1923|1925|1927|1929) /.test(l)).join('\n'));
console.log('warnings:',[...new Set(warn)].join('; '));
if(write){
  const ser=o=>JSON.stringify(o).replace(/"(\d{4}(?:\.\d+)?)":/g,'$1:');
  const txt='/* ================= CALIB: сила конкурентов по истории (генерируется test/calib.js) ================= */\n'+
    '// k — насколько реальные марки класса привлекательнее «средней» машины: подобрано так, чтобы без игрока\n// их продажи совпали с историей; fleet — машины на дорогах в таком мире, на 1 января\n'+
    'const CALIB={k:'+ser(out.k)+',\nfleet:'+ser(out.fleet)+'};\n';
  fs.writeFileSync(path.join(__dirname,'../src/js/106-calib.js'),txt);console.log('written',txt.length);
}
