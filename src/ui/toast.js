/**
 * Energya Cables - Floating Toast Notifications System
 */
export function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg || !toastIcon) return;

  toastMsg.innerText = msg;
  if (type === 'success') {
    toastIcon.className = "w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center";
    toastIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
  } else if (type === 'error') {
    toastIcon.className = "w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center";
    toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else {
    toastIcon.className = "w-7 h-7 rounded-lg bg-energya-royal text-white flex items-center justify-center";
    toastIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
  }

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3500);
}
