/* ============================================================
   GARY KEYZ — Main JS
   Navbar · Particles · Scroll reveal · Lightbox · Video modal
============================================================ */

// ===== CURSOR GLOW (desktop only) =====
if (window.innerWidth > 1024) {
  const glow = document.getElementById('cursorGlow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

// ===== NAVBAR =====
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
});

// close mobile on link click
mobileMenu.querySelectorAll('.mobile-link, .mobile-book-btn').forEach(el => {
  el.addEventListener('click', closeMobile);
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  navToggle.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) closeMobile();
});

// ===== ACTIVE NAV LINK =====
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

const activeSectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => activeSectionObserver.observe(s));

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('revealed'), delay);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

document.querySelectorAll(
  '.reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
).forEach(el => revealObserver.observe(el));

// ===== PARTICLE CANVAS =====
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Particles
  const COLORS = ['201,168,76', '232,201,106', '200,200,200', '255,255,255'];
  const particles = Array.from({ length: 90 }, () => makeParticle(true));

  function makeParticle(randomY = false) {
    return {
      x:      Math.random() * (W || window.innerWidth),
      y:      randomY ? Math.random() * (H || window.innerHeight) : (H || window.innerHeight) + 10,
      size:   Math.random() * 1.6 + 0.2,
      vx:     (Math.random() - 0.5) * 0.25,
      vy:     -(Math.random() * 0.4 + 0.1),
      alpha:  Math.random() * 0.55 + 0.1,
      life:   Math.random(),
      decay:  Math.random() * 0.006 + 0.002,
      grow:   true,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  // Streaks
  const streaks = Array.from({ length: 10 }, () => makeStreak(true));

  function makeStreak(randomY = false) {
    return {
      x:      Math.random() * (W || window.innerWidth),
      y:      randomY ? Math.random() * (H || window.innerHeight) : (H || window.innerHeight) + 150,
      len:    Math.random() * 130 + 50,
      speed:  Math.random() * 0.9 + 0.3,
      alpha:  Math.random() * 0.07 + 0.01,
      width:  Math.random() * 0.9 + 0.2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // streaks
    streaks.forEach(s => {
      s.y -= s.speed;
      if (s.y + s.len < 0) Object.assign(s, makeStreak(false));
      const g = ctx.createLinearGradient(s.x, s.y, s.x, s.y - s.len);
      g.addColorStop(0, `rgba(201,168,76,0)`);
      g.addColorStop(0.5, `rgba(201,168,76,${s.alpha})`);
      g.addColorStop(1, `rgba(201,168,76,0)`);
      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y - s.len);
      ctx.stroke();
      ctx.restore();
    });

    // dots
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.grow) { p.life += p.decay; if (p.life >= 1) { p.life = 1; p.grow = false; } }
      else        { p.life -= p.decay * 0.7; if (p.life <= 0) particles[i] = makeParticle(false); }
      if (p.y < -10 || p.x < -10 || p.x > W + 10) particles[i] = makeParticle(false);

      const a = p.alpha * p.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${p.color})`;
      ctx.shadowBlur = p.size * 5;
      ctx.shadowColor = `rgba(${p.color}, 0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animId = requestAnimationFrame(draw);
  }
  draw();

  // pause when hero scrolls out
  const heroObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) { cancelAnimationFrame(animId); }
    else { draw(); }
  });
  heroObs.observe(document.getElementById('hero'));
})();

// ===== LIGHTBOX =====
(function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  const imgs    = Array.from(document.querySelectorAll('.g-item img'));
  let cur = 0;

  function open(i) {
    cur = i;
    lbImg.src = imgs[cur].src;
    lbImg.alt = imgs[cur].alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  function prev() { cur = (cur - 1 + imgs.length) % imgs.length; lbImg.src = imgs[cur].src; }
  function next() { cur = (cur + 1) % imgs.length;               lbImg.src = imgs[cur].src; }

  document.querySelectorAll('.g-item').forEach((el, i) => el.addEventListener('click', () => open(i)));
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();

// ===== VIDEO MODAL =====
(function initVideoModal() {
  const modal    = document.getElementById('videoModal');
  const iframe   = document.getElementById('vIframe');
  const closeBtn = document.getElementById('vModalClose');

  document.querySelectorAll('.v-thumb[data-vid]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const vid = thumb.dataset.vid;
      iframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
