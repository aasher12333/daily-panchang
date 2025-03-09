import { initializeApp } from './init.js';
import { setupUIListeners } from './ui.js';
import { calculateWithCoordinates } from './location.js';

// Typeahead functionality for city search
let debounceTimeout;
document.getElementById('city-input').addEventListener('input', async () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const query = document.getElementById('city-input').value.trim();
        if (query.length < 3) {
            document.getElementById('city-suggestions').innerHTML = '';
            return;
        }

        try {
            // Use Nominatim API to search for cities
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featureType=city&limit=5`, {
                headers: {
                    'User-Agent': 'DailyPanchangApp/1.0 (asher.amish@gmail.com)'
                }
            });
            const data = await response.json();
            const suggestionsDiv = document.getElementById('city-suggestions');
            suggestionsDiv.innerHTML = '';

            if (data.length === 0) {
                suggestionsDiv.innerHTML = '<div class="suggestion-item">No cities found</div>';
                return;
            }

            data.forEach(city => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = city.display_name;
                suggestionItem.addEventListener('click', () => {
                    const latitude = parseFloat(city.lat);
                    const longitude = parseFloat(city.lon);
                    const dateInput = document.getElementById('date').value;
                    calculateWithCoordinates(latitude, longitude, dateInput);
                    document.getElementById('city-input').value = city.display_name;
                    suggestionsDiv.innerHTML = '';
                    document.getElementById('location-input-container').classList.add('hidden');
                });
                suggestionsDiv.appendChild(suggestionItem);
            });
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
            document.getElementById('city-suggestions').innerHTML = '<div class="suggestion-item">Error fetching cities</div>';
        }
    }, 300);
});

// Initialize the app and setup UI listeners
initializeApp();
setupUIListeners();