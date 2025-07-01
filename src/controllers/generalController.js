// Contrôleur général pour la gestion des routes principales
const axios = require('axios');

// Paramètres fixes (repris de test.py)
const HOTELS = [
  { name: 'APPOLO', key: 'g187147-d233386' },
  { name: 'MOULIN', key: 'g187147-d228845' },
  { name: 'FROCHOT', key: 'g187147-d233570' },
  { name: 'JOKE', key: 'g187147-d287896' }
];
const CHECK_IN = '2025-07-02';
const CHECK_OUT = '2025-07-03';
const API_URL = 'https://data.xotelo.com/api/rates';

// Affiche la page de login
function showLogin(req, res, AUTH_ENABLED) {
  if (!AUTH_ENABLED || req.session.user) {
    return res.redirect('/prices');
  }
  res.render('login', { error: null });
}

// Gère la soumission du formulaire de login
function handleLogin(req, res, USERS) {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user.username;
    return res.redirect('/prices');
  }
  res.render('login', { error: 'Identifiants invalides' });
}

// Déconnecte l'utilisateur
function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

// Affiche les offres Booking.com pour chaque hôtel
async function showPrices(req, res) {
  const results = await Promise.all(HOTELS.map(async (hotel) => {
    try {
      const params = {
        hotel_key: hotel.key,
        chk_in: CHECK_IN,
        chk_out: CHECK_OUT,
        adults: 2,
        currency: 'EUR',
        rooms: 1
      };
      const response = await axios.get(API_URL, { params });
      const data = response.data;
      if (data.error) {
        return { name: hotel.name, error: data.error, offers: [] };
      }
      const result = data.result || {};
      const rates = result.rates || [];
      const currency = result.currency || 'EUR';
      const offers = rates.filter(o => (o.name || '').toLowerCase().startsWith('booking')).map(o => ({
        name: o.name,
        rate: o.rate,
        tax: o.tax,
        total_price: (o.rate || 0) + (o.tax || 0),
        currency
      }));
      return { name: hotel.name, error: null, offers };
    } catch (err) {
      return { name: hotel.name, error: 'Erreur réseau ou API', offers: [] };
    }
  }));
  res.render('hotels', { hotels: results });
}

module.exports = {
  showLogin,
  handleLogin,
  handleLogout,
  showPrices
};
