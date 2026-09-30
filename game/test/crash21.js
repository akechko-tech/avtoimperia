// Удары по силе и травмы (0.21): касание — без остановки, удар — заминка, сильный — ремонт, тяжёлый — сход и больница. node test/crash21.js
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};raceResults=()=>{};
newGame('renault','fr','T','normal');G.cash=1e6;let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const rc=RACES.find(r=>r.key==='gpacf-1906');G.y=rc.y;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.t=5;
const me=R.me;const base=JSON.stringify({x:me.x,z:me.z});
function trial(kmh,kind,n){const o={stop:0,dnf:0,inj:0,t:0,limp:0};for(let k=0;k<n;k++){Object.assign(me,{dnf:null,stopT:0,inj:null,mInj:null,limp:false,dmg:0,vx:kmh/3.6,crash:null,fin:null,inWater:0});
    crashNote(me,kmh/3.6,kind);crashResolve(me);if(me.dnf)o.dnf++;else if(me.stopT>0){o.stop++;o.t+=me.stopT;}if(me.inj&&me.inj.sev>=2)o.inj++;if(me.limp)o.limp++;}
  return {stop:o.stop/n,dnf:o.dnf/n,inj:o.inj/n,t:o.stop?o.t/o.stop:0,limp:o.limp/n};}
const rows=[];[15,25,35,50,70,95].forEach(v=>{const r=trial(v,'tree',400);rows.push([v,r]);console.log('  дерево '+v+' км/ч: остановка '+Math.round(r.stop*100)+'% (~'+r.t.toFixed(0)+' с), сход '+Math.round(r.dnf*100)+'%, больница '+Math.round(r.inj*100)+'%, хромает '+Math.round(r.limp*100)+'%');});
const R15=rows[0][1],R35=rows[2][1],R70=rows[4][1],R95=rows[5][1];
ok(R15.stop===0&&R15.dnf===0,'касание на 15 км/ч — без остановки и схода');
ok(R35.stop>0.9&&R35.t<9&&R35.dnf===0,'удар на 35 км/ч — короткая заминка');
ok(R70.dnf>0.3&&R70.inj>0.05,'удар на 70 км/ч — часто сход, бывают травмы');
ok(R95.dnf>0.6&&R95.inj>0.2,'удар на 95 км/ч — почти всегда сход, травмы часты');
ok(R70.t>R35.t*2||R70.stop===0,'сильный удар чинят дольше');
const F=trial(40,'fence',200);ok(F.dnf===0&&F.t<8,'снесённый забор на 40 км/ч — без схода');
const L=trial(50,'fall',300);console.log('  падение: сход '+Math.round(L.dnf*100)+'%, больница '+Math.round(L.inj*100)+'%');ok(L.dnf>0.3,'падение с обрыва — часто сход');
// в детском режиме — ни сходов, ни травм
G.diff='kids';const Kd=trial(95,'tree',200);G.diff='normal';ok(Kd.dnf===0&&Kd.inj===0,'детский режим: без сходов и травм');
// обрыв серпантина без 3D-рельефа
const rc2=RACES.find(r=>r.key==='turbie-1905')||RACES.find(r=>/turbie/.test(r.key));finishRace&&0;R=null;G.y=rc2.y;
startRace({rc:rc2,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const TK=R.trk;let si=-1;for(let i=10;i<TK.n-10;i++)if(TK.segT[i]===RSEG.serp&&Math.abs(TK.K[i])>1/60){si=i;break;}
ok(si>0,"серпантин найден ("+si+")");if(si>0){const bend=TK.K[si]>0?1:-1,c=R.me;c.idx=si;const off=-bend*(TK.W/2+5);const p=TK.pts[si],nn=TK.N[si];c.x=p[0]+nn[0]*off;c.z=p[2]+nn[1]*off;
  const lat=trackLocal(TK,c);ok(dropUnder(c,TK,lat)>0,'у обрыва серпантина — падение');const off2=bend*(TK.W/2+5);c.x=p[0]+nn[0]*off2;c.z=p[2]+nn[1]*off2;ok(dropUnder(c,TK,trackLocal(TK,c))===0,'со стороны скалы — не падаем');}
// травмы переходят в игру: больница, пилот недоступен, соперник пропускает гонки
R=null;const s=G;s.drivers=['nazzaro'];const res=[{you:true,drvId:'me',drv:'Вы',label:'Тест',inj:{sev:2,months:2,retire:false,txt:'перелом руки'}},{you:true,drvId:'nazzaro',drv:'Назарро',label:'Тест',inj:{sev:3,months:6,retire:true,txt:'травма спины'}},
  {you:false,drvId:'szisz',drv:'Сис',name:'Renault',inj:{sev:2,months:3,retire:false,txt:'сломаны рёбра'}},{you:true,drvId:'me',drv:'Вы',label:'Тест',mInj:{sev:2,months:1,txt:'вывих плеча'}}];
const out=injApply(s,rc,res);ok(out.length===4,'травмы записаны: '+out.length);ok(meOut(s),'хозяин в больнице');ok(!s.drivers.includes('nazzaro')&&drvRetired(s,'nazzaro'),'тяжело раненый пилот ушёл из гонок');
ok(aiOut(s,'szisz')&&!availDrivers(s).some(d=>d.id==='szisz'),'раненый соперник недоступен');ok(!!injOf(s,'mech'),'механик в больнице');
const y0=s.y,m0=s.m;s.m+=3;if(s.m>11){s.m-=12;s.y++;}injMonth(s);ok(!meOut(s),'через 3 месяца хозяин выписан');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
