<?php
declare(strict_types=1);

/**
 * =============================================================================
 * API BACKEND CMS PORTOFOLIO 2D ISOMETRIC PIXEL ART (ACHMAD FEBRI)
 * Hardened OWASP Security: Argon2id, CSRF Token, Rate Limiting,
 * Hardened Session + Idle Timeout, Payload & Upload Sanitization
 * =============================================================================
 */

// 1. Konfigurasi Keamanan Session sebelum session_start()
$isHttps = (
    (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') ||
    (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443)
);

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict',
]);

session_start();

// 2. Security Headers untuk seluruh respons API
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

const DATA_DIR            = __DIR__ . DIRECTORY_SEPARATOR . 'data';
const UPLOAD_DIR          = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
const DATA_FILE           = DATA_DIR . DIRECTORY_SEPARATOR . 'portfolio_data.json';
const MESSAGES_FILE       = DATA_DIR . DIRECTORY_SEPARATOR . 'messages.json';
const AUTH_FILE           = DATA_DIR . DIRECTORY_SEPARATOR . 'auth.json';
const RATE_LIMIT_FILE     = DATA_DIR . DIRECTORY_SEPARATOR . 'rate_limit.json';
const DEFAULT_PASS        = 'admin123';
const MAX_IMG_BYTES       = 2 * 1024 * 1024; // 2 MB
const MAX_JSON_BYTES      = 512 * 1024;      // 512 KB
const MIN_PASS_LENGTH     = 8;
const SESSION_IDLE_SEC    = 30 * 60;         // 30 menit idle timeout
const LOGIN_MAX_ATTEMPTS  = 5;
const LOGIN_WINDOW_SEC    = 15 * 60;         // 15 menit lockout
const MSG_MAX_ATTEMPTS    = 5;
const MSG_WINDOW_SEC      = 10 * 60;         // 10 menit anti-spam

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
 * Helper membaca body JSON dari request POST dengan batas ukuran aman
 */
function getJsonInput(): array {
    $raw = file_get_contents('php://input', false, null, 0, MAX_JSON_BYTES + 1);
    if (!$raw) {
        return [];
    }
    if (strlen($raw) > MAX_JSON_BYTES) {
        respond(['ok' => false, 'error' => 'Ukuran payload melebihi batas maksimum (512 KB).'], 413);
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Helper menulis file JSON secara aman dengan exclusive lock
 */
function writeJsonFile(string $path, array $data): bool {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }
    return file_put_contents($path, $json, LOCK_EX) !== false;
}

/**
 * Helper hashing password menggunakan Argon2id (OWASP recommended)
 */
function getPasswordAlgo(): string|int {
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
}

function getPasswordOptions(): array {
    if (defined('PASSWORD_ARGON2ID')) {
        return [
            'memory_cost' => 65536, // 64 MB
            'time_cost'   => 4,
            'threads'     => 1,
        ];
    }
    return ['cost' => 12];
}

function hashPassword(string $plain): string {
    return password_hash($plain, getPasswordAlgo(), getPasswordOptions());
}

/**
 * Memastikan file auth.json ada dengan password default ter-hash Argon2id
 */
function getAuthHash(): string {
    if (!file_exists(AUTH_FILE)) {
        $hash = hashPassword(DEFAULT_PASS);
        writeJsonFile(AUTH_FILE, [
            'password_hash' => $hash,
            'algo'          => defined('PASSWORD_ARGON2ID') ? 'argon2id' : 'bcrypt',
            'updated_at'    => date('c'),
        ]);
        return $hash;
    }
    $raw = file_get_contents(AUTH_FILE);
    $auth = $raw ? json_decode($raw, true) : null;
    if (!is_array($auth) || empty($auth['password_hash'])) {
        $hash = hashPassword(DEFAULT_PASS);
        writeJsonFile(AUTH_FILE, [
            'password_hash' => $hash,
            'algo'          => defined('PASSWORD_ARGON2ID') ? 'argon2id' : 'bcrypt',
            'updated_at'    => date('c'),
        ]);
        return $hash;
    }
    return (string) $auth['password_hash'];
}

/**
 * =============================================================================
 * PROTEKSI BRUTE-FORCE & RATE LIMITING BERBASIS IP
 * =============================================================================
 */
function getClientIp(): string {
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
}

function readRateLimitStore(): array {
    if (!file_exists(RATE_LIMIT_FILE)) {
        return [];
    }
    $raw = file_get_contents(RATE_LIMIT_FILE);
    $decoded = $raw ? json_decode($raw, true) : [];
    return is_array($decoded) ? $decoded : [];
}

function checkRateLimit(string $bucket, int $maxAttempts, int $windowSec): array {
    $ipHash = hash('sha256', getClientIp() . '|' . $bucket);
    $store = readRateLimitStore();
    $now = time();

    $entry = $store[$ipHash] ?? ['attempts' => [], 'locked_until' => 0];
    $attempts = array_values(array_filter(
        is_array($entry['attempts'] ?? null) ? $entry['attempts'] : [],
        static fn($ts) => is_int($ts) && ($now - $ts) < $windowSec
    ));

    if (($entry['locked_until'] ?? 0) > $now) {
        $retryAfter = (int) ($entry['locked_until'] - $now);
        return ['allowed' => false, 'retry_after' => $retryAfter, 'remaining' => 0];
    }

    if (count($attempts) >= $maxAttempts) {
        $oldest = min($attempts);
        $retryAfter = max(1, $windowSec - ($now - $oldest));
        return ['allowed' => false, 'retry_after' => $retryAfter, 'remaining' => 0];
    }

    return ['allowed' => true, 'retry_after' => 0, 'remaining' => $maxAttempts - count($attempts)];
}

function recordRateLimitHit(string $bucket, int $maxAttempts, int $windowSec): void {
    $ipHash = hash('sha256', getClientIp() . '|' . $bucket);
    $store = readRateLimitStore();
    $now = time();

    // Bersihkan entri kedaluwarsa agar file rate_limit.json tetap ramping
    foreach ($store as $k => $v) {
        $lastLocked = (int) ($v['locked_until'] ?? 0);
        $list = array_filter(is_array($v['attempts'] ?? null) ? $v['attempts'] : [], static fn($ts) => ($now - (int) $ts) < 3600);
        if (empty($list) && $lastLocked <= $now) {
            unset($store[$k]);
        }
    }

    $entry = $store[$ipHash] ?? ['attempts' => [], 'locked_until' => 0];
    $attempts = array_values(array_filter(
        is_array($entry['attempts'] ?? null) ? $entry['attempts'] : [],
        static fn($ts) => is_int($ts) && ($now - $ts) < $windowSec
    ));
    $attempts[] = $now;

    $lockedUntil = count($attempts) >= $maxAttempts ? ($now + $windowSec) : 0;
    $store[$ipHash] = [
        'attempts'     => $attempts,
        'locked_until' => $lockedUntil,
    ];
    writeJsonFile(RATE_LIMIT_FILE, $store);
}

function clearRateLimit(string $bucket): void {
    $ipHash = hash('sha256', getClientIp() . '|' . $bucket);
    $store = readRateLimitStore();
    if (isset($store[$ipHash])) {
        unset($store[$ipHash]);
        writeJsonFile(RATE_LIMIT_FILE, $store);
    }
}

/**
 * =============================================================================
 * AUTENTIKASI SESSION, IDLE TIMEOUT & CSRF TOKEN
 * =============================================================================
 */
function getUserAgentHash(): string {
    return hash('sha256', (string) ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));
}

function getCsrfToken(): string {
    if (empty($_SESSION['feb_csrf_token']) || !is_string($_SESSION['feb_csrf_token'])) {
        $_SESSION['feb_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['feb_csrf_token'];
}

function clearAdminSession(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'] ?? '/',
            $params['domain'] ?? '',
            (bool) ($params['secure'] ?? false),
            (bool) ($params['httponly'] ?? true)
        );
    }
    session_destroy();
}

function isAuthenticated(): bool {
    if (empty($_SESSION['feb_admin_auth']) || $_SESSION['feb_admin_auth'] !== true) {
        return false;
    }

    // Validasi Idle Timeout (30 menit)
    $lastActive = (int) ($_SESSION['feb_last_active'] ?? 0);
    if ($lastActive > 0 && (time() - $lastActive) > SESSION_IDLE_SEC) {
        clearAdminSession();
        return false;
    }

    // Validasi ringan User-Agent untuk mencegah pencurian cookie session
    $savedUa = (string) ($_SESSION['feb_ua_hash'] ?? '');
    if ($savedUa !== '' && !hash_equals($savedUa, getUserAgentHash())) {
        clearAdminSession();
        return false;
    }

    $_SESSION['feb_last_active'] = time();
    return true;
}

function requireAuth(): void {
    if (!isAuthenticated()) {
        respond([
            'ok'            => false,
            'authenticated' => false,
            'error'         => 'Sesi berakhir atau akses ditolak. Silakan login kembali sebagai Admin.',
        ], 401);
    }
}

function requireCsrf(): void {
    // Cek Same-Origin jika header Origin tersedia
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host   = $_SERVER['HTTP_HOST'] ?? '';
    if ($origin !== '' && $host !== '') {
        $originHost = parse_url($origin, PHP_URL_HOST);
        $originPort = parse_url($origin, PHP_URL_PORT);
        $originFull = $originPort ? ($originHost . ':' . $originPort) : (string) $originHost;
        if (strcasecmp($originFull, $host) !== 0 && strcasecmp((string) $originHost, $host) !== 0) {
            respond(['ok' => false, 'error' => 'Permintaan lintas origin ditolak (CSRF protection).'], 403);
        }
    }

    $headerToken = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $sessionToken = (string) ($_SESSION['feb_csrf_token'] ?? '');
    if ($headerToken === '' || $sessionToken === '' || !hash_equals($sessionToken, $headerToken)) {
        respond(['ok' => false, 'error' => 'Token keamanan CSRF tidak valid. Muat ulang panel admin.'], 403);
    }
}

/**
 * Sanitasi URL di sisi server untuk mencegah skema berbahaya (javascript:, vbscript:, dll.)
 */
function sanitizeSafeUrl(string $url, bool $allowHandle = false): string {
    $trimmed = trim($url);
    if ($trimmed === '') {
        return '';
    }
    // Tolak skema berbahaya secara tegas
    if (preg_match('/^\s*(javascript|vbscript|data\s*:\s*text\/html|file)\s*:/i', $trimmed)) {
        return '';
    }
    if (preg_match('/^(https?:\/\/|uploads\/|data:image\/(jpeg|png|webp|gif);base64,)/i', $trimmed)) {
        return mb_substr($trimmed, 0, 500);
    }
    if ($allowHandle && !str_contains($trimmed, ':')) {
        return mb_substr($trimmed, 0, 200);
    }
    return '';
}

function sanitizePortfolioPayload(array $data): array {
    if (isset($data['projects']) && is_array($data['projects'])) {
        foreach ($data['projects'] as &$prj) {
            if (is_array($prj)) {
                $prj['imageUrl'] = sanitizeSafeUrl((string) ($prj['imageUrl'] ?? ''));
                $prj['linkUrl']  = sanitizeSafeUrl((string) ($prj['linkUrl'] ?? ''));
            }
        }
        unset($prj);
    }
    if (isset($data['portfolios']) && is_array($data['portfolios'])) {
        foreach ($data['portfolios'] as &$ptf) {
            if (is_array($ptf)) {
                $ptf['imageUrl'] = sanitizeSafeUrl((string) ($ptf['imageUrl'] ?? ''));
                $ptf['linkUrl']  = sanitizeSafeUrl((string) ($ptf['linkUrl'] ?? ''));
            }
        }
        unset($ptf);
    }
    if (isset($data['contact']) && is_array($data['contact'])) {
        $data['contact']['instagram'] = sanitizeSafeUrl((string) ($data['contact']['instagram'] ?? ''), true);
        $data['contact']['linkedin']  = sanitizeSafeUrl((string) ($data['contact']['linkedin'] ?? ''), true);
        $data['contact']['github']    = sanitizeSafeUrl((string) ($data['contact']['github'] ?? ''), true);
    }
    return $data;
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

    // 2. Cek Status Login Admin + Kirim CSRF Token
    case 'check_auth':
        $authed = isAuthenticated();
        $payload = [
            'ok'            => true,
            'authenticated' => $authed,
            'csrfToken'     => getCsrfToken(),
        ];
        if ($authed) {
            $payload['isDefaultPassword'] = password_verify(DEFAULT_PASS, getAuthHash());
            $payload['hashAlgo'] = defined('PASSWORD_ARGON2ID') ? 'Argon2id' : 'Bcrypt';
        }
        respond($payload);
        break;

    // 3. Login Admin (Dilindungi Rate Limiting + Auto-Upgrade Argon2id)
    case 'login':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }

        $rl = checkRateLimit('admin_login', LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SEC);
        if (!$rl['allowed']) {
            $mins = (int) ceil($rl['retry_after'] / 60);
            respond([
                'ok'    => false,
                'error' => "Terlalu banyak percobaan login gagal. Coba lagi dalam {$mins} menit.",
            ], 429);
        }

        $body = getJsonInput();
        $password = (string) ($body['password'] ?? '');
        $hash = getAuthHash();

        if ($password !== '' && password_verify($password, $hash)) {
            clearRateLimit('admin_login');

            // Auto-upgrade hash lama (mis. Bcrypt) ke Argon2id secara transparan
            if (password_needs_rehash($hash, getPasswordAlgo(), getPasswordOptions())) {
                writeJsonFile(AUTH_FILE, [
                    'password_hash' => hashPassword($password),
                    'algo'          => defined('PASSWORD_ARGON2ID') ? 'argon2id' : 'bcrypt',
                    'updated_at'    => date('c'),
                ]);
            }

            session_regenerate_id(true);
            $_SESSION['feb_admin_auth']  = true;
            $_SESSION['feb_last_active'] = time();
            $_SESSION['feb_ua_hash']     = getUserAgentHash();
            $_SESSION['feb_csrf_token']  = bin2hex(random_bytes(32));

            respond([
                'ok'                => true,
                'authenticated'     => true,
                'csrfToken'         => $_SESSION['feb_csrf_token'],
                'isDefaultPassword' => ($password === DEFAULT_PASS),
                'hashAlgo'          => defined('PASSWORD_ARGON2ID') ? 'Argon2id' : 'Bcrypt',
                'message'           => 'Login berhasil.',
            ]);
        }

        recordRateLimitHit('admin_login', LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SEC);
        usleep(350000); // Delay 350ms untuk memperlambat serangan brute-force
        $afterRl = checkRateLimit('admin_login', LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SEC);
        $remInfo = $afterRl['remaining'] > 0
            ? " (Sisa percobaan: {$afterRl['remaining']})"
            : ' (Akun dikunci sementara 15 menit)';

        respond(['ok' => false, 'error' => 'Password / PIN Admin salah.' . $remInfo], 401);
        break;

    // 4. Logout Admin (Hancurkan Session & Cookie Penuh)
    case 'logout':
        if ($method === 'POST' && isAuthenticated()) {
            requireCsrf();
        }
        clearAdminSession();
        respond(['ok' => true, 'authenticated' => false]);
        break;

    // 5. Simpan Perubahan Data Portofolio (Admin Only + CSRF + Sanitasi)
    case 'save_data':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        requireCsrf();
        $body = getJsonInput();
        $data = $body['data'] ?? null;

        if (!is_array($data) || !isset($data['profile'], $data['projects'], $data['portfolios'], $data['contact'])) {
            respond(['ok' => false, 'error' => 'Struktur data portofolio tidak lengkap.'], 400);
        }

        $cleanData = sanitizePortfolioPayload($data);
        if (!writeJsonFile(DATA_FILE, $cleanData)) {
            respond(['ok' => false, 'error' => 'Gagal menulis ke file data/portfolio_data.json.'], 500);
        }
        respond(['ok' => true, 'message' => 'Data portofolio berhasil disimpan ke server.']);
        break;

    // 6. Upload Gambar Thumbnail (Admin Only + CSRF + Validasi Gambar Ganda)
    case 'upload_image':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        requireCsrf();

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
        $mime = (string) $finfo->file($file['tmp_name']);
        if (!isset($allowedMimes[$mime])) {
            respond(['ok' => false, 'error' => 'Format gambar harus JPG, PNG, WEBP, atau GIF.'], 400);
        }

        // Validasi struktur biner gambar untuk menolak file PHP/skrip yang menyamar
        $imgInfo = @getimagesize($file['tmp_name']);
        if ($imgInfo === false || empty($imgInfo[0]) || empty($imgInfo[1])) {
            respond(['ok' => false, 'error' => 'File tidak valid atau bukan gambar asli.'], 400);
        }

        $ext = $allowedMimes[$mime];
        $filename = 'thumb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
        $destPath = UPLOAD_DIR . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan file gambar di folder uploads/.'], 500);
        }

        respond([
            'ok'  => true,
            'url' => 'uploads/' . $filename,
        ]);
        break;

    // 7. Kirim Pesan dari Form Kontak Pengunjung (Publik + Anti-Spam Rate Limit)
    case 'send_message':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }

        $rl = checkRateLimit('contact_msg', MSG_MAX_ATTEMPTS, MSG_WINDOW_SEC);
        if (!$rl['allowed']) {
            $mins = (int) ceil($rl['retry_after'] / 60);
            respond(['ok' => false, 'error' => "Terlalu banyak pesan dikirim. Tunggu {$mins} menit."], 429);
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
        // Batasi maksimum 200 pesan terakhir agar file JSON tidak membengkak
        if (count($messages) > 200) {
            $messages = array_slice($messages, 0, 200);
        }

        if (!writeJsonFile(MESSAGES_FILE, $messages)) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan pesan.'], 500);
        }

        recordRateLimitHit('contact_msg', MSG_MAX_ATTEMPTS, MSG_WINDOW_SEC);
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

    // 9. Tandai Pesan Sudah Dibaca (Admin Only + CSRF)
    case 'mark_read':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        requireCsrf();
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

    // 10. Hapus Pesan dari Inbox (Admin Only + CSRF)
    case 'delete_message':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        requireCsrf();
        $body = getJsonInput();
        $id = (string) ($body['id'] ?? '');
        $messages = file_exists(MESSAGES_FILE) ? (json_decode((string) file_get_contents(MESSAGES_FILE), true) ?: []) : [];
        $messages = array_values(array_filter($messages, static fn($m) => ($m['id'] ?? '') !== $id));

        writeJsonFile(MESSAGES_FILE, $messages);
        respond(['ok' => true, 'messages' => $messages]);
        break;

    // 11. Ganti Password / PIN Admin (Admin Only + CSRF + Argon2id + Min 8 Char)
    case 'change_password':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
        requireAuth();
        requireCsrf();
        $body = getJsonInput();
        $currentPass = (string) ($body['currentPassword'] ?? '');
        $newPass     = trim((string) ($body['newPassword'] ?? ''));

        if (mb_strlen($newPass) < MIN_PASS_LENGTH) {
            respond(['ok' => false, 'error' => 'Password baru minimal ' . MIN_PASS_LENGTH . ' karakter.'], 400);
        }

        if ($newPass === $currentPass) {
            respond(['ok' => false, 'error' => 'Password baru tidak boleh sama dengan password lama.'], 400);
        }

        if (!password_verify($currentPass, getAuthHash())) {
            respond(['ok' => false, 'error' => 'Password lama tidak sesuai.'], 400);
        }

        $ok = writeJsonFile(AUTH_FILE, [
            'password_hash' => hashPassword($newPass),
            'algo'          => defined('PASSWORD_ARGON2ID') ? 'argon2id' : 'bcrypt',
            'updated_at'    => date('c'),
        ]);
        if (!$ok) {
            respond(['ok' => false, 'error' => 'Gagal menyimpan password baru.'], 500);
        }

        // Regenerasi session & CSRF token setelah password berubah
        session_regenerate_id(true);
        $_SESSION['feb_csrf_token'] = bin2hex(random_bytes(32));

        respond([
            'ok'                => true,
            'csrfToken'         => $_SESSION['feb_csrf_token'],
            'isDefaultPassword' => ($newPass === DEFAULT_PASS),
            'message'           => 'Password Admin berhasil diperbarui dengan enkripsi Argon2id.',
        ]);
        break;

    default:
        respond(['ok' => false, 'error' => 'Endpoint action tidak dikenali.'], 404);
}
