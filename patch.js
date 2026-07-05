const fs = require('fs');
const path = require('path');

const ecomPath = path.join(__dirname, 'ecommerce.js');
let ecom = fs.readFileSync(ecomPath, 'utf8');

const sanitizeSnippet = `
// --- Auto-Sanitize LocalStorage Images (Spaces to Hyphens) ---
(function() {
    try {
        const SK = 'peekey_products_v2';
        let stored = localStorage.getItem(SK);
        if (stored) {
            let parsed = JSON.parse(stored);
            let updated = false;
            parsed.forEach(p => {
                if (p.url && !p.url.startsWith('http') && !p.url.startsWith('data:')) {
                    if (p.url.includes(' ')) {
                        p.url = p.url.replace(/ /g, '-');
                        updated = true;
                    }
                }
            });
            if (updated) {
                localStorage.setItem(SK, JSON.stringify(parsed));
                console.log('Sanitized spaces to hyphens in product images');
            }
        }
    } catch (e) {
        console.error('Failed to sanitize products', e);
    }
})();

`;

if (!ecom.includes('Auto-Sanitize LocalStorage Images')) {
    fs.writeFileSync(ecomPath, sanitizeSnippet + ecom, 'utf8');
    console.log("Prepended sanitization logic to ecommerce.js");
} else {
    console.log("Sanitization logic already exists");
}
