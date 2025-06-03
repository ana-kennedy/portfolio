import * as THREE from 'https://esm.sh/three@0.158.0';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed"; // was absolute
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
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
loader.load('assets/images/me.jpg', texture => {
  const width = 128, height = 128;
  const geometry = new THREE.PlaneGeometry(6, 6, width - 1, height - 1);


  const img = texture.image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;


  for (let i = 0; i < data.length; i += 4) {

    const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    const bw = lum > 128 ? 255 : 0;
    data[i] = data[i+1] = data[i+2] = bw;
  }
  ctx.putImageData(imgData, 0, 0);


  const bwTexture = new THREE.Texture(canvas);
  bwTexture.needsUpdate = true;

 
  const imgDataBW = ctx.getImageData(0, 0, width, height).data;
  const originalZ = new Float32Array(geometry.attributes.position.count);
  for (let i = 0, l = geometry.attributes.position.count; i < l; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const pixelIndex = (y * width + x) * 4;
    const brightness = imgDataBW[pixelIndex] / 255;
    const z = brightness * 0.7;
    geometry.attributes.position.setZ(i, z);
    originalZ[i] = z;
  }
  geometry.computeVertexNormals();


  const edgeGeometry = new THREE.BufferGeometry();
  const edgeVertices = [];
  for (let x = 0; x < width; x++) {
    edgeVertices.push(
      geometry.attributes.position.getX(x),
      geometry.attributes.position.getY(x),
      geometry.attributes.position.getZ(x)
    );
  }
  for (let y = 1; y < height; y++) {
    const idx = y * width + (width - 1);
    edgeVertices.push(
      geometry.attributes.position.getX(idx),
      geometry.attributes.position.getY(idx),
      geometry.attributes.position.getZ(idx)
    );
  }
  for (let x = width - 2; x >= 0; x--) {
    const idx = (height - 1) * width + x;
    edgeVertices.push(
      geometry.attributes.position.getX(idx),
      geometry.attributes.position.getY(idx),
      geometry.attributes.position.getZ(idx)
    );
  }
  for (let y = height - 2; y > 0; y--) {
    const idx = y * width;
    edgeVertices.push(
      geometry.attributes.position.getX(idx),
      geometry.attributes.position.getY(idx),
      geometry.attributes.position.getZ(idx)
    );
  }
  edgeVertices.push(
    geometry.attributes.position.getX(0),
    geometry.attributes.position.getY(0),
    geometry.attributes.position.getZ(0)
  );

  edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgeVertices, 3));
  const edgeMesh = new THREE.LineLoop(
    edgeGeometry,
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
  );
  scene.add(edgeMesh);


  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: false,
    map: bwTexture,
    displacementMap: bwTexture,
    displacementScale: 0.2,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMaterial);
  scene.add(wireframeMesh);

  let time = 0;
  let hue = 0;
  let targetHue = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    for (let i = 0, l = geometry.attributes.position.count; i < l; i++) {
      const wave = Math.sin(time * 2 + i * 0.1) * 0.15;
      const flicker = (Math.sin(time * 6 + i * 0.23) + 1) * 0.08 * Math.random();
      geometry.attributes.position.setZ(i, originalZ[i] + wave + flicker);

      wireframeMesh.geometry.attributes.position.setZ(
        i,
        originalZ[i] +
          wave * 1.2 +
          flicker * 1.5 +
          (Math.sin(time * 4 + i * 0.33) * 0.07 * Math.random())
      );
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    wireframeMesh.geometry.attributes.position.needsUpdate = true;
    wireframeMesh.geometry.computeVertexNormals();

    mesh.rotation.y += 0.008;
    edgeMesh.rotation.y += 0.008;
    wireframeMesh.rotation.y += 0.014;
    wireframeMesh.rotation.x = Math.sin(time * 0.5) * 0.1;


    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
    targetHue = scrollPercent * 360;


    hue += (targetHue - hue) * 0.005;

    const color = new THREE.Color(`hsl(${hue}, 100%, 60%)`);
    mesh.material.color.set(color);
    wireframeMesh.material.color.set(color);
    edgeMesh.material.color.set(color);

    renderer.render(scene, camera);
  }
  animate();
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
