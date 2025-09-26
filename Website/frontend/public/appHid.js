// Hidden Gems Application
class HiddenGemsApp {
    constructor() {
        this.gems = [];
        this.filteredGems = [];
        this.storageKey = 'hiddenGems';
        this.init();
    }

    init() {
        this.loadGems();
        this.bindEvents();
        this.renderGems();
        this.updateGemsCount();
    }

    // UUID generation
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Haversine distance calculation
    haversine(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    // Duplicate detection
    findDuplicate(name, lat, lon, maxDistance = 100) {
        for (const gem of this.gems) {
            // Location-based duplicate check
            const distance = this.haversine(lat, lon, gem.latitude, gem.longitude);
            if (distance <= maxDistance) {
                return gem.name;
            }

            // Name-based duplicate check (case-insensitive substring)
            const existingName = gem.name.toLowerCase();
            const newName = name.toLowerCase();
            if (existingName.includes(newName) || newName.includes(existingName)) {
                return gem.name;
            }
        }
        return null;
    }

    // Load gems from localStorage
    loadGems() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.gems = JSON.parse(stored);
        } else {
            // Initialize with sample data
            this.gems = [
                {
                    id: "sample-1",
                    name: "Secret Waterfall",
                    description: "A hidden waterfall behind the old mill, perfect for a peaceful afternoon",
                    latitude: 40.7589,
                    longitude: -73.9851,
                    uploadedBy: "explorer123",
                    timestamp: "2025-09-26T04:00:00.000Z",
                    status: "pending"
                },
                {
                    id: "sample-2", 
                    name: "Rooftop Garden",
                    description: "Beautiful rooftop garden with city views, open to public during weekdays",
                    latitude: 40.7614,
                    longitude: -73.9776,
                    uploadedBy: "citywalker",
                    timestamp: "2025-09-25T15:30:00.000Z", 
                    status: "approved"
                }
            ];
            this.saveGems();
        }
        this.filteredGems = [...this.gems];
    }

    // Save gems to localStorage
    saveGems() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.gems));
    }

    // Add new gem
    addGem(gemData) {
        const { name, description, latitude, longitude, uploadedBy } = gemData;
        
        // Check for duplicates
        const duplicate = this.findDuplicate(name, latitude, longitude);
        if (duplicate) {
            throw new Error(`This location/name is too similar to an existing gem: '${duplicate}'`);
        }

        const newGem = {
            id: this.generateUUID(),
            name: name.trim(),
            description: description.trim(),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            uploadedBy: uploadedBy.trim() || 'anonymous',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.gems.unshift(newGem); // Add to beginning
        this.saveGems();
        this.filterGems(); // Re-apply current filter
        this.renderGems();
        this.updateGemsCount();

        return newGem;
    }

    // Format date for display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Render gems grid
    renderGems() {
        const gemsGrid = document.getElementById('gems-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.filteredGems.length === 0) {
            gemsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        gemsGrid.style.display = 'grid';
        
        gemsGrid.innerHTML = this.filteredGems.map(gem => `
            <div class="gem-card fade-in">
                <div class="gem-card__header">
                    <h3 class="gem-card__title">${this.escapeHtml(gem.name)}</h3>
                    <div class="gem-card__status">
                        <span class="status status--${gem.status === 'approved' ? 'success' : 'warning'}">
                            ${gem.status}
                        </span>
                    </div>
                </div>
                
                <p class="gem-card__description">${this.escapeHtml(gem.description)}</p>
                
                <div class="gem-card__coordinates">
                    <div class="coordinate-item">
                        <span>📍</span>
                        <span>${gem.latitude.toFixed(6)}</span>
                    </div>
                    <div class="coordinate-item">
                        <span>🌐</span>
                        <span>${gem.longitude.toFixed(6)}</span>
                    </div>
                </div>
                
                <div class="gem-card__meta">
                    <span class="gem-card__uploader">${this.escapeHtml(gem.uploadedBy)}</span>
                    <span class="gem-card__timestamp">${this.formatDate(gem.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    // Filter gems based on search
    filterGems(searchTerm = '') {
        if (!searchTerm.trim()) {
            this.filteredGems = [...this.gems];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredGems = this.gems.filter(gem => 
                gem.name.toLowerCase().includes(term) ||
                gem.description.toLowerCase().includes(term) ||
                gem.uploadedBy.toLowerCase().includes(term)
            );
        }
    }

    // Update gems count display
    updateGemsCount() {
        const viewGemsTab = document.querySelector('[data-tab="view-gems"]');
        const count = this.gems.length;
        viewGemsTab.textContent = `📍 View Gems${count > 0 ? ` (${count})` : ''}`;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Form validation
    validateForm(formData) {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Gem name is required';
        } else if (formData.name.trim().length < 3) {
            errors.name = 'Gem name must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }

        const lat = parseFloat(formData.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.latitude = 'Latitude must be between -90 and 90';
        }

        const lon = parseFloat(formData.longitude);
        if (isNaN(lon) || lon < -180 || lon > 180) {
            errors.longitude = 'Longitude must be between -180 and 180';
        }

        return errors;
    }

    // Show form errors
    showFormErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const errorEl = document.getElementById(`${field}-error`);
            const inputEl = document.getElementById(`gem-${field}`);
            if (errorEl && inputEl) {
                errorEl.textContent = message;
                inputEl.classList.add('error');
            }
        }
    }

    // Show form message
    showFormMessage(message, type = 'success') {
        const messageEl = document.getElementById('form-message');
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('gem-form');
        form.reset();
        this.showFormErrors({});
        document.getElementById('form-message').style.display = 'none';
    }

    // Switch tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('nav-tab--active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('nav-tab--active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('tab-content--active');
        });
        document.getElementById(tabName).classList.add('tab-content--active');
    }

    // Bind event listeners
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterGems(e.target.value);
            this.renderGems();
        });

        // Form submission
        const gemForm = document.getElementById('gem-form');
        gemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Real-time validation
        gemForm.addEventListener('input', (e) => {
            if (e.target.classList.contains('error')) {
                e.target.classList.remove('error');
                const errorEl = document.getElementById(`${e.target.name}-error`);
                if (errorEl) errorEl.textContent = '';
            }
        });
    }

    // Handle form submission
    async handleFormSubmit(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Get form data
        const formData = {
            name: form.name.value,
            description: form.description.value,
            latitude: form.latitude.value,
            longitude: form.longitude.value,
            uploadedBy: form.uploadedBy.value
        };

        // Validate form
        const errors = this.validateForm(formData);
        if (Object.keys(errors).length > 0) {
            this.showFormErrors(errors);
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newGem = this.addGem(formData);
            this.showFormMessage('🎉 Hidden gem added successfully!', 'success');
            this.resetForm();
            
            // Auto-switch to view gems after 2 seconds
            setTimeout(() => {
                this.switchTab('view-gems');
            }, 2000);

        } catch (error) {
            this.showFormMessage(error.message, 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}

// Global functions for HTML onclick handlers
function switchTab(tabName) {
    app.switchTab(tabName);
}

function resetForm() {
    app.resetForm();
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HiddenGemsApp();
});