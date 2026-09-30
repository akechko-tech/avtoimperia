// ТЗ 0.18, раздел 2: трассы-эталоны по настоящей местности. Проверка: данные есть и не тяжелее 300 КБ, трасса строится по ним,
// на ней нет ничего позже года гонки (автомагистралей, водохранилищ, аэродромов, заводов, железных дорог новее года гонки),
// города ужаты к году гонки, реки и города подписаны по-русски. node test/era18.js
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../../docs/terrain');
const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.js')):[];
const src=files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
const sizes=Object.fromEntries(files.map(f=>[f,fs.statSync(path.join(dir,f)).size]));
require('./harness.js')(`
${src}
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const SZ=${JSON.stringify(sizes)};
const ids=Object.keys(REAL_RACES);
ok(Object.keys(window.REAL_TRACKS).length===ids.length,'данные для всех '+ids.length+' гонок-эталонов: '+Object.keys(window.REAL_TRACKS).join(', '));
const lat=/[A-Za-zÀ-ÿ]/;
for(const id of ids){const D=window.REAL_TRACKS[id];if(!D){ok(false,id+': нет данных');continue;}
  console.log('== '+id+' — '+D.name+' ('+D.year+')');
  ok(SZ[id+'.js']<=300*1024,'размер '+Math.round(SZ[id+'.js']/1024)+' КБ ≤ 300 КБ');
  const rc=RACES.find(r=>r.id===id&&(!REAL_RACES[id].years||REAL_RACES[id].years.includes(r.y)));ok(!!rc,'гонка в календаре: '+(rc?rc.name+' '+rc.y:'нет'));if(!rc)continue;
  // год: данные отмотаны к году первой гонки на этой трассе (или раньше)
  ok(D.era&&D.era.year<=rc.y&&D.year===D.era.year,'отмотка к году: '+(D.era&&D.era.year));
  ok((D.era.rail_years||[]).every(y=>y<=D.year),'железные дороги — построенные к '+D.year+' году'+(D.era.rail_years&&D.era.rail_years.length?' (самая новая — '+Math.max(...D.era.rail_years)+')':''));
  ok(D.era.removed&&'reservoir' in D.era.removed&&'aeroway' in D.era.removed&&'industrial' in D.era.removed,'убрано позднее: водохранилищ '+D.era.removed.reservoir+', аэродромов '+D.era.removed.aeroway+', заводов и торговых зон '+D.era.removed.industrial+', ж/д новее года '+D.era.removed.rail_after_year);
  ok(D.era.pop<1,'города ужаты к году гонки (коэффициент '+D.era.pop+')');
  // подписи на карте и в заставке — по-русски
  const towns=(D.map.towns||[]).map(t=>t.n).filter(Boolean),latin=towns.filter(n=>lat.test(n));
  ok(latin.length<=Math.max(2,towns.length*0.35),'города на карте по-русски: '+towns.slice(0,6).join(', ')+(latin.length?' (латиницей: '+latin.slice(0,4).join(', ')+')':''));
  const rv=(D.bridges||[]).map(b=>b.name).filter(n=>n&&n!=='—');ok(rv.every(n=>!lat.test(n)),'реки под мостами: '+(rv.join(', ')||'—'));
  // трасса игры строится по данным
  const vref=rc.y<1910?28:rc.y<1920?36:44;let T;try{T=buildTrack(rc,vref);}catch(e){console.log(e.stack);}
  ok(T&&T.real&&T.real.d===D,'трасса строится по настоящей карте ('+(T?T.n+' точек, '+Math.round(T.n*T.step/100)/10+' км':'—')+')');if(!T)continue;
  ok(D.closed?T.closed:!T.closed,D.closed?'настоящий овал: круг '+Math.round(T.len)+' м':'кусок настоящей дороги (не выдуманное кольцо)');
  const tw=(T.seg||[]).filter(s=>s.type===RSEG.town&&s.cap).map(s=>s.cap.split(':')[0]);const br=(T.seg||[]).filter(s=>s.type===RSEG.bridge).map(s=>s.cap);
  if(!D.closed)ok((T.seg||[]).length>0,'сценарий по карте: '+T.seg.length+' участков'+(tw.length?', города: '+tw.join(', '):'')+(br.length?', '+br.join(', '):''));
  // уклон дороги — не круче 10% (эпоха), высоты — из рельефа
  let gmax=0;for(let i=1;i<T.n;i++)gmax=Math.max(gmax,Math.abs(T.pts[i][1]-T.pts[i-1][1])/T.step);ok(gmax<=0.105,'уклон дороги не круче 10% (макс. '+Math.round(gmax*1000)/10+'%)');
  const H=realGridH(D.near);let hmin=1e9,hmax=-1e9;for(const v of H){if(v<hmin)hmin=v;if(v>hmax)hmax=v;}ok(hmax>hmin,'рельеф вокруг: '+Math.round(hmin)+'…'+Math.round(hmax)+' м');
  ok(!D.pal||(D.pal.meadow&&D.pal.meadow.length===3),'цвет земли региона: '+(D.pal?JSON.stringify(D.pal.meadow):'—'));
  ok(/Copernicus/.test(D.src.dem)&&/OpenStreetMap/.test(D.src.osm),'источники записаны: '+D.src.dem+'; '+D.src.osm);
  // приметы для заставки и карта
  const notes=realNotes(T);console.log('   впереди: '+notes.map(q=>q.km+' км — '+q.t).join('; '));
  ok(realMapSVG(T).length>500,'карта для заставки');}
// гонка не из эталонов — прежний генератор
const other=RACES.find(r=>r.id==='vanderbilt');if(other){const T=buildTrack(other,30);ok(!T.real,'другие гонки — прежний генератор ('+other.name+')');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
