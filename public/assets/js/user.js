// ========================= USER =========================
const STATE_KEY = 'ekspedisi_state_v1';
document.addEventListener('DOMContentLoaded', async function() {
  // User elements
  const userTbody = document.getElementById('user-tbody');
  const userSearch = document.getElementById('user-search');

  const approveWrap = document.getElementById('user-approve-wrap');
  const approveForm = document.getElementById('user-approve-form');
  const approveId = document.getElementById('approve-id');
  const approveNama = document.getElementById('approve-nama');
  const approveCancel = document.getElementById('approve-cancel');
  const userSignCanvas = document.getElementById('user-signature');
  const userSignClear = document.getElementById('user-sign-clear');

  // Pagination elements
  const paginationContainer = document.getElementById('pagination-container');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const prevPageMobileBtn = document.getElementById('prev-page-mobile');
  const nextPageMobileBtn = document.getElementById('next-page-mobile');
  const pageInfoStart = document.getElementById('page-info-start');
  const pageInfoEnd = document.getElementById('page-info-end');
  const pageInfoTotal = document.getElementById('page-info-total');
  const pageNumbersContainer = document.getElementById('page-numbers');
  const rowsPerPageSelect = document.getElementById('rows-per-page');
  
  let currentPage = 1;
  let rowsPerPage = 20;
  let allData = [];
  let filteredData = [];

  // Function to update pagination controls
  function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    // Update page info text
    const start = filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
    const end = Math.min(currentPage * rowsPerPage, filteredData.length);
    
    pageInfoStart.textContent = start;
    pageInfoEnd.textContent = end;
    pageInfoTotal.textContent = filteredData.length;
    
    // Update rows per page select to match current value
    if (rowsPerPageSelect) {
      rowsPerPageSelect.value = rowsPerPage;
    }
    
    // Update button states
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    prevPageMobileBtn.disabled = currentPage === 1;
    nextPageMobileBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbersContainer.innerHTML = '';
    
    // Show maximum of 5 page buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderUser();
      });
      pageNumbersContainer.appendChild(pageBtn);
    }
  }
  
  async function renderUser(){
    try {
      const q = userSearch.value?.trim().toLowerCase() || '';
      
      // Only fetch all data if we haven't already
      if (allData.length === 0) {
        allData = await getLetters();
      }
      
      // Filter data based on search query
      if (q) {
        filteredData = allData.filter(d => [d.nomor,d.perihal,d.penerima,d.tujuan_surat,d.tanggal_pengiriman].some(x => (x||'').toLowerCase().includes(q)));
      } else {
        filteredData = [...allData];
      }
      
      // Calculate pagination
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      
      // Ensure current page is within bounds
      if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
      } else if (currentPage < 1) {
        currentPage = 1;
      }
      
      // Get data for current page
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const pageData = filteredData.slice(startIndex, endIndex);
      
      // data is already sorted by Supabase query
      userTbody.innerHTML = renderRows(pageData, 'user');
      
      // Update pagination controls
      updatePagination();
      
      // Load signed URLs for signature images
      await loadSignatureImages();
    } catch (error) {
      console.error('Error in renderUser:', error);
      userTbody.innerHTML = '<tr><td colspan="11" class="text-center text-red-500 p-4">Error loading data: ' + error.message + '</td></tr>';
      
      // Update pagination controls even on error
      updatePagination();
    }
  }

  // Initial render
  try {
    await renderUser();
  } catch (error) {
    console.error('Initial render failed:', error);
    userTbody.innerHTML = '<tr><td colspan="11" class="text-center text-red-500 p-4">Failed to load data. Please refresh the page.</td></tr>';
  }

  if (userSearch) {
    userSearch.addEventListener('input', () => {
      // Reset to first page when searching
      currentPage = 1;
      // Debounce search for better performance
      clearTimeout(userSearch.timeout);
      userSearch.timeout = setTimeout(renderUser, 300);
    });
  }

  // Rows per page event listener
  if (rowsPerPageSelect) {
    rowsPerPageSelect.addEventListener('change', () => {
      rowsPerPage = parseInt(rowsPerPageSelect.value);
      currentPage = 1; // Reset to first page when changing rows per page
      renderUser();
    });
  }

  // Pagination event listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderUser();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderUser();
      }
    });
  }

  if (prevPageMobileBtn) {
    prevPageMobileBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderUser();
      }
    });
  }

  if (nextPageMobileBtn) {
    nextPageMobileBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderUser();
      }
    });
  }

  function openApproveModal(id) {
    const wrap = document.getElementById("user-approve-wrap");
    const dialog = document.getElementById("user-approve-dialog");

    document.getElementById("approve-id").value = id;
    document.getElementById("approve-nama").value = "";

    wrap.classList.remove("hidden");
    setTimeout(() => {
      dialog.classList.remove("scale-95", "opacity-0");
      dialog.classList.add("scale-100", "opacity-100");
    }, 10);

    // inisialisasi signature
    if (!userSigPad) {
      const canvas = document.getElementById("user-signature");
      resizeCanvas(canvas);
      userSigPad = new SignaturePad(canvas);
    }
    userSigPad.clear();
  }

  function closeApproveModal() {
    const wrap = document.getElementById("user-approve-wrap");
    const dialog = document.getElementById("user-approve-dialog");

    dialog.classList.remove("scale-100", "opacity-100");
    dialog.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      wrap.classList.add("hidden");
    }, 300);
  }

  function showWarning(msg) {
    document.getElementById("warning-message").textContent = msg;
    document.getElementById("modal-warning").classList.remove("hidden");
  }

  // Window functions
  window.openApproveModal = openApproveModal;

  // Event listeners
  if (document.getElementById("approve-cancel")) {
    document.getElementById("approve-cancel").onclick = () => {
      closeApproveModal();
    };
  }

  if (userSignClear) {
    userSignClear.addEventListener('click', ()=> {
      if (userSigPad) userSigPad.clear();
    });
  }

  if (approveForm) {
    approveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = approveId.value;
      const nama = approveNama.value.trim();

      if (!nama) {
        showWarning("Nama penerima wajib diisi.");
        return;
      }
      if (!userSigPad || userSigPad.isEmpty()) {
        showWarning("Silakan tanda tangan terlebih dahulu.");
        return;
      }

      // Convert signature to blob for upload
      const dataUrl = userSigPad.toDataURL('image/png');
      const blob = await fetch(dataUrl).then(res => res.blob());
      
      // Upload signature to Supabase Storage
      const fileName = `signature_user_${id}.png`;
      const signatureFileName = await uploadSignature(blob, fileName);
      
      if (!signatureFileName) {
        showWarning("Gagal mengunggah tanda tangan. Silakan coba lagi.");
        return;
      }

      // Update letter in Supabase
      const updates = {
        penerima: nama,
        bukti_ttd_url: signatureFileName, // Store filename, not URL
        tanggal_diterima: new Date().toISOString(), // Full timestamp with timezone
        status: 'Diterima'
      };

      const result = await updateLetter(id, updates);
      
      if (result) {
        closeApproveModal();
        await renderUser();
      } else {
        showWarning("Gagal menyimpan data. Silakan coba lagi.");
      }
    });
  }

  if (document.getElementById("btnCloseWarning")) {
    document.getElementById("btnCloseWarning").onclick = () => {
      document.getElementById("modal-warning").classList.add("hidden");
    };
  }

  // Logout button
  if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', async () => {
      await signOut();
      localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'login' }));
      window.location.href = 'login.html';
    });
  }

  // To Login button
  if (document.getElementById('btnToLogin')) {
    document.getElementById('btnToLogin').addEventListener('click', async () => {
      await signOut();
      localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'login' }));
      window.location.href = 'login.html';
    });
  }

  // Handle window resize for signature pad
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("user-signature");
    if (canvas) {
      resizeCanvas(canvas);
      if (userSigPad) userSigPad.clear();
    }
  });
});