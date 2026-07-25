/* =========================================================
   SHARED CLOG GEOMETRY

   The silhouette below is NOT hand-drawn — it was traced with
   OpenCV contour detection directly from a frame of the user's
   reference video (assets/dux-360/frame-01.jpg), including the
   hole under the heel strap. That gives a pixel-accurate outline
   instead of an approximation.

   The body is a single extrusion of that outline (solid indigo,
   used for the side walls and the back), with a second flat
   overlay on the front textured with the real photo — so viewed
   from the front it looks like the actual product, not a generic
   stand-in shape.

   Pixel -> world transform used when the silhouette was traced
   (kept here so the UVs can be reconstructed from vertex
   positions): world = (pixel - center) * scale, y flipped.
   ========================================================= */

const PHOTO_W = 760;
const PHOTO_H = 583;
const PX_CENTER = 370.5;
const PY_CENTER = 275.5;
const SCALE = 0.0066298342541436465;

export const BODY_COLOR = 0x38346f;
export const REFERENCE_PHOTO_URL = "assets/dux-360/frame-01.jpg";

// Traced outer silhouette (heel -> toe -> back), world units.
const OUTER_POINTS = [
  [1.7934, -0.1558], [1.7271, -0.0961], [1.5945, -0.0696], [1.1901, -0.0696],
  [1.1105, -0.0365], [1.1105, -0.0033], [1.442, 0.3878], [1.5083, 0.5337],
  [1.442, 0.8055], [1.3425, 0.9116], [1.2497, 0.905], [1.011, 0.6729],
  [0.5337, 0.3746], [0.1227, 0.6663], [-0.0166, 0.726], [-0.0895, 0.726],
  [-0.368, 0.421], [-0.7923, 0.1028], [-1.137, -0.0365], [-1.5945, -0.1227],
  [-1.7072, -0.1691], [-1.7867, -0.2818], [-1.8, -0.5138], [-1.7801, -0.6199],
  [-1.6939, -0.726], [-1.7801, -0.7591], [-1.7934, -0.7989], [-1.621, -0.8652],
  [-1.3757, -0.8983], [-0.6994, -0.9116], [1.5878, -0.6862], [1.8, -0.6265],
  [1.7337, -0.5669], [1.7867, -0.3945],
];

// Traced hole under the strap (where the background shows through).
const INNER_POINTS = [
  [1.2497, 0.5204], [1.2497, 0.4939], [0.905, 0.1359], [0.8453, 0.1293],
  [0.7459, 0.2022], [0.7525, 0.2354], [0.9381, 0.3613], [1.2166, 0.5271],
];

function buildSilhouette(THREE) {
  const shape = new THREE.Shape();
  OUTER_POINTS.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();

  const hole = new THREE.Path();
  INNER_POINTS.forEach(([x, y], i) => (i === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y)));
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

// Recovers the original photo pixel for a world-space (x, y) so the
// texture lines up exactly with the silhouette it was traced from.
function worldToUV(x, y) {
  const px = x / SCALE + PX_CENTER;
  const py = PY_CENTER - y / SCALE;
  return [px / PHOTO_W, 1 - py / PHOTO_H];
}

function applyPhotoUVs(THREE, geometry) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const [u, v] = worldToUV(pos.getX(i), pos.getY(i));
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

/**
 * Builds the clog model. `textureUrl` lets callers swap in a data
 * URI (e.g. for a self-contained artifact bundle) instead of the
 * relative asset path used on the live site.
 */
export function createClogModel(THREE, { textureUrl = REFERENCE_PHOTO_URL } = {}) {
  const clog = new THREE.Group();
  const depth = 0.9;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.55,
    metalness: 0.03,
    emissive: 0x8fb8c9,
    emissiveIntensity: 0.1,
  });
  const bodyGeo = new THREE.ExtrudeGeometry(buildSilhouette(THREE), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 1,
  });
  bodyGeo.translate(0, 0, -depth / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  clog.add(bodyMesh);

  const texture = new THREE.TextureLoader().load(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const photoMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0.02 });
  const capGeo = new THREE.ShapeGeometry(buildSilhouette(THREE), 24);
  applyPhotoUVs(THREE, capGeo);
  const capMesh = new THREE.Mesh(capGeo, photoMat);
  capMesh.position.z = depth / 2 + 0.06;
  clog.add(capMesh);

  return { clog, soleMat: bodyMat };
}
