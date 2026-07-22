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
const shoeMock = document.getElementById('shoe-mock');
const colorNameLabel = document.getElementById('color-name-label');
const swatches = document.querySelectorAll('.swatch');

const orderColorSelect = document.getElementById('of-color');

swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    const name = colorNames[color] || color;
    shoeMock.style.setProperty('--sole', color);
    colorNameLabel.textContent = name;
    swatches.forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
    orderColorSelect.value = name;
  });
});
swatches[0].classList.add('selected');

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

// Scroll-driven 360° rotation: 90 real photos (extracted from a turntable
// video) swap one after another as you scroll through #aufbau. The section
// is 350vh tall while its content stays pinned via `position: sticky`, so
// scroll distance inside the section maps directly to an animation
// progress 0–1, which picks the active frame. All frames are eager-loaded
// so none pop in blank during a fast scroll — the whole point is smoothness.
const BUILD_FRAME_COUNT = 90;
const buildVisual = document.getElementById('build-visual');
const buildFrames = [];
for (let i = 1; i <= BUILD_FRAME_COUNT; i++) {
  const frameNumber = String(i).padStart(3, '0');
  const img = document.createElement('img');
  img.className = 'build-frame';
  img.src = `images/360/dux-360-${frameNumber}.jpg`;
  img.alt = `DUX Clog, Drehwinkel ${i} von ${BUILD_FRAME_COUNT}`;
  img.loading = 'eager';
  buildVisual.appendChild(img);
  buildFrames.push(img);
}
buildFrames[0].classList.add('visible');

const buildSection = document.getElementById('aufbau');
const buildProgressBar = document.getElementById('build-progress-bar');
const buildFrameLabel = document.getElementById('build-frame-label');

function updateBuild() {
  const rect = buildSection.getBoundingClientRect();
  const scrollableDistance = rect.height - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
  const activeIndex = Math.min(Math.floor(progress * buildFrames.length), buildFrames.length - 1);

  buildFrames.forEach((frame, i) => frame.classList.toggle('visible', i === activeIndex));
  buildFrameLabel.textContent = `${activeIndex + 1} / ${buildFrames.length}`;
  buildProgressBar.style.width = `${progress * 100}%`;
}

window.addEventListener('scroll', () => requestAnimationFrame(updateBuild));
window.addEventListener('resize', updateBuild);
updateBuild();
