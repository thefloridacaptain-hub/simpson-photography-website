(() => {
  const form = document.querySelector('[data-import-form]');
  if (!form) return;

  const fileInput = form.querySelector('[data-files]');
  const dropZone = form.querySelector('[data-drop-zone]');
  const list = form.querySelector('[data-batch-list]');
  const exportButton = form.querySelector('[data-export]');
  const status = form.querySelector('[data-status]');
  let batch = [];

  const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'photograph';
  const displayTitle = (filename) => filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  const addFiles = (files) => {
    const accepted = [...files].filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type));
    accepted.forEach((file) => {
      batch.push({ id: crypto.randomUUID(), file, title: displayTitle(file.name), url: URL.createObjectURL(file) });
    });
    renderBatch();
  };

  const renderBatch = () => {
    list.replaceChildren(...batch.map((item) => {
      const row = document.createElement('div');
      row.className = 'batch-item';
      const image = document.createElement('img');
      image.src = item.url;
      image.alt = '';
      const input = document.createElement('input');
      input.value = item.title;
      input.setAttribute('aria-label', `Title for ${item.file.name}`);
      input.addEventListener('input', () => { item.title = input.value; });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(item.url);
        batch = batch.filter((entry) => entry.id !== item.id);
        renderBatch();
      });
      row.append(image, input, remove);
      return row;
    }));
    exportButton.disabled = batch.length === 0;
    status.textContent = batch.length ? `${batch.length} photograph${batch.length === 1 ? '' : 's'} ready.` : '';
  };

  const loadBitmap = async (file) => {
    if ('createImageBitmap' in window) return createImageBitmap(file, { imageOrientation: 'from-image' });
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();
    return image;
  };

  const renderImage = async (file, maxLongEdge, watermark) => {
    const source = await loadBitmap(file);
    const scale = Math.min(1, maxLongEdge / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);

    if (watermark) {
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(-Math.PI / 7);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `400 ${Math.max(18, Math.round(width / 24))}px Manrope, Arial, sans-serif`;
      context.fillStyle = 'rgba(255,255,255,.30)';
      context.strokeStyle = 'rgba(0,0,0,.30)';
      context.lineWidth = 2;
      const stepX = Math.max(280, width / 3);
      const stepY = Math.max(130, height / 4);
      for (let y = -height; y <= height; y += stepY) {
        for (let x = -width; x <= width; x += stepX) {
          context.strokeText('SCOTT SIMPSON PHOTOGRAPHY', x, y);
          context.fillText('SCOTT SIMPSON PHOTOGRAPHY', x, y);
        }
      }
      context.restore();
    }

    const quality = maxLongEdge > 1000 ? 0.84 : 0.78;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    source.close?.();
    return new Uint8Array(await blob.arrayBuffer());
  };

  const download = (bytes, filename) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  fileInput.addEventListener('change', () => addFiles(fileInput.files));
  ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  }));
  dropZone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!batch.length || !window.fflate) return;
    exportButton.disabled = true;
    const data = new FormData(form);
    const category = data.get('category');
    const location = String(data.get('location') || '').trim();
    const desktopPrice = Number(data.get('desktopPrice') || 15);
    const standardPrintPrice = Number(data.get('standardPrintPrice') || 65);
    const printPrice = Number(data.get('printPrice') || 99);
    const zipFiles = {};
    const existing = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
    const additions = [];
    const used = new Set(existing.map((item) => item.id));

    try {
      for (let index = 0; index < batch.length; index += 1) {
        const item = batch[index];
        status.textContent = `Processing ${index + 1} of ${batch.length}: ${item.title}`;
        let id = slugify(item.title);
        let suffix = 2;
        while (used.has(id)) id = `${slugify(item.title)}-${suffix++}`;
        used.add(id);
        const previewPath = `assets/images/gallery/previews/${id}.jpg`;
        const thumbPath = `assets/images/gallery/thumbs/${id}.jpg`;
        zipFiles[previewPath] = await renderImage(item.file, 2000, true);
        zipFiles[thumbPath] = await renderImage(item.file, 900, true);
        additions.push({
          id,
          title: item.title.trim() || 'Untitled',
          category,
          location,
          description: 'Fine-art photograph by Scott Simpson.',
          alt: `${item.title.trim() || 'Fine-art photograph'} by Scott Simpson`,
          preview: previewPath,
          thumbnail: thumbPath,
          desktopPrice,
          standardPrintPrice,
          printPrice,
          desktopCheckout: '',
          standardPrintCheckout: '',
          printCheckout: '',
        });
      }

      const encoder = new TextEncoder();
      const catalog = `/* Generated by the Scott Simpson Photography batch importer. */\nwindow.GALLERY_ITEMS = ${JSON.stringify([...existing, ...additions], null, 2)};\n`;
      zipFiles['assets/js/gallery-data.js'] = encoder.encode(catalog);
      zipFiles['README-GALLERY-UPDATE.txt'] = encoder.encode(
        'Upload the assets folder to the ROOT of your GitHub repository.\n' +
        'Then edit assets/js/gallery-data.js and add the three public Lemon Squeezy checkout URLs for every new photograph.\n' +
        'Never upload clean customer files to GitHub.\n'
      );
      const zipped = window.fflate.zipSync(zipFiles, { level: 6 });
      download(zipped, 'scott-simpson-gallery-update.zip');
      status.textContent = 'Finished. Your gallery update ZIP has downloaded.';
    } catch (error) {
      console.error(error);
      status.textContent = 'The export failed. Try fewer or smaller source files, then run it again.';
    } finally {
      exportButton.disabled = batch.length === 0;
    }
  });
})();
