'use strict';

    /**
     * =========================================================================
     * KONFIGURASI DUNIA 2D ISOMETRIC PIXEL ART (KIRI KE KANAN BERJEJER)
     * =========================================================================
     */
    const WORLD_CONFIG = {
      width: 1760,          // Panjang lintasan dunia untuk 5 stasiun (dalam logical pixels)
      minWalkX: 70,         // Batas jalan paling kiri
      maxWalkX: 1680,       // Batas jalan paling kanan
      spawnX: 130,          // Posisi awal karakter di sisi kiri
      zoneSpacing: 300,     // Jarak seragam antar 5 bangunan stasiun
    };

    const ZONES_CONFIG = [
      {
        id: 'profil',
        key: '1',
        code: '01',
        shortLabel: 'PROFIL',
        title: 'Profil & Data Diri',
        subtitle: 'Paviliun Workstation',
        accent: '#0284c7',
        accentLight: '#38bdf8',
        accentDark: '#0369a1',
        worldX: 290,
        interactRadius: 56,
        hitbox: { w: 108, h: 92 },
        dialogId: 'dialog-profil',
      },
      {
        id: 'pengalaman',
        key: '2',
        code: '02',
        shortLabel: 'PENGALAMAN',
        title: 'Pengalaman Kerja',
        subtitle: 'Menara Karier',
        accent: '#e11d48',
        accentLight: '#fb7185',
        accentDark: '#be123c',
        worldX: 590,
        interactRadius: 56,
        hitbox: { w: 106, h: 102 },
        dialogId: 'dialog-pengalaman',
      },
      {
        id: 'project',
        key: '3',
        code: '03',
        shortLabel: 'PROJECT',
        title: 'Contoh Project',
        subtitle: 'Server & Network Tower',
        accent: '#059669',
        accentLight: '#34d399',
        accentDark: '#047857',
        worldX: 890,
        interactRadius: 56,
        hitbox: { w: 106, h: 110 },
        dialogId: 'dialog-project',
      },
      {
        id: 'portofolio',
        key: '4',
        code: '04',
        shortLabel: 'PORTOFOLIO',
        title: 'Galeri Portofolio',
        subtitle: 'Galeri Showcase Arcade',
        accent: '#4f46e5',
        accentLight: '#818cf8',
        accentDark: '#3730a3',
        worldX: 1190,
        interactRadius: 56,
        hitbox: { w: 112, h: 96 },
        dialogId: 'dialog-portofolio',
      },
      {
        id: 'kontak',
        key: '5',
        code: '05',
        shortLabel: 'KONTAK',
        title: 'Kontak',
        subtitle: 'Menara Sinyal',
        accent: '#d97706',
        accentLight: '#fbbf24',
        accentDark: '#b45309',
        worldX: 1490,
        interactRadius: 56,
        hitbox: { w: 104, h: 122 },
        dialogId: 'dialog-kontak',
      },
    ];

    // State Dinamis CMS (Dimuat dari Server PHP+JSON atau LocalStorage via FebCMS)
    let appData = window.FebCMS
      ? JSON.parse(JSON.stringify(window.FebCMS.DEFAULT_DATA))
      : { profile: { highlights: [], skills: [] }, projects: [], portfolios: [], contact: { topics: [] } };
    let activePortfolioFilter = 'all';
    let adminPanelInstance = null;

    /**
     * =========================================================================
     * STATE GLOBAL ENGINE 2D PIXEL ART
     * =========================================================================
     */
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const viewport = {
      width: 480,
      height: 270,
      scale: 3,
      groundY: 196, // Garis permukaan jalan tempat karakter berjalan
    };

    const camera = {
      x: 0,
      targetX: 0,
      zoom: 2.2,
      targetZoom: 2.2,
    };

    // State Intro Cutscene: Fokus Kamera ke Karakter + Dialog Sapaan RPG -> Zoom-Out
    const introState = {
      active: true,
      fullText:
        'Hai selamat datang di website portofolio saya, saya Achmad Febri, ingin lebih tau tentang saya? Yuk mari berjalan ke kanan untuk melihat-lihat!',
      charIndex: 0,
      typeTimer: 0,
      typeSpeed: 0.032,
      doneTyping: false,
      autoCloseTimer: 0,
      autoCloseDelay: 3.5,
    };

    const player = {
      x: WORLD_CONFIG.spawnX,
      vx: 0,
      speed: 148,         // Logical px per detik
      facing: 1,          // 1 = kanan, -1 = kiri
      walkTimer: 0,
      idleTimer: 0,
      isWalking: false,
      autoTargetX: null,
      pendingZoneId: null,
    };

    const inputState = {
      left: false,
      right: false,
      btnLeft: false,
      btnRight: false,
    };

    let isNightMode = false;
    let hoveredZoneId = null;
    let activeNearZone = null;
    let lastTimestamp = 0;
    let elapsedTime = 0;
    let toastTimeout = null;

    // Marker klik lantai & partikel debu langkah kaki
    const walkMarkers = [];
    const dustParticles = [];

    // State Efek Teleportasi (Tombol Reset)
    const teleportState = {
      active: false,
      phase: 'idle', // 'idle' | 'out' | 'travel' | 'in'
      timer: 0,
      originX: 0,
      targetX: WORLD_CONFIG.spawnX,
      outDuration: 0.42,
      travelDuration: 0.35,
      inDuration: 0.45,
    };
    const teleportParticles = [];

    // Data dekorasi lingkungan deterministik (awan, bintang, gedung latar, pohon, lampu)
    const clouds = [
      { x: 40, y: 26, w: 36, speed: 4.5 },
      { x: 185, y: 42, w: 46, speed: 3.2 },
      { x: 340, y: 22, w: 30, speed: 5.1 },
      { x: 520, y: 38, w: 42, speed: 3.8 },
      { x: 700, y: 28, w: 34, speed: 4.2 },
    ];

    const stars = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 97) % 640,
      y: 10 + ((i * 53) % 92),
      phase: i * 0.7,
      size: i % 5 === 0 ? 2 : 1,
    }));

    const skylineBuildings = [
      { x: 10, w: 34, h: 46, windows: true },
      { x: 48, w: 26, h: 32, windows: false },
      { x: 80, w: 48, h: 58, windows: true, hospitalCross: true },
      { x: 136, w: 30, h: 38, windows: true },
      { x: 174, w: 40, h: 50, windows: true },
      { x: 222, w: 28, h: 28, windows: false },
      { x: 258, w: 52, h: 64, windows: true },
      { x: 318, w: 32, h: 42, windows: true },
      { x: 358, w: 44, h: 52, windows: true },
      { x: 410, w: 30, h: 36, windows: false },
      { x: 450, w: 56, h: 60, windows: true, hospitalCross: true },
      { x: 514, w: 34, h: 44, windows: true },
      { x: 556, w: 40, h: 48, windows: true },
      { x: 604, w: 36, h: 34, windows: false },
    ];

    // Dekorasi penyela antar bangunan (berjejer rapi di antara 5 zona)
    const sceneryProps = [
      { type: 'sign-start', x: 178, text: 'MULAI ►' },
      { type: 'tree', x: 205, variant: 0 },
      { type: 'lamp', x: 392 },
      { type: 'tree', x: 426, variant: 1 },
      { type: 'bench', x: 456 },
      { type: 'sign', x: 492, text: '02 ►' },
      { type: 'lamp', x: 692 },
      { type: 'tree', x: 726, variant: 0 },
      { type: 'relay', x: 760 },
      { type: 'sign', x: 794, text: '03 ►' },
      { type: 'lamp', x: 992 },
      { type: 'bench', x: 1026 },
      { type: 'tree', x: 1062, variant: 1 },
      { type: 'sign', x: 1094, text: '04 ►' },
      { type: 'lamp', x: 1292 },
      { type: 'tree', x: 1326, variant: 0 },
      { type: 'relay', x: 1360 },
      { type: 'sign', x: 1394, text: '05 ►' },
      { type: 'lamp', x: 1590 },
      { type: 'tree', x: 1624, variant: 1 },
      { type: 'sign-end', x: 1656, text: '◄ SELESAI' },
    ];

    // Paket data bercahaya yang mengalir sepanjang jalur fiber optik kiri -> kanan
    const fiberPackets = Array.from({ length: 8 }, (_, i) => ({
      x: 100 + i * 165,
      speed: 44 + (i % 3) * 12,
      color: ZONES_CONFIG[i % ZONES_CONFIG.length].accentLight,
    }));

    /**
     * =========================================================================
     * UTILITAS PIXEL DRAWING (CRISP INTEGER COORDINATES)
     * =========================================================================
     */
    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    /**
     * Menggambar balok 2.5D Isometric Pixel Art dengan sisi depan, atap miring, dan sisi kanan bevel
     */
    function drawIsoBlock(x, y, w, h, depth, topColor, frontColor, sideColor, outline = '#0f172a') {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(w);
      const ih = Math.floor(h);
      const d = Math.floor(depth);

      // Atap (Top face bergeser ke kanan-atas sebanyak d, d/2)
      ctx.fillStyle = topColor;
      for (let i = 0; i < d; i++) {
        const dy = Math.floor(i * 0.5);
        ctx.fillRect(ix + i, iy - dy, iw, 1);
      }

      // Sisi kanan (Side face)
      ctx.fillStyle = sideColor;
      for (let i = 0; i < d; i++) {
        const dy = Math.floor(i * 0.5);
        ctx.fillRect(ix + iw + i, iy - dy, 1, ih);
      }

      // Sisi depan (Front face)
      px(ix, iy, iw, ih, frontColor);

      // Garis tepi pixel tipis agar kontras & retro
      if (outline) {
        px(ix, iy, iw, 1, outline);
        px(ix, iy + ih - 1, iw, 1, outline);
        px(ix, iy, 1, ih, outline);
        px(ix + iw - 1, iy, 1, ih, outline);
        px(ix + d, iy - Math.floor(d * 0.5), iw, 1, outline);
        px(ix + iw + d - 1, iy - Math.floor(d * 0.5), 1, ih, outline);
      }
    }

    /**
     * =========================================================================
     * RENDERING LATAR BELAKANG, PARALLAX & JALAN 2.5D ISOMETRIC
     * =========================================================================
     */
    function drawSkyAndParallax() {
      const W = viewport.width;
      const H = viewport.height;
      const horizonY = viewport.groundY - 34;

      // 1. Langit Pixel Banded (Siang / Malam)
      const skyBands = isNightMode
        ? ['#070b18', '#0c142a', '#131e3d', '#1b2b52', '#263a66']
        : ['#38bdf8', '#60c8fa', '#8dd8fc', '#bae6fd', '#e0f2fe'];

      const bandH = Math.ceil(horizonY / skyBands.length);
      skyBands.forEach((col, idx) => {
        px(0, idx * bandH, W, bandH + 1, col);
      });

      // 2. Matahari / Bulan & Bintang Pixel
      if (isNightMode) {
        stars.forEach((s) => {
          const sx = Math.floor((s.x - camera.x * 0.05 + 6400) % W);
          if (s.y < horizonY - 12) {
            const twinkle = Math.sin(elapsedTime * 3 + s.phase) > -0.3;
            if (twinkle) {
              px(sx, s.y, s.size, s.size, s.size === 2 ? '#fef08a' : '#e2e8f0');
            }
          }
        });
        // Bulan sabit pixel
        const moonX = W - 56;
        const moonY = 26;
        px(moonX, moonY, 14, 14, '#fef08a');
        px(moonX + 2, moonY - 2, 10, 18, '#fef08a');
        px(moonX + 5, moonY - 1, 10, 14, skyBands[0]);
      } else {
        // Matahari pixel hangat
        const sunX = W - 56;
        const sunY = 24;
        px(sunX - 2, sunY - 2, 20, 20, 'rgba(254, 240, 138, 0.35)');
        px(sunX, sunY, 16, 16, '#fde047');
        px(sunX + 2, sunY + 2, 12, 12, '#fef9c3');
      }

      // 3. Awan Pixel (Parallax Lambat)
      clouds.forEach((c) => {
        const cx = ((c.x + elapsedTime * c.speed - camera.x * 0.14) % (W + 120) + (W + 120)) % (W + 120) - 60;
        const cMain = isNightMode ? '#1e293b' : '#ffffff';
        const cShade = isNightMode ? '#0f172a' : '#cbd5e1';
        px(cx, c.y + 4, c.w, 6, cShade);
        px(cx + 2, c.y + 2, c.w - 4, 6, cMain);
        px(cx + 8, c.y - 2, c.w - 16, 6, cMain);
      });

      // 4. Siluet Kota & RS di Kejauhan (Parallax 0.28x)
      const bgRepeat = 640;
      const parallaxOffset = Math.floor(camera.x * 0.28);
      for (let tile = -1; tile <= Math.ceil(W / bgRepeat) + 1; tile++) {
        const baseX = tile * bgRepeat - (parallaxOffset % bgRepeat);
        skylineBuildings.forEach((b) => {
          const bx = baseX + b.x;
          if (bx + b.w < -10 || bx > W + 10) return;
          const by = horizonY - b.h;
          const bodyCol = isNightMode ? '#0f172a' : '#94a3b8';
          const sideCol = isNightMode ? '#090e1a' : '#64748b';
          px(bx, by, b.w, b.h, bodyCol);
          px(bx + b.w - 4, by + 2, 4, b.h - 2, sideCol);

          // Simbol salib/kesehatan halus pada gedung RS kejauhan
          if (b.hospitalCross) {
            const crossCol = isNightMode ? '#10b981' : '#e2e8f0';
            px(bx + Math.floor(b.w / 2) - 4, by + 6, 8, 2, crossCol);
            px(bx + Math.floor(b.w / 2) - 1, by + 3, 2, 8, crossCol);
          }

          if (b.windows) {
            const winCol = isNightMode ? '#fbbf24' : '#cbd5e1';
            for (let wy = by + 14; wy < horizonY - 6; wy += 8) {
              for (let wx = bx + 5; wx < bx + b.w - 8; wx += 7) {
                if ((wx + wy) % 3 !== 0) {
                  px(wx, wy, 3, 4, winCol);
                }
              }
            }
          }
        });
      }

      // 5. Rumput Latar Belakang & Pagar Tech Rendah (Parallax 1.0x)
      const grassTop = horizonY;
      px(0, grassTop, W, 38, isNightMode ? '#064e3b' : '#34d399');
      px(0, grassTop, W, 4, isNightMode ? '#047857' : '#10b981');

      // Tekstur rumput pixel
      const startTile = Math.floor(camera.x / 24) * 24;
      for (let gx = startTile; gx < camera.x + W + 24; gx += 24) {
        const sx = gx - camera.x;
        px(sx + 4, grassTop + 9, 3, 2, isNightMode ? '#065f46' : '#6ee7b7');
        px(sx + 14, grassTop + 17, 4, 2, isNightMode ? '#047857' : '#10b981');
      }
    }

    /**
     * Menggambar Trotoar & Jalan 2.5D Isometric Horizontal + Jalur Fiber Optik
     */
    function drawIsometricRoad() {
      const W = viewport.width;
      const H = viewport.height;
      const roadTop = viewport.groundY - 12;
      const roadHeight = 46;

      // Tepi trotoar atas (Isometric curb)
      px(0, roadTop - 3, W, 3, isNightMode ? '#334155' : '#cbd5e1');
      px(0, roadTop, W, roadHeight, isNightMode ? '#1e293b' : '#e2e8f0');

      // Garis ubin miring 2:1 khas 2.5D Isometric Belt-Scroller
      const tileSpacing = 28;
      const startX = Math.floor((camera.x - 40) / tileSpacing) * tileSpacing;
      const tileLineColor = isNightMode ? '#334155' : '#cbd5e1';

      for (let wx = startX; wx < camera.x + W + 48; wx += tileSpacing) {
        const sx = Math.floor(wx - camera.x);
        // Garis diagonal miring ke kiri-bawah (rasio isometric)
        for (let row = 0; row < roadHeight; row += 2) {
          px(sx - Math.floor(row * 0.65), roadTop + row, 2, 2, tileLineColor);
        }
      }

      // Garis horizontal pembagi jalur
      px(0, roadTop + 16, W, 1, tileLineColor);
      px(0, roadTop + 34, W, 1, tileLineColor);

      // Garis Start / Teleport Pad di WORLD_CONFIG.spawnX (130)
      const startPadSx = Math.floor(WORLD_CONFIG.spawnX - camera.x);
      if (startPadSx > -40 && startPadSx < W + 40) {
        px(startPadSx - 16, roadTop + 6, 32, 22, isNightMode ? '#0f172a' : '#cbd5e1');
        px(startPadSx - 14, roadTop + 8, 28, 18, isNightMode ? '#0369a1' : '#bae6fd');
        px(startPadSx - 12, roadTop + 10, 24, 14, isNightMode ? '#0284c7' : '#e0f2fe');
        // Pola papan catur / checkerboard start line
        for (let bx = 0; bx < 24; bx += 4) {
          px(startPadSx - 12 + bx, roadTop + 10, 2, 2, (bx / 4) % 2 === 0 ? '#0f172a' : '#ffffff');
          px(startPadSx - 12 + bx, roadTop + 22, 2, 2, (bx / 4) % 2 === 1 ? '#0f172a' : '#ffffff');
        }
        ctx.fillStyle = isNightMode ? '#7dd3fc' : '#0369a1';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◄ START', startPadSx, roadTop + 19);
      }

      // Jalur Kabel Fiber Optik di Tengah Trotoar
      const fiberY = viewport.groundY + 12;
      px(0, fiberY - 1, W, 5, isNightMode ? '#0f172a' : '#94a3b8');
      px(0, fiberY, W, 3, isNightMode ? '#0c4a6e' : '#38bdf8');
      px(0, fiberY + 1, W, 1, isNightMode ? '#38bdf8' : '#e0f2fe');

      // Paket Data Bercahaya mengalir Kiri -> Kanan
      fiberPackets.forEach((pkt) => {
        const sx = pkt.x - camera.x;
        if (sx > -16 && sx < W + 16) {
          px(sx - 2, fiberY - 1, 10, 5, 'rgba(56, 189, 248, 0.35)');
          px(sx, fiberY, 6, 3, pkt.color);
          px(sx + 4, fiberY + 1, 2, 1, '#ffffff');
        }
      });

      // Sisi fondasi bawah jalan (efek diorama melayang 2.5D)
      const bottomY = roadTop + roadHeight;
      px(0, bottomY, W, 4, isNightMode ? '#0f172a' : '#94a3b8');
      px(0, bottomY + 4, W, Math.max(0, H - (bottomY + 4)), isNightMode ? '#070b14' : '#334155');

      // Pola batu fondasi di bawah jalan
      for (let wx = startX; wx < camera.x + W + 40; wx += 32) {
        const sx = Math.floor(wx - camera.x);
        px(sx + 4, bottomY + 10, 12, 6, isNightMode ? '#0f172a' : '#475569');
        px(sx + 20, bottomY + 20, 10, 5, isNightMode ? '#0f172a' : '#475569');
      }
    }

    /**
     * =========================================================================
     * DEKORASI PENYELA ANTAR ZONA (POHON, LAMPU, BANGKU, SIGNPOST)
     * =========================================================================
     */
    function drawScenery() {
      const baseY = viewport.groundY - 14;

      sceneryProps.forEach((prop) => {
        const sx = Math.floor(prop.x - camera.x);
        if (sx < -60 || sx > viewport.width + 60) return;

        if (prop.type === 'tree') {
          const sway = Math.round(Math.sin(elapsedTime * 2 + prop.x * 0.05) * 0.8);
          // Bayangan
          px(sx - 9, baseY + 1, 20, 4, 'rgba(15,23,42,0.22)');
          // Batang
          px(sx - 2, baseY - 14, 5, 16, '#78350f');
          px(sx + 1, baseY - 14, 2, 16, '#451a03');
          // Daun pixel berlapis
          const cDark = prop.variant === 0 ? '#047857' : '#0f766e';
          const cMid = prop.variant === 0 ? '#10b981' : '#14b8a6';
          const cLight = prop.variant === 0 ? '#34d399' : '#5eead4';
          px(sx - 12 + sway, baseY - 28, 25, 14, '#0f172a');
          px(sx - 11 + sway, baseY - 27, 23, 12, cDark);
          px(sx - 9 + sway, baseY - 33, 19, 10, '#0f172a');
          px(sx - 8 + sway, baseY - 32, 17, 11, cMid);
          px(sx - 6 + sway, baseY - 31, 9, 4, cLight);
        } else if (prop.type === 'lamp') {
          px(sx - 4, baseY, 10, 3, 'rgba(15,23,42,0.25)');
          // Tiang lampu
          px(sx - 1, baseY - 38, 3, 39, '#334155');
          px(sx - 2, baseY - 4, 5, 5, '#475569');
          px(sx - 1, baseY - 38, 10, 2, '#475569');
          // Lampu & cahaya malam
          const bulbCol = isNightMode ? '#fef08a' : '#e2e8f0';
          px(sx + 6, baseY - 36, 5, 4, '#0f172a');
          px(sx + 7, baseY - 35, 3, 3, bulbCol);
          if (isNightMode) {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.14)';
            ctx.beginPath();
            ctx.moveTo(sx + 8, baseY - 32);
            ctx.lineTo(sx - 12, baseY + 14);
            ctx.lineTo(sx + 28, baseY + 14);
            ctx.closePath();
            ctx.fill();
          }
        } else if (prop.type === 'bench') {
          px(sx - 12, baseY + 1, 26, 3, 'rgba(15,23,42,0.22)');
          // Kaki bangku
          px(sx - 10, baseY - 5, 2, 6, '#1e293b');
          px(sx + 10, baseY - 5, 2, 6, '#1e293b');
          // Dudukan & sandaran
          drawIsoBlock(sx - 12, baseY - 9, 24, 4, 4, '#b45309', '#d97706', '#92400e');
          px(sx - 10, baseY - 14, 24, 3, '#b45309');
        } else if (prop.type === 'relay') {
          // Mini box router / node jaringan
          px(sx - 8, baseY + 1, 18, 3, 'rgba(15,23,42,0.22)');
          drawIsoBlock(sx - 7, baseY - 16, 14, 16, 6, '#475569', '#334155', '#1e293b');
          const blink = Math.floor(elapsedTime * 4) % 2 === 0;
          px(sx - 4, baseY - 12, 2, 2, blink ? '#34d399' : '#065f46');
          px(sx, baseY - 12, 2, 2, !blink ? '#38bdf8' : '#0369a1');
          px(sx - 4, baseY - 8, 8, 2, '#0f172a');
        } else if (prop.type === 'sign' || prop.type === 'sign-start' || prop.type === 'sign-end') {
          // Papan penunjuk arah pixel
          px(sx - 1, baseY - 18, 3, 19, '#475569');
          px(sx - 14, baseY - 26, 30, 10, '#0f172a');
          px(sx - 13, baseY - 25, 28, 8, prop.type === 'sign-start' ? '#0284c7' : prop.type === 'sign-end' ? '#d97706' : '#1e293b');
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 6px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(prop.text, sx + 1, baseY - 19);
        }
      });
    }

    /**
     * =========================================================================
     * RENDERING 4 BANGUNAN STASIUN 2.5D ISOMETRIC PIXEL (KIRI KE KANAN)
     * =========================================================================
     */
    function drawZoneBuildings() {
      const baseY = viewport.groundY - 12;

      ZONES_CONFIG.forEach((zone) => {
        const sx = Math.floor(zone.worldX - camera.x);
        if (sx < -120 || sx > viewport.width + 120) return;

        const isNear = activeNearZone?.id === zone.id;
        const isHover = hoveredZoneId === zone.id;
        const isActive = isNear || isHover;

        // 1. Platform Panggung Isometric + Glow Strip Warna Zona
        px(sx - 48, baseY + 2, 104, 6, 'rgba(15, 23, 42, 0.28)');
        drawIsoBlock(
          sx - 46,
          baseY - 4,
          92,
          8,
          10,
          isActive ? '#ffffff' : '#f1f5f9',
          '#e2e8f0',
          '#94a3b8'
        );

        // Strip neon identitas zona di tepi depan panggung
        px(sx - 45, baseY + 1, 90, 2, isActive ? zone.accentLight : zone.accent);

        // 2. Gambar Struktur Khusus Masing-Masing Zona
        if (zone.id === 'profil') {
          drawBuildingProfil(sx, baseY - 4, isActive);
        } else if (zone.id === 'pengalaman') {
          drawBuildingPengalaman(sx, baseY - 4, isActive);
        } else if (zone.id === 'project') {
          drawBuildingProject(sx, baseY - 4, isActive);
        } else if (zone.id === 'portofolio') {
          drawBuildingPortofolio(sx, baseY - 4, isActive);
        } else if (zone.id === 'kontak') {
          drawBuildingKontak(sx, baseY - 4, isActive);
        }

        // 3. Plang Nama Pixel di Atas Bangunan
        const signY =
          zone.id === 'kontak'
            ? baseY - 108
            : zone.id === 'project'
              ? baseY - 94
              : zone.id === 'pengalaman'
                ? baseY - 88
                : baseY - 82;
        const bob = isActive ? Math.round(Math.sin(elapsedTime * 6) * 1.5) : 0;
        drawZoneBanner(sx, signY + bob, zone, isActive);

        // 4. Balon Prompt Interaksi [E] saat karakter tepat di depan bangunan
        if (isNear) {
          drawInteractPrompt(sx, signY - 18 + Math.round(Math.sin(elapsedTime * 7) * 2), zone);
        }
      });
    }

    /**
     * ZONA 1: Paviliun Workstation Modern Pixel (Profil & Data Diri)
     */
    function drawBuildingProfil(sx, y, isActive) {
      // Dinding belakang kaca-biru & pilar
      drawIsoBlock(sx - 36, y - 50, 72, 46, 8, '#f8fafc', isNightMode ? '#1e293b' : '#dbeafe', '#93c5fd');

      // Jendela kaca besar di dalam paviliun
      px(sx - 30, y - 44, 60, 32, isNightMode ? '#0f172a' : '#bae6fd');
      // Kilau diagonal kaca
      px(sx - 26, y - 40, 4, 24, isNightMode ? '#1e293b' : '#e0f2fe');
      px(sx - 18, y - 40, 2, 24, isNightMode ? '#1e293b' : '#e0f2fe');

      // Meja kerja pixel di dalam
      drawIsoBlock(sx - 20, y - 16, 40, 12, 4, '#64748b', '#334155', '#1e293b');

      // Dual Monitor dengan baris kode berkedip
      const codeTick = Math.floor(elapsedTime * 3) % 3;
      [-13, 2].forEach((mx, idx) => {
        px(sx + mx, y - 28, 13, 9, '#0f172a');
        px(sx + mx + 1, y - 27, 11, 7, '#0c4a6e');
        // Baris kode pixel
        px(sx + mx + 2, y - 26, 6 + (codeTick === idx ? 2 : 0), 1, '#38bdf8');
        px(sx + mx + 2, y - 24, 8, 1, '#34d399');
        px(sx + mx + 2, y - 22, 5, 1, '#f8fafc');
        // Stand monitor
        px(sx + mx + 5, y - 19, 3, 3, '#1e293b');
      });

      // Kursi kerja biru
      px(sx - 4, y - 13, 8, 8, '#0284c7');
      px(sx - 3, y - 12, 6, 4, '#38bdf8');

      // Kanopi atap isometric
      drawIsoBlock(sx - 40, y - 56, 80, 7, 10, '#ffffff', '#0284c7', '#0369a1');
      if (isActive) {
        px(sx - 38, y - 51, 76, 2, '#7dd3fc');
      }
    }

    /**
     * ZONA 2: Menara Karier & Alur Pengalaman Kerja (Animated Flowing Current Facade)
     */
    function drawBuildingPengalaman(sx, y, isActive) {
      // Struktur gedung utama Menara Karier
      drawIsoBlock(sx - 34, y - 56, 68, 52, 8, '#f8fafc', isNightMode ? '#1e293b' : '#ffe4e6', '#fda4af');

      // Layar panel gelap besar di depan gedung untuk visual alur arus berjalan
      px(sx - 28, y - 48, 56, 38, '#0f172a');
      px(sx - 27, y - 47, 54, 36, '#1e293b');

      // Jalur pipa vertikal arus berjalan di tengah panel
      px(sx - 18, y - 44, 3, 30, '#0284c7');
      // Pulsa cahaya arus berjalan (mengalir dari atas ke bawah)
      const flowOffset = Math.floor(elapsedTime * 22) % 28;
      px(sx - 18, y - 44 + flowOffset, 3, 4, '#ffffff');
      px(sx - 18, y - 44 + ((flowOffset + 14) % 28), 3, 4, '#fb7185');

      // 3 Node milestone pengalaman + garis cabang & bar info mini
      [0, 1, 2].forEach((i) => {
        const ny = y - 42 + i * 10;
        const activePulse = Math.floor(elapsedTime * 3) % 3 === i;
        // Node titik di jalur
        px(sx - 19, ny, 5, 5, i === 0 ? '#e11d48' : activePulse ? '#38bdf8' : '#0ea5e9');
        px(sx - 18, ny + 1, 3, 3, '#ffffff');
        // Garis cabang horizontal
        px(sx - 14, ny + 2, 6, 1, activePulse ? '#fbbf24' : '#38bdf8');
        // Kartu bar mini pengalaman
        px(sx - 8, ny, 31, 6, i === 0 ? '#334155' : '#0f172a');
        px(sx - 6, ny + 2, i === 0 ? 22 : 16, 2, i === 0 ? '#fb7185' : '#38bdf8');
      });

      // Pintu masuk bawah & karpet rose
      px(sx - 7, y - 10, 14, 10, '#0f172a');
      px(sx - 5, y - 8, 10, 8, isActive ? '#fb7185' : '#e11d48');

      // Atap isometric aksen Rose
      drawIsoBlock(sx - 38, y - 62, 76, 7, 10, '#ffffff', '#e11d48', '#be123c');
      // Menara sinyal kecil di atap
      px(sx - 1, y - 70, 3, 8, '#475569');
      const beaconOn = Math.floor(elapsedTime * 4) % 2 === 0;
      px(sx - 2, y - 72, 5, 3, beaconOn ? '#fb7185' : '#9f1239');
      if (isActive) {
        px(sx - 36, y - 57, 72, 2, '#fda4af');
      }
    }

    /**
     * ZONA 3: Server Rack & Network Node Tower (Contoh Project)
     */
    function drawBuildingProject(sx, y, isActive) {
      // Dua menara rak server berjajar
      [-28, 4].forEach((rx, rackIdx) => {
        drawIsoBlock(sx + rx, y - 58, 24, 54, 8, '#334155', '#1e293b', '#0f172a');

        // 5 Slot server blade + LED berkedip
        for (let i = 0; i < 5; i++) {
          const by = y - 52 + i * 9;
          px(sx + rx + 3, by, 18, 6, '#0f172a');
          px(sx + rx + 4, by + 1, 16, 4, '#334155');

          const blink1 = Math.sin(elapsedTime * 5 + i + rackIdx) > 0;
          const blink2 = Math.cos(elapsedTime * 4 + i * 1.4) > 0;
          px(sx + rx + 6, by + 2, 2, 2, blink1 ? '#34d399' : '#065f46');
          px(sx + rx + 10, by + 2, 2, 2, blink2 ? '#38bdf8' : '#0c4a6e');
          px(sx + rx + 14, by + 2, 2, 2, i === 2 ? '#fbbf24' : '#475569');
        }
      });

      // Bridge Switch penghubung di atas kedua rak
      drawIsoBlock(sx - 30, y - 65, 60, 7, 8, '#34d399', '#059669', '#047857');

      // Kristal Data Network melayang di atas tower
      const orbY = y - 78 + Math.round(Math.sin(elapsedTime * 3.5) * 2.5);
      px(sx - 2, orbY - 6, 8, 12, '#0f172a');
      px(sx - 1, orbY - 5, 6, 10, '#059669');
      px(sx, orbY - 4, 4, 6, isActive ? '#a7f3d0' : '#34d399');
      px(sx + 1, orbY - 3, 2, 2, '#ffffff');
    }

    /**
     * ZONA 3: Galeri Showcase Arcade & Hologram (Portofolio)
     */
    function drawBuildingPortofolio(sx, y, isActive) {
      // Bangunan panggung galeri modern
      drawIsoBlock(sx - 38, y - 48, 76, 44, 8, '#e0e7ff', isNightMode ? '#1e1b4b' : '#eef2ff', '#a5b4fc');

      // Podium pameran di tengah
      drawIsoBlock(sx - 18, y - 12, 36, 8, 6, '#c7d2fe', '#6366f1', '#4338ca');

      // 3 Layar Hologram Melayang
      const screens = [
        { ox: -30, oy: -38, col: '#818cf8', phase: 0 },
        { ox: -10, oy: -44, col: '#38bdf8', phase: 1.2 },
        { ox: 10, oy: -38, col: '#34d399', phase: 2.4 },
      ];

      screens.forEach((sc) => {
        const floatY = Math.round(Math.sin(elapsedTime * 3 + sc.phase) * 2);
        const sy = y + sc.oy + floatY;
        // Bingkai hologram
        px(sx + sc.ox, sy, 20, 14, '#1e1b4b');
        px(sx + sc.ox + 1, sy + 1, 18, 12, '#0f172a');
        // Header mini UI
        px(sx + sc.ox + 2, sy + 2, 16, 2, sc.col);
        // Grafik / konten pixel mini
        px(sx + sc.ox + 3, sy + 6, 6, 5, sc.col);
        px(sx + sc.ox + 11, sy + 6, 6, 2, '#e2e8f0');
        px(sx + sc.ox + 11, sy + 9, 4, 2, '#94a3b8');
        // Pancaran cahaya bawah hologram
        px(sx + sc.ox + 6, sy + 14, 8, 3, 'rgba(129, 140, 248, 0.35)');
      });

      // Atap galeri dengan aksen indigo
      drawIsoBlock(sx - 40, y - 55, 80, 7, 10, '#ffffff', '#4f46e5', '#3730a3');
      if (isActive) {
        px(sx - 38, y - 50, 76, 2, '#a5b4fc');
      }
    }

    /**
     * ZONA 4: Menara Sinyal & Hub Komunikasi (Kontak)
     */
    function drawBuildingKontak(sx, y, isActive) {
      // Bunker basis stasiun komunikasi
      drawIsoBlock(sx - 28, y - 24, 56, 20, 8, '#64748b', '#334155', '#1e293b');
      // Pintu & panel stasiun
      px(sx - 6, y - 16, 12, 12, '#0f172a');
      px(sx - 5, y - 15, 10, 11, '#d97706');
      px(sx - 3, y - 13, 6, 4, '#fef3c7');

      // Menara tirus pixel bertingkat
      drawIsoBlock(sx - 12, y - 46, 24, 22, 6, '#f8fafc', '#e2e8f0', '#94a3b8');
      drawIsoBlock(sx - 7, y - 66, 14, 20, 5, '#fef3c7', '#f59e0b', '#b45309');
      // Tiang antena puncak
      px(sx - 1, y - 84, 4, 18, '#0f172a');
      px(sx, y - 84, 2, 18, '#f8fafc');

      // Beacon pemancar berkedip
      const pulse = Math.sin(elapsedTime * 5) > 0;
      px(sx - 3, y - 89, 8, 6, '#0f172a');
      px(sx - 2, y - 88, 6, 4, pulse || isActive ? '#fef08a' : '#f59e0b');

      // Gelombang sinyal melingkar pixel
      for (let i = 0; i < 2; i++) {
        const t = (elapsedTime * 0.7 + i * 0.5) % 1;
        const r = Math.floor(6 + t * 24);
        ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - t) * 0.85})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.floor(sx + 1 - r), Math.floor(y - 86 - r * 0.55), r * 2, Math.floor(r * 1.1));
      }
    }

    /**
     * Plang Nama Pixel di Atas Setiap Bangunan
     */
    function drawZoneBanner(sx, y, zone, isActive) {
      const label = `${zone.code}. ${zone.shortLabel}`;
      const w = 68;
      const h = 13;
      const bx = sx - Math.floor(w / 2);

      px(bx, y, w, h, '#0f172a');
      px(bx + 1, y + 1, w - 2, h - 2, isActive ? zone.accent : '#ffffff');
      // Panah kecil bawah
      px(sx - 2, y + h, 5, 2, '#0f172a');
      px(sx - 1, y + h, 3, 1, isActive ? zone.accent : '#ffffff');

      ctx.fillStyle = isActive ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, sx, y + 9);
    }

    /**
     * Balon Prompt [E] BUKA saat karakter berdiri di depan zona
     */
    function drawInteractPrompt(sx, y, zone) {
      const text = `[E] BUKA ${zone.shortLabel}`;
      const w = 78;
      const h = 14;
      const bx = sx - Math.floor(w / 2);

      px(bx, y, w, h, '#0f172a');
      px(bx + 1, y + 1, w - 2, h - 2, '#fbbf24');
      px(bx + 1, y + 1, w - 2, 2, '#fef08a');

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, sx, y + 10);
    }

    /**
     * =========================================================================
     * RENDERING KARAKTER AVATAR PIXEL ART (ACHMAD FEBRI)
     * =========================================================================
     */
    function drawPlayerAvatar() {
      // Jika dalam fase travel teleport, karakter tidak digambar (sedang meluncur)
      if (teleportState.active && teleportState.phase === 'travel') {
        return;
      }

      const sx = Math.floor(player.x - camera.x);
      const baseY = viewport.groundY + 6;

      ctx.save();
      // Efek distorsi/stretch teleportasi jika sedang out atau in
      if (teleportState.active) {
        let scaleX = 1;
        let scaleY = 1;
        let alpha = 1;
        if (teleportState.phase === 'out') {
          const p = Math.min(1, teleportState.timer / teleportState.outDuration);
          scaleX = 1 - p * 0.85; // 1 -> 0.15
          scaleY = 1 + p * 0.75; // 1 -> 1.75
          alpha = Math.max(0, 1 - p * 1.15);
        } else if (teleportState.phase === 'in') {
          const p = Math.min(1, teleportState.timer / teleportState.inDuration);
          scaleX = 0.15 + p * 0.85; // 0.15 -> 1
          scaleY = 1.75 - p * 0.75; // 1.75 -> 1
          alpha = Math.min(1, p * 1.3);
        }
        ctx.globalAlpha = alpha;
        ctx.translate(sx, baseY);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-sx, -baseY);
      }

      // Bayangan kontak di tanah
      px(sx - 7, baseY - 1, 14, 4, 'rgba(15, 23, 42, 0.32)');

      // Animasi jalan 4-frame & idle breathing
      const walkFrame = player.isWalking ? Math.floor(player.walkTimer * 10) % 4 : 0;
      const bobY = player.isWalking
        ? (walkFrame === 1 || walkFrame === 3 ? -1 : 0)
        : (Math.sin(elapsedTime * 3.5) > 0.5 ? -1 : 0);

      const legOffsetL = walkFrame === 1 ? -2 : walkFrame === 3 ? 2 : 0;
      const legOffsetR = -legOffsetL;
      const armSwing = walkFrame === 1 ? 2 : walkFrame === 3 ? -2 : 0;

      const py = baseY + bobY;
      const dir = player.facing; // 1 = kanan, -1 = kiri

      // Kaki Kiri & Kanan (Celana gelap + sepatu)
      px(sx - 4 + legOffsetL, py - 9, 4, 8, '#0f172a');
      px(sx - 3 + legOffsetL, py - 8, 2, 5, '#334155');
      px(sx - 4 + legOffsetL, py - 2, 4, 2, '#f8fafc'); // sepatu

      px(sx + 1 + legOffsetR, py - 9, 4, 8, '#0f172a');
      px(sx + 2 + legOffsetR, py - 8, 2, 5, '#334155');
      px(sx + 1 + legOffsetR, py - 2, 4, 2, '#f8fafc'); // sepatu

      // Lengan belakang
      px(sx - 6 * dir - armSwing, py - 18, 3, 7, '#0369a1');

      // Badan (Jaket IT Sky/Teal dengan garis ID badge)
      px(sx - 6, py - 20, 12, 12, '#0f172a');
      px(sx - 5, py - 19, 10, 10, '#0284c7');
      px(sx - 4, py - 19, 4, 9, '#38bdf8'); // highlight jaket
      // Kaos dalam / badge IT putih
      px(sx + (dir > 0 ? 1 : -3), py - 17, 2, 4, '#f8fafc');

      // Lengan depan (atau melambaikan tangan saat Intro Sapaan)
      if (introState.active) {
        const wave = Math.round(Math.sin(elapsedTime * 11) * 1.5);
        px(sx + 5, py - 24 + wave, 3, 7, '#0f172a');
        px(sx + 6, py - 23 + wave, 2, 5, '#0ea5e9');
        px(sx + 6, py - 25 + wave, 2, 2, '#fcd34d'); // tangan melambai ke atas
      } else {
        px(sx + (dir > 0 ? -7 : 4) + armSwing, py - 18, 3, 7, '#0f172a');
        px(sx + (dir > 0 ? -6 : 5) + armSwing, py - 17, 2, 5, '#0ea5e9');
        px(sx + (dir > 0 ? -6 : 5) + armSwing, py - 12, 2, 2, '#fcd34d'); // tangan
      }

      // Kepala & Rambut Pixel
      px(sx - 6, py - 31, 12, 11, '#0f172a');
      px(sx - 5, py - 30, 10, 9, '#fde68a'); // wajah
      // Rambut gelap rapi
      px(sx - 5, py - 31, 10, 3, '#1e293b');
      px(sx + (dir > 0 ? -5 : 3), py - 28, 2, 4, '#1e293b');

      // Kacamata / Visor Tech menghadap arah jalan
      if (dir > 0) {
        px(sx - 1, py - 26, 6, 3, '#0f172a');
        px(sx, py - 25, 4, 1, '#38bdf8');
      } else {
        px(sx - 5, py - 26, 6, 3, '#0f172a');
        px(sx - 4, py - 25, 4, 1, '#38bdf8');
      }

      // Balon kecil "HAI!" di atas karakter selama Intro Sapaan
      if (introState.active) {
        const bY = py - 45 + Math.round(Math.sin(elapsedTime * 5) * 1.2);
        px(sx + 5, bY, 24, 11, '#0f172a');
        px(sx + 6, bY + 1, 22, 9, '#ffffff');
        px(sx + 7, bY + 11, 3, 2, '#0f172a');
        px(sx + 8, bY + 10, 2, 2, '#ffffff');
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HAI!', sx + 17, bY + 8);
      }

      ctx.restore();
    }

    /**
     * Marker klik lantai & debu langkah kaki pixel
     */
    function drawEffects() {
      // Walk markers
      for (let i = walkMarkers.length - 1; i >= 0; i--) {
        const m = walkMarkers[i];
        const sx = Math.floor(m.x - camera.x);
        const alpha = 1 - m.age / m.maxAge;
        const r = Math.floor(3 + (m.age / m.maxAge) * 10);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - r, viewport.groundY + 4 - Math.floor(r * 0.4), r * 2, Math.floor(r * 0.8));
      }

      // Dust particles
      dustParticles.forEach((p) => {
        const sx = Math.floor(p.x - camera.x);
        const alpha = Math.max(0, 1 - p.age / p.maxAge);
        ctx.fillStyle = isNightMode
          ? `rgba(148, 163, 184, ${alpha * 0.6})`
          : `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fillRect(sx, Math.floor(p.y), p.size, p.size);
      });
    }

    /**
     * Efek Sinar Beam, Ground Ring & Partikel Cahaya Teleportasi Retro
     */
    function drawTeleportEffects() {
      // 1. Partikel Teleportasi
      teleportParticles.forEach((p) => {
        const psx = Math.floor(p.x - camera.x);
        const alpha = Math.max(0, 1 - p.age / p.maxAge);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(psx, Math.floor(p.y), p.size, p.size);
        ctx.restore();
      });

      // 2. Berkas Sinar Beam Vertikal & Ground Ring saat Teleport Active
      if (teleportState.active && (teleportState.phase === 'out' || teleportState.phase === 'in')) {
        const isOut = teleportState.phase === 'out';
        const progress = isOut
          ? Math.min(1, teleportState.timer / teleportState.outDuration)
          : Math.min(1, teleportState.timer / teleportState.inDuration);
        const targetWorldX = isOut ? teleportState.originX : player.x;
        const sx = Math.floor(targetWorldX - camera.x);
        const baseY = viewport.groundY + 6;

        const beamIntensity = isOut
          ? (progress < 0.65 ? progress / 0.65 : 1 - (progress - 0.65) / 0.35)
          : (progress < 0.35 ? progress / 0.35 : 1 - (progress - 0.35) / 0.65);

        ctx.save();
        // Cincin lantai bercahaya (ground ring)
        const ringWidth = Math.floor(18 + beamIntensity * 12);
        const ringAlpha = Math.max(0, Math.min(1, beamIntensity * 0.85));
        ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - Math.floor(ringWidth / 2), baseY - 2, ringWidth, 4);

        // Beam vertikal penuh dari langit ke tanah
        const beamW = Math.floor(10 + beamIntensity * 8);
        const beamH = baseY + 10;

        // Outer glow
        ctx.fillStyle = `rgba(14, 165, 233, ${beamIntensity * 0.35})`;
        ctx.fillRect(sx - Math.floor(beamW * 0.9), 0, Math.floor(beamW * 1.8), beamH);

        // Core cyan beam
        ctx.fillStyle = `rgba(56, 189, 248, ${beamIntensity * 0.65})`;
        ctx.fillRect(sx - Math.floor(beamW / 2), 0, beamW, beamH);

        // Ultra bright white center line
        ctx.fillStyle = `rgba(255, 255, 255, ${beamIntensity * 0.9})`;
        ctx.fillRect(sx - 2, 0, 4, beamH);

        // Shockwave ring saat fase 'in' (pendaratan)
        if (!isOut && progress > 0.35) {
          const waveP = (progress - 0.35) / 0.65;
          const waveR = Math.floor(10 + waveP * 30);
          const waveAlpha = Math.max(0, (1 - waveP) * 0.75);
          ctx.strokeStyle = `rgba(251, 191, 36, ${waveAlpha})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(sx - waveR, baseY - Math.floor(waveR * 0.25), waveR * 2, Math.floor(waveR * 0.5));
        }

        ctx.restore();
      }
    }

    /**
     * =========================================================================
     * KONTROL INTRO SAPAAN & TRANSISI ZOOM-OUT KE TAMPILAN NORMAL
     * =========================================================================
     */
    function finishIntroGreeting() {
      if (!introState.active) return;
      introState.active = false;
      introState.doneTyping = true;
      camera.targetZoom = 1.0;

      const overlay = document.getElementById('intro-greeting-overlay');
      if (overlay) {
        overlay.classList.add('is-hidden');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 320);
      }

      // Tampilkan seluruh HUD utama kembali dengan transisi mulus
      document.querySelectorAll('[data-hud-element]').forEach((el) => {
        el.classList.remove('hud-hidden-intro');
      });

      showToast('GUNAKAN [D / ► / SCROLL BAWAH] UNTUK JALAN KE KANAN!');
    }

    function advanceIntroGreeting() {
      if (!introState.active) return;
      const textEl = document.getElementById('intro-greeting-text');
      const hintEl = document.getElementById('intro-auto-hint');
      if (!introState.doneTyping) {
        // Selesaikan ketikan teks secara instan pada klik pertama
        introState.charIndex = introState.fullText.length;
        introState.doneTyping = true;
        if (textEl) {
          textEl.textContent = introState.fullText;
          textEl.classList.remove('is-typing');
        }
        if (hintEl) hintEl.textContent = 'Klik tombol atau tekan Enter untuk mulai...';
      } else {
        finishIntroGreeting();
      }
    }

    function updateIntroState(dt) {
      if (!introState.active) return;
      const textEl = document.getElementById('intro-greeting-text');
      const hintEl = document.getElementById('intro-auto-hint');

      if (!introState.doneTyping) {
        introState.typeTimer += dt;
        while (introState.typeTimer >= introState.typeSpeed && introState.charIndex < introState.fullText.length) {
          introState.typeTimer -= introState.typeSpeed;
          introState.charIndex += 1;
        }
        if (textEl) {
          textEl.textContent = introState.fullText.slice(0, introState.charIndex);
        }
        if (introState.charIndex >= introState.fullText.length) {
          introState.doneTyping = true;
          textEl?.classList.remove('is-typing');
          if (hintEl) hintEl.textContent = 'Zoom-out otomatis sebentar lagi...';
        }
      } else {
        introState.autoCloseTimer += dt;
        if (introState.autoCloseTimer >= introState.autoCloseDelay) {
          finishIntroGreeting();
        }
      }
    }

    function spawnTeleportParticles(worldX, mode) {
      const count = mode === 'out' ? 24 : 20;
      for (let i = 0; i < count; i++) {
        teleportParticles.push({
          x: worldX + (Math.random() - 0.5) * 20,
          y: viewport.groundY + 4 - (mode === 'out' ? Math.random() * 26 : 18 + Math.random() * 28),
          vx: (Math.random() - 0.5) * 24,
          vy: mode === 'out' ? -35 - Math.random() * 55 : 25 + Math.random() * 45,
          size: Math.random() > 0.5 ? 2 : 1,
          color: ['#e0f2fe', '#38bdf8', '#0ea5e9', '#fbbf24'][Math.floor(Math.random() * 4)],
          age: 0,
          maxAge: 0.35 + Math.random() * 0.2,
        });
      }
    }

    function updateTeleportState(dt) {
      // Update masa hidup seluruh partikel teleport
      for (let i = teleportParticles.length - 1; i >= 0; i--) {
        const p = teleportParticles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.maxAge) {
          teleportParticles.splice(i, 1);
        }
      }

      if (!teleportState.active) return;
      teleportState.timer += dt;

      if (teleportState.phase === 'out') {
        // Partikel energi melesat ke atas
        if (Math.random() < dt * 45) {
          teleportParticles.push({
            x: teleportState.originX + (Math.random() - 0.5) * 16,
            y: viewport.groundY - Math.random() * 24,
            vx: (Math.random() - 0.5) * 14,
            vy: -40 - Math.random() * 50,
            size: Math.random() > 0.4 ? 2 : 1,
            color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
            age: 0,
            maxAge: 0.35,
          });
        }
        if (teleportState.timer >= teleportState.outDuration) {
          teleportState.phase = 'travel';
          teleportState.timer = 0;
          player.x = teleportState.targetX;
          player.facing = 1;
          player.vx = 0;
          player.isWalking = false;
        }
      } else if (teleportState.phase === 'travel') {
        if (teleportState.timer >= teleportState.travelDuration) {
          teleportState.phase = 'in';
          teleportState.timer = 0;
          spawnTeleportParticles(player.x, 'in');
        }
      } else if (teleportState.phase === 'in') {
        // Partikel pendaratan menyatu
        if (Math.random() < dt * 30) {
          teleportParticles.push({
            x: player.x + (Math.random() - 0.5) * 18,
            y: viewport.groundY - 10 - Math.random() * 20,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() > 0.3 ? 2 : 1,
            color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24',
            age: 0,
            maxAge: 0.3,
          });
        }
        if (teleportState.timer >= teleportState.inDuration) {
          teleportState.active = false;
          teleportState.phase = 'idle';
          teleportState.timer = 0;
          // Spawn landing dust di garis start
          for (let i = 0; i < 8; i++) {
            dustParticles.push({
              x: player.x,
              y: viewport.groundY + 5,
              vx: (Math.random() - 0.5) * 36,
              vy: -6 - Math.random() * 10,
              size: Math.random() > 0.5 ? 2 : 1,
              age: 0,
              maxAge: 0.4,
            });
          }
          showToast('⚡ TIBA DI GARIS START!');
        }
      }
    }

    /**
     * =========================================================================
     * LOGIKA UPDATE FISIKA, KAMERA & INTERAKSI
     * =========================================================================
     */
    function updateGame(dt) {
      elapsedTime += dt;
      updateIntroState(dt);
      updateTeleportState(dt);

      // 1. Cek apakah ada dialog modal sedang terbuka atau intro masih aktif atau sedang teleport
      const hasOpenDialog = Boolean(document.querySelector('dialog.zone-dialog[open]')) || introState.active || teleportState.active;

      // 2. Hitung arah gerakan manual (Keyboard / Tombol Kiri-Kanan Layar)
      let moveDir = 0;
      if (!hasOpenDialog) {
        if (inputState.left || inputState.btnLeft) moveDir -= 1;
        if (inputState.right || inputState.btnRight) moveDir += 1;
      }

      if (moveDir !== 0) {
        // Input manual membatalkan auto-walk
        player.autoTargetX = null;
        player.pendingZoneId = null;
        player.vx = moveDir * player.speed;
        player.facing = moveDir;
      } else if (player.autoTargetX !== null && !hasOpenDialog) {
        const diff = player.autoTargetX - player.x;
        if (Math.abs(diff) > 3) {
          const dir = Math.sign(diff);
          player.vx = dir * player.speed;
          player.facing = dir;
        } else {
          player.x = player.autoTargetX;
          player.vx = 0;
          player.autoTargetX = null;
          if (player.pendingZoneId) {
            const zId = player.pendingZoneId;
            player.pendingZoneId = null;
            openZoneDialog(zId);
          }
        }
      } else {
        player.vx = 0;
      }

      // 3. Terapkan pergerakan & batas dunia
      if (player.vx !== 0) {
        player.x = Math.max(
          WORLD_CONFIG.minWalkX,
          Math.min(WORLD_CONFIG.maxWalkX, player.x + player.vx * dt)
        );
        player.isWalking = true;
        player.walkTimer += dt;

        // Spawn partikel debu langkah kaki secara periodik
        if (Math.random() < dt * 11) {
          dustParticles.push({
            x: player.x - player.facing * 4,
            y: viewport.groundY + 5,
            vx: -player.facing * (10 + Math.random() * 14),
            vy: -6 - Math.random() * 8,
            size: Math.random() > 0.5 ? 2 : 1,
            age: 0,
            maxAge: 0.35,
          });
        }
      } else {
        player.isWalking = false;
        player.walkTimer = 0;
      }

      // 4. Kamera Side-Scrolling Halus & Transisi Zoom mengikuti Player
      const camTargetPlayerX = (teleportState.active && teleportState.phase === 'travel') ? teleportState.targetX : player.x;
      const desiredCamX = camTargetPlayerX - viewport.width * 0.48;
      const maxCamX = Math.max(0, WORLD_CONFIG.width - viewport.width);
      camera.targetX = Math.max(0, Math.min(maxCamX, desiredCamX));
      const camSmoothRate = (teleportState.active && teleportState.phase === 'travel') ? 14 : 8;
      camera.x += (camera.targetX - camera.x) * (1 - Math.exp(-camSmoothRate * dt));
      camera.zoom += (camera.targetZoom - camera.zoom) * (1 - Math.exp(-4.2 * dt));
      if (Math.abs(camera.zoom - camera.targetZoom) < 0.004) {
        camera.zoom = camera.targetZoom;
      }

      // 5. Deteksi Kedekatan dengan 4 Stasiun Zona
      let foundZone = null;
      for (const z of ZONES_CONFIG) {
        if (Math.abs(player.x - z.worldX) <= z.interactRadius) {
          foundZone = z;
          break;
        }
      }

      if (foundZone?.id !== activeNearZone?.id) {
        activeNearZone = foundZone;
        updateZoneProximityHUD();
      }

      // 6. Update Mini-map Player Dot
      const minimapDot = document.getElementById('minimap-player-dot');
      if (minimapDot) {
        const pct = ((player.x - WORLD_CONFIG.minWalkX) / (WORLD_CONFIG.maxWalkX - WORLD_CONFIG.minWalkX)) * 92 + 4;
        minimapDot.style.left = `${pct.toFixed(1)}%`;
      }

      // 7. Update Paket Data Fiber Optik
      fiberPackets.forEach((pkt) => {
        pkt.x += pkt.speed * dt;
        if (pkt.x > WORLD_CONFIG.width + 20) {
          pkt.x = -20;
        }
      });

      // 8. Update Efek Walk Markers & Dust
      for (let i = walkMarkers.length - 1; i >= 0; i--) {
        walkMarkers[i].age += dt;
        if (walkMarkers[i].age >= walkMarkers[i].maxAge) {
          walkMarkers.splice(i, 1);
        }
      }

      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const p = dustParticles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.maxAge) {
          dustParticles.splice(i, 1);
        }
      }
    }

    function renderGame() {
      ctx.imageSmoothingEnabled = false;
      ctx.save();

      if (camera.zoom > 1.001) {
        // Fokuskan zoom tepat pada karakter Achmad Febri, diposisikan pas di atas kotak dialog RPG
        const zoomProgress = Math.min(1, (camera.zoom - 1) / (2.2 - 1));
        const focusX = player.x - camera.x;
        const focusY = viewport.groundY - 14;
        const targetScreenX = viewport.width * 0.5;
        const targetScreenY = viewport.height * 0.42;

        const tx = focusX + (targetScreenX - focusX) * zoomProgress;
        const ty = focusY + (targetScreenY - focusY) * zoomProgress;

        ctx.translate(tx, ty);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-focusX, -focusY);
      }

      drawSkyAndParallax();
      drawIsometricRoad();
      drawScenery();
      drawZoneBuildings();
      drawEffects();
      drawPlayerAvatar();
      drawTeleportEffects();

      ctx.restore();
    }

    function gameLoop(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      updateGame(dt);
      renderGame();
      requestAnimationFrame(gameLoop);
    }

    /**
     * =========================================================================
     * RESIZE KANVAS DENGAN INTEGER PIXEL SCALING (CRISP PIXEL ART)
     * =========================================================================
     */
    function handleResize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Pilih skala pixel bulat agar tidak ada distorsi subpixel
      const idealScale = vw < 640 ? 2 : vw < 1280 ? 3 : 4;
      viewport.scale = idealScale;
      viewport.width = Math.max(240, Math.ceil(vw / idealScale));
      viewport.height = Math.max(180, Math.ceil(vh / idealScale));

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      ctx.imageSmoothingEnabled = false;

      // Posisikan jalan secara proporsional agar header & kontrol bawah tidak menutupi karakter
      viewport.groundY = Math.floor(viewport.height * 0.65);
    }

    /**
     * =========================================================================
     * UTILITAS UI, DIALOG, & NAVIGASI ZONA
     * =========================================================================
     */
    function showToast(message) {
      const toast = document.getElementById('status-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
      }, 2200);
    }

    function updateZoneProximityHUD() {
      const btnInteract = document.getElementById('btn-interact-zone');
      const btnInteractLabel = document.getElementById('btn-interact-label');
      const hudStatus = document.getElementById('hud-zone-status');

      if (activeNearZone) {
        btnInteract?.classList.remove('hidden');
        btnInteract?.classList.add('flex');
        if (btnInteractLabel) btnInteractLabel.textContent = `BUKA ${activeNearZone.shortLabel}`;
        if (hudStatus) hudStatus.textContent = `STASIUN ${activeNearZone.code}: ${activeNearZone.shortLabel}`;
      } else {
        btnInteract?.classList.add('hidden');
        btnInteract?.classList.remove('flex');
        if (hudStatus) hudStatus.textContent = 'JALUR UTAMA';
      }

      // Highlight tombol nav bawah yang sedang didekati
      document.querySelectorAll('.zone-nav-btn').forEach((btn) => {
        const isCurrent = activeNearZone && btn.dataset.zoneNav === activeNearZone.id;
        btn.classList.toggle('bg-amber-200', Boolean(isCurrent));
        btn.classList.toggle('border-slate-900', Boolean(isCurrent));
      });
    }

    function openZoneDialog(zoneId) {
      document.querySelectorAll('dialog.zone-dialog[open]').forEach((d) => d.close());
      const cfg = ZONES_CONFIG.find((z) => z.id === zoneId);
      if (!cfg) return;
      const dialog = document.getElementById(cfg.dialogId);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    }

    function navigateToZone(zoneId, shouldOpenDialog = true) {
      if (teleportState.active) return;
      const cfg = ZONES_CONFIG.find((z) => z.id === zoneId);
      if (!cfg) return;

      document.querySelectorAll('dialog.zone-dialog[open]').forEach((d) => d.close());
      player.autoTargetX = cfg.worldX;
      player.pendingZoneId = shouldOpenDialog ? cfg.id : null;
      walkMarkers.push({ x: cfg.worldX, age: 0, maxAge: 0.65 });
      showToast(`MENUJU STASIUN ${cfg.code}: ${cfg.shortLabel}`);

      // Jika sudah sangat dekat, langsung buka dialog
      if (shouldOpenDialog && Math.abs(player.x - cfg.worldX) <= 18) {
        player.autoTargetX = null;
        player.pendingZoneId = null;
        openZoneDialog(cfg.id);
      }
    }

    function resetPlayerPosition() {
      if (introState.active || teleportState.active) return;
      document.querySelectorAll('dialog.zone-dialog[open]').forEach((d) => d.close());
      player.autoTargetX = null;
      player.pendingZoneId = null;
      player.vx = 0;
      player.isWalking = false;

      teleportState.active = true;
      teleportState.phase = 'out';
      teleportState.timer = 0;
      teleportState.originX = player.x;
      teleportState.targetX = WORLD_CONFIG.spawnX;
      teleportState.travelDuration = Math.abs(player.x - WORLD_CONFIG.spawnX) < 30 ? 0.12 : 0.35;

      spawnTeleportParticles(player.x, 'out');
      showToast('⚡ TELEPORT KE GARIS START...');
    }

    function toggleDayNight() {
      isNightMode = !isNightMode;
      const icon = document.getElementById('icon-theme');
      const label = document.getElementById('label-theme');
      if (isNightMode) {
        if (icon) icon.textContent = '☾';
        if (label) label.textContent = 'MALAM';
        showToast('MODE MALAM AKTIF');
      } else {
        if (icon) icon.textContent = '☀';
        if (label) label.textContent = 'SIANG';
        showToast('MODE SIANG AKTIF');
      }
    }

    /**
     * =========================================================================
     * RENDERER KONTEN DINAMIS (TERHUBUNG DENGAN PANEL ADMIN CMS)
     * =========================================================================
     */
    function renderHeaderHUD() {
      const p = appData.profile || {};
      const elInit = document.getElementById('hud-initials');
      const elName = document.getElementById('hud-name');
      const elSub = document.getElementById('hud-subtitle');
      if (elInit) elInit.textContent = p.initials || 'AF';
      if (elName) elName.textContent = (p.name || 'Achmad Febri').toUpperCase();
      if (elSub) elSub.textContent = p.hudSubtitle || `${p.role || ''} · ${p.company || ''}`;
    }

    function renderProfilDialog() {
      const container = document.getElementById('profil-dynamic-content');
      if (!container) return;
      container.replaceChildren();
      const p = appData.profile || {};

      // 1. Kartu Identitas Utama
      const idSec = document.createElement('section');
      idSec.className = 'pixel-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center';

      const avatarBox = document.createElement('div');
      avatarBox.className = 'flex h-16 w-16 shrink-0 items-center justify-center border-3 border-slate-900 bg-sky-600 font-pixel text-lg text-white shadow-[inset_-3px_-3px_0_#0369a1,inset_3px_3px_0_#38bdf8]';
      avatarBox.textContent = p.initials || 'AF';

      const infoWrap = document.createElement('div');
      infoWrap.className = 'space-y-1.5';

      const nameRow = document.createElement('div');
      nameRow.className = 'flex flex-wrap items-center gap-2';
      const h3 = document.createElement('h3');
      h3.className = 'font-pixel text-sm text-slate-900';
      h3.textContent = p.name || 'Achmad Febri';
      nameRow.appendChild(h3);

      if (p.ageLabel) {
        const ageTag = document.createElement('span');
        ageTag.className = 'pixel-tag bg-sky-100 px-2 py-0.5 font-pixel text-[9px] text-sky-900';
        ageTag.textContent = p.ageLabel;
        nameRow.appendChild(ageTag);
      }

      const roleP = document.createElement('p');
      roleP.className = 'text-sm font-bold text-teal-700';
      roleP.textContent = p.role || '';

      const bioP = document.createElement('p');
      bioP.className = 'text-xs leading-relaxed text-slate-600';
      bioP.textContent = p.bio || '';

      infoWrap.append(nameRow, roleP, bioP);
      idSec.append(avatarBox, infoWrap);
      container.appendChild(idSec);

      // 2. Kartu Highlight Ringkas
      if (Array.isArray(p.highlights) && p.highlights.length > 0) {
        const hlSec = document.createElement('section');
        hlSec.className = 'grid grid-cols-1 gap-3 sm:grid-cols-3';
        p.highlights.forEach((h) => {
          const box = document.createElement('div');
          box.className = 'pixel-card bg-sky-50 p-3';
          const lbl = document.createElement('p');
          lbl.className = 'font-pixel text-[8px] uppercase text-slate-500';
          lbl.textContent = h.label || '';
          const val = document.createElement('p');
          val.className = 'mt-1.5 text-sm font-bold text-slate-900';
          val.textContent = h.value || '';
          box.append(lbl, val);
          hlSec.appendChild(box);
        });
        container.appendChild(hlSec);
      }

      // 3. Keahlian Inti (Skills)
      const skillSec = document.createElement('section');
      const skillHead = document.createElement('h3');
      skillHead.className = 'mb-3 font-pixel text-[10px] uppercase text-slate-700';
      skillHead.textContent = '★ Keahlian Inti';

      const skillGrid = document.createElement('div');
      skillGrid.className = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
      (p.skills || []).forEach((sk) => {
        const art = document.createElement('article');
        art.className = 'pixel-card p-3.5';
        const t = document.createElement('h4');
        t.className = 'font-bold text-slate-900';
        t.textContent = sk.title || '';
        const d = document.createElement('p');
        d.className = 'mt-1 text-xs leading-relaxed text-slate-600';
        d.textContent = sk.description || '';
        art.append(t, d);
        skillGrid.appendChild(art);
      });

      skillSec.append(skillHead, skillGrid);
      container.appendChild(skillSec);
    }

    function renderProjectDialog() {
      const list = document.getElementById('project-dynamic-list');
      if (!list) return;
      list.replaceChildren();

      const badgeColorMap = {
        emerald: 'bg-emerald-200 text-emerald-950',
        sky: 'bg-sky-200 text-sky-950',
        indigo: 'bg-indigo-200 text-indigo-950',
        amber: 'bg-amber-200 text-amber-950',
      };

      const projects = appData.projects || [];
      if (projects.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'py-6 text-center text-xs text-slate-500';
        empty.textContent = 'Belum ada data project. Tambahkan melalui Panel Admin.';
        list.appendChild(empty);
        return;
      }

      projects.forEach((prj) => {
        const art = document.createElement('article');
        art.className = 'pixel-card p-4 transition hover:bg-emerald-50/40';

        const imgUrl = window.FebCMS?.sanitizeUrl(prj.imageUrl) || '';
        if (imgUrl) {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = prj.title || 'Project Thumbnail';
          img.className = 'mb-3 h-40 w-full border-2 border-slate-900 object-cover';
          art.appendChild(img);
        }

        const topRow = document.createElement('div');
        topRow.className = 'flex flex-wrap items-center justify-between gap-2';

        const badge = document.createElement('span');
        const colCls = badgeColorMap[prj.badgeColor] || badgeColorMap.emerald;
        badge.className = `pixel-tag ${colCls} px-2 py-0.5 font-pixel text-[8px]`;
        badge.textContent = prj.badge || 'PROJECT';

        const meta = document.createElement('span');
        meta.className = 'font-vt text-base text-slate-500';
        meta.textContent = prj.meta || '';
        topRow.append(badge, meta);

        const title = document.createElement('h3');
        title.className = 'mt-2.5 text-base font-bold text-slate-900';
        title.textContent = prj.title || '';

        const desc = document.createElement('p');
        desc.className = 'mt-1.5 text-xs leading-relaxed text-slate-600';
        desc.textContent = prj.description || '';

        const bottomRow = document.createElement('div');
        bottomRow.className = 'mt-3 flex flex-wrap items-center justify-between gap-2';

        const tagsWrap = document.createElement('div');
        tagsWrap.className = 'flex flex-wrap gap-1.5';
        (prj.tags || []).forEach((tagText) => {
          const tag = document.createElement('span');
          tag.className = 'pixel-tag bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800';
          tag.textContent = tagText;
          tagsWrap.appendChild(tag);
        });
        bottomRow.appendChild(tagsWrap);

        const linkUrl = window.FebCMS?.sanitizeUrl(prj.linkUrl) || '';
        if (linkUrl) {
          const link = document.createElement('a');
          link.href = linkUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'pixel-btn px-2.5 py-1 font-pixel text-[8px] no-underline';
          link.textContent = 'BUKA LINK ►';
          bottomRow.appendChild(link);
        }

        art.append(topRow, title, desc, bottomRow);
        list.appendChild(art);
      });
    }

    /**
     * Render kartu portofolio aman (DOM API tanpa innerHTML)
     */
    function renderPortfolioCards(filter = activePortfolioFilter) {
      activePortfolioFilter = filter;
      const grid = document.getElementById('portfolio-grid');
      if (!grid) return;
      grid.replaceChildren();

      const items = appData.portfolios || [];
      const filtered = filter === 'all'
        ? items
        : items.filter((item) => item.category === filter);

      if (filtered.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'col-span-full py-6 text-center text-xs text-slate-500';
        empty.textContent = 'Belum ada karya portofolio pada kategori ini.';
        grid.appendChild(empty);
        return;
      }

      filtered.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'pixel-card flex flex-col justify-between p-4 transition hover:bg-indigo-50/40';

        const topDiv = document.createElement('div');

        const imgUrl = window.FebCMS?.sanitizeUrl(item.imageUrl) || '';
        if (imgUrl) {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = item.title || 'Portfolio Thumbnail';
          img.className = 'mb-3 h-32 w-full border-2 border-slate-900 object-cover';
          topDiv.appendChild(img);
        }

        const badge = document.createElement('span');
        badge.className = item.category === 'web'
          ? 'pixel-tag inline-block bg-indigo-200 px-2 py-0.5 font-pixel text-[8px] text-indigo-950'
          : 'pixel-tag inline-block bg-emerald-200 px-2 py-0.5 font-pixel text-[8px] text-emerald-950';
        badge.textContent = (item.categoryLabel || item.category || 'WEB').toUpperCase();

        const title = document.createElement('h3');
        title.className = 'mt-2.5 text-sm font-bold text-slate-900';
        title.textContent = item.title || '';

        const desc = document.createElement('p');
        desc.className = 'mt-1.5 text-xs leading-relaxed text-slate-600';
        desc.textContent = item.description || '';

        topDiv.append(badge, title, desc);

        const footDiv = document.createElement('div');
        footDiv.className = 'mt-3 flex flex-wrap items-center justify-between gap-2';

        const tagsWrap = document.createElement('div');
        tagsWrap.className = 'flex flex-wrap gap-1.5';
        (item.tags || []).forEach((tagText) => {
          const tag = document.createElement('span');
          tag.className = 'pixel-tag bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700';
          tag.textContent = tagText;
          tagsWrap.appendChild(tag);
        });
        footDiv.appendChild(tagsWrap);

        const linkUrl = window.FebCMS?.sanitizeUrl(item.linkUrl) || '';
        if (linkUrl) {
          const link = document.createElement('a');
          link.href = linkUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'pixel-btn px-2 py-1 font-pixel text-[7px] no-underline';
          link.textContent = 'LINK ►';
          footDiv.appendChild(link);
        }

        card.append(topDiv, footDiv);
        grid.appendChild(card);
      });
    }

    function renderContactDialog() {
      const c = appData.contact || {};
      const locEl = document.getElementById('contact-location-val');
      const emailEl = document.getElementById('contact-email-val');
      const topicSel = document.getElementById('contact-topic');

      const igLink = document.getElementById('contact-ig-link');
      const igVal = document.getElementById('contact-ig-val');
      const liLink = document.getElementById('contact-linkedin-link');
      const liVal = document.getElementById('contact-linkedin-val');
      const ghLink = document.getElementById('contact-github-link');
      const ghVal = document.getElementById('contact-github-val');

      if (locEl) locEl.textContent = c.location || '';
      if (emailEl) emailEl.textContent = c.email || '';

      if (igLink && igVal) {
        const rawIg = (c.instagram || '').trim();
        const url = rawIg ? (rawIg.startsWith('http') ? rawIg : `https://instagram.com/${rawIg.replace(/^@/, '')}`) : 'https://instagram.com/achmadfebri';
        igLink.href = window.FebCMS?.sanitizeUrl(url) || url;
        const display = rawIg ? (rawIg.includes('instagram.com') ? '@' + rawIg.split('instagram.com/')[1].replace(/\/$/, '') : (rawIg.startsWith('@') ? rawIg : `@${rawIg}`)) : '@achmadfebri';
        igVal.textContent = display;
      }

      if (liLink && liVal) {
        const rawLi = (c.linkedin || '').trim();
        const url = rawLi ? (rawLi.startsWith('http') ? rawLi : `https://linkedin.com/in/${rawLi}`) : 'https://linkedin.com/in/achmadfebri';
        liLink.href = window.FebCMS?.sanitizeUrl(url) || url;
        const display = rawLi ? (rawLi.includes('linkedin.com') ? rawLi.split('linkedin.com/in/')[1].replace(/\/$/, '') : rawLi) : 'Achmad Febri';
        liVal.textContent = display;
      }

      if (ghLink && ghVal) {
        const rawGh = (c.github || '').trim();
        const url = rawGh ? (rawGh.startsWith('http') ? rawGh : `https://github.com/${rawGh.replace(/^@/, '')}`) : 'https://github.com/achmadfebri';
        ghLink.href = window.FebCMS?.sanitizeUrl(url) || url;
        const display = rawGh ? (rawGh.includes('github.com') ? rawGh.split('github.com/')[1].replace(/\/$/, '') : rawGh.replace(/^@/, '')) : 'achmadfebri';
        ghVal.textContent = display;
      }

      if (topicSel && Array.isArray(c.topics)) {
        topicSel.replaceChildren();
        const defOpt = document.createElement('option');
        defOpt.value = '';
        defOpt.textContent = 'Pilih topik...';
        topicSel.appendChild(defOpt);
        c.topics.forEach((t) => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
          topicSel.appendChild(opt);
        });
      }
    }

    function renderPengalamanDialog() {
      const list = document.getElementById('pengalaman-timeline-list');
      if (!list) return;
      list.replaceChildren();

      const items = Array.isArray(appData.experiences) ? appData.experiences : [];

      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'pixel-card p-6 text-center text-xs text-slate-500';
        empty.textContent = 'Belum ada riwayat pengalaman kerja. Tambahkan melalui Panel Admin (Tab 2: Pengalaman).';
        list.appendChild(empty);
        return;
      }

      // 1. Jalur Pipa Arus Berjalan (Flowing Current Spine + 3 Traveling Energy Pulses)
      const track = document.createElement('div');
      track.className = 'exp-flow-track';
      track.setAttribute('aria-hidden', 'true');

      ['', 'pulse-2', 'pulse-3'].forEach((cls) => {
        const pulse = document.createElement('span');
        pulse.className = `exp-current-pulse ${cls}`.trim();
        track.appendChild(pulse);
      });
      list.appendChild(track);

      // 2. Render Setiap Node & Kartu Pengalaman Kerja
      items.forEach((exp, idx) => {
        const itemWrap = document.createElement('article');
        itemWrap.className = 'exp-item';

        // Node sirkuit di jalur utama
        const nodeDot = document.createElement('span');
        nodeDot.className = `exp-node-dot${exp.isCurrent ? ' is-current' : ''}`;
        nodeDot.setAttribute('aria-hidden', 'true');

        // Garis cabang arus horizontal ke kartu
        const branch = document.createElement('span');
        branch.className = 'exp-branch-line';
        branch.setAttribute('aria-hidden', 'true');

        // Kartu Pixel Pengalaman Kerja
        const card = document.createElement('div');
        card.className = `pixel-card p-4 transition hover:bg-rose-50/40 ${
          exp.isCurrent ? 'border-rose-700 bg-white' : 'bg-white'
        }`;

        // Baris atas: Periode, Nomor Langkah & Badge Aktif
        const metaRow = document.createElement('div');
        metaRow.className = 'flex flex-wrap items-center justify-between gap-2';

        const leftBadges = document.createElement('div');
        leftBadges.className = 'flex flex-wrap items-center gap-1.5';

        const stepBadge = document.createElement('span');
        stepBadge.className = 'pixel-tag bg-slate-900 px-1.5 py-0.5 font-pixel text-[7px] text-sky-300';
        stepBadge.textContent = `#${String(idx + 1).padStart(2, '0')}`;
        leftBadges.appendChild(stepBadge);

        const periodBadge = document.createElement('span');
        periodBadge.className = 'pixel-tag bg-rose-100 px-2 py-0.5 font-pixel text-[8px] text-rose-900';
        periodBadge.textContent = exp.period || '';
        leftBadges.appendChild(periodBadge);

        if (exp.isCurrent) {
          const curBadge = document.createElement('span');
          curBadge.className = 'pixel-tag inline-flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 font-pixel text-[7px] text-emerald-900';
          const liveDot = document.createElement('span');
          liveDot.className = 'exp-live-dot';
          curBadge.append(liveDot, document.createTextNode('AKTIF'));
          leftBadges.appendChild(curBadge);
        }

        metaRow.appendChild(leftBadges);

        if (exp.location) {
          const locSpan = document.createElement('span');
          locSpan.className = 'font-vt text-base text-slate-500';
          locSpan.textContent = `📍 ${exp.location}`;
          metaRow.appendChild(locSpan);
        }

        // Judul Jabatan & Nama Instansi
        const roleEl = document.createElement('h3');
        roleEl.className = 'mt-2.5 text-sm font-bold text-slate-900 sm:text-base';
        roleEl.textContent = exp.role || '';

        const compEl = document.createElement('p');
        compEl.className = 'text-xs font-bold text-rose-700';
        compEl.textContent = exp.company || '';

        // Deskripsi
        const descEl = document.createElement('p');
        descEl.className = 'mt-2 text-xs leading-relaxed text-slate-600';
        descEl.textContent = exp.description || '';

        card.append(metaRow, roleEl, compEl, descEl);

        // Tags Keahlian
        if (Array.isArray(exp.tags) && exp.tags.length > 0) {
          const tagsWrap = document.createElement('div');
          tagsWrap.className = 'mt-3 flex flex-wrap gap-1.5';
          exp.tags.forEach((tag) => {
            const sp = document.createElement('span');
            sp.className = 'pixel-tag bg-slate-100 px-2 py-0.5 font-vt text-base leading-none text-slate-800';
            sp.textContent = tag;
            tagsWrap.appendChild(sp);
          });
          card.appendChild(tagsWrap);
        }

        itemWrap.append(nodeDot, branch, card);
        list.appendChild(itemWrap);
      });
    }

    function renderAllPortfolioContent() {
      renderHeaderHUD();
      renderProfilDialog();
      renderPengalamanDialog();
      renderProjectDialog();
      renderPortfolioCards(activePortfolioFilter);
      renderContactDialog();
    }

    async function openAdminDialog() {
      document.querySelectorAll('dialog.zone-dialog[open]').forEach((d) => d.close());
      const dialog = document.getElementById('dialog-admin');
      const mountEl = document.getElementById('admin-modal-mount');
      if (!dialog || !mountEl || !window.FebCMS) return;

      dialog.showModal();
      if (!adminPanelInstance) {
        adminPanelInstance = await window.FebCMS.mountAdminPanel(mountEl, {
          onDataUpdated: (newData) => {
            appData = newData;
            renderAllPortfolioContent();
          },
          onToast: showToast,
        });
      } else {
        await adminPanelInstance.refresh();
      }
    }

    /**
     * =========================================================================
     * EVENT BINDINGS: KEYBOARD, D-PAD LAYAR, KLIK KANVAS & DIALOG
     * =========================================================================
     */
    function getCanvasWorldCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const lx = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const ly = ((e.clientY - rect.top) / rect.height) * viewport.height;
      return { worldX: lx + camera.x, screenY: ly };
    }

    function hitTestZone(worldX, screenY) {
      const baseY = viewport.groundY - 8;
      for (const z of ZONES_CONFIG) {
        const halfW = z.hitbox.w / 2;
        if (
          worldX >= z.worldX - halfW &&
          worldX <= z.worldX + halfW &&
          screenY >= baseY - z.hitbox.h &&
          screenY <= baseY + 12
        ) {
          return z;
        }
      }
      return null;
    }

    function bindEvents() {
      window.addEventListener('resize', handleResize);

      // 1. Kontrol Keyboard (Kiri/Kanan, E/Enter, 1-4, R, T)
      window.addEventListener('keydown', (e) => {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        const key = e.key.toLowerCase();
        if (teleportState.active) {
          if (key === 't') toggleDayNight();
          return;
        }
        // Jika Intro Cutscene masih aktif, tombol Enter/Space/Escape/D/Panah Kanan menyelesaikan sapaan
        if (introState.active) {
          if (key === 'enter' || key === ' ' || key === 'escape') {
            e.preventDefault();
            advanceIntroGreeting();
            return;
          }
          if (key === 'arrowright' || key === 'd') {
            finishIntroGreeting();
          }
        }
        if (e.altKey && key === 'a') {
          e.preventDefault();
          openAdminDialog();
          return;
        }
        if (key === 'arrowleft' || key === 'a') {
          inputState.left = true;
          document.getElementById('btn-move-left')?.classList.add('is-pressed');
        } else if (key === 'arrowright' || key === 'd') {
          inputState.right = true;
          document.getElementById('btn-move-right')?.classList.add('is-pressed');
        } else if ((key === 'e' || key === 'enter' || key === ' ') && activeNearZone) {
          const hasDialog = Boolean(document.querySelector('dialog.zone-dialog[open]'));
          if (!hasDialog) {
            e.preventDefault();
            openZoneDialog(activeNearZone.id);
          }
        } else if (key === '1') {
          navigateToZone('profil', true);
        } else if (key === '2') {
          navigateToZone('pengalaman', true);
        } else if (key === '3') {
          navigateToZone('project', true);
        } else if (key === '4') {
          navigateToZone('portofolio', true);
        } else if (key === '5') {
          navigateToZone('kontak', true);
        } else if (key === 'r') {
          resetPlayerPosition();
        } else if (key === 't') {
          toggleDayNight();
        }
      });

      window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') {
          inputState.left = false;
          document.getElementById('btn-move-left')?.classList.remove('is-pressed');
        } else if (key === 'arrowright' || key === 'd') {
          inputState.right = false;
          document.getElementById('btn-move-right')?.classList.remove('is-pressed');
        }
      });

      window.addEventListener('blur', () => {
        inputState.left = false;
        inputState.right = false;
        inputState.btnLeft = false;
        inputState.btnRight = false;
      });

      // 2. Kontrol Tombol Virtual Kiri & Kanan (Pointer Hold Support untuk Mouse & Touch)
      const bindHoldButton = (btnId, stateKey) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const startHold = (e) => {
          e.preventDefault();
          inputState[stateKey] = true;
          btn.classList.add('is-pressed');
        };
        const stopHold = () => {
          inputState[stateKey] = false;
          btn.classList.remove('is-pressed');
        };

        btn.addEventListener('pointerdown', startHold);
        btn.addEventListener('pointerup', stopHold);
        btn.addEventListener('pointerleave', stopHold);
        btn.addEventListener('pointercancel', stopHold);
      };

      bindHoldButton('btn-move-left', 'btnLeft');
      bindHoldButton('btn-move-right', 'btnRight');

      // Tombol interaksi [E] BUKA
      document.getElementById('btn-interact-zone')?.addEventListener('click', () => {
        if (activeNearZone) {
          openZoneDialog(activeNearZone.id);
        }
      });

      // 3. Interaksi Klik & Hover langsung di Kanvas 2D
      canvas.addEventListener('pointermove', (e) => {
        const { worldX, screenY } = getCanvasWorldCoords(e);
        const hit = hitTestZone(worldX, screenY);
        hoveredZoneId = hit ? hit.id : null;
        canvas.style.cursor = hit ? 'pointer' : 'crosshair';
      });

      canvas.addEventListener('pointerdown', (e) => {
        if (teleportState.active) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (introState.active) {
          advanceIntroGreeting();
          return;
        }
        const { worldX, screenY } = getCanvasWorldCoords(e);
        const hit = hitTestZone(worldX, screenY);

        if (hit) {
          navigateToZone(hit.id, true);
        } else {
          // Klik area jalan untuk auto-walk ke koordinat X tersebut
          const targetX = Math.max(WORLD_CONFIG.minWalkX, Math.min(WORLD_CONFIG.maxWalkX, worldX));
          player.autoTargetX = targetX;
          player.pendingZoneId = null;
          walkMarkers.push({ x: targetX, age: 0, maxAge: 0.65 });
        }
      });

      // Kontrol Mouse Scroll Wheel: Scroll Atas = Kiri, Scroll Bawah = Kanan
      window.addEventListener(
        'wheel',
        (e) => {
          // Jangan ganggu scroll native jika ada dialog modal terbuka atau sedang teleportasi
          if (document.querySelector('dialog.zone-dialog[open]') || teleportState.active) return;
          if (introState.active) {
            e.preventDefault();
            finishIntroGreeting();
            return;
          }

          const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
          if (delta === 0) return;

          e.preventDefault();

          const dir = Math.sign(delta); // -1 = Scroll Atas (Kiri), +1 = Scroll Bawah (Kanan)
          const step = Math.min(96, Math.max(48, Math.abs(delta) * 0.65));

          // Jika berbalik arah di tengah jalan, mulai dari posisi karakter saat ini agar responsif
          const isReversing =
            player.autoTargetX !== null && Math.sign(player.autoTargetX - player.x) !== dir;
          const basePos =
            player.autoTargetX !== null && !isReversing ? player.autoTargetX : player.x;

          player.autoTargetX = Math.max(
            WORLD_CONFIG.minWalkX,
            Math.min(WORLD_CONFIG.maxWalkX, basePos + dir * step)
          );
          player.pendingZoneId = null;
        },
        { passive: false }
      );

      // 4. Navigasi Cepat Bawah (Zona 1-4)
      document.querySelectorAll('[data-zone-nav]').forEach((btn) => {
        btn.addEventListener('click', () => {
          navigateToZone(btn.dataset.zoneNav, true);
        });
      });

      // 5. Tombol Header: Tema Siang/Malam, Reset & Admin CMS
      document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleDayNight);
      document.getElementById('btn-reset-pos')?.addEventListener('click', resetPlayerPosition);
      document.getElementById('btn-open-admin')?.addEventListener('click', openAdminDialog);

      // 6. Toggle Panel Petunjuk Kontrol
      const hintCard = document.getElementById('controls-hint-card');
      const btnHideHint = document.getElementById('btn-hide-hint');
      const btnShowHint = document.getElementById('btn-show-hint');

      btnHideHint?.addEventListener('click', () => {
        hintCard?.classList.add('hidden');
        btnShowHint?.classList.remove('hidden');
        btnShowHint?.classList.add('flex');
      });

      btnShowHint?.addEventListener('click', () => {
        hintCard?.classList.remove('hidden');
        btnShowHint?.classList.add('hidden');
        btnShowHint?.classList.remove('flex');
      });

      // 7. Filter Kategori Portofolio
      document.querySelectorAll('.portfolio-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;
          document.querySelectorAll('.portfolio-filter-btn').forEach((b) => {
            const active = b === btn;
            b.setAttribute('aria-pressed', String(active));
            b.className = active
              ? 'portfolio-filter-btn pixel-btn-primary px-3 py-2 font-pixel text-[9px]'
              : 'portfolio-filter-btn pixel-btn px-3 py-2 font-pixel text-[9px]';
          });
          renderPortfolioCards(filter);
        });
      });

      // 8. Penutupan Native <dialog>
      document.querySelectorAll('dialog.zone-dialog').forEach((dialog) => {
        dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (e) => {
          if (e.target === dialog) {
            dialog.close();
          }
        });
      });

      // 9. Form Kontak dengan Validasi Native HTML5 & Simpan ke Inbox Admin
      const contactForm = document.getElementById('contact-form');
      const contactFeedback = document.getElementById('contact-feedback');
      contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!contactForm.checkValidity()) {
          contactForm.reportValidity();
          return;
        }
        const senderName = document.getElementById('contact-name').value.trim();
        const senderEmail = document.getElementById('contact-email').value.trim();
        const senderTopic = document.getElementById('contact-topic').value.trim();
        const senderMessage = document.getElementById('contact-message').value.trim();

        try {
          if (window.FebCMS) {
            await window.FebCMS.sendMessage({
              name: senderName,
              email: senderEmail,
              topic: senderTopic,
              message: senderMessage,
            });
          }
          contactFeedback.textContent = `Terima kasih, ${senderName}! Pesan Anda telah tersimpan di Inbox Achmad Febri.`;
          contactForm.reset();
          showToast('PESAN BERHASIL DIKIRIM!');
        } catch (err) {
          contactFeedback.textContent = err.message || 'Gagal mengirim pesan.';
          showToast('GAGAL MENGIRIM PESAN');
        }
      });
      // 10. Kontrol Tombol & Overlay Intro Sapaan
      document.getElementById('btn-finish-intro')?.addEventListener('click', (e) => {
        e.stopPropagation();
        finishIntroGreeting();
      });

      document.getElementById('intro-greeting-overlay')?.addEventListener('click', () => {
        advanceIntroGreeting();
      });
    }

    /**
     * =========================================================================
     * INISIALISASI APLIKASI
     * =========================================================================
     */
    window.addEventListener('load', async () => {
      handleResize();
      // Posisikan kamera awal tepat ke karakter agar Intro Zoom-In langsung fokus mulus
      const maxCamX = Math.max(0, WORLD_CONFIG.width - viewport.width);
      camera.x = Math.max(0, Math.min(maxCamX, player.x - viewport.width * 0.48));
      camera.targetX = camera.x;

      renderAllPortfolioContent();
      bindEvents();
      updateZoneProximityHUD();
      requestAnimationFrame(gameLoop);

      // Muat data terbaru dari Server PHP+JSON atau LocalStorage
      if (window.FebCMS) {
        try {
          appData = await window.FebCMS.loadData();
          renderAllPortfolioContent();
        } catch (err) {
          console.warn('Menggunakan data portofolio bawaan:', err);
        }
      }
    });
