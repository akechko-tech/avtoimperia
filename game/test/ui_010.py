# 0.10: снимки нового: новая игра, вступление, советник, модели, конструктор, рынок, КБ, заказ, газеты
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/u10_'
diff=sys.argv[1] if len(sys.argv)>1 else 'normal'
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200)
    pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150)
    pg.click(f'[data-act=diff][data-v={diff}]');pg.wait_for_timeout(150)
    pg.fill('#fname','Ласточка');pg.wait_for_timeout(100)
    pg.screenshot(path=out+'newgame.png',full_page=False)
    pg.evaluate("document.getElementById('sheetBody').scrollTop=9999")
    pg.wait_for_timeout(150);pg.screenshot(path=out+'newgame2.png',full_page=False)
    pg.click('[data-act=startgame]');pg.wait_for_timeout(500)
    pg.screenshot(path=out+'intro1.png',full_page=False)
    pg.click('.p-btn');pg.wait_for_timeout(400)
    pg.screenshot(path=out+'intro2.png',full_page=False)
    pg.click('.p-btn');pg.wait_for_timeout(300)
    for i in range(3): pg.evaluate("G.pending=[];doStep();closeSheet();closePaper();G.pending=[];")
    pg.evaluate("render();window.scrollTo(0,0)");pg.wait_for_timeout(200)
    pg.screenshot(path=out+'plant.png',full_page=True)
    pg.click('.tab[data-t=models]');pg.wait_for_timeout(300);pg.screenshot(path=out+'models.png',full_page=True)
    if pg.query_selector('[data-act=rdPick]'):
        pg.click('[data-act=rdPick]');pg.wait_for_timeout(300);pg.screenshot(path=out+'rd.png',full_page=False);pg.click('[data-act=close]')
    pg.click('[data-act=design]');pg.wait_for_timeout(400);pg.screenshot(path=out+'design.png',full_page=False)
    pg.evaluate("document.getElementById('sheetBody').scrollTop=520");pg.wait_for_timeout(150);pg.screenshot(path=out+'design2.png',full_page=False)
    pg.click('[data-act=dsec][data-k=g]');pg.wait_for_timeout(300);pg.screenshot(path=out+'design3.png',full_page=False)
    pg.click('[data-act=dauto]');pg.wait_for_timeout(600);pg.evaluate("document.getElementById('sheetBody').scrollTop=0");pg.wait_for_timeout(150);pg.screenshot(path=out+'design4.png',full_page=False)
    pg.click('[data-act=close]')
    pg.click('.tab[data-t=market]');pg.wait_for_timeout(300);pg.screenshot(path=out+'market.png',full_page=True)
    # 1905: заказ почты и газета о новинке
    pg.evaluate("""()=>{G.y=1905;G.m=2;G.cash=200000;G.pending=[];const md={...rivalDesign('van',1905),id:G.nextId++,name:'Почтовый',paint:'#23427a',plan:'auto',status:'prod',devLeft:0,launched:mi(G),stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};md.price=Math.round(refPrice(md,G)/10)*10;G.models.push(md);
      G.tenderSaid={};const r=Math.random;Math.random=()=>0.001;checkTenders(G);Math.random=r;launchPaper(G,md);render();}""")
    pg.wait_for_timeout(500);pg.screenshot(path=out+'tender.png',full_page=False)
    pg.click('[data-act=choose][data-k=tbid0]');pg.wait_for_timeout(500)
    pg.screenshot(path=out+'launch.png',full_page=False)
    pg.evaluate("closePaper();G.pending=[];")
    pg.evaluate("G.pending=[];doStep();closeSheet();closePaper();G.pending=[];tab='models';render();window.scrollTo(0,0)");pg.wait_for_timeout(300)
    pg.screenshot(path=out+'orders.png',full_page=False)
    # итоги года
    pg.evaluate("G.pending=[];G.lastRank=5;G.homePrev=400;G.homePrev2=200;(G.comps[G.country]||[]).forEach((o,i)=>{o.prev=300-i*20;});yearReview(G);render();")
    pg.wait_for_timeout(500);pg.screenshot(path=out+'review.png',full_page=False)
    print(errs[:10])
    b.close()
