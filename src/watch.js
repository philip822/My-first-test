import * as THREE from 'three';

const CASE_RADIUS = 1.0;
const CASE_HEIGHT = 0.2;
const BEZEL_RADIUS = 0.98;
const DIAL_RADIUS = 0.82;

function buildDialTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Matte black dial base
  ctx.fillStyle = '#0c0c0c';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Faint concentric sunburst rings for texture
  for (let i = r; i > 0; i -= 6) {
    ctx.strokeStyle = `rgba(255,255,255,${0.015 + (i / r) * 0.01})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, i, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Minute track
  ctx.strokeStyle = '#e8e8e8';
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const isHour = i % 5 === 0;
    const outer = r * 0.94;
    const inner = isHour ? r * 0.86 : r * 0.91;
    ctx.lineWidth = isHour ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(angle) * outer, cy - Math.cos(angle) * outer);
    ctx.lineTo(cx + Math.sin(angle) * inner, cy - Math.cos(angle) * inner);
    ctx.stroke();
  }

  // Baton hour markers
  ctx.fillStyle = '#f2f2f2';
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const outer = r * 0.84;
    const inner = r * 0.72;
    const midOuter = { x: cx + Math.sin(angle) * outer, y: cy - Math.cos(angle) * outer };
    const midInner = { x: cx + Math.sin(angle) * inner, y: cy - Math.cos(angle) * inner };
    const perp = angle + Math.PI / 2;
    const w = r * 0.014;
    ctx.beginPath();
    ctx.moveTo(midOuter.x + Math.sin(perp) * w, midOuter.y - Math.cos(perp) * w);
    ctx.lineTo(midOuter.x - Math.sin(perp) * w, midOuter.y + Math.cos(perp) * w);
    ctx.lineTo(midInner.x - Math.sin(perp) * w, midInner.y + Math.cos(perp) * w);
    ctx.lineTo(midInner.x + Math.sin(perp) * w, midInner.y - Math.cos(perp) * w);
    ctx.closePath();
    ctx.fill();
  }

  // Subdial helper
  function drawSubdial(sx, sy, radius, maxVal, step) {
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c8c8c8';
    const ticks = maxVal / step;
    for (let i = 0; i < ticks; i++) {
      const angle = (i / ticks) * Math.PI * 2;
      const outer = radius * 0.92;
      const inner = radius * 0.78;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + Math.sin(angle) * outer, sy - Math.cos(angle) * outer);
      ctx.lineTo(sx + Math.sin(angle) * inner, sy - Math.cos(angle) * inner);
      ctx.stroke();
    }

    ctx.fillStyle = '#d8d8d8';
    ctx.font = `${Math.round(radius * 0.24)}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelSteps = maxVal / (step * 2);
    for (let i = 1; i <= labelSteps; i++) {
      const val = i * step * 2;
      const angle = (val / maxVal) * Math.PI * 2;
      const lr = radius * 0.6;
      ctx.fillText(
        String(val),
        sx + Math.sin(angle) * lr,
        sy - Math.cos(angle) * lr
      );
    }

    // subdial hand pointing to 12
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, sy - radius * 0.7);
    ctx.stroke();
  }

  const subR = r * 0.16;
  drawSubdial(cx, cy - r * 0.42, subR, 60, 5); // 12-hour counter, top
  drawSubdial(cx - r * 0.42, cy, subR, 30, 5); // 30-min counter, left
  drawSubdial(cx + r * 0.42, cy, subR, 60, 5); // running seconds, right

  // Center pinion cap
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.03, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildBrushedSteelTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = '#9a9a9c';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 720; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = size * 0.5;
    const shade = 130 + Math.floor(Math.random() * 60);
    ctx.strokeStyle = `rgba(${shade},${shade},${shade + 2},0.18)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildHand(length, width, thickness, color) {
  const shape = new THREE.Shape();
  const tailLen = length * 0.18;
  shape.moveTo(-width / 2, -tailLen);
  shape.lineTo(width / 2, -tailLen);
  shape.lineTo(width / 2, length * 0.7);
  shape.lineTo(0, length);
  shape.lineTo(-width / 2, length * 0.7);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.4,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  // Wrap in a pivot group so the clock-angle (Y) rotation always turns
  // around the true vertical axis, independent of the flattening rotation above.
  const pivot = new THREE.Group();
  pivot.add(mesh);
  return pivot;
}

function init() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  const aspect = window.innerWidth / window.innerHeight;
  const viewSize = 1.6;
  const camera = new THREE.OrthographicCamera(
    (-viewSize * aspect) / 2,
    (viewSize * aspect) / 2,
    viewSize / 2,
    -viewSize / 2,
    0.1,
    10
  );
  camera.position.set(0, 5, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = false;
  document.body.appendChild(renderer.domElement);

  // Even, shadowless top-down softbox-style illumination
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const hemi = new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.6);
  scene.add(hemi);

  const steelTexture = buildBrushedSteelTexture();
  const steelMaterial = new THREE.MeshStandardMaterial({
    map: steelTexture,
    metalness: 0.85,
    roughness: 0.35,
    color: 0xb5b6b8,
  });

  // Case body
  const caseGeo = new THREE.CylinderGeometry(CASE_RADIUS, CASE_RADIUS, CASE_HEIGHT, 128);
  const watchCase = new THREE.Mesh(caseGeo, steelMaterial);
  scene.add(watchCase);

  // Bezel ring
  const bezelGeo = new THREE.RingGeometry(DIAL_RADIUS, BEZEL_RADIUS, 128);
  const bezel = new THREE.Mesh(bezelGeo, steelMaterial);
  bezel.rotation.x = -Math.PI / 2;
  bezel.position.y = CASE_HEIGHT / 2 + 0.001;
  scene.add(bezel);

  // Crown
  const crownGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 32);
  const crown = new THREE.Mesh(crownGeo, steelMaterial);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(CASE_RADIUS + 0.05, 0, 0);
  scene.add(crown);

  // Chronograph pushers
  [-0.35, 0.35].forEach((z) => {
    const pusherGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.08, 24);
    const pusher = new THREE.Mesh(pusherGeo, steelMaterial);
    pusher.rotation.z = Math.PI / 2;
    pusher.position.set(CASE_RADIUS + 0.03, 0, z);
    scene.add(pusher);
  });

  // Dial
  const dialTexture = buildDialTexture();
  const dialGeo = new THREE.CircleGeometry(DIAL_RADIUS, 128);
  const dialMaterial = new THREE.MeshStandardMaterial({
    map: dialTexture,
    metalness: 0.05,
    roughness: 0.85,
  });
  const dial = new THREE.Mesh(dialGeo, dialMaterial);
  dial.rotation.x = -Math.PI / 2;
  dial.position.y = CASE_HEIGHT / 2 + 0.002;
  scene.add(dial);

  // Sapphire crystal (subtle, near-invisible, no distortion)
  const crystalGeo = new THREE.CircleGeometry(DIAL_RADIUS + 0.01, 128);
  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 0.05,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.9,
    color: 0xffffff,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMaterial);
  crystal.rotation.x = -Math.PI / 2;
  crystal.position.y = CASE_HEIGHT / 2 + 0.006;
  scene.add(crystal);

  // Hour + minute hands frozen at a classic 10:10 position
  const handGroup = new THREE.Group();
  handGroup.position.y = CASE_HEIGHT / 2 + 0.01;
  scene.add(handGroup);

  const hourHand = buildHand(DIAL_RADIUS * 0.5, 0.05, 0.01, 0xf0f0f0);
  hourHand.rotation.y = THREE.MathUtils.degToRad((10 / 12) * 360 + (10 / 60) * 30);
  handGroup.add(hourHand);

  const minuteHand = buildHand(DIAL_RADIUS * 0.72, 0.035, 0.01, 0xf0f0f0);
  minuteHand.rotation.y = THREE.MathUtils.degToRad((10 / 60) * 360);
  handGroup.add(minuteHand);

  // Red chronograph seconds hand — the single accent color, in steady motion
  const secondsHand = buildHand(DIAL_RADIUS * 0.88, 0.015, 0.012, 0xb3151f);
  handGroup.add(secondsHand);

  window.addEventListener('resize', () => {
    const a = window.innerWidth / window.innerHeight;
    camera.left = (-viewSize * a) / 2;
    camera.right = (viewSize * a) / 2;
    camera.top = viewSize / 2;
    camera.bottom = -viewSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // Camera stays completely locked; only the chronograph seconds hand moves.
    secondsHand.rotation.y = t * (Math.PI * 2) / 8; // one steady sweep every 8s
    renderer.render(scene, camera);
  }
  animate();
}

init();
