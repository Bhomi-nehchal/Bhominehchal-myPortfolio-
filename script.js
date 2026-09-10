const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');
const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

function setTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', isLight ? '#f4f1ea' : '#080b12');
  themeToggle?.setAttribute('aria-pressed', String(isLight));
  themeToggle?.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  if (themeToggle) {
    themeToggle.querySelector('.theme-icon').textContent = isLight ? '☾' : '☼';
    themeToggle.querySelector('.theme-label').textContent = isLight ? 'Dark mode' : 'Light mode';
  }
}

setTheme(initialTheme);
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('portfolio-theme', nextTheme);
  setTheme(nextTheme);
});

const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const cursorGlow = document.querySelector('.cursor-glow');
const toast = document.querySelector('#toast');

function setMenu(open) {
  if (!navToggle || !navMenu) return;
  navMenu.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle?.addEventListener('click', () => {
  setMenu(!navMenu.classList.contains('open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 20);
}

function updateActiveSection() {
  const marker = window.scrollY + 140;
  let currentId = sections[0]?.id;

  sections.forEach((section) => {
    if (marker >= section.offsetTop) currentId = section.id;
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveSection();
}, { passive: true });
updateHeader();
updateActiveSection();

const revealItems = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const filterButtons = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    projectCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.hidden = !matches;
      card.setAttribute('aria-hidden', String(!matches));
    });
  });
});

const skillLens = document.querySelector('.skill-lens');
const skillTicks = [...document.querySelectorAll('.lens-tick')];
const skillFaces = [...document.querySelectorAll('.aperture-face')];
const skillPanels = [...document.querySelectorAll('.skill-panel')];
const skillOrbit = document.querySelector('#lens-orbit');
const skillGhost = document.querySelector('#lens-ghost');
const step = 360 / Math.max(skillTicks.length, 1);
let skillIndex = 0;
let skillTimer = null;
let skillPause = null;

function setSkill(index, fromUser = false) {
  if (!skillTicks.length) return;
  skillIndex = (index + skillTicks.length) % skillTicks.length;
  skillOrbit?.style.setProperty('--rot', `${-skillIndex * step}`);
  skillTicks.forEach((tick, i) => tick.classList.toggle('is-on', i === skillIndex));
  skillFaces.forEach((face, i) => face.classList.toggle('is-on', i === skillIndex));
  skillPanels.forEach((panel, i) => panel.classList.toggle('is-on', i === skillIndex));
  const title = skillPanels[skillIndex]?.querySelector('h3')?.textContent || '';
  if (skillGhost) skillGhost.textContent = title.toUpperCase();
  skillLens?.style.setProperty('--skill-i', String(skillIndex));
  if (fromUser) restartSkillSpin(7000);
}

function restartSkillSpin(delay = 0) {
  window.clearInterval(skillTimer);
  window.clearTimeout(skillPause);
  if (prefersReducedMotion || !skillTicks.length) return;
  const start = () => {
    skillTimer = window.setInterval(() => setSkill(skillIndex + 1), 4200);
  };
  if (delay) skillPause = window.setTimeout(start, delay);
  else start();
}

skillTicks.forEach((tick) => {
  tick.addEventListener('click', () => setSkill(Number(tick.dataset.index), true));
});
document.querySelector('#lens-prev')?.addEventListener('click', () => setSkill(skillIndex - 1, true));
document.querySelector('#lens-next')?.addEventListener('click', () => setSkill(skillIndex + 1, true));
skillLens?.addEventListener('pointerenter', () => {
  window.clearInterval(skillTimer);
  window.clearTimeout(skillPause);
});
skillLens?.addEventListener('pointerleave', () => restartSkillSpin(0));
setSkill(0);
restartSkillSpin(0);

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3600);
}

const contactForm = document.querySelector('#contact-form');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = contactForm.querySelector('.form-status');
  const formData = new FormData(contactForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailIsValid || !message) {
    if (status) {
      status.textContent = 'Please add your name, a valid email, and a message.';
      status.className = 'form-status error';
    }
    return;
  }

  if (status) {
    status.textContent = 'Thanks. The form is validated, but no message was sent because this portfolio has no backend yet.';
    status.className = 'form-status success';
  }
  contactForm.reset();
});

if (cursorGlow && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
}

if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.skill-card, .project-card, .info-card, .contact-card, .semester-card, .github-card, .resume-banner, .xp-studio, .ps-arena').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--hover-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--hover-y', `${event.clientY - bounds.top}px`);
    });
  });
}

const semesterDetails = document.querySelector('#semester-details');
const semesterCourses = {
  1: [['BS-1101', 'Applied Physics', 3], ['BS-1301', 'Calculus and Analytical Geometry', 3], ['CS-1001', 'Applications of Information and Communication Technologies', 2], ['CS-1001L', 'Applications of Information and Communication Technologies Lab', 1], ['CS-1002', 'Programming Fundamentals', 3], ['CS-1002L', 'Programming Fundamentals Lab', 1], ['HU-1002', 'Functional English', 3], ['HU-2201', 'Islamic Studies', 2]],
  2: [['BS-1302', 'Linear Algebra', 3], ['CS-1003', 'Discrete Structures', 3], ['CS-1004', 'Digital Logic Design', 2], ['CS-1004L', 'Digital Logic Design Lab', 1], ['CS-1005', 'Object Oriented Programming', 3], ['CS-1005L', 'Object Oriented Programming Lab', 1], ['HU-2101', 'Pakistan Studies', 2], ['HU-2203', 'Expository Writing', 3]],
  3: [['BS-2301', 'Multivariate Calculus', 3], ['CS-2007', 'Data Structures', 3], ['CS-2007L', 'Data Structures Lab', 1], ['CS-2201', 'Computer Networks', 3], ['CS-2201L', 'Computer Networks Lab', 1], ['CS-2801', 'Software Engineering', 3], ['MG-2XXX', 'University Elective-I (OB)', 2]],
  4: [['BS-1402', 'Probability and Statistics', 3], ['CS-2008', 'Computer Organization & Assembly Language', 2], ['CS-2008L', 'Computer Organization & Assembly Language Lab', 1], ['CS-2009', 'Operating Systems', 3], ['CS-2009L', 'Operating Systems Lab', 1], ['CS-2101', 'Database Systems', 3], ['CS-2101L', 'Database Systems Lab', 1], ['CS-2202', 'Information Security', 2], ['CS-2202L', 'Information Security Lab', 1]],
  5: [['CS-2601', 'Computer Architecture', 3], ['CS-3102', 'Advance Database Management', 2], ['CS-3102L', 'Advance Database Management Lab', 1], ['CS-3301', 'Artificial Intelligence', 2], ['CS-3301L', 'Artificial Intelligence Lab', 1], ['CS-3401', 'HCI & Computer Graphics', 3], ['CS-XXXX', 'CS Domain Elective 2', 3], ['CS-XXXX', 'CS Domain Elective 1', 2], ['CS-XXXXL', 'CS Domain Elective 1 Lab', 1]]
};

const semesterFocus = {
  1: 'Foundations',
  2: 'Object systems',
  3: 'Structures & networks',
  4: 'Systems & data',
  5: 'AI track'
};

const renderSemesterDetails = (semester) => {
  const courses = semesterCourses[semester];
  const total = courses.reduce((sum, course) => sum + course[2], 0);
  semesterDetails.innerHTML = `<div class="semester-details-inner"><div class="semester-details-heading"><span class="kicker">SEMESTER ${semester}</span><h3>${semesterFocus[semester]}</h3><small>${total} credit hours</small></div><div class="course-grid">${courses.map((course) => `<article class="course-chip${String(course[0]).endsWith('L') ? ' is-lab' : ''}"><span>${course[0]}</span><b>${course[1]}</b><small>${course[2]} cr</small></article>`).join('')}</div></div>`;
};

const toggleSemester = (card) => {
  const isExpanded = card.classList.contains('is-expanded');
  document.querySelectorAll('.semester-card[data-semester]').forEach((item) => {
    item.classList.remove('is-expanded');
    item.setAttribute('aria-expanded', 'false');
  });
  if (isExpanded) {
    semesterDetails.classList.remove('is-open');
    semesterDetails.setAttribute('aria-hidden', 'true');
    return;
  }
  renderSemesterDetails(card.dataset.semester);
  card.classList.add('is-expanded');
  card.setAttribute('aria-expanded', 'true');
  semesterDetails.classList.add('is-open');
  semesterDetails.setAttribute('aria-hidden', 'false');
};

document.querySelectorAll('.semester-card[data-semester]').forEach((card) => {
  card.addEventListener('click', () => toggleSemester(card));
});

const xpTiles = [...document.querySelectorAll('#xp-deck .xp-tile')];
let xpIndex = 0;
let xpTimer;

const setXpTile = (index) => {
  xpIndex = index;
  xpTiles.forEach((tile, i) => {
    const on = i === index;
    tile.classList.toggle('is-on', on);
    tile.setAttribute('aria-pressed', String(on));
  });
};

const startXpCycle = () => {
  if (prefersReducedMotion || xpTiles.length < 2) return;
  window.clearInterval(xpTimer);
  xpTimer = window.setInterval(() => setXpTile((xpIndex + 1) % xpTiles.length), 3200);
};

xpTiles.forEach((tile) => {
  tile.addEventListener('click', () => {
    setXpTile(Number(tile.dataset.xp));
    startXpCycle();
  });
  tile.addEventListener('pointerenter', () => window.clearInterval(xpTimer));
  tile.addEventListener('pointerleave', startXpCycle);
});
startXpCycle();

document.querySelector('#year').textContent = new Date().getFullYear();

(function startSynapseMotion() {
  const reduce = prefersReducedMotion;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const bootScreen = document.querySelector('#boot-screen');
  const canvas = document.querySelector('#synapse-field');
  const cursorCore = document.querySelector('.cursor-core');
  const cursorRing = document.querySelector('.cursor-ring');
  const progressBar = document.querySelector('.scroll-progress i');
  const navLiquid = document.querySelector('.nav-liquid');
  const heroVisual = document.querySelector('.hero-visual');
  const heroName = document.querySelector('.hero-name');
  const ctx = canvas?.getContext('2d');

  let booted = false;
  const finishBoot = () => {
    if (booted) return;
    booted = true;
    document.body.classList.remove('booting');
    document.body.classList.add('is-ready');
    bootScreen?.classList.add('is-done');
    bootScreen?.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => bootScreen?.remove(), 900);
  };

  if (reduce) finishBoot();
  else {
    const bootCanvas = document.querySelector('#boot-field');
    const bootCtx = bootCanvas?.getContext('2d');
    const bootName = document.querySelector('.boot-name');
    const bootStatus = document.querySelector('.boot-status');
    const glyphs = '01<>/\\[]#*+ΞΔΨΩ';
    const targetName = 'BHOMI NEHCHAL';
    const statusLines = ['Assembling thought map', 'Linking synapses', 'Field online'];

    document.querySelectorAll('.boot-stream').forEach((col) => {
      col.innerHTML = Array.from({ length: 16 }, () => `<span>${Math.random().toString(16).slice(2, 8).toUpperCase()}</span>`).join('');
    });

    if (bootName) {
      let revealed = 0;
      const decode = window.setInterval(() => {
        bootName.textContent = [...targetName].map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < revealed) return ch;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
        revealed += 0.55;
        if (revealed > targetName.length + 1) {
          bootName.textContent = targetName;
          window.clearInterval(decode);
        }
      }, 38);
    }

    statusLines.forEach((line, i) => {
      window.setTimeout(() => { if (bootStatus) bootStatus.textContent = line; }, i * 1050);
    });

    if (bootCanvas && bootCtx) {
      let bw = 0;
      let bh = 0;
      let bdpr = 1;
      let nodes = [];
      let bolts = [];
      const resizeBoot = () => {
        bdpr = Math.min(window.devicePixelRatio || 1, 1.5);
        bw = window.innerWidth;
        bh = window.innerHeight;
        bootCanvas.width = Math.floor(bw * bdpr);
        bootCanvas.height = Math.floor(bh * bdpr);
        bootCanvas.style.width = `${bw}px`;
        bootCanvas.style.height = `${bh}px`;
        bootCtx.setTransform(bdpr, 0, 0, bdpr, 0, 0);
        const cx = bw / 2;
        const cy = bh / 2;
        nodes = Array.from({ length: bw < 700 ? 36 : 58 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 40 + Math.random() * 0.4;
          const r = 70 + Math.random() * Math.min(bw, bh) * 0.38;
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, p: Math.random() * Math.PI * 2 };
        });
      };
      resizeBoot();
      window.addEventListener('resize', resizeBoot);
      const drawBoot = () => {
        if (booted || !document.body.contains(bootCanvas)) return;
        bootCtx.clearRect(0, 0, bw, bh);
        const cx = bw / 2;
        const cy = bh / 2;
        const glow = bootCtx.createRadialGradient(cx, cy, 12, cx, cy, 320);
        glow.addColorStop(0, 'rgba(212,175,55,0.2)');
        glow.addColorStop(1, 'rgba(212,175,55,0)');
        bootCtx.fillStyle = glow;
        bootCtx.fillRect(0, 0, bw, bh);
        nodes.forEach((node) => {
          node.p += 0.018;
          node.vx += (cx - node.x) * 0.00007;
          node.vy += (cy - node.y) * 0.00007;
          node.x += node.vx + Math.cos(node.p) * 0.18;
          node.y += node.vy + Math.sin(node.p * 0.9) * 0.18;
        });
        for (let i = 0; i < nodes.length; i += 1) {
          for (let j = i + 1; j < nodes.length; j += 1) {
            const a = nodes[i];
            const b = nodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 128) {
              bootCtx.strokeStyle = `rgba(212,175,55,${(1 - d / 128) * 0.38})`;
              bootCtx.lineWidth = 1;
              bootCtx.beginPath();
              bootCtx.moveTo(a.x, a.y);
              bootCtx.lineTo(b.x, b.y);
              bootCtx.stroke();
            }
          }
        }
        nodes.forEach((node) => {
          bootCtx.fillStyle = '#f4e6c1';
          bootCtx.beginPath();
          bootCtx.arc(node.x, node.y, 1.7, 0, Math.PI * 2);
          bootCtx.fill();
        });
        if (Math.random() < 0.12 && nodes.length > 3) {
          bolts.push({ a: nodes[Math.floor(Math.random() * nodes.length)], b: nodes[Math.floor(Math.random() * nodes.length)], t: 0 });
        }
        bolts = bolts.filter((bolt) => bolt.t < 1);
        bolts.forEach((bolt) => {
          bolt.t += 0.045;
          const x = bolt.a.x + (bolt.b.x - bolt.a.x) * bolt.t;
          const y = bolt.a.y + (bolt.b.y - bolt.a.y) * bolt.t;
          bootCtx.fillStyle = '#fff3c4';
          bootCtx.shadowColor = '#d4af37';
          bootCtx.shadowBlur = 18;
          bootCtx.beginPath();
          bootCtx.arc(x, y, 2.6, 0, Math.PI * 2);
          bootCtx.fill();
          bootCtx.shadowBlur = 0;
        });
        window.requestAnimationFrame(drawBoot);
      };
      window.requestAnimationFrame(drawBoot);
    }

    bootScreen?.addEventListener('click', finishBoot);
    const onBootKey = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      finishBoot();
      window.removeEventListener('keydown', onBootKey);
    };
    window.addEventListener('keydown', onBootKey);
    window.setTimeout(finishBoot, 3400);
  }

  if (reduce) return;

  document.documentElement.classList.add('has-motion');
  if (finePointer) document.documentElement.classList.add('has-cursor');

  const wrapChars = (text, extra = '') => [...text].map((ch) => `<span class="char ${extra}">${ch}</span>`).join('');
  if (heroName) {
    const outline = heroName.querySelector('span');
    const first = (heroName.childNodes[0]?.textContent || '').trim();
    const last = (outline?.textContent || '').trim();
    heroName.innerHTML = `${wrapChars(first)}<span class="char space">&nbsp;</span><span class="outline-word">${wrapChars(last, 'is-outline')}</span>`;
  }
  const chars = [...document.querySelectorAll('.hero-name .char')].filter((el) => !el.classList.contains('space'));

  const mouse = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4, active: false };
  const core = { x: mouse.x, y: mouse.y };
  const ring = { x: mouse.x, y: mouse.y };
  const tiltState = new WeakMap();
  const sparks = [];
  const trails = [];
  let nodes = [];
  let pulse = { a: 0, b: 1, t: 1 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTrail = 0;
  let running = true;

  const themeGold = () => document.documentElement.dataset.theme === 'light' ? [168, 121, 18] : [212, 175, 55];

  function resizeField() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 700 ? 28 : width < 1100 ? 52 : 78;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.6,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function emitBurst(x, y) {
    for (let i = 0; i < 14; i += 1) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.2;
      const speed = 1.4 + Math.random() * 2.2;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
    }
  }

  function drawField(now) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const [r, g, b] = themeGold();
    const energy = 0.55 + Math.min(window.scrollY / 1800, 0.35);

    nodes.forEach((node) => {
      node.phase += 0.01;
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 220) {
          node.vx += (dx / dist) * 0.012;
          node.vy += (dy / dist) * 0.012;
        }
      }
      node.vx *= 0.992;
      node.vy *= 0.992;
      node.vx += Math.cos(node.phase) * 0.003;
      node.vy += Math.sin(node.phase * 0.8) * 0.003;
    });

    const linkDist = width < 700 ? 90 : 128;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const c = nodes[j];
        const dx = a.x - c.x;
        const dy = a.y - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist > linkDist) continue;
        const alpha = (1 - dist / linkDist) * 0.22 * energy;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (pulse.t < 1 && nodes[pulse.a] && nodes[pulse.b]) {
      const a = nodes[pulse.a];
      const c = nodes[pulse.b];
      const x = a.x + (c.x - a.x) * pulse.t;
      const y = a.y + (c.y - a.y) * pulse.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},.9)`;
      ctx.fill();
      pulse.t += 0.012;
    } else if (Math.random() < 0.01) {
      pulse = { a: Math.floor(Math.random() * nodes.length), b: Math.floor(Math.random() * nodes.length), t: 0 };
    }

    nodes.forEach((node) => {
      const glow = 0.45 + Math.sin(now / 500 + node.phase) * 0.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + glow * 0.35})`;
      ctx.fill();
    });

    trails.forEach((trail) => {
      trail.life -= 0.016;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(trail.life, 0) * 0.55})`;
      ctx.fill();
    });
    for (let i = trails.length - 1; i >= 0; i -= 1) if (trails[i].life <= 0) trails.splice(i, 1);

    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vx *= 0.96;
      spark.vy *= 0.96;
      spark.life -= 0.02;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(spark.life, 0)})`;
      ctx.fill();
    });
    for (let i = sparks.length - 1; i >= 0; i -= 1) if (sparks[i].life <= 0) sparks.splice(i, 1);
  }

  function updateChars() {
    if (window.scrollY > window.innerHeight) return;
    chars.forEach((char, index) => {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const radius = 140;
      const force = Math.max(radius - dist, 0) / radius;
      const ox = mouse.active ? -(dx / dist) * force * 18 : 0;
      const oy = mouse.active ? -(dy / dist) * force * 14 + Math.sin((performance.now() + index * 180) / 700) * 3.2 : Math.sin((performance.now() + index * 180) / 700) * 3.2;
      char.style.transform = `translate(${ox}px, ${oy}px) rotate(${ox * 0.12}deg)`;
      char.classList.toggle('is-lit', force > 0.18 || (!mouse.active && index % 5 === Math.floor(performance.now() / 420) % 5));
    });
  }

  function updateCursor() {
    if (!finePointer || !cursorCore || !cursorRing) return;
    core.x += (mouse.x - core.x) * 0.38;
    core.y += (mouse.y - core.y) * 0.38;
    ring.x += (mouse.x - ring.x) * 0.14;
    ring.y += (mouse.y - ring.y) * 0.14;
    cursorCore.style.transform = `translate3d(${core.x}px, ${core.y}px, 0)`;
    cursorRing.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
    cursorCore.style.opacity = mouse.active ? '1' : '0';
    cursorRing.style.opacity = mouse.active ? '1' : '0';
  }

  function updateTilt() {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const state = tiltState.get(card) || { rx: 0, ry: 0, tx: 0, ty: 0 };
      state.rx += (state.tx - state.rx) * 0.12;
      state.ry += (state.ty - state.ry) * 0.12;
      tiltState.set(card, state);
      const lift = card.matches(':hover') ? -8 : 0;
      card.style.transform = `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translateY(${lift}px)`;
    });
  }

  function updateNavLiquid() {
    if (!navLiquid || window.innerWidth <= 900) {
      if (navLiquid) navLiquid.style.width = '0px';
      return;
    }
    const active = document.querySelector('.nav-link.active');
    const menu = document.querySelector('.nav-menu');
    if (!active || !menu) return;
    const menuBox = menu.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    navLiquid.style.left = `${box.left - menuBox.left + 10}px`;
    navLiquid.style.width = `${Math.max(box.width - 20, 12)}px`;
  }

  function updateProgress() {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = `${value}%`;
  }

  function updateParallax() {
    if (!heroVisual) return;
    const y = window.scrollY;
    heroVisual.style.translate = `0 ${Math.min(y * 0.08, 70)}px`;
    document.querySelector('.ambient-a')?.style.setProperty('translate', `${y * -0.03}px ${y * 0.04}px`);
    document.querySelector('.ambient-b')?.style.setProperty('translate', `${y * 0.04}px ${y * -0.03}px`);
    document.querySelector('.grid-bg')?.style.setProperty('transform', `translateY(${y * 0.12}px)`);
  }

  function tick(now) {
    if (running) {
      drawField(now);
      updateCursor();
      if (finePointer) {
        updateChars();
        updateTilt();
      }
    }
    requestAnimationFrame(tick);
  }

  resizeField();
  requestAnimationFrame(tick);
  updateNavLiquid();
  updateProgress();

  window.addEventListener('resize', () => {
    resizeField();
    updateNavLiquid();
  });

  window.addEventListener('pointermove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    const now = performance.now();
    if (now - lastTrail > 70) {
      trails.push({ x: event.clientX, y: event.clientY, life: 1 });
      lastTrail = now;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('blur', () => { mouse.active = false; });

  window.addEventListener('pointerdown', (event) => {
    document.documentElement.classList.add('is-pressing');
    emitBurst(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', () => document.documentElement.classList.remove('is-pressing'));

  const hoverables = 'a, button, .skill-card, .semester-card, .filter, input, textarea, .theme-toggle';
  document.addEventListener('pointerover', (event) => {
    if (event.target.closest(hoverables)) document.documentElement.classList.add('is-hovering');
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest(hoverables) && !event.relatedTarget?.closest(hoverables)) {
      document.documentElement.classList.remove('is-hovering');
    }
  });

  if (finePointer) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const box = el.getBoundingClientRect();
        const x = event.clientX - (box.left + box.width / 2);
        const y = event.clientY - (box.top + box.height / 2);
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    document.querySelectorAll('.tilt-card').forEach((card) => {
      tiltState.set(card, { rx: 0, ry: 0, tx: 0, ty: 0 });
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        const state = tiltState.get(card);
        state.ty = (px - 0.5) * 12;
        state.tx = (0.5 - py) * 10;
      });
      card.addEventListener('pointerleave', () => {
        const state = tiltState.get(card);
        state.tx = 0;
        state.ty = 0;
      });
    });
  }

  window.addEventListener('scroll', () => {
    updateNavLiquid();
    updateProgress();
    updateParallax();
  }, { passive: true });

  const originalToggle = navLinks;
  const observer = new MutationObserver(updateNavLiquid);
  originalToggle.forEach((link) => observer.observe(link, { attributes: true, attributeFilter: ['class'] }));

  window.setTimeout(() => {
    document.querySelectorAll('.decode-title').forEach((title) => {
      const original = title.textContent;
      title.dataset.original = original;
      const decodeObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let frame = 0;
          const run = () => {
            title.textContent = [...original].map((ch, i) => {
              if (ch === ' ' || ch === '.' || ch === "'" || i < frame) return ch;
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }).join('');
            frame += 0.55;
            if (frame < original.length + 2) requestAnimationFrame(run);
            else title.textContent = original;
          };
          run();
          obs.unobserve(title);
        });
      }, { threshold: 0.45 });
      decodeObserver.observe(title);
    });
  }, 2000);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      projectCards.forEach((card) => {
        if (card.hidden) return;
        card.classList.remove('is-filtering');
        void card.offsetWidth;
        card.classList.add('is-filtering');
      });
    });
  });

  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
  });
})();
