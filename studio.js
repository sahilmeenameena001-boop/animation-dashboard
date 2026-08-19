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
  const html = buildPageHTML();
  q('#pagePreview').srcdoc = html;
  if(pageBlobURL) URL.revokeObjectURL(pageBlobURL);
  pageBlobURL = URL.createObjectURL(new Blob([html], {type:'text/html'}));
}
q('#refreshPreview').onclick = () => { buildPreview(); toast('Preview rebuilt'); };
q('#deviceSel').onchange = e => { q('#pagePreview').style.width = e.target.value; };
q('#openTab').onclick = () => { if(!pageBlobURL) buildPreview(); window.open(pageBlobURL, '_blank'); };
q('#downloadPage').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buildPageHTML()], {type:'text/html'}));
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
