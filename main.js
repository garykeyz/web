/* ========================================
   GARY KEYZ — Main JavaScript
======================================== */

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

// ===== PARTICLE CANVAS =====
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const particles = [];
  const PARTICLE_COUNT = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = Math.random();
      this.maxLife = Math.random() * 0.02 + 0.003;
      this.growing = true;
      // Gold, silver, or white tones
      const palette = ['201,168,76', '232,201,106', '184,184,184', '255,255,255'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.growing) {
        this.life += this.maxLife;
        if (this.life >= 1) { this.growing = false; this.life = 1; }
      } else {
        this.life -= this.maxLife * 0.7;
        if (this.life <= 0) { this.reset(); }
      }
      if (this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
    }
    draw() {
      const alpha = this.opacity * this.life;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${this.color}, 1)`;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = `rgba(${this.color}, 0.6)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.x = Math.random() * W;
    p.y = Math.random() * H;
    particles.push(p);
  }

  // Light streaks
  const streaks = Array.from({ length: 8 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    length: Math.random() * 120 + 40,
    angle: Math.PI * 1.5 + (Math.random() - 0.5) * 0.3,
    speed: Math.random() * 0.8 + 0.3,
    opacity: Math.random() * 0.08 + 0.02,
    width: Math.random() * 1 + 0.3,
  }));

  function drawStreaks() {
    streaks.forEach(s => {
      s.y -= s.speed;
      if (s.y + s.length < 0) {
        s.y = H + s.length;
        s.x = Math.random() * W;
        s.opacity = Math.random() * 0.08 + 0.02;
      }
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.x + Math.cos(s.angle) * s.length,
        s.y + Math.sin(s.angle) * s.length
      );
      grad.addColorStop(0, `rgba(201,168,76,0)`);
      grad.addColorStop(0.5, `rgba(201,168,76,${s.opacity})`);
      grad.addColorStop(1, `rgba(201,168,76,0)`);
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * s.length, s.y + Math.sin(s.angle) * s.length);
      ctx.stroke();
      ctx.restore();
    });
  }

  let animFrame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawStreaks();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }
  animate();

  // Pause when hero is off screen
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(animFrame);
      } else {
        animate();
      }
    });
  });
  heroObserver.observe(document.getElementById('hero'));
})();

// ===== LIGHTBOX =====
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const items = Array.from(document.querySelectorAll('.gallery-item img'));
  let current = 0;

  function open(index) {
    current = index;
    lightboxImg.src = items[current].src;
    lightboxImg.alt = items[current].alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function prev() { current = (current - 1 + items.length) % items.length; lightboxImg.src = items[current].src; }
  function next() { current = (current + 1) % items.length; lightboxImg.src = items[current].src; }

  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  lightboxClose.addEventListener('click', close);
  lightboxPrev.addEventListener('click', prev);
  lightboxNext.addEventListener('click', next);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

// ===== VIDEO MODAL =====
(function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  const closeBtn = document.getElementById('videoModalClose');

  document.querySelectorAll('.video-thumb[data-videoid]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const videoId = thumb.dataset.videoid;
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

// ===== SMOOTH ACTIVE NAV =====
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--gold)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
})();

// ===== LOGO FALLBACK =====
document.querySelectorAll('.hero-logo, .footer-logo, .logo-img').forEach(img => {
  img.addEventListener('error', function() {
    this.style.display = 'none';
    const fallback = document.createElement('span');
    fallback.textContent = 'GARY KEYZ';
    fallback.style.cssText = 'font-family:var(--font-display);font-size:2rem;letter-spacing:0.2em;color:var(--gold);';
    this.parentNode.insertBefore(fallback, this.nextSibling);
  });
});
