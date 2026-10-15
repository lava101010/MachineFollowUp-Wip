/**
 * Energya Cables - View Tabs & Sub-Tabs Switcher
 * Includes smart GPU/CPU power management by pausing the 3D loop when hidden.
 */

import { store } from '../state/store.js';
import { pause3DAnimation, resume3DAnimation } from '../three/animator.js';
import { onWindowResize } from '../three/interaction.js';
import { updateWIPTable } from './wipTable.js';

export function switchViewTab(tab) {
  const sec3D = document.getElementById('section-3d');
  const secAnalytics = document.getElementById('section-analytics');
  const secData = document.getElementById('section-data-table');
  const kpis = document.getElementById('kpi-cards-container');

  // Update tab buttons
  ['split', 'twin3d', 'analytics', 'data', 'wip'].forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = "tab-btn active px-3.5 py-1.5 rounded-md flex items-center gap-2";
      } else {
        btn.className = (t === 'wip')
          ? "tab-btn bg-emerald-500/25 text-white hover:bg-emerald-500/40 px-3.5 py-1.5 rounded-md flex items-center gap-2 border border-emerald-400/30"
          : "tab-btn bg-white/15 text-white hover:bg-white/25 px-3.5 py-1.5 rounded-md flex items-center gap-2";
      }
    }
  });

  if (tab === 'split') {
    if (kpis) kpis.classList.remove('hidden');
    if (sec3D) sec3D.classList.remove('hidden');
    if (secAnalytics) {
      secAnalytics.classList.remove('hidden');
      secAnalytics.className = "w-full lg:w-[48%] flex flex-col gap-3.5 overflow-y-auto max-h-[820px] pr-1";
    }
    if (secData) secData.classList.add('hidden');
  } else if (tab === 'twin3d') {
    if (kpis) kpis.classList.remove('hidden');
    if (sec3D) sec3D.classList.remove('hidden');
    if (secAnalytics) secAnalytics.classList.add('hidden');
    if (secData) secData.classList.add('hidden');
  } else if (tab === 'analytics') {
    if (kpis) kpis.classList.remove('hidden');
    if (sec3D) sec3D.classList.add('hidden');
    if (secAnalytics) {
      secAnalytics.classList.remove('hidden');
      secAnalytics.className = "w-full flex flex-col gap-3.5 pr-1";
    }
    if (secData) secData.classList.add('hidden');
  } else if (tab === 'data') {
    if (kpis) kpis.classList.remove('hidden');
    if (sec3D) sec3D.classList.add('hidden');
    if (secAnalytics) secAnalytics.classList.add('hidden');
    if (secData) secData.classList.remove('hidden');
    switchTableSubTab('production');
  } else if (tab === 'wip') {
    // PURE DATA ONLY - No KPIs, No 3D, No Charts
    if (kpis) kpis.classList.add('hidden');
    if (sec3D) sec3D.classList.add('hidden');
    if (secAnalytics) secAnalytics.classList.add('hidden');
    if (secData) secData.classList.remove('hidden');
    switchTableSubTab('wip');
  }

  // Smart 3D GPU/CPU Power Management: Pause loop when 3D is hidden, resume when visible
  const is3DVisible = (tab === 'split' || tab === 'twin3d');
  if (is3DVisible) {
    resume3DAnimation();
    setTimeout(onWindowResize, 100);
  } else {
    pause3DAnimation();
  }
}

export function switchTableSubTab(subTab) {
  store.currentTableSubTab = subTab;
  const btnProd = document.getElementById('subtab-btn-production');
  const btnWip = document.getElementById('subtab-btn-wip');
  const viewProd = document.getElementById('view-production-table');
  const viewWip = document.getElementById('view-wip-table');
  const toolsProd = document.getElementById('toolbar-production-actions');
  const toolsWip = document.getElementById('toolbar-wip-actions');

  if (subTab === 'production') {
    if (btnProd) btnProd.className = "px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-energya-royal text-white shadow-sm";
    if (btnWip) btnWip.className = "px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-white text-slate-700 hover:text-energya-royal hover:bg-slate-100 border border-slate-200";
    if (viewProd) viewProd.classList.remove('hidden');
    if (viewWip) viewWip.classList.add('hidden');
    if (toolsProd) toolsProd.classList.remove('hidden');
    if (toolsWip) toolsWip.classList.add('hidden');
  } else {
    if (btnWip) btnWip.className = "px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-energya-royal text-white shadow-sm";
    if (btnProd) btnProd.className = "px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-white text-slate-700 hover:text-energya-royal hover:bg-slate-100 border border-slate-200";
    if (viewProd) viewProd.classList.add('hidden');
    if (viewWip) viewWip.classList.remove('hidden');
    if (toolsProd) toolsProd.classList.add('hidden');
    if (toolsWip) toolsWip.classList.remove('hidden');
    updateWIPTable();
  }
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
