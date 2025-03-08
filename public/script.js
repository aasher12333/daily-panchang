let currentLatitude = null;
let currentLongitude = null;
let currentTimezone = null;
let targetTimezone = null;  // Add this


function updateClock() {
    const clockDiv = document.getElementById('clock');
    const now = currentTimezone ? moment().tz(currentTimezone) : moment();
    clockDiv.innerHTML = `Current Time: ${now.format('h:mm:ss A')} (${currentTimezone || 'Local Time'})`;
}

async function fetchTimezone(latitude, longitude) {
    const response = await fetch(`/api/timezone?lat=${latitude}&lng=${longitude}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.timezone;
}

function showSection(section) {
    document.querySelectorAll('.result-section').forEach(div => div.classList.add('hidden'));
    document.getElementById(`${section}-result`).classList.remove('hidden');

    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`nav ul li a[onclick="showSection('${section}')"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelector('.sidebar').classList.remove('active');
}

async function generateCalendar(month, year) {
    console.log(`Generating calendar for month: ${month + 1}, year: ${year}`);
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarBody.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const numDays = lastDay.getDate();

    try {
        const response = await fetch(`/api/vedic-calendar?month=${month + 1}&year=${year}`);
        const vedicData = await response.json();

        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day disabled';
            calendarBody.appendChild(emptyDay);
        }

        for (let day = 1; day <= numDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const vedicInfo = vedicData[dateStr] || {
                tithi: 'Unknown',
                nakshatra: 'Unknown',
                paksha: 'Shukla',
                festival: '',
                isEkadashi: false
            };
            const festival = vedicInfo.festival || '';

            // Calculate lunar age for moon phase graphic
            const date = new Date(dateStr);
            const newMoonResponse = await fetch(`/api/new-moon?date=${dateStr}`);
            const newMoonData = await newMoonResponse.json();
            const daysSinceNewMoon = newMoonData.daysSinceNewMoon;
            const synodicPeriod = 29.53059;
            const lunarAge = daysSinceNewMoon % synodicPeriod;
            const lunarPhaseFraction = lunarAge / synodicPeriod; // 0 (New Moon) to 1 (next New Moon)

            // Determine moon phase graphic class (only New Moon and Full Moon)
            let lunarPhaseClass = '';
            if (lunarPhaseFraction < 0.02 || lunarPhaseFraction > 0.98) {
                lunarPhaseClass = 'new-moon'; // New Moon
            } else if (lunarPhaseFraction >= 0.48 && lunarPhaseFraction <= 0.52) {
                lunarPhaseClass = 'full-moon'; // Full Moon
            }

            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';

            // Handle Paksha with a fallback
            if (vedicInfo.paksha === 'Shukla') {
                dayDiv.classList.add('shukla');
            } else if (vedicInfo.paksha === 'Krishna') {
                dayDiv.classList.add('krishna');
            } else {
                console.error(`Invalid Paksha value for ${dateStr}: ${vedicInfo.paksha}`);
                dayDiv.classList.add('shukla'); // Fallback to Shukla if Paksha is invalid
            }

            if (vedicInfo.isEkadashi) dayDiv.classList.add('ekadashi');
            if (festival) dayDiv.classList.add('festival');

            // Determine festival icon
            let festivalIcon = '';
            if (festival === 'Diwali') festivalIcon = '🪔'; // Diya for Diwali
            else if (festival === 'Holi') festivalIcon = '🎨'; // Rangoli/colors for Holi
            else if (festival === 'Navratri Begins') festivalIcon = '🕉️'; // Om for Navratri
            else if (festival === 'Krishna Janmashtami') festivalIcon = '🦚'; // Peacock feather for Krishna
            else if (festival === 'Maha Shivaratri') festivalIcon = '🔱'; // Trident for Shiva

            dayDiv.innerHTML = `
                <div class="gregorian">${day}</div>
                <div class="vedic tooltip" data-tooltip="Tithi: Lunar Day">${vedicInfo.tithi}</div>
                <div class="nakshatra tooltip" data-tooltip="Nakshatra: Lunar Mansion">${vedicInfo.nakshatra}</div>
                ${lunarPhaseClass ? `<div class="moon-phase-graph ${lunarPhaseClass}"></div>` : '<div style="height: 20px;"></div>'}
                ${festival ? `<div class="festival-name tooltip" data-tooltip="Festival">${festival}</div>` : ''}
                ${festivalIcon ? `<span class="festival-icon">${festivalIcon}</span>` : ''}
            `;
            calendarBody.appendChild(dayDiv);
        }

        // Add legend for Shukla/Krishna Paksha
        const legendDiv = document.createElement('div');
        legendDiv.className = 'calendar-legend';
        legendDiv.innerHTML = `
            <div class="legend-item"><span class="legend-color shukla"></span> Shukla Paksha (Waxing Moon)</div>
            <div class="legend-item"><span class="legend-color krishna"></span> Krishna Paksha (Waning Moon)</div>
        `;
        const calendarHeader = document.querySelector('.calendar-header');
        calendarHeader.appendChild(legendDiv);
    } catch (error) {
        console.error('Error in generateCalendar:', error);
        calendarBody.innerHTML = `<p style="color: red;">Error loading calendar: ${error.message}</p>`;
    }
}

async function calculateWithCoordinates(latitude, longitude, dateInput) {
    try {
        currentLatitude = latitude;
        currentLongitude = longitude;
        currentTimezone = await fetchTimezone(latitude, longitude);

        const selectedDate = moment.tz(dateInput, currentTimezone).format('YYYY-MM-DD');

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
        const sunrise = moment.utc(data.sunrise).tz(currentTimezone);
        const sunset = moment.utc(data.sunset).tz(currentTimezone);
        sunriseSunsetDiv.innerHTML = `Sunrise: ${sunrise.format('h:mm A')} - Sunset: ${sunset.format('h:mm A')}`;

        const rahuStart = moment.tz(`${selectedDate} ${data.rahuKalam.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        const rahuEnd = moment.tz(`${selectedDate} ${data.rahuKalam.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        rahuKalamDiv.innerHTML = `
            <h3>${moment(selectedDate).format('dddd, MMM D YYYY')}</h3>
            <p><strong>Rahu Kalam:</strong> ${rahuStart.format('h:mm A')} - ${rahuEnd.format('h:mm A')}</p>
        `;

        let horaHTML = '<h3>Hora Schedule</h3>';
        for (const period of ['dayHoras', 'nightHoras']) {
            horaHTML += `<h4>${period === 'dayHoras' ? 'Day Horas (Sunrise to Sunset)' : 'Night Horas (Sunset to Sunrise)'}</h4>
                         <table class="hora-table">
                         <tr><th>Time</th><th>Planet</th><th>Auspiciousness</th></tr>`;
            data[period].forEach(hora => {
                const start = moment.tz(`${selectedDate} ${hora.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
                const end = moment.tz(`${selectedDate} ${hora.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
                horaHTML += `<tr class="${hora.auspiciousness?.toLowerCase()}">
                                <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
                                <td>${hora.planet}</td>
                                <td>${hora.auspiciousness}</td>
                             </tr>`;
            });
            horaHTML += '</table>';
        }
        horaDiv.innerHTML = horaHTML;

        const now = moment().tz(currentTimezone);
        let choghadiyaHTML = `
    <h3>Choghadiya Schedule</h3>
    <div class="choghadiya-wrapper">
        <div class="choghadiya-section">
            <h4>Day Choghadiya</h4>
            <table class="choghadiya-table">
                <tr><th style="width: 25%;">Time</th><th>Name</th><th>Type</th></tr>`;

        data.dayChoghadiya.forEach(chog => {
            const start = moment.tz(`${selectedDate} ${chog.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            const end = moment.tz(`${selectedDate} ${chog.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            const isCurrent = now.isBetween(start, end);

            const special = chog.special ? ` (${chog.special})` : '';
            choghadiyaHTML += `
        <tr class="${chog.type?.toLowerCase() || 'neutral'}${isCurrent ? ' current-choghadiya' : ''}">
            <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
            <td>${chog.name || 'Unknown'}</td>
            <td>${chog.type || 'Neutral'}</td>
        </tr>`;
        });

        choghadiyaHTML += `
            </table>
        </div>
        <div class="choghadiya-section">
            <h4>Night Choghadiya</h4>
            <table class="choghadiya-table">
                <tr><th style="width: 25%;">Time</th><th>Name</th><th>Type</th></tr>`;

        let nightDate = moment(selectedDate).clone();
        data.nightChoghadiya.forEach((chog, index) => {
            if (index && moment(chog.start, 'h:mm:ss A').hour() < 12) nightDate.add(1, 'day');

            const start = moment.tz(`${nightDate.format('YYYY-MM-DD')} ${chog.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            const end = moment.tz(`${nightDate.format('YYYY-MM-DD')} ${chog.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            const isCurrent = now.isBetween(start, end);

            const special = chog.special ? ` (${chog.special})` : '';
            choghadiyaHTML += `
        <tr class="${chog.type?.toLowerCase() || 'neutral'}${isCurrent ? ' current-choghadiya' : ''}">
            <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
            <td>${chog.name || 'Unknown'}</td>
            <td>${chog.type || 'Neutral'}</td>
        </tr>`;
        });

        choghadiyaHTML += `
            </table>
        </div>
    </div>`;

        choghadiyaDiv.innerHTML = choghadiyaHTML;

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
async function calculateSelected() {
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
                {timeout: 10000, maximumAge: 0, enableHighAccuracy: true}
            );
        });

        const {latitude, longitude} = position.coords;
        locationInputContainer.classList.add('hidden');
        await calculateWithCoordinates(latitude, longitude, dateInput);
    } catch (error) {
        console.error('Error in calculateSelected:', error);
        locationDiv.innerHTML = `<p style="color: red;">Failed to fetch location: ${error.message}</p>`;
        locationInputContainer.classList.remove('hidden');
    }
}

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
    if (currentLatitude && currentLongitude) {
        calculateWithCoordinates(currentLatitude, currentLongitude, dateInput);
    }
});

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

// Hamburger Menu Toggle
document.querySelector('.hamburger-menu').addEventListener('click', () => {
    console.log('Toggling hamburger menu');
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
});

// Load calendar for the current month immediately on page load
window.onload = () => {
    console.log('Window loaded, initializing app');
    const today = new Date();
    document.getElementById('date').value = today.toISOString().split('T')[0];
    updateClock();
    setInterval(updateClock, 1000);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    document.getElementById('month-selector').value = currentMonth;
    document.getElementById('year-selector').value = currentYear;
    generateCalendar(currentMonth, currentYear);
    calculateSelected();
};