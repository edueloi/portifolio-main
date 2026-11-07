(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  // título letra por letra
  const title = $('#title');
  title.textContent = '';
  [...'Eduardo Eloi'].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = c === ' ' ? 'sp' : 'ch';
    s.textContent = c === ' ' ? '' : c;
    s.style.animationDelay = 0.1 + i * 0.05 + 's';
    title.appendChild(s);
  });

  // títulos palavra por palavra
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><i style="--i:${i}">${w}</i></span>`).join(' ');
  });

  // máquina de escrever
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
    setTimeout(tick, 1200);
  }

  // revelar ao rolar, números e barras
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
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, [data-split], .skill').forEach(el => io.observe(el));

  // cabeçalho, progresso, parallax, linha do tempo e projetos
  const nav = $('#nav'), bar = $('#progress'), fill = $('#lineFill'), tl = $('#timeline');
  const pin = $('#pin'), track = $('#track');
  const par = $$('[data-parallax]');
  const wide = () => matchMedia('(min-width: 900px)').matches;
  let maxX = 0;
  const measure = () => {
    if (wide()) {
      maxX = Math.max(0, track.scrollWidth - innerWidth);
      pin.style.setProperty('--pin-h', innerHeight + maxX + 'px');
    } else { maxX = 0; pin.style.removeProperty('--pin-h'); track.style.transform = ''; }
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);

  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 40);
    if (!reduce) par.forEach(el => { el.style.translate = `0 ${y * parseFloat(el.dataset.parallax) * -1}px`; });
    const r = tl.getBoundingClientRect();
    fill.style.transform = `scaleY(${Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height))})`;
    if (maxX) {
      const pr = pin.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -pr.top / (pin.offsetHeight - innerHeight)));
      track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  // cursor, botões magnéticos e inclinação 3D
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

  // fundo de partículas conectadas, reage ao mouse
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
    const link = 150 * (W / innerWidth);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = 'rgba(124,92,255,.7)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * (W / innerWidth), 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < link) { ctx.strokeStyle = `rgba(25,211,255,${(1 - d / link) * 0.22})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < link * 1.3) { ctx.strokeStyle = `rgba(124,92,255,${(1 - dm / (link * 1.3)) * 0.5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  };
  if (!reduce) draw();
})();
