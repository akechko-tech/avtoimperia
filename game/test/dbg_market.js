require('./harness.js')(`
const c=process.argv[2]||'fr',y=+(process.argv[3]||1925),fleet=+(process.argv[4]||456000);
const s={y,m:5,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:fleet},pw:{},rep:50,diff:'normal'};G=s;
const inc=incomeOf(c,s),k=affordK(c,s),H=households(c,s),pm=prefP('middle',c,s),u0=appeal(c,s),hold=tabAt(HOLD,yf(s));
console.log(c,y,'mean',inc.mean,'med',Math.round(inc.med),'xT',Math.round(inc.xT),'k',k,'H',H,'u0',u0.toFixed(2),'prices',['people','middle','lux'].map(g=>Math.round(prefP(g,c,s))).join('/'));
let own=fleet;
for(let i=BINS.length-1;i>=0;i--){const n=H*BINS[i].w,o=Math.min(n,own);own-=o;const I=inc.I[i],B=k*I,sh=(HAZ*(n-o)+o/hold*clamp(0.25*B/pm,1,4))/12;
  const u=g=>{const P=prefP(g,c,s);return u0+AQ*Math.log(QG[g])+GB*budget(P/B);};
  console.log('bin',i,'p',BINS[i].p,'I',Math.round(I),'n',Math.round(n),'own',Math.round(o),'shop/m',Math.round(sh),'U p/m/l',['people','middle','lux'].map(g=>u(g).toFixed(2)).join(' '));}
`);
