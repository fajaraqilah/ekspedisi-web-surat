// ========================= RESET PASSWORD =========================

// Toast notification function (reused from auth.js)
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
  const container = document.getElementById('toast-container') || document.body;
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

// State management
let isValidSession = false;

// Password validation
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }
  
  return errors;
}

// Show/hide different states
function showLoadingState() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('error-state').classList.add('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('reset-form').classList.add('hidden');
  document.getElementById('cancel-link').classList.add('hidden');
}

function showErrorState() {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('error-state').classList.remove('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('reset-form').classList.add('hidden');
  document.getElementById('cancel-link').classList.add('hidden');
}

function showSuccessState() {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('error-state').classList.add('hidden');
  document.getElementById('success-state').classList.remove('hidden');
  document.getElementById('reset-form').classList.add('hidden');
  document.getElementById('cancel-link').classList.add('hidden');
}

function showResetForm() {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('error-state').classList.add('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('reset-form').classList.remove('hidden');
  document.getElementById('cancel-link').classList.remove('hidden');
}

// Password visibility toggles
function setupPasswordToggles() {
  // New password toggle
  const toggleNewPassword = document.getElementById('toggle-new-password');
  const newPasswordInput = document.getElementById('new-password');
  
  if (toggleNewPassword && newPasswordInput) {
    toggleNewPassword.addEventListener('click', function() {
      const isPassword = newPasswordInput.type === 'password';
      newPasswordInput.type = isPassword ? 'text' : 'password';
      
      const eyeOpen = document.getElementById('new-eye-open');
      const eyeClosed = document.getElementById('new-eye-closed');
      
      if (isPassword) {
        if (eyeOpen) eyeOpen.classList.add('hidden');
        if (eyeClosed) eyeClosed.classList.remove('hidden');
      } else {
        if (eyeOpen) eyeOpen.classList.remove('hidden');
        if (eyeClosed) eyeClosed.classList.add('hidden');
      }
    });
  }
  
  // Confirm password toggle
  const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', function() {
      const isPassword = confirmPasswordInput.type === 'password';
      confirmPasswordInput.type = isPassword ? 'text' : 'password';
      
      const eyeOpen = document.getElementById('confirm-eye-open');
      const eyeClosed = document.getElementById('confirm-eye-closed');
      
      if (isPassword) {
        if (eyeOpen) eyeOpen.classList.add('hidden');
        if (eyeClosed) eyeClosed.classList.remove('hidden');
      } else {
        if (eyeOpen) eyeOpen.classList.remove('hidden');
        if (eyeClosed) eyeClosed.classList.add('hidden');
      }
    });
  }
}

// Handle password reset form submission
async function handlePasswordReset(event) {
  event.preventDefault();
  
  if (!isValidSession) {
    showToast('Session tidak valid. Silakan gunakan link reset yang baru.', 'error');
    return;
  }
  
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitButton = document.getElementById('btnUpdatePassword');
  
  if (!newPasswordInput || !confirmPasswordInput || !submitButton) {
    showToast('Form tidak ditemukan. Silakan refresh halaman.', 'error');
    return;
  }
  
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  
  // Validate passwords
  if (!newPassword) {
    showToast('Password baru harus diisi!', 'error');
    newPasswordInput.focus();
    return;
  }
  
  if (!confirmPassword) {
    showToast('Konfirmasi password harus diisi!', 'error');
    confirmPasswordInput.focus();
    return;
  }
  
  const passwordErrors = validatePassword(newPassword);
  if (passwordErrors.length > 0) {
    showToast(passwordErrors[0], 'error');
    newPasswordInput.focus();
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('Password dan konfirmasi password tidak sama!', 'error');
    confirmPasswordInput.focus();
    return;
  }
  
  // Disable button and show loading state
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <span>Memperbarui...</span>
  `;
  
  try {
    // Update password using Supabase
    const { data, error } = await updateUserPassword(newPassword);
    
    if (error) {
      console.error('Password update error:', error);
      
      // Handle specific error cases
      if (error.message.includes('New password should be different')) {
        showToast('Password baru harus berbeda dari password lama.', 'error');
      } else if (error.message.includes('Invalid session')) {
        showToast('Session telah kedaluwarsa. Silakan gunakan link reset yang baru.', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        showToast('Gagal memperbarui password. Silakan coba lagi.', 'error');
      }
    } else {
      // Success - show success state
      showSuccessState();
      
      // Optional: Automatically redirect after a few seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    }
  } catch (error) {
    console.error('Unexpected error during password update:', error);
    showToast('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.', 'error');
  } finally {
    // Re-enable button and restore original text
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

// Check session validity on page load
async function checkSessionAndSetupPage() {
  showLoadingState();
  
  try {
    // Check if user has a valid session from the password reset flow
    const { session, error } = await getSession();
    
    if (error) {
      console.error('Session check error:', error);
      showErrorState();
      return;
    }
    
    if (!session || !session.user) {
      // No valid session
      showErrorState();
      return;
    }
    
    // Check if this is actually a password reset session
    // by looking for the reset token in URL params or session metadata
    const urlParams = new URLSearchParams(window.location.search);
    const hasResetParams = urlParams.has('access_token') || urlParams.has('refresh_token');
    
    if (!hasResetParams) {
      // Direct access without reset token
      showErrorState();
      return;
    }
    
    // Valid session and reset context
    isValidSession = true;
    showResetForm();
    setupPasswordToggles();
    
  } catch (error) {
    console.error('Unexpected error during session check:', error);
    showErrorState();
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Check session and setup page
  checkSessionAndSetupPage();
  
  // Setup form handler
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', handlePasswordReset);
  }
  
  // Handle auth state changes (Supabase listener)
  if (window._supabase) {
    window._supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset link and is now authenticated
        isValidSession = true;
        showResetForm();
        setupPasswordToggles();
      } else if (event === 'SIGNED_OUT') {
        // User session ended
        isValidSession = false;
        showErrorState();
      }
    });
  }
});