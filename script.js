(() => {
  'use strict';
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (temGsap) gsap.registerPlugin(ScrollTrigger);

  /* ───────── CTA: WhatsApp ou, enquanto não há número, DM do Instagram ───────── */
  // Número do WhatsApp comercial, só dígitos com DDI+DDD. Ex.: 5511999999999
  const WHATSAPP = '5511977160644';
  const MENSAGEM = 'Oi! Vim pelo site do FlowDesk e quero saber mais sobre o teste de 3 dias.';
  const INSTAGRAM_DM = 'https://ig.me/m/flowdeskcrm';
  document.querySelectorAll('.js-wpp').forEach(a => {
    a.target = '_blank'; a.rel = 'noopener';
    const texto = a.querySelector('span');
    if (WHATSAPP) {
      a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(MENSAGEM);
      a.setAttribute('aria-label', (texto ? texto.textContent : a.textContent).trim() + ', abre o WhatsApp em outra aba');
      return;
    }
    a.href = INSTAGRAM_DM;
    const ico = a.querySelector('use'); if (ico) ico.setAttribute('href', '#i-instagram');
    if (texto) texto.textContent = texto.textContent.replace('Falar no WhatsApp', 'Chamar no Instagram').replace('Quero testar 3 dias', 'Chamar no Instagram');
    a.setAttribute('aria-label', 'Chamar no Instagram, abre em outra aba');
  });
  if (!WHATSAPP) {
    console.error('[FlowDesk] WHATSAPP vazio em script.js: os botões estão indo para a DM do Instagram. Preencha o número antes de publicar.');
    const nota = document.getElementById('ctaNote');
    if (nota) nota.textContent = 'Atendimento pelo Instagram, de segunda a segunda, 9h às 18h. Uma pessoa da equipe responde em até 10 minutos e combina com você o teste de 3 dias.';
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
    if (!local) {
      const aviso = document.createElement('p');
      aviso.setAttribute('role', 'status');
      aviso.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99;margin:0;padding:8px 16px;background:#C32F2F;color:#fff;font:600 13px/1.4 Urbanist,system-ui,sans-serif;text-align:center';
      aviso.textContent = 'Site em configuração: o número do WhatsApp ainda não foi cadastrado.';
      document.body.prepend(aviso);
    }
  }

  /* páginas secundárias (termos) param aqui: só CTA e navbar */
  if (!document.getElementById('hero')) return;

  /* ───────── fundo: malha em perspectiva (canvas 2D, no lugar do Three.js da referência) ───────── */
  const gl = document.getElementById('gl');
  if (gl && !semMovimento) {
    const ctx = gl.getContext('2d');
    let W, H, t = 0, raf;
    const COLS = 46, ROWS = 26;
    function size() { W = gl.width = innerWidth * devicePixelRatio; H = gl.height = innerHeight * devicePixelRatio; }
    size(); addEventListener('resize', size);
    function ponto(c, r) {
      const u = c / COLS - 0.5, z = r / ROWS;
      const y = H * 0.62 + Math.pow(z, 1.6) * H * 0.9;
      const spread = 0.25 + z * 1.7;
      const wave = Math.sin(u * 7 + t * 3 + z * 4) * 18 * devicePixelRatio * (0.3 + z);
      return [W / 2 + u * W * spread, y + wave];
    }
    function frame() {
      t += 0.004;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1 * devicePixelRatio;
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) { const [x, y] = ponto(c, r); if (c === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.strokeStyle = `rgba(96,138,255,${0.03 + (r / ROWS) * 0.12})`; ctx.stroke();
      }
      for (let c = 0; c <= COLS; c += 2) {
        ctx.beginPath();
        for (let r = 0; r <= ROWS; r++) { const [x, y] = ponto(c, r); if (r === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.strokeStyle = 'rgba(96,138,255,0.07)'; ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else frame(); });
  } else if (gl) { gl.style.display = 'none'; }

  /* ───────── helpers de split ───────── */
  function splitChars(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const chars = [];
    words.forEach((w, i) => {
      const ww = document.createElement('span'); ww.className = 'word-w';
      for (const ch of w) { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; ww.appendChild(s); chars.push(s); }
      el.appendChild(ww);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return chars;
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    return words.map((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; el.appendChild(s); if (i < words.length - 1) el.appendChild(document.createTextNode(' ')); return s; });
  }

  /* ───────── nav ───────── */
  const nav = document.getElementById('nav');
  /* ───────── navbar de vidro: a pílula branca desliza até a seção ativa ───────── */
  const glassNav = document.getElementById('glassNav');
  if (glassNav) {
    const pill = glassNav.querySelector('.glass-pill');
    const links = [...glassNav.querySelectorAll('.nav-link')];
    const alvos = links.map(l => document.querySelector(l.getAttribute('href')));
    let atual = null;
    function movePill(a) {
      if (!a) return;
      pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      pill.style.width = a.offsetWidth + 'px';
      pill.classList.add('is-on');
      links.forEach(l => l.classList.toggle('is-active', l === a));
      atual = a;
    }
    function ativaPorScroll() {
      const y = scrollY + innerHeight * .35;
      let i = 0;
      alvos.forEach((s, k) => { if (s && s.getBoundingClientRect().top + scrollY <= y) i = k; });
      movePill(links[i]);
    }
    addEventListener('scroll', ativaPorScroll, { passive: true });
    addEventListener('resize', () => movePill(atual || links[0]));
    links.forEach(l => l.addEventListener('click', () => movePill(l)));
    ativaPorScroll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ativaPorScroll);
    addEventListener('load', ativaPorScroll);
  }

  const menuWrap = document.getElementById('navMenuWrap');
  const menuBtn = document.getElementById('navMenuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', e => { e.stopPropagation(); const on = menuWrap.classList.toggle('is-open'); menuBtn.setAttribute('aria-expanded', on); });
    addEventListener('click', () => { menuWrap.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  }
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: semMovimento ? 'auto' : 'smooth' }));
  function navSolid() { nav.classList.toggle('is-solid', scrollY > 80); if (toTop) toTop.classList.toggle('is-on', scrollY > 900); }
  addEventListener('scroll', navSolid, { passive: true }); navSolid();

  /* ───────── marquee de segmentos ───────── */
  const SEGMENTOS = ['Estética', 'Salões de beleza', 'Harmonização facial', 'Odontologia', 'Academias', 'Barbearias', 'Imobiliárias', 'Oficinas', 'Prestadores de serviço', 'Negócios locais'];
  document.querySelectorAll('.marquee-track').forEach(track => {
    const html = SEGMENTOS.map(s => `<span class="lang-chip"><i></i>${s}</span>`).join('');
    track.innerHTML = semMovimento ? html : html + html;
    if (temGsap && !semMovimento) gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  });

  /* ───────── seletor de preço ───────── */
  const planos = document.querySelectorAll('.plan');
  const priceValue = document.getElementById('priceValue');
  const priceLabel = document.getElementById('priceLabel');
  planos.forEach(b => b.addEventListener('click', () => {
    planos.forEach(x => x.classList.toggle('is-active', x === b));
    priceValue.textContent = b.dataset.price;
    priceLabel.textContent = b.dataset.label;
  }));

  /* ───────── passos: avançam sozinhos, 6 s cada ───────── */
  const stepItems = document.querySelectorAll('.step-item');
  const stepShots = document.querySelectorAll('.step-shot');
  const stepFills = document.querySelectorAll('.step-line-fill');
  const stepDots = document.querySelectorAll('.steps-dots button');
  const railFill = document.getElementById('stepsRailFill');
  const railDot = document.getElementById('stepsRailDot');
  const counterNum = document.getElementById('stepsCounterNum');
  let stepStart = 0, stepRaf = null;
  const STEP_MS = 6000;
  function setStep(i) {
    counterNum.textContent = '0' + (i + 1);
    stepItems.forEach((el, k) => el.classList.toggle('is-active', k === i));
    stepDots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    stepShots.forEach((s, k) => s.classList.toggle('is-active', k === i));
  }
  function runStep(i) {
    cancelAnimationFrame(stepRaf);
    setStep(i);
    stepFills.forEach(el => { el.style.width = '0%'; });
    stepStart = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - stepStart) / STEP_MS);
      stepFills[i].style.width = (p * 100) + '%';
      const total = ((i + p) / 4) * 100;
      railFill.style.height = total + '%'; railDot.style.top = total + '%';
      if (p < 1) stepRaf = requestAnimationFrame(tick); else runStep((i + 1) % 4);
    };
    stepRaf = requestAnimationFrame(tick);
  }
  if (stepItems.length) {
    if (semMovimento) { setStep(0); railFill.style.height = '25%'; railDot.style.top = '25%'; }
    else runStep(0);
    stepItems.forEach(el => el.addEventListener('click', () => runStep(+el.dataset.step)));
    stepDots.forEach(d => d.addEventListener('click', () => runStep(+d.dataset.step)));
  }

  /* ───────── sem GSAP ou com menos movimento: tudo visível e paramos aqui ───────── */
  if (!temGsap || semMovimento) {
    document.querySelectorAll('.statement-text').forEach(el => { el.style.color = 'var(--text)'; });
    return;
  }

  /* ───────── barra de progresso ───────── */
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => gsap.set('#scrollProgress', { scaleX: self.progress }) });

  /* ───────── trilhas: desenham uma vez ao entrar; pulsos viajam para sempre ───────── */
  document.querySelectorAll('path[data-draw]').forEach(p => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    gsap.to(p, { strokeDashoffset: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: p.closest('svg'), start: 'top 92%', once: true } });
  });
  document.querySelectorAll('path[data-pulse]').forEach(p => {
    const L = p.getTotalLength();
    const seg = Math.min(60, L * .22);
    p.style.strokeDasharray = `${seg} ${L}`; p.style.strokeDashoffset = seg;
    gsap.to(p, { strokeDashoffset: -L, duration: 2.2 + Math.random() * 2.4, repeat: -1, ease: 'none', delay: Math.random() * 2.5, repeatDelay: .6 + Math.random() * 1.4 });
  });
  document.querySelectorAll('.i-trace').forEach(svg => {
    const p = svg.querySelector('.i-pulse'); if (!p) return;
    const L = p.getTotalLength(); const seg = L * .18;
    p.style.strokeDasharray = `${seg} ${L}`; p.style.strokeDashoffset = seg; p.style.opacity = .95;
    gsap.to(p, { strokeDashoffset: -L, duration: 2.6 + Math.random() * 1.6, repeat: -1, ease: 'none', delay: Math.random() * 2 });
  });

  /* ───────── herói: a tela pousa, o título sobe por letras, a rede se desenha ───────── */
  const heroPaths = [...document.querySelectorAll('path[data-hero-draw]')];
  heroPaths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const heroChars = []; const ctaChars = [];
  document.querySelectorAll('.hero-title [data-split]').forEach(l => heroChars.push(...splitChars(l)));
  document.querySelectorAll('.cta-title [data-split]').forEach(l => ctaChars.push(...splitChars(l)));
  gsap.set(heroChars, { yPercent: 110 });
  gsap.set('.hero-sub span', { yPercent: 120 });
  gsap.set('.hero-badges .badges-wrap', { opacity: 0, y: 22 });
  gsap.set('#heroChip', { scale: 0, opacity: 0 });
  gsap.set('#heroScreen', { opacity: 0, y: 90, scale: .94 });
  function enter() {
    const tl = gsap.timeline();
    tl.to('#heroScreen', { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' })
      .to(heroChars, { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .012 }, '-=.7')
      .to('.hero-sub span', { yPercent: 0, duration: .7, ease: 'power3.out' }, '-=.5')
      .to('.hero-badges .badges-wrap', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.55')
      .to(heroPaths, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .05 }, '-=.4')
      .to('#heroChip', { scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.6)' }, '-=.5');
  }
  const prontas = ('fonts' in document) ? document.fonts.load('700 40px Urbanist') : Promise.resolve();
  Promise.race([prontas, new Promise(r => setTimeout(r, 900))]).then(() => setTimeout(enter, 60), () => setTimeout(enter, 60));
  gsap.to('#heroScreen', { y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('#heroChip', { rotationY: 360, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('#heroChip', { y: -10, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  /* ───────── statement fixo: a moldura se desenha e as palavras acendem ───────── */
  const words = splitWords(document.getElementById('statementText'));
  const sDraws = gsap.utils.toArray('path[data-sdraw]');
  const sPulses = gsap.utils.toArray('.statement-net .s-pulse');
  sDraws.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const stl = gsap.timeline({ scrollTrigger: { trigger: '#statement', start: 'top top', end: '+=130%', pin: '#statementPin', scrub: 1,
    onUpdate: self => { const wp = gsap.utils.clamp(0, 1, (self.progress - .18) / .68); const n = Math.floor(wp * (words.length + 2)); words.forEach((w, i) => w.classList.toggle('is-on', i <= n)); } } });
  stl.to(sDraws[0], { strokeDashoffset: 0, duration: .14, ease: 'none' })
     .to(sDraws[1], { strokeDashoffset: 0, duration: .5, ease: 'none' })
     .to(sPulses, { opacity: .95, duration: .06 }, '>-.05')
     .to(sDraws[2], { strokeDashoffset: 0, duration: .18, ease: 'none' })
     .to({}, { duration: .12 });
  sPulses.forEach((p, i) => {
    const L = p.getTotalLength(); const seg = L * .1;
    p.style.strokeDasharray = `${seg} ${L - seg}`;
    gsap.fromTo(p, { strokeDashoffset: i === 0 ? 0 : -L / 2 }, { strokeDashoffset: (i === 0 ? 0 : -L / 2) - L, duration: 7, repeat: -1, ease: 'none' });
  });

  /* ───────── entradas por seção (uma vez, ao entrar) ───────── */
  gsap.utils.toArray('.sig-row, .f-card, .i-row, .imagine-grid, .price-card, .faq-item, .steps-head').forEach(el => {
    gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.from('.f-chip', { scale: 0, duration: .8, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.features-wrap', start: 'top 75%', once: true } });

  /* ───────── CTA: título por letras ───────── */
  gsap.set(ctaChars, { yPercent: 110 });
  gsap.to(ctaChars, { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .01, scrollTrigger: { trigger: '#cta', start: 'top 70%', once: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
