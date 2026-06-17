/* ═══════════════════════════════════════════
   BURGER MENU
═══════════════════════════════════════════ */
function initBurger() {
  const btn  = document.getElementById('burgerBtn');
  const menu = document.getElementById('navMobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a, button').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
}

/* ═══════════════════════════════════════════
   REVIEWS SLIDER
═══════════════════════════════════════════ */
function initReviewsSlider() {
  const wrap    = document.querySelector('.reviews-slider-wrap');
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsWrap = document.getElementById('reviewsDots');
  if (!wrap || !track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const total = cards.length;
  const GAP   = 20;
  let current = 0;
  let cachedW = 0;

  function perView() {
    return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  }
  function getMaxIdx() { return Math.max(0, total - perView()); }

  function buildDots() {
    if (!dotsWrap) return;
    let mx = getMaxIdx();
    if (cachedW > 0) {
      const maxScroll = wrap.scrollWidth - wrap.clientWidth;
      if (maxScroll > 0) mx = Math.min(mx, Math.round(maxScroll / (cachedW + GAP)));
    }
    const count = Math.max(1, mx + 1);
    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = document.createElement('span');
      d.className = 'slider-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function applyWidths() {
    const pv = perView();
    cachedW  = Math.floor((wrap.clientWidth - GAP * (pv - 1)) / pv);
    cards.forEach(c => { c.style.flex = `0 0 ${cachedW}px`; });
    return cachedW;
  }

  function updateUI() {
    dotsWrap?.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
  }

  function goTo(idx) {
    const mx = getMaxIdx();
    const loops = idx > mx ? 0 : idx < 0 ? mx : idx;
    const instant = idx > mx || idx < 0;
    current = loops;
    const target = current === mx
      ? wrap.scrollWidth - wrap.clientWidth
      : current * (cachedW + GAP);
    if (instant) {
      wrap.scrollLeft = target;
    } else {
      wrap.scrollTo({ left: target, behavior: 'smooth' });
    }
    updateUI();
  }

  /* Sync current on native scroll end */
  let scrollTimer;

  prevBtn?.addEventListener('click', () => { clearTimeout(scrollTimer); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { clearTimeout(scrollTimer); goTo(current + 1); });
  wrap.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const mx = getMaxIdx();
      current  = Math.max(0, Math.min(Math.round(wrap.scrollLeft / (cachedW + GAP)), mx));
      updateUI();
    }, 120);
  }, { passive: true });

  /* Touch swipe fallback */
  let startX = 0;
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend',   e => {
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 60) goTo(current + (dx > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => {
    current = 0;
    applyWidths();
    wrap.scrollTo({ left: 0, behavior: 'instant' });
    buildDots();
    updateUI();
  });
  applyWidths();
  buildDots();
  updateUI();
}

/* ═══════════════════════════════════════════
   3D CARD TILT on mouse move
═══════════════════════════════════════════ */
function initCardTilt() {
  const MAX_TILT = 10;
  const isMobile = () => window.innerWidth < 768;

  document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (isMobile()) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rotY = (dx / (rect.width  / 2)) * MAX_TILT;
      const rotX = -(dy / (rect.height / 2)) * MAX_TILT;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

/* ═══════════════════════════════════════════
   MAGNETIC BUTTON EFFECT
═══════════════════════════════════════════ */
function initMagneticBtns() {
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    const STRENGTH = 28;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      btn.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH * 0.6}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s linear';
    });
  });
}

/* ═══════════════════════════════════════════
   TEAL PARTICLES (hero background)
═══════════════════════════════════════════ */
(function createParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  const colors = ['#00E5A0', '#00B87A', '#4DFFBC', '#007A50', '#00C48A'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${color};
      opacity:0.25;
      animation-duration:${Math.random() * 18 + 10}s;
      animation-delay:${Math.random() * 14}s;
    `;
    container.appendChild(p);
  }
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════════ */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('ru-RU');
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('ru-RU');
  };
  requestAnimationFrame(update);
}
const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, parseInt(e.target.dataset.count, 10));
      cObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => cObs.observe(el));

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
const overlay     = document.getElementById('modalOverlay');
const stepTariff  = document.getElementById('stepTariff');
const stepForm    = document.getElementById('stepForm');
const stepSuccess = document.getElementById('stepSuccess');
const btnNext     = document.getElementById('btnNextStep');
const btnBackEl   = document.getElementById('btnBack');
const formEl      = document.getElementById('leadForm');
const tariffBadge = document.getElementById('selectedTariffBadge');

const TARIFF_PRICES = { 'Старт': '9 900 ₽', 'Прогресс': '19 900 ₽', 'VIP': '39 900 ₽' };
let selectedTariff = null;

document.querySelectorAll('.tariff-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.tariff-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedTariff = card.dataset.tariff;
    btnNext.disabled = false;
  });
});

function openModal(preselect) {
  if (!overlay) return;
  stepTariff.style.display = 'block';
  stepForm.style.display = 'none';
  stepSuccess.style.display = 'none';
  formEl.reset();
  const isValid = !!(preselect && TARIFF_PRICES[preselect]);
  document.querySelectorAll('.tariff-card').forEach(c =>
    c.classList.toggle('selected', isValid && c.dataset.tariff === preselect)
  );
  selectedTariff = isValid ? preselect : null;
  btnNext.disabled = !isValid;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.modal;
    openModal(TARIFF_PRICES[t] ? t : null);
  });
});

document.getElementById('closeModal')?.addEventListener('click', closeModal);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

btnNext?.addEventListener('click', () => {
  if (!selectedTariff) return;
  const price = TARIFF_PRICES[selectedTariff] || '';
  document.getElementById('tariffInput').value = selectedTariff;
  tariffBadge.textContent = `Тариф: ${selectedTariff} — ${price}`;
  stepTariff.style.display = 'none';
  stepForm.style.display = 'block';
});

btnBackEl?.addEventListener('click', () => {
  stepForm.style.display = 'none';
  stepTariff.style.display = 'block';
});

formEl?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = formEl.querySelector('.btn-submit');
  const resetBtn = () => { submitBtn.disabled = false; submitBtn.textContent = 'Записаться'; };
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';
  const data = {
    name:       document.getElementById('nameInput').value.trim(),
    phone:      document.getElementById('phoneInput').value.trim(),
    email:      document.getElementById('emailInput').value.trim(),
    tariff:     document.getElementById('tariffInput').value,
    _honeypot:  document.getElementById('honeypotInput').value,
  };
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (json.success) {
      stepForm.style.display = 'none';
      stepSuccess.style.display = 'block';
    } else {
      alert(json.error || 'Ошибка. Попробуйте ещё раз.');
      resetBtn();
    }
  } catch {
    alert('Ошибка соединения. Попробуйте ещё раз.');
    resetBtn();
  }
});

document.getElementById('phoneInput')?.addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '');
  if (v.startsWith('7') || v.startsWith('8')) v = v.slice(1);
  let m = '+7';
  if (v.length > 0) m += ' (' + v.slice(0, 3);
  if (v.length >= 3) m += ') ' + v.slice(3, 6);
  if (v.length >= 6) m += '-' + v.slice(6, 8);
  if (v.length >= 8) m += '-' + v.slice(8, 10);
  this.value = m;
});

/* ═══════════════════════════════════════════
   AUTHOR CANVAS ANIMATION — teal symbols
═══════════════════════════════════════════ */
(function initAuthorCanvas() {
  const canvas = document.getElementById('authorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const symbols = ['₿', 'Ξ', '₽', '%', '◈', '◆', '$', '€'];
  const COLORS  = ['#00E5A0', '#00B87A', '#007A50', '#4DFFBC', '#00C48A'];
  const coins   = Array.from({ length: 18 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    size: 11 + Math.random() * 14,
    symbol: symbols[i % symbols.length],
    speedY: -0.00006 - Math.random() * 0.00008,
    speedX: (Math.random() - 0.5) * 0.00004,
    alpha: 0.04 + Math.random() * 0.1,
    alphaDir: Math.random() < 0.5 ? 1 : -1,
    alphaSpeed: 0.0002 + Math.random() * 0.0003,
    angle: Math.random() * Math.PI * 2,
    angleSpeed: (Math.random() - 0.5) * 0.002,
    color: COLORS[i % COLORS.length],
  }));

  function drawLines(W, H) {
    for (let i = 0; i < coins.length; i++) {
      for (let j = i + 1; j < coins.length; j++) {
        const dx = (coins[i].x - coins[j].x) * W;
        const dy = (coins[i].y - coins[j].y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const a = (1 - dist / 120) * 0.05;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,229,160,${a})`;
          ctx.lineWidth = 1;
          ctx.moveTo(coins[i].x * W, coins[i].y * H);
          ctx.lineTo(coins[j].x * W, coins[j].y * H);
          ctx.stroke();
        }
      }
    }
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    drawLines(W, H);
    coins.forEach(c => {
      c.x += c.speedX;
      c.y += c.speedY;
      c.angle += c.angleSpeed;
      c.alpha += c.alphaDir * c.alphaSpeed;
      if (c.alpha > 0.14 || c.alpha < 0.03) c.alphaDir *= -1;
      if (c.y < -0.08) { c.y = 1.05; c.x = Math.random(); }
      if (c.x < -0.05) c.x = 1.05;
      if (c.x > 1.05)  c.x = -0.05;
      ctx.save();
      ctx.translate(c.x * W, c.y * H);
      ctx.rotate(c.angle);
      ctx.globalAlpha = c.alpha;
      ctx.font = `${c.size}px Montserrat, sans-serif`;
      ctx.fillStyle = c.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.symbol, 0, 0);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════════════
   CRYPTO 3D HERO (Three.js)
═══════════════════════════════════════════ */
function initCryptoHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.offsetWidth  || 520;
  const H = canvas.offsetHeight || 480;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
  camera.position.set(0, 0, 7);

  /* Lighting */
  scene.add(new THREE.AmbientLight(0x00e5a0, 0.35));
  const pt = new THREE.PointLight(0x00e5a0, 2.2, 30);
  pt.position.set(3, 4, 5);
  scene.add(pt);
  const pt2 = new THREE.PointLight(0x00b87a, 1.2, 20);
  pt2.position.set(-4, -2, 3);
  scene.add(pt2);

  const TEAL  = new THREE.Color(0x00e5a0);
  const TEAL2 = new THREE.Color(0x00b87a);
  const DARK  = new THREE.Color(0x060c0a);

  /* Central coin sphere */
  const coinGeo = new THREE.SphereGeometry(1.18, 64, 64);
  const coinMat = new THREE.MeshStandardMaterial({
    color: DARK, emissive: TEAL, emissiveIntensity: 0.08,
    metalness: 0.92, roughness: 0.18,
    wireframe: false,
  });
  const coin = new THREE.Mesh(coinGeo, coinMat);
  scene.add(coin);

  /* Wireframe overlay on sphere */
  const wireMat = new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.12 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.22, 18, 12), wireMat));

  /* Outer glow ring (Torus) */
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.025, 8, 120),
    new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.55 })
  );
  ring1.rotation.x = Math.PI / 2.8;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.018, 8, 120),
    new THREE.MeshBasicMaterial({ color: TEAL2, transparent: true, opacity: 0.35 })
  );
  ring2.rotation.x = Math.PI / 1.7;
  ring2.rotation.y = Math.PI / 4;
  scene.add(ring2);

  /* Orbiting node spheres */
  const nodeMat = new THREE.MeshStandardMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.3 });
  const nodes = [];
  const nodeAngles = [0, Math.PI * 0.66, Math.PI * 1.33];
  nodeAngles.forEach((angle, i) => {
    const radius = 2.1;
    const nd = new THREE.Mesh(new THREE.SphereGeometry(i === 1 ? 0.14 : 0.1, 12, 12), nodeMat.clone());
    nd.userData = { angle, radius, speed: 0.45 + i * 0.1, tilt: ring1.rotation.x };
    scene.add(nd);
    nodes.push(nd);
  });

  /* Connection lines between coin and nodes */
  const lineMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.22 });
  const lineGeoms = nodes.map(() => {
    const pts = [new THREE.Vector3(0,0,0), new THREE.Vector3(2,0,0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, lineMat.clone());
    scene.add(line);
    return { geo, line };
  });

  /* Floating particles */
  const pCount = 160;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 3.5 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pPositions[i*3+2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color: TEAL, size: 0.045, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(pGeo, pMat));

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* Resize — use ResizeObserver to react to actual layout changes */
  function onCanvasResize() {
    const nw = canvas.parentElement.clientWidth  || canvas.offsetWidth;
    const nh = canvas.parentElement.clientHeight || canvas.offsetHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(onCanvasResize).observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', onCanvasResize);
  }
  onCanvasResize();

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    coin.rotation.y += 0.004;
    ring1.rotation.z += 0.008;
    ring2.rotation.z -= 0.005;

    /* orbit nodes along ring1 tilt plane */
    nodes.forEach((nd, i) => {
      const { speed, tilt } = nd.userData;
      nd.userData.angle += speed * 0.01;
      const a = nd.userData.angle;
      const r = nd.userData.radius;
      nd.position.x = r * Math.cos(a);
      nd.position.y = r * Math.sin(a) * Math.sin(tilt);
      nd.position.z = r * Math.sin(a) * Math.cos(tilt);

      /* update connection line */
      const pts = [new THREE.Vector3(0,0,0), nd.position.clone()];
      lineGeoms[i].geo.setFromPoints(pts);
    });

    /* pulse emissive */
    coinMat.emissiveIntensity = 0.06 + Math.sin(t * 1.2) * 0.04;

    /* camera parallax */
    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();
}

/* ═══════════════════════════════════════════
   PRICING SLIDER (arrows)
═══════════════════════════════════════════ */
function initPricingSlider() {
  const track    = document.getElementById('pricingTrack');
  const prevBtn  = document.getElementById('pricingPrev');
  const nextBtn  = document.getElementById('pricingNext');
  if (!track || !prevBtn || !nextBtn) return;

  const GAP = 24;
  let scrollBy = (track.querySelector('.price-card')?.offsetWidth || 300) + GAP;

  const dotsContainer = document.getElementById('pricingDots');
  const dots = dotsContainer ? [...dotsContainer.querySelectorAll('.pricing-dot')] : [];
  const cardCount = track.querySelectorAll('.price-card').length;

  const updateDots = (idx) => {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      track.scrollTo({ left: i * scrollBy, behavior: 'smooth' });
      updateDots(i);
    });
  });

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollBy, behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left:  scrollBy, behavior: 'smooth' }));

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 4;
    const atEnd   = track.scrollLeft + track.offsetWidth >= track.scrollWidth - 4;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    const idx = Math.round(track.scrollLeft / (scrollBy || 1));
    updateDots(Math.max(0, Math.min(idx, cardCount - 1)));
  };

  track.addEventListener('scroll', updateArrows, { passive: true });

  window.addEventListener('resize', () => {
    scrollBy = (track.querySelector('.price-card')?.offsetWidth || 300) + GAP;
    updateArrows();
  });

  updateArrows();
}

/* ═══════════════════════════════════════════
   INIT ON DOM READY
═══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initReviewsSlider();
  initCardTilt();
  initMagneticBtns();
  initCryptoHero();
  initPricingSlider();
});
