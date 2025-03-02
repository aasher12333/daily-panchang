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
    0: 5, // Sunday: Start with Jupiter (Shubha)
    1: 4, // Monday: Start with Saturn (Kaal)
    2: 6, // Tuesday: Start with Jupiter (Shubha)
    3: 3, // Wednesday: Start with Moon (Amrita)
    4: 2, // Thursday: Start with Sun (Udvega)
    5: 1, // Friday: Start with Mercury (Labha)
    6: 5  // Saturday: Start with Saturn (Kaal)
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

// Hardcoded festival data
const FESTIVALS_2025 = {
    "2025-01-02": "Vasant Panchami",
    "2025-01-14": "Makar Sankranti",
    "2025-01-26": "Republic Day",
    "2025-02-25": "Maha Shivaratri",
    "2025-04-08": "Rama Navami",
    "2025-08-15": "Raksha Bandhan",
    "2025-08-23": "Krishna Janmashtami",
    "2025-09-29": "Navratri Begins",
    "2025-10-07": "Dussehra",
    "2025-11-05": "Chhath Puja"
};

module.exports = {
    PLANETARY_ORDER,
    HORA_AUSPICIOUSNESS,
    DAY_TO_HORA_INDEX,
    CHOGHADIYA_TYPES,
    DAY_TO_CHOGHADIYA_INDEX,
    RAHU_KALAM_PERIODS,
    TITHI_NAMES,
    NAKSHATRAS,
    FESTIVALS_2025
};