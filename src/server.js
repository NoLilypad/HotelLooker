
// Prototype d'un serveur Node.js/Express qui affiche les offres Booking.com pour plusieurs hôtels
// Utilise EJS comme moteur de template pour afficher les résultats


const express = require('express');
const axios = require('axios');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 3000;

// Middleware pour parser les formulaires
app.use(express.urlencoded({ extended: true }));

// Session pour la gestion de l'authentification
app.use(session({
  secret: 'hotel_secret',
  resave: false,
  saveUninitialized: true
}));

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Auth config depuis .env
const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';
const USERS = (process.env.USERS || '').split(',').map(u => {
  const [username, password] = u.split(':');
  return { username, password };
});

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

// Middleware de protection pour /prices
function requireAuth(req, res, next) {
  if (!AUTH_ENABLED || req.session.user) {
    return next();
  }
  res.redirect('/');
}

// Page de login
app.get('/', (req, res) => {
  if (!AUTH_ENABLED || req.session.user) {
    return res.redirect('/prices');
  }
  res.render('login', { error: null });
});

// Soumission du formulaire de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user.username;
    return res.redirect('/prices');
  }
  res.render('login', { error: 'Identifiants invalides' });
});

// Déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


// Route protégée : affiche les offres Booking.com pour chaque hôtel
app.get('/prices', requireAuth, async (req, res) => {
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
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
