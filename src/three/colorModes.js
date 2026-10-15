/**
 * Energya Cables - 3D Factory Color Modes & Heatmap Logic
 */

import { store } from '../state/store.js';

export function set3DColorMode(mode) {
  store.current3DMode = mode;
  
  // Update buttons style
  ['status', 'heatmap', 'material', 'stage'].forEach(m => {
    const btn = document.getElementById(`btn-mode-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = "px-2.5 py-1 rounded-lg bg-energya-royal text-white text-[11px] font-bold transition shadow-sm";
      } else {
        btn.className = "px-2.5 py-1 rounded-lg hover:bg-slate-100 text-[11px] text-slate-700 font-bold transition";
      }
    }
  });

  update3DLegend();
  update3DMachines();
}

export function update3DLegend() {
  const legend = document.getElementById('legend-content');
  if (!legend) return;

  if (store.current3DMode === 'status') {
    legend.innerHTML = `
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span><span>ماكينة نشطة (تعمل)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-energya-blue inline-block"></span><span>ماكينة إنتاج قياسي (Top)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-slate-300 inline-block"></span><span>ماكينة متوقفة / خاملة</span></div>
    `;
  } else if (store.current3DMode === 'heatmap') {
    legend.innerHTML = `
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-rose-600 inline-block"></span><span>إنتاج عالي جداً (> 7 طن)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span><span>إنتاج متوسط (3 - 7 طن)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-sky-500 inline-block"></span><span>إنتاج خفيف (< 3 طن)</span></div>
    `;
  } else if (store.current3DMode === 'material') {
    legend.innerHTML = `
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-600 inline-block"></span><span>خط إنتاج نحاس (Copper)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-slate-400 inline-block"></span><span>خط إنتاج ألومنيوم (Aluminum)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-slate-200 inline-block"></span><span>بدون تشغيل خامات</span></div>
    `;
  } else if (store.current3DMode === 'stage') {
    legend.innerHTML = `
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-600 inline-block"></span><span>سحب وتجديل (DR/STD)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span><span>عزل و CCV (INS/CCV)</span></div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-600 inline-block"></span><span>تسليح وشيلد (ARM/SCT)</span></div>
    `;
  }
}

export function update3DMachines() {
  const machineStats = store.machineStats;
  const machineMeshes = store.machineMeshes;

  // Find maximum machine tonnage for normalization
  let maxTons = 1;
  for (const mId in machineStats) {
    if (machineStats[mId].totalTons > maxTons) maxTons = machineStats[mId].totalTons;
  }

  for (const mId in machineMeshes) {
    const group = machineMeshes[mId];
    if (!group) continue;

    const stats = machineStats[mId] || { totalTons: 0, copperTons: 0, aluminumTons: 0 };
    const lamp = group.userData.beaconLamp;
    const mainMesh = group.userData.mainMesh;

    const hasOutput = stats.totalTons > 0;
    const isTop = stats.totalTons >= maxTons * 0.75 && maxTons > 0;

    // 1. Update Beacon Lamp Color
    if (lamp && lamp.material) {
      if (hasOutput) {
        if (isTop) {
          lamp.material.color.setHex(0x00A3E0);
          lamp.material.emissive.setHex(0x00A3E0);
          lamp.material.emissiveIntensity = 0.9;
        } else {
          lamp.material.color.setHex(0x10B981);
          lamp.material.emissive.setHex(0x10B981);
          lamp.material.emissiveIntensity = 0.75;
        }
      } else {
        lamp.material.color.setHex(0x94A3B8);
        lamp.material.emissive.setHex(0x475569);
        lamp.material.emissiveIntensity = 0.15;
      }
    }

    // 2. Update Main Mesh Color based on View Mode
    if (mainMesh && mainMesh.material) {
      if (store.current3DMode === 'status') {
        mainMesh.material.color.setHex(hasOutput ? (isTop ? 0x0077CC : 0x00529B) : 0x64748B);
      } else if (store.current3DMode === 'heatmap') {
        if (!hasOutput) {
          mainMesh.material.color.setHex(0x94A3B8);
        } else {
          const ratio = stats.totalTons / maxTons;
          if (ratio > 0.65) mainMesh.material.color.setHex(0xE11D48); // Hot Red
          else if (ratio > 0.3) mainMesh.material.color.setHex(0xF59E0B); // Amber
          else mainMesh.material.color.setHex(0x0284C7); // Sky Blue
        }
      } else if (store.current3DMode === 'material') {
        if (!hasOutput) {
          mainMesh.material.color.setHex(0x94A3B8);
        } else if (stats.copperTons > stats.aluminumTons) {
          mainMesh.material.color.setHex(0xD97706); // Copper Gold
        } else {
          mainMesh.material.color.setHex(0x64748B); // Aluminum Silver
        }
      } else if (store.current3DMode === 'stage') {
        const sid = stats.stageId || 1;
        if (sid <= 2 || sid === 4) mainMesh.material.color.setHex(0x0284C7);
        else if (sid === 5 || sid === 6) mainMesh.material.color.setHex(0x4F46E5);
        else if (sid >= 14 && sid <= 16) mainMesh.material.color.setHex(0xD97706);
        else mainMesh.material.color.setHex(0x059669);
      }
    }
  }
}
