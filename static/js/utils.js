// static/js/utils.js - Shared utility functions

// Global state
let currentUser = null;
let currentPage = 'home';

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Update logout button visibility
function updateLogoutButton() {
    const logoutItem = document.getElementById('logout-item');
    if (logoutItem) {
        logoutItem.style.display = currentUser ? 'block' : 'none';
    }
}

// Check authentication
function checkAuth() {
    return currentUser !== null;
}

// Logout function
function logout() {
    console.log('Logout function called');
    currentUser = null;
    window.currentUser = null;
    updateLogoutButton();
    showAlert('Successfully logged out!');
    
    if (typeof loadPage === 'function') {
        loadPage('home');
    } else {
        window.location.reload();
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate URL format
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Make functions globally available
window.formatDate = formatDate;
window.showAlert = showAlert;
window.updateLogoutButton = updateLogoutButton;
window.checkAuth = checkAuth;
window.logout = logout;
window.currentUser = currentUser;