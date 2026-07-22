// ============================================================================
// Cinematic intro: the DUX is introduced by a rotating + zooming reveal.
// - On load an auto-intro plays: the shoe zooms in while spinning and the
//   wordmark fades in.
// - Afterwards the tall #intro section becomes scroll-driven: scrolling
//   rotates the shoe through a full turn while it keeps zooming in, the title
//   fades out and a "Jetzt entdecken" button fades in.
// Reuses the existing 360° frames in images/360/black.
// ============================================================================

const FRAME_COUNT = 222;
const FRAME_DIR = 'images/360/black';

const framesEl = document.getElementById('intro-frames');
const introSection = document.getElementById('intro');
const titleEl = document.getElementById('intro-title');
const taglineEl = document.getElementById('intro-tagline');
const hintEl = document.getElementById('intro-hint');
const ctaEl = document.getElementById('intro-cta');

// --- build frames (eager, so nothing pops in blank during the spin) ---
const frames = [];
for (let i = 1; i <= FRAME_COUNT; i++) {
  const img = document.createElement('img');
  img.src = `${FRAME_DIR}/dux-360-${String(i).padStart(3, '0')}.jpg`;
  img.alt = i === 1 ? 'DUX Clog' : '';
  img.loading = 'eager';
  framesEl.appendChild(img);
  frames.push(img);
}
let shownIndex = -1;
function showFrame(index) {
  const i = Math.min(Math.max(index, 0), FRAME_COUNT - 1);
  if (i === shownIndex) return;
  if (shownIndex >= 0) frames[shownIndex].classList.remove('visible');
  frames[i].classList.add('visible');
  shownIndex = i;
}

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// --- shared renderer, driven by scroll progress p in [0, 1] ---
function renderScroll(p) {
  showFrame(Math.floor(p * FRAME_COUNT));
  const scale = 0.7 + p * 0.6;                 // zoom in as you scroll
  framesEl.style.transform = `scale(${scale})`;
  const titleO = clamp(1.15 - p * 2.3, 0, 1);  // title fades out early
  titleEl.style.opacity = titleO;
  taglineEl.style.opacity = titleO;
  hintEl.style.opacity = clamp(1 - p * 6, 0, 1);
  const ctaO = clamp((p - 0.55) / 0.35, 0, 1); // CTA fades in near the end
  ctaEl.style.opacity = ctaO;
  ctaEl.style.pointerEvents = ctaO > 0.9 ? 'auto' : 'none';
  ctaEl.style.transform = `translateX(-50%) translateY(${(1 - ctaO) * 10}px)`;
}

function scrollProgress() {
  const rect = introSection.getBoundingClientRect();
  const dist = rect.height - window.innerHeight;
  return clamp(-rect.top / dist, 0, 1);
}

// --- auto-intro: zoom-in + settle spin, then hand over to scroll ---
let introActive = true;

function renderIntro(a) {
  // a: 0 -> 1 easing progress of the entrance
  const frame = Math.round((1 - a) * 55);      // spins from ~frame 55 to front
  showFrame(frame);
  const scale = 0.4 + a * 0.3;                  // 0.4 -> 0.7 (== scroll p=0)
  framesEl.style.transform = `scale(${scale})`;
  titleEl.style.opacity = clamp((a - 0.3) / 0.7, 0, 1);
  taglineEl.style.opacity = clamp((a - 0.55) / 0.45, 0, 1);
  hintEl.style.opacity = clamp((a - 0.7) / 0.3, 0, 1);
}

function endIntro() {
  if (!introActive) return;
  introActive = false;
  renderScroll(scrollProgress());
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // no entrance animation — just land on the base state
  introActive = false;
  renderScroll(0);
} else {
  renderIntro(0);
  const DURATION = 2200;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function step(now) {
    if (!introActive) return;                  // cancelled by user scroll
    const t = clamp((now - start) / DURATION, 0, 1);
    renderIntro(easeOut(t));
    if (t < 1) requestAnimationFrame(step);
    else endIntro();
  }
  requestAnimationFrame(step);
  // if the visitor scrolls during the entrance, hand control over immediately
  window.addEventListener('wheel', endIntro, { once: true, passive: true });
  window.addEventListener('touchstart', endIntro, { once: true, passive: true });
}

// --- scroll drives the rotation once the intro is done ---
window.addEventListener('scroll', () => {
  if (introActive) { if (window.scrollY > 2) endIntro(); return; }
  requestAnimationFrame(() => renderScroll(scrollProgress()));
}, { passive: true });
window.addEventListener('resize', () => { if (!introActive) renderScroll(scrollProgress()); });
