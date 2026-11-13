const slides = [...document.querySelectorAll('.slide')];
let current = 0;
let liveIndex = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Setup animation cascade order
slides.forEach(s => s.querySelectorAll('.reveal').forEach((e, i) => e.style.setProperty('--order', Math.min(i, 8))));

// Generate dots
const dotsContainer = document.querySelector('#dots');
if (dotsContainer) {
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'dot-button';
    b.setAttribute('aria-label', `Đến slide ${i + 1}`);
    b.onclick = () => show(i);
    dotsContainer.append(b);
  });
}

function resize() {
  const toolbar = document.querySelector('#toolbar');
  const tbHeight = toolbar ? toolbar.getBoundingClientRect().height : 0;
  const scale = Math.max(0.1, Math.min((innerWidth - 32) / 1280, (innerHeight - tbHeight - 32) / 720));
  document.documentElement.style.setProperty('--scale', scale);
  const stage = document.querySelector('#stage');
  if (stage) {
    stage.style.top = `${(innerHeight - tbHeight) / 2}px`;
  }
}

function animateStage() {
  const live = slides[current].querySelectorAll('[data-live]');
  live.forEach((e, i) => e.classList.toggle('live', i === liveIndex % Math.max(1, live.length)));
}

function show(i) {
  current = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, j) => {
    s.classList.remove('active');
    s.querySelectorAll('.live').forEach(e => e.classList.remove('live'));
    s.setAttribute('aria-hidden', String(j !== current));
  });

  // Force reflow for smooth animation replay
  void slides[current].offsetWidth;
  slides[current].classList.add('active');

  liveIndex = 0;
  animateStage();

  const countEl = document.querySelector('#count');
  if (countEl) countEl.textContent = `SLIDE ${String(current + 1).padStart(2, '0')} / ${slides.length}`;

  const prevBtn = document.querySelector('#prev');
  if (prevBtn) prevBtn.disabled = current === 0;

  const nextBtn = document.querySelector('#next');
  if (nextBtn) nextBtn.disabled = current === slides.length - 1;

  document.querySelectorAll('.dot-button').forEach((b, j) => {
    b.classList.toggle('active', j === current);
    b.setAttribute('aria-current', j === current ? 'step' : 'false');
  });

  const progress = document.querySelector('#progress');
  if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;

  history.replaceState(null, '', `#${current + 1}`);
}

// Live element pulsation loop (every 1.8s)
setInterval(() => {
  if (document.hidden || reduced.matches) return;
  liveIndex++;
  animateStage();
}, 1800);

async function fullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {
    // browser permission fallback
  }
}

// Event Bindings
const prevBtn = document.querySelector('#prev');
if (prevBtn) prevBtn.onclick = () => show(current - 1);

const nextBtn = document.querySelector('#next');
if (nextBtn) nextBtn.onclick = () => show(current + 1);

const replayBtn = document.querySelector('#replay');
if (replayBtn) replayBtn.onclick = () => show(current);

const fsBtn = document.querySelector('#fullscreen');
if (fsBtn) fsBtn.onclick = fullscreen;

// Keyboard navigation
addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || (e.target.closest('button') && [' ', 'Enter'].includes(e.key))) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
    e.preventDefault();
    show(current + 1);
  }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    show(current - 1);
  }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length - 1);
  if (e.key.toLowerCase() === 'r') show(current);
  if (e.key.toLowerCase() === 'f') fullscreen();
});

addEventListener('resize', resize);
addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1));

// Initialize
resize();
show((parseInt(location.hash.slice(1), 10) || 1) - 1);
