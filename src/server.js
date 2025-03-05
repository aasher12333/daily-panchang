const express = require('express');
const axios = require('axios');
const Astronomy = require('astronomy-engine');
const { calculateRahuKalam, calculateHoras, calculateChoghadiya, getVedicData } = require('./vedicTimings');
require('dotenv').config();

// In-memory cache for sunrise/sunset data
const sunriseSunsetCache = {};

const app = express();
app.use(express.static('public'));
app.use(express.json());

// Utility function for retrying API calls
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

app.get('/api/rahu-kalam', async (req, res) => {
  try {
    const { lat, lng, date } = req.query;

    // Validate query parameters
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return res.status(400).json({ error: 'Invalid or missing latitude/longitude' });
    }

    let calcDate;
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      calcDate = new Date(year, month - 1, day);
    } else {
      calcDate = new Date();
    }

    const dayOfWeek = calcDate.getDay();
    const apiDate = calcDate.toISOString().split('T')[0];

    // Define nextApiDate before using it in cacheKeyNext
    const nextDay = new Date(calcDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextApiDate = nextDay.toISOString().split('T')[0];

    // Now we can safely use nextApiDate in cacheKeyNext
    const cacheKeyCurrent = `${lat}-${lng}-${apiDate}`;
    const cacheKeyNext = `${lat}-${lng}-${nextApiDate}`;
    let currentDayData = sunriseSunsetCache[cacheKeyCurrent];
    let nextDayData = sunriseSunsetCache[cacheKeyNext];

    // Fetch sunrise/sunset for the current day
    if (!currentDayData) {
      const currentDayResponse = await retry(() =>
          axios.get(
              `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${apiDate}&formatted=0`,
              { timeout: 5000 }
          )
      );
      currentDayData = currentDayResponse.data;
      sunriseSunsetCache[cacheKeyCurrent] = currentDayData;
    }

    // Fetch sunrise/sunset for the next day
    if (!nextDayData) {
      const nextDayResponse = await retry(() =>
          axios.get(
              `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${nextApiDate}&formatted=0`,
              { timeout: 5000 }
          )
      );
      nextDayData = nextDayResponse.data;
      sunriseSunsetCache[cacheKeyNext] = nextDayData;
    }

    // Validate API responses
    if (!currentDayData.results || !currentDayData.results.sunrise || !currentDayData.results.sunset) {
      throw new Error('Invalid sunrise/sunset data received for current day');
    }
    if (!nextDayData.results || !nextDayData.results.sunrise) {
      throw new Error('Invalid sunrise/sunset data received for next day');
    }

    // Fetch location name (with delay to respect Nominatim rate limits)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Respect Nominatim's 1 request/second limit
    const locationResponse = await retry(() =>
        axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
              timeout: 5000,
              headers: { 'User-Agent': 'DailyPanchangApp/1.0 (asher.amish@gmail.com)' }
            }
        )
    );

    const location = locationResponse.data.address.city ||
        locationResponse.data.address.town ||
        locationResponse.data.address.region ||
        'Unknown Location';

    const { sunrise, sunset } = currentDayData.results;
    const { sunrise: nextSunrise } = nextDayData.results;

    // Compute timings
    const rahuKalam = calculateRahuKalam(sunrise, sunset, dayOfWeek);
    const { dayHoras, nightHoras } = calculateHoras(sunrise, sunset, nextSunrise, dayOfWeek);
    const { dayChoghadiya, nightChoghadiya } = calculateChoghadiya(sunrise, sunset, nextSunrise, dayOfWeek);

    res.json({
      date: calcDate.toDateString(),
      day: calcDate.toLocaleString('default', { weekday: 'long' }),
      location,
      sunrise,
      sunset,
      rahuKalam,
      dayHoras,
      nightHoras,
      dayChoghadiya,
      nightChoghadiya
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to calculate timings' });
  }
});

app.get('/api/vedic-calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const daysInMonth = new Date(year, month - 0 + 1, 0).getDate();
    const vedicData = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      vedicData[dateStr] = getVedicData(dateStr);
    }

    res.json(vedicData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Vedic calendar data' });
  }
});

app.get('/api/new-moon', async (req, res) => {
  try {
    const { date } = req.query;
    const calcDate = new Date(date);

    const newMoon = Astronomy.SearchMoonPhase(0, calcDate, -30); // Previous New Moon (0°)
    if (!newMoon) {
      throw new Error('Failed to find New Moon');
    }

    const daysSinceNewMoon = (calcDate - newMoon.date) / (1000 * 60 * 60 * 24);

    res.json({ daysSinceNewMoon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate days since New Moon' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));