/* Shared clock: bounded 60 Hz simulation, visibility and motion preferences. */
(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const loops = new Set();
  let id = 0, last = 0, balance = 0;
  const STEP = 1000 / 60;
  function schedule() { if (!id && !document.hidden && !media.matches && loops.size) id = requestAnimationFrame(tick); }
  function tick(now) {
    id = 0;
    balance += last ? Math.min(now - last, 50) : STEP;
    last = now;
    let steps = 0;
    while (balance >= STEP - 0.1 && steps++ < 3) {
      for (const fn of loops) fn(STEP);
      balance -= STEP;
    }
    schedule();
  }
  function reset() {
    cancelAnimationFrame(id); id = 0; last = 0; balance = 0;
    document.documentElement.classList.toggle('motion-paused', document.hidden);
    if (media.matches && !document.hidden) for (const fn of loops) fn(0);
    schedule();
  }
  document.addEventListener('visibilitychange', reset);
  window.addEventListener('pageshow', reset);
  media.addEventListener('change', reset);
  window.Motion = {
    get reduced() { return media.matches; },
    get compact() { return innerWidth < 720; },
    get dpr() { return Math.min(devicePixelRatio || 1, innerWidth < 720 ? 1.25 : 1.5); },
    loop(fn) { loops.add(fn); if (media.matches) fn(0); schedule(); return () => { loops.delete(fn); if (!loops.size) reset(); }; },
    batch(fn) { let pending = 0, args; return (...next) => { args = next; if (!pending) pending = requestAnimationFrame(() => { pending = 0; fn(...args); }); }; }
  };
  reset();
})();
