from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1200,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.evaluate("""(()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=900;cv.style.cssText='position:fixed;left:0;top:0;z-index:99;background:#8fb8da';document.body.appendChild(cv);const c=cv.getContext('2d');
     c.fillStyle='#7a9a5a';c.fillRect(0,600,1200,300);
     const styles=['carriage','gp1901','gp1907','gp1912','gp1925','sport','runabout','tonneau','tourer','sedan','van','truck'];
     const cols=['#2b2320','#F2F2EE','#C0141C','#1F4E9C','#1B4F9C','#004225','#9e2b25','#23427a','#1f4a36','#1b1d22','#5c1e2a','#8a6a44'];
     const yrs=[1896,1903,1908,1913,1926,1927,1905,1903,1910,1925,1912,1920];
     styles.forEach((st,i)=>{[-2,0,2].forEach((f,j)=>{const sp=carSprite({key:st+i,style:st,color:cols[i],y:yrs[i],wheel:yrs[i]>=1924&&st==='gp1925'?'alloy':yrs[i]>=1912?'wire':'wood',mech:yrs[i]<1925,num:i+1},f,0);
       const x=20+(i%6)*195+j*62,y=20+Math.floor(i/6)*280;c.drawImage(sp.img,x,y,sp.img.width*0.42,sp.img.height*0.42);});c.fillStyle='#111';c.font='12px sans-serif';c.fillText(st,20+(i%6)*195,30+Math.floor(i/6)*280+110);});
     const sc=['plane','poplar','cypress','olive','pine','fir','oak','elm','palm','birch','farm_fr','house_fr','church','cafe','house_it','fachwerk','cottage','pub','farm_us','barn','billboard','stand','pits','villa','izba','hay','km','sign','pole','cart'];
     sc.forEach((t,i)=>{const sp=scenSprite(t,i%3);if(!sp)return;const s=0.35;const x=10+(i%15)*79,y=720+Math.floor(i/15)*170;c.drawImage(sp.img,x,y-sp.img.height*s,sp.img.width*s,sp.img.height*s);});
     ['crowd','gend','marsh','photo'].forEach((k,i)=>{const sp=peopleSprite(k,i,0);c.drawImage(sp.img,700+i*120,560,sp.img.width*0.7,sp.img.height*0.7);});
    })()""")
    pg.wait_for_timeout(200);pg.screenshot(path=out+'gallery.png');print(errs);b.close()
