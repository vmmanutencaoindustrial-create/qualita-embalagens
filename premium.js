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

          <!-- STAGE 3: Sacola desenhada em traços dourados + logo Qualità -->
          <g class="morph-stage" data-step="3">
            <!-- Bag body -->
            <path class="morph-shape morph-draw morph-fill" d="M 125 130
              L 125 320
              Q 125 335 140 335
              L 260 335
              Q 275 335 275 320
              L 275 130 Z"/>
            <!-- Bag handles (camiseta) -->
            <path class="morph-shape morph-draw" d="M 155 130
              L 155 90 Q 155 75 170 75
              L 190 75 Q 200 75 200 90
              L 200 130"/>
            <path class="morph-shape morph-draw" d="M 200 130
              L 200 90 Q 200 75 210 75
              L 230 75 Q 245 75 245 90
              L 245 130"/>

            <!-- Logo Qualità dentro da sacola: símbolo de reciclagem + texto -->
            <g class="morph-logo">
              <!-- Símbolo de reciclagem (3 setas em triângulo) -->
              <g transform="translate(165, 175)" class="morph-shape">
                <!-- Seta superior -->
                <path d="M 15 8 L 22 0 L 29 8 L 25 8 L 25 16 L 19 16 L 19 8 Z"
                      fill="rgba(232,185,49,.85)"/>
                <!-- Seta inferior-esquerda -->
                <path d="M 0 32 L 4 24 L 12 28 L 10 30 L 14 38 L 8 41 L 4 33 Z"
                      fill="rgba(232,185,49,.85)"/>
                <!-- Seta inferior-direita -->
                <path d="M 44 32 L 40 24 L 32 28 L 34 30 L 30 38 L 36 41 L 40 33 Z"
                      fill="rgba(232,185,49,.85)"/>
                <!-- Conectores entre setas (formato triangular) -->
                <path d="M 22 4 L 12 22 L 32 22 Z"
                      fill="none" stroke="rgba(232,185,49,.55)" stroke-width="1.5"/>
              </g>

              <!-- Texto Qualità em dourado -->
              <text class="morph-wordmark" x="200" y="252"
                    text-anchor="middle"
                    font-family="'Bricolage Grotesque', sans-serif"
                    font-size="32" font-weight="700"
                    fill="rgba(232,185,49,.92)"
                    letter-spacing="-.5">Qualità</text>

              <!-- Underline sutil -->
              <line x1="155" y1="270" x2="245" y2="270"
                    stroke="rgba(232,185,49,.45)" stroke-width="1"/>

              <!-- Tagline pequena -->
              <text class="morph-tagline" x="200" y="290"
                    text-anchor="middle"
                    font-family="monospace"
                    font-size="7"
                    letter-spacing="2"
                    fill="rgba(232,185,49,.6)">RECICLE · TRANSFORME · IMPACTE</text>
            </g>

            <text class="morph-label" x="200" y="385">Embalagem Qualità · pronta</text>
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

  /* ============== QUOTE — char split + reveal stagger ============== */
  const quoteEl = document.querySelector('.quote blockquote');
  if (quoteEl) {
    // wrap each word in a span containing chars
    const html = quoteEl.innerHTML;
    // Walk text nodes only — preserve <em> tags
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const frag = document.createDocumentFragment();
        [...text].forEach((c, i) => {
          if (c === ' ') {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.className = 'quote-char';
            span.textContent = c;
            span.style.transitionDelay = (Math.random() * 0.6) + 's';
            frag.appendChild(span);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(processNode);
      }
    }
    [...quoteEl.childNodes].forEach(processNode);

    const quoteSec = quoteEl.closest('.quote');
    if (quoteSec) {
      const qio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            quoteSec.classList.add('is-in');
            qio.disconnect();
          }
        });
      }, { threshold: 0.3 });
      qio.observe(quoteSec);
    }
  }

  /* ============== BAG COMPANION (mascote percorre o site) ============== */
  const bag = document.getElementById('bagCompanion');
  if (bag) {
    const bubble = document.getElementById('bagBubble');
    const bubbleText = bubble && bubble.querySelector('.bag-companion__bubble-text');

    const states = {
      hero:              { msg: 'Oi! Sou 100% reciclada ✨',     flip: null },
      marquee:           { msg: null,                            hide: true, flip: 'r1' },
      manifesto:         { msg: 'Eu era resíduo. Agora circulo.', flip: 'r2' },
      'zoom-in':         { msg: null,                            hide: true, flip: 'up' },
      processo:          { msg: null,                            hide: true, flip: 'r1' },
      stats:             { msg: '100% pós-consumo ✓',            flip: 'tilt' },
      produtos:          { msg: 'Linha de 4 — escolhe a sua',    flip: 'r1' },
      decreto:           { msg: '22% obrigatório · 2026 ✓',      flip: 'r2' },
      diferenciais:      { msg: 'Atendo Brasil todo',            side: 'left', flip: 'up' },
      sustentabilidade:  { msg: 'Uma garrafa a menos no oceano 🌊', flip: 'r2' },
      contato:           { msg: 'Manda mensagem aí 👋',          side: 'left', flip: 'r3' },
      footer:            { msg: null,                            fall: true, flip: null }
    };

    // Cycle through flip types to keep it interesting if the user revisits the same section
    const flipCycle = ['r1', 'r2', 'tilt', 'up', 'r3'];
    let flipIdx = 0;

    // Section order (for first-pass and unknown detection)
    const order = Object.keys(states);
    const sectionEls = order.map(id => document.getElementById(id)).filter(Boolean);

    let currentState = null;
    function applyState(name) {
      if (!states[name] || name === currentState) return;
      const previous = currentState;
      currentState = name;
      // remove old states
      order.forEach(s => bag.classList.remove('bag-state-' + s));
      bag.classList.add('bag-state-' + name);

      const cfg = states[name];

      // Visibility
      if (cfg.hide) {
        bag.classList.remove('is-visible');
        bag.classList.remove('has-bubble');
      } else {
        bag.classList.add('is-visible');
      }

      // Side
      bag.classList.toggle('is-left', cfg.side === 'left');

      // 3D flip — sequencia: 1) gira a sacola da frente, 2) revela a de trás, 3) volta ao default
      // Pra ficar dinâmico, faz o flip rápido e depois recompõe na posição final
      if (previous !== null) {
        const flipKind = cfg.flip || flipCycle[flipIdx++ % flipCycle.length];
        bag.setAttribute('data-flip', flipKind);
        // 850ms depois volta ao default (sacola da frente alinhada de novo)
        setTimeout(() => {
          if (currentState === name) bag.removeAttribute('data-flip');
        }, 850);
      }

      // Bubble
      if (cfg.msg && bubbleText) {
        bubbleText.textContent = cfg.msg;
        setTimeout(() => {
          if (currentState === name && !cfg.hide) bag.classList.add('has-bubble');
        }, 450);
      } else {
        bag.classList.remove('has-bubble');
      }
    }

    // Use IntersectionObserver per section (avoid scroll-thrash)
    // Lower threshold + rootMargin pra detectar seções grandes (zoom-in) que
    // raramente atingem 25% de ratio na viewport
    const bagIo = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) applyState(best.target.id);
    }, { threshold: [0, 0.1, 0.25, 0.5], rootMargin: '-30% 0px -30% 0px' });
    sectionEls.forEach(el => bagIo.observe(el));

    // Dedicated observer for zoom-in section (tall sticky scene) — uses
    // a thin slice at viewport center so the section "wins" while it's pinned
    const zoomEl = document.getElementById('zoom-in');
    if (zoomEl) {
      const zoomIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) applyState('zoom-in');
        });
      }, { rootMargin: '-40% 0px -40% 0px' });
      zoomIo.observe(zoomEl);
    }

    // also watch hero + footer via separate observers
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      const heroIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio > 0.4) applyState('hero');
        });
      }, { threshold: 0.4 });
      heroIo.observe(heroEl);
    }
    const footerEl = document.querySelector('.footer');
    if (footerEl) {
      const footerIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio > 0.15) applyState('footer');
        });
      }, { threshold: 0.15 });
      footerIo.observe(footerEl);
    }

    // First boot: assume hero
    applyState('hero');

    // After 1.4s, if still on hero (page top), show bag with welcome msg
    setTimeout(() => {
      if (window.scrollY < 100) {
        bag.classList.add('is-visible');
        if (bubbleText) bubbleText.textContent = 'Oi! Sou 100% reciclada ✨';
        bag.classList.add('has-bubble');
        // Auto-hide bubble after 4s
        setTimeout(() => {
          if (currentState === 'hero') bag.classList.remove('has-bubble');
        }, 4500);
      }
    }, 1600);
  }

  /* ============== HERO STATS — COUNT-UP + TYPEWRITER ============== */
  function countUp(el, target, suffix, duration = 1400) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.floor(target * eased);
      el.textContent = value + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
  function typewriter(el, target, perCharMs = 110) {
    el.textContent = '';
    let i = 0;
    function step() {
      el.textContent = target.slice(0, ++i);
      if (i < target.length) setTimeout(step, perCharMs);
    }
    setTimeout(step, 120);
  }
  const heroStatsIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.countUp) {
          countUp(el, parseFloat(el.dataset.countUp), el.dataset.suffix || '');
        } else if (el.dataset.typewriter) {
          typewriter(el, el.dataset.typewriter);
        }
        heroStatsIo.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count-up], [data-typewriter]').forEach(el => heroStatsIo.observe(el));

  /* ============== ZOOM-IN CINEMATOGRAFICO ============== */
  const zoomSec = document.getElementById('zoom-in');
  if (zoomSec && !reduced) {
    let raf;
    function updateZoom() {
      const r = zoomSec.getBoundingClientRect();
      const total = zoomSec.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(Math.max(-r.top / total, 0), 1);
      const eased = p < 0.5
        ? 2 * p * p
        : 1 - Math.pow(-2 * p + 2, 2) / 2;
      zoomSec.style.setProperty('--zp', eased.toFixed(4));
      // --mp: máscara de entrada, 0→1 nos primeiros 12% do scroll da seção
      const mp = Math.min(p / 0.12, 1);
      const mpEased = 1 - Math.pow(1 - mp, 3); // ease-out cubic
      zoomSec.style.setProperty('--mp', mpEased.toFixed(4));
      raf = null;
    }
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(updateZoom);
    }, { passive: true });
    window.addEventListener('resize', updateZoom);
    updateZoom();
  }

  /* ============== P1#5 — VARIABLE FONT SCROLL-DRIVEN ============== */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !reduced) {
    let rafW;
    function updateWght() {
      const r = heroTitle.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando topo acima da viewport, 1 quando topo no fim viewport
      const p = Math.min(Math.max(1 - (r.top / vh), 0), 1.5);
      // wght: 400 → 800 → 600 (curva swooping)
      const wght = 400 + Math.sin(p * Math.PI) * 400;
      document.documentElement.style.setProperty('--wght', Math.round(wght));
      rafW = null;
    }
    window.addEventListener('scroll', () => {
      if (rafW) return;
      rafW = requestAnimationFrame(updateWght);
    }, { passive: true });
    updateWght();
  }

  /* ============== P1#9 — NAV INDICATOR LATERAL ============== */
  const sideNav = document.getElementById('sideNav');
  if (sideNav) {
    const sections = [
      { id: 'hero',             label: 'Hero',         dark: true },
      { id: 'manifesto',        label: 'Manifesto',    dark: false },
      { id: 'zoom-in',          label: 'Por dentro',   dark: true },
      { id: 'processo',         label: 'Processo',     dark: true },
      { id: 'produtos',         label: 'Produtos',     dark: false },
      { id: 'decreto',          label: 'Decreto 2026', dark: true },
      { id: 'diferenciais',     label: 'Diferenciais', dark: false },
      { id: 'sustentabilidade', label: 'Impacto',      dark: false },
      { id: 'contato',          label: 'Contato',      dark: false }
    ];
    const dotMap = new Map();
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const dot = document.createElement('a');
      dot.className = 'side-nav__dot';
      dot.href = '#' + s.id;
      dot.dataset.label = s.label;
      dot.dataset.section = s.id;
      dot.dataset.dark = s.dark;
      sideNav.appendChild(dot);
      dotMap.set(s.id, dot);
    });

    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const dot = dotMap.get(e.target.id);
          if (!dot) return;
          dotMap.forEach(d => d.classList.remove('is-active'));
          dot.classList.add('is-active');
          // switch dark/light side nav style
          if (dot.dataset.dark === 'true') sideNav.classList.add('on-dark');
          else sideNav.classList.remove('on-dark');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) navIo.observe(el);
    });
  }

  /* ============== P2#11 — SOUND TOGGLE ============== */
  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) {
    let audioCtx = null;
    let soundOn = false;

    function ensureCtx() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      return audioCtx;
    }
    function beep(freq, dur, type='sine', gain=.05) {
      if (!soundOn) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    }

    soundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      soundOn = !soundOn;
      soundBtn.classList.toggle('is-on', soundOn);
      soundBtn.setAttribute('aria-label', soundOn ? 'Desativar som' : 'Ativar som');
      if (soundOn) {
        ensureCtx();
        beep(523, .12, 'sine', .08); // click confirma
      }
    });

    // Tick em hover de elementos interativos
    document.querySelectorAll('a, button, [data-magnetic], [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => beep(880, .04, 'triangle', .02));
    });
    // Thunk no click em botões
    document.querySelectorAll('button, .btn, [data-magnetic]').forEach(el => {
      el.addEventListener('click', () => beep(220, .15, 'sine', .04));
    });
  }

  /* ============== P2#12 — ANCHOR PAGE TRANSITIONS (fade-blur curto) ============== */
  const pageFade = document.getElementById('pageFade');
  if (pageFade) {
    document.querySelectorAll('a[href^="#"]:not(.side-nav__dot)').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        pageFade.classList.add('is-flashing');
        setTimeout(() => {
          const top = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 180);
        setTimeout(() => pageFade.classList.remove('is-flashing'), 700);
      });
    });
  }

  /* ============== CONSOLE BANNER PREMIUM ============== */
  console.log('%c Qualità · Premium Layer 2026 ', 'background:#B8841E;color:#1F4530;padding:8px 14px;font-family:monospace;font-weight:bold;letter-spacing:.1em;');
})();
