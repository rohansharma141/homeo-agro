// =============================================
// HOMEO AGRO — Site interactions
// =============================================

// Replace this with your Web3Forms access key after sign-up at https://web3forms.com
const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_KEY';

// ---------- Language preference (runs immediately, before DOMContentLoaded) ----------
// Detect current language from URL, persist user's explicit choice, and
// auto-redirect first-time visitors with Hindi browsers to the Hindi version.
(function languagePreference() {
  const path = window.location.pathname;
  const isHindi = /(^|\/)hi\//.test(path) || /(^|\/)hi$/.test(path);
  const currentLang = isHindi ? 'hi' : 'en';
  const LS_KEY = 'homeoagro_lang';

  // Persist preference when user clicks the toggle. Wait for DOM so the
  // toggle elements exist (script runs at end of body, so they should).
  function wireToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        try { localStorage.setItem(LS_KEY, btn.dataset.lang); } catch (e) {}
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireToggle);
  } else {
    wireToggle();
  }

  // First-visit auto-redirect for Hindi browsers
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) {
      const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      const preferHindi = browserLang.startsWith('hi');
      if (preferHindi && !isHindi) {
        const hiLink = document.querySelector('.lang-btn[data-lang="hi"]');
        if (hiLink && hiLink.href) {
          localStorage.setItem(LS_KEY, 'hi');
          window.location.replace(hiLink.href);
          return;
        }
      }
      // Record current viewing language as the implicit preference
      localStorage.setItem(LS_KEY, currentLang);
    }
  } catch (e) {
    // localStorage may be unavailable (private mode, file://) — silently skip
  }
})();

// ---------- Scroll-to-top button (inject on every page) ----------
(function scrollToTop() {
  function init() {
    if (document.querySelector('.fab-top')) return;
    const btn = document.createElement('button');
    btn.className = 'fab-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          btn.classList.toggle('show', window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---------- GA4 event tracking ----------
// Helper that fires a gtag event if Google Analytics is loaded. Silent
// no-op in demo mode (placeholder Measurement ID, or local file:// view).
function trackEvent(name, params) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  // WhatsApp clicks (floating FAB + any inline per-product buttons)
  document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
    a.addEventListener('click', () => {
      trackEvent('whatsapp_click', {
        product: a.dataset.product || 'general',
        location: a.dataset.location || (a.classList.contains('fab-whatsapp') ? 'fab' : 'inline'),
        page_path: window.location.pathname
      });
    });
  });

  // Phone clicks (header link + mobile sticky call + any tel: in body)
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => {
      trackEvent('phone_click', {
        location: a.classList.contains('fab-call') ? 'sticky' : 'inline',
        page_path: window.location.pathname
      });
    });
  });
});

// ---------- Mobile nav toggle ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Mark active link by current path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    if (path === '' && href === 'index.html') a.classList.add('active');
  });

  // ---------- Form tabs (contact page) ----------
  const tabs = document.querySelectorAll('.form-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // Auto-open relevant tab from URL hash on contact page
  if (window.location.hash === '#dealer') {
    document.querySelector('[data-target="panel-dealer"]')?.click();
  } else if (window.location.hash === '#bulk') {
    document.querySelector('[data-target="panel-bulk"]')?.click();
  } else if (window.location.hash === '#farmer') {
    document.querySelector('[data-target="panel-farmer"]')?.click();
  }

  // ---------- Bulk order: add/remove rows ----------
  const bulkAdd = document.getElementById('bulk-add');
  const bulkRows = document.getElementById('bulk-rows');
  if (bulkAdd && bulkRows) {
    bulkAdd.addEventListener('click', () => {
      const row = bulkRows.firstElementChild.cloneNode(true);
      row.querySelectorAll('select, input').forEach(el => { el.value = ''; });
      bulkRows.appendChild(row);
      attachBulkRemove();
    });
    attachBulkRemove();
  }
  function attachBulkRemove() {
    document.querySelectorAll('.bulk-remove').forEach(btn => {
      btn.onclick = () => {
        const rows = document.querySelectorAll('#bulk-rows .bulk-row');
        if (rows.length > 1) btn.closest('.bulk-row').remove();
      };
    });
  }

  // ---------- Form submission via Web3Forms ----------
  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const successEl = form.querySelector('.form-success');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const formData = new FormData(form);
      // Inject the Web3Forms access key
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('from_name', 'Homeo Agro Website');

      // For bulk forms, collect items into a single field
      if (form.id === 'form-bulk') {
        const items = [];
        document.querySelectorAll('#bulk-rows .bulk-row').forEach((row, i) => {
          const product = row.querySelector('select[name^="bulk_product"]')?.value;
          const qty = row.querySelector('input[name^="bulk_qty"]')?.value;
          if (product && qty) items.push(`${i + 1}. ${product} — ${qty} units`);
        });
        formData.append('order_items', items.join('\n') || 'No items specified');
      }

      try {
        if (WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_KEY') {
          // Demo mode — show success without actually sending
          console.warn('Web3Forms key not configured. Add your key to js/main.js to enable form submission.');
          await new Promise(r => setTimeout(r, 600));
          showSuccess(successEl, form);
        } else {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            showSuccess(successEl, form);
          } else {
            alert('Something went wrong. Please try WhatsApp or call us directly.');
          }
        }
      } catch (err) {
        console.error(err);
        alert('Network error. Please try again or contact us via WhatsApp.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  });

  function showSuccess(el, form) {
    // Track form submission as a GA conversion event
    trackEvent('form_submit', {
      form_id: form.id || 'unknown',
      enquiry_type: form.querySelector('input[name="enquiry_type"]')?.value || 'unknown',
      language: form.querySelector('input[name="submitted_language"]')?.value || 'en'
    });
    if (el) {
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 8000);
    }
    form.reset();
    // Re-trigger first option for bulk
    const bulkRows = document.getElementById('bulk-rows');
    if (bulkRows && bulkRows.children.length > 1) {
      while (bulkRows.children.length > 1) bulkRows.removeChild(bulkRows.lastChild);
    }
    window.scrollTo({ top: el?.offsetTop - 100 || 0, behavior: 'smooth' });
  }

  // ---------- Scroll fade-up for elements with .reveal ----------
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
});
