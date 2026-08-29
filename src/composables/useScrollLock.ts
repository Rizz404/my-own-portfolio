// * Counter di module scope (bukan per-instance) - biar aman kalau lebih
// dari satu overlay (mis. AppModal bersarang) manggil lock() bersamaan,
// overflow/padding body cuma di-restore pas SEMUA lock-nya dilepas
// (lockCount balik ke 0), bukan pas overlay pertama yang ketutup duluan.
let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

/**
 * Lock body scroll (dipake pas modal/overlay lain kebuka). Sekalian
 * ngompensasi lebar scrollbar yang ilang pas `overflow: hidden` di-set, biar
 * konten halaman di belakangnya gak "geser" ke kanan (viewport jadi kepake
 * penuh tanpa scrollbar) pas overlay kebuka - reflow itu yang bikin UI
 * keliatan geser pas modal muncul/ketutup.
 */
export function lockBodyScroll() {
  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
  }
  lockCount++;
}

/** Lawan dari lockBodyScroll() - wajib dipanggil sekali per lockBodyScroll(). */
export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}
