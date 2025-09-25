// ========================= UTILS =========================
const jenisOptions = [
  'Intern',
  'LHA',
  'Memorandum',
  'Surat Dinas-Surat Tugas',
  'Surat Dinas - Surat dari Head Office ke Regional',
  'Surat Dinas - Surat dari Head Office ke Unit',
  'Surat Dinas - Surat ke Anak Perusahaan',
  'Surat Dinas - Surat ke Pihak Departemen',
  'Surat Dinas - Surat ke Pihak Luar selain Departemen',
  'Surat Dinas - Surat ke Personal',
  'Keputusan Direksi'
];

const kategoriOptions = ['Surat Elektronik', 'Surat Manual', 'Surat Masuk', 'LHA'];

const tujuanOptions = [
  'Divisi Satuan Pengawasan Intern',
  'Divisi Sekretariat Perusahaan',
  'Divisi Strategi & Transofmasi Korporasi',
  'Divisi Komoditi Karet',
  'Divisi Komoditi Kopi & Aneka Tanaman',
  'Divisi Komoditi Teh & Kemitraan',
  'Divisi Manajemen Aset I',
  'Divisi Manajemen Aset II',
  'Divisi Pemasaran',
  'Divisi Akuntansi & Perpajakan',
  'Divisi Perbendaharaan Anggaran & Keuangan',
  'Divisi Pengelolaan Anak Perusahaan & Kinerja Korporasi',
  'Divisi Pengembangan SDM & Budaya Perusahaan',
  'Divisi Operasional SDM & General Affair',
  'Divisi Pengadaan & Teknologi Informasi'
];

function fillOptions(sel, arr){
  sel.innerHTML = arr.map(v => `<option value="${v}">${v}</option>`).join('');
}

function badge(status){
  const isOk = status === 'Diterima';
  const cls = isOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  return `<span class="px-2 py-1 rounded text-xs ${cls}">${status}</span>`;
}

function escapeHtml(str){
  if (str==null) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

let adminSigPad = null;
let userSigPad = null;

function initSignaturePad(canvas, setRef) {
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  const pad = new SignaturePad(canvas, { throttle: 16 }); // normal sensitivity
  setRef(pad);
}

function resizeCanvas(canvas) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
}

function renderRows(arr, role) {
  return arr.map(doc => {
    return `
      <tr class="align-top">
        <td class="border p-2 align-middle"><div class="truncate" title="${escapeHtml(doc.nomor)}">${escapeHtml(doc.nomor)}</div></td>
        <td class="border p-2 align-middle text-gray-600">${escapeHtml(doc.tanggal_pengiriman || '-')}</td>
        <td class="border p-2 align-middle"><div class="truncate" title="${escapeHtml(doc.perihal || '-')}" >${escapeHtml(doc.perihal || '-')}</div></td>
        <td class="border p-2 align-middle">${escapeHtml(doc.jenis_surat || '-')}</td>
        <td class="border p-2 align-middle">${escapeHtml(doc.kategori_surat || '-')}</td>
        <td class="border p-2 align-middle"><div class="truncate" title="${escapeHtml(doc.tujuan_surat || '-')}" >${escapeHtml(doc.tujuan_surat || '-')}</div></td>
        <td class="border p-2 align-middle">${escapeHtml(doc.penerima || '-')}</td>
        <td class="border p-2 align-middle text-center" data-signature="${doc.bukti_ttd_url || ''}">${doc.bukti_ttd_url ? `<img data-filename="${doc.bukti_ttd_url}" alt="ttd" class="h-10 w-20 inline-block object-contain border rounded signature-img" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDJDNS41ODEgMiAyIDUuNTgxIDIgMTBTNS41ODEgMTggMTAgMThTMTggMTQuNDE5IDE4IDEwUzE0LjQxOSAyIDEwIDJaTTEzLjUgMTBDMTMuNSA4LjYxOSAxMi4zODEgNy41IDExIDcuNUg5QzcuNjE5IDcuNSA2LjUgOC42MTkgNi41IDEwUzcuNjE5IDEyLjUgOSAxMi41SDExQzEyLjM4MSAxMi41IDEzLjUgMTEuMzgxIDEzLjUgMTBaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=">` : '-'}</td>
        <td class="border p-2 align-middle text-gray-600">${escapeHtml(doc.tanggal_diterima || '-')}</td>
        <td class="border p-2 align-middle text-center">${badge(doc.status)}</td>
        <td class="border px-4 py-2 align-middle text-center">
          ${ role==='admin' ? `
            <div class="inline-flex items-center justify-center gap-2 whitespace-nowrap">
              <button onclick="editDoc('${doc.id}')" class="bg-blue-600 text-white px-2 py-1 text-sm rounded hover:bg-blue-700">Edit</button>
              <button onclick="deleteDoc('${doc.id}')" class="bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700">Hapus</button>
            </div>
          ` : `
            <div class="inline-flex items-center justify-center gap-2 whitespace-nowrap">
              ${doc.status === 'Diterima' ? `
                <span class="text-xs text-gray-500">Sudah diterima</span>
              ` : `
                <button onclick="openApproveModal('${doc.id}')" 
class="bg-[#1DC82B] text-white px-2 py-1 text-sm rounded hover:opacity-90">
Approve
</button>
              `}
            </div>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// Helper function to load signed URLs for signature images
async function loadSignatureImages() {
  const signatureImages = document.querySelectorAll('.signature-img');
  
  for (const img of signatureImages) {
    const fileName = img.getAttribute('data-filename');
    if (fileName) {
      try {
        const signedUrl = await getSignedUrl(fileName, 3600); // 1 hour expiry
        if (signedUrl) {
          img.src = signedUrl;
        } else {
          // If signed URL fails, show placeholder
          img.style.display = 'none';
          img.parentElement.innerHTML = '-';
        }
      } catch (error) {
        console.error('Error loading signature:', error);
        img.style.display = 'none';
        img.parentElement.innerHTML = '-';
      }
    }
  }
}