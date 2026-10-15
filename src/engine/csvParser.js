/**
 * Energya Cables - CSV Parser & Data Loader
 */

import { cleanReelOrCard, formatWireSize } from '../utils/normalizer.js';
import { calculateWIPLedger } from './wipEngine.js';
import { showToast } from '../ui/toast.js';
import { store } from '../state/store.js';

export function normalizeAndLoadRecords(data, onLoadedCallback) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    store.rawRecords = [];
    const tabRecEl = document.getElementById('tab-records-count');
    if (tabRecEl) tabRecEl.innerText = 0;
    calculateWIPLedger();
    if (typeof onLoadedCallback === 'function') {
      onLoadedCallback();
    } else {
      store.notify('DATA_LOADED');
    }
    return;
  }

  store.rawRecords = data.map((row, idx) => {
    const coreCount = parseInt(row.CoreCount) || 1;
    const cleanSize = formatWireSize(row.WireSize, coreCount);
    return {
      OrderID: String(row.OrderID || `ORD-${1000 + idx}`).trim(),
      RegDate: String(row.RegDate || '2026-10-14').trim(),
      ShiftCode: String(row.ShiftCode || 'S1').trim().toUpperCase(),
      StageID: parseInt(row.StageID) || 1,
      MachineID: parseInt(row.MachineID) || 1,
      SupervisorID: parseInt(row.SupervisorID) || 0,
      ConductorMaterial: String(row.ConductorMaterial || 'نحاس').trim(),
      WireType: String(row.WireType || 'كابل قوى').trim(),
      CoreCount: coreCount,
      WireSize: cleanSize,
      LengthMeters: parseFloat(row.LengthMeters) || 0,
      TakeUpNo: cleanReelOrCard(row.TakeUpNo),
      StatusID: parseInt(row.StatusID) || 1,
      WeightTon: parseFloat(row.WeightTon) || 0,
      CreatedBy: String(row.CreatedBy || 'SYSTEM').trim(),
      LastModified: String(row.LastModified || '').trim(),
      FactoryID: parseInt(row.FactoryID) || 1,
      RecordID: String(row.RecordID || `REC-${idx + 1}`).trim(),
      PayOffNo: cleanReelOrCard(row.PayOffNo),
      Remark: String(row.Remark || 'إنتاج منتظم مطابقة للمواصفات').trim(),
      PalletRef: String(row.PalletRef || `PAL-${idx + 1}`).trim(),
      CopperTon: parseFloat(row.CopperTon) || 0,
      AluminumTon: parseFloat(row.AluminumTon) || 0,
      ScreenTon: parseFloat(row.ScreenTon) || 0,
      ArmourTon: parseFloat(row.ArmourTon) || 0,
      SendCardNo: cleanReelOrCard(row.SendCardNo),
      ReceiveCardNo: cleanReelOrCard(row.ReceiveCardNo),
      InputLengths: parseFloat(row.InputLengths) || 0
    };
  });

  // Update Header Badges
  const tabRecEl = document.getElementById('tab-records-count');
  if (tabRecEl) tabRecEl.innerText = store.rawRecords.length;

  // Calculate WIP balances
  calculateWIPLedger();

  // Notify listeners or execute callback to apply filters and render
  if (typeof onLoadedCallback === 'function') {
    onLoadedCallback();
  } else {
    store.notify('DATA_LOADED');
  }
}

export function parseCSVData(csvString, onLoadedCallback) {
  if (!window.Papa) {
    console.error('PapaParse is required to parse CSV data.');
    return;
  }

  if (!csvString || csvString.trim().length === 0) {
    normalizeAndLoadRecords([], onLoadedCallback);
    showToast('تمت قراءة ملف CSV فارغ (0 سجلات)', 'info');
    return;
  }

  window.Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: function(results) {
      const rows = results.data || [];
      normalizeAndLoadRecords(rows, onLoadedCallback);
      if (rows.length > 0) {
        showToast(`تم تحديث البيانات من الملف بنجاح (${store.rawRecords.length} سجلاً)!`, 'success');
      } else {
        showToast('ملف البيانات فارغ (0 سجلات)', 'info');
      }
    },
    error: function(err) {
      showToast('حدث خطأ أثناء قراءة ملف CSV: ' + err.message, 'error');
    }
  });
}

export function handleFileUpload(event, onLoadedCallback) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  if (files.length === 1) {
    const reader = new FileReader();
    reader.onload = function(e) {
      parseCSVData(e.target.result, onLoadedCallback);
    };
    reader.readAsText(files[0]);
    event.target.value = '';
    return;
  }

  // Multi-file reading from backup devices and merging
  let allRows = [];
  let filesRead = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      window.Papa.parse(e.target.result, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) {
          if (results.data && results.data.length > 0) {
            allRows = allRows.concat(results.data);
          }
          filesRead++;
          if (filesRead === files.length) {
            normalizeAndLoadRecords(allRows, onLoadedCallback);
            if (allRows.length > 0) {
              showToast(`تم قراءة ودمج ${files.length} ملفات أجهزة بنجاح بإجمالي ${store.rawRecords.length} سجلاً!`, 'success');
            } else {
              showToast('الملفات المحددة لا تحتوي على بيانات صالحة', 'error');
            }
          }
        },
        error: function(err) {
          filesRead++;
          showToast(`خطأ في قراءة ملف ${file.name}: ` + err.message, 'error');
        }
      });
    };
    reader.readAsText(file);
  });
  event.target.value = ''; // reset input
}
