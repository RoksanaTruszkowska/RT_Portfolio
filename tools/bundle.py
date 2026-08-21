#!/usr/bin/env python3
"""Assemble the site into ONE self-contained HTML file.

The folder stays the source of truth. This is for the cases a folder can't
go: emailing the portfolio, opening it with no server, or publishing it as a
single hosted page. Every stylesheet, script and media file is inlined, and
the five pages become five views swapped by a small router.

    python3 tools/bundle.py                 -> dist/portfolio-single.html
    python3 tools/bundle.py --artifact      -> dist/portfolio-artifact.html
                                               (no doctype/head/body wrapper)
"""
import base64, mimetypes, os, re, sys
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [                       # file, view id, is home
    ('index.html',              'home',          True),
    ('work/portal-blocks.html', 'blocks',        False),
    ('work/notifications.html', 'notifications', False),
    ('work/events.html',        'events',        False),
    ('work/communities.html',   'communities',   False),
]
VIEW_OF_FILE = {os.path.basename(f): v for f, v, _ in PAGES}

CSS = ['tokens', 'base', 'layout', 'components', 'case-study']
JS  = ['main', 'stickers']

VIEW_CSS = """
/* --- single-file build: five pages become five views ------------ */
.view { display: none; }
.view.on { display: block; }
"""

ROUTER = """
/* --- single-file build: swap views instead of loading pages ----- */
(function () {
  'use strict';
  var VIEWS = ['home', 'blocks', 'notifications', 'events', 'communities'];

  function show(view, hash) {
    if (VIEWS.indexOf(view) < 0) view = 'home';
    VIEWS.forEach(function (v) {
      document.getElementById('v-' + v).classList.toggle('on', v === view);
    });
    window.scrollTo(0, 0);
    if (window.portfolio) window.portfolio.reveal();
    // The view that was hidden had no measurable geometry; let the
    // sticker parallax re-measure now that it does.
    window.dispatchEvent(new Event('resize'));
    if (hash) {
      var target = document.querySelector('#v-' + view + ' ' + hash);
      if (target) setTimeout(function () { target.scrollIntoView(); }, 40);
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-view]');
    if (!link) return;
    e.preventDefault();
    show(link.dataset.view, link.dataset.hash || '');
  });
})();
"""


def read(rel):
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()


def data_uri(rel_from_page, page_dir):
    path = os.path.normpath(os.path.join(ROOT, page_dir, rel_from_page))
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    with open(path, 'rb') as fh:
        return f'data:{mime};base64,' + base64.b64encode(fh.read()).decode()


def inline_media(view, page_dir, webm_only=False):
    if webm_only:
        # The hosted single page has a 16MB ceiling. Inlining both encodes of
        # every video doubles the video payload for no benefit there, so the
        # artifact build keeps the WebM and drops the MP4 fallback. The folder
        # and the standalone file keep both.
        for source in view.select('video source[type="video/mp4"]'):
            source.decompose()

    for el in view.find_all(['img', 'video', 'source']):
        for attr in ('src', 'poster'):
            val = el.get(attr, '')
            if val and not val.startswith('data:'):
                el[attr] = data_uri(val, page_dir)


def rewrite_links(scope, fragments_to_home=False):
    """index.html / work/*.html hrefs become router hooks.

    fragments_to_home: the nav is lifted from index.html, where "Work" and
    "About" are plain #fragments. In the bundle they have to switch to the
    home view first, then scroll."""
    for a in scope.find_all('a', href=True):
        href = a['href']
        if href.startswith('#') and len(href) > 1 and fragments_to_home:
            a['data-view'] = 'home'
            a['data-hash'] = href
            a['href'] = '#'
            continue
        if href.startswith(('mailto:', 'http', '#')):
            continue
        path, _, hash_ = href.partition('#')
        name = os.path.basename(path)
        if name not in VIEW_OF_FILE:
            continue
        a['data-view'] = VIEW_OF_FILE[name]
        if hash_:
            a['data-hash'] = '#' + hash_
        a['href'] = '#'


def build(artifact=False):
    body, nav_html = [], None

    for rel, view_id, is_home in PAGES:
        soup = BeautifulSoup(read(rel), 'html.parser')
        page_dir = os.path.dirname(rel)

        if nav_html is None:
            nav = soup.find('nav')
            rewrite_links(nav, fragments_to_home=True)
            nav_html = str(nav)

        view = soup.find('main', id='content')
        view['id'] = 'v-' + view_id
        view['class'] = view.get('class', []) + (['view', 'on'] if is_home else ['view'])
        rewrite_links(view)
        inline_media(view, page_dir, webm_only=artifact)
        body.append(str(view))

    css = '\n'.join(read(f'assets/css/{n}.css') for n in CSS) + VIEW_CSS
    js = '\n'.join(read(f'assets/js/{n}.js') for n in JS) + ROUTER

    head = f'''<title>Roksana Truszkowska</title>
<meta name="description" content="Product designer working across enterprise B2B SaaS and consumer fintech: design systems, flagship platform features, and AI.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500&family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
{css}
</style>'''

    content = (head + '\n\n<a class="skip" href="#v-home">Skip to content</a>\n\n'
               + nav_html + '\n\n' + '\n\n'.join(body)
               + f'\n\n<script>\n{js}\n</script>\n')

    if artifact:
        return content
    return ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            + content.replace('<a class="skip"', '</head>\n<body>\n<a class="skip"', 1)
            + '</body>\n</html>\n')


if __name__ == '__main__':
    artifact = '--artifact' in sys.argv
    out = os.path.join(ROOT, 'dist',
                       'portfolio-artifact.html' if artifact else 'portfolio-single.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    html = build(artifact)
    open(out, 'w', encoding='utf-8').write(html)
    print(f'{out}  {len(html.encode()) / 1e6:.1f} MB')
