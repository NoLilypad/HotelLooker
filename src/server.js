const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');

const generalController = require('./controllers/generalController');

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

// Middleware de protection pour /prices
function requireAuth(req, res, next) {
  if (!AUTH_ENABLED || req.session.user) {
    return next();
  }
  res.redirect('/');
}

// Page de login
app.get('/', (req, res) => generalController.showLogin(req, res, AUTH_ENABLED));

// Soumission du formulaire de login
app.post('/login', (req, res) => generalController.handleLogin(req, res, USERS));

// Déconnexion
app.get('/logout', generalController.handleLogout);

// Route protégée : affiche les offres Booking.com pour chaque hôtel
app.get('/prices', requireAuth, generalController.showPrices);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
