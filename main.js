(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Paradise Point time (Queensland: UTC+10, no daylight saving)
  const now = new Date(Date.now() + 10 * 3600e3);
  const day = now.getUTCDay();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;

  // ---------- light: day / night ----------
  const videos = [...document.querySelectorAll('[data-light-video]')];
  const switches = [...document.querySelectorAll('[data-set-light]')];

  const playFor = (light) => {
    videos.forEach((v) => {
      if (v.dataset.lightVideo === light && !reduceMotion) v.play().catch(() => {});
      else if (v.dataset.lightVideo !== light) setTimeout(() => v.pause(), 1700);
    });
  };
  const setLight = (light, remember) => {
    root.dataset.light = light;
    switches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLight === light)));
    if (remember) { try { sessionStorage.setItem('light', light); } catch (e) {} }
    playFor(light);
  };
  switches.forEach((b) => b.addEventListener('click', () => setLight(b.dataset.setLight, true)));
  setLight(root.dataset.light || 'day', false);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach((v) => v.pause());
    else playFor(root.dataset.light);
  });

  // ---------- top bar turns solid past the first screen ----------
  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('.hero');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - 80);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- hours, open now, tonight ----------
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

  const todayRow = document.querySelector(`[data-week] [data-day="${day}"]`);
  if (todayRow) {
    todayRow.classList.add('is-today');
    const tag = document.createElement('span');
    tag.className = 'nights__today';
    tag.textContent = `Today. ${status}`;
    todayRow.querySelector('.nights__what').appendChild(tag);
  }

  // ---------- entrances: heading, then text, then picture, staggered ----------
  const groups = [
    ['.intro', ['.intro__statement', '.intro__note']],
    ['.plate', ['.plate__img', '.plate__copy', '.plate__actions']],
    ['.menu', ['.menu__title', '.menu__photo img', '.menu__rows li', '.menu__foot']],
    ['.nights', ['.nights__title', '.nights__rows li']],
    ['.bar', ['.bar__title']],
    ['.book', ['.book__title', '.book__text p', '.book__widget']],
    ['.visit', ['.visit__row']],
    ['.foot', ['.foot__top', '.foot__mono', '.foot__name']],
  ];
  // pictures animate with a clip-path wipe; Chromium reports a fully clipped element as not intersecting,
  // so each one is observed through its unclipped parent
  const reveals = []; // [watched element, element that animates]
  groups.forEach(([section, parts]) => {
    let i = 0;
    parts.forEach((sel) => document.querySelectorAll(`${section} ${sel}`).forEach((el) => {
      const pic = el.matches('img, .book__widget');
      el.classList.add(pic ? 'wipe' : 'rise');
      el.style.setProperty('--d', `${Math.min(i++ * 75, 600)}ms`);
      reveals.push([pic ? el.parentElement : el, el]);
    }));
  });
  document.querySelectorAll('.intro__wide img, .intro__photo img, .bar__img img').forEach((img) => {
    img.classList.add('wipe');
    reveals.push([img.parentElement, img]);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const byWatched = new Map();
    reveals.forEach(([w, el]) => byWatched.set(w, [...(byWatched.get(w) || []), el]));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      byWatched.get(e.target).forEach((el) => el.classList.add('is-in'));
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    byWatched.forEach((_, w) => io.observe(w));
  } else {
    reveals.forEach(([, el]) => el.classList.add('is-in'));
  }

  // ---------- the bar's evening loop plays only while it is on screen ----------
  const barVideo = document.querySelector('[data-bar-video]');
  if (barVideo && !reduceMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { barVideo.preload = 'auto'; barVideo.play().catch(() => {}); }
      else barVideo.pause();
    }, { threshold: 0.2 }).observe(barVideo);
  }

  // ---------- booking: hide the fallback once OpenTable's iframe arrives ----------
  const booking = document.querySelector('[data-booking]');
  if (booking) {
    const loaded = () => booking.querySelector('iframe') && booking.classList.add('is-loaded');
    if (!loaded()) {
      const mo = new MutationObserver(() => { if (loaded()) mo.disconnect(); });
      mo.observe(booking, { childList: true, subtree: true });
    }
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = now.getUTCFullYear();
})();
