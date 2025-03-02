const { calculateRahuKalam } = require('./timings/RahuKalam');
const { calculateHoras } = require('./timings/Hora');
const { calculateChoghadiya } = require('./timings/Choghadiya');
const { calculateTimeSegments, mapPlanetaryOrder } = require('./timings/TimeUtils');
const { getVedicData } = require('./timings/VedicCalendar');

module.exports = {
  calculateRahuKalam,
  calculateHoras,
  calculateChoghadiya,
  calculateTimeSegments,
  mapPlanetaryOrder,
  getVedicData
};