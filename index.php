<?php
declare(strict_types=1);

/**
 * Entry point domain utama untuk hosting online (Apache/Nginx/cPanel/Laragon)
 * Menyajikan halaman portofolio utama secara langsung tanpa duplikasi file HTML.
 */
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$entryFile = __DIR__ . DIRECTORY_SEPARATOR . 'portofolio_3d_isometric_achmad_febri.html';
if (!file_exists($entryFile)) {
    http_response_code(500);
    echo 'File portofolio utama tidak ditemukan.';
    exit;
}

readfile($entryFile);
