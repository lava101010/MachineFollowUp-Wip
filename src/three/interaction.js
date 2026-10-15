/**
 * Energya Cables - 3D Interactivity, Raycasting & Camera Controls
 */

import { store } from '../state/store.js';
import { getMachineName } from '../constants/machines.js';
import { getStageName } from '../constants/stages.js';
import { populateMachineInspector, closeMachineInspector } from '../ui/inspector.js';
import { switchViewTab } from '../ui/tabSwitcher.js';

export function onMouseMove(event) {
  const container = document.getElementById('canvas-container');
  if (!container || !store.camera || !store.raycaster || !store.mouse || !store.scene) return;

  const rect = container.getBoundingClientRect();
  store.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  store.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  store.raycaster.setFromCamera(store.mouse, store.camera);
  const intersects = store.raycaster.intersectObjects(store.scene.children, true);

  let foundMachine = null;
  for (let hit of intersects) {
    let curr = hit.object;
    while (curr && curr.parent && curr.parent !== store.scene) {
      if (curr.userData && curr.userData.machineId) {
        foundMachine = curr.userData.machineId;
        break;
      }
      curr = curr.parent;
    }
    if (foundMachine) break;
  }

  const tooltip = document.getElementById('machine-tooltip');
  if (foundMachine) {
    container.style.cursor = 'pointer';
    const stats = store.machineStats[foundMachine] || { totalTons: 0, stageId: null };
    const ttName = document.getElementById('tt-name');
    const ttStage = document.getElementById('tt-stage');
    const ttTons = document.getElementById('tt-tons');

    if (ttName) ttName.innerText = getMachineName(foundMachine);
    if (ttStage) ttStage.innerText = stats.stageId ? getStageName(stats.stageId) : 'جاهزة للتشغيل';
    if (ttTons) ttTons.innerText = `الإنتاج: ${stats.totalTons.toFixed(2)} طن`;
    
    if (tooltip) {
      tooltip.style.left = `${event.clientX - rect.left}px`;
      tooltip.style.top = `${event.clientY - rect.top}px`;
      tooltip.classList.remove('hidden');
    }
  } else {
    container.style.cursor = 'default';
    if (tooltip) tooltip.classList.add('hidden');
  }
}

export function onMouseClick(event) {
  const container = document.getElementById('canvas-container');
  if (!container || !store.camera || !store.raycaster || !store.mouse || !store.scene) return;

  const rect = container.getBoundingClientRect();
  store.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  store.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  store.raycaster.setFromCamera(store.mouse, store.camera);
  const intersects = store.raycaster.intersectObjects(store.scene.children, true);

  for (let hit of intersects) {
    let curr = hit.object;
    while (curr && curr.parent && curr.parent !== store.scene) {
      if (curr.userData && curr.userData.machineId) {
        selectMachineIn3D(curr.userData.machineId);
        return;
      }
      curr = curr.parent;
    }
  }
}

export function selectMachineIn3D(machineId) {
  store.selectedMachineId = machineId;
  const group = store.machineMeshes[machineId];
  if (!group) return;

  // If 3D section is currently hidden, switch to split view so user sees the focused machine
  const sec3D = document.getElementById('section-3d');
  if (sec3D && sec3D.classList.contains('hidden')) {
    switchViewTab('split');
  }

  // Position highlight ring under machine
  if (store.highlightRing) {
    store.highlightRing.position.set(group.position.x, 0.12, group.position.z);
    store.highlightRing.visible = true;
  }

  // Smoothly animate camera to focus on machine
  const TWEEN = window.TWEEN;
  const THREE = window.THREE;
  if (TWEEN && THREE && store.camera && store.controls) {
    const targetPos = new THREE.Vector3(group.position.x, group.position.y + 2, group.position.z);
    const camPos = new THREE.Vector3(group.position.x + 18, group.position.y + 14, group.position.z + 24);

    new TWEEN.Tween(store.camera.position)
      .to({ x: camPos.x, y: camPos.y, z: camPos.z }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(store.controls.target)
      .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }

  // Open Machine Inspector Sidebar
  populateMachineInspector(machineId);
}

export function setCameraAngle(preset) {
  closeMachineInspector();
  let targetCam = { x: 0, y: 95, z: 150 };
  let targetCenter = { x: 0, y: 0, z: 0 };

  if (preset === 'overview') {
    targetCam = { x: 0, y: 95, z: 150 };
  } else if (preset === 'top') {
    targetCam = { x: 0, y: 190, z: 1 };
  } else if (preset === 'bay1') {
    targetCam = { x: -95, y: 40, z: 70 };
    targetCenter = { x: -95, y: 0, z: 0 };
  } else if (preset === 'bay3') {
    targetCam = { x: 30, y: 45, z: 65 };
    targetCenter = { x: 30, y: 0, z: 0 };
  } else if (preset === 'bay4') {
    targetCam = { x: 95, y: 40, z: 70 };
    targetCenter = { x: 95, y: 0, z: 0 };
  }

  const TWEEN = window.TWEEN;
  if (TWEEN && store.camera && store.controls) {
    new TWEEN.Tween(store.camera.position).to(targetCam, 1000).easing(TWEEN.Easing.Cubic.Out).start();
    new TWEEN.Tween(store.controls.target).to(targetCenter, 1000).easing(TWEEN.Easing.Cubic.Out).start();
  }
}

export function resetCameraView() {
  setCameraAngle('overview');
}

export function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container || !store.renderer || !store.camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width === 0 || height === 0) return;
  store.camera.aspect = width / height;
  store.camera.updateProjectionMatrix();
  store.renderer.setSize(width, height);
}
