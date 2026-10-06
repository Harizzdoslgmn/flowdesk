/* FlowDesk v3 — interações
   nav · hero (aurora, dot grid, conversa, relógio, tilt+glare) · números (count-up) · pausa · manifesto (scroll words)
   virada (toggle) · produto (dashboard float, chart) · spotlight · magnet · reveals (GSAP → IO fallback) · motion toggle */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const noReveal = location.search.includes('noreveal'); // depuração: tudo visível, sem scroll suave
  let reduced = mqReduced.matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !noReveal;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (noReveal) html.style.scrollBehavior = 'auto';

  /* ---------- Pausar animações (botão) + reduced motion ---------- */
  const motionBtn = $('#motion-toggle');
  const motionKey = 'fd-motion';
  let paused = false;
  try { paused = localStorage.getItem(motionKey) === 'paused'; } catch (_) {}
  const applyMotion = () => {
    const off = paused || reduced;
    html.classList.toggle('motion-off', off);
    if (motionBtn) {
      motionBtn.setAttribute('aria-pressed', String(paused));
      motionBtn.setAttribute('aria-label', paused ? 'Retomar animações' : 'Pausar animações');
      motionBtn.title = paused ? 'Retomar animações' : 'Pausar animações';
    }
  };
  applyMotion();
  motionBtn && motionBtn.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(motionKey, paused ? 'paused' : 'on'); } catch (_) {}
    applyMotion();
  });
  mqReduced.addEventListener && mqReduced.addEventListener('change', e => { reduced = e.matches; applyMotion(); });
  const motionOff = () => html.classList.contains('motion-off');

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    nav.classList.toggle('is-hidden', y > lastY && y > 320 && !menuOpen());
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('.nav-toggle');
  const menu = $('#menu-mobile');
  const menuOpen = () => toggle && toggle.getAttribute('aria-expanded') === 'true';
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menuOpen();
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      menu.hidden = open;
    });
    $$('a', menu).forEach(a => a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); menu.hidden = true;
    }));
  }

  /* ---------- Split text (palavras / linhas) ---------- */
  const splitWords = (el) => {
    if (el.dataset.splitDone) return $$('.w', el);
    const text = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    text.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      el.appendChild(s);
      if (i < text.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.splitDone = '1';
    return $$('.w', el);
  };

  /* ---------- Hero: aurora (canvas 2D) ---------- */
  const aurora = $('#aurora');
  if (aurora) {
    const ctx = aurora.getContext('2d');
    const blobs = [
      { x: .72, y: .35, r: .55, c: [61, 110, 255], a: .55, dx: .00011, dy: .00007, p: 0 },
      { x: .25, y: .70, r: .40, c: [240, 182, 74], a: .22, dx: -.00009, dy: .00012, p: 2 },
      { x: .50, y: .10, r: .45, c: [34, 89, 255], a: .35, dx: .00007, dy: -.00009, p: 4 },
    ];
    let w, h, raf, visible = true, t0 = performance.now();
    const size = () => { const r = aurora.getBoundingClientRect(); w = aurora.width = Math.max(1, Math.floor(r.width / 2)); h = aurora.height = Math.max(1, Math.floor(r.height / 2)); };
    const draw = (now) => {
      raf = null;
      ctx.clearRect(0, 0, w, h);
      const t = now - t0;
      blobs.forEach(b => {
        const x = (b.x + Math.sin(t * b.dx + b.p) * .08) * w;
        const y = (b.y + Math.cos(t * b.dy + b.p) * .08) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${b.c},${b.a})`); g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      if (visible && !motionOff()) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
    size(); start();
    window.addEventListener('resize', () => { size(); start(); }, { passive: true });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(aurora);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    motionBtn && motionBtn.addEventListener('click', () => { if (!motionOff()) start(); else { setTimeout(() => draw(performance.now()), 0); } });
  }

  /* ---------- Hero: dot grid que reage ao cursor ---------- */
  const dots = $('#dotgrid');
  if (dots && finePointer) {
    const ctx = dots.getContext('2d');
    const GAP = 28, R = 110;
    let w, h, cols, rows, mx = -9999, my = -9999, raf, visible = true;
    const size = () => { const r = dots.getBoundingClientRect(); w = dots.width = Math.floor(r.width); h = dots.height = Math.floor(r.height); cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1; };
    const draw = () => {
      raf = null;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = i * GAP, y = j * GAP;
        const d = Math.hypot(x - mx, y - my);
        const k = Math.max(0, 1 - d / R);
        const a = .10 + k * .7, s = 1 + k * 1.6;
        ctx.fillStyle = k > 0 ? `rgba(110,147,255,${a})` : `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      }
    };
    const req = () => { if (!raf && visible) raf = requestAnimationFrame(draw); };
    size(); req();
    window.addEventListener('resize', () => { size(); req(); }, { passive: true });
    const hero = $('#hero');
    hero.addEventListener('pointermove', e => { if (motionOff()) return; const r = dots.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; req(); });
    hero.addEventListener('pointerleave', () => { mx = my = -9999; req(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; req(); }).observe(dots);
  }

  /* ---------- Hero: conversa orquestrada + relógio parado ---------- */
  const phone = $('#phone');
  const stallClock = $('#stall-clock');
  const ctaClock = $('#cta-clock');
  const typing = $('.typing', phone);
  let stalledSeconds = 17 * 60 + 4; // o número dos anúncios
  const pad = n => String(n).padStart(2, '0');
  const fmt = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  const tick = () => { stalledSeconds += 1; const t = fmt(stalledSeconds); if (stallClock) stallClock.textContent = t; if (ctaClock) ctaClock.textContent = t; };
  if (phone) {
    requestAnimationFrame(() => phone.classList.add('is-ready'));
    setTimeout(() => { typing && typing.classList.add('is-stalled'); setInterval(tick, 1000); }, reduced ? 0 : 3400);
  }

  /* ---------- Tilt + glare (celular) ---------- */
  $$('[data-tilt]').forEach(el => {
    if (!finePointer) return;
    const glare = $('.glare', el);
    const wrap = el.parentElement;
    let raf = null, rx = 0, ry = 0, gx = 50, gy = 50;
    const apply = () => { raf = null; el.style.transform = `rotate(-1.2deg) rotateX(${rx}deg) rotateY(${ry}deg)`; if (glare) glare.style.setProperty('--gx', gx + '%'), glare.style.setProperty('--gy', gy + '%'); };
    wrap.addEventListener('pointermove', e => {
      if (motionOff()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry = (px - .5) * 10; rx = (.5 - py) * 10; gx = px * 100; gy = py * 100;
      el.classList.add('is-tilting');
      if (!raf) raf = requestAnimationFrame(apply);
    });
    wrap.addEventListener('pointerleave', () => { rx = ry = 0; gx = gy = 50; el.classList.remove('is-tilting'); if (!raf) raf = requestAnimationFrame(apply); });
  });

  /* ---------- Spotlight nos cards ---------- */
  if (finePointer) {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Magnet nos botões principais ---------- */
  if (finePointer && hasGsap) {
    $$('[data-magnet]').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3' });
      btn.addEventListener('pointermove', e => {
        if (motionOff()) return;
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .28); yTo((e.clientY - (r.top + r.height / 2)) * .28);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Count-up nos números ---------- */
  const counters = $$('[data-count]');
  const fmtNum = (v, d) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const runCounter = (el) => {
    const end = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || '0', 10);
    if (reduced || !hasGsap) { el.textContent = fmtNum(end, d); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmtNum(o.v, d); } });
  };
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
      counters.forEach(c => cio.observe(c));
    } else counters.forEach(runCounter);
  }

  /* ---------- Reveals + títulos (GSAP, com fallback IO) ---------- */
  const revealEls = $$('[data-reveal]');
  const splitHeads = $$('[data-split="words"]');
  if (hasGsap && !reduced) {
    splitHeads.forEach(h => {
      const words = splitWords(h);
      gsap.set(words, { yPercent: 110, opacity: 0 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => gsap.to(words, { yPercent: 0, opacity: 1, duration: .9, ease: 'power4.out', stagger: .035 }) });
    });
    revealEls.forEach(el => {
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => el.classList.add('is-in') });
    });
  } else if ('IntersectionObserver' in window && !reduced && !noReveal) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    revealEls.forEach(el => io.observe(el));
    splitHeads.forEach(h => h.classList.add('is-in'));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
    splitHeads.forEach(h => h.classList.add('is-in'));
  }

  /* ---------- Manifesto: palavras acendem com o scroll ---------- */
  $$('[data-scrollwords]').forEach(p => {
    const words = splitWords(p);
    if (hasGsap && !reduced) {
      gsap.set(words, { opacity: .12 });
      gsap.to(words, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 35%', scrub: .6 } });
    } else {
      words.forEach(w => w.style.opacity = 1);
    }
  });

  /* ---------- Dashboard: entra inclinado e assenta ---------- */
  const dash = $('[data-float]');
  if (dash && hasGsap && !reduced) {
    gsap.fromTo(dash, { rotateX: 14, y: 60, scale: .96 }, { rotateX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: dash, start: 'top 95%', end: 'top 35%', scrub: .5 } });
  }

  /* ---------- A pausa: relógio fixo acompanha o scroll ---------- */
  const clockCard = $('#clock-card'), clockTime = $('#clock-time'), clockBar = $('#clock-bar');
  const steps = $$('.pausa-step');
  const scramble = (el, text) => {
    if (reduced || motionOff()) { el.textContent = text; return; }
    const chars = '0123456789:+';
    let i = 0; const len = Math.max(text.length, el.textContent.length);
    const id = setInterval(() => {
      el.textContent = text.split('').map((c, k) => k < i ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
      i++; if (i > len) { clearInterval(id); el.textContent = text; }
    }, 30);
  };
  const setStep = (li) => {
    steps.forEach(s => s.classList.toggle('is-active', s === li));
    if (!clockCard || clockCard.dataset.state === li.dataset.state) return;
    clockCard.dataset.state = li.dataset.state;
    scramble(clockTime, li.dataset.time);
    clockBar.style.width = li.dataset.progress + '%';
  };
  if (steps.length && 'IntersectionObserver' in window) {
    const stepIO = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting);
      if (!visible.length) return;
      const mid = window.innerHeight / 2;
      visible.sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - mid) - Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - mid));
      setStep(visible[0].target);
    }, { rootMargin: '-35% 0px -35% 0px', threshold: [0, .25, .5, .75, 1] });
    steps.forEach(s => stepIO.observe(s));
    steps[0].classList.add('is-active');
  }

  /* ---------- A virada: toggle Sem / Com ---------- */
  const replay = $('#replay'), toggleBox = $('.toggle'), tabs = $$('.toggle-btn');
  const tlSem = $('.tl-sem'), tlCom = $('.tl-com'), metricVals = $$('.metric-val');
  const setMode = (mode) => {
    if (!replay) return;
    replay.dataset.mode = mode;
    toggleBox.classList.toggle('is-com', mode === 'com');
    tabs.forEach(t => { const on = t.dataset.mode === mode; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
    const show = mode === 'com' ? tlCom : tlSem, hide = mode === 'com' ? tlSem : tlCom;
    hide.hidden = true; show.hidden = true; void show.offsetWidth; show.hidden = false;
    metricVals.forEach(v => { v.classList.remove('is-swap'); void v.offsetWidth; v.textContent = v.dataset[mode]; v.classList.add('is-swap'); });
  };
  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
  toggleBox && toggleBox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = replay.dataset.mode === 'sem' ? 'com' : 'sem'; setMode(next); $(`.toggle-btn[data-mode="${next}"]`).focus(); }
  });

  /* ---------- Chart: barras + tooltip ---------- */
  const chart = $('#chart-leads'), tip = $('#chart-tip');
  if (chart) {
    if ('IntersectionObserver' in window && !reduced) {
      const cio = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { chart.classList.add('is-in'); cio.disconnect(); } }); }, { threshold: .4 });
      cio.observe(chart);
    } else chart.classList.add('is-in');
    const showTip = (bar) => {
      const r = bar.getBoundingClientRect(), c = chart.getBoundingClientRect();
      const h = (parseFloat(bar.style.getPropertyValue('--v')) / 100) * (c.height - 10);
      tip.innerHTML = `${bar.dataset.d} · <b>${bar.dataset.n}</b> leads`;
      tip.style.left = (r.left - c.left + r.width / 2) + 'px'; tip.style.top = (c.height - h) + 'px';
      tip.classList.add('is-on'); tip.setAttribute('aria-hidden', 'false');
    };
    const hideTip = () => { tip.classList.remove('is-on'); tip.setAttribute('aria-hidden', 'true'); };
    $$('.bar', chart).forEach(b => {
      b.setAttribute('aria-label', `${b.dataset.d}: ${b.dataset.n} leads`);
      b.addEventListener('mouseenter', () => showTip(b)); b.addEventListener('focus', () => showTip(b));
      b.addEventListener('mouseleave', hideTip); b.addEventListener('blur', hideTip);
    });
  }

  /* ---------- WhatsApp flutuante depois do hero ---------- */
  const wa = $('.wa-float'), heroEl = $('.hero');
  if (wa && heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => wa.classList.toggle('is-visible', !e.isIntersecting), { threshold: .2 }).observe(heroEl);
  } else if (wa) wa.classList.add('is-visible');

  /* ---------- Ano ---------- */
  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
