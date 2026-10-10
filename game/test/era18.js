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
// 0.22: гонки → файлы данных (одна трасса может служить нескольким гонкам, Гран-при Франции — по годам)
const ids=[...new Set(RACES.map(r=>realIdOf(r)).filter(Boolean))];
const miss=ids.filter(id=>!window.REAL_TRACKS[id]);
ok(!miss.length,'данные для всех '+ids.length+' трасс по настоящей местности'+(miss.length?' — нет: '+miss.join(', '):''));
const lat=/[A-Za-zÀ-ÿ]/;
for(const id of ids){const D=window.REAL_TRACKS[id];if(!D)continue;
  console.log('== '+id+' — '+D.name+' ('+D.year+')');
  ok(SZ[id+'.js']<=300*1024,'размер '+Math.round(SZ[id+'.js']/1024)+' КБ ≤ 300 КБ');
  const rcs=RACES.filter(r=>realIdOf(r)===id),rc=rcs[0];ok(!!rc,'гонки: '+[...new Set(rcs.map(r=>r.name))].join(', ')+' ('+rcs.map(r=>r.y).join(', ')+')');if(!rc)continue;
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
  if(!D.closed&&!(T.cfg.oval||T.cfg.sprint||['board','brooklands','indy','monaco'].includes(rc.track)))ok((T.seg||[]).length>0,'сценарий по карте: '+T.seg.length+' участков'+(tw.length?', города: '+tw.join(', '):'')+(br.length?', '+br.join(', '):''));
  // уклон дороги — не круче 15% (горные подъёмы и настоящий рельеф; было 10% до точек через 4 м), высоты — из рельефа
  let gmax=0;for(let i=1;i<T.n;i++)gmax=Math.max(gmax,Math.abs(T.pts[i][1]-T.pts[i-1][1])/T.step);ok(gmax<=0.155,'уклон дороги не круче 15% (макс. '+Math.round(gmax*1000)/10+'%)');
  const H=realGridH(D.near);let hmin=1e9,hmax=-1e9;for(const v of H){if(v<hmin)hmin=v;if(v>hmax)hmax=v;}ok(hmax>hmin,'рельеф вокруг: '+Math.round(hmin)+'…'+Math.round(hmax)+' м');
  ok(!D.pal||(D.pal.meadow&&D.pal.meadow.length===3),'цвет земли региона: '+(D.pal?JSON.stringify(D.pal.meadow):'—'));
  ok(/Copernicus/.test(D.src.dem)&&/OpenStreetMap/.test(D.src.osm),'источники записаны: '+D.src.dem+'; '+D.src.osm);
  // приметы для заставки и карта
  const notes=realNotes(T);console.log('   впереди: '+notes.map(q=>q.km+' км — '+q.t).join('; '));
  ok(realMapSVG(T).length>500,'карта для заставки');
  // 0.22: приметы — по-русски, построены к году гонки, стоят в игре
  if(D.lm){const L=D.lm,lt=L.filter(o=>o.n&&lat.test(o.n)),late=L.filter(o=>o.y&&o.y>D.year);
    ok(!late.length,'приметы построены к '+D.year+' году ('+L.length+': '+L.slice(0,5).map(o=>o.n||o.k).join(', ')+')'+(late.length?' — позже: '+late.map(o=>o.n+' '+o.y).join(', '):''));
    ok(lt.length<=Math.max(1,L.length*0.25),'имена примет по-русски'+(lt.length?' (латиницей: '+lt.slice(0,3).map(o=>o.n).join(', ')+')':''));
    const LM=(T.lm||[]).filter(q=>q.t==='rlm');ok(LM.length===0||LM.every(q=>typeof lmMesh==='function'),'приметы на трассе: '+LM.length);}}
// гонка не из эталонов — прежний генератор
// 0.22: по настоящей местности — все гонки; если какая-то осталась без карты — для неё прежний генератор
{const other=RACES.find(r=>!realIdOf(r));if(other){const T=buildTrack(other,30);ok(!T.real,'гонка без карты — прежний генератор ('+other.name+')');}else ok(true,'все гонки — по настоящей местности');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
