#!/usr/bin/env node

/**
 * Vercel Build Script for Ekspedisi Web
 * This script handles the build process for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process...');

// Step 1: Build Tailwind CSS
console.log('📦 Building Tailwind CSS...');
try {
  execSync('npx tailwindcss -i ./public/assets/css/input.css -o ./public/assets/css/output.css --minify', { 
    stdio: 'inherit' 
  });
  console.log('✅ Tailwind CSS built successfully');
} catch (error) {
  console.error('❌ Tailwind CSS build failed:', error.message);
  process.exit(1);
}

// Step 2: Inject environment variables (if available)
console.log('🔑 Processing environment variables...');
try {
  const envScript = `
// Vercel Environment Variables Injection
(function() {
  // Make environment variables available globally for client-side access
  if (typeof window !== 'undefined') {
    // Vercel environment variables are available at build time
    window.VERCEL_ENV = '${process.env.VERCEL_ENV || 'development'}';
    
    // Only inject if they exist (for security)
    ${process.env.SUPABASE_URL ? `window.SUPABASE_URL = '${process.env.SUPABASE_URL}';` : ''}
    ${process.env.SUPABASE_ANON_KEY ? `window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY}';` : ''}
  }
})();
`;

  // Write environment script
  const envPath = path.join(__dirname, '..', 'public', 'assets', 'js', 'vercel-env.js');
  fs.writeFileSync(envPath, envScript);
  console.log('✅ Environment variables processed');
} catch (error) {
  console.log('⚠️  Environment variables not available, using defaults');
}

// Step 3: Validate build
console.log('🔍 Validating build...');
const requiredFiles = [
  'public/index.html',
  'public/assets/css/output.css',
  'public/assets/js/supabase.js',
  'public/config/environment.js'
];

let buildValid = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    buildValid = false;
  }
});

if (buildValid) {
  console.log('✅ Build validation passed');
  console.log('🎉 Vercel build completed successfully!');
} else {
  console.error('❌ Build validation failed');
  process.exit(1);
}