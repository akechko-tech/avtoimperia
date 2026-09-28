# Проверка: машина игрока повёрнута носом вправо — куда смотрит спрайт?
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=2)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    for d in [0.35,-0.35]:
        pg.evaluate("""d=>{const rc=RACES.find(r=>r.key==='gpacf-1906');G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];
          startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});cancelAnimationFrame(rRaf);R.t=1;
          for(let i=0;i<30;i++){R.me.thr=1;raceTick(1/60);}const T=R.trk,c=R.me;c.yaw=Math.atan2(T.T[c.idx][0],T.T[c.idx][1])+d;R.cam.psi=0;renderRace(0.016);}""",d)
        pg.screenshot(path=out+f'yaw_{"right" if d>0 else "left"}.png',clip={'x':0,'y':380,'width':400,'height':330})
        pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    b.close()
