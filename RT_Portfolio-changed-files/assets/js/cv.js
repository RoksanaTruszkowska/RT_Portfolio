// CV download for every page that mentions the CV.
// Links look like: <a href="cv.pdf" data-cv download>cv</a> (path relative to the page).
// Inside the Claude artifact viewer we save through the downloads capability;
// on a normal host the link's own download attribute does the work.
(function () {
  var NAME = 'Roksana-Truszkowska-CV.pdf';
  var api = null;
  try {
    if (window.claude && window.claude.use) api = window.claude.use('downloads').catch(function () { return null; });
  } catch (e) { api = null; }

  function plain(href) {
    var a = document.createElement('a');
    a.href = href; a.download = NAME;
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function download(e) {
    var el = e.currentTarget;
    var href = el.getAttribute('data-cv-src') || el.getAttribute('href') || 'cv.pdf';
    if (!api) return; // let the browser follow the link with its download attribute
    e.preventDefault();
    var dl = await api;
    if (!dl) { plain(href); return; }
    try {
      var res = await fetch(href);
      if (!res.ok) throw new Error('missing');
      await dl.save({ filename: NAME, data: await res.blob() });
    } catch (err) {
      if (!(err && err.code === 'declined')) plain(href);
    }
  }

  document.querySelectorAll('a[data-cv]').forEach(function (el) { el.addEventListener('click', download); });
})();
