const run=require('./harness.js');
run(`const by={};RACES.forEach(r=>{(by[r.y]=by[r.y]||[]).push(r.id+(r.major?'*':'')+'['+r.c+'/'+r.t+'/m'+r.m+(r.track?'/'+r.track:'')+']');});
Object.keys(by).forEach(y=>console.log(y, by[y].join(' ')));
console.log('total',RACES.length);`);
