// ========================= ADMIN =========================
// Load shared utilities
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Admin page loaded');
  
  // Verify Supabase is available
  if (!window._supabase) {
    console.error('Supabase client not available!');
    alert('Database connection error. Please check the console.');
    return;
  }
  console.log('Supabase client available');
  
  // Check if user is logged in
  console.log('Checking user authentication...');
  const user = await checkUser();
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  console.log('User authenticated:', user.email);

  // Initialize option selectors
  fillOptions(document.getElementById('f-jenis'), jenisOptions);
  fillOptions(document.getElementById('f-kategori'), kategoriOptions);
  fillOptions(document.getElementById('f-tujuan'), tujuanOptions);
  
  // Initialize searchable dropdowns
  initSearchableDropdown('jenis', jenisOptions);
  initSearchableDropdown('kategori', kategoriOptions);
  initSearchableDropdown('tujuan', tujuanOptions);

  // Admin elements
  const adminTbody = document.getElementById('admin-tbody');
  const adminSearch = document.getElementById('admin-search');
  const adminFormWrap = document.getElementById('admin-form-wrap');
  const adminForm = document.getElementById('admin-form');
  const btnAdd = document.getElementById('btnAdd');
  const btnCancelForm = document.getElementById('btnCancelForm');
  const formTitle = document.getElementById('form-title');

  const fId = document.getElementById('form-id');
  const fNomor = document.getElementById('f-nomor');
  const fTanggal = document.getElementById('f-tanggal');
  const fTanggalDiterima = document.getElementById('f-tanggal-diterima');
  const fPerihal = document.getElementById('f-perihal');
  const fJenis = document.getElementById('f-jenis');
  const fKategori = document.getElementById('f-kategori');
  const fTujuan = document.getElementById('f-tujuan');
  const fPenerima = document.getElementById('f-penerima');
  const fStatus = document.getElementById('f-status');

  const adminSignCanvas = document.getElementById('admin-signature');
  const adminSignClear = document.getElementById('admin-sign-clear');
  const adminSignPreview = document.getElementById('admin-sign-preview');

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

  function resetAdminForm(){
    adminForm.reset(); 
    fId.value = '';
    adminSignPreview.src = '';
    if (adminSigPad) adminSigPad.clear();
    signatureData = null;
    // Set default date for required field, leave optional field empty
    fTanggal.value = '';
    fTanggalDiterima.value = '';
    
    // Reset searchable dropdowns
    document.getElementById('jenis-select-input').value = '';
    document.getElementById('kategori-select-input').value = '';
    document.getElementById('tujuan-select-input').value = '';
    
    // Reset hidden selects
    fJenis.value = '';
    fKategori.value = '';
    fTujuan.value = '';
  }

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
      pageBtn.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0 ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderAdmin();
      });
      pageNumbersContainer.appendChild(pageBtn);
    }
  }
  
  async function renderAdmin(){
    console.log('renderAdmin called');
    try {
      const q = adminSearch.value?.trim().toLowerCase() || '';
      console.log('Search query:', q);
      
      // Only fetch all data if we haven't already
      if (allData.length === 0) {
        allData = await getLetters();
        console.log('Raw data from getLetters():', allData);
      }
      
      // Filter data based on search query
      if (q) {
        filteredData = allData.filter(d => [d.nomor,d.perihal,d.penerima,d.tujuan_surat,d.tanggal_pengiriman].some(x => (x||'').toLowerCase().includes(q)));
        console.log('Filtered data:', filteredData);
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
      const renderedHtml = renderRows(pageData, 'admin');
      console.log('Rendered HTML length:', renderedHtml.length);
      adminTbody.innerHTML = renderedHtml;
      console.log('Table updated with', pageData.length, 'rows');
      
      // Update pagination controls
      updatePagination();
      
      // Load signed URLs for signature images
      await loadSignatureImages();
    } catch (error) {
      console.error('Error in renderAdmin:', error);
      adminTbody.innerHTML = '<tr><td colspan="11" class="text-center text-red-500 p-4">Error loading data: ' + error.message + '</td></tr>';
      
      // Update pagination controls even on error
      updatePagination();
    }
  }

  // Initial render
  console.log('Starting initial render...');
  try {
    await renderAdmin();
    console.log('Initial render completed successfully');
  } catch (error) {
    console.error('Initial render failed:', error);
    adminTbody.innerHTML = '<tr><td colspan="11" class="text-center text-red-500 p-4">Failed to load data. Please refresh the page.</td></tr>';
  }

  // Event listeners
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      formTitle.textContent = 'Tambah Surat';
      resetAdminForm();
      adminFormWrap.classList.remove('hidden');
      if (!adminSigPad) initSignaturePad(adminSignCanvas, (p)=>adminSigPad=p);
    });
  }

  if (btnCancelForm) {
    btnCancelForm.addEventListener('click', () => {
      adminFormWrap.classList.add('hidden');
    });
  }

  if (adminSignClear) {
    adminSignClear.addEventListener('click', () => {
      if (adminSigPad) adminSigPad.clear();
      signatureData = null;
    });
  }

  // Rows per page event listener
  if (rowsPerPageSelect) {
    rowsPerPageSelect.addEventListener('change', () => {
      rowsPerPage = parseInt(rowsPerPageSelect.value);
      currentPage = 1; // Reset to first page when changing rows per page
      renderAdmin();
    });
  }

  // Pagination event listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderAdmin();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderAdmin();
      }
    });
  }

  if (prevPageMobileBtn) {
    prevPageMobileBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderAdmin();
      }
    });
  }

  if (nextPageMobileBtn) {
    nextPageMobileBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderAdmin();
      }
    });
  }

  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = adminForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Menyimpan...';
      
      try {
        const id = fId.value || crypto.randomUUID();
        const isEdit = !!fId.value;
        
        console.log('Saving letter:', isEdit ? 'Edit' : 'Add', 'ID:', id);
        
        // Basic validation
        if (!fNomor.value?.trim()) {
          alert('Nomor surat harus diisi!');
          return;
        }
        if (!fPerihal.value?.trim()) {
          alert('Perihal harus diisi!');
          return;
        }
        
 const letterData = {
  id: id,
  nomor: fNomor.value?.trim() || null,
  tanggal_pengiriman: fTanggal.value || null,
  perihal: fPerihal.value?.trim() || null,
  jenis_surat: fJenis.value || null,
  kategori_surat: fKategori.value || null,
  tujuan_surat: fTujuan.value || null,
  penerima: fPenerima.value?.trim() || null,
  bukti_ttd_url: null,
  tanggal_diterima: fTanggalDiterima.value ? new Date(fTanggalDiterima.value).toISOString() : null,
  status: fStatus.value || "Menunggu"
};

console.log('Letter data prepared:', letterData);


      // Handle signature
      let signatureFileName = signatureData || '';
      
      // if admin draws a new signature, save it
      if (adminSigPad && !adminSigPad.isEmpty()) {
        // Convert signature to blob for upload
        const dataUrl = adminSigPad.toDataURL('image/png');
        const blob = await fetch(dataUrl).then(res => res.blob());
        
        // Upload signature to Supabase Storage
        const fileName = `signature_${id}.png`;
        signatureFileName = await uploadSignature(blob, fileName);
        
        if (signatureFileName) {
          letterData.bukti_ttd_url = signatureFileName; // Store filename, not URL
          // Don't automatically set tanggal_diterima here since we have a manual field
        }
      } else if (signatureData && isEdit) {
        // Keep existing signature for edits (extract filename from URL if needed)
        if (signatureData.includes('/')) {
          // If it's a URL, extract filename
          letterData.bukti_ttd_url = signatureData.split('/').pop();
        } else {
          // If it's already a filename
          letterData.bukti_ttd_url = signatureData;
        }
      }

      // Save to Supabase
let result;
if (isEdit) {
  result = await updateLetter(id, letterData);
} else {
  result = await addLetter(letterData);
}

if (result.error) {
  console.error("Error saving:", result.error);
  alert("Gagal menyimpan: " + result.error.message);
} else {
  console.log("Data saved successfully:", result.data);
  adminFormWrap.classList.add('hidden');
  await renderAdmin();
}
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('Terjadi kesalahan: ' + error.message);
      } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
  if (adminSearch) {
    adminSearch.addEventListener('input', () => {
      // Reset to first page when searching
      currentPage = 1;
      // Debounce search for better performance
      clearTimeout(adminSearch.timeout);
      adminSearch.timeout = setTimeout(renderAdmin, 300);
    });
  }

  // Export to Excel
  if (document.getElementById("exportExcel")) {
    document.getElementById("exportExcel").addEventListener("click", async () => {
      try {
        console.log('Starting Excel export...');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Data Surat");
        
        // Add headers first
        const headers = ['Nomor', 'Tgl Pengiriman', 'Perihal', 'Jenis Surat', 'Kategori', 'Tujuan', 'Penerima', 'TTD', 'Tgl Diterima', 'Status'];
        sheet.addRow(headers);
        
        // Style headers
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F3E6' }
        };

        // Get current data directly from Supabase to ensure proper order
        const letters = await getLetters();
        console.log('Excel export: processing', letters.length, 'letters');
        
        let currentRow = 2; // Start from row 2 (after headers)

        for (let i = 0; i < letters.length; i++) {
          const letter = letters[i];
          console.log(`Processing letter ${i + 1}/${letters.length}: ${letter.nomor}`);
          
          // Prepare row data
          const rowData = [
            letter.nomor || '',
            letter.tanggal_pengiriman || '',
            letter.perihal || '',
            letter.jenis_surat || '',
            letter.kategori_surat || '',
            letter.tujuan_surat || '',
            letter.penerima || '',
            '', // Empty cell for signature image
            letter.tanggal_diterima || '',
            letter.status || ''
          ];
          
          // Add the row to Excel
          sheet.addRow(rowData);
          
          // Handle signature image if exists
          if (letter.bukti_ttd_url) {
            try {
              console.log(`Processing signature for row ${currentRow}, letter: ${letter.nomor}`);
              
              // Get signed URL for the signature
              const signedUrl = await getSignedUrl(letter.bukti_ttd_url, 3600);
              
              if (signedUrl) {
                console.log(`Got signed URL for signature: ${signedUrl.substring(0, 50)}...`);
                
                // Load and convert image to base64
                const imageBase64 = await new Promise((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  
                  img.onload = () => {
                    try {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      
                      // Set canvas size
                      canvas.width = img.naturalWidth || 200;
                      canvas.height = img.naturalHeight || 100;
                      
                      // Draw image to canvas
                      ctx.drawImage(img, 0, 0);
                      
                      // Convert to base64
                      const base64 = canvas.toDataURL('image/png').split(',')[1];
                      resolve(base64);
                    } catch (error) {
                      console.error('Error converting image to base64:', error);
                      resolve(null);
                    }
                  };
                  
                  img.onerror = (error) => {
                    console.error(`Failed to load signature image for ${letter.nomor}:`, error);
                    resolve(null);
                  };
                  
                  // Load the image
                  img.src = signedUrl;
                });
                
                if (imageBase64) {
                  // Add image to workbook
                  const imageId = workbook.addImage({
                    base64: imageBase64,
                    extension: 'png',
                  });
                  
                  // Insert image into Excel cell
                  sheet.addImage(imageId, {
                    tl: { col: 7, row: currentRow - 1 }, // TTD column (0-indexed), current row
                    ext: { width: 100, height: 50 },
                    editAs: 'oneCell'
                  });
                  
                  // Set row height to accommodate image
                  sheet.getRow(currentRow).height = 40;
                  
                  console.log(`Successfully added signature to Excel row ${currentRow}`);
                } else {
                  console.warn(`Failed to process signature for ${letter.nomor}`);
                }
              } else {
                console.warn(`No signed URL for signature: ${letter.bukti_ttd_url}`);
              }
            } catch (error) {
              console.error(`Error processing signature for ${letter.nomor}:`, error);
            }
          }
          
          currentRow++;
        }
        
        // Auto-fit columns
        sheet.columns.forEach((column, index) => {
          if (index === 7) { // TTD column
            column.width = 15;
          } else {
            let maxLength = 0;
            column.eachCell({ includeEmpty: false }, (cell) => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
          }
        });

        // Generate and save file
        const buf = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buf]), `data_surat_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        // Show success message
        console.log('Excel export completed successfully');
        alert('Excel file berhasil diexport!');
        
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Gagal export Excel: ' + error.message);
      }
    });
  }

  // Edit document
  window.editDoc = async (id) => {
    const data = await getLetters();
    const doc = data.find(d => d.id === id);
    if (!doc) return;
    formTitle.textContent = 'Edit Surat';
    adminFormWrap.classList.remove('hidden');
    if (!adminSigPad) initSignaturePad(adminSignCanvas, (p)=>adminSigPad=p);
    adminSigPad.clear();

    fId.value = doc.id;
    fNomor.value = doc.nomor || '';
    fTanggal.value = doc.tanggal_pengiriman || '';
    
    // Format datetime for datetime-local input
    if (doc.tanggal_diterima) {
      const date = new Date(doc.tanggal_diterima);
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      fTanggalDiterima.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      fTanggalDiterima.value = '';
    }
    
    fPerihal.value = doc.perihal || '';
    
    // Update searchable dropdowns
    const jenisInput = document.getElementById('jenis-select-input');
    const kategoriInput = document.getElementById('kategori-select-input');
    const tujuanInput = document.getElementById('tujuan-select-input');
    
    jenisInput.value = doc.jenis_surat || jenisOptions[0];
    kategoriInput.value = doc.kategori_surat || kategoriOptions[0];
    tujuanInput.value = doc.tujuan_surat || tujuanOptions[0];
    
    // Update hidden selects
    fJenis.value = doc.jenis_surat || jenisOptions[0];
    fKategori.value = doc.kategori_surat || kategoriOptions[0];
    fTujuan.value = doc.tujuan_surat || tujuanOptions[0];
    
    fPenerima.value = doc.penerima || '';
    fStatus.value = doc.status || 'Menunggu';
    
    // Handle signature preview with signed URL
    if (doc.bukti_ttd_url) {
      try {
        const signedUrl = await getSignedUrl(doc.bukti_ttd_url, 3600);
        if (signedUrl) {
          adminSignPreview.src = signedUrl;
        } else {
          adminSignPreview.src = '';
        }
      } catch (error) {
        console.error('Error loading signature for edit:', error);
        adminSignPreview.src = '';
      }
      signatureData = doc.bukti_ttd_url; // Store filename for editing
    } else {
      adminSignPreview.src = '';
      signatureData = null;
    }
  };

  // Delete document
  let deleteId = null;

  window.deleteDoc = (id) => {
    deleteId = id;
    document.getElementById("modal-delete").classList.remove("hidden");
  };

  // tombol batal → tutup modal
  if (document.getElementById("btnCancelDelete")) {
    document.getElementById("btnCancelDelete").onclick = () => {
      document.getElementById("modal-delete").classList.add("hidden");
    };
  }

  // tombol hapus → hapus data
  if (document.getElementById("btnConfirmDelete")) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const result = await deleteLetter(deleteId);
      if (result.success) {
        await renderAdmin(); // render ulang tabel
        document.getElementById("modal-delete").classList.add("hidden");
      } else {
        console.error('Delete error:', result.error);
        alert('Gagal menghapus data: ' + (result.error?.message || 'Unknown error'));
      }
    };
  }

  // Shared logout function for consistency
  async function handleLogout() {
    try {
      await signOut();
      console.log('User logged out successfully');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  }

  // Make handleLogout available globally for sidebar
  window.handleLogout = handleLogout;

  // Logout button
  if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', handleLogout);
  }

  // To Login button
  if (document.getElementById('btnToLogin')) {
    document.getElementById('btnToLogin').addEventListener('click', handleLogout);
  }

  // To User Page button
  if (document.getElementById('btnToUser')) {
    document.getElementById('btnToUser').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  
  // Initialize searchable dropdown
  function initSearchableDropdown(type, options) {
    const container = document.getElementById(`${type}-select-container`);
    const display = document.getElementById(`${type}-select-display`);
    const input = document.getElementById(`${type}-select-input`);
    const dropdown = document.getElementById(`${type}-select-dropdown`);
    const searchInput = document.getElementById(`${type}-select-search`);
    const optionsContainer = document.getElementById(`${type}-select-options`);
    const hiddenSelect = document.getElementById(`f-${type}`);
    
    // Populate options
    function populateOptions(filteredOptions) {
      optionsContainer.innerHTML = '';
      filteredOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'custom-select-option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => {
          input.value = option;
          hiddenSelect.value = option;
          dropdown.classList.remove('active');
          
          // Highlight selected option
          optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          optionElement.classList.add('selected');
        });
        optionsContainer.appendChild(optionElement);
      });
    }
    
    // Filter options based on search input
    function filterOptions(searchTerm) {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      populateOptions(filtered);
    }
    
    // Initialize with all options
    populateOptions(options);
    
    // Toggle dropdown visibility
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      
      // Position dropdown above input if it would go off screen
      const rect = dropdown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        dropdown.style.top = 'auto';
        dropdown.style.bottom = '100%';
      } else {
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
    
    // Handle search input
    searchInput.addEventListener('input', () => {
      filterOptions(searchInput.value);
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
    });
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstOption = optionsContainer.querySelector('.custom-select-option');
        if (firstOption) {
          firstOption.click();
        }
      }
    });
    
    // Set initial value if exists
    if (hiddenSelect.value) {
      input.value = hiddenSelect.value;
      const optionElements = optionsContainer.querySelectorAll('.custom-select-option');
      optionElements.forEach(optionElement => {
        if (optionElement.textContent === hiddenSelect.value) {
          optionElement.classList.add('selected');
        }
      });
    }
  }
});