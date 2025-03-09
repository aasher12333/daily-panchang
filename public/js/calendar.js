export async function generateCalendar(month, year) {
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