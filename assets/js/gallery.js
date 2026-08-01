(() => {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const items = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
  const empty = document.querySelector('[data-empty]');
  const count = document.querySelector('[data-count]');
  const dialog = document.querySelector('[data-dialog]');
  const setupDialog = document.querySelector('[data-setup-dialog]');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let selected = null;

  const money = (value, fallback) => `$${Number(value || fallback).toFixed(0)}`;
  const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

  const makeCard = (item) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'photo-card';
    card.dataset.category = item.category || 'travel';
    card.setAttribute('aria-label', `View ${item.title || 'photograph'}`);

    const imageWrap = document.createElement('span');
    imageWrap.className = 'photo-card-image';
    const image = document.createElement('img');
    image.src = item.thumbnail || item.preview;
    image.alt = item.alt || item.title || 'Fine-art photograph by Scott Simpson';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    imageWrap.append(image);

    const copy = document.createElement('span');
    copy.className = 'photo-card-copy';
    const heading = document.createElement('h2');
    heading.textContent = item.title || 'Untitled';
    const category = document.createElement('p');
    category.textContent = titleCase(item.category || 'travel');
    copy.append(heading, category);
    card.append(imageWrap, copy);
    card.addEventListener('click', () => openDialog(item));
    return card;
  };

  const render = (category = 'all') => {
    const visible = category === 'all' ? items : items.filter((item) => item.category === category);
    gallery.replaceChildren(...visible.map(makeCard));
    count.textContent = String(visible.length);
    empty.hidden = items.length !== 0;
    gallery.hidden = items.length === 0;
    window.createLemonSqueezy?.();
  };

  const openDialog = (item) => {
    selected = item;
    dialog.querySelector('[data-dialog-image]').src = item.preview;
    dialog.querySelector('[data-dialog-image]').alt = item.alt || item.title || 'Selected photograph';
    dialog.querySelector('[data-dialog-category]').textContent = titleCase(item.category || 'travel');
    dialog.querySelector('[data-dialog-title]').textContent = item.title || 'Untitled';
    dialog.querySelector('[data-dialog-location]').textContent = item.location || '';
    dialog.querySelector('[data-dialog-description]').textContent = item.description || '';
    dialog.querySelector('[data-desktop-price]').textContent = money(item.desktopPrice, 15);
    dialog.querySelector('[data-standard-print-price]').textContent = money(item.standardPrintPrice, 65);
    dialog.querySelector('[data-print-price]').textContent = money(item.printPrice, 99);
    dialog.showModal();
  };

  const closeDialog = () => {
    dialog?.close();
    selected = null;
  };

  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeDialog));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });

  document.querySelectorAll('[data-buy]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!selected) return;
      const fields = {
        desktop: 'desktopCheckout',
        standardPrint: 'standardPrintCheckout',
        print: 'printCheckout',
      };
      const checkoutUrl = selected[fields[button.dataset.buy]];
      if (!checkoutUrl) {
        setupDialog?.showModal();
        return;
      }
      if (window.LemonSqueezy?.Url?.Open) window.LemonSqueezy.Url.Open(checkoutUrl);
      else window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    });
  });

  document.querySelectorAll('[data-setup-close]').forEach((button) => {
    button.addEventListener('click', () => setupDialog?.close());
  });

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((filter) => filter.classList.toggle('active', filter === button));
      render(button.dataset.filter);
      const url = new URL(window.location.href);
      if (button.dataset.filter === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', button.dataset.filter);
      history.replaceState({}, '', url);
    });
  });

  const initial = new URLSearchParams(window.location.search).get('category');
  const selectedFilter = filters.find((button) => button.dataset.filter === initial) || filters[0];
  filters.forEach((button) => button.classList.toggle('active', button === selectedFilter));
  render(selectedFilter?.dataset.filter || 'all');
})();
