/* ============================================================
   Apply / Enquire modal controller
   ============================================================ */
(function () {
  var modal = document.getElementById('apply-modal');
  var openBtn = document.getElementById('open-apply');
  if (!modal || !openBtn) return;

  var dialog = modal.querySelector('.apply-dialog');
  var tabs = [].slice.call(modal.querySelectorAll('.apply-tab'));
  var ind = document.getElementById('apply-ind');
  var panes = [].slice.call(modal.querySelectorAll('.apply-pane'));
  var donePane = modal.querySelector('.apply-done');
  var lastFocus = null;

  function moveIndicator() {
    var active = modal.querySelector('.apply-tab.active');
    if (!active) return;
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + (active.offsetLeft - 5) + 'px)';
  }

  function showPane(name) {
    panes.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-pane') === name); });
    donePane.classList.remove('active');
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === name); });
    moveIndicator();
  }

  function open(tab) {
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('apply-lock');
    showPane(tab || 'signin');
    // indicator needs layout
    requestAnimationFrame(moveIndicator);
    setTimeout(function () {
      var f = modal.querySelector('.apply-pane.active input, .apply-pane.active select');
      if (f) f.focus();
    }, 360);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('apply-lock');
    if (lastFocus) lastFocus.focus();
  }

  openBtn.addEventListener('click', function () { open('signin'); });

  // also let any [data-open-apply] element open it (e.g. hero/footer CTAs) with optional tab
  document.querySelectorAll('[data-open-apply]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(el.getAttribute('data-open-apply') || 'enquire'); });
  });

  modal.querySelectorAll('[data-apply-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  document.getElementById('apply-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPane(t.getAttribute('data-tab')); });
  });
  modal.querySelectorAll('.af-switch').forEach(function (b) {
    b.addEventListener('click', function () { showPane(b.getAttribute('data-goto')); });
  });
  window.addEventListener('resize', moveIndicator, { passive: true });

  // form submit → success state
  var msg = {
    signin: { t: 'Signed in', m: 'Welcome back! Redirecting you to your dashboard…' },
    signup: { t: 'Account created', m: 'Welcome to DMS. Check your inbox to verify your email and finish your application.' },
    enquire: { t: 'Enquiry sent', m: "Thanks — we've received your enquiry and an admissions advisor will be in touch shortly." }
  };
  panes.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var key = form.getAttribute('data-pane');
      var info = msg[key] || msg.enquire;
      document.getElementById('apply-done-title').textContent = info.t;
      document.getElementById('apply-done-msg').textContent = info.m;
      panes.forEach(function (p) { p.classList.remove('active'); });
      donePane.classList.add('active');
      form.reset();
    });
  });
})();
