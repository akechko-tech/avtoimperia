// Сценарии трасс 0.17: какие участки у гонок (город, село, лес, мост, переезд, серпантин, берег) и сколько времени длится гонка
const run=require('./harness.js');
run(`
const names=['поля','город','село','лес','аллея','мост','переезд','серпантин','берег','виноград'];
const keys=process.argv[2]?process.argv[2].split(','):RACES.filter((r,i)=>i%9===0).map(r=>r.key);
keys.forEach(k=>{const rc=RACES.find(r=>r.key===k);if(!rc)return;const md=aiCarMd(rc.y),v=carStats(md,2,rc.y).vmax,T=buildTrack(rc,v);
  const segs=(T.seg||[]).slice().sort((a,b)=>a.i0-b.i0).map(s=>names[s.type]+'('+Math.round((s.i1-s.i0)*T.step)+'м)');
  const items={};T.spr.forEach(L=>L.forEach(it=>{items[it.t]=(items[it.t]||0)+1;}));
  console.log(k.padEnd(18),rc.t.padEnd(10),'длина',Math.round(T.raceLen)+'м','≈'+Math.round(T.raceLen/(v*0.62))+'с','реки',T.rivers.length,'переезд',T.rails.length,'берег',T.coast.length);
  console.log('   ',segs.join(' · ').slice(0,400));
});
`);
