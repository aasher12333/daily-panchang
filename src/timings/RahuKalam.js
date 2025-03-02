const { calculateTimeSegments } = require('./TimeUtils');
const { RAHU_KALAM_PERIODS } = require('./PlanetaryConstants');

function calculateRahuKalam(sunrise, sunset, dayOfWeek) {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const segments = calculateTimeSegments(sunriseTime, sunsetTime, 8);
    const periodNumber = RAHU_KALAM_PERIODS[dayOfWeek];

    let startTime, endTime;
    if (periodNumber === 8) {
        endTime = sunsetTime;
        startTime = new Date(sunsetTime.getTime() - (sunsetTime - sunriseTime) / 8);
    } else {
        startTime = new Date(sunriseTime.getTime() + (periodNumber - 1) * (sunsetTime - sunriseTime) / 8);
        endTime = new Date(startTime.getTime() + (sunsetTime - sunriseTime) / 8);
    }

    return {
        start: startTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
        end: endTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })
    };
}

module.exports = { calculateRahuKalam };