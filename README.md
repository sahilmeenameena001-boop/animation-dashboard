# AnimLib — Team Animation Dashboard

A lightweight library/dashboard to store, tag and reuse animations (Lottie, GIF, video, SVG, Rive, CSS/JS) across our websites.

**Live:** enable GitHub Pages → Settings → Pages → Branch `main` / root.

## Features
- **Import Link** button — paste any animation URL, type is auto-detected
- **Sections** — tag where the animation is used (Hero, Loader, Onboarding, Empty State, Footer, …) and filter by them in the sidebar
- Filter by **type** (Lottie / GIF / Video / SVG / Rive / CSS-JS), search by name, tag, project or owner
- Live **previews** (Lottie player, video, GIF/SVG inline)
- Track **project / website**, **added by**, tags and notes per animation
- **Copy link** (counts usage), edit, delete
- **Export / Import JSON** — this is how the team shares the library

## Run
Just open `index.html`, or:

    npx serve .

## Data
Stored in browser `localStorage` (key `animlib.items.v1`) — per person, per browser.
To share with the team: **Export JSON** → commit the file / send it → teammates **Import JSON**.

## Files
- `index.html` — layout
- `styles.css` — dark UI theme
- `app.js` — state, filters, rendering, import/export

## Add a section
Edit the `SECTIONS` array at the top of `app.js`.
