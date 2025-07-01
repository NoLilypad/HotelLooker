// Module pour interroger l'API Xotelo et obtenir le prix total Booking.com pour un hôtel donné
const axios = require('axios');

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const API_URL = process.env.XOTELO_API_URL || 'https://data.xotelo.com/api/rates';

/**
 * Récupère le prix total Booking.com pour un hôtel donné, des dates et un nombre de personnes
 * @param {string} hotelKey - L'identifiant de l'hôtel
 * @param {string} checkIn - Date d'arrivée (YYYY-MM-DD)
 * @param {string} checkOut - Date de départ (YYYY-MM-DD)
 * @param {number} adults - Nombre d'adultes
 * @param {string} [currency='EUR'] - Devise
 * @param {number} [rooms=1] - Nombre de chambres
 * @returns {Promise<number|null>} Prix total Booking.com ou null si non trouvé
 */
async function getBookingTotalPrice(hotelKey, checkIn, checkOut, adults, currency = 'EUR', rooms = 1) {
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
    if (data.error) return null;
    const result = data.result || {};
    const rates = result.rates || [];
    // Cherche la première offre Booking.com
    const offer = rates.find(o => (o.name || '').toLowerCase().startsWith('booking'));
    if (!offer) return null;
    return (offer.rate || 0) + (offer.tax || 0);
  } catch (err) {
    return null;
  }
}

module.exports = { getBookingTotalPrice };
