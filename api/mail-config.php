<?php
declare(strict_types=1);

/**
 * OneConcord AI — Mail Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ACTIVATE SMTP:
 *   1. In cPanel → Email Accounts → create: no-reply@oneconcord.ai
 *   2. Note the SMTP host (usually mail.oneconcord.ai) and password.
 *   3. Set 'smtp_enabled' => true
 *   4. Set 'smtp_password' to the real password.
 *   5. Upload to server. NEVER commit the real password to Git.
 * ─────────────────────────────────────────────────────────────────────────────
 */

return [

    /* ── SMTP toggle ───────────────────────────────────────────────────────
     * false = use PHP mail() (quick test, often goes to spam)
     * true  = use SMTP (recommended for production)
     */
    'smtp_enabled'  => false,             // ← change to true after filling credentials

    /* ── SMTP credentials (from cPanel Email Accounts) ─────────────────── */
    'smtp_host'     => 'mail.oneconcord.ai',
    'smtp_port'     => 465,               // 465 for SSL  |  587 for TLS
    'smtp_secure'   => 'ssl',             // 'ssl' or 'tls'  (match the port above)
    'smtp_username' => 'no-reply@oneconcord.ai',
    'smtp_password' => 'CHANGE_THIS_ON_SERVER',   // ← fill this in before uploading

    /* ── Sender identity ────────────────────────────────────────────────── */
    'from_email'    => 'no-reply@oneconcord.ai',
    'from_name'     => 'OneConcord AI',

    /* ── Reply-To for user auto-replies (so replies land in your inbox) ── */
    'reply_to_fallback' => 'sales@oneconcord.ai',

    /* ── Internal recipients — who gets the lead notification ───────────── */
    'admin_recipients' => [
        'sales@oneconcord.ai',
    ],

    /* ── Security ───────────────────────────────────────────────────────── */
    'site_origin'              => 'https://oneconcord.ai',
    'rate_limit_max'           => 5,      // max form submissions per IP per window
    'rate_limit_window_seconds'=> 900,    // 15 minutes

];
