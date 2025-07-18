// Advanced Three.js scene manager
let scene, camera, renderer, particles;
let sceneObjects = [];
let animationId;
let currentScene = 'hologram';

const sceneConfigurations = {
  hologram: {
    particleCount: 150,
    objects: [
      { type: 'torus', position: [2, 0, -2], size: [1, 0.3, 8, 16] },
      { type: 'cube', count: 3, size: 0.2 },
      { type: 'grid', position: [0, -3, 0], size: [10, 10, 20, 20] }
    ]
  },
  datacenter: {
    particleCount: 200,
    objects: [
      { type: 'server-rack', count: 8 },
      { type: 'data-flow', count: 12 },
      { type: 'floor-grid', position: [0, -3, 0], size: [20, 20, 40, 40] }
    ]
  },
  crystal: {
    particleCount: 180,
    objects: [
      { type: 'crystal-cluster', count: 6 },
      { type: 'crystal-shard', count: 12 },
      { type: 'energy-field', position: [0, 0, 0], size: 4 }
    ]
  },
  neural: {
    particleCount: 250,
    objects: [
      { type: 'neural-nodes', count: 20 },
      { type: 'neural-connections', count: 30 },
      { type: 'brain-hemisphere', position: [0, 0, 0], size: 2 }
    ]
  },
  quantum: {
    particleCount: 300,
    objects: [
      { type: 'quantum-spheres', count: 15 },
      { type: 'quantum-tunnels', count: 8 },
      { type: 'probability-cloud', position: [0, 0, 0], size: 3 }
    ]
  },
  galaxy: {
    particleCount: 400,
    objects: [
      { type: 'galaxy-spiral', position: [0, 0, 0], size: 5 },
      { type: 'stars', count: 50 },
      { type: 'nebula', count: 3 }
    ]
  }
};

function initThreeJS() {
  const container = document.getElementById('threejsContainer');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  createScene(currentScene);
  animate();
  window.addEventListener('resize', onWindowResize);
}

function createScene(name) {
  clearScene();
  const config = sceneConfigurations[name] || sceneConfigurations.hologram;
  createParticleSystem(config.particleCount);
  config.objects.forEach(obj => {
    switch (obj.type) {
      case 'torus':
        createTorus(obj.position, obj.size);
        break;
      case 'cube':
        createCubes(obj.count, obj.size);
        break;
      case 'grid':
        createGrid(obj.position, obj.size);
        break;
      case 'server-rack':
        createServerRacks(obj.count);
        break;
      case 'data-flow':
        createDataFlows(obj.count);
        break;
      case 'floor-grid':
        createFloorGrid(obj.position, obj.size);
        break;
      case 'crystal-cluster':
        createCrystalClusters(obj.count);
        break;
      case 'crystal-shard':
        createCrystalShards(obj.count);
        break;
      case 'energy-field':
        createEnergyField(obj.position, obj.size);
        break;
      case 'neural-nodes':
        createNeuralNodes(obj.count);
        break;
      case 'neural-connections':
        createNeuralConnections(obj.count);
        break;
      case 'brain-hemisphere':
        createBrainHemisphere(obj.position, obj.size);
        break;
      case 'quantum-spheres':
        createQuantumSpheres(obj.count);
        break;
      case 'quantum-tunnels':
        createQuantumTunnels(obj.count);
        break;
      case 'probability-cloud':
        createProbabilityCloud(obj.position, obj.size);
        break;
      case 'galaxy-spiral':
        createGalaxySpiral(obj.position, obj.size);
        break;
      case 'stars':
        createStars(obj.count);
        break;
      case 'nebula':
        createNebula(obj.count);
        break;
      default:
        break;
    }
  });
}

function clearScene() {
  if (particles) {
    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();
    particles = null;
  }
  sceneObjects.forEach(obj => {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
  sceneObjects = [];
}

function createParticleSystem(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
    colors[i] = Math.random() * 0.3;
    colors[i + 1] = 0.8 + Math.random() * 0.2;
    colors[i + 2] = 1.0;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8 });
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// Scene object creation helpers
function createTorus(position, size) {
  const geometry = new THREE.TorusGeometry(...size);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.3, wireframe: true });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.set(...position);
  torus.userData = { type: 'torus' };
  scene.add(torus);
  sceneObjects.push(torus);
}

function createCubes(count, size) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.4, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    cube.userData = { type: 'cube', rotationSpeed: Math.random() * 0.02 + 0.01 };
    scene.add(cube);
    sceneObjects.push(cube);
  }
}

function createGrid(position, size) {
  const geometry = new THREE.PlaneGeometry(...size);
  const material = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.1, wireframe: true });
  const grid = new THREE.Mesh(geometry, material);
  grid.position.set(...position);
  grid.rotation.x = -Math.PI / 2;
  grid.userData = { type: 'grid' };
  scene.add(grid);
  sceneObjects.push(grid);
}

function createServerRacks(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.BoxGeometry(0.5, 2, 0.3);
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.6, wireframe: true });
    const rack = new THREE.Mesh(geometry, material);
    rack.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
    rack.userData = { type: 'server-rack' };
    scene.add(rack);
    sceneObjects.push(rack);
  }
}

function createDataFlows(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
    const flow = new THREE.Mesh(geometry, material);
    flow.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8);
    flow.rotation.z = Math.random() * Math.PI;
    flow.userData = { type: 'data-flow', pulseSpeed: Math.random() * 0.05 + 0.02 };
    scene.add(flow);
    sceneObjects.push(flow);
  }
}

function createFloorGrid(position, size) {
  const geometry = new THREE.PlaneGeometry(...size);
  const material = new THREE.MeshBasicMaterial({ color: 0x0066cc, transparent: true, opacity: 0.15, wireframe: true });
  const grid = new THREE.Mesh(geometry, material);
  grid.position.set(...position);
  grid.rotation.x = -Math.PI / 2;
  scene.add(grid);
  sceneObjects.push(grid);
}

function createCrystalClusters(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.OctahedronGeometry(Math.random() * 0.5 + 0.3, 0);
    const material = new THREE.MeshBasicMaterial({ color: 0xaaaaff, transparent: true, opacity: 0.5, wireframe: true });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6);
    crystal.userData = { type: 'crystal', growthSpeed: Math.random() * 0.01 + 0.005 };
    scene.add(crystal);
    sceneObjects.push(crystal);
  }
}

function createCrystalShards(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.ConeGeometry(0.1, Math.random() * 0.8 + 0.4, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xccccff, transparent: true, opacity: 0.4, wireframe: true });
    const shard = new THREE.Mesh(geometry, material);
    shard.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 8);
    shard.rotation.x = Math.random() * Math.PI;
    shard.rotation.z = Math.random() * Math.PI;
    scene.add(shard);
    sceneObjects.push(shard);
  }
}

function createEnergyField(position, size) {
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x88ffff, transparent: true, opacity: 0.2, wireframe: true });
  const field = new THREE.Mesh(geometry, material);
  field.position.set(...position);
  field.userData = { type: 'energy-field' };
  scene.add(field);
  sceneObjects.push(field);
}

function createNeuralNodes(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
    const node = new THREE.Mesh(geometry, material);
    node.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8);
    node.userData = { type: 'neural-node', pulsePhase: Math.random() * Math.PI * 2 };
    scene.add(node);
    sceneObjects.push(node);
  }
}

function createNeuralConnections(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.01, Math.random() * 2 + 1, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6 });
    const connection = new THREE.Mesh(geometry, material);
    connection.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6);
    connection.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(connection);
    sceneObjects.push(connection);
  }
}

function createBrainHemisphere(position, size) {
  const geometry = new THREE.SphereGeometry(size, 16, 16, 0, Math.PI);
  const material = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.3, wireframe: true });
  const brain = new THREE.Mesh(geometry, material);
  brain.position.set(...position);
  brain.userData = { type: 'brain' };
  scene.add(brain);
  sceneObjects.push(brain);
}

function createQuantumSpheres(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x6600ff, transparent: true, opacity: 0.5, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 10);
    sphere.userData = { type: 'quantum-sphere', phaseSpeed: Math.random() * 0.03 + 0.01 };
    scene.add(sphere);
    sceneObjects.push(sphere);
  }
}

function createQuantumTunnels(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.TorusGeometry(Math.random() * 0.8 + 0.4, 0.1, 8, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xaa00ff, transparent: true, opacity: 0.4, wireframe: true });
    const tunnel = new THREE.Mesh(geometry, material);
    tunnel.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8);
    tunnel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    tunnel.userData = { type: 'quantum-tunnel', rotationSpeed: Math.random() * 0.02 + 0.01 };
    scene.add(tunnel);
    sceneObjects.push(tunnel);
  }
}

function createProbabilityCloud(position, size) {
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x9900ff, transparent: true, opacity: 0.15, wireframe: true });
  const cloud = new THREE.Mesh(geometry, material);
  cloud.position.set(...position);
  cloud.userData = { type: 'probability-cloud' };
  scene.add(cloud);
  sceneObjects.push(cloud);
}

function createGalaxySpiral(position, size) {
  const geometry = new THREE.TorusGeometry(size, size * 0.3, 16, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0x6666ff, transparent: true, opacity: 0.4, wireframe: true });
  const spiral = new THREE.Mesh(geometry, material);
  spiral.position.set(...position);
  spiral.rotation.x = Math.PI / 4;
  spiral.userData = { type: 'galaxy-spiral' };
  scene.add(spiral);
  sceneObjects.push(spiral);
}

function createStars(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.02, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random() * 0.8 + 0.2 });
    const star = new THREE.Mesh(geometry, material);
    star.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 20);
    star.userData = { type: 'star', twinkleSpeed: Math.random() * 0.05 + 0.02 };
    scene.add(star);
    sceneObjects.push(star);
  }
}

function createNebula(count) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5), transparent: true, opacity: 0.2 });
    const neb = new THREE.Mesh(geometry, material);
    neb.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 15);
    scene.add(neb);
    sceneObjects.push(neb);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (particles) {
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
  }
  sceneObjects.forEach(obj => {
    const t = Date.now();
    switch (obj.userData.type) {
      case 'torus':
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.02;
        obj.position.y = Math.sin(t * 0.001) * 0.5;
        break;
      case 'cube':
        obj.rotation.x += obj.userData.rotationSpeed;
        obj.rotation.y += obj.userData.rotationSpeed * 0.7;
        break;
      case 'data-flow':
        obj.material.opacity = 0.5 + Math.sin(t * obj.userData.pulseSpeed) * 0.3;
        break;
      case 'crystal':
        obj.scale.setScalar(1 + Math.sin(t * obj.userData.growthSpeed) * 0.2);
        break;
      case 'neural-node':
        obj.scale.setScalar(1 + Math.sin(t * 0.01 + obj.userData.pulsePhase) * 0.3);
        break;
      case 'quantum-sphere':
        obj.material.opacity = 0.3 + Math.sin(t * obj.userData.phaseSpeed) * 0.3;
        break;
      case 'quantum-tunnel':
        obj.rotation.x += obj.userData.rotationSpeed;
        obj.rotation.y += obj.userData.rotationSpeed * 0.5;
        break;
      case 'galaxy-spiral':
        obj.rotation.z += 0.005;
        break;
      case 'star':
        obj.material.opacity = 0.4 + Math.sin(t * obj.userData.twinkleSpeed) * 0.4;
        break;
      default:
        break;
    }
  });
  camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
  camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function triggerProcessingEffect() {
  sceneObjects.forEach(obj => {
    if (obj.userData.type === 'torus') {
      obj.rotation.x += 0.1;
      obj.rotation.y += 0.1;
    }
  });
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.1;
      positions[i + 1] += (Math.random() - 0.5) * 0.1;
      positions[i + 2] += (Math.random() - 0.5) * 0.1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
}

function cleanupThreeJS() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (scene) scene.clear();
}

function setScene(name) {
  currentScene = name;
  createScene(name);
}

export { initThreeJS, cleanupThreeJS, triggerProcessingEffect, setScene };
