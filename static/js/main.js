// static/js/main.js - Main application controller

// Page loader using embedded templates (works with file:// protocol)
function loadPage(pageName) {
    console.log('Loading page:', pageName);
    
    // Get the template content from hidden div
    const template = document.getElementById(`template-${pageName}`);
    
    if (template) {
        // Load the template content
        document.getElementById('page-content').innerHTML = template.innerHTML;
        
        // Update active nav link
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        // Initialize page-specific functionality
        initializePage(pageName);
        
        // Re-attach logout button listener after page load
        setTimeout(() => attachLogoutListener(), 100);
    } else {
        console.error('Template not found:', pageName);
        document.getElementById('page-content').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Template not found: ${pageName}
            </div>
        `;
    }
}

// Attach logout button listener
function attachLogoutListener() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.removeEventListener('click', logout);
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout button clicked');
            logout();
        });
    }
}

// Initialize page based on current page
function initializePage(pageName) {
    switch(pageName) {
        case 'home':
            if (typeof displayHomeEvents === 'function') displayHomeEvents();
            if (typeof setupHomeSearch === 'function') setupHomeSearch();
            break;
        case 'register':
            if (typeof setupRegistrationForm === 'function') setupRegistrationForm();
            break;
        case 'login':
            if (typeof setupLoginForm === 'function') setupLoginForm();
            break;
        case 'events':
            if (checkAuth()) {
                if (typeof displayAdminEvents === 'function') displayAdminEvents();
                if (typeof setupEventForm === 'function') setupEventForm();
                if (typeof setupEventSearch === 'function') setupEventSearch();
            } else {
                loadPage('login');
            }
            break;
        case 'contact':
            if (typeof setupContactForm === 'function') setupContactForm();
            break;
    }
}

// Navigation setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - setting up navigation');
    
    // Load home page by default
    loadPage('home');
    
    // Setup navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            
            // Check if accessing events page without login
            if (page === 'events' && !checkAuth()) {
                alert('Please login as admin to access Events page.');
                loadPage('login');
            } else {
                loadPage(page);
            }
        });
    });
    
    // Home link
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('home');
        });
    }
    
    // Initial logout button listener
    attachLogoutListener();
    
    // Check login status
    updateLogoutButton();
});

// Make functions globally available
window.loadPage = loadPage;
window.attachLogoutListener = attachLogoutListener;