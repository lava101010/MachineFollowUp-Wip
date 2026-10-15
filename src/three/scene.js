/**
 * Energya Cables - 3D Scene Initialization & Viewport Setup
 */

import { store } from '../state/store.js';
import { buildFactoryEnvironment } from './environment.js';
import { layoutAllMachines } from './layout.js';
import { animate3D } from './animator.js';
import { onMouseMove, onMouseClick, onWindowResize } from './interaction.js';

export function init3DScene() {
  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js library is not loaded.');
    return;
  }

  const container = document.getElementById('canvas-container');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // 1. Scene
  store.scene = new THREE.Scene();
  store.scene.background = new THREE.Color(0xF0F4F8);
  store.scene.fog = new THREE.FogExp2(0xF0F4F8, 0.0035);

  // 2. Camera
  store.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
  store.camera.position.set(0, 95, 150);

  // 3. Renderer
  store.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  store.renderer.setSize(width, height);
  store.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  store.renderer.shadowMap.enabled = true;
  store.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(store.renderer.domElement);

  // 4. OrbitControls
  if (THREE.OrbitControls) {
    store.controls = new THREE.OrbitControls(store.camera, store.renderer.domElement);
    store.controls.enableDamping = true;
    store.controls.dampingFactor = 0.05;
    store.controls.maxPolarAngle = Math.PI / 2.05; // don't go below floor
    store.controls.minDistance = 10;
    store.controls.maxDistance = 280;
    store.controls.target.set(0, 0, 0);
  }

  // 5. Lighting (Studio Bright Factory Lighting)
  const ambientLight = new THREE.AmbientLight(0xE8F0FE, 0.85);
  store.scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
  dirLight.position.set(60, 120, 80);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 300;
  dirLight.shadow.camera.left = -150;
  dirLight.shadow.camera.right = 150;
  dirLight.shadow.camera.top = 150;
  dirLight.shadow.camera.bottom = -150;
  store.scene.add(dirLight);

  const blueSpot = new THREE.SpotLight(0x0077CC, 0.4, 200, Math.PI / 4, 0.5);
  blueSpot.position.set(-60, 80, 0);
  store.scene.add(blueSpot);

  // 6. Build Factory Environment
  buildFactoryEnvironment();

  // 7. Place All 83 Machines
  layoutAllMachines();

  // 8. Raycaster & Interactivity
  store.raycaster = new THREE.Raycaster();
  store.mouse = new THREE.Vector2();

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('click', onMouseClick);
  window.addEventListener('resize', onWindowResize);

  // 9. Start Animation Loop
  animate3D();
}
