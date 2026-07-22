// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('open'));
});

// Color picker
const colorNames = {
  '#e8734a': 'Orange',
  '#2f7a63': 'Grün',
  '#264b8c': 'Blau',
  '#1c1c1e': 'Schwarz',
  '#c23b5a': 'Beere'
};
const colorNameLabel = document.getElementById('color-name-label');
const swatches = document.querySelectorAll('.swatch');
const heroShoe = document.getElementById('hero-shoe');
const heroGlow = document.getElementById('hero-glow');

const orderColorSelect = document.getElementById('of-color');

// real hero photos exist for these two colors; others just tint the glow
const HERO_PHOTOS = { 'Schwarz': 'images/hero-black.jpg', 'Blau': 'images/hero-blue.jpg' };

swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    const name = colorNames[color] || color;
    colorNameLabel.textContent = name;
    swatches.forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
    orderColorSelect.value = name;
    // colored glow behind the hero shoe follows every color choice
    heroGlow.style.setProperty('--glow', color);
    // swap the hero photo when we actually have one for this color
    if (HERO_PHOTOS[name]) {
      heroShoe.src = HERO_PHOTOS[name];
      heroShoe.alt = `DUX Clog in ${name}`;
    }
    // if we have a 360° photo set for this color, switch the rotation to it
    activateRotation(name);
  });
});

// start on Schwarz so the hero photo, glow and labels all agree
(function initColor() {
  const blackSwatch = document.querySelector('.swatch[data-color="#1c1c1e"]');
  if (blackSwatch) {
    blackSwatch.classList.add('selected');
    colorNameLabel.textContent = 'Schwarz';
    orderColorSelect.value = 'Schwarz';
    heroGlow.style.setProperty('--glow', '#1c1c1e');
  }
})();

// Testimonial slider
const testimonials = document.querySelectorAll('.testimonial');
const dotsContainer = document.getElementById('dots');
let currentTestimonial = 0;

testimonials.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => showTestimonial(i));
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('.dot');

function showTestimonial(index) {
  testimonials[currentTestimonial].classList.remove('active');
  dots[currentTestimonial].classList.remove('active');
  currentTestimonial = (index + testimonials.length) % testimonials.length;
  testimonials[currentTestimonial].classList.add('active');
  dots[currentTestimonial].classList.add('active');
}

document.getElementById('prev-btn').addEventListener('click', () => showTestimonial(currentTestimonial - 1));
document.getElementById('next-btn').addEventListener('click', () => showTestimonial(currentTestimonial + 1));

setInterval(() => showTestimonial(currentTestimonial + 1), 6000);

// FAQ accordion
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.parentElement;
    const panel = item.querySelector('.accordion-panel');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.accordion-item').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.accordion-panel').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// Order form – opens the visitor's email app with the request pre-filled.
// Trag hier deine eigene E-Mail-Adresse ein, an die Anfragen gehen sollen:
const ORDER_EMAIL = 'Philip.ertl@meandfriends.ag';

const orderForm = document.getElementById('order-form');
const ctaFeedback = document.getElementById('cta-feedback');

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(orderForm);
  const name = data.get('name');
  const email = data.get('email');
  const groesse = data.get('groesse');
  const farbe = data.get('farbe');
  const nachricht = data.get('nachricht') || '(keine)';

  const subject = `DUX-Anfrage von ${name}`;
  const body =
    `Name: ${name}\n` +
    `E-Mail: ${email}\n` +
    `Größe: ${groesse}\n` +
    `Farbe: ${farbe}\n` +
    `Nachricht: ${nachricht}`;

  window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  ctaFeedback.textContent = 'Dein E-Mail-Programm öffnet sich gleich mit der ausgefüllten Anfrage – dort einfach auf „Senden" klicken.';
});

// Scroll-driven 360° rotation: frames from each color's turntable video swap
// one after another as you scroll through #aufbau. Black is every real frame
// of its video (222); blue is 360 evenly-spaced frames from a slower, steadier
// 16 s turntable. The section is 350vh tall while its content stays pinned via
// `position: sticky`, so scroll distance inside the section maps directly to
// an animation progress 0–1, which picks the active frame. Frames are
// eager-loaded so none pop in blank during a fast scroll — the point is
// smoothness.
const ROTATION_SETS = {
  // name (matching the color picker) -> folder + frame count; `frames` lazy
  'Schwarz': { dir: 'images/360/black', count: 222, frames: null },
  'Blau':    { dir: 'images/360/blue',  count: 360, frames: null },
};

const buildVisual = document.getElementById('build-visual');
const buildSection = document.getElementById('aufbau');
const buildProgressBar = document.getElementById('build-progress-bar');
const buildFrameLabel = document.getElementById('build-frame-label');
const buildSwatches = document.querySelectorAll('.build-swatch');

let buildFrames = [];         // the img elements of the currently active color
let activeRotation = null;

function buildRotationFrames(setKey) {
  const set = ROTATION_SETS[setKey];
  if (set.frames) return set.frames;   // build each color's images only once
  const frames = [];
  for (let i = 1; i <= set.count; i++) {
    const frameNumber = String(i).padStart(3, '0');
    const img = document.createElement('img');
    img.className = 'build-frame';
    img.src = `${set.dir}/dux-360-${frameNumber}.jpg`;
    img.alt = `DUX Clog ${setKey}, Drehwinkel ${i} von ${set.count}`;
    img.loading = 'eager';
    frames.push(img);
  }
  set.frames = frames;
  return frames;
}

function scrollProgress() {
  const rect = buildSection.getBoundingClientRect();
  const scrollableDistance = rect.height - window.innerHeight;
  return Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
}

async function activateRotation(setKey) {
  if (!ROTATION_SETS[setKey] || setKey === activeRotation) return;  // no photos for this color -> ignore
  const frames = buildRotationFrames(setKey);
  // preload the frame that will be shown so the switch doesn't flash blank
  const idx = Math.min(Math.floor(scrollProgress() * frames.length), frames.length - 1);
  try { await frames[idx].decode(); } catch (e) { /* ignore load errors */ }
  activeRotation = setKey;
  buildFrames = frames;
  buildVisual.replaceChildren(...frames);
  buildSwatches.forEach(s => s.classList.toggle('selected', s.dataset.rotation === setKey));
  updateBuild();
}

function updateBuild() {
  if (!buildFrames.length) return;
  const progress = scrollProgress();
  const activeIndex = Math.min(Math.floor(progress * buildFrames.length), buildFrames.length - 1);

  buildFrames.forEach((frame, i) => frame.classList.toggle('visible', i === activeIndex));
  buildFrameLabel.textContent = `${activeIndex + 1} / ${buildFrames.length}`;
  buildProgressBar.style.width = `${progress * 100}%`;
}

buildSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => activateRotation(swatch.dataset.rotation));
});

activateRotation('Schwarz');

window.addEventListener('scroll', () => requestAnimationFrame(updateBuild));
window.addEventListener('resize', updateBuild);
updateBuild();

// ---- Scroll progress bar ----
const scrollProgressBar = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgressBar.style.width = `${pct}%`;
}
window.addEventListener('scroll', () => requestAnimationFrame(updateScrollProgress));
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

// ---- Back-to-top button ----
const toTop = document.getElementById('to-top');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 600);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---- Scroll-reveal (fade elements in as they enter the viewport) ----
// A plain scroll check rather than IntersectionObserver: the observer can miss
// small elements when a fast scroll over the tall rotation section skips the
// intersecting moment. Re-checking positions every scroll is reliable at any
// speed, and once an element is scrolled past it simply stays revealed.
const revealEls = [...document.querySelectorAll('.reveal')];
function revealOnScroll() {
  const trigger = window.innerHeight * 0.9;
  for (let i = revealEls.length - 1; i >= 0; i--) {
    if (revealEls[i].getBoundingClientRect().top < trigger) {
      revealEls[i].classList.add('is-visible');
      revealEls.splice(i, 1);
    }
  }
}
window.addEventListener('scroll', () => requestAnimationFrame(revealOnScroll));
window.addEventListener('resize', revealOnScroll);
revealOnScroll();

// ---- Scroll-spy: highlight the nav link of the section in view ----
const navLinks = [...document.querySelectorAll('.nav-menu a')];
const spySections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
if ('IntersectionObserver' in window && spySections.length) {
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spySections.forEach(sec => spyObserver.observe(sec));
}
