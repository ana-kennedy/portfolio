import * as THREE from 'https://esm.sh/three@0.158.0';
import { GLTFLoader } from 'https://esm.sh/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

const heroDiv = document.getElementById('hero-3d');
if (!heroDiv) {
  console.error("hero-3d container not found!");
  throw new Error("Missing #hero-3d div in your HTML.");
}
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha:true for transparency
renderer.setClearAlpha(0); 
renderer.setSize(w, h);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.pointerEvents = "none";
heroDiv.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
window.camera = camera;
camera.position.set(20, 10, 15);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


// Load
const loader = new GLTFLoader();
loader.load(
  "assets/glb/anaface2.glb",
  (gltf) => {
    scene.add(gltf.scene);

    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    gltf.scene.position.sub(center); 

    const pivot = new THREE.Group();
    pivot.add(gltf.scene);
    scene.add(pivot);
    window.pivot = pivot;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const white = new THREE.Color(0xffffff);
        const pink = new THREE.Color(0xffc0cb);
        const factor = (child.position.y + 10) / 20;
        const blended = white.clone().lerp(pink, THREE.MathUtils.clamp(factor, 0, 1));
        child.material = new THREE.MeshBasicMaterial({ color: blended });
      }
    });
  },
  (xhr) => {
    console.log(`Model loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
  },
  (error) => {
    console.error("Error loading GLB:", error);
  }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

function animate(t = 0) 
{
    requestAnimationFrame(animate);
    if (window.pivot) {
      window.pivot.rotation.z += 0.005;
      window.pivot.rotation.y += 0.001;
      window.pivot.rotation.x += 0.002;
    }
    renderer.render(scene, camera);
}

animate();
