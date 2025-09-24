// ========================= AUTH =========================
// State key for localStorage  
const STATE_KEY = 'ekspedisi_state_v1';

// Toast notification function
function showToast(message, type = 'info') {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Add to container
  const container = document.getElementById('toast-container') || document.getElementById('toast-container-register') || document.body;
  container.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    // Remove element after transition
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async function() {
  // Only run this check on login page
  if (window.location.pathname.includes('login.html')) {
    const user = await checkUser();
    if (user) {
      // User is already logged in, redirect to admin page
      window.location.href = 'admin.html';
    }
  }
});

// Form toggle functionality
function showLoginForm() {
  document.getElementById('login-card').classList.remove('hidden');
  document.getElementById('register-card').classList.add('hidden');
}

function showRegisterForm() {
  document.getElementById('login-card').classList.add('hidden');
  document.getElementById('register-card').classList.remove('hidden');
}

// Registration function
async function signUp(email, password) {
  const { data, error } = await _supabase.auth.signUp({
    email,
    password
  });
  return { data, error };
}

// Login elements
const togglePassword = document.getElementById('toggle-password');
const loginPassword = document.getElementById('login-password');
const loginUsername = document.getElementById('login-username');

// Register elements
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerForm = document.getElementById('register-form');

// Toggle buttons
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

// Add event listeners for form toggles
if (showRegisterBtn) {
  showRegisterBtn.addEventListener('click', showRegisterForm);
}

if (showLoginBtn) {
  showLoginBtn.addEventListener('click', showLoginForm);
}

// Ensure the toggle button works correctly for multiple clicks
if (togglePassword && loginPassword) {
  togglePassword.addEventListener('click', function() {
    // Get current state
    const isPassword = loginPassword.type === 'password';
    
    // Toggle the input type
    loginPassword.type = isPassword ? 'text' : 'password';
    
    // Toggle eye icon groups
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');
    
    if (isPassword) {
      // Show password - hide open eye, show closed eye
      if (eyeOpen) eyeOpen.classList.add('hidden');
      if (eyeClosed) eyeClosed.classList.remove('hidden');
    } else {
      // Hide password - show open eye, hide closed eye
      if (eyeOpen) eyeOpen.classList.remove('hidden');
      if (eyeClosed) eyeClosed.classList.add('hidden');
    }
  });
}

if (document.getElementById('btnLogin')) {
  document.getElementById('btnLogin').addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission
    
    const email = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    // Check if fields are empty
    if (!email && !password) {
      showToast('Email dan password harus diisi!', 'error');
      return;
    }
    
    if (!email) {
      showToast('Email harus diisi!', 'error');
      return;
    }
    
    if (!password) {
      showToast('Password harus diisi!', 'error');
      return;
    }
    
    // Attempt to sign in with Supabase
    const { data, error } = await signIn(email, password);
    
    if (error) {
      showToast('Email atau password salah.', 'error');
      return;
    }
    
    if (data.user) {
      // Save state to localStorage
      localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'admin' }));
      window.location.href = 'admin.html';
    }
  });
}

// Register form handler
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    
    // Check if fields are empty
    if (!email && !password) {
      showToast('Email dan password harus diisi!', 'error');
      return;
    }
    
    if (!email) {
      showToast('Email harus diisi!', 'error');
      return;
    }
    
    if (!password) {
      showToast('Password harus diisi!', 'error');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Format email tidak valid!', 'error');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      showToast('Password minimal 6 karakter!', 'error');
      return;
    }
    
    try {
      // Attempt to sign up with Supabase
      const { data, error } = await signUp(email, password);
      
      if (error) {
        showToast(`Registrasi gagal: ${error.message}`, 'error');
        return;
      }
      
      // Success
      showToast('Registrasi berhasil! Silakan cek email untuk konfirmasi.', 'success');
      
      // Clear form
      registerEmail.value = '';
      registerPassword.value = '';
      
      // Switch back to login form after a short delay
      setTimeout(() => {
        showLoginForm();
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Terjadi kesalahan saat registrasi. Silakan coba lagi.', 'error');
    }
  });
}

if (document.getElementById('gotoUser')) {
  document.getElementById('gotoUser').addEventListener('click', () => {
    // Save state to localStorage
    localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'user' }));
    window.location.href = 'index.html';
  });
}

if (document.getElementById('btnToLogin')) {
  document.getElementById('btnToLogin').addEventListener('click', () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'login' }));
    window.location.href = 'login.html';
  });
}

// Button to go to User Page from Login
if (document.getElementById('btnToUserFromLogin')) {
  document.getElementById('btnToUserFromLogin').addEventListener('click', () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'user' }));
    window.location.href = 'index.html';
  });
}

// Forgot Password Modal functionality
function showForgotPasswordModal() {
  console.log('showForgotPasswordModal called'); // Debug log
  const modal = document.getElementById('forgotPasswordModal');
  const dialog = document.getElementById('forgotPasswordDialog');
  
  if (modal && dialog) {
    console.log('Modal elements found, showing modal'); // Debug log
    modal.classList.remove('hidden');
    // Trigger the animation
    setTimeout(() => {
      dialog.classList.remove('scale-95', 'opacity-0');
      dialog.classList.add('scale-100', 'opacity-100');
    }, 10);
  } else {
    console.error('Modal elements not found:', { modal, dialog }); // Debug log
  }
}

function hideForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  const dialog = document.getElementById('forgotPasswordDialog');
  
  if (modal && dialog) {
    dialog.classList.remove('scale-100', 'opacity-100');
    dialog.classList.add('scale-95', 'opacity-0');
    
    // Hide modal after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      // Clear form
      const resetEmailInput = document.getElementById('reset-email');
      if (resetEmailInput) resetEmailInput.value = '';
    }, 300);
  }
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Forgot password form handler
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const resetEmailInput = document.getElementById('reset-email');
  const submitButton = document.getElementById('btnResetPassword');
  
  if (!resetEmailInput || !submitButton) return;
  
  const email = resetEmailInput.value.trim();
  
  // Validate email
  if (!email) {
    showToast('Email harus diisi!', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Format email tidak valid!', 'error');
    return;
  }
  
  // Disable button and show loading state
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <span>Mengirim...</span>
  `;
  
  try {
    // Get the current domain for redirect URL
    const currentDomain = window.location.origin;
    const redirectTo = `${currentDomain}/reset-password.html`;
    
    // Call Supabase reset password function
    const { data, error } = await resetPasswordForEmail(email, redirectTo);
    
    if (error) {
      console.error('Reset password error:', error);
      showToast('Terjadi kesalahan saat mengirim email reset. Silakan coba lagi.', 'error');
    } else {
      showToast(
        'Link reset password telah dikirim ke email Anda. Silakan cek email (termasuk folder spam).',
        'success'
      );
      hideForgotPasswordModal();
    }
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    showToast('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.', 'error');
  } finally {
    // Re-enable button and restore original text
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

// Event listeners for forgot password functionality
document.addEventListener('DOMContentLoaded', function() {
  // Setup forgot password link
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      showForgotPasswordModal();
    });
  }
  
  // Setup close modal button
  const closeModalBtn = document.getElementById('closeForgotPasswordModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideForgotPasswordModal);
  }
  
  // Setup form submission
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'forgotPasswordModal') {
        hideForgotPasswordModal();
      }
    });
  }
});