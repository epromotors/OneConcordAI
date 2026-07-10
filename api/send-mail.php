<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

$config = require __DIR__ . '/mail-config.php';

/* ─────────────────────────── Helpers ─────────────────────────────────────── */

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_string($value, int $max = 500): string {
    $value = is_string($value) ? $value : '';
    $value = trim(str_replace(["\0", "\r"], '', $value));
    $value = preg_replace('/[^\P{C}\n\t]/u', '', $value) ?? '';
    if (mb_strlen($value, 'UTF-8') > $max) {
        $value = mb_substr($value, 0, $max, 'UTF-8');
    }
    return $value;
}

function clean_email($value): string {
    $email = filter_var(clean_string($value, 254), FILTER_SANITIZE_EMAIL);
    return is_string($email) ? $email : '';
}

function client_ip(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (empty($_SERVER[$key])) continue;
        $value = explode(',', (string) $_SERVER[$key])[0];
        $value = trim($value);
        if (filter_var($value, FILTER_VALIDATE_IP)) return $value;
    }
    return '0.0.0.0';
}

function log_denied(string $reason): void {
    $dir = __DIR__ . '/private/logs';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/denied.log';
    $ipHash = hash('sha256', client_ip());
    $time = gmdate('Y-m-d H:i:s') . ' UTC';
    $logMsg = "[{$time}] IP: {$ipHash} | Reason: {$reason}\n";
    @file_put_contents($file, $logMsg, FILE_APPEND | LOCK_EX);
}

function check_rate_limit(array $config): void {
    $dir = __DIR__ . '/private/rate-limits';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $ipHash  = hash('sha256', client_ip());
    $file    = $dir . '/' . $ipHash . '.json';
    $now     = time();
    $window  = (int) ($config['rate_limit_window_seconds'] ?? 900);
    $max     = (int) ($config['rate_limit_max'] ?? 5);
    $events  = [];
    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded)) $events = $decoded;
    }
    $events = array_values(array_filter($events, fn($ts) => is_int($ts) && ($now - $ts) < $window));
    if (count($events) >= $max) {
        log_denied('RATE_LIMIT_EXCEEDED');
        respond(429, ['ok' => false, 'message' => 'Too many requests. Please try again later.']);
    }
    $events[] = $now;
    @file_put_contents($file, json_encode($events), LOCK_EX);
}

function read_payload(): array {
    $raw         = (string) file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}

function encode_header(string $value): string {
    return mb_encode_mimeheader($value, 'UTF-8', 'B', "\r\n");
}

/* ─────────────────── Email HTML Templates ────────────────────────────────── */

function admin_html_template(array $data, string $kind, string $ipHash): string {
    $name        = htmlspecialchars(trim($data['first_name'] . ' ' . $data['last_name'] . ' ' . $data['name']));
    $email       = htmlspecialchars($data['email']);
    $phone       = htmlspecialchars($data['phone']);
    $companySize = htmlspecialchars($data['company_size']);
    $interest    = htmlspecialchars($data['interest']);
    $subject     = htmlspecialchars($data['subject']);
    $message     = nl2br(htmlspecialchars($data['message']));
    $pageUrl     = htmlspecialchars($data['page_url']);
    $submitted   = gmdate('Y-m-d H:i:s') . ' UTC';

    $typeLabel = [
        'contact' => 'Contact Message',
        'demo'    => 'Demo Request',
        'footer'  => 'Footer Inquiry',
    ][$kind] ?? 'Form Submission';

    $badgeColor = [
        'contact' => '#3B82F6',
        'demo'    => '#10B981',
        'footer'  => '#F59E0B',
    ][$kind] ?? '#6B7280';

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New {$typeLabel} — OneConcord AI</title></head>
<body style="margin:0;padding:0;background:#0d1b21;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1b21;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#16232B;border-radius:12px;overflow:hidden;border:1px solid #1e3040;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#042F34,#16232B);padding:28px 36px;border-bottom:1px solid #1e3040;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#B5F2DB;text-transform:uppercase;margin-bottom:8px;">OneConcord AI</div>
            <div style="font-size:22px;font-weight:800;color:#ffffff;">New {$typeLabel}</div>
            <span style="display:inline-block;margin-top:10px;padding:4px 12px;background:{$badgeColor};border-radius:20px;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.05em;">{$typeLabel}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="font-size:11px;font-weight:700;color:#B5F2DB;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Contact</div>
                  <div style="font-size:17px;font-weight:700;color:#fff;">{$name}</div>
                  <div style="font-size:14px;color:#94a3b8;margin-top:2px;"><a href="mailto:{$email}" style="color:#B5F2DB;text-decoration:none;">{$email}</a></div>
                  {$phone}
                </td>
              </tr>
              <tr><td style="border-top:1px solid #1e3040;padding:16px 0 0;"></td></tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="48%" style="padding-right:8px;">
                        <div style="font-size:11px;font-weight:700;color:#B5F2DB;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Company Size</div>
                        <div style="font-size:14px;color:#e2e8f0;">{$companySize}</div>
                      </td>
                      <td width="48%" style="padding-left:8px;">
                        <div style="font-size:11px;font-weight:700;color:#B5F2DB;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Interest</div>
                        <div style="font-size:14px;color:#e2e8f0;">{$interest}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style="border-top:1px solid #1e3040;padding:16px 0 0;"></td></tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="font-size:11px;font-weight:700;color:#B5F2DB;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Subject / Topic</div>
                  <div style="font-size:14px;color:#e2e8f0;">{$subject}</div>
                </td>
              </tr>
              <tr><td style="border-top:1px solid #1e3040;padding:16px 0 0;"></td></tr>
              <tr>
                <td style="padding-bottom:24px;">
                  <div style="font-size:11px;font-weight:700;color:#B5F2DB;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Message</div>
                  <div style="font-size:14px;color:#cbd5e1;line-height:1.7;background:#0d1b21;border-radius:8px;padding:16px;border-left:3px solid #B5F2DB;">{$message}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer meta -->
        <tr>
          <td style="background:#0d1b21;padding:16px 36px;border-top:1px solid #1e3040;">
            <div style="font-size:11px;color:#475569;line-height:1.8;">
              <strong style="color:#64748b;">Page:</strong> <a href="{$pageUrl}" style="color:#475569;">{$pageUrl}</a><br>
              <strong style="color:#64748b;">Submitted:</strong> {$submitted}<br>
              <strong style="color:#64748b;">IP hash:</strong> {$ipHash}
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}

function user_html_template(array $data): string {
    $name        = htmlspecialchars(trim($data['first_name'] . ' ' . $data['last_name'] . ' ' . $data['name']));
    $greeting    = $name !== '' ? 'Hi ' . $name . ',' : 'Hi,';
    $currentYear = date('Y');

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Thank you — OneConcord AI</title></head>
<body style="margin:0;padding:0;background:#0d1b21;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1b21;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#16232B;border-radius:12px;overflow:hidden;border:1px solid #1e3040;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#042F34,#16232B);padding:36px 36px 28px;text-align:center;border-bottom:1px solid #1e3040;">
            <div style="font-size:42px;margin-bottom:12px;">✓</div>
            <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#B5F2DB;text-transform:uppercase;margin-bottom:8px;">OneConcord AI</div>
            <div style="font-size:22px;font-weight:800;color:#ffffff;">We've Got Your Message</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="font-size:16px;color:#e2e8f0;margin:0 0 20px;">{$greeting}</p>
            <p style="font-size:15px;color:#94a3b8;line-height:1.8;margin:0 0 20px;">
              Thank you for reaching out to <strong style="color:#B5F2DB;">OneConcord AI</strong>. We have received your message and our team will review it shortly.
            </p>
            <p style="font-size:15px;color:#94a3b8;line-height:1.8;margin:0 0 32px;">
              If you requested a live demo, a member of our Dubai team will follow up within <strong style="color:#FFC933;">4 business hours</strong> to coordinate your session.
            </p>
            <div style="text-align:center;">
              <a href="https://oneconcord.ai" style="display:inline-block;background:#FFC933;color:#16232B;font-weight:700;font-size:14px;padding:13px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">Visit OneConcord AI →</a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0d1b21;padding:20px 36px;border-top:1px solid #1e3040;text-align:center;">
            <div style="font-size:12px;color:#475569;line-height:1.8;">
              © {$currentYear} OneConcord AI, Inc. &nbsp;·&nbsp; Newark, Delaware — USA<br>
              <a href="https://oneconcord.ai" style="color:#475569;text-decoration:none;">oneconcord.ai</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}

function admin_text_template(array $data, string $kind, string $ipHash): string {
    $name = trim($data['first_name'] . ' ' . $data['last_name'] . ' ' . $data['name']);
    $lines = [
        'New OneConcord AI Form Submission',
        '═══════════════════════════════',
        '',
        'Type         : ' . strtoupper($kind),
        'Name         : ' . $name,
        'Email        : ' . $data['email'],
        'Phone        : ' . $data['phone'],
        'Company size : ' . $data['company_size'],
        'Interest     : ' . $data['interest'],
        'Subject      : ' . $data['subject'],
        '',
        'Message:',
        '───────',
        $data['message'],
        '',
        '───────────────────────────────',
        'Page      : ' . $data['page_url'],
        'Submitted : ' . gmdate('Y-m-d H:i:s') . ' UTC',
        'IP hash   : ' . $ipHash,
    ];
    return implode("\n", $lines);
}

function user_text_template(array $data): string {
    $name     = trim($data['first_name'] . ' ' . $data['last_name'] . ' ' . $data['name']);
    $greeting = $name !== '' ? 'Hi ' . $name . ',' : 'Hi,';
    return $greeting . "\n\n"
        . "Thank you for contacting OneConcord AI. We have received your message and our team will review it shortly.\n\n"
        . "If you requested a live demo, a member of our Dubai team will follow up within 4 business hours to coordinate your session.\n\n"
        . "Regards,\n"
        . "OneConcord AI\n"
        . "https://oneconcord.ai";
}

/* ─────────────────────────── SMTP (raw socket) ───────────────────────────── */

function smtp_line($socket): string {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    return $data;
}

function smtp_expect($socket, array $codes): void {
    $line = smtp_line($socket);
    $code = (int) substr($line, 0, 3);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($line));
    }
}

function smtp_cmd($socket, string $cmd, array $codes): void {
    fwrite($socket, $cmd . "\r\n");
    smtp_expect($socket, $codes);
}

function smtp_send_html(array $config, array $to, string $subject, string $html, string $plain, string $replyTo = ''): void {
    $secure = strtolower((string) ($config['smtp_secure'] ?? 'ssl'));
    $host   = (string) $config['smtp_host'];
    $port   = (int) $config['smtp_port'];
    $target = $secure === 'ssl' ? 'ssl://' . $host : $host;

    $socket = fsockopen($target, $port, $errno, $errstr, 20);
    if (!$socket) {
        throw new RuntimeException("Could not connect to SMTP server ({$errstr}).");
    }
    stream_set_timeout($socket, 20);

    $boundary = '=_OCA_' . bin2hex(random_bytes(12));
    $fromName = encode_header((string) $config['from_name']);
    $from     = $fromName . ' <' . $config['from_email'] . '>';

    smtp_expect($socket, [220]);
    smtp_cmd($socket, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'oneconcord.ai'), [250]);

    if ($secure === 'tls') {
        smtp_cmd($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('Could not start TLS.');
        }
        smtp_cmd($socket, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'oneconcord.ai'), [250]);
    }

    smtp_cmd($socket, 'AUTH LOGIN', [334]);
    smtp_cmd($socket, base64_encode((string) $config['smtp_username']), [334]);
    smtp_cmd($socket, base64_encode((string) $config['smtp_password']), [235]);
    smtp_cmd($socket, 'MAIL FROM:<' . $config['from_email'] . '>', [250]);

    foreach ($to as $recipient) {
        smtp_cmd($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
    }

    smtp_cmd($socket, 'DATA', [354]);

    $headers = [
        'From: ' . $from,
        'To: ' . implode(', ', $to),
        'Subject: ' . encode_header($subject),
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        'X-Mailer: OneConcord AI Website',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    $body  = implode("\r\n", $headers) . "\r\n\r\n";
    $body .= '--' . $boundary . "\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $plain . "\r\n\r\n";
    $body .= '--' . $boundary . "\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $html . "\r\n\r\n";
    $body .= '--' . $boundary . "--\r\n";

    // Dot-stuff and terminate
    $body = str_replace("\n.", "\n..", $body);
    fwrite($socket, $body . "\r\n.\r\n");
    smtp_expect($socket, [250]);

    smtp_cmd($socket, 'QUIT', [221]);
    fclose($socket);
}

function send_html_message(array $config, array $to, string $subject, string $html, string $plain, string $replyTo = ''): void {
    if (!empty($config['smtp_enabled'])) {
        smtp_send_html($config, $to, $subject, $html, $plain, $replyTo);
        return;
    }
    // Fallback: PHP mail() — sends HTML with branding
    $fromName = mb_encode_mimeheader((string) $config['from_name'], 'UTF-8', 'B', "\r\n");
    $from     = $fromName . ' <' . $config['from_email'] . '>';
    $headers  = implode("\r\n", array_filter([
        'From: ' . $from,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: OneConcord AI Website',
        $replyTo !== '' ? 'Reply-To: ' . $replyTo : '',
    ]));
    foreach ($to as $recipient) {
        if (!mail($recipient, encode_header($subject), $html, $headers)) {
            throw new RuntimeException('mail() function failed.');
        }
    }
}

/* ─────────────────────────── Request Handling ────────────────────────────── */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

// CSRF token check
$payload = read_payload();
$token   = is_string($payload['csrf_token'] ?? null) ? substr((string) $payload['csrf_token'], 0, 128) : '';
if (empty($_SESSION['form_token']) || !hash_equals((string) $_SESSION['form_token'], $token)) {
    log_denied('CSRF_INVALID');
    respond(403, ['ok' => false, 'message' => 'Invalid form token. Please refresh the page and try again.']);
}
unset($_SESSION['form_token']);

// Honeypot (website field must be blank)
if (clean_string($payload['website'] ?? '', 200) !== '') {
    log_denied('HONEYPOT_TRIGGERED');
    respond(200, ['ok' => true, 'message' => 'Thanks.']); // silent accept for bots
}

check_rate_limit($config);

// Sanitise inputs
$data = [
    'type'         => clean_string($payload['type'] ?? 'contact', 40),
    'first_name'   => clean_string($payload['first_name'] ?? '', 80),
    'last_name'    => clean_string($payload['last_name'] ?? '', 80),
    'name'         => clean_string($payload['name'] ?? '', 120),
    'email'        => clean_email($payload['email'] ?? ''),
    'phone'        => clean_string($payload['phone'] ?? '', 40),
    'company_size' => clean_string($payload['company_size'] ?? '', 80),
    'interest'     => clean_string($payload['interest'] ?? '', 120),
    'subject'      => clean_string($payload['subject'] ?? '', 160),
    'message'      => clean_string($payload['message'] ?? '', 3000),
    'page_url'     => clean_string($payload['page_url'] ?? '', 500),
];

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    log_denied('EMAIL_INVALID');
    respond(422, ['ok' => false, 'message' => 'Please enter a valid email address.']);
}

$hasName    = trim($data['first_name'] . $data['last_name'] . $data['name']) !== '';
$hasContent = ($data['message'] !== '' || $data['subject'] !== '' || $data['interest'] !== '');
if (!$hasName || !$hasContent) {
    respond(422, ['ok' => false, 'message' => 'Please complete all required fields.']);
}

$kind = in_array($data['type'], ['contact', 'demo', 'footer'], true) ? $data['type'] : 'contact';

$subjectMap = [
    'contact' => 'New Contact Message — OneConcord AI',
    'demo'    => 'New Demo Request — OneConcord AI',
    'footer'  => 'New Footer Inquiry — OneConcord AI',
];

$ipHash = hash('sha256', client_ip());

try {
    // 1. Internal notification to sales team
    send_html_message(
        $config,
        (array) $config['admin_recipients'],
        $subjectMap[$kind],
        admin_html_template($data, $kind, $ipHash),
        admin_text_template($data, $kind, $ipHash),
        $data['email']   // Reply-To = user email so team can just hit Reply
    );

    // 2. Auto-reply / thank-you to the user
    send_html_message(
        $config,
        [$data['email']],
        'Thank you for contacting OneConcord AI',
        user_html_template($data),
        user_text_template($data),
        (string) $config['reply_to_fallback']
    );

} catch (Throwable $e) {
    error_log('OneConcord form mail error: ' . $e->getMessage());
    respond(500, ['ok' => false, 'message' => 'We could not send your message right now. Please email sales@oneconcord.ai directly.']);
}

respond(200, ['ok' => true, 'message' => 'Your message has been sent.']);
