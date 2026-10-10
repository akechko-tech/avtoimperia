/* ================= 0.30: ЧЕТЫРЕ ШИНЫ ПО ОТДЕЛЬНОСТИ =================
   Раньше у машины была одна «шина» на все колёса: стёрлась — стёрлись все, прокол — сразу у всей машины.
   Теперь каждая покрышка живёт своей жизнью:
   • задние (ведущие) стираются от тяги и пробуксовки, передние — от руля и торможения (они блокируются первыми),
     внешние в повороте — сильнее внутренних; трасса, где больше правых поворотов, съедает левые шины;
   • у каждой покрышки своя «партия» — стойкость ±12 %;
   • прокол — у одного колеса (гвоздь из подковы, кремень, битое стекло); иногда камень режет сразу два колеса одной стороны;
     спущенное колесо держит хуже, сильнее тормозит качение и тянет машину в свою сторону;
   • проехав на спущенном колесе несколько сотен метров, покрышка разлетается — машина идёт на ободе: искры на булыжнике,
     щебне и асфальте, дым резины, комья земли на грунте; обод бьёт спицы и ступицу (повреждения);
   • механик меняет только то, что нужно: пробитое колесо — на запасное (их возили одно-два, после 1906 года — на съёмных
     ободах), стёртые — если остановились и есть время; в боксах — все изношенные. */
const TW_NM=['переднее левое','переднее правое','заднее левое','заднее правое'];
function twQ(){return 0.88+Math.random()*0.24;}
function twInit(c,y){c.tw=[0,0,0,0];c.tq=[twQ(),twQ(),twQ(),twQ()];c.tp=[0,0,0,0];c.tpd=[0,0,0,0];c.tpL=[400,400,400,400];c.spare0=c.spares=y<1906?1:2;c.punctW=-1;twSync(c);}
function twSync(c){const w=c.tw,p=c.tp;c.tyre=Math.max(w[0],w[1],w[2],w[3]);c.punct=!!(p[0]||p[1]||p[2]||p[3]);}
// сцепление колеса: стёртость по фазам (tyreGripK); спущенное — 0,6, на ободе — 0,4
function twK(c,k){return tyreGripK(c.tw[k]/100)*(c.tp[k]===2?0.4:c.tp[k]===1?0.6:1);}
function twAxle(c,a,b){return (twK(c,a)+twK(c,b))/2;}
function twAll(c){return (twK(c,0)+twK(c,1)+twK(c,2)+twK(c,3))/4;}
// сопротивление качению: спущенное колесо +45 %, обод +80 % (на каждое)
function twCrr(c){let k=1;for(let i=0;i<4;i++)k+=c.tp[i]===2?0.8:c.tp[i]===1?0.45:0;return k;}
// увод: спущенное колесо тормозит свою сторону — машину тянет туда (+ — вправо); переднее тянет сильнее заднего
function twPull(c){let p=0;for(let i=0;i<4;i++){const d=c.tp[i]===2?1:c.tp[i]===1?0.65:0;if(d)p+=(i&1?1:-1)*d*(i<2?1:0.55);}return p;}
function twRimN(c){let n=0;for(let i=0;i<4;i++)if(c.tp[i]===2)n++;return n;}
// износ: inc — «обычный» износ шины за шаг (без пробуксовки и юза); дальше — по колёсам
function twWear(c,inc,use,spin,lock,aLat){if(!(inc>0))return;const lt=clamp(aLat/7,-1,1),base=0.6+use*use+2.5*(use>0.95?use-0.95:0);
  for(let k=0;k<4;k++){if(c.tp[k]===2)continue;const front=k<2,out=(k&1)?-lt:lt;
    const f=(front?base*0.92+lock*2.4:base+spin*2.0+lock*0.6)*(1+0.32*out)*c.tq[k];c.tw[k]+=inc*f;}
  twSync(c);}
// проколы: у каждого колеса свой шанс (задние — чаще: на них вес и гвозди, подброшенные передними)
function twPunctCheck(c,trk,dist){const pr0=c.punctRate*dist*(c.off?2:1)*(c.prog<trk.raceLen*0.06?0:1);
  for(let k=0;k<4;k++){if(c.tp[k])continue;const w=c.tw[k]/100;if(w>=1)twPunct(c,k,trk,'wear');else if(pr0>0&&Math.random()<pr0*(0.25+1.5*Math.min(1,w))*(k<2?0.21:0.29))twPunct(c,k,trk,'nail');}}
function twPunct(c,k,trk,why){if(c.tp[k])return;const was=c.punct;c.tp[k]=1;c.tpd[k]=0;c.tpL[k]=why==='wear'?90+Math.random()*160:why==='hole'?60+Math.random()*240:260+Math.random()*560;
  c.punctN=(c.punctN||0)+1;c.punctW=k;c.punctWhy=why;
  // камень или битое стекло режет сразу два колеса одной стороны
  if(why!=='wear'&&Math.random()<(why==='hole'?0.25:0.1)){const k2=k<2?k+2:k-2;if(!c.tp[k2]){c.tp[k2]=1;c.tpd[k2]=0;c.tpL[k2]=200+Math.random()*500;c.punctN++;}}
  twSync(c);if(!was)c.flat=flatRun(c,trk);c.punctSaid=0;}
// едем на спущенном: покрышка разлетается — на ободе; обод бьёт колесо и подвеску
function twFlatStep(c,dist,dt){for(let k=0;k<4;k++){if(c.tp[k]!==1)continue;c.tpd[k]+=dist;if(c.tpd[k]>c.tpL[k]){c.tp[k]=2;c.rimSaid=0;}}
  const rim=twRimN(c);if(rim&&c.vx>2)c.dmg=Math.min(100,c.dmg+dt*0.5*rim*Math.min(1.5,c.vx/12));}
// что поменять: пробитые — всегда; стёртые — в боксах от 15 %, у обочины от 45 % (у соперников — от 70 %); ничего — самую стёртую
function twPlan(c,pit,ai){const lim=pit?15:ai?70:45,L=[];for(let k=0;k<4;k++)if(c.tp[k]||c.tw[k]>=lim)L.push(k);
  if(!L.length&&c.tyre>20){let b=0;for(let k=1;k<4;k++)if(c.tw[k]>c.tw[b])b=k;L.push(b);}return L;}
// время: первое колесо — полное, каждое следующее — быстрее (домкрат уже стоит); нет запасных — латают камеру (вдвое дольше)
function twTime(c,L,pit){const n=L.length;if(!n)return 0;let t=c.wheelChange*(0.6+0.4*n);
  if(!pit){const need=L.filter(k=>c.tp[k]).length,miss=Math.max(0,need-(c.spares||0));t+=miss*c.wheelChange*1.1;}return t;}
function twFix(c,L,pit){let used=0;L.forEach(k=>{if(c.tp[k])used++;c.tw[k]=0;c.tp[k]=0;c.tpd[k]=0;c.tq[k]=twQ();});
  if(pit)c.spares=c.spare0||2;else c.spares=Math.max(0,(c.spares||0)-used);twSync(c);c.punctSaid=0;}
function twWhat(L){return L.length>=4?'все шины':L.length===1?'колесо ('+TW_NM[L[0]]+')':L.length+' '+plural(L.length,'колесо','колеса','колёс');}
// подпись для игрока: какое колесо пробито
function twPunctTxt(c){const L=[];for(let k=0;k<4;k++)if(c.tp[k])L.push(TW_NM[k]);return L.join(' и ');}
