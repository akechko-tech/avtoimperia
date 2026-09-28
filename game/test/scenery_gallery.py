# Галерея декораций гонки: все деревья, дома, трибуны и зрители на одном листе
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
which=sys.argv[1] if len(sys.argv)>1 else 'all'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1600,'height':1200},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(300)
    t=pg.evaluate("""(which)=>{
      const groups={trees:['plane','poplar','cypress','olive','pine','fir','oak','elm','palm','birch','bush','hedge','vine','hay','rock','cliff'],
        props:['wall','fence','pole','km','sign','lamp','cart','billboard','banner','dune','sea'],
        houses:['house_fr','farm_fr','house_it','fachwerk','cottage','pub','farm_us','barn','izba','villa','cafe','church','pits','stand'],big:['stand','pits'],people:[]};
      const list=which==='all'?[].concat(...Object.values(groups)):groups[which];
      const cv=document.createElement('canvas');cv.width=1600;cv.height=1200;cv.style.cssText='position:fixed;left:0;top:0;z-index:9999';document.body.appendChild(cv);const c=cv.getContext('2d');
      const g=c.createLinearGradient(0,0,0,1200);g.addColorStop(0,'#8fb8da');g.addColorStop(1,'#e8e2cc');c.fillStyle=g;c.fillRect(0,0,1600,1200);
      let x=10,y=10,rowH=0;const t0=performance.now(),times={};
      const put=(sp,label,scale)=>{const w=sp.wM*scale,h=sp.hM*scale;if(x+w>1590){x=10;y+=rowH+22;rowH=0;}
        c.fillStyle='#6f8f45';c.fillRect(x,y+h*sp.ay-2,w,h*(1-sp.ay)+4);c.drawImage(sp.img,x,y,w,h);c.fillStyle='#111';c.font='12px sans-serif';c.fillText(label,x,y+h+14);x+=w+14;rowH=Math.max(rowH,h);};
      list.forEach(k=>{const a=performance.now();const D=SCENERY[k];const sc=which==='houses'?18:which==='big'?40:which==='props'?22:26;
        if(D&&D.m3){put(scenSprite(k,0,1),k+' L',sc);put(scenSprite(k,1,-1),k+' R',sc);}else{put(scenSprite(k,0,1),k,sc);if(['plane','oak','fir','house_fr','bush'].includes(k))put(scenSprite(k,1,1),k+'1',sc);}
        times[k]=Math.round(performance.now()-a);});
      if(which==='all'||which==='people'){['crowd','gend','marsh','photo'].forEach((k,i)=>{[0,1,2,3].forEach(v=>{if(k!=='crowd'&&v>1)return;const a=performance.now();put(peopleSprite(k,v,v%2),k+v,70);times[k+v]=Math.round(performance.now()-a);});});}
      return {total:Math.round(performance.now()-t0),times};}""",which)
    pg.screenshot(path=out+f'scen_{which}.png')
    print(t);print(errs[:5])
    b.close()
