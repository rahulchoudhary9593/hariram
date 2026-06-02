const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === '.git') return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
};

const allFiles = walk('./');
const allHtml = allFiles.filter(f => f.endsWith('.html'));

console.log('Total HTML Files:', allHtml.length);

let brokenLinks = [];
let internalIds = new Map();

// First pass: collect all IDs in all files
allHtml.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const ids = content.match(/id=[\"\']([^\"\']+)[\"\']/g) || [];
    const idsSet = new Set(ids.map(id => id.replace(/id=[\"\']/,'').replace(/[\"\']/,'')));
    internalIds.set(file, idsSet);
});

// Second pass: check links
allHtml.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const hrefs = content.match(/href=[\"\']([^\"\']+)[\"\']/g) || [];
    hrefs.forEach(h => {
        let link = h.replace(/href=[\"\']/,'').replace(/[\"\']/,'');
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) return;
        
        let targetFile = link;
        let hash = '';
        if (link.includes('#')) {
            const parts = link.split('#');
            targetFile = parts[0];
            hash = parts[1];
        }

        if (targetFile === '') {
            // Internal hash in same file
            if (hash && !internalIds.get(file).has(hash)) {
                brokenLinks.push({ file, link: '#' + hash, reason: 'ID not found in same file' });
            }
        } else {
            const dir = path.dirname(file);
            const target = path.resolve(dir, targetFile);
            if (!fs.existsSync(target)) {
                brokenLinks.push({ file, link, reason: 'File not found' });
            } else {
                // If there's a hash, check if ID exists in target file
                // Note: to resolve target properly we need the relative path from root to find in internalIds
                // But it's complex, skip hash checking for external files for now.
            }
        }
    });

    // Check src
    const srcs = content.match(/src=[\"\']([^\"\']+)[\"\']/g) || [];
    srcs.forEach(s => {
        const src = s.replace(/src=[\"\']/,'').replace(/[\"\']/,'');
        if (src.startsWith('http') || src.startsWith('data:')) return;
        const dir = path.dirname(file);
        const target = path.resolve(dir, src);
        if (!fs.existsSync(target)) {
            brokenLinks.push({ file, link: src, reason: 'Src file not found' });
        }
    });
});

console.log(JSON.stringify(brokenLinks, null, 2));
