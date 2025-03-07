const express = require('express');
const axios = require('axios');
const Astronomy = require('astronomy-engine');
const { calculateRahuKalam, calculateHoras, calculateChoghadiya, getVedicData } = require('./vedicTimings');
const tzLookup = require('tz-lookup');

require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.get('/api/rahu-kalam', async (req, res) => {
  try {
    const { lat, lng, date } = req.query;

    let calcDate;
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      calcDate = new Date(year, month - 1, day);
    } else {
      calcDate = new Date();
    }

    console.log('Server received date:', date, 'Calculated as:', calcDate.toISOString());
    const dayOfWeek = calcDate.getDay();
    const apiDate = calcDate.toISOString().split('T')[0];

    const currentDayResponse = await axios.get(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${apiDate}&formatted=0`
    );
    const nextDay = new Date(calcDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextApiDate = nextDay.toISOString().split('T')[0];
    const nextDayResponse = await axios.get(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${nextApiDate}&formatted=0`
    );

    const locationResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const location = locationResponse.data.address.city || locationResponse.data.address.town || locationResponse.data.address.region || 'Unknown Location';

    const { sunrise, sunset } = currentDayResponse.data.results;
    const { sunrise: nextSunrise } = nextDayResponse.data.results;

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
    res.status(500).json({ error: 'Failed to calculate timings' });
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

app.get('/api/timezone', (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }
    const timezone = tzLookup(parseFloat(lat), parseFloat(lng));
    res.json({ timezone });
  } catch (error) {
    res.status(500).json({ error: 'Failed to lookup timezone.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));