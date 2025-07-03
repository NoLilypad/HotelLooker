const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const express = require('express');
const session = require('express-session');
const generalController = require('./controllers/generalController');
const hotelController = require('./controllers/hotelController');

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
// Servir les fichiers statiques (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Auth config depuis .env
const LOGIN_ENABLED = String(process.env.LOGIN_ENABLED || '').replace(/\r|\n/g, '').trim().toLowerCase() === 'true';
const USERS = (process.env.USERS || '').split(',').map(u => {
  const [username, password] = u.split(':');
  return { username, password };
});


// Middleware de protection pour /prices
function requireAuth(req, res, next) {
  if (!LOGIN_ENABLED || req.session.user) {
    return next();
  }
  res.redirect('/');
}



// Page de login
app.get('/', (req, res) => generalController.showLogin(req, res, LOGIN_ENABLED));
// Soumission du formulaire de login
app.post('/login', (req, res) => generalController.handleLogin(req, res, USERS, LOGIN_ENABLED));
// Déconnexion
app.get('/logout', generalController.handleLogout);
// Affichage du tableau des prix (GET si paramètres, sinon formulaire)
app.get('/prices', requireAuth, (req, res) => {
  if (req.query.start_date && req.query.adults) {
    return generalController.showPrices(req, res);
  } else {
    return generalController.showForm(req, res);
  }
});
// Ajout d'un hôtel
app.post('/hotels/add', requireAuth, hotelController.addHotel);
// Suppression d'un hôtel
app.post('/hotels/delete', requireAuth, hotelController.deleteHotel);
// Affichage du tableau des prix (POST)
app.post('/prices', requireAuth, generalController.showPrices);

const PROD = process.env.PROD !== 'false'; // true par défaut

// En PROD, on masque tous les prints d'erreur
if (PROD) {
  console.error = () => {};
  process.on('uncaughtException', () => {});
  process.on('unhandledRejection', () => {});
}

const asciiArt = `
  _    _       _       _   _____      _          
 | |  | |     | |     | | |  __ \\    (_)         
 | |__| | ___ | |_ ___| | | |__) | __ _  ___ ___ 
 |  __  |/ _ \\| __/ _ \\ | |  ___/ '__| |/ __/ _ \\
 | |  | | (_) | ||  __/ | | |   | |  | | (_|  __/
 |_|  |_|\\___/ \\__\\___|_| |_|   |_|  |_|\\___\\___|
                                                 
                                                 
`;
app.listen(PORT, () => {
  if (PROD) {
    console.log(asciiArt);
    console.log(`Connectez-vous sur : http://localhost:${PORT}`);
  }
});

