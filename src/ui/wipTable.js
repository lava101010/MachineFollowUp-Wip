/**
 * Energya Cables - WIP Ledger Table & UI Management
 */

import { store } from '../state/store.js';
import { normalizeCode } from '../utils/normalizer.js';
import { downloadCSV } from '../utils/exportCSV.js';
import { showToast } from './toast.js';

export function applyWIPFilters() {
  const statusFilterEl = document.getElementById('wip-status-filter');
  const statusFilter = statusFilterEl ? statusFilterEl.value : 'ALL';
  const searchEl = document.getElementById('wip-search-input');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const normSearch = search ? normalizeCode(search) : '';

  store.filteredWIP = store.wipLedger.filter(item => {
    if (statusFilter !== 'ALL' && item.statusCode !== statusFilter) return false;
    if (search) {
      const matchWO = item.workOrder.toLowerCase().includes(search);
      const matchTakeUp = item.takeUpNo.toLowerCase().includes(search) || (normSearch !== 'without' && normalizeCode(item.takeUpNo).includes(normSearch));
      const matchRecCard = item.receiveCardNo.toLowerCase().includes(search) || (normSearch !== 'without' && normalizeCode(item.receiveCardNo).includes(normSearch));
      const matchPayOff = item.sourcePayOff.toLowerCase().includes(search) || (normSearch !== 'without' && normalizeCode(item.sourcePayOff).includes(normSearch));
      const matchSendCard = item.sourceSendCard.toLowerCase().includes(search) || (normSearch !== 'without' && normalizeCode(item.sourceSendCard).includes(normSearch));
      const matchStage = item.stageName.toLowerCase().includes(search);
      const matchMach = item.machineName.toLowerCase().includes(search);
      const matchSup = item.supervisorName.toLowerCase().includes(search);
      const matchSize = item.wireSize && item.wireSize.toLowerCase().includes(search);
      if (!matchWO && !matchTakeUp && !matchRecCard && !matchPayOff && !matchSendCard && !matchStage && !matchMach && !matchSup && !matchSize) {
        return false;
      }
    }
    return true;
  });

  store.wipCurrentPage = 1;
  updateWIPTable();
}

export function updateWIPTable() {
  const tbody = document.getElementById('wip-table-body');
  if (!tbody) return;

  const totalCountEl = document.getElementById('wip-total-count');
  if (totalCountEl) totalCountEl.innerText = store.filteredWIP.length;

  const totalPages = Math.ceil(store.filteredWIP.length / store.wipPageSize) || 1;
  if (store.wipCurrentPage > totalPages) store.wipCurrentPage = totalPages;
  if (store.wipCurrentPage < 1) store.wipCurrentPage = 1;

  const pageCurEl = document.getElementById('wip-pagination-current');
  const pageTotEl = document.getElementById('wip-pagination-total');
  if (pageCurEl) pageCurEl.innerText = store.wipCurrentPage;
  if (pageTotEl) pageTotEl.innerText = totalPages;

  const prevBtn = document.getElementById('btn-wip-prev-page');
  const nextBtn = document.getElementById('btn-wip-next-page');
  if (prevBtn) prevBtn.disabled = store.wipCurrentPage <= 1;
  if (nextBtn) nextBtn.disabled = store.wipCurrentPage >= totalPages;

  const startIdx = (store.wipCurrentPage - 1) * store.wipPageSize;
  const pageData = store.filteredWIP.slice(startIdx, startIdx + store.wipPageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="p-8 text-center text-slate-400 font-bold">لا توجد بكرات مطابقة للبحث أو الفلتر المحدد</td></tr>`;
    return;
  }

  tbody.innerHTML = pageData.map(item => {
    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="p-3 font-mono font-bold text-energya-royal">${item.workOrder}</td>
        <!-- 1. Source: Send Reel & Send Card -->
        <td class="p-3 bg-blue-50/40 border-x border-blue-100">
          <div class="flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 text-[10px]">بكرة الإرسال:</span>
            ${item.sourcePayOff === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">${item.sourcePayOff}</span>`}
          </div>
          <div class="flex items-center justify-between gap-1 text-[11px] mt-1">
            <span class="text-slate-400 text-[10px]">كارت الإرسال:</span>
            ${item.sourceSendCard === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">${item.sourceSendCard}</span>`}
          </div>
        </td>
        <!-- 2. Output: Receive Reel & Receive Card -->
        <td class="p-3 bg-emerald-50/40 border-x border-emerald-100">
          <div class="flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 text-[10px]">بكرة الاستقبال:</span>
            ${item.takeUpNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-black text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded text-[11px]">${item.takeUpNo}</span>`}
          </div>
          <div class="flex items-center justify-between gap-1 text-[11px] mt-1">
            <span class="text-slate-400 text-[10px]">كارت الاستقبال:</span>
            ${item.receiveCardNo === 'without' 
              ? '<span class="font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] italic font-semibold">without</span>' 
              : `<span class="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">${item.receiveCardNo}</span>`}
          </div>
        </td>
        <!-- 3. Wire Size -->
        <td class="p-3 text-center">
          <span class="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs inline-block shadow-sm">
            ${item.wireSize || '-'}
          </span>
        </td>
        <!-- 4. Producing Operation -->
        <td class="p-3 font-semibold text-slate-800">${item.stageName}</td>
        <td class="p-3 text-slate-600 font-medium">${item.consumingStages}</td>
        <td class="p-3 font-mono font-bold text-slate-700 text-left">${Math.round(item.originalLength).toLocaleString()} م</td>
        <td class="p-3 font-mono font-bold text-rose-700 text-left">${Math.round(item.totalConsumed).toLocaleString()} م</td>
        <td class="p-3 font-mono font-black text-left ${item.remainingLength > 0 ? 'text-emerald-700 text-sm' : 'text-slate-400'}">
          ${Math.round(item.remainingLength).toLocaleString()} م
        </td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-lg border text-xs inline-block ${item.statusBadgeClass}">
            ${item.statusText}
          </span>
        </td>
        <td class="p-3 text-[11px] text-slate-600">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-energya-royal">${item.machineName}</span>
            <span class="bg-blue-100 text-energya-navy px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">${item.shiftCode}</span>
            ${item.mergedCount > 1 ? `<span class="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[9px] font-bold" title="مجمعة من ${item.mergedCount} تسجيلات ورديات">${item.mergedCount} ورديات</span>` : ''}
          </div>
          <div class="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5" title="${item.supervisorName}">${item.supervisorName}</div>
        </td>
      </tr>
    `;
  }).join('');
}

export function prevWIPPage() {
  if (store.wipCurrentPage > 1) {
    store.wipCurrentPage--;
    updateWIPTable();
  }
}

export function nextWIPPage() {
  const totalPages = Math.ceil(store.filteredWIP.length / store.wipPageSize) || 1;
  if (store.wipCurrentPage < totalPages) {
    store.wipCurrentPage++;
    updateWIPTable();
  }
}

export function changeWIPPageLimit(newLimit) {
  store.wipPageSize = parseInt(newLimit, 10);
  store.wipCurrentPage = 1;
  updateWIPTable();
}

export function exportWIPCSV() {
  if (!store.filteredWIP || store.filteredWIP.length === 0) {
    showToast('لا توجد بيانات WIP لتصديرها', 'error');
    return;
  }

  const rows = store.filteredWIP.map(item => ({
    "WorkOrder": item.workOrder,
    "بكرة_الإرسال_PayOffNo": item.sourcePayOff,
    "كارت_الإرسال_SendCardNo": item.sourceSendCard,
    "بكرة_الاستقبال_TakeUpNo": item.takeUpNo,
    "كارت_الاستقبال_ReceiveCardNo": item.receiveCardNo,
    "OPERATION_المرحلة_المُنتِجة": item.stageName,
    "المقاس": item.wireSize,
    "المرحلة_اللاحقة_المستهلكة": item.consumingStages,
    "الطول_الأصلي_متر": item.originalLength,
    "الطول_المستهلك_متر": item.totalConsumed,
    "الطول_المتبقي_متر": item.remainingLength,
    "حالة_البكرة_والجاهزية": item.statusText.replace(/[🟢🟡🔵]/g, '').trim(),
    "الماكينة": item.machineName,
    "المشغل_المشرف": item.supervisorName,
    "الوردية": item.shiftCode,
    "تاريخ_التسجيل": item.regDate
  }));

  const filename = `Energya_WIP_Reel_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  const success = downloadCSV(filename, rows);
  if (success) {
    showToast('تم تصدير سجل أرصدة الـ WIP بنجاح!', 'success');
  } else {
    showToast('حدث خطأ أثناء تصدير الملف', 'error');
  }
}
