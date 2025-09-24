/**
 * Secure API Client - Frontend
 * 
 * This file handles all secure API calls to Supabase Edge Functions
 * No sensitive keys are exposed to the frontend
 */

class SecureAPIClient {
  constructor() {
    // Use configuration manager for environment-specific URLs
    if (window.configManager) {
      this.baseURL = window.configManager.getFunctionsUrl();
    } else {
      // Fallback if config manager not loaded
      this.baseURL = window.location.origin.includes('localhost') 
        ? 'http://localhost:5500/login.html'  // Local development
        : 'https://wasdkdppgsepanugzakn.supabase.co'; // Production - REPLACE WITH YOUR URL
    }
    
    this.endpoints = {
      // Authentication endpoints
      signIn: '/auth-signin',
      signUp: '/auth-signup', 
      signOut: '/auth-signout',
      getCurrentUser: '/auth-user',
      
      // Letter management endpoints
      getLetters: '/letters-get',
      addLetter: '/letters-add',
      updateLetter: '/letters-update',
      deleteLetter: '/letters-delete',
      
      // File management endpoints
      uploadSignature: '/files-upload',
      getSignedUrl: '/files-signed-url',
      deleteFile: '/files-delete'
    };
  }
  
  /**
   * Generic secure fetch wrapper
   */
  async secureRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include', // Include HTTP-only cookies
        ...options
      };
      
      // Add body if provided
      if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`API Request failed [${endpoint}]:`, error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
  
  /**
   * Authentication Methods
   */
  async signIn(email, password) {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    return await this.secureRequest(this.endpoints.signIn, {
      body: { 
        email: this.sanitizeInput(email), 
        password: password // Password not sanitized to preserve special chars
      }
    });
  }
  
  async signUp(email, password) {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    return await this.secureRequest(this.endpoints.signUp, {
      body: { 
        email: this.sanitizeInput(email), 
        password: password 
      }
    });
  }
  
  async signOut() {
    return await this.secureRequest(this.endpoints.signOut);
  }
  
  async getCurrentUser() {
    return await this.secureRequest(this.endpoints.getCurrentUser);
  }
  
  /**
   * Letter Management Methods
   */
  async getLetters(searchQuery = '') {
    return await this.secureRequest(this.endpoints.getLetters, {
      body: { 
        search: this.sanitizeInput(searchQuery) 
      }
    });
  }
  
  async addLetter(letterData) {
    // Validate and sanitize input
    const sanitizedData = this.sanitizeLetterData(letterData);
    
    return await this.secureRequest(this.endpoints.addLetter, {
      body: sanitizedData
    });
  }
  
  async updateLetter(id, updates) {
    if (!id) throw new Error('Letter ID is required');
    
    const sanitizedData = this.sanitizeLetterData(updates);
    
    return await this.secureRequest(this.endpoints.updateLetter, {
      body: { 
        id: this.sanitizeInput(id), 
        updates: sanitizedData 
      }
    });
  }
  
  async deleteLetter(id, signatureFileName = null) {
    if (!id) throw new Error('Letter ID is required');
    
    return await this.secureRequest(this.endpoints.deleteLetter, {
      body: { 
        id: this.sanitizeInput(id),
        signatureFileName: signatureFileName ? this.sanitizeInput(signatureFileName) : null
      }
    });
  }
  
  /**
   * File Management Methods
   */
  async uploadSignature(file, fileName) {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      throw new Error('Valid file is required');
    }
    
    // Convert file to base64 for secure transmission
    const base64Data = await this.fileToBase64(file);
    
    return await this.secureRequest(this.endpoints.uploadSignature, {
      body: {
        fileName: this.sanitizeInput(fileName),
        fileData: base64Data,
        fileType: file.type
      }
    });
  }
  
  async getSignedUrl(fileName, expiresIn = 3600) {
    if (!fileName) throw new Error('File name is required');
    
    return await this.secureRequest(this.endpoints.getSignedUrl, {
      body: {
        fileName: this.sanitizeInput(fileName),
        expiresIn: Math.max(300, Math.min(expiresIn, 7200)) // Clamp between 5min - 2hours
      }
    });
  }
  
  /**
   * Utility Methods
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potential XSS chars
      .substring(0, 1000); // Limit length
  }
  
  sanitizeLetterData(data) {
    const sanitized = {};
    
    // Define allowed fields to prevent injection of unwanted data
    const allowedFields = [
      'nomor', 'tanggal_pengiriman', 'perihal', 'jenis_surat', 
      'kategori_surat', 'tujuan_surat', 'penerima', 'bukti_ttd_url',
      'tanggal_diterima', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = this.sanitizeInput(data[field]);
      }
    });
    
    return sanitized;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
}

// Create global instance
window.secureAPI = new SecureAPIClient();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureAPIClient;
}