import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { createClogModel } from "./clog-model.js";

const canvas = document.getElementById("viewer-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0d0c);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(2.4, 1.4, 4.6);

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(3, 5, 4);
const fillLight = new THREE.DirectionalLight(0x8fb8c9, 0.35);
fillLight.position.set(-4, 2, -3);
const rimLight = new THREE.DirectionalLight(0xe2725b, 0.3);
rimLight.position.set(-2, 1, -4);

scene.add(ambient, keyLight, fillLight, rimLight);

const { clog } = createClogModel(THREE);
scene.add(clog);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, -0.1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI * 0.85;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.2;
controls.update();

let userInteracted = false;
controls.addEventListener("start", () => {
  if (!userInteracted) {
    userInteracted = true;
    controls.autoRotate = false;
    document.getElementById("viewer-hint").classList.add("hint-hidden");
  }
});

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
