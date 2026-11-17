/* ============================================================
   main.js — behaviour shared by every page.
   Four small, independent pieces. Each one is a no-op if the
   markup it looks for isn't on the page.
   ============================================================ */
(function () {
  'use strict';

  /* --- 1. Nav hairline -------------------------------------
     The nav is borderless at the top of the page and grows a
     hairline once you scroll past it.                          */
  function stickyNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    function update() { nav.classList.toggle('stuck', window.scrollY > 12); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* --- 2. Reveal on scroll ----------------------------------
     Anything with .rv fades up once, the first time it enters
     the viewport. CSS disables the motion entirely when the
     visitor prefers reduced motion, so this stays a class flip. */
  var revealObserver = null;

  function revealAll() {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  /* Watch every .rv that hasn't fired yet. Safe to call again after new
     markup appears — the preview bundle uses it when swapping pages. */
  function observeReveals() {
    if (!revealObserver) return revealAll();
    document.querySelectorAll('.rv:not(.in)').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function revealOnScroll() {
    if (!document.querySelector('.rv')) return;

    if (!('IntersectionObserver' in window)) return revealAll();

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });

    observeReveals();
  }

  /* --- 3. Video autoplay ------------------------------------
     autoplay is unreliable: some browsers refuse until the
     element is on screen, some until the data has loaded. Ask
     again at each of those moments and swallow the rejection. */
  function autoplayVideos() {
    var videos = [].slice.call(document.querySelectorAll('video[autoplay]'));
    if (!videos.length) return;

    function play(v) {
      var attempt = v.play();
      if (attempt && attempt.catch) attempt.catch(function () { /* browser said no */ });
    }

    videos.forEach(function (v) {
      v.addEventListener('loadeddata', function () { play(v); });
      play(v);
    });

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) play(entry.target); });
    }, { threshold: .25 });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* --- 4. Long-page scrollers -------------------------------
     Scroll a tall screenshot inside its frame, tied to where the
     frame is in the viewport: full size, no scroll-jacking, and
     the whole page read by the time you have scrolled past it.
     The position eases towards the scroll rather than snapping to
     it, which reads as a page settling rather than a jump cut.  */
  function pageScrollers() {
    var found = [].slice.call(document.querySelectorAll('.scroller'));
    if (!found.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var EASE = .18;          // how quickly the image catches up
    var items = found.map(function (frame) {
      frame.classList.add('live');
      return {
        frame: frame,
        image: frame.querySelector('img'),
        bar: frame.querySelector('.track span'),
        at: 0,
        to: 0
      };
    });

    /* 0 as the frame rises into view, 1 as it is leaving the top.
       The band is wider than the frame itself so the middle of the
       journey happens while the frame is fully on screen. */
    function aim() {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var box = it.frame.getBoundingClientRect();
        var from = vh * .78;
        var to = -box.height * .2;
        it.to = Math.min(1, Math.max(0, (from - box.top) / (from - to)));
      });
    }

    function draw(it) {
      var travel = it.image.offsetHeight - it.frame.clientHeight;
      if (travel > 0) {
        it.image.style.transform = 'translate3d(0,' + (-travel * it.at).toFixed(1) + 'px,0)';
      }
      if (it.bar) it.bar.style.width = (it.at * 100).toFixed(1) + '%';
    }

    var running = false;
    function tick() {
      var settling = false;
      items.forEach(function (it) {
        var gap = it.to - it.at;
        if (Math.abs(gap) < .0005) {
          it.at = it.to;
        } else {
          it.at += gap * EASE;
          settling = true;
        }
        draw(it);
      });
      running = settling;
      if (settling) requestAnimationFrame(tick);
    }

    function nudge() {
      aim();
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', nudge, { passive: true });
    window.addEventListener('resize', nudge);
    items.forEach(function (it) {
      if (it.image && !it.image.complete) it.image.addEventListener('load', nudge);
    });

    aim();
    items.forEach(function (it) { it.at = it.to; draw(it); });
  }

  /* --- 5. Before / after slider -----------------------------
     The visible split is driven by the --p custom property. The
     control is a real range input laid invisibly over the images,
     which is what makes it keyboard accessible — but a range only
     jumps to a click on its track in some browsers, so pointer
     events drive the drag directly and the input keeps the keys. */
  function compareSliders() {
    document.querySelectorAll('.ba-stage').forEach(function (stage) {
      var range = stage.querySelector('.ba-range');
      if (!range) return;

      function sync() { stage.style.setProperty('--p', range.value + '%'); }

      function follow(event) {
        var box = stage.getBoundingClientRect();
        var percent = ((event.clientX - box.left) / box.width) * 100;
        range.value = Math.min(100, Math.max(0, percent));
        sync();
      }

      stage.addEventListener('pointerdown', function (event) {
        stage.setPointerCapture(event.pointerId);
        follow(event);
      });
      stage.addEventListener('pointermove', function (event) {
        if (stage.hasPointerCapture(event.pointerId)) follow(event);
      });
      stage.addEventListener('pointerup', function (event) {
        stage.releasePointerCapture(event.pointerId);
      });

      range.addEventListener('input', sync);
      range.addEventListener('change', sync);
      sync();
    });
  }

  /* Small public hook, used by the single-file preview build. */
  window.portfolio = { reveal: observeReveals };

  stickyNav();
  revealOnScroll();
  autoplayVideos();
  pageScrollers();
  compareSliders();
})();
