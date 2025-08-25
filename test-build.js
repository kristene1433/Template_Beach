const fs = require('fs');
const path = require('path');

console.log('Testing client directory structure...');

const clientPath = path.join(__dirname, 'client');
const publicPath = path.join(clientPath, 'public');
const indexHtmlPath = path.join(publicPath, 'index.html');

console.log('Client path:', clientPath);
console.log('Public path:', publicPath);
console.log('Index.html path:', indexHtmlPath);

console.log('Client directory exists:', fs.existsSync(clientPath));
console.log('Public directory exists:', fs.existsSync(publicPath));
console.log('Index.html exists:', fs.existsSync(indexHtmlPath));

if (fs.existsSync(clientPath)) {
  console.log('Client directory contents:', fs.readdirSync(clientPath));
}

if (fs.existsSync(publicPath)) {
  console.log('Public directory contents:', fs.readdirSync(publicPath));
}

if (fs.existsSync(indexHtmlPath)) {
  console.log('Index.html content preview:', fs.readFileSync(indexHtmlPath, 'utf8').substring(0, 100));
}
