/**
 * Portfolio — Motion & Background Effects
 * Edit particle count, typing text, and scroll settings below.
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================== THEME TOGGLE ==================== */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.setAttribute(
      'aria-label',
      getTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );

    toggle.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  function readThemeVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* ==================== PARTICLE NETWORK BACKGROUND ==================== */
  function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 120 };

    const config = {
      density: prefersReducedMotion ? 0.000025 : 0.000045,
      connectionDistance: 140,
      speed: prefersReducedMotion ? 0.15 : 0.35,
      colors: ['#6366f1', '#8b5cf6', '#818cf8'],
      stroke: '#6366f1',
      lineAlpha: 0.18,
    };

    function applyThemeColors() {
      config.stroke = readThemeVar('--particle-stroke') || '#6366f1';
      config.lineAlpha = parseFloat(readThemeVar('--particle-line-alpha')) || 0.18;
      config.colors = getTheme() === 'light'
        ? ['#6366f1', '#818cf8', '#a5b4fc']
        : ['#6366f1', '#8b5cf6', '#818cf8'];
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    }

    function createParticles() {
      const count = Math.floor(canvas.width * canvas.height * config.density);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        radius: Math.random() * 1.5 + 0.8,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          if (mouse.x !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < mouse.radius) {
              const force = (mouse.radius - dist) / mouse.radius;
              p.x -= (dx / dist) * force * 1.2;
              p.y -= (dy / dist) * force * 1.2;
            }
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);

          if (dist < config.connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = config.stroke;
            ctx.globalAlpha = (1 - dist / config.connectionDistance) * config.lineAlpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
    }

    function animate() {
      drawFrame();
      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    resize();
    applyThemeColors();
    window.addEventListener('themechange', applyThemeColors);

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      animate();
    }
  }

  /* ==================== SCROLL REVEAL ==================== */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ==================== TYPING EFFECT ==================== */
  function initTypingEffect() {
    const el = document.querySelector('[data-typing]');
    if (!el || prefersReducedMotion) return;

    const text = el.dataset.typing;
    const speed = 45;
    let index = 0;

    el.textContent = '';
    el.classList.add('typing-cursor');

    function type() {
      if (index < text.length) {
        el.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => el.classList.remove('typing-cursor'), 2000);
      }
    }

    setTimeout(type, 800);
  }

  /* ==================== CERTIFICATE LIGHTBOX ==================== */
  function initCertificateModal() {
    const modal = document.getElementById('cert-modal');
    const modalImage = document.getElementById('cert-modal-image');
    const modalTitle = document.getElementById('cert-modal-title');
    const closeBtn = modal?.querySelector('.cert-modal__close');

    if (!modal || !modalImage || !modalTitle || !closeBtn) return;

    const openModal = (card) => {
      const img = card.querySelector('img');
      if (!img) return;

      modalImage.src = img.src;
      modalImage.alt = img.alt || 'Certificate image';
      modalTitle.textContent = img.alt || 'Certificate';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('.cert-card').forEach((card) => {
      card.addEventListener('click', () => openModal(card));
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal="true"]') || event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  /* ==================== HOME SCROLL ==================== */
  function initHomeScroll() {
    document.querySelectorAll('a[href="#home"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
        history.replaceState(null, '', '#home');
      });
    });
  }

  /* ==================== ACTIVE NAV LINK ==================== */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    function updateActiveLink() {
      const scrollPos = window.scrollY + 120;

      if (window.scrollY < 80) {
        navLinks.forEach((link) => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === '#home');
        });
        return;
      }

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  /* ==================== HEADER SCROLL STATE ==================== */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    function updateHeader() {
      header.classList.toggle('header--scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ==================== MOBILE MENU ==================== */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelectorAll('.nav__link');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (toggle) toggle.checked = false;
      });
    });
  }

  /* ==================== SMOOTH PARALLAX ORBS ==================== */
  function initOrbParallax() {
    if (prefersReducedMotion) return;

    const orbs = document.querySelectorAll('.bg__orb');

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 12;
        orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    }, { passive: true });
  }

  /* ==================== INIT ==================== */
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initParticleBackground();
    initScrollReveal();
    initTypingEffect();
    initCertificateModal();
    initHomeScroll();
    initActiveNav();
    initHeaderScroll();
    initMobileMenu();
    initOrbParallax();

    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), 200 + i * 150);
    });
  });
})();

