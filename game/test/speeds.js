const run=require('./harness.js');
run(`newGame('custom','fr','T','normal');
console.log(ENGINES.map(e=>e.id+':'+e.y+':'+e.hp+'hp').join(' '));
for(const y of [1895,1900,1903,1906,1910,1914,1920,1925,1929]){G.y=y;const md={e:lastOf(ENGINES,y).id,c:lastOf(CHASSIS,y).id,b:(lastOf(BODIES,y,x=>!x.truck)||BODIES[0]).id,w:lastOf(TYRES,y).id,t:'t0',paint:'#333',name:'x',made:0};
 if(overpower(md))md.e=ENGINES.filter(e=>e.y<=y&&e.hp<=byId(CHASSIS,md.c).max).pop().id;
 const st=carStats(md,2,y),s0=carStats(md,0,y);console.log(y,md.e,md.c,md.w,'prep2',Math.round(st.vmax*3.6)+'km/h',Math.round(st.hp)+'hp',st.kg+'kg','rel',st.rel.toFixed(2),'| prep0',Math.round(s0.vmax*3.6)+'km/h',s0.kg+'kg');}`);
