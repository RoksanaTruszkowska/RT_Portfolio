/* ============================================================
   story.js — case study interactions.
   Reveal on scroll, the image lightbox, and the deep-dive
   stepper (buttons, dots and arrow keys).
   ============================================================ */
(function () {
  'use strict';

  /* reveal */
  var rv = [].slice.call(document.querySelectorAll('.s-rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* lightbox */
  var box = document.createElement('div');
  box.className = 's-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Enlarged image');
  box.innerHTML = '<img alt=""><button type="button" aria-label="Close">×</button>';
  document.body.appendChild(box);
  var boxImg = box.querySelector('img'), boxBtn = box.querySelector('button'), lastFocus = null;
  function openBox(img) {
    lastFocus = document.activeElement;
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    box.classList.add('open');
    boxBtn.focus();
  }
  function closeBox() { box.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
  box.addEventListener('click', closeBox);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) closeBox(); });
  document.querySelectorAll('.s-zoom').forEach(function (btn) {
    btn.addEventListener('click', function () { openBox(btn.parentNode.querySelector('img')); });
  });

  /* deep-dive stepper */
  document.querySelectorAll('.s-deep').forEach(function (deep) {
    var shots = [].slice.call(deep.querySelectorAll('.s-shot'));
    var dots = [].slice.call(deep.querySelectorAll('.s-dots button'));
    var prev = deep.querySelector('[data-prev]'), next = deep.querySelector('[data-next]');
    var n = deep.querySelector('.s-step-n'), t = deep.querySelector('.s-step-title'), b = deep.querySelector('.s-step-body');
    var i = 0;
    function show(k) {
      i = Math.max(0, Math.min(shots.length - 1, k));
      shots.forEach(function (s, j) {
        s.classList.toggle('on', j === i);
        var v = s.querySelector('video');
        if (v) { if (j === i) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
      });
      dots.forEach(function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      n.textContent = 'Step ' + String(i + 1).padStart(2, '0') + ' of ' + String(shots.length).padStart(2, '0');
      t.textContent = shots[i].dataset.title;
      b.textContent = shots[i].dataset.body;
      prev.disabled = i === 0;
      next.disabled = i === shots.length - 1;
    }
    prev.addEventListener('click', function () { show(i - 1); });
    next.addEventListener('click', function () { show(i + 1); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { show(j); }); });
    deep.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); }
    });
    show(0);
  });

  /* floating nav */
  var nav = document.getElementById('pnav');
  if (nav) {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      nav.classList.toggle('hidden', y > lastY && y > 120);
      lastY = y;
    }, { passive: true });
  }
})();
