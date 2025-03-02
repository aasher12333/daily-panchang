const { calculateTimeSegments, mapPlanetaryOrder } = require('./TimeUtils');
const { PLANETARY_ORDER, CHOGHADIYA_TYPES, DAY_TO_CHOGHADIYA_INDEX } = require('./PlanetaryConstants');

function calculateChoghadiya(sunrise, sunset, nextSunrise, dayOfWeek) {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const nextSunriseTime = new Date(nextSunrise);

    const dayMs = sunsetTime - sunriseTime;
    const nightMs = nextSunriseTime - sunsetTime;
    const dayChoghadiyaLength = dayMs / 8;
    const nightChoghadiyaLength = nightMs / 8;

    const daySegments = calculateTimeSegments(sunriseTime, sunsetTime, 8);
    const nightSegments = calculateTimeSegments(sunsetTime, nextSunriseTime, 8);

    let planetIndex = DAY_TO_CHOGHADIYA_INDEX[dayOfWeek];
    const dayChoghadiya = [], nightChoghadiya = [];

    // Daytime Choghadiya
    let currentTime = sunriseTime;
    for (let i = 0; i < 8; i++) {
        const startTime = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + dayChoghadiyaLength);
        const planetIndexMod = planetIndex % 7;
        const [name, type] = CHOGHADIYA_TYPES[planetIndexMod];
        dayChoghadiya.push({
            start: startTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            end: currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            name,
            type,
            special: i === 1 ? 'Vaar Vela' : (i === 4 ? 'Kaal Vela' : null)
        });
        planetIndex++;
    }

    // Nighttime Choghadiya
    currentTime = sunsetTime;
    for (let i = 0; i < 8; i++) {
        const startTime = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + nightChoghadiyaLength);
        const planetIndexMod = planetIndex % 7;
        const [name, type] = CHOGHADIYA_TYPES[planetIndexMod];
        nightChoghadiya.push({
            start: startTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            end: currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            name,
            type,
            special: (i === 0 || i === 7) ? 'Kaal Ratri' : null
        });
        planetIndex++;
    }

    return { dayChoghadiya, nightChoghadiya };
}

module.exports = { calculateChoghadiya };