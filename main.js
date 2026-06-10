/* ============================================================
   Main interactions: intro gate, nav scroll, scroll-reveal,
   course tab filter, footer year.
   ============================================================ */
(function () {
  /* ---- Intro gate ---- */
  const gate = document.getElementById('gate');
  const enter = document.getElementById('gate-enter');
  function dismiss() {
    if (!gate) return;
    gate.classList.add('gone');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setTimeout(() => gate && gate.remove(), 1000);
  }
  if (gate) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    enter && enter.addEventListener('click', dismiss);
    // safety: never trap the user
    setTimeout(() => { if (gate && !gate.classList.contains('gone')) {/* keep until click */} }, 12000);
  }

  /* ---- Nav scroll state ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---- Course tab filter ---- */
  const tabs = document.querySelectorAll('.course-tab');
  const cards = document.querySelectorAll('.course-card');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      cards.forEach((c) => {
        const show = cat === 'all' || c.getAttribute('data-cat') === cat;
        c.style.transition = 'opacity .4s, transform .4s';
        if (show) { c.style.display = ''; requestAnimationFrame(() => { c.style.opacity = '1'; c.style.transform = 'none'; }); }
        else { c.style.opacity = '0'; c.style.transform = 'scale(.96)'; setTimeout(() => { c.style.display = 'none'; }, 300); }
      });
    });
  });

  /* ---- Awarding bodies: auto-advancing sequence (progress fills, then next) ---- */
  const awSection = document.getElementById('accreditation');
  if (awSection) {
    const items = [...awSection.querySelectorAll('.aw-item')];
    const panels = [...awSection.querySelectorAll('.aw-panel')];
    const DUR = 5000; // keep in sync with --aw-dur in sections.css
    let active = 0, timer = null, running = false;

    function show(i) {
      active = i;
      items.forEach((el, n) => el.classList.toggle('active', n === i));
      panels.forEach((el, n) => el.classList.toggle('active', n === i));
      // restart the underline fill animation
      const line = items[i].querySelector('.ai-line i');
      if (line) { line.style.animation = 'none'; void line.offsetWidth; line.style.animation = ''; }
    }
    function schedule() {
      clearTimeout(timer);
      if (running) timer = setTimeout(() => show2((active + 1) % items.length), DUR);
    }
    function show2(i) { show(i); schedule(); }
    function start() { if (running) return; running = true; show(active); schedule(); }
    function stop() { running = false; clearTimeout(timer); }

    // hover a body → pause auto-advance and preview its panel; resume on leave
    items.forEach((el, n) => {
      el.addEventListener('mouseenter', () => { clearTimeout(timer); show(n); });
      el.addEventListener('mouseleave', () => { if (running) schedule(); });
    });

    // only run while the section is on screen
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.25 });
    io.observe(awSection);
  }

  /* ---- Why Study With Us: testimonial-style slider ---- */
  const whyStage = document.getElementById('why-stage');
  if (whyStage) {
    const slides = [...whyStage.querySelectorAll('.why-slide')];
    const dots = [...whyStage.querySelectorAll('.why-dot')];
    const curEl = document.getElementById('why-cur');
    const bgEl = document.getElementById('why-bg-no');
    const total = slides.length;
    const DUR = 4000; // keep in sync with --why-dur
    let cur = 0, timer = null, running = false;

    function render(i, dir) {
      const prev = cur; cur = (i + total) % total;
      slides.forEach((s, n) => {
        s.classList.remove('active', 'leaving');
        if (n === cur) s.classList.add('active');
        else if (n === prev && prev !== cur) s.classList.add('leaving');
      });
      dots.forEach((d, n) => {
        d.classList.toggle('active', n === cur);
        d.classList.remove('run');
      });
      const lbl = '0' + (cur + 1);
      curEl.textContent = lbl; bgEl.textContent = lbl;
      // restart the active dot's fill
      if (running) { const ad = dots[cur]; void ad.offsetWidth; ad.classList.add('run'); }
    }
    function next() { render(cur + 1); schedule(); }
    function schedule() { clearTimeout(timer); if (running) timer = setTimeout(next, DUR); }
    function start() {
      if (running) return;
      running = true;
      // replay the current slide's entrance animation so content animates on arrival
      const s = slides[cur];
      s.classList.remove('active'); void s.offsetWidth; s.classList.add('active');
      // (re)start the progress-fill on the active dot
      const d = dots[cur];
      d.classList.remove('run'); void d.offsetWidth; d.classList.add('run');
      schedule();
    }
    function stop() { running = false; clearTimeout(timer); dots.forEach((d) => d.classList.remove('run')); }
    function goManual(i) { render(i); if (running) { schedule(); dots[cur].classList.remove('run'); void dots[cur].offsetWidth; dots[cur].classList.add('run'); } }

    document.getElementById('why-next').addEventListener('click', () => goManual(cur + 1));
    document.getElementById('why-prev').addEventListener('click', () => goManual(cur - 1));
    dots.forEach((d, n) => d.addEventListener('click', () => goManual(n)));

    // keyboard when focused
    whyStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goManual(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goManual(cur - 1); }
    });

    // drag / swipe
    let down = false, sx = 0;
    const slidesWrap = document.getElementById('why-slides');
    slidesWrap.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; });
    window.addEventListener('pointerup', (e) => {
      if (!down) return; down = false;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 60) goManual(dx < 0 ? cur + 1 : cur - 1);
    });

    // pause on hover, run only while in view
    whyStage.addEventListener('mouseenter', () => { if (running) { clearTimeout(timer); dots[cur].classList.remove('run'); } });
    whyStage.addEventListener('mouseleave', () => { if (running) { schedule(); void dots[cur].offsetWidth; dots[cur].classList.add('run'); } });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    io.observe(whyStage);
  }

  /* ---- Nav "More" dropdown (hover via CSS; click/tap toggle for touch) ---- */
  const moreWrap = document.querySelector('.nav-more');
  const moreBtn = document.getElementById('nav-more-btn');
  if (moreWrap && moreBtn) {
    moreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const open = moreWrap.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!moreWrap.contains(e.target)) { moreWrap.classList.remove('open'); moreBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- Footer reveal: page lifts away to expose the pinned footer ---- */
  const pageMain = document.getElementById('page-main');
  const siteFooter = document.getElementById('site-footer');
  if (pageMain && siteFooter) {
    let fH = 0, engaged = false;

    function engage(on) {
      engaged = on;
      if (on) {
        siteFooter.style.position = 'fixed';
        pageMain.style.marginBottom = fH + 'px';
        pageMain.style.boxShadow = '0 40px 80px -20px rgba(11,17,50,.35)';
      } else {
        siteFooter.style.position = 'relative';
        pageMain.style.marginBottom = '0px';
        pageMain.style.boxShadow = 'none';
        siteFooter.style.setProperty('--reveal-rise', '0px');
      }
    }

    function measure() {
      fH = siteFooter.offsetHeight;
      // only pin-reveal when the footer comfortably fits the viewport,
      // otherwise the marquee at its top would scroll out of sight.
      const shouldEngage = window.innerWidth > 900 && fH <= window.innerHeight - 8;
      if (shouldEngage !== engaged) engage(shouldEngage);
      else if (engaged) pageMain.style.marginBottom = fH + 'px';
    }

    function onScrollFooter() {
      if (!engaged) return;
      const scrolled = window.scrollY + window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const start = docH - fH;
      const p = Math.max(0, Math.min(1, (scrolled - start) / fH));
      const rise = Math.round((1 - p) * 56);
      siteFooter.style.setProperty('--reveal-rise', rise + 'px');
    }

    measure();
    onScrollFooter();
    window.addEventListener('scroll', onScrollFooter, { passive: true });
    window.addEventListener('resize', () => { measure(); onScrollFooter(); }, { passive: true });
    window.addEventListener('load', () => { measure(); onScrollFooter(); });
    setTimeout(() => { measure(); onScrollFooter(); }, 1200);

    // anchor links into the footer → scroll to the very bottom to reveal it
    document.querySelectorAll('a[href="#contact"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      });
    });
  }

  /* ---- Courses carousel (paged by arrows, right-aligned) ---- */
  (function () {
    var track = document.getElementById('adv-track');
    if (!track) return;
    var prev = document.getElementById('adv-prev');
    var next = document.getElementById('adv-next');
    var cards = [].slice.call(track.children);
    var gap = 24, index = 0;

    function perView() {
      var w = window.innerWidth;
      if (w <= 620) return 1;
      if (w <= 1080) return 2;
      return 3;
    }
    function maxIndex() { return Math.max(0, cards.length - perView()); }
    function step() {
      var cw = cards[0].getBoundingClientRect().width;
      return cw + gap;
    }
    function apply() {
      index = Math.min(index, maxIndex());
      track.style.transform = 'translateX(' + (-(index * step())) + 'px)';
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex();
    }
    next.addEventListener('click', function () { index = Math.min(index + perView(), maxIndex()); apply(); });
    prev.addEventListener('click', function () { index = Math.max(index - perView(), 0); apply(); });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(apply, 120); }, { passive: true });
    // recalc once fonts/layout settle
    setTimeout(apply, 60);
    window.addEventListener('load', apply);
  })();

  /* ---- Get in Touch: interest chips + form submit ---- */
  const cForm = document.getElementById('contact-form');
  if (cForm) {
    const chips = [].slice.call(cForm.querySelectorAll('.cf-chip'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active');
      });
    });
    const done = document.getElementById('cf-done');
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!cForm.checkValidity()) { cForm.reportValidity(); return; }
      const name = (cForm.querySelector('[name=name]').value || '').trim().split(' ')[0];
      const interest = (cForm.querySelector('.cf-chip.active') || {}).textContent;
      const msg = document.getElementById('cf-done-msg');
      if (msg) msg.textContent = 'Thanks' + (name ? ', ' + name : '') +
        " — we've noted your interest in " + (interest ? interest.replace(/&amp;/g, '&') : 'our courses') +
        ' and an advisor will reply within one working day.';
      done.classList.add('show');
    });
  }

  /* ---- Footer year ---- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Parallax dots in hero (subtle) ---- */
  const dotsWrap = document.querySelector('.hero-dots');
  if (dotsWrap && window.matchMedia('(hover: hover)').matches) {
    const items = dotsWrap.querySelectorAll('i');
    window.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      items.forEach((it, i) => {
        const d = (i % 3 + 1) * 8;
        it.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
    }, { passive: true });
  }
})();
