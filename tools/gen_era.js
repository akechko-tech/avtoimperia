// Рекорд эпохи (1895–1930) по шести категориям господства — одно число на категорию, из исторических данных игры.
// Пишет game/src/js/16a-era.js; запускать после правок истории марок, гонок, неба или первенств: node tools/gen_era.js
const fs=require('fs'),path=require('path');
const out=path.join(__dirname,'..','game','src','js','16a-era.js');
require(path.join(__dirname,'..','game','test','harness.js'))(`{
  const E=histEraCompute();E.byStart={};for(let y=1896;y<=1950;y++){const B=histEraCompute(y);E.byStart[y]={best:B.best,innovTop:B.innovTop,y0:B.y0,y1:B.y1};}/* 0.60, этап 5: рекорд «за свои годы» для каждого года старта */const txt='/* ================= РЕКОРД ЭПОХИ (генерируется: node tools/gen_era.js) =================\\n   Лучший итог настоящей истории 1895–'+E.y1+' по категориям господства (16-world.js: histEra). Не править руками. */\\nconst HIST_ERA_DATA='+JSON.stringify(E)+';\\n';
  require('fs').writeFileSync(${JSON.stringify(out)},txt);console.log('записано',${JSON.stringify(out)},JSON.stringify(E.best));}`);
