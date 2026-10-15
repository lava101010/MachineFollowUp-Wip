/**
 * Energya Cables - 3D Smart Factory Digital Twin & Operations Hub
 * Main Application Entry Point & Module Orchestrator
 */

import { store } from './state/store.js';
import { sampleCSV } from './data/sampleData.js';
import { parseCSVData, handleFileUpload } from './engine/csvParser.js';
import { init3DScene } from './three/scene.js';
import { set3DColorMode, update3DLegend, update3DMachines } from './three/colorModes.js';
import { setCameraAngle, resetCameraView, selectMachineIn3D, onWindowResize } from './three/interaction.js';
import { toggleAnimations } from './three/animator.js';
import { initDropdowns, applyFilters, resetFilters, filterBySelectedMachine } from './ui/filterBar.js';
import { switchViewTab, switchTableSubTab, toggleFullscreen } from './ui/tabSwitcher.js';
import { updateTable, prevPage, nextPage, changePageLimit, exportDecodedCSV } from './ui/productionTable.js';
import { applyWIPFilters, updateWIPTable, prevWIPPage, nextWIPPage, changeWIPPageLimit, exportWIPCSV } from './ui/wipTable.js';
import { closeMachineInspector } from './ui/inspector.js';
import { showToast } from './ui/toast.js';
import { setChartUnitMode } from './charts/chartManager.js';

let lastCSVContent = null;
let autoSyncTimer = null;

const STORAGE_KEY_CSV = 'energya_saved_csv_data';
const STORAGE_KEY_NAME = 'energya_saved_csv_name';
const STORAGE_KEY_TIME = 'energya_saved_csv_time';

// Auto-react to store data events
store.subscribe((event) => {
  if (event === 'DATA_LOADED') {
    applyFilters();
    applyWIPFilters();
  }
});

/**
 * Loads production_data.csv directly from the project directory.
 * If file is modified (even if emptied), it reflects the change immediately.
 */
export async function loadProjectCSV(silent = false) {
  const filePath = './production_data.csv';

  try {
    const response = await fetch(`${filePath}?_t=${Date.now()}`);
    if (response.ok) {
      const csvText = await response.text();

      // If silent auto-sync and data hasn't changed on disk, skip re-parsing to save resources
      if (silent && csvText === lastCSVContent) {
        return true;
      }

      const isUpdate = (lastCSVContent !== null && csvText !== lastCSVContent);
      lastCSVContent = csvText;

      // Save to localStorage so it persists
      try {
        localStorage.setItem(STORAGE_KEY_CSV, csvText);
        localStorage.setItem(STORAGE_KEY_NAME, 'production_data.csv');
        localStorage.setItem(STORAGE_KEY_TIME, new Date().toISOString());
      } catch (e) {}

      parseCSVData(csvText, () => {
        applyFilters();
        applyWIPFilters();
      });

      // Update sync indicator badge
      const badge = document.getElementById('csv-sync-badge');
      if (badge) {
        const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const count = store.rawRecords.length;
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>متصل بالملف: <b class="font-mono">production_data.csv</b> (${count} سجل - ${timeStr})</span>`;
        badge.classList.remove('hidden');
      }

      if (isUpdate) {
        showToast(`تم اكتشاف تحديث وتطبيق البيانات فوراً من (production_data.csv) [${store.rawRecords.length} سجل]!`, 'success');
      } else if (!silent) {
        showToast(`تم تحميل بيانات الإنتاج بنجاح من (production_data.csv) [${store.rawRecords.length} سجل]`, 'success');
      }
      return true;
    }
  } catch (e) {
    console.warn('Could not fetch production_data.csv:', e.message);
  }

  // Fallback to localStorage if running on file:/// where fetch is blocked
  try {
    const savedCSV = localStorage.getItem(STORAGE_KEY_CSV);
    const savedName = localStorage.getItem(STORAGE_KEY_NAME) || 'الملف المحفوظ';
    if (savedCSV !== null) {
      if (!silent) {
        parseCSVData(savedCSV, () => {
          applyFilters();
          applyWIPFilters();
        });

        const badge = document.getElementById('csv-sync-badge');
        if (badge) {
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>محمل من الذاكرة: <b class="font-mono">${savedName}</b> (${store.rawRecords.length} سجل)</span>`;
          badge.classList.remove('hidden');
        }

        showToast(`تم استرجاع بيانات (${savedName}) المحفوظة سابقاً تلقائياً!`, 'success');
        return true;
      }
    }
  } catch (e) {}

  // Fallback to embedded sample data if neither server fetch nor localStorage worked
  if (!silent) {
    loadSampleData();
    showToast('لربط الملف المباشر والتحديث التلقائي، شغّل المشروع بنقرة واحدة عبر: تشغيل_المشروع.bat', 'info');
  }
  return false;
}

export function startAutoSync(intervalSeconds = 15) {
  if (autoSyncTimer) clearInterval(autoSyncTimer);
  autoSyncTimer = setInterval(() => {
    loadProjectCSV(true);
  }, intervalSeconds * 1000);
}

export function loadSampleData() {
  parseCSVData(sampleCSV, () => {
    applyFilters();
    applyWIPFilters();
  });
}

// Enable Drag & Drop anywhere on screen
function setupDragAndDrop() {
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const csvText = evt.target.result;
          lastCSVContent = csvText;
          try {
            localStorage.setItem(STORAGE_KEY_CSV, csvText);
            localStorage.setItem(STORAGE_KEY_NAME, file.name);
            localStorage.setItem(STORAGE_KEY_TIME, new Date().toISOString());
          } catch (err) {}

          parseCSVData(csvText, () => {
            applyFilters();
            applyWIPFilters();
          });

          const badge = document.getElementById('csv-sync-badge');
          if (badge) {
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>تم إفلات الملف: <b class="font-mono">${file.name}</b> (${store.rawRecords.length} سجل)</span>`;
            badge.classList.remove('hidden');
          }

          showToast(`تم قراءة وحفظ ملف (${file.name}) بنجاح!`, 'success');
        };
        reader.readAsText(file);
      }
    }
  });
}

// Bind functions to window so HTML inline handlers (onclick, onchange, etc.) work flawlessly
window.switchViewTab = switchViewTab;
window.switchTableSubTab = switchTableSubTab;
window.toggleFullscreen = toggleFullscreen;
window.handleFileUpload = (e) => handleFileUpload(e, () => {
  applyFilters();
  applyWIPFilters();
});
window.loadProjectCSV = loadProjectCSV;
window.loadSampleData = loadSampleData;
window.resetFilters = resetFilters;
window.applyFilters = applyFilters;
window.exportDecodedCSV = exportDecodedCSV;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.changePageLimit = changePageLimit;
window.exportWIPCSV = exportWIPCSV;
window.prevWIPPage = prevWIPPage;
window.nextWIPPage = nextWIPPage;
window.changeWIPPageLimit = changeWIPPageLimit;
window.applyWIPFilters = applyWIPFilters;
window.setCameraAngle = setCameraAngle;
window.resetCameraView = resetCameraView;
window.toggleAnimations = toggleAnimations;
window.set3DColorMode = set3DColorMode;
window.closeMachineInspector = closeMachineInspector;
window.filterBySelectedMachine = filterBySelectedMachine;
window.selectMachineIn3D = selectMachineIn3D;
window.showToast = showToast;
window.setChartUnitMode = setChartUnitMode;
window.onWindowResize = onWindowResize;

// Bootstrap application on DOM ready
async function bootstrap() {
  initDropdowns();
  init3DScene();
  set3DColorMode('status');
  setupDragAndDrop();

  // Try auto-loading production_data.csv directly from the project directory
  const loaded = await loadProjectCSV(false);
  if (!loaded) {
    loadSampleData();
  }

  // Start background auto-sync every 15 seconds for rapid feedback
  startAutoSync(15);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
