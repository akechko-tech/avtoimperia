from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1200,'height':760})
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.evaluate("""(()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=760;cv.style.cssText='position:fixed;left:0;top:0;z-index:99;background:#9cc0de';document.body.appendChild(cv);const c=cv.getContext('2d');
     c.fillStyle='#b89a6a';c.fillRect(0,330,1200,50);c.fillRect(0,700,1200,60);
     const L=[['carriage','#2b2320',1896],['gp1901','#F2F2EE',1903],['gp1907','#C0141C',1908],['gp1912','#1F4E9C',1913],['gp1925','#1B4F9C',1926],['sport','#004225',1927],['tourer','#1f4a36',1910],['sedan','#1b1d22',1925]];
     L.forEach((q,i)=>{const f=i%2?0:1;const sp=carSprite({key:'g'+i,style:q[0],color:q[1],y:q[2],wheel:q[2]>=1924&&q[0]==='gp1925'?'alloy':q[2]>=1912?'wire':'wood',mech:q[2]<1925,num:i+3},f,0);
       const x=10+(i%4)*300,y=Math.floor(i/4)*370+30;c.drawImage(sp.img,x,y,sp.img.width,sp.img.height);c.fillStyle='#111';c.font='14px sans-serif';c.fillText(q[0]+' f'+f,x+10,y+20);});
    })()""")
    pg.wait_for_timeout(200);pg.screenshot(path=out+'gallery2.png');b.close()
