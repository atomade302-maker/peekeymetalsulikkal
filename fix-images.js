const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhir\\Desktop\\all\\PEEKEY\\peekaey done\\publish';
const files = fs.readdirSync(dir);
const images = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

// Create a mapping from a normalized name to actual filename
const imgMap = {};
images.forEach(img => {
    // normalized: lowercase, remove spaces, hyphens, underscores
    const norm = img.toLowerCase().replace(/[\s\-_]/g, '');
    imgMap[norm] = img;
});

// Explicit corrections
imgMap['mixergrinderpng'] = 'mixer-grinder.png';
imgMap['waterbottlepng'] = 'steel-water-bottle.png'; // for def-sbottle specifically, though we'll handle this in the sanitizer too

function fixHtml(file) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix DEFAULT_PRODUCTS urls
    content = content.replace(/url:\s*"([^"]+)"/g, (match, url) => {
        if (url.startsWith('http') || url.startsWith('data:')) return match;
        
        let norm = url.toLowerCase().replace(/[\s\-_]/g, '');
        // Special case for steel bottles
        if (url === 'water-bottle.png' && content.includes('{ id: "def-sbottle"')) {
            // We'll let the sanitizer handle runtime, but for default products, let's use steel-water-bottle.png
            // Actually it's easier to just do it via regex specifically:
        }
        
        if (imgMap[norm]) {
            return `url: "${imgMap[norm]}"`;
        }
        return match;
    });

    // Specific fix for steel bottles in default products
    content = content.replace(
        /{ id: "def-sbottle", [^}]+ url: "([^"]+)"/g, 
        (match, url) => match.replace(`url: "${url}"`, `url: "steel-water-bottle.png"`)
    );

    // 2. Add dynamic sanitizer for localStorage
    const oldSanitizer = `            parsed.forEach(p => {
              if (p.url && p.url.includes('/') && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                p.url = p.url.split('/').pop();
                updated = true;
              }
              if (p.descUrl && p.descUrl.includes('/') && !p.descUrl.startsWith('http') && !p.descUrl.startsWith('data:')) {
                p.descUrl = p.descUrl.split('/').pop();
                updated = true;
              }
            });`;
            
    const newSanitizer = `            parsed.forEach(p => {
              if (p.url && p.url.includes('/') && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                p.url = p.url.split('/').pop();
                updated = true;
              }
              if (p.descUrl && p.descUrl.includes('/') && !p.descUrl.startsWith('http') && !p.descUrl.startsWith('data:')) {
                p.descUrl = p.descUrl.split('/').pop();
                updated = true;
              }
              
              if (p.url && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                 let newUrl = p.url.replace(/%20/g, '-').replace(/\\s+/g, '-');
                 if (newUrl.toLowerCase() === 'mixer-grinder.png' || newUrl.toLowerCase() === 'mixer_grinder.png') {
                    newUrl = 'mixer-grinder.png';
                 }
                 if (p.id === 'def-sbottle' && (newUrl.toLowerCase() === 'water-bottle.png' || newUrl.toLowerCase() === 'water_bottle.png')) {
                    newUrl = 'steel-water-bottle.png';
                 }
                 if (p.url !== newUrl) {
                    p.url = newUrl;
                    updated = true;
                 }
              }
            });`;

    if (content.includes(oldSanitizer)) {
        content = content.replace(oldSanitizer, newSanitizer);
    }
    
    // Check for admin.html different indentation
    const oldSanitizerAdmin = `      parsed.forEach(p => {
              if (p.url && p.url.includes('/') && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                p.url = p.url.split('/').pop();
                updated = true;
              }
              if (p.descUrl && p.descUrl.includes('/') && !p.descUrl.startsWith('http') && !p.descUrl.startsWith('data:')) {
                p.descUrl = p.descUrl.split('/').pop();
                updated = true;
              }
            });`;
            
    const newSanitizerAdmin = `      parsed.forEach(p => {
              if (p.url && p.url.includes('/') && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                p.url = p.url.split('/').pop();
                updated = true;
              }
              if (p.descUrl && p.descUrl.includes('/') && !p.descUrl.startsWith('http') && !p.descUrl.startsWith('data:')) {
                p.descUrl = p.descUrl.split('/').pop();
                updated = true;
              }
              if (p.url && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                 let newUrl = p.url.replace(/%20/g, '-').replace(/\\s+/g, '-');
                 if (newUrl.toLowerCase() === 'mixer-grinder.png' || newUrl.toLowerCase() === 'mixer_grinder.png') {
                    newUrl = 'mixer-grinder.png';
                 }
                 if (p.id === 'def-sbottle' && (newUrl.toLowerCase() === 'water-bottle.png' || newUrl.toLowerCase() === 'water_bottle.png')) {
                    newUrl = 'steel-water-bottle.png';
                 }
                 if (p.url !== newUrl) {
                    p.url = newUrl;
                    updated = true;
                 }
              }
            });`;

    if (content.includes(oldSanitizerAdmin)) {
        content = content.replace(oldSanitizerAdmin, newSanitizerAdmin);
    }

    // Fix generic HTML <img> tags too (like <img src="Mixer Grinder.png"> to <img src="mixer-grinder.png">)
    content = content.replace(/src="([^"]+)"/g, (match, src) => {
        if (src.startsWith('http') || src.startsWith('data:')) return match;
        let norm = src.toLowerCase().replace(/[\s\-_]/g, '');
        if (imgMap[norm]) {
            return `src="${imgMap[norm]}"`;
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed images in ${file}`);
}

['index.html', 'inventory.html', 'admin.html'].forEach(fixHtml);
