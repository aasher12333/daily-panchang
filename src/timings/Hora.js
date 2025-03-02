const { calculateTimeSegments, mapPlanetaryOrder } = require('./TimeUtils');
const { PLANETARY_ORDER, HORA_AUSPICIOUSNESS, DAY_TO_HORA_INDEX } = require('./PlanetaryConstants');

function calculateHoras(sunrise, sunset, nextSunrise, dayOfWeek) {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const nextSunriseTime = new Date(nextSunrise);

    const daySegments = calculateTimeSegments(sunriseTime, sunsetTime, 12);
    const nightSegments = calculateTimeSegments(sunsetTime, nextSunriseTime, 12);

    const planets = mapPlanetaryOrder(DAY_TO_HORA_INDEX[dayOfWeek], 24, PLANETARY_ORDER);

    const dayHoras = daySegments.slice(0, 12).map((segment, i) => ({
        ...segment,
        planet: planets[i],
        auspiciousness: HORA_AUSPICIOUSNESS[planets[i]] || 'okay'
    }));

    const nightHoras = nightSegments.slice(0, 12).map((segment, i) => ({
        ...segment,
        planet: planets[i + 12],
        auspiciousness: HORA_AUSPICIOUSNESS[planets[i + 12]] || 'okay'
    }));

    return { dayHoras, nightHoras };
}

module.exports = { calculateHoras };