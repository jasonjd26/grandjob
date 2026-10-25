(() => {
  'use strict';

  const previewImage = document.getElementById('preview-image');
  const previewCaption = document.getElementById('preview-caption');
  const previewStatus = document.getElementById('preview-status');
  const pageButtons = Array.from(document.querySelectorAll('[data-page]'));
  const pages = {
    '1': { caption: 'Overview · Page 1 of 3', alt: 'Page 1 of the fictional cleaning proposal: overview, monthly price and visit schedule.' },
    '2': { caption: 'Service plan · Page 2 of 3', alt: 'Page 2 of the fictional cleaning proposal: included tasks, responsibilities and exclusions.' },
    '3': { caption: 'Owner review · Page 3 of 3', alt: 'Page 3 of the fictional cleaning proposal: monthly price, annual illustration and missing inputs for owner review.' }
  };
  let activePage = '1';

  function selectPage(page, focusButton) {
    if (!pages[page]) return;
    activePage = page;
    pageButtons.forEach(button => {
      const selected = button.dataset.page === page;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      if (selected && focusButton) button.focus();
    });
    previewCaption.textContent = pages[page].caption;
    previewImage.alt = pages[page].alt;
    previewImage.classList.add('is-loading');
    previewImage.src = 'assets/proposal-page-' + page + '.webp';
    previewStatus.textContent = 'Showing page ' + page + ' of 3. Fictional sample only.';
    if (previewImage.complete) previewImage.classList.remove('is-loading');
  }

  previewImage.addEventListener('load', () => previewImage.classList.remove('is-loading'));
  previewImage.addEventListener('error', () => {
    previewImage.classList.remove('is-loading');
    previewStatus.textContent = 'The page preview could not load. The complete PDF is available through the download link.';
  });
  pageButtons.forEach(button => {
    button.addEventListener('click', () => selectPage(button.dataset.page, false));
    button.addEventListener('keydown', event => {
      const index = pageButtons.indexOf(button);
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % pageButtons.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + pageButtons.length) % pageButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = pageButtons.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectPage(pageButtons[next].dataset.page, true);
      }
    });
  });

  const form = document.getElementById('brief-form');
  const status = document.getElementById('form-status');
  const copyButton = document.getElementById('copy-enquiry');
  const fallback = document.getElementById('copy-fallback');
  const destination = 'dalyjason1@gmail.com';
  const subject = '[Grand Job] Proposal enquiry';

  function buildEnquiry() {
    return 'Hi Jason,\n\nI would like to enquire about the commercial cleaning proposal pack.\n\n' +
      'Our cleaning business: ' + form.elements.company.value.trim() + '\n' +
      'The proposal is for: ' + form.elements.prospect.value.trim() + '\n' +
      'Preferred deadline: ' + (form.elements.deadline.value || 'To be discussed') + '\n\n' +
      'What we need:\n' + form.elements.brief.value.trim() + '\n\n' +
      'Please confirm whether the scope fits and what information you need before we agree the work.\n\nThanks,';
  }

  function validateBrief() {
    for (const field of [form.elements.company, form.elements.prospect, form.elements.brief]) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please add this information.');
    }
    return form.reportValidity();
  }

  form.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    status.textContent = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateBrief()) return;
    fallback.hidden = true;
    status.textContent = 'Your email app should open with a prepared draft. Nothing has been sent by this website. You can also copy the enquiry below.';
    window.location.href = 'mailto:' + destination + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildEnquiry());
  });

  copyButton.addEventListener('click', async () => {
    if (!validateBrief()) return;
    const text = 'To: ' + destination + '\nSubject: ' + subject + '\n\n' + buildEnquiry();
    copyButton.disabled = true;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      fallback.hidden = true;
      status.textContent = 'Enquiry copied. Paste it into your email app, review it and send when ready.';
    } catch (_) {
      fallback.value = text;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = 'Copy was not available here. Your prepared enquiry is below; select and copy it into your email app.';
    } finally {
      copyButton.disabled = false;
    }
  });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px 35px 0px' });
    document.documentElement.classList.add('js-reveal');
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
})();
