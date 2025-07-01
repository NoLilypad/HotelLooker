// Main controller for core routes
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Use backend module to get total Booking.com price
const { getBookingTotalPrice } = require('../backend/xoteloApi');

// Utility function to dynamically read hotel list
function getHotels() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/hotels.json'), 'utf-8'));
}

// Show login page
function showLogin(req, res, LOGIN_ENABLED) {
  if (!LOGIN_ENABLED) {
    return res.redirect('/prices');
  }
  if (req.session.user) {
    return res.redirect('/prices');
  }
  res.render('login', { error: null });
}

// Show week/adult selection form
function showForm(req, res) {
  const today = new Date();
  const selected = req.query.start_date || today.toISOString().slice(0, 10);
  const refDate = new Date(selected);
  // Find Monday of the week for refDate
  const day = refDate.getDay();
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - ((day + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'long' })
    });
  }
  res.render('form', {
    hotels: getHotels(),
    days,
    defaultAdults: 2
  });
}

// Handle login form submission
function handleLogin(req, res, USERS, LOGIN_ENABLED) {
  if (!LOGIN_ENABLED) {
    return res.redirect('/prices');
  }
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user.username;
    return res.redirect('/prices');
  }
  res.render('login', { error: 'Invalid credentials' });
}

// Logout user
function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

// Show price table for each hotel and each day of the selected week (7 days)
async function showPrices(req, res) {
  // Get params from POST (form) or GET (URL)
  let start_date, adults;
  if (req.method === 'POST' && req.body && req.body.start_date) {
    start_date = req.body.start_date;
    adults = req.body.adults;
  } else if (req.query && req.query.start_date) {
    start_date = req.query.start_date;
    adults = req.query.adults;
  } else {
    // fallback: today and 2 adults
    const today = new Date();
    start_date = today.toISOString().slice(0, 10);
    adults = 2;
  }
  const nbAdults = Math.max(1, Math.min(3, parseInt(adults) || 2));
  // Compute 7 days of the week (Monday to Sunday) from any date
  const refDate = new Date(start_date);
  const day = refDate.getDay();
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - ((day + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'long' })
    });
  }
  // For each hotel and each day, get Booking.com price
  const hotels = getHotels();
  let prices = [];
  let error = null;
  try {
    prices = await Promise.all(hotels.map(async (hotel) => {
      const row = { name: hotel.name, prices: [] };
      for (let i = 0; i < days.length; i++) {
        // checkIn = current day, checkOut = next day
        const checkInDate = new Date(days[i].date);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + 1);
        const checkInStr = checkInDate.toISOString().slice(0, 10);
        const checkOutStr = checkOutDate.toISOString().slice(0, 10);
        let total = null;
        try {
          total = await getBookingTotalPrice(
            hotel.key,
            checkInStr,
            checkOutStr,
            nbAdults,
            'EUR',
            1
          );
        } catch (err) {
          console.error('Error fetching price for hotel', hotel.key, err);
          total = null;
        }
        row.prices.push(total);
      }
      return row;
    }));
  } catch (err) {
    console.error('Error fetching hotel prices:', err);
    error = 'Une erreur est survenue lors de la récupération des prix.';
  }
  res.render('pricesTable', {
    hotels,
    days,
    prices,
    nbAdults,
    error
  });
}

module.exports = {
  showLogin,
  handleLogin,
  handleLogout,
  showForm,
  showPrices
};
