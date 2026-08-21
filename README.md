# Roksana Truszkowska — portfolio

Static site. No build step, no dependencies, no framework. Edit the files, refresh the
browser. Deploy by uploading this folder as-is.

## Structure

```
index.html                  home — hero, the many hats, work, quotes
work/portal-blocks.html     case study 1
work/notifications.html     case study 2
work/events.html            case study 3
work/communities.html       case study 4
tools/bundle.py             builds a single-file version of the whole site
assets/
  css/tokens.css            colour, type, spacing — change values here first
  css/base.css              reset, headings, body copy, links
  css/layout.css            .wrap, nav, hero, sections, grids, footer
  css/components.css        sticky notes, quotes, media, before/after, stickers
  css/case-study.css        case-study page shape: hero, meta, beats, reflection
  js/main.js                nav hairline, reveal on scroll, video autoplay,
                            long-page scrollers, compare slider
  js/stickers.js            positions the scattered stickers and their parallax
  img/stickers/             the image stickers used on the Portal Blocks case study
  img/cards/                the animated loops on the home page work cards
  img/<project>/            screenshots, per case study
  video/                    four demos, each .webm + .mp4 + a poster frame
```

## Editing

**Copy and images** live in the HTML. Each case study is one file, top to bottom in
reading order, so the story is editable as prose.

**Anything visual** starts in `assets/css/tokens.css`. Colours, fonts, sizes, gutters and
measures are all custom properties; nothing downstream hard-codes them.

**Repeated pieces** — the nav and the footer — appear in all five pages. Changing a link
means changing it five times. That is the one cost of having no build step, and it is
cheaper than the alternative for a site this size.

## The long-page scroller

Full-page screenshots are thousands of pixels tall and unreadable once shrunk into a column.
Wrap one like this and it gets framed as a window instead — the page scrolls inside the frame
as you scroll past it, at a size you can read, with a hairline along the bottom tracking how
far through you are:

```html
<div class="scroller">
  <img src="../assets/img/blocks/campaign-page.webp" alt="…">
  <div class="track"><span></span></div>
</div>
```

No `class="shot"` on the image — the frame carries the border. The effect is an enhancement:
without JavaScript, or with reduced motion on, the frame never activates and the whole image
is shown as it was. It's used on the Templates beat of Portal Blocks and works on any tall
image you want to give the same treatment.

## Stickers and the grid

Two kinds of sticker, both decorative, both `aria-hidden`, both hidden below 1240px:

- **Home** — die-cut SVG shapes drawn in `assets/js/stickers.js`. Edit the `PLACEMENTS`
  array to move one or add another.
- **Portal Blocks** — image stickers written into the page markup, so the picture lives with
  the page rather than inside a script:

  ```html
  <div class="stk" data-left="3%" data-top="30%" data-width="86"
       data-rotate="-8" data-drift=".09" data-anchor="self">
    <img src="../assets/img/stickers/stack.webp" alt="">
  </div>
  ```

  `data-drift` is the parallax speed — negative drifts against the scroll. `data-anchor="self"`
  means the drift is measured from the sticker's own resting position, which is what you want
  when the host is a whole page rather than one section.

The faint square grid is the `cs-grid` class on that page's `<main>`. It runs across the title
and the demo video, then dissolves — the grid is drawn on a pseudo-element and masked with a
gradient, so it fades on its own without touching the content sitting over it. Three tokens in
`tokens.css` control it: `--grid-line` (colour), `--grid-cell` (square size) and `--grid-depth`
(how far down the page it reaches before it is gone). Put it on any page by adding the class.

## House rules

Carried over from the original design, and worth keeping:

- Pure white, monochrome UI. The work supplies the colour; the interface doesn't.
- Flat. No shadows and no rounded corners, except on the sticky notes, which are paper.
- Structure comes from 1px hairlines (`--line`) and whitespace. Not from boxes.
- Two fonts only: Bricolage Grotesque for headings, Poppins 300 for body.
- Everything that moves respects `prefers-reduced-motion`.

## Media

Videos are dual-source: WebM first, MP4 second, because some Chromium builds ship without
H.264. Keep both when replacing one. The home page work cards are **animated WebP**, not
video — link preview panes block video autoplay, and animated images were the only
reliable way to make the cards move.

To replace an image, drop the new file over the old one at the same path. To add one, put
it in the folder for its case study and reference it relatively.

## Still to fill in

The dotted markers on the page (`<span class="gap">…</span>`) and the dashed panels
(`<div class="todo">`) are deliberate placeholders. Delete each one as it is answered:

- Job title confirmation, project durations, research sample sizes, block count at launch.
- Two more quotes: an engineer on craft and shipping, a PM on shaping work upstream.
- The Head of Design's name against the existing quote.
- Post-launch numbers for Notifications and Communities.
- OneBanx case study — the card and its "under construction" panel are on the home page.
- "Happening now" / "event has ended" screenshots, supplied but not yet placed.

## One-file build

`python3 tools/bundle.py` inlines every stylesheet, script and media file and turns the five
pages into five swappable views, writing `dist/portfolio-single.html` — one file, ~11.8 MB, that
works with no server and can be emailed or attached. `--artifact` writes the same page without
the `<!DOCTYPE>`/`<head>`/`<body>` wrapper, for hosts that supply their own.

The folder remains the source. Rebuild the bundle after any edit; never edit `dist/` by hand.

## Local preview

Open `index.html` in a browser. That's it — everything is relative. If you'd rather serve
it (closer to production), run `python3 -m http.server` in this folder.
