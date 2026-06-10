/* ============================================================
   Rise-up reveal engine — wraps targets and plays them on view.
   Mask-rise for headings, fade-rise for supporting content.
   Excludes the interactive widgets (why-slider, accreditation,
   lead form, nav) so their own animations stay intact.
   ============================================================ */
(function () {
  var EXCLUDE = '#why-slides, #accreditation .awards-media, #lead, .nav';
  function excluded(el) { return !!el.closest(EXCLUDE); }

  // Headings → masked rise (text slides up from behind a clip)
  var MASK = ['.hero h1', '.sec-head h2', '.why-head h2', '.footer-cta h2', '.adv-head h2'];
  // Supporting content → fade rise
  var FADE = [
    '.eyebrow', '.hero-badge', '.hero-sub', '.hero-cta', '.hero-rating',
    '.sec-head p', '.why-head p', '.stat', '.fc-sub', '.fc-actions',
    '.aw-item', '.cat-card', '.testi-card', '.adv-head .adv-sub', '.adv-card',
    '.founder-quote', '.founder-sign', '.founder-media',
    '.contact-aside', '.contact-form'
  ];

  function uniq(sel) {
    var out = [], seen = new Set();
    sel.forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) {
        if (!seen.has(el) && !excluded(el)) { seen.add(el); out.push(el); }
      });
    });
    return out;
  }

  function wrapMask(el) {
    if (el.dataset.rise) return;
    el.dataset.rise = '1';
    var span = document.createElement('span');
    span.className = 'rise-i';
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
    el.classList.add('rise');
    el.classList.remove('reveal'); // mask is the sole effect now
  }

  function group(el) {
    return el.closest('section, header, footer, .wrap') || document.body;
  }

  var items = [];
  uniq(MASK).forEach(function (el) { wrapMask(el); items.push(el); });
  uniq(FADE).forEach(function (el) {
    if (el.dataset.rise) return;
    el.dataset.rise = '1';
    el.classList.add('r-up');
    el.classList.remove('reveal');
    items.push(el);
  });

  // Stagger: order within each shared group container
  var byGroup = new Map();
  items.forEach(function (el) {
    var g = group(el);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(el);
  });
  byGroup.forEach(function (els) {
    els.sort(function (a, b) {
      return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });
    els.forEach(function (el, i) { el.style.setProperty('--rd', Math.min(i * 85, 510) + 'ms'); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
  items.forEach(function (el) { io.observe(el); });

  // text is now wrapped & hidden by transform — lift the anti-flash gate
  document.documentElement.classList.remove('pre-anim');
})();
