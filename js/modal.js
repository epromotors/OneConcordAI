(function() {
  // ── Inject CSS Styles ──
  const style = document.createElement('style');
  style.textContent = `
    .demo-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(22, 35, 43, 0.88);
      backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      overflow-y: auto;
      padding: 20px 0;
    }
    .demo-modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .demo-modal-container {
      background: rgba(4, 47, 52, 0.98);
      border: 1.5px solid var(--accent, #B5F2DB);
      border-radius: 20px;
      max-width: 540px;
      width: 90%;
      padding: 32px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(181, 242, 219, 0.15);
      position: relative;
      transform: translateY(20px) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-height: calc(100vh - 40px);
      overflow-y: auto;
    }
    .demo-modal-container::-webkit-scrollbar {
      width: 6px;
    }
    .demo-modal-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .demo-modal-container::-webkit-scrollbar-thumb {
      background: rgba(181, 242, 219, 0.2);
      border-radius: 10px;
    }
    .demo-modal-container::-webkit-scrollbar-thumb:hover {
      background: rgba(181, 242, 219, 0.4);
    }
    .demo-modal-overlay.open .demo-modal-container {
      transform: translateY(0) scale(1);
    }
    .demo-modal-close {
      position: absolute;
      top: 18px;
      right: 18px;
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 24px;
      cursor: pointer;
      transition: color 0.2s;
      line-height: 1;
    }
    .demo-modal-close:hover {
      color: var(--accent, #B5F2DB);
    }
    .demo-modal-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .demo-modal-title {
      font-family: 'Space Grotesk', 'Manrope', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 6px;
    }
    .demo-modal-subtitle {
      font-size: 13.5px;
      color: rgba(228, 238, 240, 0.7);
    }
    .demo-modal-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .demo-modal-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 480px) {
      .demo-modal-form-row {
        grid-template-columns: 1fr;
      }
    }
    .demo-modal-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .demo-modal-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255,255,255,0.75);
    }
    .demo-modal-input {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-family: inherit;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .demo-modal-input:focus {
      border-color: var(--accent, #B5F2DB);
      box-shadow: 0 0 8px rgba(181, 242, 219, 0.25);
      background: rgba(255,255,255,0.05);
    }
    .demo-modal-btn {
      background: var(--gold, #FFC933);
      color: #16232B;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 14.5px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 6px;
    }
    .demo-modal-btn:hover {
      background: #ffe082;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 201, 51, 0.25);
    }
    .demo-modal-success {
      text-align: center;
      padding: 30px 10px;
      display: none;
    }
    .demo-modal-success-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      animation: demoScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes demoScaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    .back-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(22, 35, 43, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(181, 242, 219, 0.3);
      color: #B5F2DB;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transform: translateY(15px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    .back-to-top.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .back-to-top:hover {
      background: rgba(22, 35, 43, 0.95);
      border-color: #FFC933;
      color: #FFC933;
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(255, 201, 51, 0.35);
    }
    .back-to-top svg {
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }
    .back-to-top:hover svg {
      transform: translateY(-2px);
    }
    @media (max-width: 768px) {
      .back-to-top {
        bottom: 86px;
        right: 16px;
        width: 40px;
        height: 40px;
      }
      .back-to-top svg {
        width: 18px;
        height: 18px;
      }
    }

    /* ── Mobile Floating Bottom Bar ── */
    .mob-float-bar {
      display: none;
    }
    @media (max-width: 768px) {
      .mob-float-bar {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9998;
        background: rgba(4, 24, 30, 0.97);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid rgba(181, 242, 219, 0.18);
        padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)) 12px;
        gap: 8px;
        align-items: stretch;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.45);
      }
      .mob-float-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 6px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        font-family: 'Space Grotesk', 'Manrope', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-decoration: none;
        transition: all 0.2s ease;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .mob-float-btn-demo {
        background: var(--gold, #FFC933);
        color: #16232B;
      }
      .mob-float-btn-demo:hover,
      .mob-float-btn-demo:active {
        background: #ffe082;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 201, 51, 0.4);
      }
      .mob-float-btn-pricing {
        background: rgba(181, 242, 219, 0.1);
        color: #B5F2DB;
        border: 1px solid rgba(181, 242, 219, 0.25);
      }
      .mob-float-btn-pricing:hover,
      .mob-float-btn-pricing:active {
        background: rgba(181, 242, 219, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(181, 242, 219, 0.2);
      }
      .mob-float-btn-msg {
        background: rgba(255, 255, 255, 0.07);
        color: rgba(228, 238, 240, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .mob-float-btn-msg:hover,
      .mob-float-btn-msg:active {
        background: rgba(255, 255, 255, 0.13);
        transform: translateY(-2px);
      }
      .mob-float-btn svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Inject Modal HTML ──
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'demo-modal-overlay';
  modalOverlay.id = 'demoModal';

  modalOverlay.innerHTML = `
    <div class="demo-modal-container">
      <button class="demo-modal-close" id="closeDemoModal">✕</button>
      
      <div id="demoModalFormContent">
        <div class="demo-modal-header">
          <h3 class="demo-modal-title">Book a Demo</h3>
          <p class="demo-modal-subtitle">Experience autonomous enterprise operations firsthand</p>
        </div>
        
        <form class="demo-modal-form" id="demoModalForm" data-form-type="demo">
          <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" />
          
          <div class="demo-modal-group">
            <label class="demo-modal-label">Name</label>
            <input class="demo-modal-input" type="text" name="name" autocomplete="name" placeholder="e.g. Sarah Miller" required />
          </div>
          
          <div class="demo-modal-form-row">
            <div class="demo-modal-group">
              <label class="demo-modal-label">Work email</label>
              <input class="demo-modal-input" type="email" name="email" autocomplete="email" placeholder="e.g. sarah.m@novabank.com" required />
            </div>
            <div class="demo-modal-group">
              <label class="demo-modal-label">Contact number</label>
              <input class="demo-modal-input" type="tel" name="phone" autocomplete="tel" placeholder="e.g. +1 (555) 019-2834" required />
            </div>
          </div>
          
          <div class="demo-modal-form-row">
            <div class="demo-modal-group">
              <label class="demo-modal-label">Company name</label>
              <input class="demo-modal-input" type="text" name="company" placeholder="e.g. NovaBank" required />
            </div>
            <div class="demo-modal-group">
              <label class="demo-modal-label">Website</label>
              <input class="demo-modal-input" type="text" name="company_website" placeholder="e.g. novabank.com" required />
            </div>
          </div>
          
          <div class="demo-modal-group">
            <label class="demo-modal-label">Company size</label>
            <select class="demo-modal-input" name="company_size" style="color: rgba(255,255,255,0.7);" required>
              <option value="" style="background: #042F34; color: #fff;">Select range...</option>
              <option style="background: #042F34; color: #fff;">&lt; 100 employees</option>
              <option style="background: #042F34; color: #fff;">100 – 500 employees</option>
              <option style="background: #042F34; color: #fff;">500 – 2,000 employees</option>
              <option style="background: #042F34; color: #fff;">2,000+ employees</option>
            </select>
          </div>
          
          <div class="demo-modal-group">
            <label class="demo-modal-label">Primary deployment interest</label>
            <select class="demo-modal-input" name="interest" style="color: rgba(255,255,255,0.7);" required>
              <option value="" style="background: #042F34; color: #fff;">Select primary use case...</option>
              <option style="background: #042F34; color: #fff;">IT Operations / Service Desk</option>
              <option style="background: #042F34; color: #fff;">Security Operations</option>
              <option style="background: #042F34; color: #fff;">Identity &amp; Access Management</option>
              <option style="background: #042F34; color: #fff;">Cloud Operations</option>
              <option style="background: #042F34; color: #fff;">Compliance &amp; Governance</option>
              <option style="background: #042F34; color: #fff;">Full platform — all domains</option>
            </select>
          </div>
          
          <button class="demo-modal-btn" type="submit">Send Message</button>
        </form>
      </div>

      <div class="demo-modal-success" id="demoModalSuccess">
        <div class="demo-modal-success-icon">
          <img src="OneConcord_Logo.png" alt="OneConcord AI" style="height:48px;width:auto;display:block;margin:0 auto;" />
        </div>
        <h3 class="demo-modal-title" style="color: var(--accent, #B5F2DB);">Message Sent</h3>
        <p class="demo-modal-subtitle" style="margin-top: 8px;">Our team will reach out within 4 business hours.</p>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // ── Modal Actions ──
  const closeBtn = document.getElementById('closeDemoModal');
  const form = document.getElementById('demoModalForm');
  const formContent = document.getElementById('demoModalFormContent');
  const successContent = document.getElementById('demoModalSuccess');

  function openModal() {
    formContent.style.display = 'block';
    successContent.style.display = 'none';
    form.reset();
    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      if (typeof window.sendOneConcordForm === 'function') {
        await window.sendOneConcordForm(form, 'demo');
      }
    } catch (error) {
      alert(error.message || 'Your demo request could not be sent. Please email sales@oneconcord.ai.');
      return;
    }
    if (typeof gsap !== 'undefined') {
      gsap.to(formContent, {
        opacity: 0,
        y: -15,
        duration: 0.35,
        onComplete: () => {
          formContent.style.display = 'none';
          formContent.style.opacity = 1;
          formContent.style.transform = 'none';
          
          successContent.style.display = 'block';
          gsap.fromTo(successContent, 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4 }
          );
        }
      });
    } else {
      formContent.style.display = 'none';
      successContent.style.display = 'block';
    }
  });

  // Expose function globally
  window.openBookDemoModal = openModal;

  // ── Intercept and Bind Click Events on matching buttons ──
  function bindDemoButtons() {
    document.querySelectorAll('button, a, span').forEach((el) => {
      // Check if it's already bound to avoid duplicates
      if (el.getAttribute('data-demo-bound') === 'true') return;

      const txt = (el.textContent || '').trim().toLowerCase();
      const clickAttr = el.getAttribute('onclick') || '';
      const hrefAttr = el.getAttribute('href') || '';

      const matchesText = txt.includes('book a demo') || 
                          txt.includes('book demo') || 
                          txt.includes('book a live demo');
                          
      const matchesAction = clickAttr.includes("go('contact')") || 
                            hrefAttr.includes("contact.html") ||
                            hrefAttr.includes("/contact");

      if (matchesText || (matchesAction && txt.includes('demo'))) {
        // Remove or override standard clicks/hrefs
        if (hrefAttr && (hrefAttr.includes("contact.html") || hrefAttr.includes("/contact"))) {
          el.setAttribute('href', '#');
        }
        
        // Clear both inline onclick attribute and dynamically registered onclick properties
        el.removeAttribute('onclick');
        el.onclick = null;

        el.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Close mobile menu if it is open
          const mobMenu = document.getElementById('mobMenu');
          if (mobMenu && mobMenu.classList.contains('open')) {
            if (typeof toggleMob === 'function') {
              toggleMob();
            }
          }
          
          openModal();
        });
        el.setAttribute('data-demo-bound', 'true');
      }
    });
  }

  // Bind immediately
  bindDemoButtons();

  // Re-bind periodically (useful for dynamically rendered elements or page transitions)
  setInterval(bindDemoButtons, 1000);

  // ── Inject Back to Top Button and Mobile Floating Bar ──
  function initFloatingButtons() {
    if (document.getElementById('back-to-top')) return;

    // 1. Back to Top Button
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(btn);

    // Scroll listener to reveal/hide back-to-top (state cached to prevent redundant layout updates)
    var wasVisible = false;
    window.addEventListener('scroll', () => {
      var isVisible = window.scrollY > 400;
      if (isVisible !== wasVisible) {
        wasVisible = isVisible;
        btn.classList.toggle('visible', isVisible);
      }
    }, { passive: true });

    // Smooth scroll to top on click
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // 2. Mobile Floating Bottom Bar (mobile only — CSS hides it on desktop)
    if (document.getElementById('mobFloatBar')) return;

    // Determine the pricing page path relative to current page
    var pricingHref = 'pricing.html';
    var currentPath = window.location.pathname;
    // If we are already on pricing.html, keep the link but mark it active
    var onPricing = currentPath.endsWith('pricing.html') || currentPath.endsWith('pricing');

    var bar = document.createElement('div');
    bar.id = 'mobFloatBar';
    bar.className = 'mob-float-bar';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Quick actions');
    bar.innerHTML = `
      <button
        class="mob-float-btn mob-float-btn-demo"
        id="mobFloatDemo"
        type="button"
        aria-label="Book a Demo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <polyline points="8 21 12 17 16 21"/>
        </svg>
        Demo
      </button>

      <a
        class="mob-float-btn mob-float-btn-pricing"
        id="mobFloatPricing"
        href="${pricingHref}"
        aria-label="View Pricing"
        ${onPricing ? 'aria-current="page"' : ''}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Pricing
      </a>

      <a
        class="mob-float-btn mob-float-btn-msg"
        id="mobFloatMsg"
        href="#contact"
        aria-label="Send us a message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Message
      </a>
    `;
    document.body.appendChild(bar);

    // Wire up Demo button
    document.getElementById('mobFloatDemo').addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof openModal === 'function') {
        openModal();
      } else if (typeof window.openBookDemoModal === 'function') {
        window.openBookDemoModal();
      }
    });

    // Wire up Message button to scroll to contact section cleanly on mobile without stalling
    document.getElementById('mobFloatMsg').addEventListener('click', function(e) {
      e.preventDefault();

      // Find the best visible target element for the contact form
      var targetEl = document.querySelector('.ft-form-container');
      if (!targetEl || targetEl.getBoundingClientRect().height === 0 || window.getComputedStyle(targetEl).display === 'none') {
        var pgContact = document.getElementById('pg-contact');
        if (pgContact && window.getComputedStyle(pgContact).display !== 'none') {
          targetEl = pgContact;
        } else {
          targetEl = document.getElementById('contact');
        }
      }

      if (!targetEl) return;

      // Helper to calculate target Y position in current layout
      function getTargetY() {
        var rect = targetEl.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Offset by 20px so top of container is comfortably padded from top of viewport
        return Math.max(0, rect.top + scrollTop - 20);
      }

      var startY = window.pageYOffset || document.documentElement.scrollTop;
      var targetY = getTargetY();
      var distance = targetY - startY;

      // If already at or very near target, jump directly
      if (Math.abs(distance) < 15) {
        window.scrollTo(0, targetY);
        return;
      }

      var startTime = null;
      // Dynamic duration based on distance (400ms to 700ms)
      var duration = Math.min(700, Math.max(400, Math.abs(distance) * 0.2));

      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var timeElapsed = currentTime - startTime;
        var progress = Math.min(timeElapsed / duration, 1);

        // Ease-out cubic formula
        var ease = 1 - Math.pow(1 - progress, 3);

        // Dynamically compute target Y on every frame in case mobile address bar collapse altered layout height
        var currentTargetY = getTargetY();
        var currentDistance = currentTargetY - startY;

        window.scrollTo(0, startY + currentDistance * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, getTargetY());
        }
      }

      requestAnimationFrame(step);
    });
  }

  // Initialize immediately or on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingButtons);
  } else {
    initFloatingButtons();
  }
})();
