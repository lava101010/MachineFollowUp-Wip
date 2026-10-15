/**
 * Energya Cables - Machine Inspector Drawer UI
 */

import { store } from '../state/store.js';
import { getMachineName } from '../constants/machines.js';
import { getStageName } from '../constants/stages.js';
import { getSupervisorName } from '../constants/supervisors.js';
import { cleanReelOrCard } from '../utils/normalizer.js';

export function populateMachineInspector(machineId) {
  const stats = store.machineStats[machineId] || {
    totalTons: 0,
    totalMeters: 0,
    ordersCount: 0,
    reelsCount: 0,
    copperTons: 0,
    aluminumTons: 0,
    shifts: new Set(),
    supervisors: new Set(),
    stageId: null
  };

  const nameEl = document.getElementById('inspect-machine-name');
  if (nameEl) nameEl.innerText = getMachineName(machineId);

  const idEl = document.getElementById('inspect-machine-id');
  if (idEl) idEl.innerText = `ID: ${machineId}`;

  const stageEl = document.getElementById('inspect-machine-stage');
  if (stageEl) stageEl.innerText = stats.stageId ? getStageName(stats.stageId) : 'مرحلة غير محددة';
  
  const badge = document.getElementById('inspect-machine-status-badge');
  if (badge) {
    if (stats.totalTons > 0) {
      badge.className = "mb-3 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-between border border-emerald-200";
      badge.innerHTML = `<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span><span>الحالة: نشطة وجاري الإنتاج</span></span><span class="text-[10px] text-slate-500 font-mono">ID: ${machineId}</span>`;
    } else {
      badge.className = "mb-3 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-between border border-slate-200";
      badge.innerHTML = `<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-400"></span><span>الحالة: في وضع الاستعداد</span></span><span class="text-[10px] text-slate-500 font-mono">ID: ${machineId}</span>`;
    }
  }

  const tonsEl = document.getElementById('inspect-tons');
  if (tonsEl) tonsEl.innerText = stats.totalTons.toFixed(2);

  const metersEl = document.getElementById('inspect-meters');
  if (metersEl) metersEl.innerText = Math.round(stats.totalMeters).toLocaleString();

  const ordersEl = document.getElementById('inspect-orders');
  if (ordersEl) ordersEl.innerText = stats.ordersCount;

  const reelsEl = document.getElementById('inspect-reels');
  if (reelsEl) reelsEl.innerText = stats.reelsCount;

  const totalMat = stats.copperTons + stats.aluminumTons;
  const cuPercent = totalMat > 0 ? Math.round((stats.copperTons / totalMat) * 100) : 50;
  const alPercent = 100 - cuPercent;

  const matRatioEl = document.getElementById('inspect-mat-ratio');
  if (matRatioEl) matRatioEl.innerText = `نحاس ${cuPercent}% | ألومنيوم ${alPercent}%`;

  const cuBar = document.getElementById('inspect-copper-bar');
  if (cuBar) cuBar.style.width = `${cuPercent}%`;

  const alBar = document.getElementById('inspect-alum-bar');
  if (alBar) alBar.style.width = `${alPercent}%`;

  const supNames = Array.from(stats.supervisors || []).map(sid => getSupervisorName(sid).split(' ')[0]).join(', ');
  const supEl = document.getElementById('inspect-supervisors');
  if (supEl) supEl.innerText = supNames || 'لا يوجد';

  const shiftsEl = document.getElementById('inspect-shifts');
  if (shiftsEl) shiftsEl.innerText = Array.from(stats.shifts || []).join(', ') || 'لا يوجد';

  // Last Operation Cards & Reels
  const lastRec = (stats.records && stats.records.length > 0) ? stats.records[stats.records.length - 1] : null;
  const rxCard = document.getElementById('inspect-receive-card');
  const poReel = document.getElementById('inspect-payoff-reel');
  const sndCard = document.getElementById('inspect-send-card');
  const tuReel = document.getElementById('inspect-takeup-reel');

  if (lastRec) {
    if (rxCard) rxCard.innerText = cleanReelOrCard(lastRec.ReceiveCardNo);
    if (poReel) poReel.innerText = cleanReelOrCard(lastRec.PayOffNo);
    if (sndCard) sndCard.innerText = cleanReelOrCard(lastRec.SendCardNo);
    if (tuReel) tuReel.innerText = cleanReelOrCard(lastRec.TakeUpNo);
  } else {
    if (rxCard) rxCard.innerText = 'without';
    if (poReel) poReel.innerText = 'without';
    if (sndCard) sndCard.innerText = 'without';
    if (tuReel) tuReel.innerText = 'without';
  }

  const inspector = document.getElementById('machine-inspector');
  if (inspector) inspector.classList.remove('hidden');
}

export function closeMachineInspector() {
  const inspector = document.getElementById('machine-inspector');
  if (inspector) inspector.classList.add('hidden');
  if (store.highlightRing) store.highlightRing.visible = false;
  store.selectedMachineId = null;
}
