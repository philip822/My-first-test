import * as THREE from "three";
import { createClogModel } from "./clog-model.js";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   THREE.JS SCENE — see clog-model.js for the geometry, which is
   extruded from a silhouette traced directly from the reference
   photo and textured with that same photo on the front face.
   ========================================================= */

const canvas = document.getElementById("webgl-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0d0c);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.3, 6.4);
camera.lookAt(0, -0.05, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
keyLight.position.set(3, 5, 4);
const fillLight = new THREE.DirectionalLight(0x8fb8c9, 0.32);
fillLight.position.set(-4, 2, -3);

const ACCENT_COOL = new THREE.Color(0x8fb8c9);
const ACCENT_WARM = new THREE.Color(0xe2725b);

const glowLight = new THREE.PointLight(ACCENT_COOL.clone(), 0.6, 4, 2);
glowLight.position.set(0.2, -0.55, 0.3);

scene.add(ambient, keyLight, fillLight, glowLight);

const { clog, soleMat } = createClogModel(THREE);
clog.rotation.y = -0.08;
scene.add(clog);

function resize() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

let coreFocus = 0; // 0..1, peaks while the "core" copy block is centered in view

function updateSceneFromScroll(progress) {
  clog.rotation.y = -0.08 + progress * Math.PI * 2;

  const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
  const baseIntensity = 0.5 + progress * 1.4;
  const boosted = baseIntensity + coreFocus * 2.2 + pulse * 0.15 * coreFocus;
  glowLight.intensity = boosted;

  const mixed = ACCENT_COOL.clone().lerp(ACCENT_WARM, coreFocus);
  glowLight.color.copy(mixed);
  soleMat.emissive.copy(mixed);
  soleMat.emissiveIntensity = 0.1 + coreFocus * 1.1;
}

function animate() {
  requestAnimationFrame(animate);
  clog.rotation.x = Math.sin(performance.now() * 0.0004) * 0.02;
  renderer.render(scene, camera);
}
updateSceneFromScroll(0);
animate();

/* =========================================================
   GSAP SCROLLTRIGGER — drives rotation/glow, pins the visual
   (via a fixed-position canvas) while copy scrolls alongside,
   and reveals each feature block as it enters view.
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

// Fade the fixed 3D scene out once the gallery section takes over.
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
