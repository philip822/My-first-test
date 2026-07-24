const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   REAL 360° PHOTO SEQUENCE
   48 frames extracted from an actual turntable video of the
   Chung Shi Dux. Rotation is scroll-driven: scroll progress
   maps directly onto the frame index.
   ========================================================= */

const TOTAL_FRAMES = 48;
const frameSrc = (n) => `assets/dux-360/frame-${String(n).padStart(2, "0")}.jpg`;

const frameImg = document.getElementById("dux-frame");
const glow = document.getElementById("dux-glow");

const preloaded = [];
for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = frameSrc(i);
  preloaded.push(img);
}

const ACCENT_COOL = { r: 143, g: 184, b: 201 }; // --accent-2
const ACCENT_WARM = { r: 226, g: 114, b: 91 }; // --accent

function lerpColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

let coreFocus = 0; // 0..1, peaks while the "core" copy block is centered in view
let lastFrame = -1;

function updateSceneFromScroll(progress) {
  const frame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));
  if (frame !== lastFrame) {
    frameImg.src = frameSrc(frame);
    lastFrame = frame;
  }

  const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
  const baseOpacity = 0.18 + progress * 0.22;
  const boosted = baseOpacity + coreFocus * 0.55 + pulse * 0.05 * coreFocus;
  const mixed = lerpColor(ACCENT_COOL, ACCENT_WARM, coreFocus);

  glow.style.opacity = String(Math.min(1, boosted));
  glow.style.background = `radial-gradient(closest-side, rgb(${mixed.r}, ${mixed.g}, ${mixed.b}), transparent 70%)`;
}

updateSceneFromScroll(0);

/* =========================================================
   GSAP SCROLLTRIGGER — drives the frame swap/glow, pins the
   visual (via a fixed-position stage) while copy scrolls
   alongside, and reveals each feature block as it enters view.
   ========================================================= */

const sceneRange = document.getElementById("scene-range");
const sceneFixed = document.getElementById("scene-fixed");

ScrollTrigger.create({
  trigger: sceneRange,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate(self) {
    updateSceneFromScroll(self.progress);
  },
});

// Fade the fixed photo stage out once the gallery section takes over.
ScrollTrigger.create({
  trigger: "#gallery-section",
  start: "top bottom",
  end: "top top",
  scrub: true,
  onUpdate(self) {
    sceneFixed.style.opacity = String(1 - self.progress);
  },
});

document.querySelectorAll(".copy-block").forEach((block) => {
  gsap.to(block, {
    opacity: 1,
    y: 0,
    ease: "none",
    scrollTrigger: { trigger: block, start: "top 75%", end: "top 35%", scrub: true },
  });
  gsap.to(block, {
    opacity: 0,
    y: -24,
    ease: "none",
    scrollTrigger: { trigger: block, start: "bottom 65%", end: "bottom 20%", scrub: true },
  });
});

const coreBlock = document.querySelector('.copy-block[data-feature="core"]');
if (coreBlock) {
  ScrollTrigger.create({
    trigger: coreBlock,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate(self) {
      coreFocus = Math.max(0, 1 - Math.abs(self.progress - 0.5) * 2);
    },
  });
}

/* =========================================================
   INFINITE HORIZONTAL SCROLL-SNAP GALLERY
   Triples the card set ([clone][original][clone]) and jumps
   scrollLeft by one set width when the edge is crossed, so
   the loop feels endless in both directions.
   ========================================================= */

const track = document.getElementById("gallery-track");
if (track) {
  const originalCards = Array.from(track.children);
  const n = originalCards.length;

  const before = document.createDocumentFragment();
  originalCards.forEach((c) => before.appendChild(c.cloneNode(true)));
  track.insertBefore(before, track.firstChild);

  const after = document.createDocumentFragment();
  originalCards.forEach((c) => after.appendChild(c.cloneNode(true)));
  track.appendChild(after);

  const children = Array.from(track.children);
  const singleSetWidth = children[n].offsetLeft - children[0].offsetLeft;
  track.scrollLeft = singleSetWidth;

  track.addEventListener("scroll", () => {
    if (track.scrollLeft <= 2) {
      track.scrollLeft += singleSetWidth;
    } else if (track.scrollLeft >= singleSetWidth * 2 - 2) {
      track.scrollLeft -= singleSetWidth;
    }
  });
}

/* =========================================================
   LOTTIE FEATURE ICONS
   ========================================================= */

const lottie = window.lottie;
if (lottie) {
  const coreIcon = document.getElementById("lottie-core");
  const meshIcon = document.getElementById("lottie-mesh");
  if (coreIcon) lottie.loadAnimation({ container: coreIcon, path: "assets/lottie/pulse.json", renderer: "svg", loop: true, autoplay: true });
  if (meshIcon) lottie.loadAnimation({ container: meshIcon, path: "assets/lottie/mesh.json", renderer: "svg", loop: true, autoplay: true });
}
