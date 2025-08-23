const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

console.log('🔍 Checking for Chrome installation...');

// Helper function to find Chrome executable on Windows
function findChromeExecutable() {
  try {
    // Try to find Chrome using where command
    const chromePath = execSync('where chrome', { encoding: 'utf8' }).trim().split('\n')[0];
    if (existsSync(chromePath)) {
      return chromePath;
    }
  } catch (error) {
    console.log('Chrome not found in PATH');
  }
  
  // Common Chrome installation paths on Windows
  const commonPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
    // Puppeteer cache directory
    join(process.env.LOCALAPPDATA || '', '.cache\\puppeteer\\chrome\\win64-139.0.7258.68\\chrome-win64\\chrome.exe'),
    join(process.env.USERPROFILE || '', '.cache\\puppeteer\\chrome\\win64-139.0.7258.68\\chrome-win64\\chrome.exe')
  ];
  
  for (const path of commonPaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

const chromePath = findChromeExecutable();

if (chromePath) {
  console.log('✅ Chrome found at:', chromePath);
  console.log('🎉 PDF generation should work now!');
} else {
  console.log('❌ Chrome not found on your system');
  console.log('');
  console.log('📥 To fix this, you have a few options:');
  console.log('');
  console.log('1. Install Google Chrome:');
  console.log('   - Download from: https://www.google.com/chrome/');
  console.log('   - Install it and restart your terminal');
  console.log('');
  console.log('2. Install Chrome for Puppeteer:');
  console.log('   - Run: npx puppeteer browsers install chrome');
  console.log('');
  console.log('3. Use a different browser:');
  console.log('   - Install Edge: npx puppeteer browsers install msedge');
  console.log('');
  console.log('After installing, restart your development server:');
  console.log('   npm run dev');
}
