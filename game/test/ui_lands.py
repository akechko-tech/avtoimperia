# 0.60, этап 6, в браузере: новая игра своим персонажем в Японии, Швеции и Чехословакии — меню, завод, рынок, мир, газета.
# python3 game/test/ui_lands.py [папка для снимков]
from playwright.sync_api import sync_playwright
import os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOT=sys.argv[1] if len(sys.argv)>1 else ''
ok=0;bad=0
def CK(c,m):
    global ok,bad
    if c: ok+=1;print('  ok ',m)
    else: bad+=1;print('  FAIL',m)
NAMES={'jp':'Япония','se':'Швеция','cz':'Чехословакия'}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader'])
    for c in ['se','cz','jp']:
        pg=b.new_page(viewport={'width':412,'height':860},device_scale_factor=1)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}));localStorage.setItem('avt-film','9');localStorage.setItem('avt-tips3d','9')")
        pg.goto('file://'+ROOT+'/docs/index.html');pg.wait_for_timeout(500)
        pg.click('[data-act=newgame]');pg.click('[data-act=ngDir][data-v=car]');pg.click('[data-act=country][data-v=%s]'%c);pg.click('[data-act=pion][data-v=custom]');pg.wait_for_timeout(150)
        m=pg.evaluate("()=>{const h=document.querySelector('.sheet')?document.querySelector('.sheet').innerText:document.body.innerText;return {txt:h,sy:draft.sy,chips:[...document.querySelectorAll('[data-act=syear]')].map(x=>+x.dataset.v),rc:!!document.querySelector('[data-act=rpick][data-v=custom]'),n:document.querySelectorAll('[data-act=country]').length};}")
        y0={'se':1905,'cz':1905,'jp':1910}[c]
        CK(m['n']==9 and m['sy']==y0 and min(m['chips'])==y0 and not m['rc'] and 'undefined' not in m['txt'] and 'NaN' not in m['txt'],'%s: в меню девять стран, старт своего персонажа — с %d года, своего гонщика нет'%(NAMES[c],y0))
        if SHOT: pg.screenshot(path=os.path.join(SHOT,'menu_%s.png'%c),full_page=False)
        pg.click('[data-act=startgame]');pg.wait_for_timeout(1500)
        g=pg.evaluate("()=>({c:G.country,y:G.y,cash:G.cash,body:document.body.innerText.slice(0,4000)})")
        CK(g['c']==c and g['y']==y0 and g['cash']>0 and not errs,'%s: партия началась в %d году без ошибок страницы%s'%(NAMES[c],y0,(' — '+errs[0][:160]) if errs else ''))
        # закрыть газеты первого дня и пройти год
        r=pg.evaluate("""()=>{let e='';try{for(let i=0;i<40&&!G.over&&G.y*12+G.m<(G.y0||1895)*12+14;i++){let g=0;while(G.pending.length&&g++<30){const P=G.pending[0],K=(P.choices||[]).map(x=>x[1]),C=[K.find(x=>/(No|Skip|skip|Ok|ok)$/.test(x)),...K.filter(x=>!/^reel:|Drive|Yes$|saga/.test(x)).reverse(),...K,'ok'].filter(Boolean);
              for(const k of C){resolve(k);if(G.pending[0]!==P)break;}if(G.pending[0]===P)G.pending.shift();}step();}
            try{closePaper();}catch(_){}try{closeSheet();}catch(_){}render();}catch(er){e=er.message+' '+(er.stack||'').split(String.fromCharCode(10))[1];}return {e,y:G.y,m:G.m,sold:G.models[0].totalSold};}""")
        CK(not r['e'] and r['y']>=y0+1,'%s: год с лишним игры в браузере — без ошибок%s'%(NAMES[c],(' — '+r['e'][:200]) if r['e'] else (' — дошли до %d.%d'%(r['y'],r['m']+1) if r['y']<y0+1 else '')))
        # вкладки
        bad_t=[]
        for t in pg.evaluate("()=>[...document.querySelectorAll('[data-tab]')].map(x=>x.dataset.tab)"):
            try:
                pg.evaluate("(t)=>{tab=t;render();}",t);pg.wait_for_timeout(350)
                tx=pg.evaluate("()=>document.body.innerText")
                if 'undefined' in tx or 'NaN' in tx: bad_t.append(t+': '+tx[max(0,tx.find('undefined')-60):tx.find('undefined')+20].replace('\n',' '))
                if SHOT and t in ('plant','market','world','rivals'): pg.screenshot(path=os.path.join(SHOT,'%s_%s.png'%(t,c)))
            except Exception as ex: bad_t.append(t+' '+str(ex)[:120])
        CK(not bad_t and not errs,'%s: все вкладки открываются, в текстах нет «undefined» и «NaN»%s'%(NAMES[c],(' — '+'; '.join(bad_t+errs)[:300]) if (bad_t or errs) else ''))
        # карта мира, соперники, газета
        w=pg.evaluate("""()=>{let e='',h='';try{h=worldMap(G)+worldCard(G);}catch(er){e=er.message;}let p='';try{const P=(G.papers||[]).slice(-1)[0];p=P?JSON.stringify(P).slice(0,3000):'';}catch(er){e+=' '+er.message;}
            let br='';try{br=(COMPS[G.country]||[]).map((cp,i)=>brandHTML(G.country,i,G)).join('');}catch(er){e+=' brand '+er.message;}return {e,jp:/>JP</.test(h),se:/>SE</.test(h),cz:/>CZ</.test(h),bad:/undefined|NaN/.test(h+br),mast:MAST[G.country][0],br:br.length};}""")
        CK(not w['e'] and w['jp'] and w['se'] and w['cz'] and not w['bad'] and w['br']>200,'%s: карта мира с девятью странами и карточки местных марок строятся%s'%(NAMES[c],(' — '+w['e'][:160]) if w['e'] else ''))
        if SHOT:
            try:
                pg.evaluate("()=>{tab='market';render();}");pg.wait_for_timeout(300);pg.screenshot(path=os.path.join(SHOT,'screen_%s.png'%c),full_page=True)
            except Exception as ex: print('  снимок',ex)
        CK(not errs,'%s: ошибок страницы за всё время нет%s'%(NAMES[c],(' — '+' | '.join(errs)[:300]) if errs else ''))
        pg.close()
    b.close()
print(('FAILED %d'%bad) if bad else ('ok %d'%ok))
sys.exit(1 if bad else 0)
