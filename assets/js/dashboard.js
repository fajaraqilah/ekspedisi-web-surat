// ========================= DASHBOARD ANALYTICS =========================

// Global variables for chart instances
let statusPieChart = null;
let monthlyTrendChart = null;

// State management (consistent with other pages)
const STATE_KEY = 'ekspedisi_state_v1';

// Dashboard data
let dashboardData = {
  totalLetters: 0,
  receivedLetters: 0,
  returnedLetters: 0,
  successRate: 0,
  statusDistribution: {},
  monthlyTrend: [],
  recentActivity: []
};

// Utility functions
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('hidden');
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function updateStatisticCards() {
  // Update total letters
  document.getElementById('total-letters').textContent = dashboardData.totalLetters.toLocaleString();
  
  // Update received letters
  document.getElementById('received-letters').textContent = dashboardData.receivedLetters.toLocaleString();
  
  // Update returned letters
  document.getElementById('returned-letters').textContent = dashboardData.returnedLetters.toLocaleString();
  
  // Update success rate
  document.getElementById('success-rate').textContent = `${dashboardData.successRate}%`;
  
  // Update current year
  document.getElementById('current-year').textContent = new Date().getFullYear();
}

// Data fetching functions
async function fetchDashboardData() {
  try {
    console.log('Fetching dashboard data...');
    
    // Fetch all letters from Supabase
    const letters = await getLetters();
    
    if (!letters || letters.length === 0) {
      console.log('No letters found');
      dashboardData = {
        totalLetters: 0,
        receivedLetters: 0,
        returnedLetters: 0,
        successRate: 0,
        statusDistribution: { 'Diterima': 0, 'Dikembalikan': 0 },
        monthlyTrend: [],
        recentActivity: []
      };
      return;
    }

    // Calculate basic statistics
    dashboardData.totalLetters = letters.length;
    dashboardData.receivedLetters = letters.filter(letter => letter.status === 'Diterima').length;
    dashboardData.returnedLetters = letters.filter(letter => letter.status === 'Dikembalikan').length;
    
    // Calculate success rate
    dashboardData.successRate = dashboardData.totalLetters > 0 
      ? Math.round((dashboardData.receivedLetters / dashboardData.totalLetters) * 100)
      : 0;

    // Calculate status distribution
    dashboardData.statusDistribution = letters.reduce((acc, letter) => {
      const status = letter.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate monthly trend for current year
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0);
    
    letters.forEach(letter => {
      const date = new Date(letter.tanggal_pengiriman);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyData[month]++;
      }
    });

    dashboardData.monthlyTrend = monthlyData;

    // Get recent activity (last 10 letters)
    // Data is already sorted by tanggal_pengiriman descending from Supabase
    dashboardData.recentActivity = letters.slice(0, 10);

    console.log('Dashboard data updated:', dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Set default values on error
    dashboardData = {
      totalLetters: 0,
      receivedLetters: 0,
      returnedLetters: 0,
      successRate: 0,
      statusDistribution: { 'Diterima': 0, 'Dikembalikan': 0 },
      monthlyTrend: Array(12).fill(0),
      recentActivity: []
    };
  }
}

// Chart creation functions
function createStatusPieChart() {
  const ctx = document.getElementById('statusPieChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (statusPieChart) {
    statusPieChart.destroy();
  }

  const statusData = dashboardData.statusDistribution;
  const labels = Object.keys(statusData);
  const data = Object.values(statusData);
  const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']; // Green, Red, Blue, Yellow

  statusPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1500
      }
    }
  });
}

function createMonthlyTrendChart() {
  const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (monthlyTrendChart) {
    monthlyTrendChart.destroy();
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  monthlyTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: 'Jumlah Surat',
        data: dashboardData.monthlyTrend,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            stepSize: 1,
            color: '#6b7280'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280'
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function updateRecentActivity() {
  const tbody = document.getElementById('recent-activity-tbody');
  if (!tbody) return;

  if (dashboardData.recentActivity.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-4 text-center text-gray-500">
          Tidak ada data aktivitas terbaru
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = dashboardData.recentActivity.map(letter => {
    const statusClass = letter.status === 'Diterima' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${letter.nomor || '-'}
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">
          <div class="max-w-xs truncate" title="${letter.perihal || '-'}">
            ${letter.perihal || '-'}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
            ${letter.status || 'Unknown'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatDate(letter.tanggal_pengiriman)}
        </td>
      </tr>
    `;
  }).join('');
}

// Main dashboard initialization
async function initializeDashboard() {
  try {
    showLoading('chart-loading');
    
    // Fetch data from Supabase
    await fetchDashboardData();
    
    // Update UI components
    updateStatisticCards();
    updateRecentActivity();
    
    // Create charts
    createStatusPieChart();
    createMonthlyTrendChart();
    
    hideLoading('chart-loading');
    
    console.log('Dashboard initialized successfully');
    
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    hideLoading('chart-loading');
    
    // Show error message
    const chartContainer = document.getElementById('chart-loading');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="flex items-center justify-center text-red-600">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span>Error loading dashboard data</span>
        </div>
      `;
    }
  }
}

// Refresh dashboard data
async function refreshDashboard() {
  const refreshButton = document.getElementById('btnRefresh');
  const refreshIcon = document.getElementById('refresh-icon');
  
  if (refreshButton) {
    refreshButton.disabled = true;
    refreshIcon.classList.add('animate-spin');
  }
  
  try {
    await initializeDashboard();
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshIcon.classList.remove('animate-spin');
    }
  }
}

// Navigation functions (consistent with other pages)
function navigateToAdmin() {
  localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'admin' }));
  window.location.href = 'admin.html';
}

function navigateToUser() {
  localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'user' }));
  window.location.href = 'index.html';
}

function navigateToLogin() {
  localStorage.setItem(STATE_KEY, JSON.stringify({ view: 'login' }));
  window.location.href = 'login.html';
}

async function handleLogout() {
  try {
    await signOut();
    localStorage.removeItem(STATE_KEY);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = 'login.html';
  }
}

// Make handleLogout available globally for sidebar
window.handleLogout = handleLogout;

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard page loaded');
  
  // Check authentication (optional - depends on your requirements)
  try {
    const user = await checkUser();
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      navigateToLogin();
      return;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    // Continue without authentication check if there's an error
  }
  
  // Initialize dashboard
  await initializeDashboard();
  
  // Set up navigation event listeners
  const btnToAdmin = document.getElementById('btnToAdmin');
  if (btnToAdmin) {
    btnToAdmin.addEventListener('click', navigateToAdmin);
  }
  
  const btnToUser = document.getElementById('btnToUser');
  if (btnToUser) {
    btnToUser.addEventListener('click', navigateToUser);
  }
  
  const btnToLogin = document.getElementById('btnToLogin');
  if (btnToLogin) {
    btnToLogin.addEventListener('click', navigateToLogin);
  }
  
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
  
  const btnRefresh = document.getElementById('btnRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', refreshDashboard);
  }
});

// Handle page visibility change to refresh data when user returns
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Page is visible again, refresh data after a short delay
    setTimeout(initializeDashboard, 1000);
  }
});

// Auto-refresh every 5 minutes (optional)
setInterval(async () => {
  if (!document.hidden) {
    console.log('Auto-refreshing dashboard data...');
    await fetchDashboardData();
    updateStatisticCards();
    updateRecentActivity();
    createStatusPieChart();
    createMonthlyTrendChart();
  }
}, 5 * 60 * 1000); // 5 minutes