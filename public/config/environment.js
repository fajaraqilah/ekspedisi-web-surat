// Environment-aware configuration system
// This file handles secure credential loading for different environments

class EnvironmentConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Development environment detection
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.includes('.local') ||
        protocol === 'file:') {
      return 'development';
    }
    
    // Vercel production environment
    if (hostname.includes('.vercel.app') || 
        hostname.includes('vercel.') ||
        window.location.origin.includes('vercel')) {
      return 'vercel';
    }
    
    // Production environment
    return 'production';
  }

  loadConfiguration() {
    if (this.environment === 'development') {
      return this.getDevConfig();
    } else if (this.environment === 'vercel') {
      return this.getVercelConfig();
    } else {
      return this.getProdConfig();
    }
  }

  getDevConfig() {
    // For development - credentials will be injected here during build
    return {
      supabaseUrl: 'https://wasdkdppgsepanugzakn.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc2RrZHBwZ3NlcGFudWd6YWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjcyNTgsImV4cCI6MjA3MzA0MzI1OH0.53THlqHvjsMzBTy2JF6l7lushbb0VpBYCJFygl7VlnM',
      environment: 'development'
    };
  }

  getProdConfig() {
    // For production, credentials should come from environment variables
    // injected during build/deployment process
    return {
      supabaseUrl: window.SUPABASE_URL || 'https://wasdkdppgsepanugzakn.supabase.co',
      supabaseAnonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc2RrZHBwZ3NlcGFudWd6YWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjcyNTgsImV4cCI6MjA3MzA0MzI1OH0.53THlqHvjsMzBTy2JF6l7lushbb0VpBYCJFygl7VlnM',
      environment: 'production'
    };
  }

  getVercelConfig() {
    // For Vercel deployment - environment variables are available at runtime
    // Check multiple possible sources for environment variables
    const supabaseUrl = process?.env?.SUPABASE_URL || 
                       window?.VITE_SUPABASE_URL || 
                       window?.NEXT_PUBLIC_SUPABASE_URL ||
                       window?.REACT_APP_SUPABASE_URL ||
                       'https://wasdkdppgsepanugzakn.supabase.co';
    
    const supabaseAnonKey = process?.env?.SUPABASE_ANON_KEY ||
                           window?.VITE_SUPABASE_ANON_KEY ||
                           window?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                           window?.REACT_APP_SUPABASE_ANON_KEY ||
                           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc2RrZHBwZ3NlcGFudWd6YWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjcyNTgsImV4cCI6MjA3MzA0MzI1OH0.53THlqHvjsMzBTy2JF6l7lushbb0VpBYCJFygl7VlnM';
    
    return {
      supabaseUrl,
      supabaseAnonKey,
      environment: 'vercel'
    };
  }

  getConfig() {
    return this.config;
  }

  validateConfig() {
    const { supabaseUrl, supabaseAnonKey } = this.config;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('PLACEHOLDER') || 
        supabaseAnonKey.includes('PLACEHOLDER')) {
      throw new Error('Supabase configuration is incomplete. Please run the build process.');
    }
    
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      throw new Error('Invalid Supabase URL format.');
    }
    
    return true;
  }
}

// Export for use in other modules
window.EnvironmentConfig = EnvironmentConfig;