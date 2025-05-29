import * as THREE from 'https://esm.sh/three@0.158.0';

const heroDiv = document.getElementById('hero-3d');
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
heroDiv.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const videoFiles = [
  'assets/video/4getvideo1.mp4',
  'assets/video/4getvideo2.mp4',
  'assets/video/4getvideo3.mp4',
  'assets/video/4getvideo4.mp4',
  'assets/video/4getvideo5.mp4',
  'assets/video/4getvideo6.mp4'
];

const videoElements = videoFiles.map(src => {
  const video = document.createElement('video');
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = false;
  video.crossOrigin = "anonymous";
  video.style.display = "none";
  document.body.appendChild(video);
  video.load();
  return video;
});


function playAllVideos() {
  videoElements.forEach(video => {
    if (video.paused) {
      video.play().catch(() => {});
    }
  });
}


['click', 'touchstart', 'mousemove', 'keydown', 'mouseenter'].forEach(eventType => {
  window.addEventListener(eventType, playAllVideos, { once: true, passive: true });
});

const videoTextures = videoElements.map(video => new THREE.VideoTexture(video));
let cubeMaterials = videoTextures.map(tex =>
  new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 1
  })
);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(geometry, cubeMaterials);
scene.add(cube);

window.addEventListener('setCubeOpacity', e => {
  const opacity = e.detail.opacity;
  cubeMaterials.forEach(mat => { mat.opacity = opacity; });
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;
  renderer.render(scene, camera);
}

animate();
