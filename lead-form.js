/* ============================================================
   Multi-step lead capture — coffee-tech "Our Approach" style
   active-state option list + smooth step transitions.
   ============================================================ */
(function () {
  const root = document.getElementById('lead');
  if (!root) return;

  const steps = [...root.querySelectorAll('.lead-step')];
  const barFill = document.getElementById('lead-bar-fill');
  const titleEl = document.getElementById('lead-title');
  const eyebrowEl = document.getElementById('lead-eyebrow');
  const curEl = document.getElementById('lead-cur');
  const backBtn = document.getElementById('lead-back');

  const meta = [
    { eyebrow: 'Start your application', title: 'What would you like to study?', bar: 33 },
    { eyebrow: 'Step two of three', title: 'Which level suits you best?', bar: 66 },
    { eyebrow: 'Almost there', title: 'Where should we send it?', bar: 100 },
  ];

  const data = { interest: '', level: '', name: '', email: '' };
  let cur = 0;

  function go(n) {
    steps.forEach((s) => s.classList.remove('active'));
    steps[n].classList.add('active');
    cur = n;
    if (n < 3) {
      titleEl.textContent = meta[n].title;
      eyebrowEl.textContent = meta[n].eyebrow;
      curEl.textContent = '0' + (n + 1);
      barFill.style.width = meta[n].bar + '%';
      backBtn.disabled = n === 0;
      backBtn.style.display = '';
    } else {
      // success
      eyebrowEl.textContent = 'Application received';
      titleEl.textContent = "Thanks — we've got everything we need.";
      barFill.style.width = '100%';
      backBtn.style.display = 'none';
    }
  }

  // option clicks (steps 0 & 1)
  steps[0].querySelectorAll('.lead-opt').forEach((b) => b.addEventListener('click', () => pick(b, 'interest', 1)));
  steps[1].querySelectorAll('.lead-opt').forEach((b) => b.addEventListener('click', () => pick(b, 'level', 2)));

  function pick(btn, key, next) {
    const sib = btn.parentElement.querySelectorAll('.lead-opt');
    sib.forEach((s) => s.classList.remove('sel'));
    btn.classList.add('sel');
    data[key] = btn.getAttribute('data-value').replace(/&amp;/g, '&');
    setTimeout(() => go(next), 340);
  }

  // back
  backBtn.addEventListener('click', () => { if (cur > 0) go(cur - 1); });

  // submit (step 2)
  const nameI = document.getElementById('lead-name');
  const emailI = document.getElementById('lead-email');
  const emailField = emailI.closest('.lead-field');
  const submit = document.getElementById('lead-submit');

  emailI.addEventListener('input', () => emailField.classList.remove('invalid'));

  submit.addEventListener('click', () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value.trim());
    if (!ok) { emailField.classList.add('invalid'); emailI.focus(); return; }
    data.name = nameI.value.trim();
    data.email = emailI.value.trim();
    const first = data.name ? data.name.split(' ')[0] : 'there';
    document.getElementById('lead-name-out').textContent = first;
    document.getElementById('lead-summary').textContent =
      `Your ${data.interest || 'course'} prospectus${data.level ? ' (' + data.level.split(' —')[0] + ')' : ''} is on its way to ${data.email}. An admissions advisor will be in touch shortly.`;
    go(3);
  });

  // restart
  document.getElementById('lead-restart').addEventListener('click', () => {
    root.querySelectorAll('.lead-opt.sel').forEach((s) => s.classList.remove('sel'));
    nameI.value = ''; emailI.value = ''; emailField.classList.remove('invalid');
    data.interest = data.level = data.name = data.email = '';
    go(0);
  });
})();
