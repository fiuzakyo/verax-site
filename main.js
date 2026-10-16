/* Verax · Site — interações
   - Entrada do hero
   - Progresso de rolagem (--p) para Terra, Missão, Serviços e Precisão
   - Serviços: item ativo acompanha a rolagem (ou o mouse)
   - Contador "98%"
   - Riscos da frase de impacto
   - Depoimentos: clique ou timer
   - Rodapé: letreiros, texto circular girando com a rolagem, círculo segue o cursor
*/
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Entrada ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add('is-loaded')));

  /* ---------- Vídeos: pausa quando reduzir movimento ---------- */
  if (reduce) $$('video').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

  /* ---------- Header ---------- */
  const header = $('.site-header');
  const setHH = () => doc.style.setProperty('--hh', header.offsetHeight + 'px');
  setHH(); window.addEventListener('resize', setHH);
  const burger = $('.nav-burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }
  });

  /* ---------- Revelação ao entrar na tela ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.25 });
  $$('[data-reveal]').forEach(el => io.observe(el));
  const features = $('.features');
  const onceIn = (el, cls, target, th) => new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { target.classList.add(cls); obs.disconnect(); }
  }, { threshold: th }).observe(el);
  onceIn($('.features-title'), 'is-title-in', features, 0.4);
  onceIn($('.features-grid'), 'is-cards-in', features, 0.2);
  const impact = $('.impact');
  new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { impact.classList.add('is-in'); obs.disconnect(); }
  }, { threshold: 0.35 }).observe(impact);

  /* ---------- Precisão: variações controladas pela rolagem ---------- */
  const statesPin = $('.states-pin');
  const statesSec = $('.states');
  const stack = $('.states-stack');
  const states = $$('.state', stack);
  const stateIcons = $$('.states-icon');
  let stateIdx = -1;
  const fmt = n => n.toLocaleString('pt-BR');
  const countUp = em => {
    const to = +em.dataset.count, pre = em.dataset.prefix || '', suf = em.dataset.suffix || '';
    if (reduce) { em.textContent = pre + fmt(to) + suf; return; }
    const t0 = performance.now(), dur = 1200;
    const tick = t => { const k = clamp((t - t0) / dur); em.textContent = pre + fmt(Math.round(to * (1 - Math.pow(1 - k, 3)))) + suf; if (k < 1 && em.closest('.is-active')) requestAnimationFrame(tick); else if (k < 1) em.textContent = pre + fmt(to) + suf; };
    requestAnimationFrame(tick);
  };
  const setState = i => {
    if (i === stateIdx) return;
    stack.dataset.dir = i > stateIdx ? '1' : '-1';
    const prev = stateIdx; stateIdx = i;
    states.forEach((st, k) => {
      st.classList.toggle('is-active', k === i);
      st.classList.toggle('is-out', k === prev);
      st.setAttribute('aria-hidden', String(k !== i));
    });
    stateIcons.forEach((ic, k) => ic.classList.toggle('is-active', k === i));
    const em = states[i].querySelector('em[data-count]');
    if (em) countUp(em);
  };
  const sizeStates = () => {
    const sh = statesSec.offsetHeight, hh = header.offsetHeight;
    doc.style.setProperty('--states-h', sh + 'px');
    doc.style.setProperty('--states-top', (hh + Math.max(0, (window.innerHeight - hh - sh) / 2)) + 'px'); // centraliza na tela
  };
  sizeStates(); window.addEventListener('resize', sizeStates);
  // contador da primeira variação dispara quando a seção aparece
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return; obs.disconnect();
    if (stateIdx <= 0) { stateIdx = -1; setState(0); }
  }, { threshold: 0.4 }).observe(statesSec);
  stateIdx = 0;

  /* ---------- Serviços ---------- */
  /* Destaque só com o mouse (ou toque); sem mouse, volta ao primeiro item, como no Figma */
  const list = $('.services-list');
  const items = $$('li', list);
  const setService = i => items.forEach((li, k) => li.classList.toggle('is-active', k === i));
  items.forEach((li, i) => {
    li.addEventListener('mouseenter', () => setService(i));
    li.addEventListener('click', () => setService(i));
  });
  list.addEventListener('mouseleave', () => setService(0));

  /* ---------- Depoimentos ---------- */
  const track = $('.testi-track');
  const cards = $$('.t-card', track);
  const interval = +track.dataset.interval || 8000;
  let active = 0, elapsed = 0, paused = false, inView = false, last = performance.now();
  const activate = i => {
    active = (i + cards.length) % cards.length; elapsed = 0;
    cards.forEach((c, k) => {
      const on = k === active;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-expanded', String(on));
      c.style.setProperty('--t', 0);
    });
  };
  cards.forEach((c, i) => {
    c.addEventListener('click', () => { if (i !== active) activate(i); });
    c.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && i !== active) { e.preventDefault(); activate(i); }
      if (e.key === 'ArrowRight') { e.preventDefault(); activate(active + 1); cards[active].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); activate(active - 1); cards[active].focus(); }
    });
  });
  track.addEventListener('mouseenter', () => paused = true);
  track.addEventListener('mouseleave', () => paused = false);
  track.addEventListener('focusin', () => paused = true);
  track.addEventListener('focusout', () => paused = false);
  new IntersectionObserver(en => { inView = en[0].isIntersecting; }, { threshold: 0.3 }).observe(track);
  activate(0);
  if (reduce) cards.forEach(c => c.style.setProperty('--t', 1));

  /* ---------- Rodapé ---------- */
  const ring = $('.f-ring');
  const text = ring.dataset.text.toUpperCase();
  const step = 360 / text.length, start = 142.75;
  ring.innerHTML = Array.from(text).map((ch, i) =>
    ch === ' ' ? '' : `<span style="--a:${(start + i * step).toFixed(2)}deg">${ch}</span>`).join('');

  const middle = $('.f-middle');
  const circlePos = $('.f-circle-pos');
  const mq1 = $('.mq1 .mq-track'), mq2 = $('.mq2 .mq-track');
  const target = { x: 0, y: 0 }, pos = { x: 0, y: 0 };
  if (finePointer && !reduce) {
    middle.style.pointerEvents = 'auto';
    middle.addEventListener('pointermove', e => {
      const r = middle.getBoundingClientRect();
      const cx = parseFloat(getComputedStyle(circlePos).left), cy = parseFloat(getComputedStyle(circlePos).top);
      target.x = e.clientX - r.left - cx; target.y = e.clientY - r.top - cy;
    });
    middle.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });
    middle.addEventListener('click', e => { if (!e.target.closest('.f-circle')) $('.f-circle').click(); });
    middle.style.cursor = 'pointer';
  }


  /* ---------- Menu: fora do fluxo fixo no início; volta flutuante depois do globo ---------- */
  const globe = $('.globe');
  let floating = false, hideTimer = 0;
  const updateHeader = () => {
    const past = globe.getBoundingClientRect().bottom <= 0;
    if (past && !floating) {
      floating = true; clearTimeout(hideTimer);
      header.classList.add('is-floating');
      requestAnimationFrame(() => requestAnimationFrame(() => header.classList.add('is-shown')));
    } else if (!past && floating) {
      floating = false;
      header.classList.remove('is-shown');
      // depois de recolher, devolve o menu ao topo da página
      hideTimer = setTimeout(() => { if (!floating) header.classList.remove('is-floating'); }, 560);
    }
  };

  /* ---------- Globo: vídeo + camadas controlados pela rolagem ---------- */
  const gStage = $('.globe-stage');
  const gVideo = $('.globe-video');
  const scanVal = $('.scan-val'), scanTrack = $('.scan-track');
  const boxes = $$('.info-box');
  const gLines = $$('.gs-line > *');
  const gNums = $$('.gn');
  const hint = $('.scroll-hint');
  // MP4 (H.264) em todos os navegadores comuns; WebM como reserva onde H.264 não existe
  const canMp4 = gVideo.canPlayType('video/mp4; codecs="avc1.640028"') !== '';
  const gSrc = !canMp4 ? gVideo.dataset.srcWebm : (window.innerWidth <= 900 ? gVideo.dataset.srcSmall : gVideo.dataset.src);
  // baixa o vídeo inteiro para a memória: a busca de quadros fica instantânea e não depende do servidor
  const setDirect = () => { gVideo.src = gSrc; gVideo.load(); };
  if (window.fetch && window.URL && URL.createObjectURL) {
    fetch(gSrc).then(r => { if (!r.ok) throw 0; return r.blob(); })
      .then(b => { gVideo.src = URL.createObjectURL(b); gVideo.load(); })
      .catch(setDirect);
  } else setDirect();
  // iOS/Safari só libera a busca de quadros depois de um play; tocamos e pausamos em silêncio
  const unlock = () => { const pr = gVideo.play(); if (pr && pr.then) pr.then(() => gVideo.pause()).catch(() => {}); window.removeEventListener('touchstart', unlock); };
  window.addEventListener('touchstart', unlock, { passive: true });
  gVideo.addEventListener('loadeddata', () => { gVideo.pause(); gVideo.currentTime = 0; });

  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const fmtNum = (v, dec) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  let gp = 0, lastScan = -1;
  // direção de cada card a partir do centro do globo (para "vir da câmera" e "afastar" junto com a Terra)
  let dirs = [];
  const measureDirs = () => {
    const sr = gStage.getBoundingClientRect();
    dirs = boxes.map(b => {
      const cx = b.offsetLeft + b.offsetWidth / 2 - sr.width / 2, cy = b.offsetTop + b.offsetHeight / 2 - sr.height / 2;
      const len = Math.hypot(cx, cy) || 1; return [cx / len, cy / len];
    });
  };
  measureDirs(); window.addEventListener('resize', measureDirs);

  const updateGlobe = () => {
    const r = globe.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -vh || r.top > vh * 1.5) return;
    const target = clamp(-r.top / Math.max(1, r.height - vh));
    gp += (target - gp) * (reduce ? 1 : 0.14);
    if (Math.abs(target - gp) < 0.0004) gp = target;

    // vídeo
    if (gVideo.readyState >= 1 && gVideo.duration) {
      const t = gp * (gVideo.duration - 0.04);
      if (!gVideo.seeking && Math.abs(gVideo.currentTime - t) > 1 / 60) gVideo.currentTime = t;
    }

    // barra de varredura
    const pct = Math.round(gp * 100);
    if (pct !== lastScan) { scanVal.textContent = String(pct).padStart(3, '0') + '%'; lastScan = pct; }
    scanTrack.style.setProperty('--scan', gp.toFixed(4));

    // Momento 2: cards entram vindo da câmera e saem afastando com o globo
    boxes.forEach((b, i) => {
      const ein = easeOut(seg(gp, 0.28 + i * 0.045, 0.42 + i * 0.045));
      const eout = easeIn(seg(gp, 0.55 + i * 0.02, 0.64 + i * 0.02));
      const [dx, dy] = dirs[i] || [0, 0];
      const far = 1 - ein;
      const scale = (1 + far * 0.4) * (1 - eout * 0.22);
      const push = far * 140 - eout * 70;
      const blur = far * 10 + eout * 6;
      const op = ein * (1 - eout);
      b.style.opacity = op.toFixed(3);
      b.style.transform = reduce ? 'none' : `translate(${(dx * push).toFixed(1)}px, ${(dy * push).toFixed(1)}px) scale(${scale.toFixed(3)})`;
      b.style.filter = reduce || blur < 0.2 ? 'none' : `blur(${blur.toFixed(1)}px)`;
      b.style.visibility = op < 0.01 ? 'hidden' : 'visible';
    });

    // Momento 3: frases sobem linha a linha
    gLines.forEach((el, i) => {
      const e = easeOut(seg(gp, 0.60 + i * 0.02, 0.68 + i * 0.02));
      el.style.opacity = e.toFixed(3);
      el.style.transform = reduce ? 'none' : `translateY(${((1 - e) * 105).toFixed(1)}%)`;
    });
    // Momento 3: números entram pela direita e contam até o valor
    gNums.forEach((el, i) => {
      const e = easeOut(seg(gp, 0.61 + i * 0.015, 0.69 + i * 0.015));
      el.style.opacity = e.toFixed(3);
      el.style.transform = reduce ? 'none' : `translateX(${((1 - e) * 48).toFixed(1)}px)`;
      const sp = el.querySelector('span'), to = +sp.dataset.to, dec = +sp.dataset.dec;
      const txt = (sp.dataset.pre || '') + fmtNum(to * e, dec) + (sp.dataset.suf || '');
      if (sp.textContent !== txt) sp.textContent = txt;
    });

    hint.style.opacity = (1 - seg(gp, 0.9, 0.98)).toFixed(3);
  };

  /* ---------- Loop de rolagem ---------- */
  const progressEls = $$('[data-progress]');
  let drift = 0, spin = 0;
  const period = t => { const sp = t.children; return sp[sp.length / 2].offsetLeft - sp[0].offsetLeft; };
  let per1 = period(mq1), per2 = period(mq2);
  window.addEventListener('resize', () => { per1 = period(mq1); per2 = period(mq2); });
  document.fonts && document.fonts.ready.then(() => { per1 = period(mq1); per2 = period(mq2); });
  const frame = now => {
    const dt = Math.min(64, now - last); last = now;
    const vh = window.innerHeight;

    updateHeader();
    updateGlobe(dt);

    // variação ativa da seção Precisão
    {
      const pr = statesPin.getBoundingClientRect();
      if (pr.bottom > 0 && pr.top < vh) {
        const span = pr.height - statesSec.offsetHeight;
        const sp = span > 40
          ? clamp((parseFloat(getComputedStyle(statesSec).top) - pr.top) / span)
          : clamp((vh * 0.8 - pr.top) / Math.max(1, pr.height + vh * 0.2));
        setState(Math.min(states.length - 1, Math.floor(sp * states.length)));
      }
    }


    if (!reduce) {
      progressEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        let p;
        if (el.dataset.progress === 'enter') p = clamp((vh - r.top) / (vh * 0.75));
        else p = clamp((vh - r.top) / (vh + r.height));
        el.style.setProperty('--p', p.toFixed(4));
      });

      // riscos da frase de impacto: crescem com a rolagem depois que a frase surgiu
      const ir = impact.getBoundingClientRect();
      if (ir.bottom > 0 && ir.top < vh) {
        const start = vh * 0.5, end = header.offsetHeight;          // topo da seção indo de 50% da tela até o header
        const q = impact.classList.contains('is-in') ? clamp((start - ir.top) / Math.max(1, start - end)) : 0;
        impact.style.setProperty('--s1', clamp(q * 2).toFixed(4));
        impact.style.setProperty('--s2', clamp(q * 2 - 1).toFixed(4));
      }

      // letreiros + anel
      const fr = middle.getBoundingClientRect();
      if (fr.bottom > 0 && fr.top < vh) {
        drift += dt * 0.02;
        const base = (vh - fr.top) * 0.35;
        mq1.style.setProperty('--x', `${-((base + drift) % per1)}px`);
        mq2.style.setProperty('--x', `${((base + drift) % per2) - per2}px`);
        spin += dt * 0.012; // giro contínuo e lento (~12°/s), independente do mouse
        ring.style.setProperty('--r', `${(spin + window.scrollY * 0.18) % 360}deg`);
        pos.x += (target.x - pos.x) * 0.12; pos.y += (target.y - pos.y) * 0.12;
        circlePos.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px)`;
      }

      // timer dos depoimentos
      if (inView && !paused && document.visibilityState === 'visible') {
        elapsed += dt;
        cards[active].style.setProperty('--t', clamp(elapsed / interval).toFixed(4));
        if (elapsed >= interval) activate(active + 1);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
