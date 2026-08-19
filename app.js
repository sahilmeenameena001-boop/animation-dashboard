/* AnimLib — team animation library dashboard (localStorage based) */

const SECTIONS = [
  'Hero / Banner', 'Loader / Preloader', 'Landing Page', 'Onboarding',
  'Login / Signup', 'Empty State', 'Success / Error', 'Buttons & Micro-interactions',
  'Background / Ambient', 'Icons', 'Pricing / Features', 'Testimonials',
  'Footer', 'Mobile App', 'Marketing / Ads', 'Other'
];
const TYPES = ['Lottie','GIF','Video','SVG','Rive','CSS/JS'];
const KEY = 'animlib.items.v1';

const SEED = [
  { name:'Hero orbit', url:'https://assets10.lottiefiles.com/packages/lf20_yzoqyyqf.json', type:'Lottie',
    section:'Hero / Banner', project:'demo', owner:'Team', tags:['hero','abstract'], notes:'Sample asset — replace with yours.' },
  { name:'Loading dots', url:'https://assets2.lottiefiles.com/packages/lf20_kkflmtur.json', type:'Lottie',
    section:'Loader / Preloader', project:'demo', owner:'Team', tags:['loader'], notes:'Sample asset.' },
  { name:'Feature icon', url:'https://assets9.lottiefiles.com/packages/lf20_ktwnwv5m.json', type:'Lottie',
    section:'Icons', project:'demo', owner:'Team', tags:['icon'], notes:'Sample asset.' },
  { name:'Success check', url:'https://assets5.lottiefiles.com/packages/lf20_jcikwtux.json', type:'Lottie',
    section:'Success / Error', project:'demo', owner:'Team', tags:['success'], notes:'Sample asset.' }
];

let items = load();
let filter = { section:'all', type:'all', q:'', sort:'new' };

/* ---------- storage ---------- */
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const seeded = SEED.map(s => ({ ...s, id:uid(), createdAt:Date.now(), uses:0 }));
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}
function save(){ localStorage.setItem(KEY, JSON.stringify(items)); }
function uid(){ return Math.random().toString(36).slice(2,10); }

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(()=> t.hidden = true, 2200);
}
function guessType(url){
  const u = url.toLowerCase().split('?')[0];
  if(u.endsWith('.json') || u.includes('lottie')) return 'Lottie';
  if(u.endsWith('.riv')) return 'Rive';
  if(u.endsWith('.gif') || u.endsWith('.webp')) return 'GIF';
  if(u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov')) return 'Video';
  if(u.endsWith('.svg')) return 'SVG';
  return 'CSS/JS';
}
function previewHTML(a){
  const u = a.url;
  if(a.type === 'Lottie' && /\.(json|lottie)(\?|$)/i.test(u))
    return `<lottie-player src="${u}" background="transparent" speed="1" loop autoplay></lottie-player>`;
  if(a.type === 'Video') return `<video src="${u}" muted loop autoplay playsinline></video>`;
  if(['GIF','SVG'].includes(a.type)) return `<img src="${u}" alt="${esc(a.name)}" loading="lazy" />`;
  return `<div class="ph">No inline preview<br><small>${esc(a.type)} — open link</small></div>`;
}
function esc(s=''){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ---------- filtering ---------- */
function visible(){
  const q = filter.q.trim().toLowerCase();
  let out = items.filter(a =>
    (filter.section === 'all' || a.section === filter.section) &&
    (filter.type === 'all' || a.type === filter.type) &&
    (!q || [a.name, a.project, a.owner, a.section, (a.tags||[]).join(' ')]
      .join(' ').toLowerCase().includes(q))
  );
  if(filter.sort === 'name') out.sort((a,b)=> a.name.localeCompare(b.name));
  else if(filter.sort === 'used') out.sort((a,b)=> (b.uses||0)-(a.uses||0));
  else out.sort((a,b)=> b.createdAt - a.createdAt);
  return out;
}

/* ---------- render ---------- */
function renderNav(){
  const nav = $('#sectionNav');
  const rows = [['all','All Animations', items.length]]
    .concat(SECTIONS.map(s => [s, s, items.filter(a=>a.section===s).length]));
  nav.innerHTML = rows.map(([key,label,n]) =>
    `<button data-sec="${esc(key)}" class="${filter.section===key?'active':''}">
       <span>${esc(label)}</span><span class="count">${n}</span></button>`).join('');
  nav.querySelectorAll('button').forEach(b => b.onclick = () => {
    filter.section = b.dataset.sec; render();
  });

  $('#typeNav').innerHTML = ['all', ...TYPES].map(t =>
    `<button class="chip ${filter.type===t?'active':''}" data-type="${t}">${t==='all'?'All':t}</button>`).join('');
  $('#typeNav').querySelectorAll('.chip').forEach(c => c.onclick = () => {
    filter.type = c.dataset.type; render();
  });
}

function renderStats(){
  const projects = new Set(items.map(a=>a.project).filter(Boolean));
  const owners = new Set(items.map(a=>a.owner).filter(Boolean));
  const secs = new Set(items.map(a=>a.section));
  $('#stats').innerHTML = [
    [items.length,'Animations'], [secs.size,'Sections used'],
    [projects.size,'Projects'], [owners.size,'Contributors'],
    [items.reduce((s,a)=>s+(a.uses||0),0),'Times copied']
  ].map(([n,l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
}

function renderGrid(){
  const list = visible();
  $('#viewTitle').textContent = filter.section === 'all' ? 'All Animations' : filter.section;
  $('#viewCount').textContent = `${list.length} item${list.length===1?'':'s'}`;
  $('#empty').hidden = list.length > 0;
  $('#grid').innerHTML = list.map(a => `
    <article class="card">
      <div class="preview">${previewHTML(a)}<span class="badge">${esc(a.type)}</span></div>
      <div class="card-body">
        <h4>${esc(a.name)}</h4>
        <div class="meta">
          <span class="pill sec">${esc(a.section)}</span>
          ${a.project ? `<span class="pill">${esc(a.project)}</span>`:''}
          ${a.owner ? `<span class="pill">@${esc(a.owner)}</span>`:''}
          ${(a.tags||[]).map(t=>`<span class="pill">#${esc(t)}</span>`).join('')}
        </div>
        ${a.notes ? `<p class="muted">${esc(a.notes)}</p>`:''}
      </div>
      <div class="card-actions">
        <button data-copy="${a.id}">Copy link</button>
        <button data-edit="${a.id}">Edit</button>
        <button class="del" data-del="${a.id}">Delete</button>
        <a href="${esc(a.url)}" target="_blank" rel="noopener">Open ↗</a>
      </div>
    </article>`).join('');

  $('#grid').querySelectorAll('[data-copy]').forEach(b => b.onclick = () => {
    const a = items.find(x=>x.id===b.dataset.copy);
    navigator.clipboard.writeText(a.url);
    a.uses = (a.uses||0)+1; save(); renderStats();
    toast('Link copied to clipboard');
  });
  $('#grid').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openModal(b.dataset.edit));
  $('#grid').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if(!confirm('Delete this animation from the library?')) return;
    items = items.filter(x=>x.id!==b.dataset.del); save(); render(); toast('Deleted');
  });
}

function render(){ renderNav(); renderStats(); renderGrid(); }

/* ---------- modal ---------- */
function openModal(id){
  $('#f_section').innerHTML = SECTIONS.map(s=>`<option>${s}</option>`).join('');
  const a = items.find(x=>x.id===id);
  $('#modalTitle').textContent = a ? 'Edit animation' : 'Import animation link';
  $('#saveBtn').textContent = a ? 'Update' : 'Save animation';
  $('#f_id').value = a ? a.id : '';
  $('#f_url').value = a && a.url || '';
  $('#f_name').value = a && a.name || '';
  $('#f_type').value = a && a.type || 'Lottie';
  $('#f_section').value = (a && a.section) || (filter.section !== 'all' ? filter.section : SECTIONS[0]);
  $('#f_project').value = a && a.project || '';
  $('#f_owner').value = (a && a.owner) || localStorage.getItem('animlib.owner') || '';
  $('#f_tags').value = ((a && a.tags) || []).join(', ');
  $('#f_notes').value = a && a.notes || '';
  $('#modal').hidden = false;
  $('#f_url').focus();
}
function closeModal(){ $('#modal').hidden = true; }

$('#addBtn').onclick = () => openModal();
$('#closeModal').onclick = closeModal;
$('#cancelBtn').onclick = closeModal;
$('#modal').onclick = e => { if(e.target.id === 'modal') closeModal(); };
$('#f_url').onblur = () => { if($('#f_url').value) $('#f_type').value = guessType($('#f_url').value); };

$('#animForm').onsubmit = e => {
  e.preventDefault();
  const data = {
    url:$('#f_url').value.trim(), name:$('#f_name').value.trim(), type:$('#f_type').value,
    section:$('#f_section').value, project:$('#f_project').value.trim(),
    owner:$('#f_owner').value.trim(), notes:$('#f_notes').value.trim(),
    tags:$('#f_tags').value.split(',').map(t=>t.trim()).filter(Boolean)
  };
  localStorage.setItem('animlib.owner', data.owner);
  const id = $('#f_id').value;
  if(id){ items = items.map(a => a.id===id ? Object.assign({}, a, data) : a); toast('Animation updated'); }
  else { items.push(Object.assign({}, data, {id:uid(), createdAt:Date.now(), uses:0})); toast('Animation added to library'); }
  save(); closeModal(); render();
};

$('#search').oninput = e => { filter.q = e.target.value; renderGrid(); };
$('#sortBy').onchange = e => { filter.sort = e.target.value; renderGrid(); };

$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(items,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'animation-library.json'; a.click();
  URL.revokeObjectURL(a.href);
};
$('#importBtn').onclick = () => $('#importFile').click();
$('#importFile').onchange = e => {
  const file = e.target.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      const incoming = JSON.parse(r.result);
      if(!Array.isArray(incoming)) throw new Error('bad');
      const seen = new Set(items.map(a=>a.url));
      const add = incoming.filter(a => a.url && !seen.has(a.url))
        .map(a => Object.assign({uses:0, createdAt:Date.now()}, a, {id:uid()}));
      items = items.concat(add); save(); render();
      toast('Imported ' + add.length + ' animation(s)');
    }catch(err){ toast('Invalid JSON file'); }
    e.target.value = '';
  };
  r.readAsText(file);
};
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

render();
