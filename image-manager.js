// ── Peekey Image Manager ── IndexedDB storage for product images ──
const ImageManager = (function () {
  const DB_NAME = 'PeekeyImages';
  const DB_VERSION = 1;
  const STORE = 'products';
  let db = null;

  function init() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE)) {
          d.createObjectStore(STORE, { keyPath: 'key' });
        }
      };
    });
  }

  async function saveImage(key, file) {
    await init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ key, blob: file, name: file.name, updatedAt: Date.now() }).onsuccess = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getImage(key) {
    await init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ? URL.createObjectURL(req.result.blob) : null);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllKeys() {
    await init();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteImage(key) {
    await init();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
      req.onsuccess = resolve;
      req.onerror = () => reject(req.error);
    });
  }

  // Apply all stored custom images to the current page
  async function applyToPage() {
    await init();
    const keys = await getAllKeys();
    if (!keys.length) return;
    const imgs = document.querySelectorAll('img[src]');
    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('http') || src.startsWith('//')) continue;
      // derive key from filename without extension
      const key = src.split('/').pop().replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
      if (keys.includes(key)) {
        const url = await getImage(key);
        if (url) img.src = url;
      }
    }
  }

  return { init, saveImage, getImage, getAllKeys, deleteImage, applyToPage };
})();
