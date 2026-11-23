const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const { IDBFactory } = require('fake-indexeddb');
const path = require('node:path');
const base = path.resolve(__dirname, '..') + path.sep;
const builders = fs.readFileSync(base + 'Builders.js', 'utf8');
const code = fs.readFileSync(base + 'catalog.js', 'utf8');
const indexedDB = new IDBFactory();
const html = `<!DOCTYPE html><html><head></head><body>
<nav><ul class="navbar-nav"><li><a href="home.html">Online</a></li><li><a href="local.html">Locale</a></li></ul></nav><div id="fordice"><button class="dice-button"></button></div>
<input type="search" class="search-input"><span id="#risultati"></span><button id="pin-visible"></button><span id="pinned-count"></span><span id="pin-status"></span><div id="filtri-avanzati-liste"></div><div id="filtri-avanzati-tipo"></div><div id="filtri-avanzati-generi"></div><input id="sort-select">
<main id="catalog-online"></main><main id="catalog-local"></main></body></html>`;
const a = { id: 1, title:'Àlpha', original_title:'Alpha', genre_ids:[28], vote_average:7.5, vote_count:100, release_date:'2020-01-01', overview:'one', media_type:'movie' };
const b = { id: 2, title:'Beta', original_title:'Beta', genre_ids:[35], vote_average:9, vote_count:50, release_date:'1999-04-01', overview:'two', media_type:'movie' };
const c = { id: 3, name:'Gamma', original_name:'Gamma', genre_ids:[10765], vote_average:6, vote_count:80, first_air_date:'2023-02-01', overview:'three', media_type:'tv' };
function fakeResponse(data, status=200) { return { status, ok: status < 400, headers: {get:()=>null}, json: async()=>data }; }
const delay = ms => new Promise(r => setTimeout(r, ms));
async function until(f, message, ms=5000) { for (let i=0;i<ms/20;i++) { if (f()) return; await delay(20); } throw new Error('Timeout: '+message); }
function setup({stored, pinned, fail=false, slow=false}={}) {
    const dom = new JSDOM(html, { url:'https://example.test/home.html', runScripts:'outside-only', pretendToBeVisual:true });
    const w = dom.window; Object.defineProperty(w,'indexedDB',{value:indexedDB}); w.scrollTo = () => {};
    w.HOMECINEMA_TMDB_TOKEN='test'; w.HOMECINEMA_TMDB_ACCOUNT='123';
    w.LOCAL_CATALOG=[{item:{...b, runtime:85},play:'file:///E:/Film.mp4'},{item:{...b, runtime:85},play:'file:///E:/Film-altra-copia.mp4'},{item:{...c, episode_run_time:[42]},play:'file:///E:/Serie.mp4'}];
    if (stored) w.localStorage.setItem('homecinema:catalog-controls:v1', stored);
    if (pinned) w.localStorage.setItem('homecinema:pinned-movies:v1', pinned);
    const calls=[]; let throttled=false, inFlight=0, maxInFlight=0;
    w.fetch = async url => {
        const u=new URL(url); calls.push(u.pathname+'?'+u.searchParams.toString());
        inFlight++; maxInFlight=Math.max(maxInFlight,inFlight);
        try {
            await delay(slow ? 250 : 10);
            if (fail) return fakeResponse({}, typeof fail === 'number' ? fail : 503);
            if (u.pathname === '/3/account/123/lists') return fakeResponse({results:[{id:99,name:'Lista con spazi'}],total_pages:1});
            if (u.pathname === '/4/list/99') return fakeResponse({results:[a,c],total_pages:1});
            if (u.pathname === '/3/account/123/watchlist/movies') {
                if (u.searchParams.get('page')==='1' && !throttled) { throttled=true; return fakeResponse({},429); }
                return fakeResponse({results:u.searchParams.get('page')==='1'?[a]:[b],total_pages:2});
            }
            if (u.pathname === '/3/account/123/favorite/movies') return fakeResponse({results:[{...a,genre_ids:[],rating:8.5}],total_pages:1});
            if (u.pathname === '/3/account/123/rated/tv') return fakeResponse({results:[c],total_pages:1});
            if (u.pathname === '/3/movie/1') return fakeResponse({runtime:120});
            if (u.pathname === '/3/movie/2') return fakeResponse({runtime:85});
            if (u.pathname === '/3/tv/3') return fakeResponse({episode_run_time:[42]});
            return fakeResponse({results:[],total_pages:1});
        } finally {
            inFlight--;
        }
    };
    w.eval(builders); w.eval(code);
    return {w, calls, dom, maxRequests: () => maxInFlight, setFailure: value => { fail = value; }};
}
function visible(w, selector='#catalog-online') { return [...w.document.querySelectorAll(selector+' .card')].filter(x=>x.style.display!=='none'); }
function button(w, selector, text) { const b=[...w.document.querySelectorAll(selector)].find(e=>e.textContent===text); assert.ok(b, 'missing button: '+text); b.click(); }
function input(w, selector, value) { let el=w.document.querySelector(selector); el.value=value; el.dispatchEvent(new w.Event('input',{bubbles:true})); }
function clickNav(w, path) { w.document.querySelector('.navbar-nav a[href="'+path+'"]:not(.none)').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,button:0})); }
(async()=>{
    const {w,calls,dom,maxRequests}=setup();
    await until(()=>w.document.querySelectorAll('#catalog-online .card').length>0,'online initial rendering');
    const firstNode=w.document.querySelector('#catalog-online .card');
    clickNav(w,'local.html');
    await until(()=>w.document.querySelectorAll('#catalog-local .card').length===3,'local cards, including distinct copies of one title');
    assert.equal(w.document.querySelector('#catalog-online').style.display,'none');
    await until(()=>calls.some(x=>x.includes('watchlist/movies')&&x.includes('page=2')),'load continues while viewing local');
    await until(()=>!w.document.getElementById('#risultati').textContent.includes('caricamento'),'local view ready');
    await delay(300);
    clickNav(w,'home.html');
    await until(()=>w.document.querySelectorAll('#catalog-online .card').length===3,'all online titles');
    await until(()=>!w.document.getElementById('#risultati').textContent.includes('caricamento'),'online ready');
    assert.ok(w.document.querySelector('#catalog-online').contains(firstNode),'original card must survive navigation');
    assert.equal(visible(w).length,3,'duplicates counted once');
    const tvFilter=w.document.querySelector('.filter-media-type[data-value="tv"]');
    assert.ok(tvFilter,'media type filter exists for TV series');
    tvFilter.click(); await delay(60);
    assert.equal(visible(w).length,1,'TV filter hides movies');
    assert.equal(visible(w)[0].id,'online-tv3');
    w.document.querySelector('.filter-media-type[data-value="tv"]').click(); await delay(60);
    w.document.querySelector('.filter-media-type[data-value="movie"]').click(); await delay(60);
    assert.equal(visible(w).length,2,'movie filter hides series');
    w.document.querySelector('.filter-media-type[data-value="movie"]').click(); await delay(60);
    const alpha=w.document.getElementById('online-mid1');
    assert.deepEqual(new Set(JSON.parse(alpha.dataset.lists)),new Set(['watchlist','favorite','Lista con spazi']));
    assert.equal(alpha.querySelector('.preview-user-rating').textContent,'Il tuo voto: 8.5/10','personal TMDB rating appears on the card');
    assert.ok(alpha.querySelectorAll('.preview-list-badge').length>=3,'list memberships appear as colored badges on hover');
    assert.ok(alpha.dataset.genres.split(' ').includes('28'),'genres from different sources are merged');
    assert.ok(calls.filter(x=>x.includes('/watchlist/movies')&&x.includes('page=1')).length===2,'429 retries same URL');
    const countBefore=calls.length; clickNav(w,'local.html'); clickNav(w,'home.html'); await delay(250);
    assert.equal(calls.length,countBefore,'switching catalogs must not fetch online again');
    input(w,'.search-input','ÀlPhA'); await delay(60); assert.equal(visible(w).length,1,'accent-insensitive search');
    input(w,'.search-input',''); await delay(60);
    button(w,'.filter-list','favorite'); await delay(60); assert.equal(visible(w).length,1,'list membership including duplicates');
    button(w,'.filter-list','Lista con spazi'); await delay(60); assert.equal(visible(w).length,2,'OR between lists');
    button(w,'.filter-genre','Sci-Fi & Fantasy'); await delay(60); assert.equal(visible(w).length,1,'AND between list and genre');
    assert.equal(visible(w)[0].id,'online-tv3');
    button(w,'.filter-genre','Sci-Fi & Fantasy'); button(w,'.filter-list','favorite'); button(w,'.filter-list','Lista con spazi'); await delay(60);
    input(w,'#sort-select','Anno'); await delay(60); let ordered=[...visible(w)].sort((x,y)=>Number(x.style.order)-Number(y.style.order)); assert.deepEqual(ordered.map(e=>e.id),['online-tv3','online-mid1','online-mid2']);
    input(w,'#sort-select','Voto'); await delay(60); ordered=[...visible(w)].sort((x,y)=>Number(x.style.order)-Number(y.style.order)); assert.deepEqual(ordered.map(e=>e.id),['online-mid2','online-mid1','online-tv3']);
    input(w,'#sort-select','Durata'); await until(()=>calls.some(x=>x.startsWith('/3/movie/1?')),'lazy duration fetch'); await delay(200);
    assert.equal(w.document.querySelector('#online-mid1 .preview-runtime').textContent,'2 h','duration appears in card details');
    ordered=[...visible(w)].sort((x,y)=>Number(x.style.order)-Number(y.style.order)); assert.deepEqual(ordered.map(e=>e.id),['online-tv3','online-mid2','online-mid1']);
    assert.ok(maxRequests()<=4,'never exceed the shared network concurrency limit');
    alpha.querySelector('.pin-card-button').click();
    await delay(40);
    assert.equal(w.document.getElementById('pinned-count').textContent,'1 titolo fissato','single-card pin is persisted');
    input(w,'.search-input','beta'); await delay(60); clickNav(w,'local.html'); await delay(60); assert.equal(w.document.querySelector('.search-input').value,'','separate per-catalog filters');
    input(w,'.search-input','gamma'); await delay(60); assert.equal(visible(w,'#catalog-local').length,2,'a pinned film stays visible alongside the local search result');
    clickNav(w,'home.html'); await delay(60); assert.equal(w.document.querySelector('.search-input').value,'beta','previous search restored');
    const stored=w.localStorage.getItem('homecinema:catalog-controls:v1'); const pinned=w.localStorage.getItem('homecinema:pinned-movies:v1'); await delay(100); dom.window.close();
    const second=setup({stored,pinned,fail:true,slow:true});
    await until(()=>second.w.document.querySelectorAll('#catalog-online .card').length===3,'cached titles displayed before failed network');
    assert.equal(second.w.document.querySelector('.search-input').value,'beta','filters survive reload');
    assert.equal(visible(second.w).length,2,'pinned film remains visible despite saved search');
    assert.equal(second.w.document.querySelector('#pinned-count').textContent,'1 titolo fissato','pinned titles survive a reload');
    second.dom.window.close();

    const pinsTest=setup();
    await until(()=>pinsTest.w.document.querySelectorAll('#catalog-online .card').length===3,'cards available for pin tests');
    await until(()=>!pinsTest.w.document.getElementById('#risultati').textContent.includes('caricamento'),'catalog complete for pin tests');
    input(pinsTest.w,'.search-input','beta');
    pinsTest.w.document.getElementById('pin-visible').click();
    await delay(80);
    assert.equal(pinsTest.w.document.getElementById('pinned-count').textContent,'1 titolo fissato','bulk pin uses current search even before the next render frame');
    input(pinsTest.w,'.search-input','');
    pinsTest.w.document.getElementById('pin-visible').click();
    await delay(80);
    assert.equal(pinsTest.w.document.getElementById('pinned-count').textContent,'3 titoli fissati','select-visible pins every currently matching title including series');
    input(pinsTest.w,'.search-input','gamma');
    await delay(60);
    assert.equal(visible(pinsTest.w).length,3,'all pinned movies ignore subsequent searches');
    pinsTest.w.document.querySelector('#online-tv3 .pin-card-button').click();
    await delay(50);
    assert.equal(pinsTest.w.document.getElementById('pinned-count').textContent,'2 titoli fissati','TV series can be unpinned individually');
    assert.equal(pinsTest.w.document.querySelector('#online-tv3 .pin-card-button').getAttribute('aria-pressed'),'false');
    pinsTest.w.document.querySelector('#online-tv3 .pin-card-button').click();
    await delay(50);
    assert.equal(pinsTest.w.document.getElementById('pinned-count').textContent,'3 titoli fissati','TV series can be pinned individually again');
    pinsTest.w.document.querySelector('.filter-media-type[data-value="movie"]').click();
    await delay(60);
    assert.equal(visible(pinsTest.w).length,3,'pinned TV series remain visible under the movie-only filter');
    pinsTest.w.Math.random=()=>0.9999;
    pinsTest.w.document.querySelector('.dice-button').click();
    await until(()=>pinsTest.w.document.getElementById('pin-status').textContent.startsWith('🎲 '),'dice picks a pinned title');
    assert.equal(pinsTest.w.document.querySelector('.card-dice-picked')?.id,'online-tv3','dice can choose a pinned TV series');
    pinsTest.w.Math.random=()=>0;
    pinsTest.w.document.querySelector('.dice-button').click();
    await until(()=>pinsTest.w.document.getElementById('pin-status').textContent.startsWith('🎲 '),'dice can be rolled again');
    const selectedCard=pinsTest.w.document.querySelector('.card-dice-picked');
    assert.ok(selectedCard && ['online-mid1','online-mid2','online-tv3'].includes(selectedCard.id),'repeat roll chooses among all pinned media');
    pinsTest.dom.window.close();
    const third=setup({fail:401});
    third.w.console.error=()=>{};
    await until(()=>third.w.document.getElementById('#risultati').textContent.includes('non riuscito'),'failed update shows saved cache');
    assert.equal(third.w.document.querySelectorAll('#catalog-online .card').length,3);
    const failedCalls=third.calls.length;
    third.setFailure(false);
    third.w.dispatchEvent(new third.w.Event('online'));
    await until(()=>third.calls.length>failedCalls,'retry after reconnect');
    await until(()=>third.w.document.getElementById('#risultati').textContent==='3 titoli','refresh finishes after reconnect');
    third.dom.window.close();
    console.log('PASS: persistenza, filtro film/serie, badge lista, voto, durata, pin persistenti per entrambi i tipi, dado e filtri.');
})().catch(e=>{console.error(e);process.exitCode=1});
