const run=require('./harness.js');
run(`RACES.filter(r=>/^x/.test(r.id)||r.id.startsWith('board')&&r.y<1923).forEach(r=>console.log(r.key,r.major?'*':' ',r.c,r.t,r.km,r.track||'',r.host,'|',r.name,'|',r.win||''));
console.log(JSON.stringify(RACE_TEAMS.slice(0,3)));console.log(RACE_TEAMS.length, DRIVERS.length);
console.log(JSON.stringify(DRIVERS.slice(0,3)));
console.log(Object.keys(PIONEERS).map(k=>k+':'+PIONEERS[k].drv+':'+PIONEERS[k].c).join(' '));`);
