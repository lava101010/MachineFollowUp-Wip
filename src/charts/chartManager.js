/**
 * Energya Cables - Analytics Charts Manager (Chart.js)
 * Supports dual measurement units: Kilometers (كم) & Tons (طن) with live toggle.
 */

import { store } from '../state/store.js';
import { STAGE_MAP } from '../constants/stages.js';
import { getSupervisorName } from '../constants/supervisors.js';

export function setChartUnitMode(mode) {
  store.chartUnitMode = mode;
  const btnKm = document.getElementById('btn-unit-km');
  const btnTon = document.getElementById('btn-unit-ton');
  if (btnKm && btnTon) {
    if (mode === 'km') {
      btnKm.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-energya-royal text-white shadow-sm";
      btnTon.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900";
    } else {
      btnTon.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-energya-royal text-white shadow-sm";
      btnKm.className = "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900";
    }
  }

  // Update subtitle indicator on chart 1
  const subEl = document.getElementById('chart-stages-unit-sub');
  if (subEl) {
    subEl.innerText = mode === 'km' ? 'بالكيلومتر (كم)' : 'بالوزن (طن)';
  }

  updateCharts();
}

export function renderChart(canvasId, config) {
  const Chart = window.Chart;
  if (!Chart) return;

  if (store.charts[canvasId]) {
    store.charts[canvasId].destroy();
  }
  const ctx = document.getElementById(canvasId);
  if (ctx) {
    store.charts[canvasId] = new Chart(ctx, config);
  }
}

export function updateCharts() {
  const filteredRecords = store.filteredRecords;
  const stageStats = store.stageStats;
  const machineStats = store.machineStats;
  const isKm = (store.chartUnitMode !== 'ton'); // Default is Kilometers (كم)

  // 1. Stage Chart (by km or ton) - grouped by unique stage code
  const stageAgg = {};
  for (const sId in STAGE_MAP) {
    const st = stageStats[sId];
    if (st) {
      const code = STAGE_MAP[sId].code;
      const val = isKm ? (st.totalMeters / 1000) : st.totalTons;
      if (val > 0) {
        stageAgg[code] = (stageAgg[code] || 0) + val;
      }
    }
  }
  const stageLabels = Object.keys(stageAgg);
  const stageValues = Object.values(stageAgg).map(v => parseFloat(v.toFixed(2)));

  renderChart('chart-stages', {
    type: 'bar',
    data: {
      labels: stageLabels.length > 0 ? stageLabels : ['لا يوجد'],
      datasets: [{
        label: isKm ? 'إجمالي الأطوال (كيلومتر - كم)' : 'إجمالي الوزن (طن)',
        data: stageValues.length > 0 ? stageValues : [0],
        backgroundColor: '#00529B',
        borderRadius: 6,
        barThickness: 16
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `الإنتاج: ${ctx.parsed.y.toLocaleString()} ${isKm ? 'كم' : 'طن'}`
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (val) => `${val} ${isKm ? 'كم' : 'طن'}`
          }
        },
        x: { grid: { display: false } }
      }
    }
  });

  // 2. Shift Chart (by km or ton)
  const shiftCounts = { S1: 0, S2: 0, S3: 0, F1: 0, F2: 0 };
  filteredRecords.forEach(r => {
    const addVal = isKm ? ((r.LengthMeters || 0) / 1000) : (r.WeightTon || 0);
    if (shiftCounts[r.ShiftCode] !== undefined) shiftCounts[r.ShiftCode] += addVal;
  });
  for (const sh in shiftCounts) {
    shiftCounts[sh] = parseFloat(shiftCounts[sh].toFixed(2));
  }

  renderChart('chart-shifts', {
    type: 'doughnut',
    data: {
      labels: ['وردية S1', 'وردية S2', 'وردية S3', 'وردية F1', 'وردية F2'],
      datasets: [{
        data: Object.values(shiftCounts),
        backgroundColor: ['#00529B', '#0077CC', '#00A3E0', '#10B981', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} ${isKm ? 'كم' : 'طن'}`
          }
        }
      },
      cutout: '65%'
    }
  });

  // 3. Top 10 Machines (by km or ton)
  const sortedMachines = Object.values(machineStats)
    .map(m => ({
      ...m,
      chartVal: isKm ? ((m.totalMeters || 0) / 1000) : (m.totalTons || 0)
    }))
    .filter(m => m.chartVal > 0)
    .sort((a, b) => b.chartVal - a.chartVal)
    .slice(0, 10);

  renderChart('chart-machines', {
    type: 'bar',
    data: {
      labels: sortedMachines.map(m => m.name),
      datasets: [{
        label: isKm ? 'إجمالي الطول (كيلومتر - كم)' : 'إجمالي الوزن (طن)',
        data: sortedMachines.map(m => parseFloat(m.chartVal.toFixed(2))),
        backgroundColor: '#10B981',
        borderRadius: 5,
        barThickness: 12
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `الإنتاج: ${ctx.parsed.x.toLocaleString()} ${isKm ? 'كم' : 'طن'}`,
            afterLabel: () => 'اضغط لاختيار الماكينة في المشهد 3D'
          }
        }
      },
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const mach = sortedMachines[idx];
          if (mach && window.selectMachineIn3D) {
            window.selectMachineIn3D(mach.id);
          }
        }
      },
      scales: {
        x: { 
          beginAtZero: true, 
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (val) => `${val} ${isKm ? 'كم' : 'طن'}`
          }
        },
        y: { grid: { display: false } }
      }
    }
  });

  // 4. Top Supervisors (by km or ton)
  const supMap = {};
  filteredRecords.forEach(r => {
    const addVal = isKm ? ((r.LengthMeters || 0) / 1000) : (r.WeightTon || 0);
    supMap[r.SupervisorID] = (supMap[r.SupervisorID] || 0) + addVal;
  });

  const topSups = Object.entries(supMap)
    .map(([sid, val]) => [sid, parseFloat(val.toFixed(2))])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  renderChart('chart-supervisors', {
    type: 'bar',
    data: {
      labels: topSups.map(s => {
        const name = getSupervisorName(parseInt(s[0], 10));
        return name.split(' ')[0] + ' ' + (name.split(' ')[1] || '');
      }),
      datasets: [{
        label: isKm ? 'إنتاج المشرف (كيلومتر - كم)' : 'إنتاج المشرف (طن)',
        data: topSups.map(s => s[1]),
        backgroundColor: '#8B5CF6',
        borderRadius: 5,
        barThickness: 14
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `إنتاج: ${ctx.parsed.y.toLocaleString()} ${isKm ? 'كم' : 'طن'}`
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (val) => `${val} ${isKm ? 'كم' : 'طن'}`
          }
        },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // 5. Materials Breakdown
  let copperVal = 0, alumVal = 0, screenVal = 0, armourVal = 0;
  if (isKm) {
    filteredRecords.forEach(r => {
      const km = (r.LengthMeters || 0) / 1000;
      if (r.ConductorMaterial && r.ConductorMaterial.includes('نحاس')) {
        copperVal += km;
      } else {
        alumVal += km;
      }
      if (r.ScreenTon > 0) screenVal += km;
      if (r.ArmourTon > 0) armourVal += km;
    });
  } else {
    filteredRecords.forEach(r => {
      copperVal += r.CopperTon || 0;
      alumVal += r.AluminumTon || 0;
      screenVal += r.ScreenTon || 0;
      armourVal += r.ArmourTon || 0;
    });
  }

  copperVal = parseFloat(copperVal.toFixed(2));
  alumVal = parseFloat(alumVal.toFixed(2));
  screenVal = parseFloat(screenVal.toFixed(2));
  armourVal = parseFloat(armourVal.toFixed(2));

  renderChart('chart-materials', {
    type: 'pie',
    data: {
      labels: isKm 
        ? ['كابلات نحاس (كم)', 'كابلات ألومنيوم (كم)', 'كابلات شيلد (كم)', 'كابلات تسليح (كم)']
        : ['نحاس (Copper طن)', 'ألومنيوم (Aluminum طن)', 'شيلد (Screen طن)', 'تسليح (Armour طن)'],
      datasets: [{
        data: [copperVal, alumVal, screenVal, armourVal],
        backgroundColor: ['#D97706', '#64748B', '#0077CC', '#475569'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} ${isKm ? 'كم' : 'طن'}`
          }
        }
      }
    }
  });

  // 6. Wire Sizes
  const sizeMap = {};
  filteredRecords.forEach(r => {
    const key = r.WireSize || 'Other';
    const addVal = isKm ? ((r.LengthMeters || 0) / 1000) : (r.WeightTon || 0);
    sizeMap[key] = (sizeMap[key] || 0) + addVal;
  });
  const topSizes = Object.entries(sizeMap)
    .map(([k, v]) => [k, parseFloat(v.toFixed(2))])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  renderChart('chart-wiresizes', {
    type: 'bar',
    data: {
      labels: topSizes.map(s => s[0]),
      datasets: [{
        label: isKm ? 'إجمالي الأطوال (كيلومتر - كم)' : 'إجمالي الوزن (طن)',
        data: topSizes.map(s => s[1]),
        backgroundColor: '#E11D48',
        borderRadius: 5,
        barThickness: 14
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `الطول: ${ctx.parsed.y.toLocaleString()} ${isKm ? 'كم' : 'طن'}`
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (val) => `${val} ${isKm ? 'كم' : 'طن'}`
          }
        },
        x: { grid: { display: false } }
      }
    }
  });
}
