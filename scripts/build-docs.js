#!/usr/bin/env node
/**
 * Build script to copy public/ to docs/ for GitHub Pages deployment
 * Adjusts paths from absolute (/) to relative (./) for GitHub Pages compatibility
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'public');
const DEST_DIR = path.join(__dirname, '..', 'docs');

// File extensions to process for path rewriting
const TEXT_EXTENSIONS = ['.html', '.css', '.js', '.json'];

// Clean and recreate docs directory
function cleanDocs() {
  if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true });
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });
  console.log('✓ Cleaned docs/ directory');
}

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      
      if (TEXT_EXTENSIONS.includes(ext)) {
        // Process text files for path rewriting
        let content = fs.readFileSync(srcPath, 'utf8');
        content = rewritePaths(content, ext);
        fs.writeFileSync(destPath, content);
      } else {
        // Copy binary files as-is
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Rewrite absolute paths to relative paths
function rewritePaths(content, ext) {
  if (ext === '.html') {
    // Remove <base href="/"> tag
    content = content.replace(/<base\s+href="\/"\s*\/?>/gi, '');
    
    // Rewrite href="/..." to href="./..."
    content = content.replace(/href="\//g, 'href="./');
    
    // Rewrite src="/..." to src="./..."
    content = content.replace(/src="\//g, 'src="./');
    
    // Rewrite url('/...) to url('./...)
    content = content.replace(/url\('\//g, "url('./");
    content = content.replace(/url\("\//g, 'url("./');
    
    // Rewrite fetch('/...) to fetch('./...)
    content = content.replace(/fetch\('\//g, "fetch('./");
    content = content.replace(/fetch\("\//g, 'fetch("./');
    
    // Rewrite import ... from '/...' to import ... from './...'
    content = content.replace(/from\s+'\/([^']+)'/g, "from './$1'");
    content = content.replace(/from\s+"\/([^"]+)"/g, 'from "./$1"');
    
    // Rewrite window.location = '/...' patterns
    content = content.replace(/location\s*=\s*'\//g, "location = './");
    content = content.replace(/location\s*=\s*"\//g, 'location = "./');
    
    // Rewrite window.location.href = '/...' patterns
    content = content.replace(/location\.href\s*=\s*'\//g, "location.href = './");
    content = content.replace(/location\.href\s*=\s*"\//g, 'location.href = "./');
  }
  
  if (ext === '.css') {
    // Rewrite url('/...) to url('./...)
    content = content.replace(/url\('\//g, "url('./");
    content = content.replace(/url\("\//g, 'url("./');
    content = content.replace(/url\(\//g, 'url(./');
  }
  
  if (ext === '.js') {
    // Rewrite fetch('/...) to fetch('./...)
    content = content.replace(/fetch\('\//g, "fetch('./");
    content = content.replace(/fetch\("\//g, 'fetch("./');
    
    // Rewrite import ... from '/...' to import ... from './...'
    content = content.replace(/from\s+'\/([^']+)'/g, "from './$1'");
    content = content.replace(/from\s+"\/([^"]+)"/g, 'from "./$1"');
    
    // Rewrite string paths like '/images/...' (NOT /api/ - those go to external backend)
    content = content.replace(/'\/(images|css|js|components)\//g, "'./$1/");
    content = content.replace(/"\/(images|css|js|components)\//g, '"./$1/');
    
    // Rewrite redirects
    content = content.replace(/location\s*=\s*'\//g, "location = './");
    content = content.replace(/location\s*=\s*"\//g, 'location = "./');
    content = content.replace(/location\.href\s*=\s*'\//g, "location.href = './");
    content = content.replace(/location\.href\s*=\s*"\//g, 'location.href = "./');
  }
  
  return content;
}

// Main build process
console.log('Building docs/ from public/...\n');

cleanDocs();
copyDir(SOURCE_DIR, DEST_DIR);

// Copy .nojekyll file to docs root
const nojekyllSrc = path.join(__dirname, '..', '.nojekyll');
const nojekyllDest = path.join(DEST_DIR, '.nojekyll');
if (fs.existsSync(nojekyllSrc)) {
  fs.copyFileSync(nojekyllSrc, nojekyllDest);
} else {
  fs.writeFileSync(nojekyllDest, '');
}
console.log('✓ Added .nojekyll file');

console.log('\n✅ Build complete! docs/ is ready for GitHub Pages.');
