import * as THREE from 'https://esm.sh/three@0.158.0';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearAlpha(0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const loader = new THREE.TextureLoader();
loader.load('assets/images/saturn.png', texture => {
  const width = 256, height = 256;
  const geometry = new THREE.PlaneGeometry(11, 11, width - 1, height - 1);

  const img = texture.image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const originalZ = new Float32Array(geometry.attributes.position.count);
  for (let i = 0, l = geometry.attributes.position.count; i < l; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const pixelIndex = (y * width + x) * 4;
    const brightness = imgData[pixelIndex] / 255;
    const z = brightness * 0.5;
    geometry.attributes.position.setZ(i, z);
    originalZ[i] = z;
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: false,
    map: texture,
    displacementMap: texture,
    displacementScale: 0.20,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    for (let i = 0, l = geometry.attributes.position.count; i < l; i++) {
      const wave = Math.sin(time * 2 + i * 0.1) * 0.25;
      const flicker = (Math.sin(time * 6 + i * 0.23) + 1) * 0.15 * Math.random();
      geometry.attributes.position.setZ(i, originalZ[i] + wave + flicker);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    mesh.rotation.y += 0.001;
    renderer.render(scene, camera);
  }
  animate();
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
