/* ============================================================
   stickers.js — the stickers scattered behind the page, with a
   light parallax drift as you scroll. Purely decorative: every
   layer is aria-hidden, none of it takes pointer events, and CSS
   hides the lot below 1240px.

   Two kinds:
   1. Die-cut SVG shapes drawn here and placed by PLACEMENTS —
      the home page set. Edit PLACEMENTS to add or move one.
   2. Image stickers written straight into the page markup, as
      <div class="stk" data-left data-top data-width …><img></div>
      inside a <div class="stickers">. This file only positions
      them, so the picture stays where a picture belongs.
   ============================================================ */
(function () {
  'use strict';

  var NAVY   = '#12141C';
  var ORANGE = '#FF5A1F';
  var BLUE   = '#2B44D6';

  /* Every sticker is the same trick: draw the silhouette twice —
     once as a fat white stroke to cut it out of the background,
     then again in colour on top. `detail` is drawn last.        */
  function cut(silhouette, detail, fill) {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<g fill="none" stroke="#fff" stroke-width="26" stroke-linejoin="round" stroke-linecap="round">' + silhouette + '</g>'
      + '<g fill="' + (fill || '#fff') + '" stroke="' + NAVY + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">' + silhouette + '</g>'
      + (detail || '')
      + '</svg>';
  }

  var SHAPES = {
    nib: cut(
      '<path d="M60 8 L103 84 a46 46 0 0 1 -86 0 Z"/>',
      '<path d="M60 28 L60 74" fill="none" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round"/>'
      + '<circle cx="60" cy="86" r="11" fill="' + NAVY + '"/>'
    ),

    cursor: cut('<path d="M28 14 L104 58 L64 68 L48 106 Z"/>'),

    smiley: cut(
      '<circle cx="60" cy="60" r="52"/>',
      '<circle cx="60" cy="60" r="45" fill="none" stroke="' + BLUE + '" stroke-width="6"/>'
      + '<circle cx="60" cy="60" r="38" fill="' + ORANGE + '"/>'
      + '<circle cx="47" cy="52" r="5" fill="' + BLUE + '"/><circle cx="73" cy="52" r="5" fill="' + BLUE + '"/>'
      + '<path d="M44 70 q16 18 32 0" fill="none" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round"/>'
    ),

    comment: cut(
      '<path d="M24 24 h52 a14 14 0 0 1 14 14 v26 a14 14 0 0 1 -14 14 h-30 l-22 18 5-18 h-5 a14 14 0 0 1 -14 -14 v-26 a14 14 0 0 1 14 -14 z"/>'
      + '<circle cx="98" cy="36" r="18"/>',
      '<circle cx="98" cy="36" r="18" fill="' + NAVY + '"/>'
    ),

    sparkle: cut('<path d="M60 6 C67 40 80 53 114 60 C80 67 67 80 60 114 C53 80 40 67 6 60 C40 53 53 40 60 6 Z"/>'),

    sticky: cut(
      '<path d="M18 18 H102 V80 L82 102 H18 Z"/>',
      '<path d="M102 80 H82 V102 Z" fill="#EDD173" stroke="' + NAVY + '" stroke-width="7" stroke-linejoin="round"/>'
      + '<path d="M34 42 H82 M34 58 H82 M34 74 H64" fill="none" stroke="' + NAVY + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
      '#FBE38A'
    ),

    component: cut(
      '<circle cx="60" cy="60" r="50"/>',
      '<path d="M60 22 C70 44 76 50 98 60 C76 70 70 76 60 98 C50 76 44 70 22 60 C44 50 50 44 60 22 Z" fill="#B95FD6"/>'
      + '<path d="M50 58 q10 11 20 0" fill="none" stroke="' + NAVY + '" stroke-width="5" stroke-linecap="round"/>'
    ),

    calendar: cut(
      '<rect x="16" y="26" width="88" height="80" rx="8"/>'
      + '<rect x="34" y="10" width="10" height="26" rx="5"/><rect x="76" y="10" width="10" height="26" rx="5"/>',
      '<path d="M18 52 H102" fill="none" stroke="' + NAVY + '" stroke-width="6"/>'
      + '<circle cx="40" cy="70" r="5" fill="' + NAVY + '"/><circle cx="60" cy="70" r="5" fill="' + NAVY + '"/>'
      + '<circle cx="80" cy="70" r="5" fill="' + NAVY + '"/><circle cx="40" cy="88" r="5" fill="' + NAVY + '"/>'
      + '<circle cx="60" cy="88" r="7" fill="' + ORANGE + '" stroke="' + NAVY + '" stroke-width="4"/>'
    ),

    pin: cut(
      '<path d="M60 10 a36 36 0 0 1 36 36 c0 27 -36 64 -36 64 S24 73 24 46 A36 36 0 0 1 60 10 z"/>',
      '<circle cx="60" cy="45" r="13" fill="#fff" stroke="' + NAVY + '" stroke-width="6"/>',
      ORANGE
    ),

    clock: cut(
      '<circle cx="60" cy="60" r="46"/>',
      '<path d="M60 30 V62 L84 74" fill="none" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
    ),

    bell: cut(
      '<path d="M60 14 c-19 0 -31 15 -31 33 v20 c0 11 -5 17 -13 25 h88 c-8 -8 -13 -14 -13 -25 v-20 c0 -18 -12 -33 -31 -33 z"/>'
      + '<path d="M44 92 a16 16 0 0 0 32 0 z"/>',
      '<circle cx="94" cy="26" r="14" fill="' + ORANGE + '" stroke="' + NAVY + '" stroke-width="6"/>'
    ),

    envelope: cut(
      '<rect x="14" y="28" width="92" height="64" rx="6"/>',
      '<path d="M18 33 L60 66 L102 33" fill="none" stroke="' + NAVY + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>'
    ),

    moon: cut(
      '<path d="M68 10 a50 50 0 1 0 42 76 A40 40 0 1 1 68 10 Z"/>',
      '',
      '#FBE38A'
    ),

    heart: cut(
      '<path d="M60 102 C24 78 14 56 24 40 C34 24 52 26 60 42 C68 26 86 24 96 40 C106 56 96 78 60 102 Z"/>',
      '',
      ORANGE
    ),

    people: cut(
      '<circle cx="44" cy="42" r="16"/><path d="M18 94 a26 26 0 0 1 52 0 z"/>'
      + '<circle cx="80" cy="46" r="14"/><path d="M56 94 a24 24 0 0 1 48 0 z"/>',
      '<circle cx="80" cy="46" r="14" fill="#6E7BE8" stroke="' + NAVY + '" stroke-width="6"/>'
      + '<path d="M56 94 a24 24 0 0 1 48 0 z" fill="#6E7BE8" stroke="' + NAVY + '" stroke-width="6" stroke-linejoin="round"/>'
    ),

    frame: cut(
      '<rect x="20" y="20" width="80" height="80" rx="8"/>',
      '<rect x="36" y="36" width="48" height="48" fill="none" stroke="' + NAVY + '" stroke-width="5" stroke-dasharray="9 8"/>'
    ),

    layers: cut(
      '<rect x="30" y="26" width="60" height="15" rx="4"/><rect x="27" y="44" width="60" height="15" rx="4"/>'
      + '<rect x="24" y="62" width="60" height="15" rx="4"/><rect x="21" y="80" width="60" height="15" rx="4"/>',
      '<rect x="30" y="26" width="60" height="15" rx="4" fill="' + ORANGE + '" stroke="' + NAVY + '" stroke-width="6"/>'
      + '<rect x="27" y="44" width="60" height="15" rx="4" fill="#F5C542" stroke="' + NAVY + '" stroke-width="6"/>'
      + '<rect x="24" y="62" width="60" height="15" rx="4" fill="#5EC08A" stroke="' + NAVY + '" stroke-width="6"/>'
      + '<rect x="21" y="80" width="60" height="15" rx="4" fill="#6E7BE8" stroke="' + NAVY + '" stroke-width="6"/>'
    )
  };

  /* Where each sticker goes.
     host    — the section it belongs to
     shape   — a key of SHAPES, or 'word:<text>' for a word sticker
     edge    — {l: '…'} or {r: '…'}, a percentage from that side
     top     — percentage down the host
     size    — px width (ignored by word stickers)
     rotate  — degrees
     drift   — parallax speed; negative moves against the scroll  */
  var PLACEMENTS = [
    { host: '.hero',   shape: 'nib',           edge: { l: '3.5%' }, top: '26%', size: 74, rotate: -14, drift:  .10 },
    { host: '.hero',   shape: 'smiley',        edge: { r: '4%'   }, top: '17%', size: 76, rotate:  10, drift: -.13 },
    { host: '.hero',   shape: 'cursor',        edge: { r: '7%'   }, top: '64%', size: 62, rotate:  -6, drift:  .08 },
    { host: '.hero',   shape: 'word:ship it',  edge: { l: '5%'   }, top: '68%', size:  0, rotate:  -8, drift: -.09 },
    { host: '#about',  shape: 'component',     edge: { r: '2.5%' }, top: '12%', size: 66, rotate:  12, drift:  .11 },
    { host: '#about',  shape: 'word:0 → 1',    edge: { l: '2%'   }, top: '62%', size:  0, rotate:   7, drift: -.08 },
    { host: '#work',   shape: 'layers',        edge: { l: '2.5%' }, top: '14%', size: 70, rotate:  -9, drift:  .09 },
    { host: '#work',   shape: 'sticky',        edge: { r: '3%'   }, top: '46%', size: 64, rotate:  11, drift: -.10 },
    { host: '#work',   shape: 'frame',         edge: { l: '3%'   }, top: '74%', size: 58, rotate:   8, drift:  .12 }
  ];

  var WORD_TINTS = ['', 'tint', 'tint2'];

  function layerFor(host) {
    host.classList.add('has-stickers');
    var layer = host.querySelector('.stickers');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.className = 'stickers';
    layer.setAttribute('aria-hidden', 'true');
    host.insertBefore(layer, host.firstChild);
    return layer;
  }

  /* Position the stickers that came in with the markup. Their
     placement lives on the element as data-* so the values sit
     next to the picture they belong to. */
  function place() {
    document.querySelectorAll('.stickers > .stk[data-top]').forEach(function (el) {
      var d = el.dataset;
      if (d.shape && SHAPES[d.shape]) el.innerHTML = SHAPES[d.shape];
      if (d.word) { el.classList.add('word'); el.textContent = d.word; }
      if (d.left) el.style.left = d.left;
      if (d.right) el.style.right = d.right;
      el.style.top = d.top;
      if (d.width) el.style.width = d.width + 'px';
      el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
      el.dataset.rotate = d.rotate || 0;
      el.dataset.drift = d.drift || 0;
      layerFor(el.parentElement.parentElement);
    });
  }

  function build() {
    PLACEMENTS.forEach(function (p, i) {
      var host = document.querySelector(p.host);
      if (!host) return;

      var el = document.createElement('div');
      el.className = 'stk';

      if (p.shape.indexOf('word:') === 0) {
        el.className += ' word ' + WORD_TINTS[i % 3];
        el.textContent = p.shape.slice(5);
      } else {
        if (!SHAPES[p.shape]) return;
        el.style.width = p.size + 'px';
        el.innerHTML = SHAPES[p.shape];
      }

      if (p.edge.l) el.style.left = p.edge.l;
      else          el.style.right = p.edge.r;
      el.style.top = p.top;
      el.style.transform = 'rotate(' + p.rotate + 'deg)';
      el.dataset.rotate = p.rotate;
      el.dataset.drift  = p.drift;

      layerFor(host).appendChild(el);
    });
  }

  /* Parallax: offset each sticker by how far the middle of the
     viewport is from its anchor. The anchor is the middle of the
     section it sits in — or, where the host is a whole page and
     that middle would be thousands of pixels away, the sticker's
     own resting position (data-anchor="self").                  */
  function parallax() {
    var items = [];

    function measure() {
      items = [].slice.call(document.querySelectorAll('.stk')).map(function (el) {
        var layer = el.parentElement;
        var host = layer.parentElement;
        var middle = el.dataset.anchor === 'self'
          ? host.offsetTop + el.offsetTop + el.offsetHeight / 2
          : host.offsetTop + host.offsetHeight / 2;
        return {
          el: el,
          rotate: +el.dataset.rotate,
          drift: +el.dataset.drift,
          middle: middle
        };
      });
    }

    function frame() {
      var centre = window.scrollY + window.innerHeight / 2;
      items.forEach(function (it) {
        var y = (centre - it.middle) * it.drift;
        it.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) rotate(' + it.rotate + 'deg)';
      });
    }

    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { frame(); queued = false; });
    }, { passive: true });

    window.addEventListener('resize', function () { measure(); frame(); });
    setTimeout(function () { measure(); frame(); }, 60);
  }

  build();
  place();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) parallax();
})();
