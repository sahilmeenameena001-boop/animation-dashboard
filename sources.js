/* Free animation sources: a ready-to-add starter pack + links to free libraries */

const LF = id => 'https://assets1.lottiefiles.com/packages/' + id + '.json';

const CATALOG = [
  { n:'Abstract hero loop',   id:'lf20_yzoqyyqf', s:'Hero / Banner',        t:['hero','abstract'] },
  { n:'Illustrated hero',     id:'lf20_qp1q7mct', s:'Hero / Banner',        t:['hero','illustration'] },
  { n:'Loading dots',         id:'lf20_kkflmtur', s:'Loader / Preloader',   t:['loader','dots'] },
  { n:'Spinner — Loading',    id:'lf20_p8bfn5to', s:'Loader / Preloader',   t:['loader','spinner'] },
  { n:'Minimal loader',       id:'lf20_b88nh30c', s:'Loader / Preloader',   t:['loader','minimal'] },
  { n:'Success check',        id:'lf20_jcikwtux', s:'Success / Error',      t:['success','check'] },
  { n:'Animated icon',        id:'lf20_ktwnwv5m', s:'Icons',                t:['icon'] },
  { n:'Icon loop',            id:'lf20_hl5n0bwb', s:'Icons',                t:['icon','loop'] },
  { n:'Wavy gradient BG',     id:'lf20_zw0djhar', s:'Background / Ambient', t:['background','gradient'] },
  { n:'Paper plane — send',   id:'lf20_x62chJ',   s:'Buttons & Micro-interactions', t:['send','cta'] },
  { n:'Contact us',           id:'lf20_puciaact', s:'Footer',               t:['contact','support'] },
  { n:'Person thinking',      id:'lf20_tll0j4bb', s:'Onboarding',           t:['people','onboarding'] },
  { n:'Person thinking (alt)',id:'lf20_ysas4vcp', s:'Onboarding',           t:['people','onboarding'] },
  { n:'Mobile app screen',    id:'lf20_UJNc2t',   s:'Mobile App',           t:['mobile','app'] }
];

const SITES = [
  { name:'LottieFiles',        url:'https://lottiefiles.com/free-animations',
    what:'The biggest free Lottie library. Copy the “Lottie animation URL” from any free animation.',
    lic:'Free assets — check each one, most need credit for commercial use' },
  { name:'IconScout — Free Lotties', url:'https://iconscout.com/free-lottie-animations',
    what:'Free Lottie packs by category (business, e-commerce, UI).', lic:'Free with attribution' },
  { name:'Lordicon',           url:'https://lordicon.com/icons?price=free',
    what:'Animated icons for buttons, menus and toggles.', lic:'Free tier with link credit' },
  { name:'Icons8 Animated',    url:'https://icons8.com/animated-icons',
    what:'Animated icons and illustrations, GIF and JSON.', lic:'Free with link back' },
  { name:'useAnimations',      url:'https://useanimations.com/',
    what:'Small interaction icons (menu, play, heart, loading).', lic:'Free, MIT-style' },
  { name:'LottieFlow',         url:'https://lottieflow.com/',
    what:'Ready-made Lottie sets — loaders, arrows, backgrounds, social.', lic:'Free to use' },
  { name:'Rive Community',     url:'https://rive.app/community/',
    what:'Interactive animations (.riv). Great for hover and click states.', lic:'Per-asset license' },
  { name:'Mixkit',             url:'https://mixkit.co/free-stock-video/',
    what:'Free stock video loops for hero backgrounds (.mp4).', lic:'Free, no attribution' },
  { name:'Coverr',             url:'https://coverr.co/',
    what:'Free background videos made for websites.', lic:'Free, no attribution' },
  { name:'Pixabay',            url:'https://pixabay.com/videos/',
    what:'Free videos and GIFs.', lic:'Free, no attribution' },
  { name:'SVGator explore',    url:'https://www.svgator.com/free-animated-icons',
    what:'Animated SVG icons you can export and host yourself.', lic:'Free set available' },
  { name:'Storyset',           url:'https://storyset.com/',
    what:'Animated illustrations for hero and empty states (SVG).', lic:'Free with attribution' }
];

/* ---------- rendering ---------- */
let catSection = 'all';

function inLibrary(url){ return items.some(a => a.url === url); }

function addFromCatalog(c, quiet){
  const url = LF(c.id);
  if(inLibrary(url)){ if(!quiet) toast('Already in your library'); return false; }
  items.push({ id:uid(), url:url, name:c.n, type:'Lottie', section:c.s,
    project:'', owner:'LottieFiles (free)', tags:c.t.slice(), uses:0, createdAt:Date.now(),
    notes:'Added from the free starter pack — check the licence on lottiefiles.com before commercial use.' });
  save();
  return true;
}

function renderCatalog(){
  const sections = ['all'].concat(CATALOG.map(c => c.s).filter((v,i,a) => a.indexOf(v) === i));
  const sel = document.getElementById("catFilter");
  if(sel.options.length !== sections.length)
    sel.innerHTML = sections.map(s => `<option value="${s}">${s === 'all' ? 'All sections' : s}</option>`).join('');
  sel.value = catSection;

  const list = CATALOG.filter(c => catSection === 'all' || c.s === catSection);
  document.getElementById('catCount').textContent = list.length + ' free animations';
  document.getElementById('catGrid').innerHTML = list.map(c => {
    const url = LF(c.id), have = inLibrary(url);
    return `<article class="card">
      <div class="preview">
        <lottie-player src="${url}" background="transparent" speed="1" loop autoplay></lottie-player>
        <span class="badge">Lottie</span>
      </div>
      <div class="card-body">
        <h4>${esc(c.n)}</h4>
        <div class="meta"><span class="pill sec">${esc(c.s)}</span>
          ${c.t.map(t => `<span class="pill">#${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="card-actions">
        <button class="${have ? 'added' : 'add'}" data-add="${c.id}" ${have ? 'disabled' : ''}>
          ${have ? '✓ In your library' : '+ Add to library'}</button>
        <a href="${url}" target="_blank" rel="noopener">Link ↗</a>
      </div></article>`;
  }).join('');

  document.querySelectorAll('#catGrid [data-add]').forEach(b => b.onclick = () => {
    const c = CATALOG.find(x => x.id === b.dataset.add);
    if(addFromCatalog(c)){ toast(c.n + ' added to your library'); render(); renderCatalog(); }
  });
}

function renderSites(){
  document.getElementById('siteGrid').innerHTML = SITES.map(s => `
    <a class="site" href="${s.url}" target="_blank" rel="noopener">
      <b>${esc(s.name)} ↗</b>
      <span>${esc(s.what)}</span>
      <small>${esc(s.lic)}</small>
    </a>`).join('');
}

document.getElementById("catFilter").onchange = e => { catSection = e.target.value; renderCatalog(); };
document.getElementById('addAllBtn').onclick = () => {
  const list = CATALOG.filter(c => catSection === 'all' || c.s === catSection);
  const n = list.filter(c => addFromCatalog(c, true)).length;
  render(); renderCatalog();
  toast(n ? n + ' animations added to your library' : 'All of these are already in your library');
};

/* hook into view switching */
const _setViewSrc = setView;
setView = function(v){ _setViewSrc(v); if(v === 'discover'){ renderCatalog(); renderSites(); } };
