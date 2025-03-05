function updateClock() {
    const clockDiv = document.getElementById('clock');
    const now = new Date();
    clockDiv.innerHTML = `Current Time: ${now.toLocaleTimeString()}`;
}

function showSection(section) {
    document.getElementById('rahu-kalam-result').classList.add('hidden');
    document.getElementById('choghadiya-result').classList.add('hidden');
    document.getElementById('hora-result').classList.add('hidden');
    document.getElementById('calendar-result').classList.add('hidden');

    document.getElementById(`${section}-result`).classList.remove('hidden');

    const links = document.querySelectorAll('nav ul li a');
    links.forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(links).find(link => link.getAttribute('onclick') === `showSection('${section}')`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

async function generateCalendar(month, year) {
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
            const vedicInfo = vedicData[dateStr] || { tithi: 'Unknown', nakshatra: 'Unknown', paksha: 'Shukla', festival: '', isEkadashi: false };
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
        calendarBody.innerHTML = `<p style="color: red;">Error loading calendar: ${error.message}</p>`;
    }
}

async function calculateSelected() {
    const dateInput = document.getElementById('date').value;
    const rahuKalamDiv = document.getElementById('rahu-kalam-result');
    const horaDiv = document.getElementById('hora-result');
    const choghadiyaDiv = document.getElementById('choghadiya-result');
    const locationDiv = document.getElementById('location');
    const sunriseSunsetDiv = document.getElementById('sunrise-sunset');

    try {
        // Attempt to get location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const query = `?lat=${latitude}&lng=${longitude}&date=${dateInput}`;
        const response = await fetch(`/api/rahu-kalam${query}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        locationDiv.innerHTML = `Location: ${data.location}`;
        sunriseSunsetDiv.innerHTML = `Sunrise: ${new Date(data.sunrise).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' })} - Sunset: ${new Date(data.sunset).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' })}`;

        rahuKalamDiv.innerHTML = `
            <h3>${data.date} (${data.day})</h3>
            <p>Rahu Kalam: ${data.rahuKalam.start} - ${data.rahuKalam.end}</p>
        `;

        let horaHTML = '<h3>Hora Schedule</h3>';
        horaHTML += '<h4>Day Horas (Sunrise to Sunset)</h4><table class="hora-table">';
        horaHTML += '<tr><th>Time</th><th>Planet</th><th>Auspiciousness</th></tr>';
        data.dayHoras.forEach(hora => {
            horaHTML += `
                <tr class="${hora.auspiciousness?.toLowerCase() || 'neutral'}">
                    <td>${hora.start} - ${hora.end}</td>
                    <td>${hora.planet || 'Unknown'}</td>
                    <td>${hora.auspiciousness || 'Neutral'}</td>
                </tr>
            `;
        });
        horaHTML += '</table>';
        horaHTML += '<h4>Night Horas (Sunset to Next Sunrise)</h4><table class="hora-table">';
        horaHTML += '<tr><th>Time</th><th>Planet</th><th>Auspiciousness</th></tr>';
        data.nightHoras.forEach(hora => {
            horaHTML += `
                <tr class="${hora.auspiciousness?.toLowerCase() || 'neutral'}">
                    <td>${hora.start} - ${hora.end}</td>
                    <td>${hora.planet || 'Unknown'}</td>
                    <td>${hora.auspiciousness || 'Neutral'}</td>
                </tr>
            `;
        });
        horaHTML += '</table>';
        horaDiv.innerHTML = horaHTML;

        let choghadiyaHTML = '<h3>Choghadiya Schedule</h3>';
        choghadiyaHTML += '<h4>Day Choghadiya (Sunrise to Sunset)</h4><table class="choghadiya-table">';
        choghadiyaHTML += '<tr><th>Time</th><th>Name</th><th>Type</th><th>Special</th></tr>';
        data.dayChoghadiya.forEach(chog => {
            choghadiyaHTML += `
                <tr class="${chog.type?.toLowerCase() || 'neutral'}">
                    <td>${chog.start} - ${chog.end}</td>
                    <td>${chog.name || 'Unknown'}</td>
                    <td>${chog.type || 'Neutral'}</td>
                    <td>${chog.special || ''}</td>
                </tr>
            `;
        });
        choghadiyaHTML += '</table>';
        choghadiyaHTML += '<h4>Night Choghadiya (Sunset to Next Sunrise)</h4><table class="choghadiya-table">';
        choghadiyaHTML += '<tr><th>Time</th><th>Name</th><th>Type</th><th>Special</th></tr>';
        data.nightChoghadiya.forEach(chog => {
            choghadiyaHTML += `
                <tr class="${chog.type?.toLowerCase() || 'neutral'}">
                    <td>${chog.start} - ${chog.end}</td>
                    <td>${chog.name || 'Unknown'}</td>
                    <td>${chog.type || 'Neutral'}</td>
                    <td>${chog.special || ''}</td>
                </tr>
            `;
        });
        choghadiyaHTML += '</table>';
        choghadiyaDiv.innerHTML = choghadiyaHTML;

        const [year, month] = dateInput.split('-').map(Number);
        document.getElementById('month-selector').value = month - 1;
        document.getElementById('year-selector').value = year;
        generateCalendar(month - 1, year);

        showSection('rahu-kalam');
    } catch (error) {
        rahuKalamDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        horaDiv.innerHTML = '';
        choghadiyaDiv.innerHTML = '';
        locationDiv.innerHTML = `<p style="color: red;">Failed to fetch location. Please enable geolocation and try again.</p>`;
        locationDiv.innerHTML += `<br><button onclick="calculateSelected()">Retry</button>`;
        sunriseSunsetDiv.innerHTML = '';
    }
}

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

const today = new Date();
document.getElementById('date').value = today.toISOString().split('T')[0];
updateClock();
setInterval(updateClock, 1000);

// Load calendar for the current month immediately on page load
window.onload = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    document.getElementById('month-selector').value = currentMonth;
    document.getElementById('year-selector').value = currentYear;
    generateCalendar(currentMonth, currentYear);
    calculateSelected();
};