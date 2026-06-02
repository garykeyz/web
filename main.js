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

// ===== GLOBAL EMBER / ASH PARTICLE SYSTEM =====
// Fixed canvas covering entire viewport — cinematic gold embers across all sections
(function initGlobalParticles() {
  const canvas = document.getElementById('globalParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Ember color variants — gold, amber, warm cream
  const EMBER_COLORS = [
    [201, 168,  76],  // gold
    [228, 195, 100],  // bright gold
    [245, 210, 120],  // light gold
    [180, 140,  50],  // deep amber
    [255, 235, 160],  // warm cream
    [255, 255, 220],  // near-white warm
  ];

  class Ember {
    constructor(randomY = false) { this.reset(randomY); }

    reset(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + 10 + Math.random() * 80;
      // Size variation: most are tiny (0.5-2px), a few are larger sparkles (3-5px)
      const roll = Math.random();
      if      (roll < 0.75) this.r = Math.random() * 1.5 + 0.3;   // fine ash
      else if (roll < 0.93) this.r = Math.random() * 2.2 + 1.2;   // medium ember
      else                   this.r = Math.random() * 3.5 + 2.5;   // bright sparkle
      // Slow upward drift with gentle horizontal sway
      this.vy    = -(Math.random() * 0.45 + 0.1);
      this.vx    = (Math.random() - 0.5) * 0.18;
      // Wobble parameters — sine wave drift like real embers
      this.wobbleAmp   = Math.random() * 0.6 + 0.1;
      this.wobbleFreq  = Math.random() * 0.015 + 0.005;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbleTick  = 0;
      // Life cycle
      this.maxAlpha = Math.random() * 0.65 + 0.12;
      this.alpha    = 0;
      this.life     = 0;   // 0 → 1 → 0
      this.speed    = Math.random() * 0.008 + 0.003;
      this.fadeIn   = Math.random() * 0.3 + 0.1;  // fraction of life used to fade in
      this.color    = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)];
      // Glow radius proportional to size
      this.glowR    = this.r * (Math.random() * 3 + 4);
    }

    update() {
      this.life += this.speed;
      this.wobbleTick += this.wobbleFreq;
      // Alpha: fade in then fade out
      if (this.life < this.fadeIn) {
        this.alpha = (this.life / this.fadeIn) * this.maxAlpha;
      } else if (this.life < 0.8) {
        this.alpha = this.maxAlpha;
      } else {
        this.alpha = this.maxAlpha * (1 - (this.life - 0.8) / 0.2);
      }
      if (this.life >= 1) { this.reset(false); return; }
      // Wobble horizontal drift
      this.x += this.vx + Math.sin(this.wobbleTick + this.wobblePhase) * this.wobbleAmp;
      this.y += this.vy;
      if (this.y < -20 || this.x < -30 || this.x > W + 30) { this.reset(false); }
    }

    draw() {
      if (this.alpha < 0.005) return;
      const [r, g, b] = this.color;
      ctx.save();
      // Outer glow
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowR);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha * 0.9})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${this.alpha * 0.4})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      // Bright core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, this.alpha * 1.6)})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // Subtle rising streak (like heat shimmer / light column) — only a few
  class Streak {
    constructor(randomY = false) { this.reset(randomY); }
    reset(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + Math.random() * 150;
      this.len   = Math.random() * 100 + 30;
      this.speed = Math.random() * 0.5 + 0.15;
      this.alpha = Math.random() * 0.055 + 0.01;
      this.width = Math.random() * 0.7 + 0.15;
    }
    update() {
      this.y -= this.speed;
      if (this.y + this.len < -10) this.reset(false);
    }
    draw() {
      const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.len);
      g.addColorStop(0,   `rgba(201,168,76,0)`);
      g.addColorStop(0.5, `rgba(228,195,100,${this.alpha})`);
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

  // 80 embers + 8 streaks — premium density without overloading
  const embers  = Array.from({ length: 80 }, () => new Ember(true));
  const streaks = Array.from({ length: 8  }, () => new Streak(true));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    streaks.forEach(s => { s.update(); s.draw(); });
    embers.forEach(e  => { e.update();  e.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
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
