/**
 * OneConcord AI — Form Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Wires all three form types to the PHP API endpoint:
 *   contactForm  (data-form-type="contact")  → inline success panel
 *   demoModalForm (called via window.sendOneConcordForm) → modal handles UI
 *   ft-form      (data-form-type="footer")   → inline thank-you banner
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  const ENDPOINT       = 'api/send-mail.php';
  const TOKEN_ENDPOINT = 'api/form-token.php';

  /* ── Token fetch ─────────────────────────────────────────────────────── */
  async function getToken() {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Could not prepare the secure form token.');
    const data = await res.json();
    if (!data || !data.token) throw new Error('Secure form token was missing.');
    return data.token;
  }

  /* ── Submit button busy state ────────────────────────────────────────── */
  function setBusy(form, busy) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (busy) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.disabled             = true;
      btn.style.opacity        = '0.7';
      btn.innerHTML            = '<span style="display:inline-flex;align-items:center;gap:8px;">'
        + '<svg style="width:16px;height:16px;animation:ocSpin 0.9s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'
        + 'Sending…</span>';
    } else {
      btn.disabled      = false;
      btn.style.opacity = '';
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    }
  }

  /* ── Build payload from form ─────────────────────────────────────────── */
  function payloadFromForm(form, type) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = typeof value === 'string' ? value.trim() : value;
    });
    data.type     = type || form.dataset.formType || data.type || 'contact';
    data.page_url = window.location.href;
    return data;
  }

  /* ── POST form data to PHP endpoint ─────────────────────────────────── */
  async function postForm(form, type) {
    const payload       = payloadFromForm(form, type);
    payload.csrf_token  = await getToken();

    const res = await fetch(ENDPOINT, {
      method:      'POST',
      credentials: 'same-origin',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'Your message could not be sent. Please try again.');
    }
    return data;
  }

  /* ── Show inline success banner for footer form ──────────────────────── */
  function showFooterSuccess(form) {
    const container = form.closest('.ft-form-container');
    if (!container) return;
    form.style.transition = 'opacity 0.3s';
    form.style.opacity    = '0';
    setTimeout(() => {
      form.style.display = 'none';
      const banner       = document.createElement('div');
      banner.style.cssText = 'text-align:center;padding:20px 8px;animation:fadeInUp 0.4s ease';
      banner.innerHTML     = '<div style="font-size:36px;margin-bottom:10px;color:#B5F2DB">✓</div>'
        + '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px">Message sent!</div>'
        + '<div style="font-size:13px;color:rgba(228,238,240,0.7)">Our team will reach out within 4 business hours.</div>';
      container.appendChild(banner);
    }, 320);
  }

  /* ── Standard form submit handler (contactForm + footer form) ────────── */
  async function handleStandardSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget || event.target;
    setBusy(form, true);
    try {
      await postForm(form, form.dataset.formType || 'contact');
      form.reset();

      // contactForm → show #formSuccess panel
      if (form.id === 'contactForm') {
        const success = form.parentElement && form.parentElement.querySelector('#formSuccess');
        if (success) {
          form.style.display    = 'none';
          success.style.display = 'block';
        }
        return;
      }

      // footer ft-form → show inline banner
      if (form.classList.contains('ft-form')) {
        showFooterSuccess(form);
        return;
      }

      alert('Message sent successfully.');
    } catch (error) {
      alert(error.message || 'Your message could not be sent. Please email sales@oneconcord.ai.');
    } finally {
      setBusy(form, false);
    }
  }

  /* ── Auto-bind forms marked with data-oneconcord-form ───────────────── */
  function bindStaticForms() {
    document.querySelectorAll('form[data-oneconcord-form="true"]').forEach((form) => {
      if (form.dataset.bound === 'true') return;
      form.dataset.bound = 'true';
      form.removeAttribute('onsubmit'); // Remove legacy inline onsubmit
      form.addEventListener('submit', handleStandardSubmit);
    });
  }

  /* ── Inject spinner keyframes ────────────────────────────────────────── */
  if (!document.getElementById('oc-forms-style')) {
    const s = document.createElement('style');
    s.id    = 'oc-forms-style';
    s.textContent = `
      @keyframes ocSpin { to { transform: rotate(360deg); } }
      @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
    `;
    document.head.appendChild(s);
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  // Called by demo modal: modal.js → await window.sendOneConcordForm(form, 'demo')
  window.sendOneConcordForm = async function (form, type) {
    setBusy(form, true);
    try {
      const result = await postForm(form, type);
      form.reset();
      return result;
    } finally {
      setBusy(form, false);
    }
  };

  // Used by inline onsubmit="submitForm(event)" attributes on contactForm
  window.submitForm = handleStandardSubmit;

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindStaticForms);
  } else {
    bindStaticForms();
  }
})();
