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

  async function renderUser(){
    const q = userSearch.value?.trim().toLowerCase() || '';
    let data = await getLetters();
    if (q) {
      data = data.filter(d => [d.nomor,d.perihal,d.penerima,d.tujuan_surat,d.tanggal_pengiriman].some(x => (x||'').toLowerCase().includes(q)));
    }
    // data is already sorted by Supabase query
    userTbody.innerHTML = renderRows(data, 'user');
    
    // Load signed URLs for signature images
    await loadSignatureImages();
  }

  // Initial render
  await renderUser();

  if (userSearch) {
    userSearch.addEventListener('input', () => {
      // Debounce search for better performance
      clearTimeout(userSearch.timeout);
      userSearch.timeout = setTimeout(renderUser, 300);
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