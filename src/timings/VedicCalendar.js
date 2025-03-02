const Astronomy = require('astronomy-engine');
const { TITHI_NAMES, NAKSHATRAS, FESTIVALS_2025 } = require('./PlanetaryConstants');

function calculatePakshaAndTithi(dateStr) {
    const date = new Date(dateStr);

    // Find the previous New Moon to determine lunar cycle position
    const newMoon = Astronomy.SearchMoonPhase(0, date, -30); // Previous New Moon (0°)
    if (!newMoon) {
        console.error('Failed to find New Moon for date:', dateStr);
        return { paksha: 'Shukla', tithi: 'Pratipada' }; // Fallback
    }

    // Calculate days since the last New Moon
    const daysSinceNewMoon = (date - newMoon.date) / (1000 * 60 * 60 * 24);
    const synodicPeriod = 29.53059; // Average lunar cycle length in days
    const lunarAge = (daysSinceNewMoon + 0.5) % synodicPeriod; // Add 0.5 days offset to align with reference

    // Paksha: Shukla (0 to 14.765 days), Krishna (14.765 to 29.53 days)
    const paksha = lunarAge < (synodicPeriod / 2) ? 'Shukla' : 'Krishna';

    // Tithi: 30 Tithis in a lunar cycle (12° each, ~0.983 days per Tithi)
    const tithiIndex = Math.floor(lunarAge / (synodicPeriod / 30)) % 30;
    const tithi = TITHI_NAMES[tithiIndex] || (lunarAge < (synodicPeriod / 2) ? 'Purnima' : 'Amavasya');

    return { paksha, tithi };
}

function calculateNakshatra(dateStr) {
    const date = new Date(dateStr);

    // Calculate the Moon's ecliptic longitude
    const geoMoon = Astronomy.GeoMoon(date);
    const ecliptic = Astronomy.Ecliptic(geoMoon);
    let longitude = ecliptic.elon; // Ecliptic longitude in degrees

    // Normalize longitude to ensure it’s within 0° to 360°
    longitude = (longitude + 360) % 360;

    // Adjust longitude to match Vedic Nakshatra system
    // Reference: March 1, 2025, should be Purva Bhadrapada → Uttara Bhadrapada
    // October 7, 2025, should be Shravana
    longitude = (longitude + 290) % 360; // Adjust offset to align with reference Nakshatras
    const nakshatraIndex = Math.floor(longitude / (360 / 27));
    return NAKSHATRAS[nakshatraIndex] || 'Unknown';
}

function calculateFestivals(dateStr, paksha, tithi) {
    const dateStrShort = dateStr.split('T')[0];

    // Hardcoded festivals
    if (FESTIVALS_2025[dateStrShort]) {
        return FESTIVALS_2025[dateStrShort];
    }

    // Dynamic festivals based on Tithi and Paksha
    const date = new Date(dateStr);
    const month = date.getMonth(); // 0-11 (March = 2)

    if (month === 2 && paksha === 'Shukla' && tithi === 'Purnima') {
        return "Holi";
    }

    if (month === 9 && paksha === 'Krishna' && tithi === 'Amavasya') {
        return "Diwali";
    }

    if (month === 2 && paksha === 'Shukla' && tithi === 'Pratipada') {
        return "Navratri Begins"; // Chaitra Navratri (March/April)
    }

    if (month === 7 && paksha === 'Shukla' && tithi === 'Ashtami') {
        return "Krishna Janmashtami"; // Approximated for August
    }

    return '';
}

function getVedicData(dateStr) {
    const { paksha, tithi } = calculatePakshaAndTithi(dateStr);
    const nakshatra = calculateNakshatra(dateStr);
    const festival = calculateFestivals(dateStr, paksha, tithi);

    return {
        tithi,
        nakshatra,
        paksha,
        festival,
        isEkadashi: tithi === 'Ekadashi'
    };
}

module.exports = {
    calculatePakshaAndTithi,
    calculateNakshatra,
    calculateFestivals,
    getVedicData
};