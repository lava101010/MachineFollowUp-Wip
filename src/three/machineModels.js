/**
 * Energya Cables - 3D Machine Procedural Models & Labels
 */

import { MACHINE_MAP } from '../constants/machines.js';
import { store } from '../state/store.js';

export function createMachine3D(machineId, type, x, z) {
  const THREE = window.THREE;
  const scene = store.scene;

  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData = { machineId: machineId, type: type, originalColor: 0x00529B };

  // Base Materials
  const matNavy = new THREE.MeshStandardMaterial({ color: 0x00529B, roughness: 0.35, metalness: 0.6 });
  const matChrome = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.2, metalness: 0.85 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6 });
  const matSpool = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.4, metalness: 0.7 });

  let mainMesh = null;

  if (type === 'ccv') {
    // High-Voltage CCV Tower Structure (Distinctive vertical tower)
    const towerGeo = new THREE.BoxGeometry(4.5, 14, 4.5);
    const tower = new THREE.Mesh(towerGeo, matNavy);
    tower.position.y = 7;
    tower.castShadow = true;
    group.add(tower);
    mainMesh = tower;

    // Top vulcanization head
    const headGeo = new THREE.CylinderGeometry(2, 2.5, 3, 16);
    const head = new THREE.Mesh(headGeo, matChrome);
    head.position.y = 15;
    group.add(head);

    // Slanted catenary cooling tube extending from tower
    const tubeGeo = new THREE.CylinderGeometry(0.5, 0.5, 18, 12);
    const tube = new THREE.Mesh(tubeGeo, matChrome);
    tube.rotation.z = Math.PI / 4;
    tube.position.set(6, 6, 0);
    group.add(tube);

    // Large Take-up Reel
    const reel = createCableReel(2.5, matSpool, THREE);
    reel.position.set(13, 2.5, 0);
    group.add(reel);
    store.animatedSpools.push(reel);

  } else if (type === 'extruder') {
    // Horizontal Extruder Line: Motor + Barrel + Cooling Trough + Puller + Takeup
    const baseGeo = new THREE.BoxGeometry(3, 2.5, 3.5);
    const extruderBase = new THREE.Mesh(baseGeo, matNavy);
    extruderBase.position.y = 1.25;
    extruderBase.castShadow = true;
    group.add(extruderBase);
    mainMesh = extruderBase;

    // Hopper cone
    const hopperGeo = new THREE.ConeGeometry(1, 1.8, 12);
    const hopper = new THREE.Mesh(hopperGeo, matChrome);
    hopper.position.set(0, 3.4, 0);
    group.add(hopper);

    // Water Cooling Trough
    const troughGeo = new THREE.BoxGeometry(1.2, 0.8, 8);
    const trough = new THREE.Mesh(troughGeo, matChrome);
    trough.position.set(0, 1.2, 5);
    group.add(trough);

    // Take-up Reel
    const reel = createCableReel(1.8, matSpool, THREE);
    reel.position.set(0, 1.8, 11);
    group.add(reel);
    store.animatedSpools.push(reel);

  } else if (type === 'strander' || type === 'buncher') {
    // Cylindrical Rotating Stranding Cage / Drum
    const baseGeo = new THREE.BoxGeometry(3, 0.8, 8);
    const base = new THREE.Mesh(baseGeo, matDark);
    base.position.y = 0.4;
    group.add(base);
    mainMesh = base;

    const cageGeo = new THREE.CylinderGeometry(1.5, 1.5, 7, 16);
    const cage = new THREE.Mesh(cageGeo, matNavy);
    cage.rotation.x = Math.PI / 2;
    cage.position.set(0, 2, 0);
    cage.castShadow = true;
    group.add(cage);
    store.animatedSpools.push(cage);

    // End Capstan Wheels
    const wheelGeo = new THREE.TorusGeometry(1.2, 0.25, 8, 24);
    const wheel = new THREE.Mesh(wheelGeo, matChrome);
    wheel.position.set(0, 2, 4.5);
    group.add(wheel);

  } else if (type === 'drawing') {
    // Wire Drawing Enclosure with Pay-off spool
    const boxGeo = new THREE.BoxGeometry(3.5, 2.6, 5);
    const box = new THREE.Mesh(boxGeo, matNavy);
    box.position.y = 1.3;
    box.castShadow = true;
    group.add(box);
    mainMesh = box;

    // Dual capstans
    for (let cz of [-1.2, 1.2]) {
      const capGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16);
      const cap = new THREE.Mesh(capGeo, matChrome);
      cap.position.set(0, 2.8, cz);
      group.add(cap);
      store.animatedSpools.push(cap);
    }

  } else {
    // Armouring, Coiling & General Lines
    const baseGeo = new THREE.BoxGeometry(3.2, 2.2, 4.5);
    const base = new THREE.Mesh(baseGeo, matNavy);
    base.position.y = 1.1;
    base.castShadow = true;
    group.add(base);
    mainMesh = base;

    const reel = createCableReel(1.6, matSpool, THREE);
    reel.position.set(0, 1.8, 3.5);
    group.add(reel);
    store.animatedSpools.push(reel);
  }

  // Status Beacon on top of every machine
  const beaconGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
  const pole = new THREE.Mesh(poleGeo, matChrome);
  pole.position.y = 0.75;
  beaconGroup.add(pole);

  const lampGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    emissive: 0x94A3B8,
    emissiveIntensity: 0.4
  });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.y = 1.6;
  beaconGroup.add(lamp);

  // Position beacon based on machine height
  const beaconY = type === 'ccv' ? 16.5 : (type === 'drawing' ? 3.0 : 2.7);
  beaconGroup.position.set(0, beaconY, 0);
  group.add(beaconGroup);

  // Machine Label Sprite (Canvas rendered text)
  const labelSprite = createMachineLabelSprite(MACHINE_MAP[machineId] || `${machineId}`, THREE);
  labelSprite.position.set(0, beaconY + 2.2, 0);
  group.add(labelSprite);

  // Store references for dynamic updates
  group.userData.mainMesh = mainMesh;
  group.userData.beaconLamp = lamp;
  group.userData.labelSprite = labelSprite;

  scene.add(group);
  store.machineMeshes[machineId] = group;
}

export function createCableReel(radius, material, THREE) {
  const reelGroup = new THREE.Group();
  // Flanges
  for (let z of [-0.6, 0.6]) {
    const flangeGeo = new THREE.CylinderGeometry(radius, radius, 0.15, 24);
    const flange = new THREE.Mesh(flangeGeo, material);
    flange.rotation.x = Math.PI / 2;
    flange.position.z = z;
    reelGroup.add(flange);
  }
  // Core drum with black cable
  const coreGeo = new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, 1.1, 24);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.9 });
  const core = new THREE.Mesh(coreGeo, cableMat);
  core.rotation.x = Math.PI / 2;
  reelGroup.add(core);

  return reelGroup;
}

export function createMachineLabelSprite(text, THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Rounded background tag
  ctx.fillStyle = 'rgba(0, 51, 102, 0.88)';
  ctx.strokeStyle = '#00A3E0';
  ctx.lineWidth = 3;
  roundRect(ctx, 4, 4, 152, 56, 12);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 80, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(6, 2.4, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
