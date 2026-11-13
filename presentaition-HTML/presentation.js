'use strict';
// Local MathJax renders the authored LaTeX as SVG, including when opened offline.
window.MathJax = {
  tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] },
  svg: { fontCache: 'local' },
  options: { enableMenu: false, skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const select = document.querySelector('#slide-select');
  const notes = document.querySelector('#notes-panel');
  const noteButton = document.querySelector('#notes-button');
  const readingButton = document.querySelector('#reading-button');
  const motionButton = document.querySelector('#motion-button');
  const timerButton = document.querySelector('#timer-button');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, remaining = 600, interval = null, deadline = 0;
  let motionOff = reduced.matches;
  const reading = () => document.body.classList.contains('reading');

  function resize() {
    const toolbarHeight = document.querySelector('.toolbar').getBoundingClientRect().height;
    const scale = Math.max(.05, Math.min((innerWidth - 24) / 1280, (innerHeight - toolbarHeight - 24) / 720));
    document.documentElement.style.setProperty('--scale', scale);
  }
  function show(next, updateHash = true) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.inert = !reading() && i !== index;
      slide.setAttribute('aria-hidden', String(!reading() && i !== index));
    });
    select.value = String(index);
    document.querySelector('#prev').disabled = index === 0;
    document.querySelector('#next').disabled = index === slides.length - 1;
    document.querySelector('#count').textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    document.querySelector('#progress').style.width = `${(index + 1) / slides.length * 100}%`;
    document.querySelector('#announce').textContent = `Slide ${index + 1}: ${slides[index].dataset.title}`;
    document.querySelector('#notes-heading').textContent = `Slide ${index + 1} · ${slides[index].dataset.duration} giây`;
    document.querySelector('#notes-content').textContent = slides[index].querySelector('.speaker-source').textContent;
    document.querySelector('#notes-evidence').textContent = slides[index].querySelector('.evidence-source').textContent;
    document.querySelector('#notes-transition').textContent = slides[index].querySelector('.transition-source').textContent;
    if (updateHash) history.replaceState(null, '', `#${index + 1}`);
    if (reading()) slides[index].scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function toggleNotes(force) {
    const open = typeof force === 'boolean' ? force : notes.hidden;
    notes.hidden = !open;
    noteButton.setAttribute('aria-pressed', String(open));
    if (open) document.querySelector('#close-notes').focus();
    else noteButton.focus();
  }
  function updateMotion() {
    document.body.classList.toggle('no-motion', motionOff || reduced.matches);
    motionButton.setAttribute('aria-pressed', String(!motionOff && !reduced.matches));
    motionButton.textContent = motionOff || reduced.matches ? 'Motion: tắt' : 'Motion: bật';
  }
  function clock() {
    document.querySelector('#clock').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  }
  function pause() {
    clearInterval(interval); interval = null;
    timerButton.textContent = remaining ? 'Tiếp tục' : 'Hết giờ';
    timerButton.setAttribute('aria-pressed', 'false');
  }
  timerButton.addEventListener('click', () => {
    if (interval !== null) { remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); pause(); clock(); return; }
    if (!remaining) return;
    deadline = Date.now() + remaining * 1000;
    timerButton.textContent = 'Tạm dừng'; timerButton.setAttribute('aria-pressed', 'true');
    interval = setInterval(() => {
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); clock();
      if (!remaining) { pause(); document.querySelector('#announce').textContent = 'Đã hết thời lượng 10 phút.'; }
    }, 200);
  });
  document.querySelector('#reset').addEventListener('click', () => { pause(); remaining = 600; clock(); timerButton.textContent = 'Bắt đầu'; });
  document.querySelector('#prev').addEventListener('click', () => show(index - 1));
  document.querySelector('#next').addEventListener('click', () => show(index + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  noteButton.addEventListener('click', () => toggleNotes());
  document.querySelector('#close-notes').addEventListener('click', () => toggleNotes(false));
  readingButton.addEventListener('click', () => {
    const on = document.body.classList.toggle('reading');
    readingButton.textContent = on ? 'Trình chiếu' : 'Chế độ đọc';
    readingButton.setAttribute('aria-pressed', String(on)); show(index); resize();
  });
  motionButton.addEventListener('click', () => { motionOff = !motionOff; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  document.querySelector('#fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      document.querySelector('#announce').textContent = 'Trình duyệt không cho toàn màn hình. Có thể dùng chế độ toàn màn hình của trình duyệt.';
    }
  });
  document.querySelector('#print').addEventListener('click', () => window.print());
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && !notes.hidden) { toggleNotes(false); return; }
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('button,select,input,textarea,a')) return;
    if (event.key.toLowerCase() === 'n') { toggleNotes(); return; }
    if (!notes.hidden) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key) && !(reading() && event.key === ' ')) { event.preventDefault(); show(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    if (!reading() && event.key === 'Home') { event.preventDefault(); show(0); }
    if (!reading() && event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    if (event.key.toLowerCase() === 'm') { motionOff = !motionOff; updateMotion(); }
  });
  addEventListener('resize', resize);
  addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1, false));
  resize(); updateMotion(); clock(); show((parseInt(location.hash.slice(1), 10) || 1) - 1, false);
})();
