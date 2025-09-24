/**
 * Sidebar Toggle Functionality
 * Handles the off-canvas sidebar for Admin and Dashboard pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarLogout = document.getElementById('sidebar-logout');

    // Check if sidebar elements exist (defensive programming)
    if (!sidebar || !sidebarOverlay || !sidebarToggle) {
        console.warn('Sidebar elements not found. Sidebar functionality disabled.');
        return;
    }

    /**
     * Open the sidebar
     */
    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
        sidebarOverlay.classList.add('opacity-50');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus trap for accessibility
        const firstFocusableElement = sidebar.querySelector('button, a');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    /**
     * Close the sidebar
     */
    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.remove('opacity-50');
        sidebarOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Toggle sidebar open/close
     */
    function toggleSidebar() {
        const isOpen = !sidebar.classList.contains('-translate-x-full');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // Event Listeners
    
    // Toggle button click
    sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });

    // Close button click (if exists)
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }

    // Overlay click to close
    sidebarOverlay.addEventListener('click', function(e) {
        if (e.target === sidebarOverlay) {
            closeSidebar();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
            closeSidebar();
        }
    });

    // Prevent sidebar content clicks from closing the sidebar
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle logout functionality (if logout button exists)
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if we have a global logout function
            if (typeof logout === 'function') {
                logout();
            } else {
                // Fallback logout logic
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }

    // Auto-close sidebar on page navigation (for single-page applications)
    const sidebarLinks = sidebar.querySelectorAll('a[href]');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add a small delay to allow for the navigation to start
            setTimeout(() => {
                closeSidebar();
            }, 100);
        });
    });

    // Handle window resize - close sidebar on large screens if open
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) { // lg breakpoint
            closeSidebar();
        }
    });

    // Initialize sidebar state
    closeSidebar(); // Ensure sidebar starts closed
});

/**
 * Export functions for external use
 */
window.sidebarControls = {
    open: function() {
        const event = new CustomEvent('sidebar:open');
        document.dispatchEvent(event);
    },
    close: function() {
        const event = new CustomEvent('sidebar:close');
        document.dispatchEvent(event);
    },
    toggle: function() {
        const event = new CustomEvent('sidebar:toggle');
        document.dispatchEvent(event);
    }
};

// Listen for custom events
document.addEventListener('sidebar:open', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('-translate-x-full')) {
        document.getElementById('sidebar-toggle').click();
    }
});

document.addEventListener('sidebar:close', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        document.getElementById('sidebar-close').click();
    }
});

document.addEventListener('sidebar:toggle', function() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.click();
    }
});