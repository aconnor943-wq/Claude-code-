(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav turns solid once the hero is scrolled past
  const nav = document.querySelector('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll reveals
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Videos: load the terrace loop only when it nears the viewport; hold still frames for reduced motion
  document.querySelectorAll('video').forEach((v) => {
    if (reduceMotion) { v.removeAttribute('autoplay'); v.pause(); }
  });
  const lazy = document.querySelector('[data-lazy-video]');
  if (lazy && !reduceMotion && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      lazy.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; });
      lazy.load();
      lazy.play().catch(() => {});
      vio.disconnect();
    }, { rootMargin: '400px 0px' });
    vio.observe(lazy);
  }

  // Hide the booking fallback note once OpenTable's widget iframe is in place
  const booking = document.querySelector('[data-booking]');
  if (booking) {
    const markLoaded = () => {
      if (booking.querySelector('iframe')) { booking.classList.add('is-loaded'); return true; }
      return false;
    };
    if (!markLoaded()) {
      const mo = new MutationObserver(() => { if (markLoaded()) mo.disconnect(); });
      mo.observe(booking, { childList: true, subtree: true });
    }
  }

  // Opening hours, in Gold Coast time (Queensland has no daylight saving: UTC+10)
  const HOURS = { 0: [11.5, 20], 1: [12, 21], 2: [12, 21], 3: [12, 21], 4: [12, 21], 5: [12, 23], 6: [11.5, 23] };
  const fmt = (h) => {
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    const ampm = hr >= 12 ? 'pm' : 'am';
    const h12 = hr % 12 || 12;
    return h12 + (min ? ':' + String(min).padStart(2, '0') : '') + ampm;
  };
  const now = new Date(Date.now() + 10 * 3600e3); // shift to AEST, then read UTC fields
  const day = now.getUTCDay();
  const t = now.getUTCHours() + now.getUTCMinutes() / 60;
  const [open, close] = HOURS[day];

  document.querySelectorAll('[data-hours] [data-days]').forEach((row) => {
    if (row.dataset.days.split(',').map(Number).includes(day)) row.classList.add('is-today');
  });

  const today = document.querySelector('[data-today]');
  if (today) {
    let status, detail, isOpen = false;
    if (t < open) { status = 'Opens today'; detail = fmt(open); }
    else if (t < close) { status = 'Open now'; detail = 'until ' + fmt(close); isOpen = true; }
    else {
      const [nextOpen] = HOURS[(day + 1) % 7];
      status = 'Closed for tonight'; detail = 'back tomorrow ' + fmt(nextOpen);
    }
    today.innerHTML = `<span class="dot${isOpen ? '' : ' is-closed'}"></span>${status}<strong>${detail}</strong>`;
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = now.getUTCFullYear();
})();
