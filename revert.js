const fs = require('fs');
const path = require('path');

const filesToUpdate = ['index.html', 'inventory.html', 'admin.html'];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace src="images/filename.ext" with src="filename.ext"
    // Also covers src='images/...' and just "images/..."
    const regex = /(['"])images\/([^'"\s]+)(['"])/g;
    content = content.replace(regex, '$1$2$3');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reverted ${file}`);
    } else {
        console.log(`No changes for ${file}`);
    }
});
