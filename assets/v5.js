/* FlowDesk v5 · sem bibliotecas. Sem JavaScript a página continua completa; tudo aqui é vida em cima. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const shot = location.search.includes('shot');
  const motion = !reduced && !shot;
  if (!motion) document.documentElement.classList.add('no-motion');
  if (shot) document.body.classList.add('shot');
  const pad = n => String(n).padStart(2, '0');
  const mmss = s => s >= 3600 ? `${pad(s / 3600 | 0)}:${pad((s % 3600) / 60 | 0)}:${pad(s % 60)}` : `${pad(s / 60 | 0)}:${pad(s % 60)}`;
  const tmClass = s => s >= 900 ? 'red' : s >= 300 ? 'am' : '';
  const io = (els, cb, opt) => { if (!('IntersectionObserver' in window)) { els.forEach(e => cb(e, true)); return; } const o = new IntersectionObserver(es => es.forEach(e => cb(e.target, e.isIntersecting, o)), opt); els.forEach(e => o.observe(e)); return o; };

  /* links do WhatsApp: um só lugar para mudar número e texto */
  const NUM = '5511977160644';
  const TXT = { '': 'Olá, quero fazer um diagnóstico comercial com o FlowDesk.', 40: 'Olá, quero entender o plano 40 leads por dia do FlowDesk.', 100: 'Olá, quero entender o plano 100 leads por dia do FlowDesk.', 200: 'Olá, quero falar sobre o plano 200+ leads por dia do FlowDesk.' };
  $$('[data-wa]').forEach(a => { a.href = `https://wa.me/${NUM}?text=${encodeURIComponent(TXT[a.dataset.wa] || TXT[''])}`; a.target = '_blank'; a.rel = 'noopener'; });

  /* nav */
  const nav = $('#nav'); const onScroll = () => nav.classList.toggle('scrolled', scrollY > 6); addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('.nav-links a');
  io(links.map(a => $(a.hash)).filter(Boolean), (sec, on) => { if (on) links.forEach(a => a.classList.toggle('active', a.hash === '#' + sec.id)); }, { rootMargin: '-45% 0px -50% 0px' });

  /* seções abaixo da dobra: montar só quando chegar perto */
  $$('section:not(.hero), footer').forEach(s => s.classList.add('below'));

  /* relógios (17:04 é o número dos anúncios) */
  let S = 17 * 60 + 4; const ca = $('#clock-a'), cb = $('#clock-b'), kOld = $('#k-old');
  const paintClocks = () => { const t = mmss(S); if (ca) ca.textContent = S >= 3600 ? t : '00:' + t; if (kOld) kOld.textContent = t; if (cb) { const m = S / 60 | 0; cb.textContent = m + (m === 1 ? ' minuto' : ' minutos'); } };
  paintClocks();

  /* cronômetros das filas (hero e caixa de entrada) */
  const timers = $$('[data-wait],[data-t]');
  timers.forEach(r => { r._s = +(r.dataset.wait || r.dataset.t); });
  const paintTimers = () => timers.forEach(r => { if (r._done) return; const el = $('.tm', r); if (!el) return; el.textContent = mmss(r._s); el.className = 'tm mono ' + tmClass(r._s); });
  paintTimers();
  if (!shot) setInterval(() => { S++; paintClocks(); timers.forEach(r => { if (!r._done) r._s++; }); paintTimers(); }, 1000);
  
  /* números sobem */
  const fmt = (v, d) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const countTo = (el, dur = 1200) => {
    const end = parseFloat(el.dataset.count), d = +(el.dataset.dec || 0);
    if (!motion) { el.textContent = fmt(end, d); return; }
    const t0 = performance.now(); const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e, d); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  };

  /* revelar (textos e títulos palavra a palavra) */
  const splitWords = el => { if (el.dataset.done) return; const frag = document.createDocumentFragment(); let i = 0;
    const walk = (n, into) => Array.from(n.childNodes).forEach(c => { if (c.nodeType === 3) c.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) return into.appendChild(document.createTextNode(' ')); const s = document.createElement('span'); s.className = 'w'; s.textContent = p; s.style.transitionDelay = (i++ * 45) + 'ms'; into.appendChild(s); }); else if (c.nodeType === 1) { const k = c.cloneNode(false); walk(c, k); into.appendChild(k); } });
    walk(el, frag); el.textContent = ''; el.appendChild(frag); el.dataset.done = 1; };
  if (motion) { $$('[data-split]').forEach(splitWords);
    io($$('[data-reveal],[data-split]'), (el, on, o) => { if (on) { el.classList.add('in'); o && o.unobserve(el); } }, { rootMargin: '0px 0px -8% 0px' });
  } else $$('[data-reveal],[data-split]').forEach(el => el.classList.add('in'));

  /* ===== hero: tela viva ===== */
  const screen = $('#screen'), wrap = $('#screen-wrap');
  if (screen) {
    $$('[data-count]', screen).forEach(c => setTimeout(() => countTo(c), 300));
    const rows = $('#rows'), scan = $('.scan', rows), toast = $('#toast'), kWait = $('#k-wait');
    let timer = null, step = 0;
    const assign = () => {
      const r = $$('.r[data-wait]:not(.done)', rows).sort((a, b) => b._s - a._s)[0]; if (!r) return;
      scan.classList.remove('run'); void scan.offsetWidth; scan.classList.add('run');
      setTimeout(() => {
        r._done = true; r.classList.add('done', 'flash');
        const who = $('.who', r); const nome = r.dataset.own || ['Igor', 'Lucas', 'Ana'][step % 3]; const ini = nome.slice(0, 2).toUpperCase();
        who.className = 'who'; who.innerHTML = `<i>${ini}</i>${nome} assumiu`;
        const tm = $('.tm', r); tm.className = 'tm mono gr'; tm.textContent = 'respondido';
        const left = $$('.r[data-wait]:not(.done)', rows).length; if (kWait) kWait.textContent = left; if (kOld) { const o = $$('.r[data-wait]:not(.done)', rows).sort((a, b) => b._s - a._s)[0]; if (o) S = o._s; }
        $('b', toast).textContent = `${nome} assumiu ${$('b', r).textContent}`; toast.classList.add('in'); setTimeout(() => toast.classList.remove('in'), 3200);
        setTimeout(() => r.classList.remove('flash'), 1200); step++;
      }, 600);
    };
    if (motion) io([wrap], (el, on) => { if (on) { if (!timer) { setTimeout(assign, 1800); timer = setInterval(assign, 6500); } } else { clearInterval(timer); timer = null; } }, { threshold: .25 });
    if (fine && motion) { let raf = null, rx = 0, ry = 0;
      const apply = () => { raf = null; screen.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
      wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(); ry = ((e.clientX - r.left) / r.width - .5) * 10; rx = (.5 - (e.clientY - r.top) / r.height) * 10; screen.classList.add('tilting'); if (!raf) raf = requestAnimationFrame(apply); });
      wrap.addEventListener('pointerleave', () => { rx = ry = 0; screen.classList.remove('tilting'); if (!raf) raf = requestAnimationFrame(apply); });
    }
  }

  /* ===== problema: a caixa de entrada que não para de receber ===== */
  const list = $('#inbox-list');
  if (list && motion) {
    const novos = [['RA', '#3B82F6', 'Rafael Andrade', 'Quanto fica pra 3 unidades?'], ['LT', '#94A3B8', 'Loja Tavares', 'Vocês atendem sábado?'], ['PM', '#E2725B', 'Paula Mendes', 'Oi, ainda tem vaga essa semana?'], ['DV', '#D4A017', 'Dr. Vinícius', 'Me manda o valor do plano?'], ['BF', '#7C5CFF', 'Beleza & Forma', 'Boa tarde! Fazem orçamento?']];
    let k = 0, t = null;
    const chegar = () => {
      const [ini, cor, nome, msg] = novos[k++ % novos.length];
      const el = document.createElement('div'); el.className = 'ib enter'; el._s = 3; timers.push(el);
      el.innerHTML = `<span class="av" style="background:${cor};color:#fff">${ini}</span><div><b>${nome}</b><small>${msg}</small></div><span class="tm mono"></span>`;
      list.prepend(el); paintTimers();
      const all = $$('.ib', list); all.forEach((r, i) => r.classList.toggle('old', i >= 3)); if (all.length > 6) { const last = all[all.length - 1]; timers.splice(timers.indexOf(last), 1); last.remove(); }
    };
    io([list], (el, on) => { if (on) { if (!t) t = setInterval(chegar, 3800); } else { clearInterval(t); t = null; } }, { threshold: .3 });
  }

  /* ===== demonstrações que rodam ao aparecer ===== */
  const playables = $$('[data-demo]');
  const typers = new WeakMap();
  const typeInto = (el, speed = 38, done) => { const text = el.dataset.text; el.textContent = ''; let i = 0; const id = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(id); done && done(); } }, speed); return id; };
  const start = el => {
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
    const d = el.dataset.demo;
    if (d === 'followups') { const fus = $$('.fu', el); fus.forEach(f => f.classList.remove('done')); fus.forEach((f, i) => setTimeout(() => f.classList.add('done'), 700 + i * 900)); }
    if (d === 'conversas') { const t = $('.typed', el); clearInterval(typers.get(el)); typers.set(el, setTimeout(() => typers.set(el, typeInto(t)), 500)); }
  };
  const stop = el => { el.classList.remove('play'); clearInterval(typers.get(el)); clearTimeout(typers.get(el)); };
  if (motion) { io(playables, (el, on) => on ? start(el) : stop(el), { threshold: .35 }); if (fine) playables.forEach(el => el.addEventListener('mouseenter', () => start(el))); }
  else playables.forEach(el => { el.classList.add('play'); $$('.typed', el).forEach(t => t.textContent = t.dataset.text); $$('.fu', el).forEach(f => f.classList.add('done')); });

  /* passos que acendem */
  const s3 = $('#steps3'); if (s3) io([s3], (el, on, o) => { if (on) { el.classList.add('lit'); $$('.st', el).forEach((s, i) => setTimeout(() => s.classList.add('lit'), 300 + i * 450)); o && o.unobserve(el); } }, { threshold: .3 });
  const s5 = $('#steps5'); if (s5) { const lis = $$('li', s5); io(lis, (li, on) => { if (!on) return; li.classList.add('lit'); const n = lis.filter(l => l.classList.contains('lit')).length; s5.style.setProperty('--f', (n / lis.length).toFixed(2)); }, { rootMargin: '-30% 0px -40% 0px' }); }
  io($$('.checks'), (el, on, o) => { if (on) { $$('li', el).forEach((li, i) => li.style.transitionDelay = (i * 110) + 'ms'); el.classList.add('on'); o && o.unobserve(el); } }, { threshold: .3 });

  /* holofote nos cartões */
  if (fine) document.addEventListener('pointermove', e => { const c = e.target.closest && e.target.closest('.card'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });

  /* galeria: setas do teclado */
  const g = $('#gallery'); if (g) g.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); g.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * g.firstElementChild.offsetWidth, behavior: 'smooth' }); } });

  /* final: a mensagem do WhatsApp se escreve ===== */
  const prev = $('#wa-prev');
  if (prev) { const msg = $('#wp-msg'), reply = $('#wp-reply'), t = $('.typed', msg);
    const run = () => { if (!motion) { t.textContent = t.dataset.text; msg.classList.add('sent'); reply.classList.add('show'); return; } typeInto(t, 32, () => { msg.classList.add('sent'); setTimeout(() => reply.classList.add('show'), 700); }); };
    if (!motion) run(); else io([prev], (el, on, o) => { if (on) { setTimeout(run, 400); o && o.unobserve(el); } }, { threshold: .4 });
  }

  /* barra do WhatsApp no celular */
  const bar = $('#wa-bar'), hero = $('.hero'), fim = $('#contato');
  if (bar) { let past = false, at = false; const upd = () => bar.classList.toggle('show', past && !at); io([hero], (e, on) => { past = !on; upd(); }); io([fim], (e, on) => { at = on; upd(); }, { threshold: .2 }); }

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
