// static/js/events.js - Event management functions

// Display events on home page
async function displayHomeEvents(searchTerm = '') {
    const container = document.getElementById('home-events-container');
    if (!container) return;
    
    try {
        let events = await getAllEvents();
        
        if (searchTerm) {
            events = events.filter(event => 
                event.id.toLowerCase().includes(searchTerm) ||
                event.name.toLowerCase().includes(searchTerm) ||
                event.category.toLowerCase().includes(searchTerm)
            );
        }
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-calendar-times fa-3x mb-3"></i>
                        <h3>No Events Found</h3>
                        <p class="text-muted">Check back later for upcoming events.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = events.map(event => `
            <div class="col-md-6 col-lg-4">
                <div class="card event-card shadow-sm h-100">
                    <div class="card-body">
                        <span class="badge bg-primary mb-2">${event.category}</span>
                        <h5 class="card-title">${event.name}</h5>
                        <div class="event-meta">
                            <p class="mb-2"><i class="fas fa-tag"></i> Event ID: ${event.id}</p>
                            <p class="mb-2"><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
                            <p class="mb-2"><i class="fas fa-clock"></i> ${event.time}</p>
                            <a href="${event.url}" target="_blank" class="small"><i class="fas fa-link"></i> Join Event</a>
                        </div>
                        <button class="btn btn-outline-primary w-100 mt-3 register-btn" data-event-id="${event.id}">
                            <i class="fas fa-user-plus me-2"></i>Register
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add register button listeners
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = btn.dataset.eventId;
                loadRegistrationPage(eventId);
            });
        });
        
    } catch (error) {
        console.error('Error displaying events:', error);
        container.innerHTML = '<div class="alert alert-danger">Error loading events. Please refresh the page.</div>';
    }
}

// Load registration page with event details
async function loadRegistrationPage(eventId) {
    try {
        const events = await getAllEvents();
        const event = events.find(e => e.id === eventId);
        
        if (event) {
            // Store event details in session storage for registration page
            sessionStorage.setItem('registeringEvent', JSON.stringify(event));
            loadPage('register');
        } else {
            showAlert('Event not found!', 'danger');
        }
    } catch (error) {
        console.error('Error loading registration:', error);
        showAlert('Error loading registration page', 'danger');
    }
}

// Setup registration form
function setupRegistrationForm() {
    const form = document.getElementById('registration-form');
    const backBtn = document.getElementById('back-to-home');
    
    // Load event details
    const eventData = sessionStorage.getItem('registeringEvent');
    if (eventData) {
        const event = JSON.parse(eventData);
        const regEventId = document.getElementById('reg-event-id');
        const regEventName = document.getElementById('reg-event-name');
        const regCategory = document.getElementById('reg-category');
        const regDatetime = document.getElementById('reg-datetime');
        
        if (regEventId) regEventId.textContent = event.id;
        if (regEventName) regEventName.textContent = event.name;
        if (regCategory) regCategory.textContent = event.category;
        if (regDatetime) regDatetime.textContent = `${formatDate(event.date)} at ${event.time}`;
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }
            
            showAlert('You are successfully registered to this event!');
            form.reset();
            form.classList.remove('was-validated');
            
            // Clear stored event data
            sessionStorage.removeItem('registeringEvent');
            
            // Redirect to home after 2 seconds
            setTimeout(() => loadPage('home'), 2000);
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            loadPage('home');
        });
    }
}

// Display events on admin page
async function displayAdminEvents(searchTerm = '') {
    const container = document.getElementById('admin-events-container');
    if (!container) return;
    
    try {
        let events = await getAllEvents();
        
        if (searchTerm) {
            events = events.filter(event => 
                event.id.toLowerCase().includes(searchTerm) ||
                event.name.toLowerCase().includes(searchTerm) ||
                event.category.toLowerCase().includes(searchTerm)
            );
        }
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-calendar-plus fa-3x mb-3"></i>
                        <h3>No Events</h3>
                        <p class="text-muted">Add your first event using the form above.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = events.map(event => `
            <div class="col-md-6 col-lg-4">
                <div class="card event-card shadow-sm h-100">
                    <button class="btn btn-danger btn-sm delete-btn" onclick="deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="card-body">
                        <span class="badge bg-secondary mb-2">${event.category}</span>
                        <h5 class="card-title">${event.name}</h5>
                        <div class="event-meta">
                            <p class="mb-2"><i class="fas fa-tag"></i> ID: ${event.id}</p>
                            <p class="mb-2"><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
                            <p class="mb-2"><i class="fas fa-clock"></i> ${event.time}</p>
                            <a href="${event.url}" target="_blank" class="small"><i class="fas fa-link"></i> Event Link</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error displaying admin events:', error);
        container.innerHTML = '<div class="alert alert-danger">Error loading events. Please refresh the page.</div>';
    }
}

// Setup add event form
function setupEventForm() {
    const form = document.getElementById('add-event-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const newEvent = {
            id: document.getElementById('event-id').value.trim(),
            name: document.getElementById('event-name').value.trim(),
            category: document.getElementById('event-category').value,
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            url: document.getElementById('event-url').value.trim()
        };
        
        try {
            await addEvent(newEvent);
            showAlert('Event added successfully!');
            form.reset();
            form.classList.remove('was-validated');
            displayAdminEvents();
        } catch (error) {
            if (error === 'Event ID already exists') {
                showAlert('Event ID already exists! Please use a different ID.', 'danger');
            } else {
                showAlert('Error adding event. Please try again.', 'danger');
            }
        }
    });
}

// Delete event
async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            await deleteEventFromDB(eventId);
            showAlert('Event deleted successfully!');
            const searchInput = document.getElementById('event-search');
            displayAdminEvents(searchInput ? searchInput.value.toLowerCase() : '');
        } catch (error) {
            console.error('Error deleting event:', error);
            showAlert('Error deleting event. Please try again.', 'danger');
        }
    }
}

// Setup event search
function setupEventSearch() {
    const searchInput = document.getElementById('event-search');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            displayAdminEvents(searchTerm);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            displayAdminEvents('');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.toLowerCase();
                displayAdminEvents(searchTerm);
            }
        });
    }
}

// Setup home search
function setupHomeSearch() {
    const searchInput = document.getElementById('home-search');
    const searchBtn = document.getElementById('home-search-btn');
    const clearBtn = document.getElementById('home-clear-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            displayHomeEvents(searchTerm);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            displayHomeEvents('');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.toLowerCase();
                displayHomeEvents(searchTerm);
            }
        });
    }
}

// Setup contact form
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        showAlert('Thank you for contacting us! We will respond within 24 hours.');
        form.reset();
        form.classList.remove('was-validated');
    });
}

// Make functions globally available
window.displayHomeEvents = displayHomeEvents;
window.loadRegistrationPage = loadRegistrationPage;
window.setupRegistrationForm = setupRegistrationForm;
window.displayAdminEvents = displayAdminEvents;
window.setupEventForm = setupEventForm;
window.deleteEvent = deleteEvent;
window.setupEventSearch = setupEventSearch;
window.setupHomeSearch = setupHomeSearch;
window.setupContactForm = setupContactForm;