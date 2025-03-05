// Planetary order and associated Choghadiya types
const PLANETARY_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

const HORA_AUSPICIOUSNESS = {
    'Sun': 'good',
    'Venus': 'good',
    'Jupiter': 'good',
    'Moon': 'good',
    'Mercury': 'okay',
    'Mars': 'bad',
    'Saturn': 'bad'
};

const DAY_TO_HORA_INDEX = {
    0: 0, // Sunday: Sun
    1: 3, // Monday: Moon
    2: 6, // Tuesday: Mars
    3: 2, // Wednesday: Mercury
    4: 5, // Thursday: Jupiter
    5: 1, // Friday: Venus
    6: 4  // Saturday: Saturn
};

const CHOGHADIYA_TYPES = {
    0: ['Rog', 'Evil'],    // Mars: Bad
    1: ['Udveg', 'Bad'],   // Sun: Bad
    2: ['Chara', 'Neutral'], // Venus: Neutral
    3: ['Labha', 'Gain'],  // Mercury: Good
    4: ['Amrita', 'Best'], // Moon: Best
    5: ['Kaal', 'Loss'],   // Saturn: Bad
    6: ['Shubha', 'Good']  // Jupiter: Good
};

const DAY_TO_CHOGHADIYA_INDEX = {
    0: 1, // Sunday: Sun (Udveg)
    1: 4, // Monday: Moon (Amrita)
    2: 0, // Tuesday: Mars (Rog)
    3: 3, // Wednesday: Mercury (Labha)
    4: 6, // Thursday: Jupiter (Shubha)
    5: 2, // Friday: Venus (Chara)
    6: 5  // Saturday: Saturn (Kaal)
};

const NIGHT_CHOGHADIYA_SEQUENCE = {
    0: [6, 4, 2, 0, 5, 3, 1, 6], // Sunday
    1: [2, 0, 5, 3, 1, 6, 4, 2], // Monday
    2: [5, 3, 1, 6, 4, 2, 0, 5], // Tuesday
    3: [1, 6, 4, 2, 0, 5, 3, 1], // Wednesday
    4: [4, 2, 0, 5, 3, 1, 6, 4], // Thursday
    5: [0, 5, 3, 1, 6, 4, 2, 0], // Friday
    6: [3, 1, 6, 4, 2, 0, 5, 3]  // Saturday
};

const RAHU_KALAM_PERIODS = {
    0: 8, // Sunday: 8th period
    1: 2, // Monday: 2nd period
    2: 7, // Tuesday: 7th period
    3: 5, // Wednesday: 5th period
    4: 6, // Thursday: 6th period
    5: 4, // Friday: 4th period
    6: 3  // Saturday: 3rd period
};

// Tithi names for display
const TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', // Shukla Paksha
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya' // Krishna Paksha
];

// Nakshatra names
const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
    'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
];

// Expanded festival data for 2025
const FESTIVALS_2025 = {
    // January
    "2025-01-13": "Lohri",
    "2025-01-14": "Makar Sankranti / Pongal / Thai Pongal",
    "2025-01-29": "Vasant Panchami",

    // February
    "2025-02-26": "Maha Shivaratri",

    // March
    "2025-03-30": "Ugadi / Gudi Padwa",

    // April
    "2025-04-08": "Rama Navami",
    "2025-04-13": "Baisakhi",
    "2025-04-14": "Bihu (Rongali Bihu)",

    // August
    "2025-08-15": "Raksha Bandhan",
    "2025-08-23": "Krishna Janmashtami",
    "2025-08-27": "Ganesh Chaturthi",
    "2025-08-29": "Onam",

    // September
    "2025-09-29": "Navratri Begins",

    // October
    "2025-10-07": "Dussehra",
    "2025-10-10": "Karva Chauth",
    "2025-10-21": "Diwali", // Will be dynamically calculated, placeholder

    // November
    "2025-11-05": "Chhath Puja",
    "2025-11-15": "Gurpurab (Guru Nanak Jayanti)",
};

module.exports = {
    PLANETARY_ORDER,
    HORA_AUSPICIOUSNESS,
    DAY_TO_HORA_INDEX,
    CHOGHADIYA_TYPES,
    DAY_TO_CHOGHADIYA_INDEX,
    NIGHT_CHOGHADIYA_SEQUENCE,
    RAHU_KALAM_PERIODS,
    TITHI_NAMES,
    NAKSHATRAS,
    FESTIVALS_2025
};