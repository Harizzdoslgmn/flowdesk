/* FlowDesk v4 · sem bibliotecas. Tudo que está aqui é melhoria: sem JavaScript a página continua completa. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shot = location.search.includes('shot');

  /* nav ganha borda ao rolar */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 6);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* primeira dobra: cada conversa vira um cartão no pipeline */
  const svg = $('#links'), cards = $$('.card');
  if (svg && cards.length) {
    const chatY = i => 60 + i * 56;                // centro aproximado de cada conversa (viewBox 0..400)
    const cardY = [70, 150, 70, 150, 70, 150];     // posição dos cartões nas colunas
    cards.forEach((c, k) => {
      const f = +c.dataset.from, p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M0 ${chatY(f)} C50 ${chatY(f)} 50 ${cardY[k]} 100 ${cardY[k]}`);
      svg.appendChild(p); c._p = p;
    });
    const show = (c) => { c._p.classList.add('on'); c.classList.add('in'); const ch = $(`.chat[data-i="${c.dataset.from}"]`); ch && ch.classList.add('gone'); };
    if (reduced || shot) cards.forEach(show);
    else cards.forEach((c, k) => setTimeout(() => show(c), 600 + k * 520));
  }

  /* relógios: começam em 17:04 (o número dos anúncios) e seguem contando */
  let s = 17 * 60 + 4;
  const pad = n => String(n).padStart(2, '0');
  const a = $('#clock-a'), b = $('#clock-b');
  const paint = () => {
    if (a) a.textContent = `${pad(s / 3600 | 0)}:${pad((s % 3600) / 60 | 0)}:${pad(s % 60)}`;
    if (b) { const m = s / 60 | 0; b.textContent = m + (m === 1 ? ' minuto' : ' minutos'); }
  };
  paint(); if (!shot) setInterval(() => { s++; paint(); }, 1000);

  /* revelar ao entrar na tela (só opacidade e deslocamento) */
  const rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced && !shot) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(el => io.observe(el));
  } else rev.forEach(el => el.classList.add('in'));

  /* a virada: sem / com */
  const replay = $('#replay'), tg = $('.toggle'), btns = $$('.t-btn');
  const setM = (m) => {
    replay.dataset.m = m; tg.classList.toggle('com', m === 'com');
    btns.forEach(x => { const on = x.dataset.m === m; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
    $('#tl-sem').hidden = m !== 'sem'; $('#tl-com').hidden = m !== 'com';
  };
  btns.forEach(x => x.addEventListener('click', () => setM(x.dataset.m)));
  tg && tg.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); const m = replay.dataset.m === 'sem' ? 'com' : 'sem'; setM(m); $(`.t-btn[data-m="${m}"]`).focus();
  });

  /* tour do produto */
  const TOUR = [
    ['inicio', 'Visão geral', 'visão geral', 'Ao abrir a FlowDesk, o dono vê quantos leads entraram, quem está sem responsável e há quanto tempo cada um espera. O que precisa de atenção aparece primeiro.', ['Leads do dia contra a capacidade do plano', 'Fila de quem está esperando resposta, com cronômetro', 'Valor em aberto por etapa e desempenho da equipe']],
    ['leads', 'Leads', 'leads', 'Todos os contatos em uma lista, com origem, etapa, responsável, temperatura, valor estimado e a próxima ação. Filtros mostram na hora quem está sem dono ou em risco.', ['Origem de cada lead: Instagram, Google, indicação, WhatsApp', 'Temperatura: novo, morno, quente, em risco', 'Próxima ação com data, e atraso destacado em vermelho']],
    ['pipeline', 'Pipeline', 'pipeline', 'Cada oportunidade aparece na etapa em que está, com valor e responsável. Você arrasta o cartão quando a negociação avança e vê onde o funil trava.', ['Valor somado em cada etapa', 'Cartões parados há dias ficam marcados', 'Etapas configuradas para o seu processo']],
    ['followups', 'Follow-ups', 'follow-ups', 'Os retornos combinados com os clientes ficam em uma agenda com horário, prioridade e responsável. O que atrasou aparece no topo.', ['Atrasados, hoje, amanhã e semana', 'Prioridade alta, média e baixa', 'Regras que criam o retorno quando o cliente some']],
    ['conversas', 'Histórico', 'histórico', 'Antes de falar com o cliente, quem atende vê tudo o que já aconteceu: mensagens, proposta enviada, ligação e as observações internas da equipe.', ['Contexto completo de cada contato', 'Observações internas que o cliente não vê', 'Sugestão de próximo passo para cada lead']],
    ['relatorios', 'Relatórios', 'relatórios', 'O que a operação entregou no mês: leads recebidos, conversão por origem, desempenho de cada pessoa da equipe e os motivos de perda.', ['Conversão e receita por origem do lead', 'Tempo de primeira resposta por responsável', 'Funil do mês e motivos de perda']]
  ];
  const tabs = $$('.tab'), img = $('#tour-img');
  const setT = (i) => {
    const [k, h, u, p, l] = TOUR[i];
    tabs.forEach((t, j) => { const on = j === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('#tour-h').textContent = h; $('#tour-p').textContent = p; $('#tour-url').textContent = 'app.flowdesk · ' + u;
    $('#tour-l').innerHTML = l.map(x => `<li>${x}</li>`).join('');
    const next = new Image(); next.srcset = `assets/telas/${k}-960.webp 960w, assets/telas/${k}-1600.webp 1600w`; next.sizes = img.sizes;
    img.classList.add('swap');
    const done = () => { img.srcset = next.srcset; img.src = `assets/telas/${k}-1600.webp`; img.alt = `Tela de ${h.toLowerCase()} da FlowDesk`; img.classList.remove('swap'); };
    next.decode ? next.decode().then(done, done) : (next.onload = done);
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => setT(i)));
  $('.tour-tabs') && $('.tour-tabs').addEventListener('keydown', e => {
    const i = tabs.findIndex(t => t.classList.contains('on'));
    const n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!n) return; e.preventDefault(); const j = (i + n + tabs.length) % tabs.length; setT(j); tabs[j].focus();
  });
  /* pré-carrega as outras telas quando o tour aparece */
  const tour = $('.tour');
  if (tour && 'IntersectionObserver' in window) {
    const pio = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; pio.disconnect();
      const w = innerWidth < 900 ? 960 : 1600; TOUR.slice(1).forEach(([k]) => { const im = new Image(); im.src = `assets/telas/${k}-${w}.webp`; }); }, { rootMargin: '400px' });
    pio.observe(tour);
  }

  /* barra do WhatsApp no celular aparece depois da primeira dobra e some no fim */
  const bar = $('#wa-bar'), hero = $('.hero'), final = $('.final');
  if (bar && 'IntersectionObserver' in window) {
    let pastHero = false, atFinal = false;
    const upd = () => bar.classList.toggle('show', pastHero && !atFinal);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { atFinal = e.isIntersecting; upd(); }, { threshold: .2 }).observe(final);
  }

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
