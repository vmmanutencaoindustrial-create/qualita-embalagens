/* =====================================================================
   QUALITÀ EMBALAGENS — MOTION ENGINE (otimizado para performance)
   ===================================================================== */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const enableHeavy = !reduced && !isCoarse && !isLowEnd;

  /* ============== LOADER ============== */
  function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.classList.add('is-done');
    document.querySelectorAll('.hero__word').forEach(w => w.classList.add('is-in'));
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', () => setTimeout(hideLoader, 400));

  // Failsafe — esconder loader em qualquer caso após 1.2s
  setTimeout(hideLoader, 1200);

  /* ============== SCROLL PROGRESS ============== */
  const scrollBar = document.getElementById('scrollBar');
  let rafScroll = null;
  function updateScrollBar() {
    if (!scrollBar) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.transform = `scaleX(${(window.scrollY / h)})`;
  }
  window.addEventListener('scroll', () => {
    if (rafScroll) return;
    rafScroll = requestAnimationFrame(() => {
      updateScrollBar();
      onScrollHeader();
      rafScroll = null;
    });
  }, { passive: true });

  /* ============== HEADER SCROLL STATE ============== */
  const header = document.getElementById('header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScrollHeader();

  /* ============== MOBILE NAV ============== */
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.header__nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
    }));
  }

  /* ============== SMOOTH ANCHORS (CSS-native) ============== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============== MAGNETIC BUTTONS (rAF throttle) ============== */
  if (enableHeavy) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      const strength = 14;
      let raf;
      btn.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
          raf = null;
        });
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============== TILT 3D (rAF throttle) ============== */
  if (enableHeavy) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let raf;
      card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============== REVEAL ON SCROLL ============== */
  const revealTargets = [
    '.section-eyebrow', '.manifesto__heading', '.manifesto__body', '.manifesto__sign',
    '.manifesto__caption', '.process__title', '.process__lead',
    '.products__title', '.products__intro', '.product',
    '.bento__head', '.bento__item', '.impact__title', '.impact__card',
    '.contact__title', '.contact__lead', '.contact__channels', '.contact__form',
    '.quote__mark', '.quote blockquote', '.quote footer', '.stats__item',
    '.decree__split > *', '.decree__timeline'
  ].join(', ');

  document.querySelectorAll(revealTargets).forEach(el => el.setAttribute('data-fade', ''));

  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-in');
        const parent = el.parentElement;
        if (parent && parent.matches('.bento__grid, .products__grid, .stats__grid, .impact__cards')) {
          const idx = Array.from(parent.children).indexOf(el);
          el.style.transitionDelay = (idx * 0.06) + 's';
        }
        revealIo.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-fade]').forEach(el => revealIo.observe(el));
  document.querySelectorAll('.decree__heading [data-reveal]').forEach(el => revealIo.observe(el));

  /* ============== COUNT UP ============== */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.floor(target * eased);
      el.textContent = (target >= 1000 ? value.toLocaleString('pt-BR') : value) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (target >= 1000 ? Math.floor(target).toLocaleString('pt-BR') : target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countIo.observe(el));

  /* ============== PROCESS SCROLLYTELLING (sem GSAP — IntersectionObserver) ============== */
  const stage = document.getElementById('processStage');
  if (stage) {
    const chapters = stage.querySelectorAll('.chapter');
    const images = stage.querySelectorAll('.process__img');
    const stepNum = document.getElementById('stepNum');
    const stepBar = document.getElementById('stepBar');

    function setActive(i) {
      images.forEach((img, idx) => img.classList.toggle('process__img--active', idx === i));
      if (stepNum) stepNum.textContent = String(i + 1).padStart(2, '0');
      if (stepBar) stepBar.style.width = (((i + 1) / chapters.length) * 100) + '%';
    }

    const stageIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(chapters).indexOf(entry.target);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { rootMargin: '-30% 0px -30% 0px' });
    chapters.forEach(c => stageIo.observe(c));
  }

  /* ============== FORM (com validação + error/success states) ============== */
  const form = document.getElementById('contactForm');
  if (form) {
    const success = document.getElementById('formSuccess');
    const errorBox = document.getElementById('formError');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (success) success.hidden = true;
      if (errorBox) errorBox.hidden = true;

      // Validação nativa (HTML5)
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (button) { button.style.opacity = '.5'; button.disabled = true; }

      // Simular envio (sem backend ainda) — quando tiver endpoint, troca aqui
      setTimeout(() => {
        try {
          if (success) {
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          // GA4 event opcional — só dispara se gtag existir
          if (typeof gtag === 'function') {
            gtag('event', 'lead_form_submit', {
              product: form.product.value,
              volume: form.volume.value,
              wants_sample: form.sample.checked
            });
          }
          form.reset();
        } catch (err) {
          if (errorBox) errorBox.hidden = false;
        }
        if (button) { button.style.opacity = '1'; button.disabled = false; }
      }, 600);
    });
  }

  /* ============== ACTIVE NAV LINK ============== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav a[data-link]');
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navIo.observe(s));

  /* ============== CONSOLE BANNER ============== */
  console.log('%c Qualità Embalagens %c recicle. transforme. impacte. ', 'background:#2D5F3F;color:#F5F1E8;padding:6px 12px;font-family:serif;font-size:14px;', 'background:#F5F1E8;color:#2D5F3F;padding:6px 12px;font-family:monospace;');
})();
