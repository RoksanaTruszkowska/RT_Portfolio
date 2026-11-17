/* Floating pill nav: hides on scroll down, returns on scroll up. */
(function () {
  var nav = document.getElementById('pnav');
  if (!nav) return;
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('hidden', y > lastY && y > 120);
    lastY = y;
  }, { passive: true });
})();
