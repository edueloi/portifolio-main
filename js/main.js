(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  $('#year').textContent = new Date().getFullYear();

  // ---------- pré-carregamento com cortina ----------
  const loader = $('#loader'), lbar = $('#loaderBar'), lnum = $('#loaderNum');
  const start = () => { loader.classList.add('done'); document.body.classList.add('ready'); setTimeout(() => loader.remove(), 1400); };
  if (reduce) { start(); } else {
    let n = 0, loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    const t0 = performance.now();
    (function load(t) {
      const target = loaded ? 100 : 88;
      n = lerp(n, target, 0.08);
      if (loaded && n > 99) n = 100;
      lbar.style.transform = `scaleX(${n / 100})`;
      lnum.textContent = Math.round(n);
      if (n >= 100 && t - t0 > 900) return setTimeout(start, 150);
      requestAnimationFrame(load);
    })(t0);
  }

  // ---------- título letra por letra ----------
  const title = $('#title');
  title.textContent = '';
  [...'Eduardo Eloi'].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = c === ' ' ? 'sp' : 'ch';
    s.textContent = c === ' ' ? '' : c;
    s.style.animationDelay = `${0.1 + i * 0.05}s, ${-i * 0.5}s`;
    title.appendChild(s);
  });

  // ---------- títulos palavra por palavra ----------
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><i style="--i:${i}">${w}</i></span>`).join(' ');
  });

  // ---------- texto que se acende palavra por palavra no scroll ----------
  const fills = $$('.fill').map(el => {
    const nodes = [];
    const walk = n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'wd'; w.textContent = part; frag.appendChild(w); nodes.push(w);
        });
        n.replaceWith(frag);
      } else [...n.childNodes].forEach(walk);
    };
    [...el.childNodes].forEach(walk);
    return { el, nodes };
  });

  // ---------- embaralhar texto ----------
  const glyphs = '01<>/{}[]#$%&*+=?';
  const scramble = el => {
    if (reduce || el.dataset.done) return;
    el.dataset.done = '1';
    const final = el.textContent, len = final.length;
    let f = 0;
    const iv = setInterval(() => {
      el.textContent = [...final].map((ch, i) => ch === ' ' ? ' ' : i < f / 2 ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
      if (++f > len * 2) { clearInterval(iv); el.textContent = final; }
    }, 28);
  };

  // ---------- máquina de escrever ----------
  const roles = ['Engenheiro de Software', 'Desenvolvedor Front-End', 'Apaixonado por IA', 'Criador de produtos digitais'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, c = 0, del = false;
    const tick = () => {
      const w = roles[r];
      typed.textContent = w.slice(0, c);
      if (!del && c === w.length) { del = true; return setTimeout(tick, 1600); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    };
    setTimeout(tick, 2600);
  }

  // ---------- revelar ao rolar, números e barras ----------
  $$('.stats .reveal, .skills .reveal, .timeline .reveal, .facts .reveal').forEach(el => {
    el.style.setProperty('--d', ($$('.reveal', el.parentElement).indexOf(el) % 4) * 90 + 'ms');
  });
  const countUp = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    if (e.target.matches('[data-count]')) countUp(e.target);
    if (e.target.matches('.kicker')) scramble(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, [data-split], .skill, .kicker').forEach(el => io.observe(el));

  // ---------- link ativo no menu ----------
  const links = $$('.nav nav a[href^="#"]:not(.pill)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  // ---------- medidas ----------
  const nav = $('#nav'), bar = $('#progress'), fill = $('#lineFill'), tl = $('#timeline');
  const pin = $('#pin'), track = $('#track'), hbar = $('#hbar');
  const cards = $$('.card', track);
  const par = $$('[data-parallax]'), blobs = $$('[data-blob]'), slides = $$('[data-slide]');
  const heads = $$('.h2, .big');
  const marq = $('.marquee-track');
  const wide = () => matchMedia('(min-width: 900px)').matches;
  let maxX = 0, half = 0;
  const measure = () => {
    half = marq.scrollWidth / 2;
    if (wide()) {
      maxX = Math.max(0, track.scrollWidth - innerWidth);
      pin.style.setProperty('--pin-h', innerHeight + maxX + 'px');
    } else { maxX = 0; pin.style.removeProperty('--pin-h'); track.style.transform = ''; cards.forEach(c => { c.style.scale = ''; c.style.opacity = ''; }); }
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);

  // ---------- laço principal: tudo que depende do scroll e da velocidade ----------
  let lastY = scrollY, vel = 0, mx = 0, dir = 1;
  const frame = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    vel = lerp(vel, y - lastY, 0.12);
    if (Math.abs(y - lastY) > 0.5) dir = Math.sign(y - lastY);
    lastY = y;

    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 40);

    if (!reduce) {
      par.forEach(el => { el.style.translate = `0 ${y * parseFloat(el.dataset.parallax) * -1}px`; });
      blobs.forEach(el => { el.style.translate = `0 ${y * -parseFloat(el.dataset.blob)}px`; });
      slides.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        el.style.transform = `translate3d(${(r.top - innerHeight * 0.5) * parseFloat(el.dataset.slide)}px,0,0)`;
      });
      // faixa de tecnologias: anda sozinha e acelera/inverte com o scroll
      mx -= (0.6 + Math.abs(vel) * 0.35) * dir;
      if (half) { if (mx <= -half) mx += half; if (mx > 0) mx -= half; marq.style.transform = `translate3d(${mx}px,0,0)`; }
      // títulos "esticam" com a velocidade
      const sk = clamp(vel * 0.12, -4, 4);
      heads.forEach(el => { el.style.transform = Math.abs(sk) > 0.02 ? `skewY(${sk.toFixed(2)}deg)` : ''; });
    }

    // texto que acende conforme sobe na tela
    fills.forEach(({ el, nodes }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.5 + r.height * 0.4));
      const on = Math.round(p * nodes.length);
      nodes.forEach((n, i) => n.classList.toggle('on', i < on));
    });

    const r = tl.getBoundingClientRect();
    fill.style.transform = `scaleY(${clamp((innerHeight * 0.65 - r.top) / r.height)})`;

    if (maxX) {
      const pr = pin.getBoundingClientRect();
      const p = clamp(-pr.top / (pin.offsetHeight - innerHeight));
      track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
      hbar.style.transform = `scaleX(${p})`;
      if (!reduce) cards.forEach(c => {
        const b = c.getBoundingClientRect();
        const d = clamp(Math.abs(b.left + b.width / 2 - innerWidth / 2) / (innerWidth * 0.6));
        c.style.scale = (1 - d * 0.1).toFixed(3);
        c.style.opacity = (1 - d * 0.5).toFixed(3);
      });
    }
    requestAnimationFrame(frame);
  };
  frame();

  // ---------- cursor, botões magnéticos, inclinação 3D e brilho que segue o mouse ----------
  $$('.card, .stat, .skill, .tl, .facts li').forEach(el => {
    el.addEventListener('mousemove', e => {
      const b = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - b.left + 'px');
      el.style.setProperty('--my', e.clientY - b.top + 'px');
    });
  });
  $$('.btn').forEach(el => el.addEventListener('click', e => {
    const b = el.getBoundingClientRect(), d = Math.max(b.width, b.height) * 2;
    const s = document.createElement('i');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - b.left - d / 2}px;top:${e.clientY - b.top - d / 2}px`;
    el.appendChild(s); setTimeout(() => s.remove(), 700);
  }));

  if (fine && !reduce) {
    const cur = $('#cursor'), dot = $('#cursorDot');
    let x = 0, y = 0, cx = 0, cy = 0;
    document.body.classList.add('has-cursor');
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); dot.classList.add('on'); dot.style.transform = `translate(${x}px,${y}px)`; });
    document.addEventListener('mouseleave', () => { cur.classList.remove('on'); dot.classList.remove('on'); });
    (function loop() { cx += (x - cx) * 0.16; cy += (y - cy) * 0.16; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    $$('a, button, .tilt').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.3}px,${(e.clientY - b.top - b.height / 2) * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const b = el.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- fundo de partículas conectadas, reage ao mouse ----------
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  const init = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    const n = Math.min(90, Math.floor(innerWidth * innerHeight / 18000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35 * dpr, vy: (Math.random() - .5) * .35 * dpr }));
  };
  init();
  addEventListener('resize', init);
  addEventListener('mousemove', e => { const d = W / innerWidth; mouse.x = e.clientX * d; mouse.y = e.clientY * d; });
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const k = W / innerWidth, link = 150 * k, boost = 1 + Math.min(Math.abs(vel) * 0.15, 3);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx * boost; p.y += p.vy * boost;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 120 * k && dm > 1) { p.x += (p.x - mouse.x) / dm * 1.2; p.y += (p.y - mouse.y) / dm * 1.2; }
      ctx.fillStyle = 'rgba(124,92,255,.7)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * k, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < link) { ctx.strokeStyle = `rgba(25,211,255,${(1 - d / link) * 0.22})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      if (dm < link * 1.3) { ctx.strokeStyle = `rgba(124,92,255,${(1 - dm / (link * 1.3)) * 0.5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  };
  if (!reduce) draw();
})();
