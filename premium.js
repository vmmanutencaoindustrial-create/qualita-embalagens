/* =====================================================================
   QUALITÀ — PREMIUM LAYER 2026 (JS)
   Cursor, parallax, glow, char-split, morph, countdown, marquee dup,
   nav-pill, idle motion.
   ===================================================================== */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const enableHeavy = !reduced && !isCoarse && !isLowEnd;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============== CUSTOM CURSOR ============== */
  if (canHover && !reduced) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span class="cursor__label"></span>';
    document.body.appendChild(cursor);
    const label = cursor.querySelector('.cursor__label');

    let mx = 0, my = 0, cx = 0, cy = 0, raf;
    function loop() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.transform = `translate(${cx - cursor.offsetWidth/2}px, ${cy - cursor.offsetHeight/2}px)`;
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-active');
      if (!raf) loop();
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
    });

    // Hover states
    const hoverMap = [
      { sel: 'a, button, [data-magnetic], label.field-check', cls: 'is-hover' },
      { sel: '.product', cls: 'has-label', label: 'Ver linha →' },
      { sel: '.bento__item', cls: 'is-hover' },
      { sel: '.product__media', cls: 'has-label', label: 'Solicitar amostra' },
      { sel: 'input, textarea, select', cls: 'is-hover-light' },
      { sel: '.hero__media', cls: 'has-label', label: 'recicle.\ntransforme.\nimpacte.' },
    ];

    hoverMap.forEach(({ sel, cls, label: txt }) => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add(cls);
          if (txt) label.textContent = txt;
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove(cls);
          if (txt) label.textContent = '';
        });
      });
    });
  }

  /* ============== MOUSE PARALLAX HERO ============== */
  if (enableHeavy) {
    const hero = document.querySelector('.hero');
    if (hero) {
      let raf;
      hero.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
          hero.style.setProperty('--mx', x.toFixed(3));
          hero.style.setProperty('--my', y.toFixed(3));
          raf = null;
        });
      });
      hero.addEventListener('mouseleave', () => {
        hero.style.setProperty('--mx', 0);
        hero.style.setProperty('--my', 0);
      });
    }
  }

  /* ============== GLOW SPOTLIGHT (Bento + Produtos + Stats) ============== */
  if (enableHeavy) {
    const spotSelectors = ['.bento__item', '.product', '.stats__item'];
    document.querySelectorAll(spotSelectors.join(', ')).forEach(card => {
      card.setAttribute('data-spotlight', '');
      let raf;
      card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
          raf = null;
        });
      });
    });
  }

  /* ============== HERO CHAR SPLIT 3D ============== */
  document.querySelectorAll('.hero__word').forEach((word, wi) => {
    const text = word.textContent;
    word.textContent = '';
    [...text].forEach((c, i) => {
      const span = document.createElement('span');
      span.className = 'hero__char' + (c === ' ' ? ' hero__char--space' : '');
      if (c === '.') span.className += ' hero__char--dot';
      span.textContent = c;
      const delay = (wi * 0.15) + (i * 0.04);
      span.style.transitionDelay = delay + 's';
      word.appendChild(span);
    });
  });

  /* ============== NAV INDICATOR PILL ============== */
  const navEl = document.querySelector('.header__nav');
  if (navEl) {
    const pill = document.createElement('div');
    pill.className = 'nav-pill';
    navEl.appendChild(pill);
    navEl.classList.add('has-nav-pill');

    let activePill = null;
    function movePillTo(el, immediate = false) {
      if (!el) return;
      const navRect = navEl.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      pill.style.width = r.width + 'px';
      pill.style.height = r.height + 'px';
      pill.style.left = (r.left - navRect.left) + 'px';
      navEl.classList.add('has-pill');
    }

    function hidePill() {
      navEl.classList.remove('has-pill');
    }

    const navLinks = navEl.querySelectorAll('a[data-link]');
    navLinks.forEach(a => {
      a.addEventListener('mouseenter', () => movePillTo(a));
      a.addEventListener('focus', () => movePillTo(a));
    });
    navEl.addEventListener('mouseleave', () => {
      if (activePill) movePillTo(activePill);
      else hidePill();
    });

    // Track active section + move pill there idle
    const sections = document.querySelectorAll('section[id]');
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const matchingLink = navEl.querySelector('a[href="#' + id + '"]');
          if (matchingLink) {
            navLinks.forEach(l => l.classList.toggle('is-active', l === matchingLink));
            activePill = matchingLink;
            if (!navEl.matches(':hover')) movePillTo(matchingLink);
          }
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    sections.forEach(s => navIo.observe(s));
  }

  /* ============== SIGNATURE MOMENT — PROCESS SVG MORPH ============== */
  const stage = document.getElementById('processStage');
  if (stage) {
    const sticky = stage.querySelector('.process__sticky');
    if (sticky) {
      const morph = document.createElement('div');
      morph.className = 'process__morph';
      morph.innerHTML = `
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- STAGE 1: Bottle (resíduo) -->
          <g class="morph-stage" data-step="1">
            <!-- Bottle silhouette -->
            <path class="morph-shape morph-draw" d="M 175 90
              L 175 75 Q 175 65 185 65
              L 215 65 Q 225 65 225 75
              L 225 90
              Q 225 110 230 120
              L 240 145
              Q 250 165 250 195
              L 250 300
              Q 250 320 230 320
              L 170 320
              Q 150 320 150 300
              L 150 195
              Q 150 165 160 145
              L 170 120
              Q 175 110 175 90 Z"/>
            <!-- Bottle cap -->
            <rect class="morph-shape morph-draw" x="180" y="50" width="40" height="18" rx="2"/>
            <!-- Crumple lines -->
            <path class="morph-shape" d="M 165 200 Q 200 195 235 205" opacity=".5"/>
            <path class="morph-shape" d="M 160 240 Q 200 245 240 235" opacity=".4"/>
            <path class="morph-shape" d="M 170 275 Q 200 280 230 275" opacity=".3"/>
            <text class="morph-label" x="200" y="365">PET pós-consumo</text>
          </g>

          <!-- STAGE 2: Flakes (granulado) -->
          <g class="morph-stage" data-step="2">
            <!-- Larger central cluster with shape variation -->
            <path class="morph-shape morph-fill morph-flake" d="M 90 130 Q 100 115 120 122 Q 130 138 115 150 Q 92 152 90 130 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 170 105 Q 195 92 220 105 Q 225 125 200 132 Q 172 128 170 105 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 270 130 Q 295 122 310 140 Q 305 162 282 162 Q 263 152 270 130 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 120 200 Q 145 188 160 205 Q 158 228 135 232 Q 112 222 120 200 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 200 195 Q 230 188 250 210 Q 245 235 215 240 Q 192 222 200 195 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 290 210 Q 312 200 322 225 Q 312 245 290 240 Q 278 222 290 210 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 95 270 Q 118 258 140 275 Q 138 298 112 300 Q 88 290 95 270 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 180 280 Q 210 270 230 290 Q 222 315 195 318 Q 170 305 180 280 Z"/>
            <path class="morph-shape morph-fill morph-flake" d="M 265 285 Q 295 275 315 295 Q 308 318 282 320 Q 258 308 265 285 Z"/>
            <circle class="morph-shape morph-fill morph-flake" cx="65" cy="180" r="8"/>
            <circle class="morph-shape morph-fill morph-flake" cx="340" cy="180" r="9"/>
            <circle class="morph-shape morph-fill morph-flake" cx="160" cy="260" r="6"/>
            <text class="morph-label" x="200" y="365">Granulado · extrusão</text>
          </g>

          <!-- STAGE 3: Bag (sacola pronta) -->
          <g class="morph-stage" data-step="3">
            <!-- Bag body -->
            <path class="morph-shape morph-draw morph-fill" d="M 125 130
              L 125 320
              Q 125 335 140 335
              L 260 335
              Q 275 335 275 320
              L 275 130 Z"/>
            <!-- Bag handles -->
            <path class="morph-shape morph-draw" d="M 155 130
              L 155 90 Q 155 75 170 75
              L 190 75 Q 200 75 200 90
              L 200 130"/>
            <path class="morph-shape morph-draw" d="M 200 130
              L 200 90 Q 200 75 210 75
              L 230 75 Q 245 75 245 90
              L 245 130"/>
            <!-- Brand mark recycle on the bag -->
            <circle class="morph-shape" cx="200" cy="220" r="42" opacity=".5"/>
            <path class="morph-shape" d="M 200 200 L 188 218 L 195 218 M 188 218 L 175 240"
              opacity=".7"/>
            <path class="morph-shape" d="M 200 200 L 212 218 L 205 218 M 212 218 L 225 240"
              opacity=".7"/>
            <path class="morph-shape" d="M 175 250 L 225 250" opacity=".7"/>
            <text class="morph-label" x="200" y="385">Embalagem pronta</text>
          </g>
        </svg>
      `;
      sticky.appendChild(morph);

      const stages = morph.querySelectorAll('.morph-stage');
      function setMorphStage(idx) {
        stages.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      }
      setMorphStage(0);

      // Hook into existing chapter observer
      const chapters = stage.querySelectorAll('.chapter');
      const morphIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Array.from(chapters).indexOf(entry.target);
            if (idx >= 0) setMorphStage(idx);
          }
        });
      }, { rootMargin: '-30% 0px -30% 0px' });
      chapters.forEach(c => morphIo.observe(c));

      // Toggle morph-on class when process is in viewport
      const processSec = document.getElementById('processo');
      if (processSec) {
        const processIo = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) processSec.classList.add('morph-on');
          });
        }, { threshold: 0.15 });
        processIo.observe(processSec);
      }
    }
  }

  /* ============== LEI 2026 — COUNTDOWN LIVE ============== */
  const decreeHeading = document.querySelector('.decree__heading');
  if (decreeHeading) {
    const liveBadge = document.createElement('div');
    liveBadge.className = 'decree__live';
    liveBadge.innerHTML = '<span class="pulse"></span><span id="liveCountdown">Calculando…</span>';
    decreeHeading.parentElement.insertBefore(liveBadge, decreeHeading);

    function updateCountdown() {
      const el = document.getElementById('liveCountdown');
      if (!el) return;
      const now = new Date();
      const lawStart = new Date('2026-01-01T00:00:00-03:00');
      const next2030 = new Date('2030-01-01T00:00:00-03:00');
      const daysSinceLaw = Math.floor((now - lawStart) / 86400000);
      const daysTo2030 = Math.floor((next2030 - now) / 86400000);
      if (daysSinceLaw >= 0) {
        el.innerHTML = `Lei já em vigor há <strong>${daysSinceLaw} dias</strong> · próxima meta em <strong>${daysTo2030} dias</strong>`;
      } else {
        const dToStart = Math.abs(daysSinceLaw);
        el.innerHTML = `Faltam <strong>${dToStart} dias</strong> até a vigência da Lei 15.234/25`;
      }
    }
    updateCountdown();
    setInterval(updateCountdown, 60000);
  }

  /* ============== MARQUEE BIDIRECIONAL ============== */
  const marqueeEl = document.querySelector('.marquee');
  if (marqueeEl) {
    const firstTrack = marqueeEl.querySelector('.marquee__track');
    if (firstTrack) {
      // Wrap into row + reverse row
      firstTrack.classList.add('marquee__track--fwd');
      const row1 = document.createElement('div');
      row1.className = 'marquee__row';
      marqueeEl.insertBefore(row1, firstTrack);
      row1.appendChild(firstTrack);

      // Build reverse row with different terms
      const row2 = document.createElement('div');
      row2.className = 'marquee__row';
      const track2 = document.createElement('div');
      track2.className = 'marquee__track marquee__track--rev';
      track2.innerHTML = firstTrack.innerHTML
        .replace('Sacolas Camiseta', 'Pós-consumo')
        .replace('Sacolas Reforçadas', 'Rastreio de lote')
        .replace('Personalizadas', 'Flexografia 6 cores')
        .replace('Bobinas', 'Frete CIF')
        .replace('Atacado B2B', 'Lei 15.234/25')
        .replace('Plástico reciclado', '22% obrigatório em 2026');
      row2.appendChild(track2);
      marqueeEl.appendChild(row2);
    }
  }

  /* ============== IDLE PARTICLES (subtle floating amber dots) ============== */
  if (enableHeavy) {
    const hero = document.querySelector('.hero');
    if (hero) {
      const layer = document.createElement('div');
      layer.className = 'idle-particles';
      const COUNT = 14;
      for (let i = 0; i < COUNT; i++) {
        const p = document.createElement('span');
        p.style.left = (Math.random() * 100) + '%';
        p.style.bottom = '-10px';
        const dur = 14 + Math.random() * 12;
        p.style.animationDuration = dur + 's';
        p.style.animationDelay = (Math.random() * -dur) + 's';
        const scale = 0.5 + Math.random() * 1.4;
        p.style.transform = `scale(${scale})`;
        layer.appendChild(p);
      }
      hero.appendChild(layer);
    }
  }

  /* ============== SECTION EYEBROW REVEAL CLASS ============== */
  document.querySelectorAll('.section-eyebrow').forEach(el => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ============== DECREE TIMELINE FILL TRIGGER ============== */
  const timeline = document.querySelector('.decree__timeline');
  if (timeline) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          timeline.classList.add('is-in');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(timeline);
  }

  /* ============== CONSOLE BANNER PREMIUM ============== */
  console.log('%c Qualità · Premium Layer 2026 ', 'background:#B8841E;color:#1F4530;padding:8px 14px;font-family:monospace;font-weight:bold;letter-spacing:.1em;');
})();
