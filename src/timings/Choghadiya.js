const {
    CHOGHADIYA_TYPES,
    DAY_TO_CHOGHADIYA_INDEX,
    NIGHT_CHOGHADIYA_SEQUENCE
} = require('./PlanetaryConstants');

function calculateChoghadiya(sunrise, sunset, nextSunrise) {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const nextSunriseTime = new Date(nextSunrise);

    const dayOfWeek = sunriseTime.getDay(); // Sunday = 0, Monday = 1, etc.
    const dayStartIndex = DAY_TO_CHOGHADIYA_INDEX[dayOfWeek];

    const dayDurationMs = sunsetTime - sunriseTime;
    const nightDurationMs = nextSunriseTime - sunsetTime;
    const dayChoghadiyaLength = dayDurationMs / 8;
    const nightChoghadiyaLength = nightDurationMs / 8;

    const dayChoghadiya = [];
    const nightChoghadiya = [];

    // --- Daytime Choghadiya ---
    let currentTime = sunriseTime;
    let dayPlanetIndex = dayStartIndex;
    for (let i = 0; i < 8; i++) {
        const startTime = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + dayChoghadiyaLength);
        const planetIndexMod = dayPlanetIndex % 7;
        const [name, type] = CHOGHADIYA_TYPES[planetIndexMod];
        dayChoghadiya.push({
            start: startTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            end: currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            name,
            type,
            special: i === 1 ? 'Vaar Vela' : (i === 4 ? 'Kaal Vela' : null)
        });
        dayPlanetIndex++;
    }

    const nightSequence = NIGHT_CHOGHADIYA_SEQUENCE[dayOfWeek];
    currentTime = sunsetTime;

    for (let i = 0; i < 8; i++) {
        const startTime = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + nightChoghadiyaLength);
        const planetIndex = nightSequence[i];
        const [name, type] = CHOGHADIYA_TYPES[planetIndex];
        nightChoghadiya.push({
            start: startTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            end: currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            name,
            type,
            special: (i === 0 || i === 7) ? 'Kaal Ratri' : null
        });
    }

    return { dayChoghadiya, nightChoghadiya };
}

module.exports = { calculateChoghadiya };
