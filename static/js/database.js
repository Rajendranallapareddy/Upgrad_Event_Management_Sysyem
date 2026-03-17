// static/js/database.js - IndexedDB handling

// Database name and version
const DB_NAME = 'EventDB';
const DB_VERSION = 1;
const STORE_NAME = 'events';

let db = null;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Error opening database');
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store for events
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                
                // Add sample events
                const transaction = event.target.transaction;
                const eventStore = transaction.objectStore(STORE_NAME);
                
                const sampleEvents = [
                    {
                        id: 'T001',
                        name: 'AI Summit 2025',
                        category: 'Tech & Innovations',
                        date: '2025-06-10',
                        time: '14:00',
                        url: 'https://upgrad.com/ai-summit'
                    },
                    {
                        id: 'I002',
                        name: 'Industrial Automation Expo',
                        category: 'Industrial Events',
                        date: '2025-07-15',
                        time: '10:30',
                        url: 'https://upgrad.com/industrial-expo'
                    },
                    {
                        id: 'L003',
                        name: 'Leadership Conference',
                        category: 'Leadership',
                        date: '2025-08-05',
                        time: '16:00',
                        url: 'https://upgrad.com/leadership'
                    },
                    {
                        id: 'T004',
                        name: 'Blockchain Workshop',
                        category: 'Tech & Innovations',
                        date: '2025-09-20',
                        time: '09:00',
                        url: 'https://upgrad.com/blockchain'
                    }
                ];
                
                sampleEvents.forEach(event => {
                    try {
                        eventStore.add(event);
                    } catch (e) {
                        console.log('Event might already exist');
                    }
                });
            }
        };
    });
}

// Get all events
async function getAllEvents() {
    try {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject('Error fetching events');
        });
    } catch (error) {
        console.error('Error in getAllEvents:', error);
        return [];
    }
}

// Add event
async function addEvent(event) {
    try {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(event);
            
            request.onsuccess = () => resolve(event);
            request.onerror = (e) => {
                if (e.target.error.name === 'ConstraintError') {
                    reject('Event ID already exists');
                } else {
                    reject('Error adding event');
                }
            };
        });
    } catch (error) {
        console.error('Error in addEvent:', error);
        throw error;
    }
}

// Delete event
async function deleteEventFromDB(eventId) {
    try {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(eventId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject('Error deleting event');
        });
    } catch (error) {
        console.error('Error in deleteEventFromDB:', error);
        throw error;
    }
}

// Update event
async function updateEvent(event) {
    try {
        const database = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(event);
            
            request.onsuccess = () => resolve(event);
            request.onerror = () => reject('Error updating event');
        });
    } catch (error) {
        console.error('Error in updateEvent:', error);
        throw error;
    }
}

// Search events
async function searchEvents(searchTerm) {
    try {
        const events = await getAllEvents();
        if (!searchTerm) return events;
        
        const term = searchTerm.toLowerCase();
        return events.filter(event => 
            event.id.toLowerCase().includes(term) ||
            event.name.toLowerCase().includes(term) ||
            event.category.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error('Error in searchEvents:', error);
        return [];
    }
}

// Make functions globally available
window.getAllEvents = getAllEvents;
window.addEvent = addEvent;
window.deleteEventFromDB = deleteEventFromDB;
window.updateEvent = updateEvent;
window.searchEvents = searchEvents;