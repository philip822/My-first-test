import * as THREE from "three";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   THREE.JS SCENE — a clog modeled to match the real Chung Shi
   Dux from the reference photos: closed, perforated vamp over
   an open heel, an arching strap with a metal rivet, and a
   single-tone indigo body. Built from 2D profiles extruded
   into 3D, so no external model file is needed.
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

// Indigo sampled from the reference photos.
const BODY_COLOR = 0x38346f;

function buildVampProfile() {
  // Closed toe box + vamp; the back edge (x=-0.85) is where the
  // heel opening begins — no solid heel counter, matching the clog.
  const shape = new THREE.Shape();
  shape.moveTo(-0.85, -0.35);
  shape.lineTo(1.55, -0.35);
  shape.quadraticCurveTo(1.9, -0.3, 1.9, 0.05);
  shape.quadraticCurveTo(1.9, 0.35, 1.6, 0.5);
  shape.quadraticCurveTo(1.2, 0.65, 0.6, 0.68);
  shape.quadraticCurveTo(0.0, 0.7, -0.35, 0.62);
  shape.quadraticCurveTo(-0.65, 0.55, -0.85, 0.3);
  shape.lineTo(-0.85, -0.35);
  return shape;
}

function buildSoleProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.9, -0.75);
  shape.lineTo(1.6, -0.75);
  shape.quadraticCurveTo(1.95, -0.7, 1.95, -0.4);
  shape.quadraticCurveTo(1.95, -0.25, 1.6, -0.2);
  shape.lineTo(-1.75, -0.2);
  shape.quadraticCurveTo(-2.05, -0.25, -2.05, -0.5);
  shape.quadraticCurveTo(-2.05, -0.68, -1.9, -0.75);
  return shape;
}

function buildOutsoleProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.85, -0.86);
  shape.lineTo(1.55, -0.86);
  shape.quadraticCurveTo(2.0, -0.82, 2.0, -0.6);
  shape.lineTo(-1.95, -0.6);
  shape.quadraticCurveTo(-2.15, -0.68, -1.85, -0.86);
  return shape;
}

const clog = new THREE.Group();

const vampMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.55, metalness: 0.04 });
const vampGeo = new THREE.ExtrudeGeometry(buildVampProfile(), { depth: 0.95, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.045, bevelSegments: 3 });
vampGeo.translate(0, 0, -0.475);
const vampMesh = new THREE.Mesh(vampGeo, vampMat);
clog.add(vampMesh);

const soleMat = new THREE.MeshStandardMaterial({
  color: BODY_COLOR,
  roughness: 0.5,
  metalness: 0.03,
  emissive: ACCENT_COOL.clone(),
  emissiveIntensity: 0.1,
});
const soleGeo = new THREE.ExtrudeGeometry(buildSoleProfile(), { depth: 1.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2 });
soleGeo.translate(0, 0, -0.525);
const soleMesh = new THREE.Mesh(soleGeo, soleMat);
clog.add(soleMesh);

const outsoleMat = new THREE.MeshStandardMaterial({ color: 0x201c47, roughness: 0.9, metalness: 0 });
const outsoleGeo = new THREE.ExtrudeGeometry(buildOutsoleProfile(), { depth: 1.1, bevelEnabled: false });
outsoleGeo.translate(0, 0, -0.55);
const outsoleMesh = new THREE.Mesh(outsoleGeo, outsoleMat);
clog.add(outsoleMesh);

// Perforation holes: dark oval/round decals on the vamp's outward face.
const holeMat = new THREE.MeshStandardMaterial({ color: 0x15112c, roughness: 0.8 });
const upperRow = [
  [-0.45, 0.44, 0.6, 0.24],
  [-0.05, 0.47, 0.65, 0.24],
  [0.35, 0.47, 0.6, 0.24],
  [1.15, 0.5, 0.5, 0.3],
];
const lowerRow = [
  [-0.6, 0.1, 0.85, 1],
  [-0.2, 0.08, 0.9, 1],
  [0.2, 0.1, 0.85, 1],
  [0.58, 0.12, 0.8, 1],
  [0.95, 0.16, 0.7, 1],
];
[...upperRow, ...lowerRow].forEach(([x, y, sx, sy]) => {
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 20), holeMat);
  hole.rotation.x = Math.PI / 2;
  hole.scale.set(sx, sy, 1);
  hole.position.set(x, y, 0.56);
  clog.add(hole);
});

// Heel strap: a half-torus arching over the open heel, plus a metal rivet.
const strapMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6, metalness: 0.04, side: THREE.DoubleSide });
const strapGeo = new THREE.TorusGeometry(0.46, 0.058, 12, 32, Math.PI);
strapGeo.rotateY(Math.PI / 2);
const strapMesh = new THREE.Mesh(strapGeo, strapMat);
strapMesh.position.set(-1.0, 0.12, 0);
clog.add(strapMesh);

const rivetMat = new THREE.MeshStandardMaterial({ color: 0xa8a8ac, roughness: 0.3, metalness: 0.75 });
const rivetMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20), rivetMat);
rivetMesh.rotation.z = Math.PI / 2;
rivetMesh.position.set(-1.0, 0.12, 0.47);
clog.add(rivetMesh);

clog.rotation.y = -0.32;
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
  clog.rotation.y = -0.32 + progress * Math.PI * 2;

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
