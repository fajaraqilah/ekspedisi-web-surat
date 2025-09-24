// Supabase client configuration
// Secure credential loading system

// Initialize environment configuration
let SUPABASE_URL, SUPABASE_ANON_KEY;

try {
  // Create environment config instance
  const envConfig = new EnvironmentConfig();
  const config = envConfig.getConfig();
  
  // Validate configuration
  envConfig.validateConfig();
  
  // Set credentials from secure config
  SUPABASE_URL = config.supabaseUrl;
  SUPABASE_ANON_KEY = config.supabaseAnonKey;
  
  console.log(`Supabase configured for ${config.environment} environment`);
  
} catch (error) {
  console.error('Failed to load Supabase configuration:', error.message);
  throw new Error('Supabase configuration failed. Please ensure proper environment setup.');
}

// Initialize Supabase client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
window._supabase = _supabase;

// Helper functions for Supabase operations
async function checkUser() {
  const { data: { user } } = await _supabase.auth.getUser();
  return user;
}

async function signIn(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  return { data, error };
}

async function signOut() {
  const { error } = await _supabase.auth.signOut();
  return error;
}

// Password reset functions
async function resetPasswordForEmail(email, redirectTo) {
  const { data, error } = await _supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo
  });
  return { data, error };
}

async function updateUserPassword(newPassword) {
  const { data, error } = await _supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
}

// Function to get the current session (useful for password reset page)
async function getSession() {
  const { data: { session }, error } = await _supabase.auth.getSession();
  return { session, error };
}

// Database functions
async function getLetters() {
  console.log('getLetters() called');
  try {
    const { data, error } = await _supabase
      .from('surat')
      .select('*')
      .order('tanggal_diterima', { ascending: false });

    
    if (error) {
      console.error('Error fetching letters:', error);
      throw error;
    }
    
    console.log('getLetters() success, returned', data?.length || 0, 'records');
    return data || [];
  } catch (err) {
    console.error('getLetters() failed:', err);
    return [];
  }
}

async function addLetter(letter) {
  const { data, error } = await _supabase
    .from('surat')
    .insert([letter])
    .select();
  
  if (error) {
    console.error('Error adding letter:', error);
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}

async function updateLetter(id, updates) {
  const { data, error } = await _supabase
    .from('surat')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating letter:', error);
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}

async function deleteLetter(id) {
  const { error } = await _supabase
    .from('surat')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting letter:', error);
    return { success: false, error };
  }
  
  return { success: true, error: null };
}

// Storage functions
async function uploadSignature(file, fileName) {
  try {
    const { error: uploadError } = await _supabase
      .storage
      .from('bukti-ttd')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Return the filename instead of public URL since bucket is now private
    return fileName; // 👈 return filename to be stored in database
  } catch (err) {
    console.error('Error uploading signature:', err);
    return null;
  }
}

// Helper function to generate signed URL for private bucket files
async function getSignedUrl(fileName, expiresIn = 3600) {
  if (!fileName) return null;
  
  try {
    const { data, error } = await _supabase
      .storage
      .from('bukti-ttd')
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
}


// Make functions available globally
window.checkUser = checkUser;
window.signIn = signIn;
window.signOut = signOut;
window.resetPasswordForEmail = resetPasswordForEmail;
window.updateUserPassword = updateUserPassword;
window.getSession = getSession;
window.getLetters = getLetters;
window.addLetter = addLetter;
window.updateLetter = updateLetter;
window.deleteLetter = deleteLetter;
window.uploadSignature = uploadSignature;
window.getSignedUrl = getSignedUrl;