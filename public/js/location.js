import { renderHoraSchedule } from './hora.js';
import { renderChoghadiyaSchedule } from './choghadiya.js';
import { showSection } from './ui.js';
import { generateCalendar } from './calendar.js';

// Export global state
export const appState = {
    currentLatitude: null,
    currentLongitude: null,
    currentTimezone: null,
    targetTimezone: null
};

export async function fetchTimezone(latitude, longitude) {
    const response = await fetch(`/api/timezone?lat=${latitude}&lng=${longitude}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.timezone;
}

export async function calculateWithCoordinates(latitude, longitude, dateInput) {
    try {
        appState.currentLatitude = latitude;
        appState.currentLongitude = longitude;
        appState.currentTimezone = await fetchTimezone(latitude, longitude);

        const selectedDate = moment.tz(dateInput, appState.currentTimezone).format('YYYY-MM-DD');

        const rahuKalamDiv = document.getElementById('rahu-kalam-result');
        const horaDiv = document.getElementById('hora-result');
        const choghadiyaDiv = document.getElementById('choghadiya-result');
        const locationDiv = document.getElementById('location');
        const sunriseSunsetDiv = document.getElementById('sunrise-sunset');

        rahuKalamDiv.innerHTML = `<p>Loading Rahu Kalam...</p>`;
        horaDiv.innerHTML = `<p>Loading Hora...</p>`;
        choghadiyaDiv.innerHTML = `<p>Loading Choghadiya...</p>`;

        const response = await fetch(`/api/rahu-kalam?lat=${latitude}&lng=${longitude}&date=${selectedDate}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        locationDiv.innerHTML = `Location: ${data.location}`;
        const sunrise = moment.utc(data.sunrise).tz(appState.currentTimezone);
        const sunset = moment.utc(data.sunset).tz(appState.currentTimezone);
        sunriseSunsetDiv.innerHTML = `Sunrise: ${sunrise.format('h:mm A')} - Sunset: ${sunset.format('h:mm A')}`;

        const rahuStart = moment.tz(`${selectedDate} ${data.rahuKalam.start}`, 'YYYY-MM-DD h:mm:ss A', appState.currentTimezone);
        const rahuEnd = moment.tz(`${selectedDate} ${data.rahuKalam.end}`, 'YYYY-MM-DD h:mm:ss A', appState.currentTimezone);
        rahuKalamDiv.innerHTML = `
            <h3>${moment(selectedDate).format('dddd, MMM D YYYY')}</h3>
            <p><strong>Rahu Kalam:</strong> ${rahuStart.format('h:mm A')} - ${rahuEnd.format('h:mm A')}</p>
        `;

        renderHoraSchedule(data, selectedDate, horaDiv, appState.currentTimezone);
        renderChoghadiyaSchedule(data, selectedDate, choghadiyaDiv, appState.currentTimezone);

        const [year, month] = dateInput.split('-').map(Number);
        document.getElementById('month-selector').value = month - 1;
        document.getElementById('year-selector').value = year;
        generateCalendar(month - 1, year);

        showSection('rahu-kalam');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('rahu-kalam-result').innerHTML = `<p style="color: red;">Error loading Rahu Kalam: ${error.message}</p>`;
        document.getElementById('hora-result').innerHTML = '';
        document.getElementById('choghadiya-result').innerHTML = '';
        document.getElementById('location').innerHTML = `<p style="color: red;">Failed to fetch location data: ${error.message}</p>`;
        document.getElementById('sunrise-sunset').innerHTML = '';
    }
}

export async function calculateSelected() {
    const dateInput = document.getElementById('date').value;
    const locationDiv = document.getElementById('location');
    const locationInputContainer = document.getElementById('location-input-container');

    locationDiv.innerHTML = `Location: Loading...`;

    try {
        const position = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Geolocation timed out')), 10000);
            navigator.geolocation.getCurrentPosition(
                pos => {
                    clearTimeout(timeoutId);
                    resolve(pos);
                },
                err => {
                    clearTimeout(timeoutId);
                    reject(err);
                },
                { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
            );
        });

        const { latitude, longitude } = position.coords;
        locationInputContainer.classList.add('hidden');
        await calculateWithCoordinates(latitude, longitude, dateInput);
    } catch (error) {
        console.error('Error in calculateSelected:', error);
        locationDiv.innerHTML = `<p style="color: red;">Failed to fetch location: ${error.message}</p>`;
        locationInputContainer.classList.remove('hidden');
    }
}