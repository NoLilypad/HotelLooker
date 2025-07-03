// Module to query the Xotelo API and get the total Booking.com price for a given hotel

const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const API_URL = process.env.XOTELO_API_URL || 'https://data.xotelo.com/api/rates';
const CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 600;
const priceCache = new NodeCache({ stdTTL: CACHE_TTL });

/**
 * Get the total Booking.com price for a given hotel, dates, and number of adults
 * @param {string} hotelKey - Hotel identifier
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} adults - Number of adults
 * @param {string} [currency='EUR'] - Currency
 * @param {number} [rooms=1] - Number of rooms
 * @returns {Promise<number|null>} Total Booking.com price or null if not found
 */
async function getBookingTotalPrice(hotelKey, checkIn, checkOut, adults, currency = 'EUR', rooms = 1) {
  const cacheKey = `${hotelKey}_${checkIn}_${checkOut}_${adults}_${currency}_${rooms}`;
  //console.log(`Asking for ${cacheKey}`);
  const cached = priceCache.get(cacheKey);
  if (cached !== undefined) return cached;
  try {
    const params = {
      hotel_key: hotelKey,
      chk_in: checkIn,
      chk_out: checkOut,
      adults,
      currency,
      rooms
    };
    const response = await axios.get(API_URL, { params });
    const data = response.data;
    if (data.error) {
      console.error('Xotelo API error:', data.error);
      return null;
    }
    const result = data.result || {};
    const rates = result.rates || [];
    // Find the first Booking.com offer
    const offer = rates.find(o => (o.name || '').toLowerCase().startsWith('booking'));
    if (!offer) return null;
    const total = (offer.rate || 0) + (offer.tax || 0);
    priceCache.set(cacheKey, total);
    return total;
  } catch (err) {
    console.error('Error fetching Booking.com price from Xotelo API:', err);
    return null;
  }
}

module.exports = { getBookingTotalPrice };
