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

// Auth désactivée : accès libre à toutes les routes
// Page d'accueil = formulaire
app.get('/', (req, res) => generalController.showForm(req, res));
// Affichage du tableau des prix (GET si paramètres, sinon formulaire)
app.get('/prices', (req, res) => {
  if (req.query.start_date && req.query.adults) {
    return generalController.showPrices(req, res);
  } else {
    return generalController.showForm(req, res);
  }
});
// Ajout d'un hôtel
app.post('/hotels/add', hotelController.addHotel);
// Suppression d'un hôtel
app.post('/hotels/delete', hotelController.deleteHotel);
// Affichage du tableau des prix (POST)
app.post('/prices', generalController.showPrices);

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

const AUTO_OPEN = process.env.AUTO_OPEN === 'true';
const openBrowser = () => {
  try {
    const url = `http://localhost:${PORT}`;
    const { exec } = require('child_process');
    let startCmd;
    if (process.platform === 'win32') {
      startCmd = `start "" "${url}"`;
    } else if (process.platform === 'darwin') {
      startCmd = `open "${url}"`;
    } else {
      startCmd = `xdg-open "${url}"`;
    }
    exec(startCmd, (err) => {
      if (err && !PROD) console.error('Erreur ouverture navigateur:', err);
    });
  } catch (e) {
    if (!PROD) console.error('Erreur openBrowser:', e);
  }
};

app.listen(PORT, () => {
  if (PROD) {
    console.log(asciiArt);
    console.log(`Connectez-vous sur : http://localhost:${PORT}`);
  }
  if (AUTO_OPEN) {
    openBrowser();
  }
});

