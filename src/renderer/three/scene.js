// extracted from original renderer.js
// NOTE: manages Three.js scene
let scene, camera, renderer, particles, hologram;
let animationId;
let currentScene = "hologram";

function initThreeJS() {
  const container = document.getElementById("threejsContainer");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  createParticleSystem();
  createHolographicGrid();
  createFloatingGeometry();
  applyScene(currentScene);
  animate();
  window.addEventListener("resize", onWindowResize);
}

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
    colors[i] = 0.0;
    colors[i + 1] = 0.8;
    colors[i + 2] = 1.0;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createHolographicGrid() {
  const gridGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.1,
    wireframe: true,
  });
  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -3;
  scene.add(grid);
}

function createFloatingGeometry() {
  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 8, 16);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });
  hologram = new THREE.Mesh(torusGeometry, torusMaterial);
  hologram.position.set(2, 0, -2);
  scene.add(hologram);
  for (let i = 0; i < 3; i++) {
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );
    scene.add(cube);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (particles) {
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
  }
  if (hologram) {
    hologram.rotation.x += 0.01;
    hologram.rotation.y += 0.02;
    hologram.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }
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
  if (hologram) {
    hologram.rotation.x += 0.1;
    hologram.rotation.y += 0.1;
  }
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

function applyScene(name) {
  console.log("Applying scene:", name); // Debug log
  if (!hologram) {
    console.log("Hologram not ready yet"); // Debug log
    return;
  }

  // Store the current scene
  currentScene = name;

  switch (name) {
    case "datacenter":
      console.log("Setting datacenter scene"); // Debug log
      hologram.material.color.set(0x00ff00);
      // Update particles to green
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.0; // R
          colors[i + 1] = 1.0; // G
          colors[i + 2] = 0.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
    case "crystal":
      console.log("Setting crystal scene"); // Debug log
      // Dispose old geometry and create new one
      hologram.geometry.dispose();
      hologram.geometry = new THREE.OctahedronGeometry(1);
      hologram.material.color.set(0x00ccff);
      // Update particles to crystal blue
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.0; // R
          colors[i + 1] = 0.8; // G
          colors[i + 2] = 1.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
    case "neural":
      console.log("Setting neural scene"); // Debug log
      hologram.material.color.set(0xff6600);
      // Update particles to orange
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 1.0; // R
          colors[i + 1] = 0.4; // G
          colors[i + 2] = 0.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
    case "quantum":
      console.log("Setting quantum scene"); // Debug log
      hologram.material.color.set(0xaa00ff);
      // Update particles to purple
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.7; // R
          colors[i + 1] = 0.0; // G
          colors[i + 2] = 1.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
    case "galaxy":
      console.log("Setting galaxy scene"); // Debug log
      hologram.material.color.set(0x6666ff);
      // Update particles to light blue
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.4; // R
          colors[i + 1] = 0.4; // G
          colors[i + 2] = 1.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
    case "hologram":
    default:
      console.log("Setting hologram scene"); // Debug log
      // Reset to original torus geometry if it was changed
      if (hologram.geometry.type !== "TorusGeometry") {
        hologram.geometry.dispose();
        hologram.geometry = new THREE.TorusGeometry(1, 0.3, 8, 16);
      }
      hologram.material.color.set(0x00ff88);
      // Reset particles to original cyan
      if (particles) {
        const colors = particles.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.0; // R
          colors[i + 1] = 0.8; // G
          colors[i + 2] = 1.0; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }
      break;
  }
}

function setScene(name) {
  console.log("setScene called with:", name); // Debug log
  currentScene = name;
  applyScene(name);
}

export { initThreeJS, cleanupThreeJS, triggerProcessingEffect, setScene };
