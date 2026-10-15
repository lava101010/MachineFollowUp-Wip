/**
 * Energya Cables - CSV Export Helper (Arabic UTF-8 BOM Compliant)
 */
export function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return false;
  
  const csv = window.Papa ? window.Papa.unparse(rows) : '';
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
