// static/js/auth.js - Authentication handling

// Hard-coded admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@upgrad.com',
    password: '12345'
};

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!loginForm.checkValidity()) {
            e.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (authenticate(email, password)) {
            // Update both local and global currentUser
            currentUser = { email };
            window.currentUser = currentUser;
            
            updateLogoutButton();
            showAlert('Login successful! Redirecting to Events page...');
            
            // Re-attach logout listener after login
            if (typeof attachLogoutListener === 'function') {
                setTimeout(() => {
                    attachLogoutListener();
                }, 100);
            }
            
            setTimeout(() => loadPage('events'), 1500);
        } else {
            showAlert('Invalid email or password!', 'danger');
        }
    });
}

// Authenticate user
function authenticate(email, password) {
    return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

// Make functions globally available
window.setupLoginForm = setupLoginForm;