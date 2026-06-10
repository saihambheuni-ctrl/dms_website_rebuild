/* ============================================================
   Search overlay — opens from the nav search icon, filters a
   small index of pages / courses / awarding bodies live.
   ============================================================ */
(function () {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  const openBtn = document.getElementById('nav-search');
  const closeBtn = document.getElementById('search-close');
  const backdrop = document.getElementById('search-backdrop');
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  const suggestEl = document.getElementById('search-suggest');
  const tagsEl = document.getElementById('ss-tags');

  // Build the index from on-page content + known courses/bodies
  const index = [
    { kind: 'Page', title: 'Study at DMS', desc: 'Programmes & flagship qualifications', href: '#programmes' },
    { kind: 'Page', title: 'Why Study With Us', desc: 'The six pillars behind every learner', href: '#why' },
    { kind: 'Page', title: 'Student Stories', desc: 'Outcomes & acceptance letters', href: '#about' },
    { kind: 'Page', title: 'Accreditation', desc: 'Awarding organisations & regulatory bodies', href: '#accreditation' },
    { kind: 'Page', title: 'Contact admissions', desc: 'Funded places, start dates & guidance', href: '#contact' },
    { kind: 'Course', title: 'OTHM Level 3 Diploma in Business Studies', desc: 'Beginner · 6 Months · Business', href: '#programmes' },
    { kind: 'Course', title: 'OTHM Level 4 Diploma in Health & Social Care', desc: 'Intermediate · 9 Months · Health', href: '#programmes' },
    { kind: 'Course', title: 'NCC Level 3 Diploma in Computing', desc: 'Beginner · 6 Months · Computing', href: '#programmes' },
    { kind: 'Course', title: 'OTHM Level 4 Diploma in Digital Marketing', desc: 'Intermediate · 9 Months · Marketing', href: '#programmes' },
    { kind: 'Course', title: 'OTHM Level 5 Diploma in Business Management', desc: 'Advanced · 12 Months · Business', href: '#programmes' },
    { kind: 'Course', title: 'NCC Level 4 Diploma in Computing', desc: 'Intermediate · 9 Months · Computing', href: '#programmes' },
    { kind: 'Course', title: 'OTHM Level 4 Diploma in Health Management', desc: 'Intermediate · 9 Months · Health', href: '#programmes' },
    { kind: 'Course', title: 'OTHM Level 5 Diploma in Digital Marketing', desc: 'Advanced · 12 Months · Marketing', href: '#programmes' },
    { kind: 'Body', title: 'UK Register of Learning Providers', desc: 'UKPRN 10091640 · Verified provider', href: '#accreditation' },
    { kind: 'Body', title: 'OTHM Qualifications', desc: 'Ofqual regulated awarding organisation', href: '#accreditation' },
    { kind: 'Body', title: 'Focus Awards', desc: 'Ofqual regulated · Vocational & academic', href: '#accreditation' },
    { kind: 'Body', title: 'NCC Education', desc: 'Global progression awarding body', href: '#accreditation' },
    { kind: "Body", title: "Information Commissioner's Office", desc: 'ICO registered · Data protection', href: '#accreditation' },
    { kind: 'Body', title: 'Education & Skills Funding Agency', desc: 'Post-16 funding & compliance', href: '#accreditation' },
  ];

  const popular = ['Business', 'Digital Marketing', 'Computing', 'OTHM', 'Accreditation'];
  tagsEl.innerHTML = popular.map((p) => `<button class="ss-tag" data-q="${p}">${p}</button>`).join('');
  tagsEl.querySelectorAll('.ss-tag').forEach((t) => t.addEventListener('click', () => { input.value = t.dataset.q; run(t.dataset.q); input.focus(); }));

  const goSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  function run(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) { resultsEl.innerHTML = ''; suggestEl.style.display = ''; return; }
    suggestEl.style.display = 'none';
    const hits = index.filter((it) => (it.title + ' ' + it.desc + ' ' + it.kind).toLowerCase().includes(q)).slice(0, 8);
    if (!hits.length) {
      resultsEl.innerHTML = `<div class="sr-empty">No matches for <b>"${q}"</b>. Try “business”, “computing” or “OTHM”.</div>`;
      return;
    }
    resultsEl.innerHTML = hits.map((h) => `
      <a class="sr-item" href="${h.href}" data-cursor="Open">
        <span class="sr-kind">${h.kind}</span>
        <span class="sr-main"><b>${h.title}</b><span>${h.desc}</span></span>
        <span class="sr-go">${goSvg}</span>
      </a>`).join('');
    resultsEl.querySelectorAll('.sr-item').forEach((a) => a.addEventListener('click', () => setTimeout(close, 80)));
    if (window.__cursorScan) window.__cursorScan(resultsEl);
  }

  function open(e) {
    if (e) e.preventDefault();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 120);
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    input.value = ''; resultsEl.innerHTML = ''; suggestEl.style.display = '';
  }

  openBtn && openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  input.addEventListener('input', () => run(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const first = resultsEl.querySelector('.sr-item'); if (first) first.click(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    // quick-open with "/" or Cmd/Ctrl+K
    if ((e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); open();
    }
  });
})();
