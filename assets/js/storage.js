// ========================= STORAGE =========================

// This file now uses Supabase instead of localStorage
// Functions have been moved to supabase.js for better organization

// Keep the sort function for compatibility
function sortDescByTanggal(arr) {
  return arr.sort((a,b) => new Date(b.tanggal_pengiriman).getTime() - new Date(a.tanggal_pengiriman).getTime());
}

// Remove localStorage seed function as we'll use Supabase database