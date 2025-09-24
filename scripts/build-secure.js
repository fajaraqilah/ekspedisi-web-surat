#!/usr/bin/env node

/**
 * Simple Secure Build Script for Ekspedisi Web
 * This script replaces placeholder tokens with actual credentials at build time
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const CONFIG_FILE = path.join(__dirname, '../config/environment.js');
const BACKUP_FILE = path.join(__dirname, '../config/environment.js.backup');

// Placeholder tokens to replace
const TOKENS = {
  'SUPABASE_URL_PLACEHOLDER': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY_PLACEHOLDER': process.env.SUPABASE_ANON_KEY
};

function validateEnvironment() {
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('💡 Please create .env.local file with your credentials');
    process.exit(1);
  }
}

function createBackup() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.copyFileSync(CONFIG_FILE, BACKUP_FILE);
    console.log('📋 Created backup of environment.js');
  }
}

function restoreBackup() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, CONFIG_FILE);
    fs.unlinkSync(BACKUP_FILE);
    console.log('🔄 Restored original environment.js');
  }
}

function buildSecure() {
  console.log('🔒 Starting secure build process...');
  
  // Validate environment variables
  validateEnvironment();
  
  // Create backup
  createBackup();
  
  try {
    // Read the configuration file
    let content = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    // Replace all tokens with actual values
    Object.entries(TOKENS).forEach(([token, value]) => {
      if (value) {
        content = content.replace(new RegExp(token, 'g'), value);
        console.log(`✅ Replaced ${token}`);
      }
    });
    
    // Write the processed content
    fs.writeFileSync(CONFIG_FILE, content);
    console.log('🎉 Secure build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    restoreBackup();
    process.exit(1);
  }
}

function restore() {
  console.log('🔄 Restoring original configuration...');
  restoreBackup();
  console.log('✅ Configuration restored');
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'restore') {
  restore();
} else {
  buildSecure();
  console.log('💡 Run "npm run restore" when you\'re done developing');
}