import * as THREE from "three";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   THREE.JS SCENE — stylized, procedurally-built shoe silhouette.
   No external 3D model file: everything is generated from 2D
   profile shapes extruded into 3D, so the demo runs standalone.
   ========================================================= */

const canvas = document.getElementById("webgl-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0d0c);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.25, 6.4);
camera.lookAt(0, -0.05, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(3, 5, 4);
const fillLight = new THREE.DirectionalLight(0x8fb8c9, 0.3);
fillLight.position.set(-4, 2, -3);

const ACCENT_COOL = new THREE.Color(0x8fb8c9);
const ACCENT_WARM = new THREE.Color(0xe2725b);

const glowLight = new THREE.PointLight(ACCENT_COOL.clone(), 0.6, 4, 2);
glowLight.position.set(0, -0.5, 0.25);

scene.add(ambient, keyLight, fillLight, glowLight);

function buildShoeProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.55, -0.55);
  shape.lineTo(1.45, -0.55);
  shape.quadraticCurveTo(1.85, -0.5, 1.85, -0.15);
  shape.quadraticCurveTo(1.85, 0.15, 1.55, 0.3);
  shape.quadraticCurveTo(1.1, 0.5, 0.5, 0.55);
  shape.quadraticCurveTo(0.05, 0.6, -0.35, 0.5);
  shape.quadraticCurveTo(-0.65, 0.45, -0.85, 0.55);
  shape.quadraticCurveTo(-1.15, 0.68, -1.5, 0.75);
  shape.quadraticCurveTo(-1.85, 0.8, -1.9, 0.45);
  shape.quadraticCurveTo(-1.95, 0.05, -1.75, -0.25);
  shape.quadraticCurveTo(-1.65, -0.45, -1.55, -0.55);
  return shape;
}

function buildMidsoleProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.62, -0.75);
  shape.lineTo(1.55, -0.75);
  shape.quadraticCurveTo(1.9, -0.7, 1.9, -0.4);
  shape.quadraticCurveTo(1.9, -0.25, 1.6, -0.2);
  shape.lineTo(-1.5, -0.2);
  shape.quadraticCurveTo(-1.85, -0.25, -1.85, -0.45);
  shape.quadraticCurveTo(-1.85, -0.65, -1.62, -0.75);
  return shape;
}

function buildToeCapProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(0.92, -0.52);
  shape.lineTo(1.72, -0.5);
  shape.quadraticCurveTo(1.92, -0.45, 1.92, -0.15);
  shape.quadraticCurveTo(1.92, 0.2, 1.55, 0.34);
  shape.quadraticCurveTo(1.2, 0.44, 0.9, 0.36);
  shape.quadraticCurveTo(0.78, 0.0, 0.92, -0.52);
  return shape;
}

function buildHeelCounterProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.35, -0.56);
  shape.lineTo(-1.35, 0.58);
  shape.quadraticCurveTo(-1.72, 0.66, -1.88, 0.42);
  shape.quadraticCurveTo(-1.98, 0.05, -1.8, -0.36);
  shape.quadraticCurveTo(-1.65, -0.56, -1.35, -0.56);
  return shape;
}

function buildOutsoleProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.55, -0.86);
  shape.lineTo(1.5, -0.86);
  shape.quadraticCurveTo(1.78, -0.83, 1.78, -0.72);
  shape.quadraticCurveTo(1.78, -0.63, 1.5, -0.6);
  shape.lineTo(-1.45, -0.6);
  shape.quadraticCurveTo(-1.72, -0.63, -1.72, -0.74);
  shape.quadraticCurveTo(-1.72, -0.83, -1.55, -0.86);
  return shape;
}

const shoe = new THREE.Group();

const upperMat = new THREE.MeshStandardMaterial({ color: 0xf3efe9, roughness: 0.85, metalness: 0.02 });
const upperGeo = new THREE.ExtrudeGeometry(buildShoeProfile(), { depth: 0.85, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 });
upperGeo.translate(0, 0, -0.425);
const upperMesh = new THREE.Mesh(upperGeo, upperMat);
shoe.add(upperMesh);

const midsoleMat = new THREE.MeshStandardMaterial({
  color: ACCENT_WARM.clone(),
  roughness: 0.45,
  metalness: 0.1,
  emissive: ACCENT_WARM.clone(),
  emissiveIntensity: 0.15,
});
const midsoleGeo = new THREE.ExtrudeGeometry(buildMidsoleProfile(), { depth: 0.95, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
midsoleGeo.translate(0, 0, -0.475);
const midsoleMesh = new THREE.Mesh(midsoleGeo, midsoleMat);
shoe.add(midsoleMesh);

const outsoleMat = new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 0.95, metalness: 0 });
const outsoleGeo = new THREE.ExtrudeGeometry(buildOutsoleProfile(), { depth: 1.0, bevelEnabled: false });
outsoleGeo.translate(0, 0, -0.5);
const outsoleMesh = new THREE.Mesh(outsoleGeo, outsoleMat);
shoe.add(outsoleMesh);

const panelMat = new THREE.MeshStandardMaterial({ color: 0x3a3733, roughness: 0.6, metalness: 0.05 });

const toeCapGeo = new THREE.ExtrudeGeometry(buildToeCapProfile(), { depth: 0.7, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
toeCapGeo.translate(0, 0, -0.35);
const toeCapMesh = new THREE.Mesh(toeCapGeo, panelMat);
toeCapMesh.position.z = 0.13;
shoe.add(toeCapMesh);

const heelCounterGeo = new THREE.ExtrudeGeometry(buildHeelCounterProfile(), { depth: 0.7, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
heelCounterGeo.translate(0, 0, -0.35);
const heelCounterMesh = new THREE.Mesh(heelCounterGeo, panelMat);
heelCounterMesh.position.z = 0.13;
shoe.add(heelCounterMesh);

const lacesMat = new THREE.MeshStandardMaterial({ color: 0x24211d, roughness: 0.7 });
for (let i = 0; i < 4; i++) {
  const lace = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.045, 0.06), lacesMat);
  lace.position.set(-0.55 + i * 0.22, 0.4 + i * 0.02, 0.46);
  lace.rotation.z = 0.35;
  shoe.add(lace);
}

shoe.rotation.y = -0.28;
scene.add(shoe);

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

let coreFocus = 0; // 0..1, peaks while the "REBOUND CORE" copy block is centered in view

function updateSceneFromScroll(progress) {
  shoe.rotation.y = -0.28 + progress * Math.PI * 2;

  const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
  const baseIntensity = 0.5 + progress * 1.4;
  const boosted = baseIntensity + coreFocus * 2.2 + pulse * 0.15 * coreFocus;
  glowLight.intensity = boosted;

  const mixed = ACCENT_COOL.clone().lerp(ACCENT_WARM, coreFocus);
  glowLight.color.copy(mixed);
  midsoleMat.emissive.copy(mixed);
  midsoleMat.emissiveIntensity = 0.15 + coreFocus * 1.1;
}

function animate() {
  requestAnimationFrame(animate);
  shoe.rotation.x = Math.sin(performance.now() * 0.0004) * 0.02;
  renderer.render(scene, camera);
}
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
