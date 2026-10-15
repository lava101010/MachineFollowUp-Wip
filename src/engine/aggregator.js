/**
 * Energya Cables - Analytics & KPIs Aggregator
 */

import { MACHINE_MAP } from '../constants/machines.js';
import { store } from '../state/store.js';

export function computeAggregates() {
  store.machineStats = {};
  store.stageStats = {};

  // Initialize all machines
  for (const mId in MACHINE_MAP) {
    store.machineStats[mId] = {
      id: parseInt(mId),
      name: MACHINE_MAP[mId],
      totalTons: 0,
      totalMeters: 0,
      ordersCount: 0,
      reelsCount: 0,
      copperTons: 0,
      aluminumTons: 0,
      screenTons: 0,
      armourTons: 0,
      shifts: new Set(),
      supervisors: new Set(),
      records: [],
      stageId: null
    };
  }

  // Aggregate filtered records
  store.filteredRecords.forEach(r => {
    const m = store.machineStats[r.MachineID];
    if (m) {
      m.totalTons += r.WeightTon;
      m.totalMeters += r.LengthMeters;
      m.ordersCount += 1;
      m.reelsCount += 1;
      m.copperTons += r.CopperTon;
      m.aluminumTons += r.AluminumTon;
      m.screenTons += r.ScreenTon;
      m.armourTons += r.ArmourTon;
      m.shifts.add(r.ShiftCode);
      m.supervisors.add(r.SupervisorID);
      m.records.push(r);
      m.stageId = r.StageID;
    }

    if (!store.stageStats[r.StageID]) {
      store.stageStats[r.StageID] = {
        id: r.StageID,
        totalTons: 0,
        totalMeters: 0,
        ordersCount: 0
      };
    }
    store.stageStats[r.StageID].totalTons += r.WeightTon;
    store.stageStats[r.StageID].totalMeters += r.LengthMeters;
    store.stageStats[r.StageID].ordersCount += 1;
  });
}

export function updateKPICards() {
  let totalTons = 0;
  let totalMeters = 0;
  let copperTons = 0;
  let alumTons = 0;
  let screenTons = 0;
  let armourTons = 0;
  const uniqueOrders = new Set();
  const uniqueReels = new Set();
  const shiftOutput = { S1: 0, S2: 0, S3: 0, F1: 0, F2: 0 };
  let activeMachinesCount = 0;

  store.filteredRecords.forEach(r => {
    totalTons += r.WeightTon;
    totalMeters += r.LengthMeters;
    copperTons += r.CopperTon;
    alumTons += r.AluminumTon;
    screenTons += r.ScreenTon;
    armourTons += r.ArmourTon;
    uniqueOrders.add(r.OrderID);
    if (r.TakeUpNo && r.TakeUpNo !== 'without') uniqueReels.add(r.TakeUpNo);
    if (shiftOutput[r.ShiftCode] !== undefined) {
      shiftOutput[r.ShiftCode] += r.WeightTon;
    }
  });

  for (const mId in store.machineStats) {
    if (store.machineStats[mId].totalTons > 0) activeMachinesCount++;
  }

  // Top Shift
  let topShift = 'S1';
  let topShiftTon = 0;
  for (const [sh, val] of Object.entries(shiftOutput)) {
    if (val > topShiftTon) {
      topShiftTon = val;
      topShift = sh;
    }
  }

  // Safely update DOM elements if present
  const elTotalTons = document.getElementById('kpi-total-tons');
  if (elTotalTons) elTotalTons.innerText = totalTons.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const elCuTons = document.getElementById('kpi-copper-tons');
  if (elCuTons) elCuTons.innerText = copperTons.toFixed(1);
  
  const elAlTons = document.getElementById('kpi-aluminum-tons');
  if (elAlTons) elAlTons.innerText = alumTons.toFixed(1);
  
  const elMeters = document.getElementById('kpi-total-meters');
  if (elMeters) elMeters.innerText = Math.round(totalMeters).toLocaleString('en-US');
  
  const elKm = document.getElementById('kpi-total-km');
  if (elKm) elKm.innerText = (totalMeters / 1000).toFixed(2);
  
  const elReels = document.getElementById('kpi-total-reels');
  if (elReels) elReels.innerText = uniqueReels.size;
  
  const elOrders = document.getElementById('kpi-total-orders');
  if (elOrders) elOrders.innerText = uniqueOrders.size;
  
  const totalMachinesFleet = Object.keys(MACHINE_MAP).length;
  const elActiveMach = document.getElementById('kpi-active-machines');
  if (elActiveMach) elActiveMach.innerText = activeMachinesCount;
  
  const elFleetCount = document.getElementById('kpi-total-fleet-count');
  if (elFleetCount) elFleetCount.innerText = totalMachinesFleet;
  
  const elUtilRate = document.getElementById('kpi-utilization-rate');
  if (elUtilRate) elUtilRate.innerText = Math.round((activeMachinesCount / totalMachinesFleet) * 100) + '%';
  
  const elArmourScreen = document.getElementById('kpi-armour-screen-tons');
  if (elArmourScreen) elArmourScreen.innerText = (armourTons + screenTons).toFixed(2);
  
  const elArmour = document.getElementById('kpi-armour-tons');
  if (elArmour) elArmour.innerText = armourTons.toFixed(1);
  
  const elScreen = document.getElementById('kpi-screen-tons');
  if (elScreen) elScreen.innerText = screenTons.toFixed(1);

  const elTopShift = document.getElementById('kpi-top-shift');
  if (elTopShift) elTopShift.innerText = `${topShift} (${topShiftTon > 0 ? topShiftTon.toFixed(1) + ' طن' : 'لا يوجد'})`;
  
  const elTopShiftTon = document.getElementById('kpi-top-shift-ton');
  if (elTopShiftTon) elTopShiftTon.innerText = topShiftTon.toFixed(1) + ' طن';

  // Quick header bar counters
  const barMach = document.getElementById('bar-active-machines');
  if (barMach) barMach.innerText = `${activeMachinesCount} / ${totalMachinesFleet}`;
  
  const barTon = document.getElementById('bar-total-ton');
  if (barTon) barTon.innerText = `${totalTons.toFixed(2)} طن`;
  
  const barMeters = document.getElementById('bar-total-meters');
  if (barMeters) barMeters.innerText = `${Math.round(totalMeters).toLocaleString()} م`;
  
  const tabRec = document.getElementById('tab-records-count');
  if (tabRec) tabRec.innerText = store.filteredRecords.length;
}
