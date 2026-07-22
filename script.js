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

swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    shoeMock.style.setProperty('--sole', color);
    colorNameLabel.textContent = colorNames[color] || color;
    swatches.forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
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

// Demo "add to cart" button
const ctaButton = document.getElementById('cta-button');
const ctaFeedback = document.getElementById('cta-feedback');
ctaButton.addEventListener('click', () => {
  ctaFeedback.textContent = 'Danke! Das war nur eine Demo – es wurde nichts bestellt. 😊';
});
