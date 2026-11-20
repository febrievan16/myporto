<?php
declare(strict_types=1);

/**
 * =============================================================================
 * API BACKEND CMS PORTOFOLIO 2D ISOMETRIC PIXEL ART (ACHMAD FEBRI)
 * Penyimpanan JSON + Upload Thumbnail + Auth Admin + Inbox Pesan
 * =============================================================================
 */

session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DATA_DIR      = __DIR__ . DIRECTORY_SEPARATOR . 'data';
const UPLOAD_DIR    = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
const DATA_FILE     = DATA_DIR . DIRECTORY_SEPARATOR . 'portfolio_data.json';
const MESSAGES_FILE = DATA_DIR . DIRECTORY_SEPARATOR . 'messages.json';
const AUTH_FILE     = DATA_DIR . DIRECTORY_SEPARATOR . 'auth.json';
const DEFAULT_PASS  = 'admin123';
const MAX_IMG_BYTES = 2 * 1024 * 1024; // 2 MB

// Pastikan direktori data dan uploads tersedia
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Helper mengirim respon JSON terstruktur
 */
function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Helper membaca body JSON dari request POST
 */
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Helper menulis file JSON secara aman dengan lock
 */
function writeJsonFile(string $path, array $data): bool {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }
    return file_put_contents($path, $json, LOCK_EX) !== false;
}

/**
 * Memastikan file auth.json ada dengan password default ter-hash
 */
function getAuthHash(): string {
    if (!file_exists(AUTH_FILE)) {
        $hash = password_hash(DEFAULT_PASS, PASSWORD_DEFAULT);
        writeJsonFile(AUTH_FILE, [
            'password_hash' => $hash,
            'updated_at'    => date('c'),
        ]);
        return $hash;
    }
    $raw = file_get_contents(AUTH_FILE);
    $auth = $raw ? json_decode($raw, true) : null;
    if (!is_array($auth) || empty($auth['password_hash'])) {
        $hash = password_hash(DEFAULT_PASS, PASSWORD_DEFAULT);
        writeJsonFile(AUTH_FILE, [
            'password_hash' => $hash,
            'updated_at'    => date('c'),
        ]);
        return $hash;
    }
    return (string) $auth['password_hash'];
}

/**
 * Memeriksa status autentikasi admin
 */
function isAuthenticated(): bool {
    return !empty($_SESSION['feb_admin_auth']) && $_SESSION['feb_admin_auth'] === true;
}

function requireAuth(): void {
    if (!isAuthenticated()) {
        respond(['ok' => false, 'error' => 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.'], 401);
    }
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// =============================================================================
// ROUTING ENDPOINT API
// =============================================================================
switch ($action) {
    // 1. Ambil Data Portofolio (Publik)
    case 'get_data':
        if (!file_exists(DATA_FILE)) {
            respond(['ok' => true, 'data' => null]);
        }
        $raw = file_get_contents(DATA_FILE);
        $data = $raw ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            respond(['ok' => false, 'error' => 'Format portfolio_data.json tidak valid.'], 500);
        }
        respond(['ok' => true, 'data' => $data]);
        break;

    // 2. Cek Status Login Admin
    case 'check_auth':
        respond([
            'ok'            => true,
            'authenticated' => isAuthenticated(),
        ]);
        break;

    // 3. Login Admin
    case 'login':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        $body = getJsonInput();
        $password = (string) ($body['password'] ?? '');
        $hash = getAuthHash();

        if ($password !== '' && password_verify($password, $hash)) {
            session_regenerate_id(true);
            $_SESSION['feb_admin_auth'] = true;
            respond(['ok' => true, 'authenticated' => true, 'message' => 'Login berhasil.']);
        }
        respond(['ok' => false, 'error' => 'Password / PIN Admin salah.'], 401);
        break;

    // 4. Logout Admin
    case 'logout':
        $_SESSION['feb_admin_auth'] = false;
        unset($_SESSION['feb_admin_auth']);
        respond(['ok' => true, 'authenticated' => false]);
        break;

    // 5. Simpan Perubahan Data Portofolio (Admin Only)
    case 'save_data':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        $body = getJsonInput();
        $data = $body['data'] ?? null;

        if (!is_array($data) || !isset($data['profile'], $data['projects'], $data['portfolios'], $data['contact'])) {
            respond(['ok' => false, 'error' => 'Struktur data portofolio tidak lengkap.'], 400);
        }

        if (!writeJsonFile(DATA_FILE, $data)) {
            respond(['ok' => false, 'error' => 'Gagal menulis ke file data/portfolio_data.json.'], 500);
        }
        respond(['ok' => true, 'message' => 'Data portofolio berhasil disimpan ke server.']);
        break;

    // 6. Upload Gambar Thumbnail (Admin Only)
    case 'upload_image':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            respond(['ok' => false, 'error' => 'Tidak ada file gambar valid yang diunggah.'], 400);
        }

        $file = $_FILES['image'];
        if ($file['size'] > MAX_IMG_BYTES) {
            respond(['ok' => false, 'error' => 'Ukuran gambar maksimal 2 MB.'], 400);
        }

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        if (!isset($allowedMimes[$mime])) {
            respond(['ok' => false, 'error' => 'Format gambar harus JPG, PNG, WEBP, atau GIF.'], 400);
        }

        $ext = $allowedMimes[$mime];
        $filename = 'thumb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = UPLOAD_DIR . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan file gambar di folder uploads/.'], 500);
        }

        respond([
            'ok'  => true,
            'url' => 'uploads/' . $filename,
        ]);
        break;

    // 7. Kirim Pesan dari Form Kontak Pengunjung (Publik)
    case 'send_message':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        $body = getJsonInput();
        $name    = trim((string) ($body['name'] ?? ''));
        $email   = trim((string) ($body['email'] ?? ''));
        $topic   = trim((string) ($body['topic'] ?? ''));
        $message = trim((string) ($body['message'] ?? ''));

        if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $topic === '' || mb_strlen($message) < 5) {
            respond(['ok' => false, 'error' => 'Mohon lengkapi data pesan dengan benar.'], 400);
        }

        $messages = [];
        if (file_exists(MESSAGES_FILE)) {
            $raw = file_get_contents(MESSAGES_FILE);
            $decoded = $raw ? json_decode($raw, true) : [];
            if (is_array($decoded)) {
                $messages = $decoded;
            }
        }

        $entry = [
            'id'         => 'msg_' . time() . '_' . bin2hex(random_bytes(3)),
            'name'       => mb_substr($name, 0, 120),
            'email'      => mb_substr($email, 0, 160),
            'topic'      => mb_substr($topic, 0, 120),
            'message'    => mb_substr($message, 0, 2000),
            'read'       => false,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        array_unshift($messages, $entry);
        if (!writeJsonFile(MESSAGES_FILE, $messages)) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan pesan.'], 500);
        }

        respond(['ok' => true, 'entry' => $entry, 'message' => 'Pesan berhasil dikirim.']);
        break;

    // 8. Ambil Daftar Pesan Inbox (Admin Only)
    case 'get_messages':
        requireAuth();
        $messages = [];
        if (file_exists(MESSAGES_FILE)) {
            $raw = file_get_contents(MESSAGES_FILE);
            $decoded = $raw ? json_decode($raw, true) : [];
            if (is_array($decoded)) {
                $messages = $decoded;
            }
        }
        respond(['ok' => true, 'messages' => $messages]);
        break;

    // 9. Tandai Pesan Sudah Dibaca (Admin Only)
    case 'mark_read':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        $body = getJsonInput();
        $id = (string) ($body['id'] ?? '');
        $messages = file_exists(MESSAGES_FILE) ? (json_decode((string) file_get_contents(MESSAGES_FILE), true) ?: []) : [];

        foreach ($messages as &$m) {
            if (($m['id'] ?? '') === $id) {
                $m['read'] = true;
            }
        }
        unset($m);

        writeJsonFile(MESSAGES_FILE, $messages);
        respond(['ok' => true, 'messages' => $messages]);
        break;

    // 10. Hapus Pesan dari Inbox (Admin Only)
    case 'delete_message':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        $body = getJsonInput();
        $id = (string) ($body['id'] ?? '');
        $messages = file_exists(MESSAGES_FILE) ? (json_decode((string) file_get_contents(MESSAGES_FILE), true) ?: []) : [];
        $messages = array_values(array_filter($messages, static fn($m) => ($m['id'] ?? '') !== $id));

        writeJsonFile(MESSAGES_FILE, $messages);
        respond(['ok' => true, 'messages' => $messages]);
        break;

    // 11. Ganti Password / PIN Admin (Admin Only)
    case 'change_password':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        $body = getJsonInput();
        $currentPass = (string) ($body['currentPassword'] ?? '');
        $newPass     = trim((string) ($body['newPassword'] ?? ''));

        if (mb_strlen($newPass) < 4) {
            respond(['ok' => false, 'error' => 'Password baru minimal 4 karakter.'], 400);
        }

        if (!password_verify($currentPass, getAuthHash())) {
            respond(['ok' => false, 'error' => 'Password lama tidak sesuai.'], 400);
        }

        $ok = writeJsonFile(AUTH_FILE, [
            'password_hash' => password_hash($newPass, PASSWORD_DEFAULT),
            'updated_at'    => date('c'),
        ]);
        if (!$ok) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan password baru.'], 500);
        }
        respond(['ok' => true, 'message' => 'Password Admin berhasil diperbarui.']);
        break;

    default:
        respond(['ok' => false, 'error' => 'Endpoint action tidak dikenali.'], 404);
}
