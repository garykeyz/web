/* ============================================================
   GARY KEYZ — Main JS
   Global particles · Navbar · Scroll reveal · Lightbox · Video modal
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
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
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

mobileMenu.querySelectorAll('.mobile-link, .mobile-book-btn').forEach(el => {
  el.addEventListener('click', closeMobile);
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  navToggle.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

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

// ===== GLOBAL PARTICLE SYSTEM =====
// Covers the entire page (fixed canvas), creates floating gold particles
// visible across ALL sections for a luxury atmosphere
(function initGlobalParticles() {
  const canvas = document.getElementById('globalParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Gold and silver color palette
  const COLORS = [
    '201,168,76',   // gold
    '228,195,100',  // bright gold
    '180,155,65',   // warm gold
    '220,210,180',  // cream/silver
    '255,255,255',  // white
  ];

  // Particle class
  class Particle {
    constructor(randomY = false) {
      this.spawn(randomY);
    }

    spawn(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + Math.random() * 60;
      this.size  = Math.random() * 1.8 + 0.2;
      this.vx    = (Math.random() - 0.5) * 0.22;
      this.vy    = -(Math.random() * 0.35 + 0.08);
      this.alpha = Math.random() * 0.55 + 0.08;
      this.life  = Math.random();
      this.decay = Math.random() * 0.005 + 0.002;
      this.grow  = true;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Occasional larger sparkle
      if (Math.random() < 0.06) this.size *= 2.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.grow) {
        this.life += this.decay;
        if (this.life >= 1) { this.life = 1; this.grow = false; }
      } else {
        this.life -= this.decay * 0.65;
        if (this.life <= 0 || this.y < -20) { this.spawn(false); }
      }
      if (this.x < -10 || this.x > W + 10) { this.spawn(false); }
    }

    draw() {
      const a = this.alpha * this.life;
      if (a < 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${this.color})`;
      ctx.shadowBlur = this.size * 5;
      ctx.shadowColor = `rgba(${this.color}, 0.7)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Light streak class (vertical falling light streaks)
  class Streak {
    constructor(randomY = false) {
      this.spawn(randomY);
    }

    spawn(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * (H * 1.5) : H + Math.random() * 200;
      this.len   = Math.random() * 120 + 40;
      this.speed = Math.random() * 0.7 + 0.25;
      this.alpha = Math.random() * 0.09 + 0.015;
      this.width = Math.random() * 0.8 + 0.15;
    }

    update() {
      this.y -= this.speed;
      if (this.y + this.len < -10) { this.spawn(false); }
    }

    draw() {
      const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.len);
      g.addColorStop(0,   `rgba(201,168,76,0)`);
      g.addColorStop(0.4, `rgba(201,168,76,${this.alpha})`);
      g.addColorStop(0.6, `rgba(228,195,100,${this.alpha * 1.2})`);
      g.addColorStop(1,   `rgba(201,168,76,0)`);
      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y - this.len);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 70 particles spread across the visible screen + some streaks
  const PARTICLE_COUNT = 70;
  const STREAK_COUNT   = 12;

  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(true));
  const streaks   = Array.from({ length: STREAK_COUNT },   () => new Streak(true));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw streaks first (behind particles)
    streaks.forEach(s => { s.update(); s.draw(); });

    // Draw particles
    particles.forEach(p => { p.update(); p.draw(); });

    animId = requestAnimationFrame(draw);
  }

  draw();
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
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
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
