/* ================= RACE CALENDAR, DRIVERS ================= */
function driverFee(d,s){return Math.round(600*cpi(s)*(1+T(s)*0.08)*(0.4+d.sk*d.sk*1.8)*bn('drvFee')/50)*50;}
function driverSalary(d,s){return Math.round(45*cpi(s)*(1+T(s)*0.05)*(0.4+d.sk*1.4)*bn('drvFee')/5)*5;}
function driverRaceFee(d,s){return Math.round(driverFee(d,s)*0.35/10)*10;}
function driverPayroll(s){return (s.drivers||[]).reduce((a,id)=>{const d=DRIVERS.find(x=>x.id===id);return a+(d?driverSalary(d,s):0);},0);}
function availDrivers(s){const ex=PIONEERS[s.pioneer].drv;return DRIVERS.filter(d=>d.from<=s.y&&d.to>=s.y&&!(s.drivers||[]).includes(d.id)&&d.id!==ex&&!(typeof aiOut==='function'&&aiOut(s,d.id)));}
function raceEligible(r,s){return r.c==='intl'||!COUNTRIES[r.c]||r.c===s.country||dealerCount(s,r.c)>0;}
function raceWarBlocked(r,s){const c=COUNTRIES[r.c]?r.c:'fr';return r.c==='intl'?isWar(s.y,s.m,s.country)&&s.country!=='us':isWar(r.y,r.m,c);}
function raceOpen(r,s){return r.y===s.y&&(s.m===r.m||s.m===r.m-1);}
function racePrize(r){const mul={sprint:0.4,road:1.2,circuit:1,endurance:1.2,hill:0.5,rally:1.1,oval:1.1}[r.t]*(r.c==='intl'?1.3:1)*(r.major?1.6:1);return Math.round(3500*tabAt(CPI,r.y)*(1+(r.y-1895)*0.04)*mul/100)*100;}
function raceFee(r){return Math.round(racePrize(r)*0.08/10)*10;}
