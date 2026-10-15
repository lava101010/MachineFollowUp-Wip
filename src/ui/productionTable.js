/**
 * Energya Cables - Production Records Table & Export
 */

import { store } from '../state/store.js';
import { getStageName } from '../constants/stages.js';
import { getMachineName } from '../constants/machines.js';
import { getSupervisorName } from '../constants/supervisors.js';
import { downloadCSV } from '../utils/exportCSV.js';
import { showToast } from './toast.js';

export function updateTable() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  const totalCountEl = document.getElementById('table-total-count');
  if (totalCountEl) totalCountEl.innerText = store.filteredRecords.length;

  const totalPages = Math.ceil(store.filteredRecords.length / store.tablePageSize) || 1;
  if (store.tableCurrentPage > totalPages) store.tableCurrentPage = totalPages;
  if (store.tableCurrentPage < 1) store.tableCurrentPage = 1;

  const curEl = document.getElementById('pagination-current');
  const totEl = document.getElementById('pagination-total');
  if (curEl) curEl.innerText = store.tableCurrentPage;
  if (totEl) totEl.innerText = totalPages;

  const prevBtn = document.getElementById('btn-prev-page');
  const nextBtn = document.getElementById('btn-next-page');
  if (prevBtn) prevBtn.disabled = store.tableCurrentPage <= 1;
  if (nextBtn) nextBtn.disabled = store.tableCurrentPage >= totalPages;

  const startIdx = (store.tableCurrentPage - 1) * store.tablePageSize;
  const pageData = store.filteredRecords.slice(startIdx, startIdx + store.tablePageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" class="p-8 text-center text-slate-400 font-bold">لا توجد سجلات تطابق الفلاتر المحددة</td></tr>`;
    return;
  }

  tbody.innerHTML = pageData.map(r => {
    const matColor = r.ConductorMaterial && r.ConductorMaterial.includes('نحاس') ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-700 bg-slate-100 border-slate-200';
    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="p-3 font-mono font-bold text-energya-royal">${r.OrderID}</td>
        <td class="p-3 text-[11px]">${r.RegDate} <span class="bg-blue-100 text-energya-navy px-1.5 py-0.5 rounded font-bold">${r.ShiftCode}</span></td>
        <td class="p-3 font-semibold">${getStageName(r.StageID)}</td>
        <td class="p-3">
          <button onclick="window.selectMachineIn3D(${r.MachineID})" class="font-bold text-energya-royal hover:underline flex items-center gap-1">
            <i class="fa-solid fa-cube text-[10px]"></i> ${getMachineName(r.MachineID)}
          </button>
        </td>
        <td class="p-3 text-slate-600 font-medium">${getSupervisorName(r.SupervisorID)}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${matColor}">${r.ConductorMaterial}</span>
          <div class="text-[11px] text-slate-800 font-mono mt-0.5 font-bold">${r.WireSize}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-[120px]">${r.WireType}</div>
        </td>
        <!-- Send Data: SendCardNo & PayOffNo -->
        <td class="p-3 bg-blue-50/40 border-x border-blue-100">
          <div class="flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 text-[10px]">كارت الإرسال:</span>
            ${r.SendCardNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">${r.SendCardNo}</span>`}
          </div>
          <div class="flex items-center justify-between gap-1 text-[11px] mt-1">
            <span class="text-slate-400 text-[10px]">بكرة الإرسال:</span>
            ${r.PayOffNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">${r.PayOffNo}</span>`}
          </div>
        </td>
        <!-- Receive Data: ReceiveCardNo & TakeUpNo -->
        <td class="p-3 bg-emerald-50/40 border-x border-emerald-100">
          <div class="flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 text-[10px]">كارت الاستقبال:</span>
            ${r.ReceiveCardNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">${r.ReceiveCardNo}</span>`}
          </div>
          <div class="flex items-center justify-between gap-1 text-[11px] mt-1">
            <span class="text-slate-400 text-[10px]">بكرة الاستقبال:</span>
            ${r.TakeUpNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-extrabold text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded text-[11px] shadow-sm">${r.TakeUpNo}</span>`}
          </div>
        </td>
        <td class="p-3">
          <div class="font-mono font-bold text-energya-blue text-xs">${Math.round(r.LengthMeters).toLocaleString()} م</div>
          ${r.InputLengths > 0 ? `<div class="text-[10px] text-slate-400 font-mono">تغذية: ${Math.round(r.InputLengths).toLocaleString()} م</div>` : ''}
        </td>
        <td class="p-3 font-mono font-extrabold text-slate-900">${r.WeightTon.toFixed(2)}</td>
        <td class="p-3 text-[11px] text-slate-500">${r.CopperTon.toFixed(2)} / ${r.AluminumTon.toFixed(2)}</td>
        <td class="p-3 text-[10px] text-slate-500 truncate max-w-[140px]" title="${r.Remark}">${r.Remark}</td>
      </tr>
    `;
  }).join('');
}

export function prevPage() {
  if (store.tableCurrentPage > 1) {
    store.tableCurrentPage--;
    updateTable();
  }
}

export function nextPage() {
  const totalPages = Math.ceil(store.filteredRecords.length / store.tablePageSize) || 1;
  if (store.tableCurrentPage < totalPages) {
    store.tableCurrentPage++;
    updateTable();
  }
}

export function changePageLimit(newLimit) {
  store.tablePageSize = parseInt(newLimit, 10);
  store.tableCurrentPage = 1;
  updateTable();
}

export function exportDecodedCSV() {
  if (!store.filteredRecords || store.filteredRecords.length === 0) {
    showToast('لا توجد بيانات لتصديرها', 'error');
    return;
  }

  const rows = store.filteredRecords.map(r => ({
    "WorkOrder": r.OrderID,
    "تاريخ_التسجيل_RegDate": r.RegDate,
    "الوردية_ShiftCode": r.ShiftCode,
    "كود_OPERATION_المرحلة": r.StageID,
    "OPERATION_المرحلة": getStageName(r.StageID),
    "كود_الماكينة_الرقمي": r.MachineID,
    "اسم_الماكينة": getMachineName(r.MachineID),
    "كود_المشغل_المشرف": r.SupervisorID,
    "المشغل_المشرف": getSupervisorName(r.SupervisorID),
    "خامة_الموصل": r.ConductorMaterial,
    "نوع_السلك": r.WireType,
    "عدد_القلوب": r.CoreCount,
    "المقاس": r.WireSize,
    "كارت_الإرسال_SendCardNo": r.SendCardNo,
    "بكرة_الإرسال_PayOffNo": r.PayOffNo,
    "طول_الدخول_بالمتر_InputLengths": r.InputLengths,
    "كارت_الاستقبال_ReceiveCardNo": r.ReceiveCardNo,
    "بكرة_الاستقبال_TakeUpNo": r.TakeUpNo,
    "طول_الإنتاج_بالمتر_LengthMeters": r.LengthMeters,
    "الوزن_الإجمالي_طن": r.WeightTon,
    "وزن_النحاس_طن": r.CopperTon,
    "وزن_الألومنيوم_طن": r.AluminumTon,
    "وزن_الشيلد_طن": r.ScreenTon,
    "وزن_التسليح_طن": r.ArmourTon,
    "الملاحظات": r.Remark
  }));

  const filename = `Energya_Cables_Decoded_Production_${new Date().toISOString().slice(0, 10)}.csv`;
  const success = downloadCSV(filename, rows);
  if (success) {
    showToast('تم تصدير ملف الإكسيل المفكك بنجاح!', 'success');
  } else {
    showToast('حدث خطأ أثناء تصدير الملف', 'error');
  }
}
