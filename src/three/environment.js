/**
 * Energya Cables - 3D Factory Environment & Architectural Infrastructure
 */

import { store } from '../state/store.js';

export function buildFactoryEnvironment() {
  const THREE = window.THREE;
  const scene = store.scene;

  // Factory Floor (High gloss epoxy light gray)
  const floorGeo = new THREE.PlaneGeometry(300, 220);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xF1F5F9,
    roughness: 0.35,
    metalness: 0.15
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid helper
  const grid = new THREE.GridHelper(300, 60, 0x00529B, 0xCBD5E1);
  grid.position.y = 0.05;
  scene.add(grid);

  // Yellow Pedestrian Safety Lanes
  createSafetyWalkways(scene, THREE);

  // Bay Floor Zones & Signage
  createBayDemarcations(scene, THREE);

  // Factory Wall with Energya Branding
  createFactoryBackdrop(scene, THREE);

  // Selection Highlight Ring
  const ringGeo = new THREE.RingGeometry(3.5, 4.2, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00A3E0, side: THREE.DoubleSide });
  store.highlightRing = new THREE.Mesh(ringGeo, ringMat);
  store.highlightRing.rotation.x = -Math.PI / 2;
  store.highlightRing.position.set(0, 0.1, 0);
  store.highlightRing.visible = false;
  scene.add(store.highlightRing);
}

function createSafetyWalkways(scene, THREE) {
  // Main central walkway
  const walkwayGeo = new THREE.PlaneGeometry(12, 220);
  const walkwayMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.6 });
  const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
  walkway.rotation.x = -Math.PI / 2;
  walkway.position.set(0, 0.08, 0);
  scene.add(walkway);

  // Yellow stripes along edges
  for (let x of [-6, 6]) {
    const stripeGeo = new THREE.PlaneGeometry(0.8, 220);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.09, 0);
    scene.add(stripe);
  }
}

function createBayDemarcations(scene, THREE) {
  const bays = [
    { name: "صالة 1: السحب وتجميع الحزم (Drawing & Bunching)", x: -105, z: 0 },
    { name: "صالة 2: التجديل وتجميع القلوب (Stranding & Cabling)", x: -50, z: 0 },
    { name: "صالة 3: أبراج CCV وخطوط العزل (Insulation & CCV)", x: 25, z: 0 },
    { name: "صالة 4: التدريع والتسليح (Screening & Armouring)", x: 80, z: 0 },
    { name: "صالة 5: التعبئة وإعادة اللف (Coiling & Rewind)", x: 125, z: 0 }
  ];

  bays.forEach((bay) => {
    // Floor zone boundary lines
    const lineGeo = new THREE.PlaneGeometry(0.4, 180);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0077CC, transparent: true, opacity: 0.3 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(bay.x + 24, 0.06, 0);
    scene.add(line);
  });
}

function createFactoryBackdrop(scene, THREE) {
  // Rear wall with windows and Energya logo plate
  const wallGeo = new THREE.BoxGeometry(300, 30, 2);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x242D38, roughness: 0.7 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 15, -110);
  scene.add(wall);

  // Steel roof trusses
  for (let x = -140; x <= 140; x += 35) {
    const trussGeo = new THREE.BoxGeometry(1.5, 3, 220);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x00529B, metalness: 0.8, roughness: 0.3 });
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.position.set(x, 30, 0);
    scene.add(truss);
  }
}
