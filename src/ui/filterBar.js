/**
 * Energya Cables - Filter Bar & Query Engine
 */

import { store } from '../state/store.js';
import { STAGE_MAP } from '../constants/stages.js';
import { MACHINE_MAP, getMachineName } from '../constants/machines.js';
import { getSupervisorName } from '../constants/supervisors.js';
import { normalizeCode } from '../utils/normalizer.js';
import { computeAggregates, updateKPICards } from '../engine/aggregator.js';
import { updateCharts } from '../charts/chartManager.js';
import { updateTable } from './productionTable.js';
import { update3DMachines } from '../three/colorModes.js';
import { closeMachineInspector } from './inspector.js';
import { showToast } from './toast.js';

export function initDropdowns() {
  // Stage dropdown
  const stageSelect = document.getElementById('filter-stage');
  if (stageSelect) {
    const seen = new Set();
    const uniqueStages = [];
    for (const [id, stage] of Object.entries(STAGE_MAP)) {
      if (!seen.has(stage.code)) {
        seen.add(stage.code);
        uniqueStages.push({ id, stage });
      }
    }
    stageSelect.innerHTML = `<option value="ALL">جميع مراحل الإنتاج (${uniqueStages.length})</option>`;
    uniqueStages.forEach(({ id, stage }) => {
      stageSelect.innerHTML += `<option value="${id}">${stage.ar} (${stage.code})</option>`;
    });
  }

  // Machine dropdown
  const machineSelect = document.getElementById('filter-machine');
  if (machineSelect) {
    const fleetCount = Object.keys(MACHINE_MAP).length;
    machineSelect.innerHTML = `<option value="ALL">جميع الماكينات (${fleetCount})</option>`;
    for (const [id, code] of Object.entries(MACHINE_MAP)) {
      machineSelect.innerHTML += `<option value="${id}">${code} [${id}]</option>`;
    }
  }
}

export function applyFilters() {
  const shiftEl = document.getElementById('filter-shift');
  const stageEl = document.getElementById('filter-stage');
  const conductorEl = document.getElementById('filter-conductor');
  const machineEl = document.getElementById('filter-machine');
  const searchEl = document.getElementById('filter-search');

  const shiftVal = shiftEl ? shiftEl.value : 'ALL';
  const stageVal = stageEl ? stageEl.value : 'ALL';
  const conductorVal = conductorEl ? conductorEl.value : 'ALL';
  const machineVal = machineEl ? machineEl.value : 'ALL';
  const searchVal = searchEl ? searchEl.value.toLowerCase().trim() : '';

  store.filteredRecords = store.rawRecords.filter(r => {
    if (shiftVal !== 'ALL' && r.ShiftCode !== shiftVal) return false;
    if (stageVal !== 'ALL') {
      const sId = parseInt(stageVal, 10);
      if (sId === 5 || sId === 6) {
        if (r.StageID !== 5 && r.StageID !== 6) return false;
      } else {
        if (r.StageID !== sId) return false;
      }
    }
    if (conductorVal !== 'ALL' && !r.ConductorMaterial.includes(conductorVal)) return false;
    if (machineVal !== 'ALL' && r.MachineID !== parseInt(machineVal, 10)) return false;
    if (searchVal) {
      const normSearch = normalizeCode(searchVal);
      const matchOrder = r.OrderID.toLowerCase().includes(searchVal);
      const matchTakeUp = r.TakeUpNo.toLowerCase().includes(searchVal) || (normSearch !== 'without' && normalizeCode(r.TakeUpNo).includes(normSearch));
      const matchPayOff = r.PayOffNo.toLowerCase().includes(searchVal) || (normSearch !== 'without' && normalizeCode(r.PayOffNo).includes(normSearch));
      const matchSendCard = r.SendCardNo.toLowerCase().includes(searchVal) || (normSearch !== 'without' && normalizeCode(r.SendCardNo).includes(normSearch));
      const matchReceiveCard = r.ReceiveCardNo.toLowerCase().includes(searchVal) || (normSearch !== 'without' && normalizeCode(r.ReceiveCardNo).includes(normSearch));
      const matchMach = getMachineName(r.MachineID).toLowerCase().includes(searchVal);
      const matchSup = getSupervisorName(r.SupervisorID).toLowerCase().includes(searchVal);
      const matchWire = r.WireType.toLowerCase().includes(searchVal);
      if (!matchOrder && !matchTakeUp && !matchPayOff && !matchSendCard && !matchReceiveCard && !matchMach && !matchSup && !matchWire) return false;
    }
    return true;
  });

  computeAggregates();
  updateKPICards();
  updateCharts();
  updateTable();
  update3DMachines();
}

export function resetFilters() {
  const shiftEl = document.getElementById('filter-shift');
  const stageEl = document.getElementById('filter-stage');
  const conductorEl = document.getElementById('filter-conductor');
  const machineEl = document.getElementById('filter-machine');
  const searchEl = document.getElementById('filter-search');

  if (shiftEl) shiftEl.value = 'ALL';
  if (stageEl) stageEl.value = 'ALL';
  if (conductorEl) conductorEl.value = 'ALL';
  if (machineEl) machineEl.value = 'ALL';
  if (searchEl) searchEl.value = '';

  applyFilters();
  showToast('تمت إعادة ضبط جميع الفلاتر', 'info');
}

export function filterBySelectedMachine() {
  if (!store.selectedMachineId) return;
  const machineEl = document.getElementById('filter-machine');
  if (machineEl) machineEl.value = String(store.selectedMachineId);
  applyFilters();
  closeMachineInspector();
  showToast(`تم تطبيق الفلترة على الماكينة: ${getMachineName(store.selectedMachineId)}`, 'info');
}
