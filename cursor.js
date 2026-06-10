/* ============================================================
   Custom cursor — ink dot rides the pointer, a ring trails it,
   and morphs into a labelled disc over interactive elements.
   (coffee-tech.com style)
   ============================================================ */
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;

  const body = document.body;
  body.classList.add('has-cursor');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  const label = document.createElement('span');
  label.className = 'c-label';
  ring.appendChild(label);

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';

  body.appendChild(ring);
  body.appendChild(dot);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;   // mouse
  let rx = mx, ry = my;                                          // ring (lerped)
  let visible = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!visible) { visible = true; ring.style.opacity = dot.style.opacity = '1'; }
  });

  document.addEventListener('mouseleave', () => { ring.style.opacity = dot.style.opacity = '0'; visible = false; });
  document.addEventListener('mousedown', () => body.classList.add('cur-down'));
  document.addEventListener('mouseup', () => body.classList.remove('cur-down'));

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)${body.classList.contains('cur-down') ? ' scale(.86)' : ''}`;
    requestAnimationFrame(loop);
  }
  loop();

  // Interactive targets: anything with [data-cursor] (label via the attribute),
  // plus a sensible default for links & buttons.
  function bind(el) {
    const txt = el.getAttribute('data-cursor');
    const variant = el.getAttribute('data-cursor-variant'); // orange | light
    el.addEventListener('mouseenter', () => {
      label.textContent = txt && txt.trim() ? txt : 'View';
      body.classList.add('cur-active');
      body.classList.toggle('cur-orange', variant === 'orange');
      body.classList.toggle('cur-light', variant === 'light');
    });
    el.addEventListener('mouseleave', () => {
      body.classList.remove('cur-active', 'cur-orange', 'cur-light');
    });
  }

  function scan(root) {
    root.querySelectorAll('[data-cursor]').forEach(bind);
  }
  scan(document);
  window.__cursorScan = scan;

  // Hide the custom cursor over the top nav so the native hand pointer shows
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.addEventListener('mouseenter', () => body.classList.add('cur-nav'));
    nav.addEventListener('mouseleave', () => body.classList.remove('cur-nav'));
  }
})();
