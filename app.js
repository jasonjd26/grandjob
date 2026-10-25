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
  const subjects = { proposal: '[Grand Job] Proposal enquiry', tracker: '[Grand Job] Tracker enquiry' };
  const serviceSelect = form.elements.service;
  const prospectRow = document.getElementById('prospect-row');
  const briefLabel = document.getElementById('brief-label');

  function selectedService() { return serviceSelect.value === 'proposal' ? 'proposal' : 'tracker'; }
  function currentSubject() { return subjects[selectedService()]; }
  function updateService() {
    const proposal = selectedService() === 'proposal';
    prospectRow.hidden = !proposal;
    form.elements.prospect.required = proposal;
    form.elements.prospect.setCustomValidity('');
    briefLabel.textContent = proposal ? 'What do you need put together? *' : 'What do you need to track? *';
    form.elements.brief.placeholder = proposal ? 'The request, your approved scope and price, and what you already have.' : 'The process, what you use today, and what keeps needing a follow-up.';
    status.textContent = '';
    fallback.hidden = true;
  }
  serviceSelect.addEventListener('change', updateService);
  document.querySelectorAll('[data-service-link]').forEach(link => link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.serviceLink === 'proposal' ? 'proposal' : 'tracker';
    updateService();
  }));
  updateService();

  function buildEnquiry() {
    const proposal = selectedService() === 'proposal';
    return 'Hi Jason,\n\nI would like to enquire about ' + (proposal ? 'business proposal writing (CAD495 pilot).' : 'a private browser tracker (CAD350 one-time).') + '\n\n' +
      'Our business: ' + form.elements.company.value.trim() + '\n' +
      (proposal ? 'The proposal is for: ' + form.elements.prospect.value.trim() + '\n' : '') +
      'Preferred deadline: ' + (form.elements.deadline.value || 'To be discussed') + '\n\n' +
      'What we need:\n' + form.elements.brief.value.trim() + '\n\n' +
      'Please confirm whether the scope fits and what information you need before we agree the work.\n\nThanks,';
  }

  function validateBrief() {
    const fields = [form.elements.company, form.elements.brief];
    if (selectedService() === 'proposal') fields.push(form.elements.prospect);
    for (const field of fields) {
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
    window.location.href = 'mailto:' + destination + '?subject=' + encodeURIComponent(currentSubject()) + '&body=' + encodeURIComponent(buildEnquiry());
  });

  copyButton.addEventListener('click', async () => {
    if (!validateBrief()) return;
    const text = 'To: ' + destination + '\nSubject: ' + currentSubject() + '\n\n' + buildEnquiry();
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

  const demoRows = document.getElementById('tracker-rows');
  if (demoRows) {
    const storageKey = 'grandjob.public-tracker-demo.v1';
    const statuses = ['New', 'Quoted', 'Follow-up', 'Won', 'Lost'];
    const seeds = [
      { id: 'sample-1', item: 'Sample Harbour Plumbing', work: 'Repair enquiry', status: 'New', action: 'Confirm the preferred visit time', value: 280 },
      { id: 'sample-2', item: 'Sample Cedar Landscaping', work: 'Seasonal clean-up quote', status: 'Quoted', action: 'Ask about the proposed start date', value: 640 },
      { id: 'sample-3', item: 'Sample Northline Consulting', work: 'Operations review brief', status: 'Follow-up', action: 'Confirm the agreed scope', value: 950 },
      { id: 'sample-4', item: 'Sample Willow Repairs', work: 'Door repair quote', status: 'Won', action: 'Hand over the confirmed job details', value: 190 }
    ];
    const demoNotice = document.getElementById('tracker-notice');
    const filters = Array.from(document.querySelectorAll('[data-tracker-filter]'));
    const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });
    let rows = seeds.map(row => ({ ...row }));
    let view = 'all';
    let storageAvailable = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        const valid = data.version === 1 && Array.isArray(data.rows) && data.rows.length <= 20 && data.rows.every(row =>
          typeof row.id === 'string' && typeof row.item === 'string' && row.item.length <= 80 &&
          typeof row.work === 'string' && row.work.length <= 120 && typeof row.action === 'string' && row.action.length <= 160 &&
          statuses.includes(row.status) && Number.isFinite(row.value) && row.value >= 0);
        if (valid) rows = data.rows;
      }
    } catch (_) { storageAvailable = false; }

    function persist(message) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ version: 1, demo: true, rows }));
        storageAvailable = true;
      } catch (_) { storageAvailable = false; }
      demoNotice.textContent = message + (storageAvailable ? ' Saved in this browser.' : ' Kept in this tab only; browser storage is unavailable. Export a backup to keep a copy.');
    }
    const isOpen = row => !['Won', 'Lost'].includes(row.status);
    function renderTracker(focusId) {
      const open = rows.filter(isOpen);
      document.getElementById('tracker-open-count').textContent = String(open.length);
      document.getElementById('tracker-follow-count').textContent = String(rows.filter(row => row.status === 'Follow-up').length);
      document.getElementById('tracker-open-value').textContent = cad.format(open.reduce((sum, row) => sum + row.value, 0));
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.trackerFilter === view)));
      const shown = rows.filter(row => view === 'all' || (view === 'open' && isOpen(row)) || (view === 'closed' && !isOpen(row)) || (view === 'follow-up' && row.status === 'Follow-up'));
      const fragment = document.createDocumentFragment();
      shown.forEach(row => {
        const tr = document.createElement('tr');
        const item = document.createElement('td');
        const name = document.createElement('strong'); name.textContent = row.item;
        const work = document.createElement('small'); work.textContent = row.work;
        item.append(name, work); item.dataset.label = 'Item';
        const state = document.createElement('td'); state.dataset.label = 'Status';
        const select = document.createElement('select'); select.id = 'demo-status-' + row.id;
        select.setAttribute('aria-label', 'Status for ' + row.item);
        statuses.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; select.append(option); });
        select.value = row.status;
        select.addEventListener('change', () => { row.status = select.value; persist('Sample status updated.'); renderTracker(select.id); });
        state.append(select);
        const next = document.createElement('td'); next.dataset.label = 'Next action';
        const input = document.createElement('input'); input.type = 'text'; input.maxLength = 160; input.value = row.action;
        input.setAttribute('aria-label', 'Next action for ' + row.item);
        input.addEventListener('input', () => { row.action = input.value.trim(); persist('Sample next action updated.'); });
        next.append(input);
        const value = document.createElement('td'); value.className = 'tracker-money'; value.dataset.label = 'Quote · CAD'; value.textContent = cad.format(row.value);
        tr.append(item, state, next, value); fragment.append(tr);
      });
      if (!shown.length) {
        const tr = document.createElement('tr'); const cell = document.createElement('td');
        cell.colSpan = 4; cell.className = 'tracker-empty'; cell.textContent = 'No fictional items in this view.'; tr.append(cell); fragment.append(tr);
      }
      demoRows.replaceChildren(fragment);
      document.getElementById('tracker-row-count').textContent = shown.length + ' shown · ' + rows.length + ' fictional items';
      if (focusId) (document.getElementById(focusId) || document.querySelector('[data-tracker-filter="' + view + '"]')).focus();
    }
    filters.forEach(button => button.addEventListener('click', () => { view = button.dataset.trackerFilter; renderTracker(); }));
    document.getElementById('tracker-reset').addEventListener('click', () => {
      rows = seeds.map(row => ({ ...row })); view = 'all'; persist('Reset to the original fictional example.'); renderTracker();
    });
    document.getElementById('tracker-export').addEventListener('click', () => {
      const data = { version: 1, demo: true, exported_at: new Date().toISOString(), description: 'Grand Job fictional public tracker demo backup. Not real customer records.', rows };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'grand-job-fictional-tracker-backup.json'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      demoNotice.textContent = 'Backup download prepared. Keep the JSON file as your copy of this fictional demo.';
    });
    const addForm = document.getElementById('tracker-add-form');
    addForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!addForm.reportValidity()) return;
      if (rows.length >= 20) { demoNotice.textContent = 'This public demo holds 20 fictional items. Reset it to start again. The paid scope is agreed separately.'; return; }
      const item = addForm.elements.namedItem('item').value.trim(), work = addForm.elements.work.value.trim(), action = addForm.elements.action.value.trim(), value = Number(addForm.elements.value.value);
      if (!item || !work || !action || !Number.isFinite(value) || value < 0) { demoNotice.textContent = 'Please complete the fictional item, work and next action.'; return; }
      rows.push({ id: 'sample-' + Date.now().toString(36), item, work, action, value, status: 'New' });
      view = 'all'; persist('Fictional item added.'); renderTracker(); addForm.reset(); addForm.elements.namedItem('item').focus();
    });
    renderTracker();
    demoNotice.textContent = storageAvailable ? 'Use fictional data only. Changes save in this browser when storage is available.' : 'Browser storage is unavailable. Changes stay in this tab; export a backup to keep them.';
  }

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
