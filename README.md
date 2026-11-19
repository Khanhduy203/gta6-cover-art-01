# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Khanhduy203/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Khanhduy203/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Sunset Poster is a fully offline, static web app that turns your own photos and a caption into bold multi-panel cover art in the style of a Vice City sunset poster — glowing sun, neon grade, chunky outlined lettering — exported as a PNG ready to share.

## What it does

- **Your photos, your panels** — load photos from your machine (file picker or drag-and-drop). Two free sample photos ship with the app so the editor is never empty.
- **Multi-panel poster layouts** — four layouts: a big hero panel over two small ones, a four-panel grid, a tall side strip, and a triple row. One photo can fill every panel, or each panel can hold a different photo.
- **Crop and position each photo** — click a panel to select it, drag inside the preview to pan the photo, and use the per-panel zoom slider.
- **Bold editable caption** — type your own main caption and subtitle, pick a lettering style (sunset gold, white hot, neon pink, neon aqua) and put the caption at the top or the bottom. The lettering is drawn with a thick outline and glow, poster-style.
- **Sunset grade and grain** — sliders tune the neon colour grade and the film grain over the whole poster.
- **One-click PNG export** — square 1080×1080, portrait 1080×1350, or wide 1920×1080, rendered on canvas and downloaded as a PNG.

## How it works

Everything runs locally in the browser: no build step, no network requests, no uploads. The cover is drawn on a `<canvas>` — a sunset sky gradient with a glowing sun, your photos cover-fitted into the panels with a warm overlay, a soft-light neon grade, vignette, grain, and the caption lettered on top.

- `app/index.html` — the editor page and controls
- `app/style.css` — the dark sunset editor theme
- `app/src/panels.js` — poster layouts, photo library, per-panel crop/zoom state
- `app/src/caption.js` — caption state and the bold outlined lettering
- `app/src/cover.js` — the cover renderer (sky, sun, panels, grade, grain)
- `app/src/export.js` — PNG export at the three post sizes, plus a full-screen cover view
- `app/src/main.js` — wiring: controls, panel list, drag-to-pan, file input, drag-and-drop
- `app/samples/` — two sample photos made with an image model, free to use

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Add photos, pick a layout, drag to frame each shot, write your caption, and hit **Export PNG**.

For a full-screen render of the finished cover (handy for screenshots), open `http://localhost:8080/?shot=export`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rapid-kestrel-81&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
