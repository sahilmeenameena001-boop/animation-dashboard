/* AnimLib Studio — brand kit + landing page builder/generator */

const BRAND_KEY = 'animlib.brand.v1';
const LAYOUT_KEY = 'animlib.layout.v1';

const PAGE_SLOTS = [
  { key:'preloader',    label:'Preloader',        hint:'Shown for 1.8s on load' },
  { key:'header',       label:'Header / Navbar',  hint:'Small mark beside the logo' },
  { key:'hero',         label:'Hero',             hint:'Main visual, right of the headline' },
  { key:'background',   label:'Hero background',  hint:'Ambient layer behind the hero' },
  { key:'features',     label:'Features',         hint:'Icon repeated in 3 feature cards' },
  { key:'showcase',     label:'Showcase / About', hint:'Large visual beside the copy' },
  { key:'stats',        label:'Stats band',       hint:'Accent animation in the numbers strip' },
  { key:'testimonials', label:'Testimonials',     hint:'Decorative mark above the quote' },
  { key:'cta',          label:'CTA band',         hint:'Animation behind the final call to action' },
  { key:'footer',       label:'Footer',           hint:'Small mark in the footer' }
];

const DEFAULT_BRAND = {
  name:'Your Brand', tagline:'Tagline goes here', logo:'', primary:'#6c5ce7', accent:'#00d4a0',
  theme:'dark', font:'Inter', radius:'12', headline:'Animations that make your product feel alive',
  sub:'Store every animation your team uses, drop them into a real landing page and see them working in seconds.',
  cta:'Get started', industry:''
};

let brand  = readJSON(BRAND_KEY, DEFAULT_BRAND);
let layout = readJSON(LAYOUT_KEY, {});

function readJSON(k, fb){ try{ return Object.assign({}, fb, JSON.parse(localStorage.getItem(k))||{}); }catch(e){ return Object.assign({}, fb); } }
function writeJSON(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
const q = s => document.querySelector(s);

/* ---------- view switching ---------- */
function setView(v){
  ['library','brand','builder'].forEach(name => q('#view-'+name).hidden = (name !== v));
  q('#libFilters').style.display = v === 'library' ? '' : 'none';
  document.querySelectorAll('#viewNav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if(v === 'brand') fillBrandForm();
  if(v === 'builder'){ renderSlots(); buildPreview(); }
}
document.querySelectorAll('#viewNav button').forEach(b => b.onclick = () => setView(b.dataset.view));
q('#toBuilder').onclick = () => { saveBrand(); setView('builder'); };

/* ---------- brand kit ---------- */
const BF = ['name','tagline','logo','primary','accent','theme','font','radius','headline','sub','cta','industry'];
function fillBrandForm(){ BF.forEach(k => { const el = q('#b_'+k); if(el) el.value = brand[k] || ''; }); renderBrandPreview(); }
function readBrandForm(){ BF.forEach(k => { const el = q('#b_'+k); if(el) brand[k] = el.value; }); }
function saveBrand(){ readBrandForm(); writeJSON(BRAND_KEY, brand); renderBrandPreview(); }

q('#brandForm').oninput = () => { readBrandForm(); renderBrandPreview(); };
q('#brandForm').onsubmit = e => { e.preventDefault(); saveBrand(); toast('Brand kit saved'); };
q('#resetBrand').onclick = () => { brand = Object.assign({}, DEFAULT_BRAND); writeJSON(BRAND_KEY, brand); fillBrandForm(); toast('Brand kit reset'); };

function renderBrandPreview(){
  const dark = brand.theme === 'dark';
  const bg = dark ? '#0f1117' : '#ffffff', fg = dark ? '#eef1f7' : '#12151d', mut = dark ? '#8b93a7' : '#5c6474';
  q('#brandPreview').innerHTML = `
    <div class="bp-bar">
      <div class="bp-logo" style="background:${esc(brand.primary)}">
        ${brand.logo ? `<img src="${esc(brand.logo)}" alt="logo">` : esc((brand.name||'B').trim().charAt(0).toUpperCase())}
      </div>
      <div><b style="font-size:15px">${esc(brand.name||'Your Brand')}</b>
        <div class="muted">${esc(brand.tagline||'')}</div></div>
    </div>
    <div class="bp-swatches">
      <div class="sw" style="background:${esc(brand.primary)}"></div>
      <div class="sw" style="background:${esc(brand.accent)}"></div>
      <div class="sw" style="background:${bg}"></div>
    </div>
    <div class="bp-card" style="background:${bg};color:${fg};border-radius:${+brand.radius+4}px">
      <h4 style="font-family:'${esc(brand.font)}',Inter,sans-serif">${esc(brand.headline||'')}</h4>
      <p style="color:${mut};font-size:13px;margin:0">${esc(brand.sub||'')}</p>
      <span class="bp-btn" style="background:${esc(brand.primary)};border-radius:${esc(brand.radius)}px">${esc(brand.cta||'Get started')}</span>
    </div>
    <p class="muted">${esc(brand.industry||'')}</p>`;
}

/* ---------- page builder slots ---------- */
function renderSlots(){
  q('#slots').innerHTML = PAGE_SLOTS.map(s => {
    const cfg = layout[s.key] || {};
    const opts = ['<option value="">— none —</option>'].concat(
      items.map(a => `<option value="${a.id}" ${cfg.animId===a.id?'selected':''}>${esc(a.name)} · ${esc(a.type)}</option>`)
    ).join('');
    return `<div class="slot">
      <div class="slot-head"><b>${esc(s.label)}</b><small>${esc(s.hint)}</small></div>
      <select data-slot="${s.key}">${opts}</select>
      <div class="row2">
        <select data-size="${s.key}">
          ${['sm','md','lg'].map(z=>`<option value="${z}" ${cfg.size===z?'selected':''}>${({sm:'Small',md:'Medium',lg:'Large'})[z]}</option>`).join('')}
        </select>
        <label class="switch"><input type="checkbox" data-loop="${s.key}" ${cfg.loop!==false?'checked':''}/> loop</label>
      </div>
    </div>`;
  }).join('');

  q('#slots').querySelectorAll('[data-slot]').forEach(sel => sel.onchange = () => {
    setSlot(sel.dataset.slot, { animId: sel.value });
  });
  q('#slots').querySelectorAll('[data-size]').forEach(sel => sel.onchange = () => {
    setSlot(sel.dataset.size, { size: sel.value });
  });
  q('#slots').querySelectorAll('[data-loop]').forEach(cb => cb.onchange = () => {
    setSlot(cb.dataset.loop, { loop: cb.checked });
  });
}
function setSlot(key, patch){
  layout[key] = Object.assign({ size:'md', loop:true }, layout[key], patch);
  writeJSON(LAYOUT_KEY, layout);
  buildPreview();
}

/* ---------- animation embed for the generated page ---------- */
const SIZE_PX = { sm:'90px', md:'220px', lg:'400px' };
function slotAnim(key){
  const cfg = layout[key]; if(!cfg || !cfg.animId) return null;
  const a = items.find(x => x.id === cfg.animId); if(!a) return null;
  return { a: a, size: SIZE_PX[cfg.size || 'md'], loop: cfg.loop !== false };
}
function embed(key, extraStyle){
  const s = slotAnim(key); if(!s) return '';
  const a = s.a, style = `max-width:100%;height:${s.size};${extraStyle||''}`;
  const loop = s.loop ? 'loop ' : '';
  if(a.type === 'Lottie' && /\.(json|lottie)(\?|$)/i.test(a.url))
    return `<lottie-player src="${esc(a.url)}" background="transparent" speed="1" ${loop}autoplay style="${style}"></lottie-player>`;
  if(a.type === 'Video')
    return `<video src="${esc(a.url)}" muted ${loop}autoplay playsinline style="${style};object-fit:cover"></video>`;
  if(a.type === 'GIF' || a.type === 'SVG')
    return `<img src="${esc(a.url)}" alt="${esc(a.name)}" style="${style}" />`;
  return `<div style="${style};display:grid;place-items:center;opacity:.5;font-size:12px">${esc(a.type)} asset</div>`;
}

/* ---------- landing page generator ---------- */
function pageCSS(){
  const dark = brand.theme === 'dark';
  const bg = dark ? '#0c0e14' : '#ffffff';
  const bg2 = dark ? '#12151d' : '#f5f6fa';
  const fg = dark ? '#eef1f7' : '#12151d';
  const mut = dark ? '#98a0b4' : '#5c6474';
  const line = dark ? '#232838' : '#e4e7ef';
  const r = (brand.radius || 12) + 'px';
  return `*{box-sizing:border-box}body{margin:0;background:${bg};color:${fg};
font-family:'${brand.font}',Inter,system-ui,sans-serif;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
header{position:sticky;top:0;z-index:20;background:${bg}e6;backdrop-filter:blur(10px);border-bottom:1px solid ${line}}
.nav{display:flex;align-items:center;gap:14px;padding:14px 0}
.logo{display:flex;align-items:center;gap:9px;font-weight:700;font-size:18px}
.logo .mark{width:34px;height:34px;border-radius:${r};background:${brand.primary};display:grid;place-items:center;color:#fff;overflow:hidden}
.logo .mark img{width:100%;height:100%;object-fit:contain}
.nav .links{margin-left:auto;display:flex;gap:22px;color:${mut};font-size:14px}
.btn{background:${brand.primary};color:#fff;padding:11px 22px;border-radius:${r};font-weight:600;font-size:14px;display:inline-block;border:0;cursor:pointer}
.btn.alt{background:transparent;border:1px solid ${line};color:${fg}}
section{padding:84px 0;position:relative}
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;padding:96px 0 80px}
.hero h1{font-size:clamp(32px,5vw,56px);line-height:1.06;letter-spacing:-1.6px;margin:0 0 18px}
.hero p{color:${mut};font-size:17px;line-height:1.6;margin:0 0 26px;max-width:52ch}
.hero .cta-row{display:flex;gap:12px;flex-wrap:wrap}
.hero-art{display:grid;place-items:center}
.bg-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:.35;display:grid;place-items:center}
.eyebrow{display:inline-block;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:${brand.accent};margin-bottom:14px}
h2.sec{font-size:clamp(24px,3.4vw,36px);letter-spacing:-.8px;margin:0 0 10px}
.sub{color:${mut};margin:0 0 40px;max-width:60ch}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.card{background:${bg2};border:1px solid ${line};border-radius:${r};padding:24px;text-align:left}
.card h3{margin:14px 0 8px;font-size:17px}
.card p{margin:0;color:${mut};font-size:14px;line-height:1.6}
.showcase{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}
.stats{background:${bg2};border-top:1px solid ${line};border-bottom:1px solid ${line}}
.stats-in{display:flex;gap:30px;align-items:center;flex-wrap:wrap;justify-content:space-between}
.stat b{display:block;font-size:34px;letter-spacing:-1px;color:${brand.accent}}
.stat span{color:${mut};font-size:13px}
.quote{max-width:720px;margin:0 auto;text-align:center}
.quote p{font-size:21px;line-height:1.55;margin:16px 0}
.cta{background:${brand.primary};color:#fff;border-radius:${r};padding:64px 30px;text-align:center;position:relative;overflow:hidden}
.cta h2{font-size:clamp(26px,4vw,40px);margin:0 0 12px;letter-spacing:-1px}
.cta .btn{background:#fff;color:${brand.primary}}
footer{border-top:1px solid ${line};padding:34px 0;color:${mut};font-size:13px}
.foot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
#preloader{position:fixed;inset:0;background:${bg};display:grid;place-items:center;z-index:99;transition:opacity .5s}
@media(max-width:860px){.hero,.showcase{grid-template-columns:1fr}.nav .links{display:none}}`;
}

function buildPageHTML(){
  const b = brand;
  const logoMark = b.logo ? `<img src="${esc(b.logo)}" alt="">` : esc((b.name||'B').trim().charAt(0).toUpperCase());
  const headerA = embed('header','height:34px');
  const pre = slotAnim('preloader');
  const feat = embed('features','height:64px');
  const featCards = [
    ['Built for teams','Everyone drops their animations in one place, tagged by the section they belong to.'],
    ['Real context','Preview each animation inside a landing page, not on a blank canvas.'],
    ['Ship faster','Export the page as HTML and hand it straight to development.']
  ].map(c => `<div class="card">${feat}<h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(b.name)} — ${esc(b.tagline)}</title>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(b.font)}:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js"><\/script>
<style>${pageCSS()}</style></head>
<body>
${pre ? `<div id="preloader">${embed('preloader')}</div>` : ''}
<header><div class="wrap nav">
  <div class="logo"><span class="mark">${logoMark}</span>${esc(b.name)}${headerA}</div>
  <nav class="links"><a href="#features">Features</a><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></nav>
  <a class="btn" href="#contact">${esc(b.cta)}</a>
</div></header>

<div class="wrap"><section class="hero">
  ${embed('background') ? `<div class="bg-layer">${embed('background','height:100%;width:100%')}</div>` : ''}
  <div>
    <span class="eyebrow">${esc(b.tagline)}</span>
    <h1>${esc(b.headline)}</h1>
    <p>${esc(b.sub)}</p>
    <div class="cta-row"><a class="btn" href="#contact">${esc(b.cta)}</a><a class="btn alt" href="#features">See how it works</a></div>
  </div>
  <div class="hero-art">${embed('hero','height:380px')}</div>
</section></div>

<div class="wrap"><section id="features">
  <h2 class="sec">What you get</h2><p class="sub">Every section below is powered by an animation you picked in the dashboard.</p>
  <div class="cards">${featCards}</div>
</section></div>

<section class="stats"><div class="wrap stats-in">
  <div class="stat"><b>${items.length}</b><span>Animations in library</span></div>
  <div class="stat"><b>${new Set(items.map(a=>a.section)).size}</b><span>Sections covered</span></div>
  <div class="stat"><b>${Object.values(layout).filter(l=>l&&l.animId).length}</b><span>Slots filled on this page</span></div>
  <div>${embed('stats','height:110px')}</div>
</div></section>

<div class="wrap"><section id="about" class="showcase">
  <div>${embed('showcase','height:320px')}</div>
  <div><span class="eyebrow">About</span><h2 class="sec">${esc(b.name)} in motion</h2>
  <p class="sub">${esc(b.industry || b.sub)}</p>
  <a class="btn alt" href="#contact">Talk to us</a></div>
</section></div>

<div class="wrap"><section id="work"><div class="quote">
  ${embed('testimonials','height:70px')}
  <p>“The team finally stopped digging through chats to find the right animation — it is all in one library, and we can see it live on the page.”</p>
  <span class="sub">Product team · ${esc(b.name)}</span>
</div></section></div>

<div class="wrap"><section id="contact"><div class="cta">
  ${embed('cta') ? `<div class="bg-layer">${embed('cta','height:100%')}</div>` : ''}
  <h2>${esc(b.cta)} with ${esc(b.name)}</h2>
  <p style="opacity:.85;margin:0 0 22px">${esc(b.tagline)}</p>
  <a class="btn" href="#">${esc(b.cta)}</a>
</div></section></div>

<footer><div class="wrap foot">${embed('footer','height:30px')}
  <span>© ${new Date().getFullYear()} ${esc(b.name)}. All rights reserved.</span>
  <span style="margin-left:auto">Preview generated by AnimLib Studio</span>
</div></footer>
${pre ? `<script>setTimeout(function(){var p=document.getElementById('preloader');p.style.opacity=0;setTimeout(function(){p.remove()},500)},1800)<\/script>` : ''}
</body></html>`;
}

/* ---------- preview / export ---------- */
let pageBlobURL = null;
function buildPreview(){
  const html = pageOutput();
  q('#pagePreview').srcdoc = html;
  if(pageBlobURL) URL.revokeObjectURL(pageBlobURL);
  pageBlobURL = URL.createObjectURL(new Blob([html], {type:'text/html'}));
}
q('#refreshPreview').onclick = () => { buildPreview(); toast('Preview rebuilt'); };
q('#deviceSel').onchange = e => { q('#pagePreview').style.width = e.target.value; };
q('#openTab').onclick = () => { if(!pageBlobURL) buildPreview(); window.open(pageBlobURL, '_blank'); };
q('#downloadPage').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([pageOutput()], {type:'text/html'}));
  a.download = (brand.name || 'landing').toLowerCase().replace(/\s+/g,'-') + '-landing.html';
  a.click(); URL.revokeObjectURL(a.href);
  toast('landing page downloaded — drop it in this folder and open http://localhost:5173/');
};

fillBrandForm();
setView('library');

/* first run: pre-fill slots from library sections so the preview is never empty */
function autoAssign(){
  if(Object.keys(layout).length) return;
  const map = { preloader:'Loader / Preloader', hero:'Hero / Banner', features:'Icons',
                showcase:'Hero / Banner', cta:'Success / Error' };
  Object.keys(map).forEach(k => {
    const a = items.find(x => x.section === map[k]);
    if(a) layout[k] = { animId:a.id, size: k==='features' ? 'sm' : (k==='hero' ? 'lg' : 'md'), loop:true };
  });
  writeJSON(LAYOUT_KEY, layout);
}
autoAssign();

/* ================= guided 3-step flow (for non-technical users) ================= */
const GUIDE_KEY = 'animlib.guide.seen';
const STEPS = [
  { view:'library', title:'Add your animations',
    desc:'Paste the link of every animation you want to use.' },
  { view:'brand', title:'Add brand details',
    desc:'Brand name, logo, colours and the words for the page.' },
  { view:'builder', title:'Build & preview the page',
    desc:'Pick an animation for each part of the page, then see it live.' }
];
let currentView = 'library';

function stepDone(i){
  if(i === 0) return items.length > 0;
  if(i === 1) return !!localStorage.getItem(BRAND_KEY);
  return Object.values(layout).filter(l => l && l.animId).length > 0;
}
function renderStepper(){
  q('#stepper').innerHTML = STEPS.map((s,i) => {
    const done = stepDone(i), active = s.view === currentView;
    return `<div class="step ${active?'active':''} ${done && !active?'done':''}" data-go="${s.view}">
      <span class="num">${done && !active ? '✓' : (i+1)}</span>
      <span><b>Step ${i+1} — ${s.title}</b><small>${s.desc}</small></span></div>`;
  }).join('');
  q('#stepper').querySelectorAll('[data-go]').forEach(el => el.onclick = () => setView(el.dataset.go));
}

function renderHowto(){
  const el = q('#howto');
  el.hidden = localStorage.getItem(GUIDE_KEY) === '1' || currentView !== 'library';
  if(el.hidden) return;
  el.innerHTML = `<h2>Make a landing page in 3 steps</h2>
    <p>No coding needed. Follow the steps and the dashboard builds a real landing page you can look at and share.</p>
    <ol>
      <li><b>Add animations</b> — <span>click “+ Import Link”, paste the animation link, say where it will be used.</span></li>
      <li><b>Add brand details</b> — <span>brand name, logo, colours, headline and button text.</span></li>
      <li><b>Build &amp; preview</b> — <span>choose an animation for the header, hero, footer… and the page appears on the right.</span></li>
    </ol>
    <div class="howto-actions">
      <button class="btn primary" id="guideStart">Start with step 1 →</button>
      <button class="btn ghost" id="guideHide">Don't show this again</button>
    </div>`;
  q('#guideStart').onclick = () => q('#addBtn').click();
  q('#guideHide').onclick = () => { localStorage.setItem(GUIDE_KEY,'1'); el.hidden = true; };
}

/* per-view call-to-action bars */
function ctaBar(view){
  let host = q('#cta-' + view);
  if(!host){ host = document.createElement('div'); host.id = 'cta-' + view; host.className = 'cta-bar';
    q('#view-' + view).appendChild(host); }
  if(view === 'library'){
    const n = items.length;
    host.className = 'cta-bar' + (n ? ' hero-cta' : '');
    host.innerHTML = `<div class="txt"><b>${n ? `${n} animation${n===1?'':'s'} in your library` : 'Add your first animation'}</b>
      <small>${n ? 'Next, tell us about the brand — name, logo and colours for the landing page.' : 'Click “+ Import Link” above and paste an animation link to begin.'}</small></div>
      ${n ? '<button class="btn primary big" data-go="brand">Step 2: Add brand details →</button>'
          : '<button class="btn primary big" id="ctaAdd">+ Import Link</button>'}`;
    if(!n) q('#ctaAdd').onclick = () => q('#addBtn').click();
  }
  if(view === 'brand'){
    host.className = 'cta-bar hero-cta';
    host.innerHTML = `<div class="txt"><b>Brand details ready?</b>
      <small>Save them, then choose which animation goes in the header, hero, footer and the rest.</small></div>
      <button class="btn ghost" id="ctaSaveBrand">Save brand kit</button>
      <button class="btn primary big" data-go="builder">Step 3: Build my landing page →</button>`;
    q('#ctaSaveBrand').onclick = () => { saveBrand(); toast('Brand kit saved'); renderStepper(); };
  }
  if(view === 'builder'){
    const filled = Object.values(layout).filter(l => l && l.animId).length;
    host.className = 'cta-bar hero-cta';
    const src = (typeof pageSrc !== 'undefined' && pageSrc.mode === 'custom' && pageSrc.html)
      ? 'your own page' : 'the built-in template';
    host.innerHTML = `<div class="txt"><b>${filled} of ${PAGE_SLOTS.length} page sections have an animation</b>
      <small>Previewing in <b>${src}</b> — press the button to build it, it opens in a new tab exactly as visitors would see it.
      Use “Use my page…” above to drop these animations into your real website instead.</small></div>
      <button class="btn ghost" id="ctaDownload">Download page file</button>
      <button class="btn primary big" id="ctaGenerate">▶ Generate landing page preview</button>`;
    q('#ctaGenerate').onclick = () => {
      buildPreview();
      window.open(pageBlobURL, '_blank');
      toast('Landing page generated — opened in a new tab');
      renderStepper();
    };
    q('#ctaDownload').onclick = () => q('#downloadPage').click();
  }
  host.querySelectorAll('[data-go]').forEach(b => b.onclick = () => setView(b.dataset.go));
}

/* wire the guided flow into the existing view / render cycle */
const _setView = setView, _render = render, _buildPreview = buildPreview;
setView = function(v){
  currentView = v;
  _setView(v);
  renderStepper(); renderHowto(); ctaBar(v);
};
render = function(){ _render(); renderStepper(); if(currentView === 'library') ctaBar('library'); };
buildPreview = function(){ _buildPreview(); if(currentView === 'builder') ctaBar('builder'); };

setView('library');

/* ================= use your own landing page ================= */
const PAGE_KEY = 'animlib.page.v1';
let pageSrc = readJSON(PAGE_KEY, { mode:'template', html:'', name:'', outline:false });

/* where each slot goes when the user's HTML has no data-anim markers */
const AUTO_MAP = {
  header:      ['header','.header','#header','nav'],
  hero:        ['.hero','#hero','[class*=hero]','main > section:first-of-type','section:first-of-type'],
  background:  ['.hero','#hero','main > section:first-of-type','section:first-of-type'],
  features:    ['.features','#features','[class*=feature]'],
  showcase:    ['.about','#about','[class*=about]','[class*=showcase]'],
  stats:       ['.stats','#stats','[class*=stat]'],
  testimonials:['.testimonials','#testimonials','[class*=testimonial]','[class*=review]'],
  cta:         ['.cta','#cta','[class*=cta]','#contact','.contact'],
  footer:      ['footer','.footer','#footer']
};
const BG_SLOTS = ['background','cta'];

function pageOutput(){
  return (pageSrc.mode === 'custom' && pageSrc.html.trim())
    ? injectCustom(pageSrc.html) : buildPageHTML();
}

function injectCustom(raw){
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  if(!doc.head) return raw;

  /* lottie-player runtime, only if missing */
  if(!doc.querySelector('script[src*="lottie-player"]')){
    const s = doc.createElement('script');
    s.src = 'https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js';
    doc.head.appendChild(s);
  }
  const st = doc.createElement('style');
  st.textContent = `.animlib-slot{display:block;max-width:100%}
.animlib-slot.inline{display:inline-block;vertical-align:middle;margin:0 8px}
.animlib-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;opacity:.35;display:grid;place-items:center}
.animlib-bg>*{width:100%;height:100%}
${pageSrc.outline ? '.animlib-slot,.animlib-bg{outline:2px dashed #00d4a0;outline-offset:3px}' : ''}`;
  doc.head.appendChild(st);

  const marked = doc.querySelectorAll('[data-anim]').length > 0;

  PAGE_SLOTS.forEach(s => {
    const key = s.key, html = embed(key);
    if(!html) return;

    if(key === 'preloader'){
      const ov = doc.createElement('div');
      ov.id = 'animlib-preloader';
      ov.setAttribute('style','position:fixed;inset:0;background:#0c0e14;display:grid;place-items:center;z-index:9999;transition:opacity .5s');
      ov.innerHTML = html;
      doc.body.insertBefore(ov, doc.body.firstChild);
      const sc = doc.createElement('script');
      sc.textContent = "setTimeout(function(){var p=document.getElementById('animlib-preloader');if(!p)return;p.style.opacity=0;setTimeout(function(){p.remove()},500)},1800)";
      doc.body.appendChild(sc);
      return;
    }

    /* 1. explicit markers win:  <div data-anim="hero"></div> */
    const targets = Array.prototype.slice.call(doc.querySelectorAll('[data-anim="' + key + '"]'));
    if(targets.length){
      targets.forEach(t => { t.innerHTML = html; t.classList.add('animlib-slot'); });
      return;
    }
    if(marked) return; /* user marked their page — don't guess elsewhere */

    /* 2. otherwise guess from common tags / class names */
    let host = null;
    (AUTO_MAP[key] || []).some(sel => { try{ host = doc.querySelector(sel); }catch(e){} return !!host; });
    if(!host) return;

    if(BG_SLOTS.indexOf(key) > -1){
      if(!host.style.position) host.style.position = 'relative';
      const layer = doc.createElement('div');
      layer.className = 'animlib-bg';
      layer.innerHTML = html;
      host.insertBefore(layer, host.firstChild);
    } else {
      const box = doc.createElement('div');
      box.className = 'animlib-slot' + (key === 'header' || key === 'footer' ? ' inline' : '');
      box.innerHTML = html;
      if(key === 'header' || key === 'footer') host.appendChild(box);
      else host.insertBefore(box, host.firstChild);
    }
  });

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

/* ---------- "use my own page" UI ---------- */
function savePageSrc(){ writeJSON(PAGE_KEY, pageSrc); }
function openPageModal(){
  q('#pageHtml').value = pageSrc.html || '';
  q('#pageOutline').checked = !!pageSrc.outline;
  q('#pageModal').hidden = false; q('#pageModal').style.display = 'flex';
}
function closePageModal(){ q('#pageModal').hidden = true; q('#pageModal').style.display = 'none'; }

q('#myPageBtn').onclick = openPageModal;
q('#closePage').onclick = closePageModal;
q('#pageModal').onclick = e => { if(e.target.id === 'pageModal') closePageModal(); };
q('#pageFile').onchange = e => {
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => { q('#pageHtml').value = r.result; pageSrc.name = f.name; };
  r.readAsText(f);
};
q('#pageForm').onsubmit = e => {
  e.preventDefault();
  const html = q('#pageHtml').value.trim();
  if(!html){ toast('Paste your page HTML or upload a .html file'); return; }
  pageSrc.html = html; pageSrc.outline = q('#pageOutline').checked; pageSrc.mode = 'custom';
  savePageSrc(); q('#pageSrcSel').value = 'custom';
  closePageModal(); buildPreview();
  toast('Your page is now previewed with the animations');
};
q('#clearPage').onclick = () => {
  pageSrc.mode = 'template'; savePageSrc(); q('#pageSrcSel').value = 'template';
  closePageModal(); buildPreview(); toast('Back to the built-in template');
};
q('#pageSrcSel').onchange = e => {
  if(e.target.value === 'custom' && !pageSrc.html.trim()){ openPageModal(); return; }
  pageSrc.mode = e.target.value; savePageSrc(); buildPreview();
};
q('#pageSrcSel').value = pageSrc.mode;
document.addEventListener('keydown', e => { if(e.key === 'Escape') closePageModal(); });
