// Подбор силы реальных конкурентов: без игрока их продажи должны совпасть с историей.
// Запуск: node test/calib.js [--write]  → src/js/106-calib.js
const fs=require('fs'),path=require('path');
const write=process.argv.includes('--write');
require('./harness.js')(`
const out={k:{},fleet:{}},warn=[],diag=[];
for(const c of Object.keys(COUNTRIES)){
  out.k[c]={};ALLSEG.forEach(g=>out.k[c][g]={});out.fleet[c]={};
  const s={y:1895,m:0,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:FLEET0[c]},pw:{},rep:50,diff:'normal'};G=s;
  const kap={};ALLSEG.forEach(g=>kap[g]=-4);
  for(let y=1895;y<=1930;y++){
    out.fleet[c][y]=Math.round(s.fleet[c]);if(y===1930)break;
    const ya={},yn={},ymax={};ALLSEG.forEach(g=>{ya[g]=0;yn[g]=0;ymax[g]=-99;});let conv=0,shop=0,sold=0,probe='';
    for(let m=0;m<12;m++){s.y=y;s.m=m;
      // годовой итог по месяцам — с сезоном и с событиями года (крах в октябре 1929-го, красный флаг, вступление в войну):
      // иначе средняя за год сила конкурентов «съедает» провал последних месяцев и год выходит ниже истории
      const sf=[...Array(12).keys()].reduce((a,mm)=>a+SEASON[mm]*econ(y,mm,c).f,0),fm=SEASON[m]*econ(y,m,c).f*12/sf;
      const tgt={};ALLSEG.forEach(g=>tgt[g]=segAnnual(c,g,s)/12*fm);
      let R;for(let it=0;it<80;it++){R=mkCountry(c,s,[],null,kap);let err=0;
        for(const g of ALLSEG){const d=R.segs[g].inc,T=tgt[g];if(T<=1e-6){kap[g]=-14;continue;}const dl=Math.log(T/Math.max(1e-12,d));kap[g]=clamp(kap[g]+dl*0.9,-14,9);if(kap[g]<9)err=Math.max(err,Math.abs(dl));}
        if(err<2e-4)break;}
      ALLSEG.forEach(g=>{if(kap[g]<9){ya[g]+=kap[g];yn[g]++;}else warn.push(c+' '+y+' '+g+' не хватает покупателей');ymax[g]=Math.max(ymax[g],kap[g]);});
      const cars=CARSEG.reduce((a,g)=>a+tgt[g],0);sold+=cars;shop+=R.shop-R.segs.truck.pool;
      if(m===5){const pr=[];for(const g of CARSEG){if(tgt[g]<=1e-6)continue;const P=prefP(g,c,s);const pb={id:'pb',probe:{g,q:QG[g]*1.05,P,fair:P,e:1.3*(30-50)/50}};const R2=mkCountry(c,s,[pb],null,kap,1);pr.push(g[0]+Math.round(R2.by.pb));}const PT=prefP('truck',c,s);const R3=mkCountry(c,s,[{id:'tb',probe:{g:'truck',q:QG.truck*1.05,P:PT,e:-0.52}}],null,kap,1);pr.push('t'+Math.round(R3.by.tb));probe=pr.join(' ');}
      s.fleet[c]+=cars-s.fleet[c]/(12*tabAt(CAR_LIFE,yf(s)));}
    ALLSEG.forEach(g=>{ya[g]=yn[g]?ya[g]/yn[g]:ymax[g];out.k[c][g][y+0.5]=+ya[g].toFixed(3);});
    diag.push(c+' '+y+' sold '+Math.round(sold)+' shoppers '+Math.round(shop)+' conv '+(sold/shop*100).toFixed(2)+'% k '+ALLSEG.map(g=>g[0]+ya[g].toFixed(2)).join(' ')+' fleet '+Math.round(s.fleet[c])+' | новичок/мес '+probe);
  }
  // 0.32: уточнение для мотоциклов. Игра берёт силу класса линейно между серединами лет; где история внутри года резко
  // меняется (первый год рынка, война, послевоенный бум, гиперинфляция), среднее за год даёт ошибку до трети.
  // Подгоняем точки так, чтобы годовые продажи совпали с историей при той же интерполяции, что в игре (±5% — ТЗ мото)
  for(const g of MOTOSEG){const tb=out.k[c][g],ys=Object.keys(tb).map(Number).sort((a,b)=>a-b),first=ys.find(y=>tb[y]>-13.9);
    // до появления рынка — та же сила, что в первый год (соперников всё равно нет: класс открывается с историей)
    if(first!=null)ys.forEach(y=>{if(y<first)tb[y]=tb[first];});}
  const CK=CALIB.k[c];CALIB.k[c]=out.k[c];let err=0;
  for(let pass=0;pass<14;pass++){
    const s={y:1895,m:0,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:FLEET0[c]},pw:{},rep:50,diff:'normal'};G=s;
    const sold={},tgtY={};MOTOSEG.forEach(g=>{sold[g]={};tgtY[g]={};});
    for(let y=1895;y<1930;y++)for(let m=0;m<12;m++){s.y=y;s.m=m;
      const sf=[...Array(12).keys()].reduce((a,mm)=>a+SEASON[mm]*econ(y,mm,c).f,0),fm=SEASON[m]*econ(y,m,c).f*12/sf;
      const R=mkCountry(c,s,[]);MOTOSEG.forEach(g=>{sold[g][y]=(sold[g][y]||0)+R.segs[g].inc;tgtY[g][y]=(tgtY[g][y]||0)+segAnnual(c,g,s)/12*fm;});
      const cars=CARSEG.reduce((a,g)=>a+R.segs[g].inc,0);s.fleet[c]+=cars-s.fleet[c]/(12*tabAt(CAR_LIFE,yf(s)));}
    err=0;MOTOSEG.forEach(g=>{const tb=out.k[c][g];for(let y=1895;y<1930;y++){const T=tgtY[g][y],S=sold[g][y];if(!(T>1)||!(S>1e-9))continue;const d=Math.log(T/S);err=Math.max(err,Math.abs(d));tb[y+0.5]=+clamp(tb[y+0.5]+0.85*d,-14,9).toFixed(3);}});
    if(err<0.004)break;}
  diag.push(c+' мото: уточнение, худшая ошибка года '+(err*100).toFixed(1)+'%');
  CALIB.k[c]=CK;
}
global.__calib={out,warn,diag};
`);
const {out,warn,diag}=global.__calib;
console.log(diag.filter(l=>/ (1895|1896|1897|1900|1903|1905|1908|1910|1913|1916|1920|1923|1925|1927|1929) |мото/.test(l)).join('\n'));
console.log('warnings:',[...new Set(warn)].join('; '));
if(write){
  const ser=o=>JSON.stringify(o).replace(/"(\d{4}(?:\.\d+)?)":/g,'$1:');
  const txt='/* ================= CALIB: сила конкурентов по истории (генерируется test/calib.js) ================= */\n'+
    '// k — насколько реальные марки класса привлекательнее «средней» машины: подобрано так, чтобы без игрока\n// их продажи совпали с историей; fleet — машины на дорогах в таком мире, на 1 января\n'+
    'const CALIB={k:'+ser(out.k)+',\nfleet:'+ser(out.fleet)+'};\n';
  fs.writeFileSync(path.join(__dirname,'../src/js/106-calib.js'),txt);console.log('written',txt.length);
}
