(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const light = document.documentElement.dataset.light;

  // Paradise Point time (Queensland: UTC+10, no daylight saving)
  const now = new Date(Date.now() + 10 * 3600e3);
  const day = now.getUTCDay();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;

  // ---------- hero: play the day or night loop ----------
  document.querySelectorAll('[data-video]').forEach((v) => {
    if (v.dataset.video === light && !reduceMotion) v.play().catch(() => {});
    else v.removeAttribute('autoplay');
  });

  // ---------- top bar turns solid once past the hero; Book button floats on phones ----------
  const top = document.querySelector('[data-top]');
  const float = document.querySelector('[data-float]');
  const hero = document.querySelector('.hero');
  const book = document.querySelector('#book');
  const onScroll = () => {
    const past = hero ? window.scrollY > hero.offsetHeight - 80 : window.scrollY > 40;
    if (top) top.classList.toggle('is-solid', past);
    if (float && book) {
      const r = book.getBoundingClientRect();
      const atBooking = r.top < window.innerHeight && r.bottom > 0;
      float.classList.toggle('is-on', past && !atBooking);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- open now, and today's special and hours ----------
  const HOURS = { 0: [11.5, 20], 1: [12, 21], 2: [12, 21], 3: [12, 21], 4: [12, 21], 5: [12, 23], 6: [11.5, 23] };
  const fmt = (h) => {
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    return (hr % 12 || 12) + (min ? ':' + String(min).padStart(2, '0') : '') + (hr >= 12 ? 'pm' : 'am');
  };
  const [open, close] = HOURS[day];
  let status, isOpen = false;
  if (hour < open) status = `Opens today at ${fmt(open)}`;
  else if (hour < close) { status = `Open now until ${fmt(close)}`; isOpen = true; }
  else status = `Closed now. Back tomorrow at ${fmt(HOURS[(day + 1) % 7][0])}`;
  const statusEl = document.querySelector('[data-status]');
  if (statusEl) statusEl.innerHTML = `<span class="dot${isOpen ? '' : ' is-closed'}" aria-hidden="true"></span>${status}`;
  document.querySelectorAll(`[data-week] [data-day="${day}"], .hours [data-day="${day}"]`).forEach((el) => {
    el.classList.add('is-today');
    const d = el.querySelector('.week__day');
    if (d) d.textContent = `Today · ${d.textContent}`;
    const det = el.querySelector('details');
    if (det) det.open = true;
  });

  // ---------- booking: hide the fallback once OpenTable's form arrives ----------
  const widget = document.querySelector('[data-booking]');
  if (widget) {
    const loaded = () => widget.querySelector('iframe') && widget.classList.add('is-loaded');
    if (!loaded()) new MutationObserver((_, mo) => { if (loaded()) mo.disconnect(); }).observe(widget, { childList: true, subtree: true });
  }

  // ---------- menu page: a link to a section opens its dropdown ----------
  const openFromHash = () => {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView(); }
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
