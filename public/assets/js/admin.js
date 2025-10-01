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

  // Store signature data for upload
  let signatureData = null;

  function resetAdminForm(){
    adminForm.reset(); 
    fId.value = '';
    adminSignPreview.src = '';
    if (adminSigPad) adminSigPad.clear();
    signatureData = null;
    // Set default date for required field, leave optional field empty
    fTanggal.valueAsDate = new Date();
    fTanggalDiterima.value = '';
  }

  async function renderAdmin(){
    console.log('renderAdmin called');
    try {
      const q = adminSearch.value?.trim().toLowerCase() || '';
      console.log('Search query:', q);
      
      let data = await getLetters();
      console.log('Raw data from getLetters():', data);
      
      if (q) {
        data = data.filter(d => [d.nomor,d.perihal,d.penerima,d.tujuan_surat,d.tanggal_pengiriman].some(x => (x||'').toLowerCase().includes(q)));
        console.log('Filtered data:', data);
      }
      
      // data is already sorted by Supabase query
      const renderedHtml = renderRows(data, 'admin');
      console.log('Rendered HTML length:', renderedHtml.length);
      adminTbody.innerHTML = renderedHtml;
      console.log('Table updated with', data.length, 'rows');
      
      // Load signed URLs for signature images
      await loadSignatureImages();
    } catch (error) {
      console.error('Error in renderAdmin:', error);
      adminTbody.innerHTML = '<tr><td colspan="11" class="text-center text-red-500 p-4">Error loading data: ' + error.message + '</td></tr>';
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
        if (!fTanggal.value) {
          alert('Tanggal pengiriman harus diisi!');
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
  tanggal_diterima: fTanggalDiterima.value || null,
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
    fTanggalDiterima.value = doc.tanggal_diterima || '';
    fPerihal.value = doc.perihal || '';
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
});