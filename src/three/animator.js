/**
 * Energya Cables - 3D Render Loop & Animation Controller
 * Optimized to pause when 3D view is hidden, saving GPU & CPU resources.
 */

import { store } from '../state/store.js';

export function animate3D(time) {
  if (!store.is3DLoopRunning) return;
  store.animFrameId = requestAnimationFrame(animate3D);
  if (window.TWEEN) window.TWEEN.update();

  // Rotate spools and strander cages
  if (store.animationsEnabled && store.animatedSpools) {
    store.animatedSpools.forEach(spool => {
      spool.rotation.y += 0.04;
    });
  }

  if (store.controls) store.controls.update();
  if (store.renderer && store.scene && store.camera) {
    store.renderer.render(store.scene, store.camera);
  }
}

export function pause3DAnimation() {
  store.is3DLoopRunning = false;
  if (store.animFrameId) {
    cancelAnimationFrame(store.animFrameId);
    store.animFrameId = null;
  }
}

export function resume3DAnimation() {
  if (!store.is3DLoopRunning) {
    store.is3DLoopRunning = true;
    animate3D();
  }
}

export function toggleAnimations() {
  store.animationsEnabled = !store.animationsEnabled;
  const btn = document.getElementById('btn-toggle-anim');
  if (!btn) return;
  if (store.animationsEnabled) {
    btn.innerHTML = '<i class="fa-solid fa-pause"></i> إيقاف الحركة';
    btn.className = "px-2 py-1 bg-energya-royal text-white rounded text-[11px] font-bold flex items-center gap-1";
  } else {
    btn.innerHTML = '<i class="fa-solid fa-play"></i> تشغيل الحركة';
    btn.className = "px-2 py-1 bg-slate-100 text-energya-royal rounded text-[11px] font-bold flex items-center gap-1";
  }
}
