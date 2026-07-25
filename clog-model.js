/* =========================================================
   SHARED CLOG GEOMETRY — a clog modeled to match the real Chung
   Shi Dux from the reference photos: closed, perforated vamp
   over an open heel, an arching strap with a metal rivet, and a
   single-tone indigo body. Built from 2D profiles extruded into
   3D, so no external model file is needed. Used by both the
   scroll-driven hero (script.js) and the free-orbit viewer
   (viewer.js).
   ========================================================= */

// Indigo sampled from the reference photos.
export const BODY_COLOR = 0x38346f;

function buildVampProfile(THREE) {
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

function buildSoleProfile(THREE) {
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

function buildOutsoleProfile(THREE) {
  const shape = new THREE.Shape();
  shape.moveTo(-1.85, -0.86);
  shape.lineTo(1.55, -0.86);
  shape.quadraticCurveTo(2.0, -0.82, 2.0, -0.6);
  shape.lineTo(-1.95, -0.6);
  shape.quadraticCurveTo(-2.15, -0.68, -1.85, -0.86);
  return shape;
}

/**
 * Builds the clog model. Returns the group plus references to
 * materials that consumers may want to drive (e.g. the scroll-
 * reactive sole glow on the main site).
 */
export function createClogModel(THREE) {
  const clog = new THREE.Group();

  const vampMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.55, metalness: 0.04 });
  const vampGeo = new THREE.ExtrudeGeometry(buildVampProfile(THREE), { depth: 0.95, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.045, bevelSegments: 3 });
  vampGeo.translate(0, 0, -0.475);
  const vampMesh = new THREE.Mesh(vampGeo, vampMat);
  clog.add(vampMesh);

  const soleMat = new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.5,
    metalness: 0.03,
    emissive: 0x8fb8c9,
    emissiveIntensity: 0.1,
  });
  const soleGeo = new THREE.ExtrudeGeometry(buildSoleProfile(THREE), { depth: 1.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2 });
  soleGeo.translate(0, 0, -0.525);
  const soleMesh = new THREE.Mesh(soleGeo, soleMat);
  clog.add(soleMesh);

  const outsoleMat = new THREE.MeshStandardMaterial({ color: 0x201c47, roughness: 0.9, metalness: 0 });
  const outsoleGeo = new THREE.ExtrudeGeometry(buildOutsoleProfile(THREE), { depth: 1.1, bevelEnabled: false });
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

  return { clog, soleMat, vampMat, outsoleMat, strapMat, rivetMat, holeMat };
}
