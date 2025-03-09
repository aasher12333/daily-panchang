import { appState, calculateWithCoordinates } from './location.js';
import { generateCalendar } from './calendar.js';

export function showSection(section) {
    document.querySelectorAll('.result-section').forEach(div => div.classList.add('hidden'));
    document.getElementById(`${section}-result`).classList.remove('hidden');

    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`nav ul li a[data-section="${section}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Collapse sidebar on mobile after selection
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

// Register event listeners for UI interactions
export function setupUIListeners() {
    // Hamburger Menu Toggle
    document.querySelector('.hamburger-menu').addEventListener('click', () => {
        console.log('Toggling hamburger menu');
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    });

    // Toggle location input form visibility
    document.getElementById('change-location-btn').addEventListener('click', () => {
        const locationInputContainer = document.getElementById('location-input-container');
        locationInputContainer.classList.toggle('hidden');
        if (!locationInputContainer.classList.contains('hidden')) {
            document.getElementById('city-input').focus();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (event) => {
        const locationInputContainer = document.getElementById('location-input-container');
        const cityInput = document.getElementById('city-input');
        const suggestionsDiv = document.getElementById('city-suggestions');
        if (!locationInputContainer.contains(event.target) && event.target !== document.getElementById('change-location-btn')) {
            locationInputContainer.classList.add('hidden');
            suggestionsDiv.innerHTML = '';
            cityInput.value = '';
        }
    });

    // Recalculate when the date changes
    document.getElementById('date').addEventListener('change', () => {
        const dateInput = document.getElementById('date').value;
        if (appState.currentLatitude && appState.currentLongitude) {
            calculateWithCoordinates(appState.currentLatitude, appState.currentLongitude, dateInput);
        }
    });

    // Update calendar when month or year changes
    document.getElementById('month-selector').addEventListener('change', () => {
        const month = parseInt(document.getElementById('month-selector').value);
        const year = parseInt(document.getElementById('year-selector').value);
        generateCalendar(month, year);
    });

    document.getElementById('year-selector').addEventListener('change', () => {
        const month = parseInt(document.getElementById('month-selector').value);
        const year = parseInt(document.getElementById('year-selector').value);
        generateCalendar(month, year);
    });

    // Add click event listeners to navigation links
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
}