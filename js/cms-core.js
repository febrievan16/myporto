/**
 * =============================================================================
 * FEB-CMS CORE: HYBRID STORAGE (PHP+JSON / LOCALSTORAGE) & RETRO PIXEL ADMIN UI
 * Digunakan bersama oleh portofolio_3d_isometric_achmad_febri.html & admin.html
 * =============================================================================
 */
(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    DATA: 'febporto_cms_data_v1',
    MESSAGES: 'febporto_cms_messages_v1',
    LOCAL_PASS_LEGACY: 'febporto_cms_pass_v1',
    LOCAL_PASS_HASH: 'febporto_cms_pass_hash_v2',
    LOCAL_AUTH: 'febporto_cms_auth_session_v1',
  };

  const DEFAULT_DATA = {
    profile: {
      initials: 'AF',
      name: 'Achmad Febri',
      ageLabel: '31 TAHUN',
      hudSubtitle: 'LV.31 · IT Programmer & Network Eng · RSI Siti Hajar',
      role: 'IT Programmer & Network Engineer',
      company: 'RSI Siti Hajar',
      bio: 'Bertugas di RSI Siti Hajar — berfokus pada pengembangan sistem informasi layanan kesehatan, integrasi aplikasi, serta keandalan infrastruktur jaringan & server rumah sakit.',
      highlights: [
        { label: 'Instansi', value: 'RSI Siti Hajar' },
        { label: 'Peran Ganda', value: 'Programmer & NetEng' },
        { label: 'Fokus Utama', value: 'High Availability IT' },
      ],
      skills: [
        {
          id: 'sk-1',
          title: 'Web Development',
          description: 'Pengembangan aplikasi web modern (PHP/Laravel, JavaScript/ES2022+, REST API, Integrasi SIMRS & Bridging layanan kesehatan).',
        },
        {
          id: 'sk-2',
          title: 'Network Infrastructure',
          description: 'Perancangan topologi VLAN, Routing & Switching (MikroTik/Cisco), Wi-Fi Enterprise, VPN Site-to-Site, dan manajemen bandwidth.',
        },
        {
          id: 'sk-3',
          title: 'Server & Security',
          description: 'Administrasi Linux Server, virtualisasi (Proxmox/VMware), firewall hardening, otomasi backup, serta strategi failover.',
        },
        {
          id: 'sk-4',
          title: 'Database Optimization',
          description: 'Tuning query MySQL/MariaDB & PostgreSQL, indexing transaksi klinis bervolume tinggi, serta replikasi data real-time.',
        },
      ],
    },
    projects: [
      {
        id: 'prj-1',
        badge: 'SISTEM INFORMASI RS',
        badgeColor: 'emerald',
        meta: 'API · Backend · Database',
        title: 'Integrasi Aplikasi Layanan & SIMRS',
        description: 'Membangun jembatan integrasi (bridging service) antara SIMRS internal RSI Siti Hajar dengan sistem antrean poliklinik, pendaftaran online pasien, serta pertukaran data layanan eksternal secara aman dan terukur.',
        tags: ['REST API', 'Laravel / PHP', 'MySQL Indexing', 'Queue Worker'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'prj-2',
        badge: 'INFRASTRUKTUR JARINGAN',
        badgeColor: 'sky',
        meta: 'VLAN · Redundansi · Security',
        title: 'Arsitektur Jaringan VLAN & Redundansi Server RSI',
        description: 'Merancang ulang segmentasi jaringan rumah sakit menjadi VLAN terisolasi (Medis/IGD, Server Core, Administrasi, dan Wi-Fi Publik) disertai dual-ISP failover dan replikasi server untuk meminimalkan downtime operasional 24/7.',
        tags: ['MikroTik Core', 'VLAN 802.1Q', 'Proxmox HA', 'Failover Dual ISP'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'prj-3',
        badge: 'OBSERVABILITY & OPS',
        badgeColor: 'indigo',
        meta: 'Monitoring · Alerting',
        title: 'Sistem Monitoring Jaringan & Server Real-time',
        description: 'Dashboard pemantauan kesehatan switch, access point, trafik bandwidth, serta beban CPU/RAM server secara real-time lengkap dengan notifikasi otomatis ke tim IT saat terjadi anomali atau link putus.',
        tags: ['SNMP Telemetry', 'Grafana / Prometheus', 'Bot Alerting'],
        imageUrl: '',
        linkUrl: '',
      },
    ],
    portfolios: [
      {
        id: 'ptf-1',
        title: 'Portal Antrean & Check-in Poliklinik',
        category: 'web',
        categoryLabel: 'Web Dev',
        description: 'Aplikasi web responsif untuk display antrean ruang tunggu dan integrasi registrasi pasien secara real-time.',
        tags: ['Laravel', 'WebSocket', 'Tailwind CSS'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'ptf-2',
        title: 'Dashboard Rekapitulasi Layanan Medis',
        category: 'web',
        categoryLabel: 'Web Dev',
        description: 'Panel analitik manajemen untuk memantau kunjungan harian, utilisasi ruang rawat inap, dan laporan eksekutif.',
        tags: ['JavaScript ES2022', 'REST API', 'MySQL'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'ptf-3',
        title: 'Segmentasi Core VLAN & Firewall RS',
        category: 'network',
        categoryLabel: 'Network & Infra',
        description: 'Implementasi pemisahan trafik klinis, IP-PBX, CCTV, dan jaringan tamu guna menjaga stabilitas serta keamanan data.',
        tags: ['MikroTik', 'VLAN 802.1Q', 'Firewall'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'ptf-4',
        title: 'Cluster Virtualisasi & Backup Otomatis',
        category: 'network',
        categoryLabel: 'Network & Infra',
        description: 'Konsolidasi server aplikasi dan database pada Proxmox VE dengan jadwal snapshot terenkripsi lintas storage.',
        tags: ['Proxmox VE', 'Linux', 'Disaster Recovery'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'ptf-5',
        title: 'Sistem Tiketing Helpdesk IT Internal',
        category: 'web',
        categoryLabel: 'Web Dev',
        description: 'Aplikasi pelaporan kendala perangkat & jaringan antar unit rumah sakit lengkap dengan SLA tracking.',
        tags: ['PHP', 'PostgreSQL', 'PWA'],
        imageUrl: '',
        linkUrl: '',
      },
      {
        id: 'ptf-6',
        title: 'NMS Monitoring Link & Uptime 24/7',
        category: 'network',
        categoryLabel: 'Network & Infra',
        description: 'Pemantauan latensi, suhu server, dan status port switch di seluruh gedung dengan notifikasi instan.',
        tags: ['SNMP', 'Grafana', 'Alerting'],
        imageUrl: '',
        linkUrl: '',
      },
    ],
    experiences: [
      {
        id: 'exp-1',
        period: '2021 – Sekarang',
        role: 'IT Programmer & Network Engineer',
        company: 'RSI Siti Hajar',
        location: 'Sidoarjo',
        isCurrent: true,
        description:
          'Mengembangkan sistem informasi layanan kesehatan (SIMRS, bridging API, aplikasi web internal) serta merancang & memelihara infrastruktur jaringan VLAN, server Proxmox HA, dan monitoring 24/7.',
        tags: ['PHP / Laravel', 'SIMRS Bridging', 'MikroTik & VLAN', 'Proxmox HA'],
      },
      {
        id: 'exp-2',
        period: '2019 – 2021',
        role: 'Web Developer & IT Support',
        company: 'Proyek Mandiri & Instansi',
        location: 'Sidoarjo / Surabaya',
        isCurrent: false,
        description:
          'Membangun aplikasi web custom (layanan tiket event, manajemen data, profil instansi) serta menangani instalasi dan pemeliharaan jaringan LAN/Wi-Fi.',
        tags: ['Web Development', 'MySQL', 'LAN / Wi-Fi', 'Troubleshooting'],
      },
    ],
    contact: {
      location: 'RSI Siti Hajar, Sidoarjo',
      email: 'febrievan16@gmail.com',
      instagram: 'https://instagram.com/achmadfebri',
      linkedin: 'https://linkedin.com/in/achmadfebri',
      github: 'https://github.com/achmadfebri',
      topics: [
        'Pengembangan Web / Aplikasi',
        'Konsultasi Jaringan & Server',
        'Kolaborasi Proyek IT',
      ],
    },
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function genId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function sanitizeUrl(url) {
    const trimmed = String(url ?? '').trim();
    if (!trimmed) return '';
    if (/^(https?:\/\/|uploads\/|data:image\/)/i.test(trimmed)) {
      return trimmed;
    }
    return '';
  }

  // ===========================================================================
  // HYBRID STORAGE ENGINE (PHP API <-> LOCALSTORAGE FALLBACK) + SECURITY LAYER
  // ===========================================================================
  let storageMode = 'local'; // 'server' | 'local'
  let modeDetected = false;
  let csrfToken = '';
  let securityInfo = {
    isDefaultPassword: false,
    hashAlgo: 'Argon2id',
  };

  // Salted SHA-256 hash untuk mode offline (tidak pernah menyimpan plaintext di LocalStorage)
  async function hashLocalPassword(plain) {
    const salted = `febporto_sec_v2::${String(plain)}`;
    if (global.crypto && global.crypto.subtle) {
      const data = new TextEncoder().encode(salted);
      const buf = await global.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Fallback deterministic non-plaintext hash jika dijalankan di konteks non-HTTPS file://
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < salted.length; i++) {
      const ch = salted.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'fb_' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  async function getLocalPasswordHash() {
    let storedHash = localStorage.getItem(STORAGE_KEYS.LOCAL_PASS_HASH);
    if (!storedHash) {
      // Migrasi otomatis & hapus key plaintext lama jika masih ada
      const legacyPlain = localStorage.getItem(STORAGE_KEYS.LOCAL_PASS_LEGACY) || 'admin123';
      storedHash = await hashLocalPassword(legacyPlain);
      localStorage.setItem(STORAGE_KEYS.LOCAL_PASS_HASH, storedHash);
      localStorage.removeItem(STORAGE_KEYS.LOCAL_PASS_LEGACY);
    }
    return storedHash;
  }

  async function apiFetch(action, options = {}) {
    const headers = { ...(options.headers || {}) };
    const method = String(options.method || 'GET').toUpperCase();
    if (method !== 'GET' && csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const res = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
      credentials: 'same-origin',
      ...options,
      headers,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Server PHP tidak merespons JSON valid.');
    }
    if (json && typeof json.csrfToken === 'string' && json.csrfToken) {
      csrfToken = json.csrfToken;
    }
    if (json && typeof json.isDefaultPassword === 'boolean') {
      securityInfo.isDefaultPassword = json.isDefaultPassword;
    }
    if (json && typeof json.hashAlgo === 'string') {
      securityInfo.hashAlgo = json.hashAlgo;
    }
    if (!res.ok || json.ok === false) {
      const err = new Error(json.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return json;
  }

  async function detectStorageMode() {
    if (modeDetected) return storageMode;
    modeDetected = true;
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      try {
        await apiFetch('check_auth');
        storageMode = 'server';
        return storageMode;
      } catch {
        storageMode = 'local';
        return storageMode;
      }
    }
    storageMode = 'local';
    return storageMode;
  }

  function normalizeData(data) {
    if (!data || typeof data !== 'object') return deepClone(DEFAULT_DATA);
    if (!Array.isArray(data.experiences)) {
      data.experiences = deepClone(DEFAULT_DATA.experiences);
    }
    return data;
  }

  async function loadData() {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      try {
        const res = await apiFetch('get_data');
        if (res.data && res.data.profile) {
          const normalized = normalizeData(res.data);
          localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(normalized));
          return normalized;
        }
      } catch (err) {
        console.warn('Gagal muat dari server, pakai fallback lokal:', err);
      }
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profile && Array.isArray(parsed.projects) && Array.isArray(parsed.portfolios)) {
          return normalizeData(parsed);
        }
      }
    } catch {
      // ignore corrupted local storage
    }
    return deepClone(DEFAULT_DATA);
  }

  async function saveData(data) {
    const mode = await detectStorageMode();
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
    if (mode === 'server') {
      await apiFetch('save_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      return { mode: 'server', message: 'Disimpan ke server (data/portfolio_data.json)' };
    }
    return { mode: 'local', message: 'Disimpan ke LocalStorage browser (mode offline)' };
  }

  async function checkAuth() {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const res = await apiFetch('check_auth');
      return Boolean(res.authenticated);
    }
    return sessionStorage.getItem(STORAGE_KEYS.LOCAL_AUTH) === '1';
  }

  async function login(password) {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      await apiFetch('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return true;
    }
    const storedHash = await getLocalPasswordHash();
    const inputHash = await hashLocalPassword(password);
    if (inputHash === storedHash) {
      sessionStorage.setItem(STORAGE_KEYS.LOCAL_AUTH, '1');
      const defHash = await hashLocalPassword('admin123');
      securityInfo.isDefaultPassword = storedHash === defHash;
      securityInfo.hashAlgo = 'Salted SHA-256';
      return true;
    }
    throw new Error('Password / PIN Admin salah.');
  }

  async function logout() {
    const mode = await detectStorageMode();
    sessionStorage.removeItem(STORAGE_KEYS.LOCAL_AUTH);
    if (mode === 'server') {
      await apiFetch('logout', { method: 'POST' }).catch(() => {});
      csrfToken = '';
    }
  }

  async function changePassword(currentPassword, newPassword) {
    const cleanNew = String(newPassword || '').trim();
    if (cleanNew.length < 8) {
      throw new Error('Password baru minimal 8 karakter.');
    }
    if (cleanNew === currentPassword) {
      throw new Error('Password baru tidak boleh sama dengan password lama.');
    }
    const mode = await detectStorageMode();
    if (mode === 'server') {
      await apiFetch('change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword: cleanNew }),
      });
      return true;
    }
    const storedHash = await getLocalPasswordHash();
    const currHash = await hashLocalPassword(currentPassword);
    if (currHash !== storedHash) {
      throw new Error('Password lama tidak sesuai.');
    }
    const nextHash = await hashLocalPassword(cleanNew);
    localStorage.setItem(STORAGE_KEYS.LOCAL_PASS_HASH, nextHash);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_PASS_LEGACY);
    securityInfo.isDefaultPassword = false;
    return true;
  }

  async function uploadImage(file) {
    if (!file) throw new Error('File gambar tidak ditemukan.');
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Ukuran gambar maksimal 2 MB.');
    }
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiFetch('upload_image', {
        method: 'POST',
        body: formData,
      });
      return res.url;
    }
    // Offline fallback: konversi ke Data URL Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  }

  function getLocalMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  async function sendMessage({ name, email, topic, message }) {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const res = await apiFetch('send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      });
      return res.entry;
    }
    const entry = {
      id: genId('msg'),
      name,
      email,
      topic,
      message,
      read: false,
      created_at: new Date().toLocaleString('id-ID'),
    };
    const list = getLocalMessages();
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    return entry;
  }

  async function getMessages() {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const res = await apiFetch('get_messages');
      return res.messages || [];
    }
    return getLocalMessages();
  }

  async function markMessageRead(id) {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const res = await apiFetch('mark_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return res.messages || [];
    }
    const list = getLocalMessages().map((m) => (m.id === id ? { ...m, read: true } : m));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    return list;
  }

  async function deleteMessage(id) {
    const mode = await detectStorageMode();
    if (mode === 'server') {
      const res = await apiFetch('delete_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return res.messages || [];
    }
    const list = getLocalMessages().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    return list;
  }

  // ===========================================================================
  // MOUNT RETRO PIXEL ADMIN PANEL UI (REUSABLE DI MODAL & ADMIN.HTML)
  // ===========================================================================
  async function mountAdminPanel(rootEl, options = {}) {
    if (!rootEl) return;

    const onDataUpdated = typeof options.onDataUpdated === 'function' ? options.onDataUpdated : () => {};
    const onToast = typeof options.onToast === 'function' ? options.onToast : () => {};

    let mode = await detectStorageMode();
    let authenticated = await checkAuth();
    let draftData = deepClone(await loadData());
    let messages = authenticated ? await getMessages().catch(() => []) : [];
    let activeTab = 'profil'; // 'profil' | 'pengalaman' | 'project' | 'portofolio' | 'kontak' | 'pengaturan'
    let editingExpId = null;
    let editingProjectId = null;
    let editingPortfolioId = null;
    let editingSkillId = null;
    let statusMsg = '';
    let statusType = 'info'; // 'info' | 'ok' | 'err'

    function setStatus(msg, type = 'ok') {
      statusMsg = msg;
      statusType = type;
      onToast(msg);
      const bar = rootEl.querySelector('[data-admin-status]');
      if (bar) {
        bar.textContent = msg;
        bar.className = `px-3 py-1.5 text-xs font-bold border-2 border-slate-900 ${
          type === 'err' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900'
        }`;
        bar.classList.remove('hidden');
      }
    }

    async function persistDraft(successText = 'Perubahan berhasil disimpan!') {
      try {
        const res = await saveData(draftData);
        onDataUpdated(deepClone(draftData));
        setStatus(`${successText} (${res.mode === 'server' ? 'Server JSON' : 'LocalStorage'})`, 'ok');
      } catch (err) {
        if (err && err.status === 401) {
          authenticated = false;
          render();
          onToast('Sesi berakhir. Silakan login kembali.');
          return;
        }
        setStatus(err.message || 'Gagal menyimpan data.', 'err');
      }
    }

    function renderLoginView() {
      const modeBadge =
        mode === 'server'
          ? '<span class="pixel-tag bg-emerald-200 px-2 py-0.5 font-pixel text-[8px] text-emerald-950">SERVER LARAGON PHP + JSON</span>'
          : '<span class="pixel-tag bg-amber-200 px-2 py-0.5 font-pixel text-[8px] text-amber-950">OFFLINE LOCALSTORAGE</span>';

      rootEl.innerHTML = `
        <div class="mx-auto max-w-md py-6">
          <div class="pixel-card space-y-4 p-5">
            <div class="flex items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
              <h3 class="font-pixel text-xs text-slate-900">LOGIN ADMIN CMS</h3>
              ${modeBadge}
            </div>
            <p class="text-xs leading-relaxed text-slate-600">
              Masukkan Password Admin untuk mengelola Profil, Pengalaman Kerja, Contoh Project, Galeri Portofolio, dan Inbox Pesan.
            </p>
            <form data-admin-login-form class="space-y-3">
              <div>
                <label class="mb-1.5 block font-pixel text-[8px] text-slate-700">PASSWORD ADMIN</label>
                <input
                  type="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan password admin..."
                  class="w-full border-2 border-slate-900 bg-white px-3 py-2 text-sm text-slate-900 focus:bg-sky-50 focus:outline-none"
                />
              </div>
              <p data-login-error class="hidden border-2 border-rose-800 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800"></p>
              <div class="flex items-center justify-between gap-2 pt-1">
                <span class="font-vt text-sm text-emerald-700">🔒 Argon2id · CSRF · Anti Brute-Force</span>
                <button type="submit" class="pixel-btn-primary px-4 py-2 font-pixel text-[9px]">
                  MASUK PANEL ►
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      const form = rootEl.querySelector('[data-admin-login-form]');
      const errEl = rootEl.querySelector('[data-login-error]');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = form.password.value;
        try {
          await login(pass);
          authenticated = true;
          draftData = deepClone(await loadData());
          messages = await getMessages().catch(() => []);
          render();
          onToast('LOGIN ADMIN BERHASIL');
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || 'Password salah.';
            errEl.classList.remove('hidden');
          }
        }
      });
    }

    function renderTabProfil() {
      const p = draftData.profile;
      const c = draftData.contact || {};
      const editSkill = editingSkillId ? p.skills.find((s) => s.id === editingSkillId) : null;

      return `
        <div class="space-y-5">
          <form data-form-profile class="pixel-card space-y-4 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">IDENTITAS UTAMA &amp; HEADER HUD</h3>
              <button type="submit" class="pixel-btn-primary px-3 py-1.5 font-pixel text-[8px]">SIMPAN PROFIL</button>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">NAMA LENGKAP</label>
                <input name="name" value="${escapeHtml(p.name)}" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">INISIAL AVATAR</label>
                <input name="initials" value="${escapeHtml(p.initials)}" maxlength="3" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">BADGE UMUR / LABEL</label>
                <input name="ageLabel" value="${escapeHtml(p.ageLabel)}" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">JABATAN / PERAN</label>
                <input name="role" value="${escapeHtml(p.role)}" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">INSTANSI / PERUSAHAAN</label>
                <input name="company" value="${escapeHtml(p.company)}" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">SUBTITLE HEADER GAME (HUD)</label>
              <input name="hudSubtitle" value="${escapeHtml(p.hudSubtitle)}" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">BIO SINGKAT</label>
              <textarea name="bio" rows="2" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs">${escapeHtml(p.bio)}</textarea>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              ${(p.highlights || []).slice(0, 3).map((h, i) => `
                <div class="border-2 border-slate-300 bg-slate-50 p-2.5 space-y-1.5">
                  <input name="hl_label_${i}" value="${escapeHtml(h.label)}" placeholder="Label" class="w-full border border-slate-900 bg-white px-2 py-1 text-[11px] font-semibold" />
                  <input name="hl_val_${i}" value="${escapeHtml(h.value)}" placeholder="Isi" class="w-full border border-slate-900 bg-white px-2 py-1 text-xs" />
                </div>
              `).join('')}
            </div>

            <!-- MEDIA SOSIAL & TAUTAN PROFIL (IG, LINKEDIN, GITHUB) -->
            <div class="border-t-2 border-slate-900 pt-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[8px] text-slate-900">MEDIA SOSIAL &amp; TAUTAN PROFIL (ZONA 4)</span>
                <span class="font-vt text-sm text-slate-500">Bisa juga diedit pada Tab Kontak</span>
              </div>
              <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div class="border-2 border-slate-900 bg-pink-50/50 p-2.5">
                  <div class="mb-1 flex items-center justify-between">
                    <label class="font-pixel text-[7px] text-pink-700">INSTAGRAM</label>
                    ${c.instagram ? `<a href="${escapeHtml(c.instagram)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-pink-600 hover:underline">BUKA ↗</a>` : ''}
                  </div>
                  <input name="instagram" value="${escapeHtml(c.instagram || '')}" placeholder="https://instagram.com/... atau @user" class="w-full border border-slate-900 bg-white px-2 py-1 text-xs" />
                </div>
                <div class="border-2 border-slate-900 bg-sky-50/50 p-2.5">
                  <div class="mb-1 flex items-center justify-between">
                    <label class="font-pixel text-[7px] text-sky-700">LINKEDIN</label>
                    ${c.linkedin ? `<a href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-sky-600 hover:underline">BUKA ↗</a>` : ''}
                  </div>
                  <input name="linkedin" value="${escapeHtml(c.linkedin || '')}" placeholder="https://linkedin.com/in/... atau user" class="w-full border border-slate-900 bg-white px-2 py-1 text-xs" />
                </div>
                <div class="border-2 border-slate-900 bg-slate-100 p-2.5">
                  <div class="mb-1 flex items-center justify-between">
                    <label class="font-pixel text-[7px] text-slate-800">GITHUB</label>
                    ${c.github ? `<a href="${escapeHtml(c.github)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-slate-800 hover:underline">BUKA ↗</a>` : ''}
                  </div>
                  <input name="github" value="${escapeHtml(c.github || '')}" placeholder="https://github.com/... atau user" class="w-full border border-slate-900 bg-white px-2 py-1 text-xs" />
                </div>
              </div>
            </div>
          </form>

          <!-- CRUD KEAHLIAN INTI (SKILLS) -->
          <div class="pixel-card space-y-4 p-4">
            <h3 class="border-b-2 border-slate-900 pb-2 font-pixel text-[10px] text-slate-900">
              ${editSkill ? 'EDIT KEAHLIAN INTI' : 'TAMBAH KEAHLIAN INTI (SKILLS)'}
            </h3>
            <form data-form-skill class="space-y-3">
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label class="mb-1 block font-pixel text-[7px] text-slate-600">JUDUL KEAHLIAN</label>
                  <input name="title" value="${escapeHtml(editSkill?.title || '')}" required placeholder="Contoh: Cloud & DevOps" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1 block font-pixel text-[7px] text-slate-600">DESKRIPSI KEAHLIAN</label>
                  <input name="description" value="${escapeHtml(editSkill?.description || '')}" required placeholder="Jelaskan teknologi dan pengalaman..." class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="pixel-btn-primary px-3 py-1.5 font-pixel text-[8px]">
                  ${editSkill ? 'UPDATE KEAHLIAN' : '+ TAMBAH KEAHLIAN'}
                </button>
                ${editSkill ? '<button type="button" data-cancel-skill class="pixel-btn px-3 py-1.5 font-pixel text-[8px]">BATAL</button>' : ''}
              </div>
            </form>

            <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              ${p.skills.map((sk, idx) => `
                <div class="flex flex-col justify-between border-2 border-slate-900 bg-slate-50 p-3">
                  <div>
                    <h4 class="text-xs font-bold text-slate-900">${escapeHtml(sk.title)}</h4>
                    <p class="mt-1 text-[11px] text-slate-600">${escapeHtml(sk.description)}</p>
                  </div>
                  <div class="mt-2.5 flex items-center gap-1.5">
                    <button type="button" data-edit-skill="${escapeHtml(sk.id)}" class="pixel-btn px-2 py-1 font-pixel text-[7px]">EDIT</button>
                    <button type="button" data-move-skill="${idx}:-1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === 0 ? 'disabled' : ''}>▲</button>
                    <button type="button" data-move-skill="${idx}:1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === p.skills.length - 1 ? 'disabled' : ''}>▼</button>
                    <button type="button" data-del-skill="${escapeHtml(sk.id)}" class="pixel-btn bg-rose-100 px-2 py-1 font-pixel text-[7px] text-rose-800">HAPUS</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function renderTabPengalaman() {
      const list = Array.isArray(draftData.experiences) ? draftData.experiences : [];
      const editItem = editingExpId ? list.find((x) => x.id === editingExpId) : null;

      return `
        <div class="space-y-5">
          <form data-form-experience class="pixel-card space-y-3 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">
                ${editItem ? 'EDIT ALUR PENGALAMAN KERJA' : '+ TAMBAH PENGALAMAN KERJA BARU'}
              </h3>
              ${editItem ? '<button type="button" data-cancel-exp class="pixel-btn px-2.5 py-1 font-pixel text-[8px]">BATAL EDIT</button>' : ''}
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">JABATAN / POSISI</label>
                <input name="role" value="${escapeHtml(editItem?.role || '')}" required placeholder="Contoh: IT Programmer & Network Engineer" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">PERUSAHAAN / INSTANSI</label>
                <input name="company" value="${escapeHtml(editItem?.company || '')}" required placeholder="Contoh: RSI Siti Hajar" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">PERIODE / TAHUN</label>
                <input name="period" value="${escapeHtml(editItem?.period || '')}" required placeholder="Contoh: 2021 – Sekarang" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">LOKASI</label>
                <input name="location" value="${escapeHtml(editItem?.location || '')}" placeholder="Contoh: Sidoarjo" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div class="flex items-end pb-1">
                <label class="flex cursor-pointer items-center gap-2 border-2 border-slate-900 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 w-full">
                  <input type="checkbox" name="isCurrent" value="1" ${editItem?.isCurrent ? 'checked' : ''} class="h-4 w-4 accent-rose-600" />
                  <span>Status Aktif / Saat Ini</span>
                </label>
              </div>
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">DESKRIPSI TUGAS &amp; PENCAPAIAN</label>
              <textarea name="description" rows="2" required placeholder="Jelaskan tanggung jawab utama dan hasil kerja Anda..." class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs">${escapeHtml(editItem?.description || '')}</textarea>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
              <div class="sm:col-span-2">
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">KEAHLIAN / TAGS (PISAHKAN DENGAN KOMA)</label>
                <input name="tags" value="${escapeHtml((editItem?.tags || []).join(', '))}" placeholder="Laravel, SIMRS, MikroTik, Proxmox" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div class="flex justify-end">
                <button type="submit" class="pixel-btn-primary w-full px-4 py-2 font-pixel text-[8px]">
                  ${editItem ? 'UPDATE PENGALAMAN' : '+ SIMPAN PENGALAMAN'}
                </button>
              </div>
            </div>
          </form>

          <!-- Daftar Alur Pengalaman Kerja -->
          <div class="space-y-2.5">
            ${
              list.length === 0
                ? '<div class="pixel-card p-6 text-center text-xs text-slate-500">Belum ada data pengalaman kerja. Tambahkan melalui form di atas.</div>'
                : list
                    .map(
                      (exp, idx) => `
              <div class="pixel-card flex flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="pixel-tag bg-rose-100 px-1.5 py-0.5 font-pixel text-[7px] text-rose-900">${escapeHtml(exp.period)}</span>
                    ${exp.isCurrent ? '<span class="pixel-tag bg-emerald-200 px-1.5 py-0.5 font-pixel text-[7px] text-emerald-950">● AKTIF</span>' : ''}
                    ${exp.location ? `<span class="text-[11px] font-semibold text-slate-500">· ${escapeHtml(exp.location)}</span>` : ''}
                  </div>
                  <h4 class="mt-1 truncate text-sm font-bold text-slate-900">${escapeHtml(exp.role)} — <span class="text-rose-700">${escapeHtml(exp.company)}</span></h4>
                  <p class="mt-0.5 line-clamp-2 text-xs text-slate-600">${escapeHtml(exp.description)}</p>
                </div>
                <div class="flex shrink-0 items-center gap-1.5">
                  <button type="button" data-edit-exp="${escapeHtml(exp.id)}" class="pixel-btn px-2.5 py-1 font-pixel text-[7px]">EDIT</button>
                  <button type="button" data-move-exp="${idx}:-1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === 0 ? 'disabled' : ''}>▲</button>
                  <button type="button" data-move-exp="${idx}:1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === list.length - 1 ? 'disabled' : ''}>▼</button>
                  <button type="button" data-del-exp="${escapeHtml(exp.id)}" class="pixel-btn bg-rose-100 px-2.5 py-1 font-pixel text-[7px] text-rose-800">HAPUS</button>
                </div>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
      `;
    }

    function renderTabProject() {
      const editItem = editingProjectId ? draftData.projects.find((x) => x.id === editingProjectId) : null;
      const badgeColor = editItem?.badgeColor || 'emerald';

      return `
        <div class="space-y-5">
          <form data-form-project class="pixel-card space-y-3 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">
                ${editItem ? 'EDIT CONTOH PROJECT' : '+ TAMBAH CONTOH PROJECT BARU'}
              </h3>
              ${editItem ? '<button type="button" data-cancel-project class="pixel-btn px-2.5 py-1 font-pixel text-[8px]">BATAL EDIT</button>' : ''}
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">JUDUL PROJECT</label>
                <input name="title" value="${escapeHtml(editItem?.title || '')}" required placeholder="Contoh: Integrasi SIMRS & Antrean" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">WARNA BADGE</label>
                <select name="badgeColor" class="w-full border-2 border-slate-900 bg-white px-2.5 py-1.5 text-xs">
                  <option value="emerald" ${badgeColor === 'emerald' ? 'selected' : ''}>Hijau (Emerald)</option>
                  <option value="sky" ${badgeColor === 'sky' ? 'selected' : ''}>Biru (Sky)</option>
                  <option value="indigo" ${badgeColor === 'indigo' ? 'selected' : ''}>Ungu (Indigo)</option>
                  <option value="amber" ${badgeColor === 'amber' ? 'selected' : ''}>Kuning (Amber)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">BADGE KATEGORI</label>
                <input name="badge" value="${escapeHtml(editItem?.badge || '')}" required placeholder="Contoh: SISTEM INFORMASI RS" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">META / SUB-BIDANG</label>
                <input name="meta" value="${escapeHtml(editItem?.meta || '')}" placeholder="Contoh: API · Backend · Database" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">DESKRIPSI PROJECT</label>
              <textarea name="description" rows="2" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs">${escapeHtml(editItem?.description || '')}</textarea>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">TAGS (PISAHKAN DENGAN KOMA)</label>
                <input name="tags" value="${escapeHtml((editItem?.tags || []).join(', '))}" placeholder="Laravel, REST API, MySQL" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">LINK DEMO / REPO (OPSIONAL)</label>
                <input name="linkUrl" value="${escapeHtml(editItem?.linkUrl || '')}" placeholder="https://..." class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 items-end">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">GAMBAR THUMBNAIL (URL ATAU UPLOAD)</label>
                <input name="imageUrl" value="${escapeHtml(editItem?.imageUrl || '')}" placeholder="https://... atau klik Upload" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div class="flex items-center gap-2">
                <label class="pixel-btn cursor-pointer px-3 py-1.5 font-pixel text-[8px]">
                  UPLOAD GAMBAR
                  <input type="file" accept="image/*" data-upload-for="project" class="hidden" />
                </label>
                <button type="submit" class="pixel-btn-primary px-4 py-1.5 font-pixel text-[8px]">
                  ${editItem ? 'UPDATE PROJECT' : '+ SIMPAN PROJECT'}
                </button>
              </div>
            </div>
          </form>

          <!-- Daftar Project -->
          <div class="space-y-2.5">
            ${draftData.projects.map((prj, idx) => `
              <div class="pixel-card flex flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center">
                <div class="flex items-start gap-3 min-w-0">
                  ${prj.imageUrl ? `<img src="${escapeHtml(prj.imageUrl)}" alt="" class="h-14 w-20 shrink-0 border-2 border-slate-900 object-cover" />` : ''}
                  <div class="min-w-0">
                    <span class="pixel-tag inline-block bg-emerald-100 px-1.5 py-0.5 font-pixel text-[7px] text-emerald-900">${escapeHtml(prj.badge)}</span>
                    <h4 class="mt-1 truncate text-sm font-bold text-slate-900">${escapeHtml(prj.title)}</h4>
                    <p class="mt-0.5 line-clamp-2 text-xs text-slate-600">${escapeHtml(prj.description)}</p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1.5">
                  <button type="button" data-edit-project="${escapeHtml(prj.id)}" class="pixel-btn px-2.5 py-1 font-pixel text-[7px]">EDIT</button>
                  <button type="button" data-move-project="${idx}:-1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === 0 ? 'disabled' : ''}>▲</button>
                  <button type="button" data-move-project="${idx}:1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === draftData.projects.length - 1 ? 'disabled' : ''}>▼</button>
                  <button type="button" data-del-project="${escapeHtml(prj.id)}" class="pixel-btn bg-rose-100 px-2.5 py-1 font-pixel text-[7px] text-rose-800">HAPUS</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderTabPortofolio() {
      const editItem = editingPortfolioId ? draftData.portfolios.find((x) => x.id === editingPortfolioId) : null;
      const cat = editItem?.category || 'web';

      return `
        <div class="space-y-5">
          <form data-form-portfolio class="pixel-card space-y-3 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">
                ${editItem ? 'EDIT ITEM PORTOFOLIO' : '+ TAMBAH ITEM PORTOFOLIO BARU'}
              </h3>
              ${editItem ? '<button type="button" data-cancel-portfolio class="pixel-btn px-2.5 py-1 font-pixel text-[8px]">BATAL EDIT</button>' : ''}
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">JUDUL KARYA PORTOFOLIO</label>
                <input name="title" value="${escapeHtml(editItem?.title || '')}" required placeholder="Contoh: Portal Antrean Poliklinik" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">KATEGORI FILTER</label>
                <select name="category" class="w-full border-2 border-slate-900 bg-white px-2.5 py-1.5 text-xs">
                  <option value="web" ${cat === 'web' ? 'selected' : ''}>Web Dev</option>
                  <option value="network" ${cat === 'network' ? 'selected' : ''}>Network &amp; Infra</option>
                </select>
              </div>
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">DESKRIPSI SINGKAT</label>
              <textarea name="description" rows="2" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs">${escapeHtml(editItem?.description || '')}</textarea>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">TAGS (PISAHKAN DENGAN KOMA)</label>
                <input name="tags" value="${escapeHtml((editItem?.tags || []).join(', '))}" placeholder="Laravel, WebSocket, Tailwind CSS" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">LINK DEMO / GITHUB (OPSIONAL)</label>
                <input name="linkUrl" value="${escapeHtml(editItem?.linkUrl || '')}" placeholder="https://..." class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 items-end">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">GAMBAR THUMBNAIL (URL ATAU UPLOAD)</label>
                <input name="imageUrl" value="${escapeHtml(editItem?.imageUrl || '')}" placeholder="https://... atau klik Upload" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div class="flex items-center gap-2">
                <label class="pixel-btn cursor-pointer px-3 py-1.5 font-pixel text-[8px]">
                  UPLOAD GAMBAR
                  <input type="file" accept="image/*" data-upload-for="portfolio" class="hidden" />
                </label>
                <button type="submit" class="pixel-btn-primary px-4 py-1.5 font-pixel text-[8px]">
                  ${editItem ? 'UPDATE PORTOFOLIO' : '+ SIMPAN PORTOFOLIO'}
                </button>
              </div>
            </div>
          </form>

          <!-- Daftar Portofolio -->
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            ${draftData.portfolios.map((ptf, idx) => `
              <div class="pixel-card flex flex-col justify-between p-3.5">
                <div>
                  ${ptf.imageUrl ? `<img src="${escapeHtml(ptf.imageUrl)}" alt="" class="mb-2 h-24 w-full border-2 border-slate-900 object-cover" />` : ''}
                  <span class="pixel-tag inline-block ${ptf.category === 'web' ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-100 text-emerald-900'} px-1.5 py-0.5 font-pixel text-[7px]">
                    ${escapeHtml(ptf.categoryLabel)}
                  </span>
                  <h4 class="mt-1.5 text-xs font-bold text-slate-900">${escapeHtml(ptf.title)}</h4>
                  <p class="mt-1 text-[11px] text-slate-600">${escapeHtml(ptf.description)}</p>
                </div>
                <div class="mt-3 flex items-center gap-1.5">
                  <button type="button" data-edit-portfolio="${escapeHtml(ptf.id)}" class="pixel-btn px-2 py-1 font-pixel text-[7px]">EDIT</button>
                  <button type="button" data-move-portfolio="${idx}:-1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === 0 ? 'disabled' : ''}>▲</button>
                  <button type="button" data-move-portfolio="${idx}:1" class="pixel-btn px-1.5 py-1 font-pixel text-[7px]" ${idx === draftData.portfolios.length - 1 ? 'disabled' : ''}>▼</button>
                  <button type="button" data-del-portfolio="${escapeHtml(ptf.id)}" class="pixel-btn bg-rose-100 px-2 py-1 font-pixel text-[7px] text-rose-800">HAPUS</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderTabKontak() {
      const c = draftData.contact;
      const unreadCount = messages.filter((m) => !m.read).length;

      return `
        <div class="space-y-5">
          <form data-form-contact-cfg class="pixel-card space-y-4 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">PENGATURAN INFO KONTAK &amp; MEDIA SOSIAL (ZONA 4)</h3>
              <button type="submit" class="pixel-btn-primary px-3 py-1.5 font-pixel text-[8px]">SIMPAN KONTAK</button>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">LOKASI KERJA</label>
                <input name="location" value="${escapeHtml(c.location)}" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">EMAIL PROFESIONAL</label>
                <input name="email" type="email" value="${escapeHtml(c.email)}" required class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>

            <!-- TAUTAN MEDIA SOSIAL (IG, LINKEDIN, GITHUB) -->
            <div class="border-2 border-slate-900 bg-slate-50 p-3 space-y-2.5">
              <div class="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <div class="flex items-center gap-2">
                  <span class="font-pixel text-[8px] text-slate-900">TAUTAN MEDIA SOSIAL (INSTAGRAM, LINKEDIN, GITHUB)</span>
                  <span class="pixel-tag bg-pink-100 text-pink-800 px-1 font-pixel text-[6px]">LIVE UPDATE</span>
                </div>
                <span class="font-vt text-sm text-slate-500">Mendukung format link penuh https://... atau handle @user</span>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="border-2 border-slate-900 bg-pink-50/60 p-2.5">
                  <div class="mb-1.5 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="flex h-5 w-5 items-center justify-center border border-slate-900 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 font-pixel text-[7px] text-white">IG</span>
                      <label class="font-pixel text-[7px] text-slate-900">INSTAGRAM</label>
                    </div>
                    ${c.instagram ? `<a href="${escapeHtml(c.instagram)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-pink-700 underline">TES LINK ↗</a>` : ''}
                  </div>
                  <input name="instagram" value="${escapeHtml(c.instagram || '')}" placeholder="https://instagram.com/achmadfebri atau @achmadfebri" class="w-full border border-slate-900 bg-white px-2.5 py-1.5 text-xs" />
                  <p class="mt-1 font-vt text-xs text-slate-500">Contoh: @achmadfebri atau https://instagram.com/...</p>
                </div>

                <div class="border-2 border-slate-900 bg-sky-50/60 p-2.5">
                  <div class="mb-1.5 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="flex h-5 w-5 items-center justify-center border border-slate-900 bg-sky-600 font-pixel text-[7px] text-white">IN</span>
                      <label class="font-pixel text-[7px] text-slate-900">LINKEDIN</label>
                    </div>
                    ${c.linkedin ? `<a href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-sky-700 underline">TES LINK ↗</a>` : ''}
                  </div>
                  <input name="linkedin" value="${escapeHtml(c.linkedin || '')}" placeholder="https://linkedin.com/in/achmadfebri" class="w-full border border-slate-900 bg-white px-2.5 py-1.5 text-xs" />
                  <p class="mt-1 font-vt text-xs text-slate-500">Contoh: https://linkedin.com/in/achmadfebri</p>
                </div>

                <div class="border-2 border-slate-900 bg-slate-100 p-2.5">
                  <div class="mb-1.5 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="flex h-5 w-5 items-center justify-center border border-slate-900 bg-slate-900 font-pixel text-[7px] text-white">GH</span>
                      <label class="font-pixel text-[7px] text-slate-900">GITHUB</label>
                    </div>
                    ${c.github ? `<a href="${escapeHtml(c.github)}" target="_blank" rel="noopener noreferrer" class="font-pixel text-[6px] text-slate-900 underline">TES LINK ↗</a>` : ''}
                  </div>
                  <input name="github" value="${escapeHtml(c.github || '')}" placeholder="https://github.com/achmadfebri atau achmadfebri" class="w-full border border-slate-900 bg-white px-2.5 py-1.5 text-xs" />
                  <p class="mt-1 font-vt text-xs text-slate-500">Contoh: https://github.com/achmadfebri</p>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1 block font-pixel text-[7px] text-slate-600">PILIHAN TOPIK DISKUSI (SATU PER BARIS)</label>
              <textarea name="topics" rows="3" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs">${escapeHtml((c.topics || []).join('\n'))}</textarea>
            </div>
          </form>

          <!-- INBOX PESAN MASUK -->
          <div class="pixel-card space-y-3 p-4">
            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 class="font-pixel text-[10px] text-slate-900">
                INBOX PESAN PENGUNJUNG (${messages.length}${unreadCount > 0 ? ` · ${unreadCount} BARU` : ''})
              </h3>
              <button type="button" data-refresh-inbox class="pixel-btn px-2.5 py-1 font-pixel text-[7px]">↺ REFRESH</button>
            </div>
            ${
              messages.length === 0
                ? '<p class="py-4 text-center text-xs text-slate-500">Belum ada pesan masuk dari form Kontak.</p>'
                : `<div class="space-y-2.5">
                    ${messages.map((m) => `
                      <div class="border-2 border-slate-900 ${m.read ? 'bg-slate-50' : 'bg-amber-50'} p-3">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <div class="flex items-center gap-2">
                            ${!m.read ? '<span class="pixel-tag bg-amber-300 px-1.5 py-0.5 font-pixel text-[7px] text-slate-950">BARU</span>' : ''}
                            <strong class="text-xs text-slate-900">${escapeHtml(m.name)}</strong>
                            <span class="text-[11px] text-sky-700">&lt;${escapeHtml(m.email)}&gt;</span>
                          </div>
                          <span class="font-vt text-sm text-slate-500">${escapeHtml(m.created_at || '')}</span>
                        </div>
                        <p class="mt-1 text-[11px] font-semibold text-slate-700">Topik: ${escapeHtml(m.topic)}</p>
                        <p class="mt-1 text-xs leading-relaxed text-slate-800">${escapeHtml(m.message)}</p>
                        <div class="mt-2.5 flex items-center gap-2">
                          ${!m.read ? `<button type="button" data-read-msg="${escapeHtml(m.id)}" class="pixel-btn px-2 py-1 font-pixel text-[7px]">✓ TANDAI DIBACA</button>` : ''}
                          <button type="button" data-del-msg="${escapeHtml(m.id)}" class="pixel-btn bg-rose-100 px-2 py-1 font-pixel text-[7px] text-rose-800">HAPUS</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>`
            }
          </div>
        </div>
      `;
    }

    function renderTabPengaturan() {
      return `
        <div class="space-y-5">
          <!-- Status Keamanan Sistem -->
          <div class="pixel-card space-y-2.5 bg-slate-900 p-4 text-white">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
              <h3 class="font-pixel text-[10px] text-emerald-300">🛡 STATUS KEAMANAN ADMIN CMS</h3>
              <span class="pixel-tag bg-emerald-500 px-2 py-0.5 font-pixel text-[7px] text-slate-950">HARDENED AKTIF</span>
            </div>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              <div class="border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span class="font-pixel text-[7px] text-sky-300">ENKRIPSI PASSWORD:</span>
                <p class="mt-0.5 font-bold text-white">${escapeHtml(securityInfo.hashAlgo)} (Auto-Upgrade)</p>
              </div>
              <div class="border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span class="font-pixel text-[7px] text-sky-300">PROTEKSI SERANGAN:</span>
                <p class="mt-0.5 font-bold text-white">CSRF Token · Anti Brute-Force (5x/15m)</p>
              </div>
              <div class="border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span class="font-pixel text-[7px] text-sky-300">KEAMANAN SESI:</span>
                <p class="mt-0.5 font-bold text-white">HttpOnly · SameSite=Strict · Timeout 30m</p>
              </div>
              <div class="border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span class="font-pixel text-[7px] text-sky-300">PROTEKSI FILE &amp; UPLOAD:</span>
                <p class="mt-0.5 font-bold text-white">Validasi Gambar + .htaccess Anti-PHP</p>
              </div>
            </div>
          </div>

          ${
            securityInfo.isDefaultPassword
              ? `<div class="border-2 border-rose-900 bg-rose-100 p-3.5 text-xs font-bold text-rose-900">
                  ⚠ PERINGATAN KEAMANAN: Anda masih menggunakan password bawaan! Segera ganti password di bawah ini minimal 8 karakter (kombinasi huruf besar, angka, &amp; simbol).
                </div>`
              : ''
          }

          <!-- Ganti Password Admin -->
          <form data-form-password class="pixel-card space-y-3 p-4">
            <h3 class="border-b-2 border-slate-900 pb-2 font-pixel text-[10px] text-slate-900">GANTI PASSWORD ADMIN (HASH ARGON2ID)</h3>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">PASSWORD LAMA</label>
                <input name="currentPassword" type="password" required autocomplete="current-password" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">PASSWORD BARU (MIN 8 KARAKTER)</label>
                <input name="newPassword" type="password" required minlength="8" autocomplete="new-password" data-new-pass-input class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label class="mb-1 block font-pixel text-[7px] text-slate-600">KONFIRMASI PASSWORD BARU</label>
                <input name="confirmPassword" type="password" required minlength="8" autocomplete="new-password" class="w-full border-2 border-slate-900 px-2.5 py-1.5 text-xs" />
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span data-pass-strength class="font-vt text-base text-slate-600">Tips: Gunakan kombinasi huruf besar, huruf kecil, angka &amp; simbol.</span>
              <button type="submit" class="pixel-btn-primary px-4 py-1.5 font-pixel text-[8px]">UPDATE PASSWORD</button>
            </div>
          </form>

          <!-- Backup Export / Import / Reset -->
          <div class="pixel-card space-y-3 p-4">
            <h3 class="border-b-2 border-slate-900 pb-2 font-pixel text-[10px] text-slate-900">BACKUP, IMPORT &amp; RESET DATA</h3>
            <p class="text-xs leading-relaxed text-slate-600">
              Anda dapat mengunduh cadangan seluruh data portofolio dalam format <code>.json</code> atau mengimpornya kembali kapan saja.
            </p>
            <div class="flex flex-wrap items-center gap-2.5">
              <button type="button" data-export-json class="pixel-btn px-3.5 py-2 font-pixel text-[8px]">
                ⬇ EXPORT JSON
              </button>
              <label class="pixel-btn cursor-pointer px-3.5 py-2 font-pixel text-[8px]">
                ⬆ IMPORT JSON
                <input type="file" accept="application/json" data-import-json class="hidden" />
              </label>
              <button type="button" data-reset-default class="pixel-btn bg-rose-100 px-3.5 py-2 font-pixel text-[8px] text-rose-800">
                ↺ RESET DATA BAWAAN
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function bindAuthenticatedEvents() {
      // Switch tabs
      rootEl.querySelectorAll('[data-admin-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.dataset.adminTab;
          render();
        });
      });

      // Logout
      rootEl.querySelector('[data-admin-logout]')?.addEventListener('click', async () => {
        await logout();
        authenticated = false;
        render();
        onToast('LOGOUT ADMIN BERHASIL');
      });

      // --- TAB 1: PROFIL & SKILLS ---
      const formProfile = rootEl.querySelector('[data-form-profile]');
      formProfile?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formProfile);
        draftData.profile.name = String(fd.get('name') || '').trim();
        draftData.profile.initials = String(fd.get('initials') || 'AF').trim().toUpperCase();
        draftData.profile.ageLabel = String(fd.get('ageLabel') || '').trim();
        draftData.profile.role = String(fd.get('role') || '').trim();
        draftData.profile.company = String(fd.get('company') || '').trim();
        draftData.profile.hudSubtitle = String(fd.get('hudSubtitle') || '').trim();
        draftData.profile.bio = String(fd.get('bio') || '').trim();
        draftData.profile.highlights = [0, 1, 2].map((i) => ({
          label: String(fd.get(`hl_label_${i}`) || '').trim(),
          value: String(fd.get(`hl_val_${i}`) || '').trim(),
        }));
        if (fd.has('instagram')) draftData.contact.instagram = String(fd.get('instagram') || '').trim();
        if (fd.has('linkedin')) draftData.contact.linkedin = String(fd.get('linkedin') || '').trim();
        if (fd.has('github')) draftData.contact.github = String(fd.get('github') || '').trim();
        await persistDraft('Profil & Media Sosial berhasil disimpan!');
      });

      const formSkill = rootEl.querySelector('[data-form-skill]');
      formSkill?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formSkill);
        const title = String(fd.get('title') || '').trim();
        const description = String(fd.get('description') || '').trim();
        if (editingSkillId) {
          draftData.profile.skills = draftData.profile.skills.map((s) =>
            s.id === editingSkillId ? { ...s, title, description } : s
          );
          editingSkillId = null;
        } else {
          draftData.profile.skills.push({ id: genId('sk'), title, description });
        }
        await persistDraft('Daftar keahlian diperbarui!');
        render();
      });

      rootEl.querySelector('[data-cancel-skill]')?.addEventListener('click', () => {
        editingSkillId = null;
        render();
      });

      rootEl.querySelectorAll('[data-edit-skill]').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingSkillId = btn.dataset.editSkill;
          render();
        });
      });

      rootEl.querySelectorAll('[data-del-skill]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          draftData.profile.skills = draftData.profile.skills.filter((s) => s.id !== btn.dataset.delSkill);
          if (editingSkillId === btn.dataset.delSkill) editingSkillId = null;
          await persistDraft('Keahlian dihapus.');
          render();
        });
      });

      rootEl.querySelectorAll('[data-move-skill]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const [idxStr, dirStr] = btn.dataset.moveSkill.split(':');
          const i = Number(idxStr);
          const j = i + Number(dirStr);
          const arr = draftData.profile.skills;
          if (j >= 0 && j < arr.length) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            await persistDraft('Urutan keahlian diperbarui.');
            render();
          }
        });
      });

      // --- TAB 2: PENGALAMAN KERJA ---
      const formExperience = rootEl.querySelector('[data-form-experience]');
      formExperience?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formExperience);
        if (!Array.isArray(draftData.experiences)) draftData.experiences = [];
        const item = {
          id: editingExpId || genId('exp'),
          role: String(fd.get('role') || '').trim(),
          company: String(fd.get('company') || '').trim(),
          period: String(fd.get('period') || '').trim(),
          location: String(fd.get('location') || '').trim(),
          isCurrent: fd.get('isCurrent') === '1',
          description: String(fd.get('description') || '').trim(),
          tags: String(fd.get('tags') || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        };
        if (editingExpId) {
          draftData.experiences = draftData.experiences.map((x) => (x.id === editingExpId ? item : x));
          editingExpId = null;
        } else {
          draftData.experiences.unshift(item);
        }
        await persistDraft('Pengalaman kerja berhasil disimpan!');
        render();
      });

      rootEl.querySelector('[data-cancel-exp]')?.addEventListener('click', () => {
        editingExpId = null;
        render();
      });

      rootEl.querySelectorAll('[data-edit-exp]').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingExpId = btn.dataset.editExp;
          render();
        });
      });

      rootEl.querySelectorAll('[data-del-exp]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!Array.isArray(draftData.experiences)) return;
          draftData.experiences = draftData.experiences.filter((x) => x.id !== btn.dataset.delExp);
          if (editingExpId === btn.dataset.delExp) editingExpId = null;
          await persistDraft('Pengalaman kerja dihapus.');
          render();
        });
      });

      rootEl.querySelectorAll('[data-move-exp]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const [idxStr, dirStr] = btn.dataset.moveExp.split(':');
          const i = Number(idxStr);
          const j = i + Number(dirStr);
          const arr = draftData.experiences || [];
          if (j >= 0 && j < arr.length) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            await persistDraft('Urutan pengalaman kerja diperbarui.');
            render();
          }
        });
      });

      // --- TAB 3: PROJECTS ---
      const formProject = rootEl.querySelector('[data-form-project]');
      formProject?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formProject);
        const item = {
          id: editingProjectId || genId('prj'),
          title: String(fd.get('title') || '').trim(),
          badge: String(fd.get('badge') || '').trim(),
          badgeColor: String(fd.get('badgeColor') || 'emerald'),
          meta: String(fd.get('meta') || '').trim(),
          description: String(fd.get('description') || '').trim(),
          tags: String(fd.get('tags') || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          imageUrl: sanitizeUrl(fd.get('imageUrl')),
          linkUrl: sanitizeUrl(fd.get('linkUrl')),
        };
        if (editingProjectId) {
          draftData.projects = draftData.projects.map((p) => (p.id === editingProjectId ? item : p));
          editingProjectId = null;
        } else {
          draftData.projects.unshift(item);
        }
        await persistDraft('Daftar project berhasil disimpan!');
        render();
      });

      rootEl.querySelector('[data-cancel-project]')?.addEventListener('click', () => {
        editingProjectId = null;
        render();
      });

      rootEl.querySelectorAll('[data-edit-project]').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingProjectId = btn.dataset.editProject;
          render();
        });
      });

      rootEl.querySelectorAll('[data-del-project]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          draftData.projects = draftData.projects.filter((p) => p.id !== btn.dataset.delProject);
          if (editingProjectId === btn.dataset.delProject) editingProjectId = null;
          await persistDraft('Project dihapus.');
          render();
        });
      });

      rootEl.querySelectorAll('[data-move-project]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const [idxStr, dirStr] = btn.dataset.moveProject.split(':');
          const i = Number(idxStr);
          const j = i + Number(dirStr);
          const arr = draftData.projects;
          if (j >= 0 && j < arr.length) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            await persistDraft('Urutan project diperbarui.');
            render();
          }
        });
      });

      // --- TAB 3: PORTFOLIOS ---
      const formPortfolio = rootEl.querySelector('[data-form-portfolio]');
      formPortfolio?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formPortfolio);
        const category = String(fd.get('category') || 'web');
        const item = {
          id: editingPortfolioId || genId('ptf'),
          title: String(fd.get('title') || '').trim(),
          category,
          categoryLabel: category === 'web' ? 'Web Dev' : 'Network & Infra',
          description: String(fd.get('description') || '').trim(),
          tags: String(fd.get('tags') || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          imageUrl: sanitizeUrl(fd.get('imageUrl')),
          linkUrl: sanitizeUrl(fd.get('linkUrl')),
        };
        if (editingPortfolioId) {
          draftData.portfolios = draftData.portfolios.map((p) => (p.id === editingPortfolioId ? item : p));
          editingPortfolioId = null;
        } else {
          draftData.portfolios.unshift(item);
        }
        await persistDraft('Galeri portofolio berhasil disimpan!');
        render();
      });

      rootEl.querySelector('[data-cancel-portfolio]')?.addEventListener('click', () => {
        editingPortfolioId = null;
        render();
      });

      rootEl.querySelectorAll('[data-edit-portfolio]').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingPortfolioId = btn.dataset.editPortfolio;
          render();
        });
      });

      rootEl.querySelectorAll('[data-del-portfolio]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          draftData.portfolios = draftData.portfolios.filter((p) => p.id !== btn.dataset.delPortfolio);
          if (editingPortfolioId === btn.dataset.delPortfolio) editingPortfolioId = null;
          await persistDraft('Item portofolio dihapus.');
          render();
        });
      });

      rootEl.querySelectorAll('[data-move-portfolio]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const [idxStr, dirStr] = btn.dataset.movePortfolio.split(':');
          const i = Number(idxStr);
          const j = i + Number(dirStr);
          const arr = draftData.portfolios;
          if (j >= 0 && j < arr.length) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            await persistDraft('Urutan portofolio diperbarui.');
            render();
          }
        });
      });

      // Upload Gambar untuk Project & Portofolio
      rootEl.querySelectorAll('[data-upload-for]').forEach((input) => {
        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            setStatus('Mengunggah gambar...', 'info');
            const url = await uploadImage(file);
            const targetForm = input.closest('form');
            const urlInput = targetForm?.querySelector('input[name="imageUrl"]');
            if (urlInput) urlInput.value = url;
            setStatus('Gambar berhasil diunggah! Klik Simpan untuk menerapkan.', 'ok');
          } catch (err) {
            setStatus(err.message || 'Gagal mengunggah gambar.', 'err');
          }
        });
      });

      // --- TAB 4: KONTAK & INBOX ---
      const formContactCfg = rootEl.querySelector('[data-form-contact-cfg]');
      formContactCfg?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formContactCfg);
        draftData.contact.location = String(fd.get('location') || '').trim();
        draftData.contact.email = String(fd.get('email') || '').trim();
        draftData.contact.instagram = String(fd.get('instagram') || '').trim();
        draftData.contact.linkedin = String(fd.get('linkedin') || '').trim();
        draftData.contact.github = String(fd.get('github') || '').trim();
        draftData.contact.topics = String(fd.get('topics') || '')
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean);
        await persistDraft('Info kontak berhasil disimpan!');
      });

      rootEl.querySelector('[data-refresh-inbox]')?.addEventListener('click', async () => {
        messages = await getMessages().catch(() => []);
        render();
        setStatus('Inbox diperbarui.', 'ok');
      });

      rootEl.querySelectorAll('[data-read-msg]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          messages = await markMessageRead(btn.dataset.readMsg);
          render();
        });
      });

      rootEl.querySelectorAll('[data-del-msg]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          messages = await deleteMessage(btn.dataset.delMsg);
          render();
          setStatus('Pesan dihapus dari Inbox.', 'ok');
        });
      });

      // --- TAB 6: PENGATURAN & BACKUP ---
      const formPass = rootEl.querySelector('[data-form-password]');
      const newPassInput = rootEl.querySelector('[data-new-pass-input]');
      const strengthEl = rootEl.querySelector('[data-pass-strength]');
      newPassInput?.addEventListener('input', () => {
        if (!strengthEl) return;
        const val = newPassInput.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (val.length >= 12) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        if (!val) {
          strengthEl.textContent = 'Tips: Gunakan kombinasi huruf besar, huruf kecil, angka & simbol.';
          strengthEl.className = 'font-vt text-base text-slate-600';
        } else if (score <= 2) {
          strengthEl.textContent = 'Kekuatan Password: LEMAH (tambahkan huruf besar/angka/simbol)';
          strengthEl.className = 'font-vt text-base font-bold text-rose-700';
        } else if (score <= 3) {
          strengthEl.textContent = 'Kekuatan Password: SEDANG (cukup baik)';
          strengthEl.className = 'font-vt text-base font-bold text-amber-700';
        } else {
          strengthEl.textContent = 'Kekuatan Password: KUAT ✓ (siap dienkripsi Argon2id)';
          strengthEl.className = 'font-vt text-base font-bold text-emerald-700';
        }
      });

      formPass?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formPass);
        const curr = String(fd.get('currentPassword') || '');
        const next = String(fd.get('newPassword') || '');
        const conf = String(fd.get('confirmPassword') || '');
        if (next !== conf) {
          setStatus('Konfirmasi password baru tidak cocok.', 'err');
          return;
        }
        try {
          await changePassword(curr, next);
          formPass.reset();
          render();
          setStatus('Password Admin berhasil diperbarui & dienkripsi!', 'ok');
        } catch (err) {
          setStatus(err.message || 'Gagal mengganti password.', 'err');
        }
      });

      rootEl.querySelector('[data-export-json]')?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(draftData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio_data.json';
        a.click();
        URL.revokeObjectURL(url);
        setStatus('File portfolio_data.json berhasil diekspor.', 'ok');
      });

      rootEl.querySelector('[data-import-json]')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            if (!parsed.profile || !Array.isArray(parsed.projects) || !Array.isArray(parsed.portfolios)) {
              throw new Error('Struktur JSON tidak valid.');
            }
            draftData = normalizeData(parsed);
            await persistDraft('Data berhasil diimpor dari JSON!');
            render();
          } catch (err) {
            setStatus(err.message || 'File JSON tidak valid.', 'err');
          }
        };
        reader.readAsText(file);
      });

      rootEl.querySelector('[data-reset-default]')?.addEventListener('click', async () => {
        if (!window.confirm('Reset seluruh data portofolio kembali ke data bawaan awal?')) return;
        draftData = deepClone(DEFAULT_DATA);
        editingExpId = null;
        editingProjectId = null;
        editingPortfolioId = null;
        editingSkillId = null;
        await persistDraft('Data dikembalikan ke pengaturan bawaan.');
        render();
      });
    }

    function render() {
      if (!authenticated) {
        renderLoginView();
        return;
      }

      const unread = messages.filter((m) => !m.read).length;
      const expCount = Array.isArray(draftData.experiences) ? draftData.experiences.length : 0;
      const tabs = [
        { id: 'profil', label: '1. PROFIL & SKILL' },
        { id: 'pengalaman', label: `2. PENGALAMAN (${expCount})` },
        { id: 'project', label: `3. PROJECT (${draftData.projects.length})` },
        { id: 'portofolio', label: `4. PORTOFOLIO (${draftData.portfolios.length})` },
        { id: 'kontak', label: `5. KONTAK & SOSMED${unread > 0 ? ` [${unread}]` : ''}` },
        { id: 'pengaturan', label: '6. PENGATURAN' },
      ];

      let tabBody = '';
      if (activeTab === 'profil') tabBody = renderTabProfil();
      else if (activeTab === 'pengalaman') tabBody = renderTabPengalaman();
      else if (activeTab === 'project') tabBody = renderTabProject();
      else if (activeTab === 'portofolio') tabBody = renderTabPortofolio();
      else if (activeTab === 'kontak') tabBody = renderTabKontak();
      else tabBody = renderTabPengaturan();

      rootEl.innerHTML = `
        <div class="space-y-4">
          <!-- Bar Atas: Status Storage & Logout -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="pixel-tag ${mode === 'server' ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'} px-2 py-1 font-pixel text-[8px]">
                ${mode === 'server' ? '● LARAGON PHP + JSON' : '● OFFLINE LOCALSTORAGE'}
              </span>
              <span data-admin-status class="${statusMsg ? '' : 'hidden'} px-3 py-1 text-xs font-bold border-2 border-slate-900 ${
                statusType === 'err' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900'
              }">${escapeHtml(statusMsg)}</span>
            </div>
            <button type="button" data-admin-logout class="pixel-btn bg-rose-100 px-3 py-1.5 font-pixel text-[8px] text-rose-900">
              LOGOUT
            </button>
          </div>

          ${
            securityInfo.isDefaultPassword && activeTab !== 'pengaturan'
              ? `<div class="flex flex-wrap items-center justify-between gap-2 border-2 border-rose-900 bg-rose-100 px-3 py-2 text-xs font-bold text-rose-900">
                  <span>⚠ Password bawaan masih aktif! Demi keamanan, segera ganti di Tab 6. PENGATURAN.</span>
                  <button type="button" data-admin-tab="pengaturan" class="pixel-btn bg-white px-2 py-1 font-pixel text-[7px] text-rose-900">GANTI SEKARANG ►</button>
                </div>`
              : ''
          }

          <!-- Navigasi 6 Tab -->
          <div class="flex flex-wrap gap-1.5" role="tablist">
            ${tabs
              .map(
                (t) => `
              <button
                type="button"
                role="tab"
                data-admin-tab="${t.id}"
                class="${activeTab === t.id ? 'pixel-btn-primary' : 'pixel-btn'} px-3 py-2 font-pixel text-[8px]"
              >
                ${t.label}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- Konten Tab Aktif -->
          <div>${tabBody}</div>
        </div>
      `;

      bindAuthenticatedEvents();
    }

    render();

    return {
      refresh: async () => {
        draftData = deepClone(await loadData());
        authenticated = await checkAuth();
        if (authenticated) {
          messages = await getMessages().catch(() => []);
        }
        render();
      },
    };
  }

  global.FebCMS = {
    DEFAULT_DATA,
    detectStorageMode,
    loadData,
    saveData,
    checkAuth,
    login,
    logout,
    changePassword,
    uploadImage,
    sendMessage,
    getMessages,
    markMessageRead,
    deleteMessage,
    mountAdminPanel,
    sanitizeUrl,
  };
})(window);
