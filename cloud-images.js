// ── Peekey Cloud Image Manager — Cloudinary Integration ──────────────────
const CloudImages = (function () {
  const FOLDER = 'peekey';
  const LS_CLOUD    = 'peekey_cloud_name';
  const LS_PRESET   = 'peekey_upload_preset';
  const LS_UPLOADED = 'peekey_uploaded_keys';

  let cloudName    = localStorage.getItem(LS_CLOUD)   || '';
  let uploadPreset = localStorage.getItem(LS_PRESET)  || '';

  // ── Config ──────────────────────────────────────────────────────────────
  function saveConfig(name, preset) {
    cloudName = name.trim();
    uploadPreset = preset.trim();
    localStorage.setItem(LS_CLOUD, cloudName);
    localStorage.setItem(LS_PRESET, uploadPreset);
  }

  function isConfigured() { return !!(cloudName && uploadPreset); }

  function getConfig() { return { cloudName, uploadPreset }; }

  // ── Helpers ──────────────────────────────────────────────────────────────
  // Convert product key → Cloudinary public_id
  function toPublicId(key) {
    return FOLDER + '/' + key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  // Build the CDN URL for a product key
  function getUrl(key, transform) {
    if (!cloudName) return null;
    const t = transform ? transform + '/' : '';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${t}${toPublicId(key)}`;
  }

  // ── Uploaded keys tracking ───────────────────────────────────────────────
  function getUploadedKeys() {
    try { return JSON.parse(localStorage.getItem(LS_UPLOADED) || '[]'); }
    catch { return []; }
  }

  function markUploaded(key) {
    const list = getUploadedKeys();
    if (!list.includes(key)) { list.push(key); localStorage.setItem(LS_UPLOADED, JSON.stringify(list)); }
  }

  function unmarkUploaded(key) {
    const list = getUploadedKeys().filter(k => k !== key);
    localStorage.setItem(LS_UPLOADED, JSON.stringify(list));
  }

  // ── Upload to Cloudinary ─────────────────────────────────────────────────
  function upload(key, file, onProgress) {
    if (!isConfigured()) return Promise.reject(new Error('Cloudinary not configured'));
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('public_id', toPublicId(key));
    fd.append('overwrite', 'true');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      if (onProgress) xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200) { markUploaded(key); resolve(res); }
        else reject(new Error(res.error?.message || 'Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(fd);
    });
  }

  // ── Apply cloud images to the live page ──────────────────────────────────
  function applyToPage() {
    if (!isConfigured()) return;
    const uploaded = getUploadedKeys();
    if (!uploaded.length) return;

    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('http') || src.startsWith('//')) return;
      const key = src.split('/').pop().replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
      if (uploaded.includes(key)) {
        const url = getUrl(key, 'f_auto,q_auto');
        if (url) {
          const original = img.src;
          img.src = url;
          img.onerror = () => { img.src = original; img.onerror = null; };
        }
      }
    });
  }

  return { saveConfig, isConfigured, getConfig, getUrl, getUploadedKeys, markUploaded, unmarkUploaded, upload, applyToPage };
})();
