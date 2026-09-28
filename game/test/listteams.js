const run=require('./harness.js');
run(`RACE_TEAMS.forEach(t=>console.log(t.n.padEnd(22),t.c,t.from,t.to,t.str,t.gap?'gap'+t.gap:'',t.boost?JSON.stringify(t.boost):'',t.endur||'',t.pk||'','|',t.mq.join(', ')));
console.log(JSON.stringify(PIONEERS.ferrari));console.log(Object.keys(PIONEERS.ford));`);
