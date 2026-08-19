# AnimLib Studio

A team dashboard for animation storage **+ a Pomelli-style landing page generator**.
Store every animation your team uses, fill in the client's brand kit, assign an animation to each
page section — and the dashboard builds a live landing page preview on localhost.

## Run locally

    npm start        # or: node server.js

Then open **http://localhost:5173**. No dependencies, no build step.


## Guided flow (for non-technical users)

A 3-step tracker sits at the top of every view, and each view ends with a call-to-action bar
telling you exactly what to do next:

1. **Add your animations** — "+ Import Link", paste the link, say where it will be used → *Step 2: Add brand details →*
2. **Add brand details** — name, logo, colours, headline, button text → *Step 3: Build my landing page →*
3. **Build & preview the page** — pick an animation per section → **▶ Generate landing page preview** opens the
   finished page in a new tab, or **Download page file** saves it.

A dismissible "Make a landing page in 3 steps" card explains the process on first visit.
Completed steps get a green tick, and any step can be clicked to jump straight to it.

## The three views

### 🎬 Animation Library
- **+ Import Link** — paste any animation URL (type auto-detected: Lottie / GIF / Video / SVG / Rive / CSS-JS)
- Sidebar filters by **section** (Hero, Loader, Onboarding, Empty State, Footer, …) and by type
- Live previews, search, sort, tags, project, added-by, notes
- **Copy link** (usage counter), edit, delete
- **Export / Import JSON** — how the team shares one library

### 🎨 Brand Kit
Client information that drives the generated page: brand name, tagline, logo URL, primary &
accent colors, light/dark theme, font, corner radius, hero headline, sub-text, CTA label, industry.
A live brand card previews it as you type.

### 🧩 Page Builder
10 page slots — **Preloader, Header, Hero, Hero background, Features, Showcase/About, Stats band,
Testimonials, CTA band, Footer**. For each slot pick an animation from the library, choose its size
and whether it loops. The right pane renders the **full generated landing page** in an iframe with
Desktop / Tablet / Mobile widths.

- **Open full page ↗** — the generated page in a new tab
- **Download HTML** — one self-contained `.html` file (brand CSS + your animation links) to hand to
  development, or drop back into this folder and serve it at `http://localhost:5173/<file>.html`


### Preview inside your own landing page
In **Page Builder** switch the dropdown to **My own landing page** (or click **Use my page…**) and either
upload your `.html` file or paste your page's HTML. The dashboard injects the animations you assigned and
renders the result — so you see them working in *your* real sections, not a demo template.

- **Automatic placement** — animations are matched to your `header`, `footer`, `.hero`, `.features`,
  `#about`, `.stats`, `.testimonials`, `.cta` / `#contact` elements.
- **Exact placement** — put an empty tag where you want each one:
  `<div data-anim="hero"></div>`. Valid names: `preloader, header, hero, background, features,
  showcase, stats, testimonials, cta, footer`. If your page has any marker, automatic placement is switched off.
- **Outline the animation spots** — a checkbox that draws a dashed border around every injected slot.
- Backgrounds (`background`, `cta`) are injected as a full-cover layer behind the section; the preloader
  becomes a full-screen overlay that fades after 1.8s.
- **Open full page / Download HTML** work the same, and export your page with the animations baked in.

Note: a live *URL* cannot be used — browsers block scripts from modifying another site's page. Save the page
(Ctrl+S) or copy its HTML and use that.

## Data
Everything lives in browser `localStorage`:
`animlib.items.v1` (library), `animlib.brand.v1` (brand kit), `animlib.layout.v1` (slot assignments).
Share via **Export / Import JSON**.

## Files
| File | Purpose |
|---|---|
| `index.html` | Layout for all three views |
| `styles.css` | Dashboard theme |
| `app.js` | Library: state, filters, cards, import/export |
| `studio.js` | Brand kit, page slots, landing-page generator |
| `server.js` | Zero-dependency static server (port 5173) |

## Customise
- Library sections → `SECTIONS` in `app.js`
- Page slots → `PAGE_SLOTS` in `studio.js`
- Generated page markup/CSS → `pageCSS()` and `buildPageHTML()` in `studio.js`
