# ТЗ 0.18, разделы 1 и 3: витрина «Империя» (портрет и горизонтально на Fold 7), сцена развязки пари, газета, кабинет трофеев.
# python3 test/shots18.py  → снимки в scratchpad, в конце — высота витрины (должна быть ≤ 25% экрана в портрете)
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
SETUP="""
G.y=1907;G.m=4;G.cash=120000;G.rep=62;
G.models[0].status='prod';G.models[0].totalSold=2400;
const rc=RACES.find(r=>r.y===1907&&r.m>=5&&!GBC_IDS.includes(r.id));
G.chal={type:'race',rk:rc.key,mq:'Fiat',stake:1800,acc:1,x:{k:'bp',mq:'Fiat'}};
G.rivalry={agnelli:{n:'Fiat',w:3,l:1,st:2},peugeot:{n:'Peugeot',w:1,l:2,st:-1}};
trophyAdd(G,{kind:'cup',title:'Победа: Targa Florio',sub:'«'+G.models[0].name+'» · Феличе Надзаро',story:'Пробег по горам Сицилии.',key:'x1',y:1906,m:4,carId:G.models[0].id,prep:2});
trophyAdd(G,{kind:'title',title:'Король гонок 1906',sub:'по версии прессы',key:'x2',y:1906,m:11});
trophyAdd(G,{kind:'charter',title:'Пари с Peugeot',sub:'счёт 1:2',key:'x3',y:1907,m:2});
trophyAdd(G,{kind:'record',title:'Тысячная машина',sub:'продано 1 000 машин',key:'x4',y:1905,m:8});
trophyAdd(G,{kind:'medal',title:'Золотая медаль: Парижский салон',sub:'«'+G.models[0].name+'»',key:'x5',y:1905,m:11,carId:G.models[0].id});
G.legPrev=playerLegacy(G).total-14;G.pending=[];tab='plant';render();window.scrollTo(0,0);
"""
def close_all(pg,n=10):
    for i in range(n):
        pg.evaluate("if(typeof sagaClose==='function'&&document.getElementById('sagaScreen'))try{sagaClose()}catch(e){};const b=document.querySelector('#paperWrap:not([hidden]) [data-act=choose],#paperWrap:not([hidden]) [data-act=paperClose],#sheet:not([hidden]) [data-act=choose]');if(b)b.click();")
        pg.wait_for_timeout(250)
def card_ratio(pg):
    return pg.evaluate("(()=>{const e=document.getElementById('empStrip');if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return {h:Math.round(r.height),vh:innerHeight,pct:Math.round(r.height/innerHeight*1000)/10,w:Math.round(r.width),x:Math.round(r.left)};})()")
res={}
with sync_playwright() as p:
    b=p.chromium.launch()
    # Xiaomi 13T; Fold 7 сложен (внешний экран); Fold 7 разложен горизонтально
    for name,vp in [('port',(393,873)),('foldc',(384,896)),('fold',(1104,828))]:
        pg=b.new_page(viewport={'width':vp[0],'height':vp[1]},device_scale_factor=2)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type=='error' and 'TUNNEL' not in m.text and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
        pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
        pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(500)
        close_all(pg,12)
        pg.evaluate("G.pending=[];SAGAP=null;const s=document.getElementById('sagaScreen');if(s)s.remove();closeSheet();closePaper();tab='plant';render();")
        pg.wait_for_timeout(300);pg.screenshot(path=out+f'u18_{name}_start.png')
        res[name+'_start']=card_ratio(pg)
        pg.evaluate(SETUP);pg.wait_for_timeout(600);pg.screenshot(path=out+f'u18_{name}_card.png')
        res[name+'_card']=card_ratio(pg)
        if name=='port':
            # сцена развязки: победа над Fiat, потом газета
            pg.evaluate("G.chal=null;duelOutcome(G,{type:'race',rk:RACES.find(r=>r.y===1907).key,mq:'Fiat',stake:1800,x:{k:'bp',mq:'Fiat'}},true,{carId:G.models[0].id,prep:2,num:5});render();")
            pg.wait_for_timeout(900);pg.screenshot(path=out+'u18_duel_win.png')
            pg.evaluate("document.querySelector('#sheet [data-act=choose]').click()");pg.wait_for_timeout(1500);pg.screenshot(path=out+'u18_duel_paper.png')
            close_all(pg,4)
            pg.evaluate("G.pending=[];duelOutcome(G,{type:'sales',g:'people',mq:'Peugeot',ci:0,y:1907,stake:2400},false,{you:420,them:610});render();")
            pg.wait_for_timeout(900);pg.screenshot(path=out+'u18_duel_lose.png')
            close_all(pg,4);pg.evaluate("G.pending=[];closeSheet();closePaper();tab='plant';render();window.scrollTo(0,0)");pg.wait_for_timeout(500)
            pg.screenshot(path=out+'u18_port_after.png');res['port_after']=card_ratio(pg)
            pg.evaluate("tab='log';render();");pg.wait_for_timeout(400)
            pg.evaluate("document.querySelector('.trocab').scrollIntoView()");pg.wait_for_timeout(300);pg.screenshot(path=out+'u18_cabinet.png')
            pg.evaluate("trophyReplay(0)");pg.wait_for_timeout(1500);pg.screenshot(path=out+'u18_trophy.png')
        elif name=='fold':
            pg.evaluate("tab='models';render();window.scrollTo(0,0)");pg.wait_for_timeout(500);pg.screenshot(path=out+'u18_fold_models.png')
            pg.evaluate("tab='log';render();window.scrollTo(0,0)");pg.wait_for_timeout(500);pg.screenshot(path=out+'u18_fold_empire.png')
            # тап по значкам — к кабинету трофеев
            pg.evaluate("tab='plant';render();document.querySelector('.ec-badges').click()");pg.wait_for_timeout(500);pg.screenshot(path=out+'u18_fold_badges.png')
            res['fold_sec']=pg.evaluate("(()=>{const e=document.getElementById('sec-trophies');return e?Math.round(e.getBoundingClientRect().top):null;})()")
        res[name+'_errs']=errs[:8]
        pg.close()
    b.close()
print(json.dumps(res,ensure_ascii=False,indent=1))
