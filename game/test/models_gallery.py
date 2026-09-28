# Галерея 3D-моделей машин: все облики эпохи в нескольких ракурсах
from playwright.sync_api import sync_playwright
import base64,sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
JS="""(args)=>{const [angs,pitch,ppm]=args;const styles=[['carriage',1897,'b1','wood'],['gp1901',1903,'b1','wood'],['gp1907',1908,'b1','wood'],['gp1912',1913,'b1','wire'],['gp1925',1926,'b1','alloy'],['runabout',1902,'b1','wood'],
  ['sport',1914,'b1','wire'],['tonneau',1903,'b2','wood'],['tourer',1911,'b3','wire'],['sedan',1925,'b5','wire'],['van',1905,'b6','wood'],['truck',1915,'b8','wood']];
  const cellW=260,cellH=210,cv=document.createElement('canvas');cv.width=cellW*angs.length;cv.height=cellH*styles.length;const g=cv.getContext('2d');g.fillStyle='#b9a47a';g.fillRect(0,0,cv.width,cv.height);
  const cols=['#1F4E9C','#C0141C','#F2F2EE','#004225','#1b1d22','#9e2b25'];let t0=performance.now(),n=0;
  styles.forEach(([st,y,b,wh],r)=>{const spec={key:'g'+st,style:st,color:cols[r%cols.length],y,wheel:wh,mech:y<1925,num:r+1,b};const M=carModel(spec);
    angs.forEach((a,cI)=>{const sp=renderModel(M,a,pitch,ppm);n++;const k=Math.min((cellW-10)/sp.img.width,(cellH-24)/sp.img.height,1);const w=sp.img.width*k,h=sp.img.height*k;
      g.drawImage(sp.img,cI*cellW+(cellW-w)/2,r*cellH+cellH-6-h,w,h);});
    g.fillStyle='#000';g.font='13px sans-serif';g.fillText(st+' '+y+' faces '+M.F.length,6,r*cellH+15);});
  return {url:cv.toDataURL('image/png'),ms:(performance.now()-t0)/n};}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    r=pg.evaluate(JS,[[0,0.35,0.9,1.6,2.7],0.45,110])
    open(out+'gallery3d.png','wb').write(base64.b64decode(r['url'].split(',')[1]))
    print('ms per sprite',round(r['ms'],1),errs[:3])
    b.close()
