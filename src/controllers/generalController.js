// Contrôleur général pour la gestion des routes principales
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Utilisation du module backend pour obtenir le prix total Booking.com
const { getBookingTotalPrice } = require('../backend/xoteloApi');



// Lecture des hôtels depuis le fichier JSON
const HOTELS = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/hotels.json'), 'utf-8'));
const CHECK_IN = '2025-07-02';
const CHECK_OUT = '2025-07-03';


// Affiche la page de login
function showLogin(req, res, AUTH_ENABLED) {
  // Si l'authentification est désactivée, redirige directement vers le formulaire
  if (!AUTH_ENABLED) {
    return res.redirect('/prices');
  }
  if (req.session.user) {
    return res.redirect('/prices');
  }
  res.render('login', { error: null });
}

// Affiche le formulaire de sélection de semaine et d'adultes
function showForm(req, res) {
  // Par défaut, semaine courante (lundi à dimanche)
  const today = new Date();
  const day = today.getDay();
  // 0 = dimanche, 1 = lundi, ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('fr-FR', { weekday: 'long' })
    });
  }
  res.render('form', {
    hotels: HOTELS,
    days,
    defaultAdults: 2
  });
}

// Gère la soumission du formulaire de login
function handleLogin(req, res, USERS, AUTH_ENABLED) {
  // Si l'authentification est désactivée, redirige directement
  if (!AUTH_ENABLED) {
    return res.redirect('/prices');
  }
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




// Affiche le tableau des prix pour chaque hôtel et chaque jour de la semaine sélectionnée (7 jours)
async function showPrices(req, res) {
  // Récupère les paramètres du formulaire
  const { start_date, adults } = req.body;
  const nbAdults = Math.max(1, Math.min(3, parseInt(adults) || 2));
  // Calcule les 7 jours de la semaine (lundi à dimanche)
  const monday = new Date(start_date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('fr-FR', { weekday: 'long' })
    });
  }
  // Pour chaque hôtel et chaque jour, récupère le prix Booking.com
  const prices = await Promise.all(HOTELS.map(async (hotel) => {
    const row = { name: hotel.name, prices: [] };
    for (let i = 0; i < days.length; i++) {
      // checkIn = jour courant, checkOut = jour suivant
      const checkInDate = new Date(days[i].date);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + 1);
      const checkInStr = checkInDate.toISOString().slice(0, 10);
      const checkOutStr = checkOutDate.toISOString().slice(0, 10);
      // Vérification explicite (debug)
      // console.log(`Hotel: ${hotel.name}, checkIn: ${checkInStr}, checkOut: ${checkOutStr}`);
      const total = await getBookingTotalPrice(
        hotel.key,
        checkInStr,
        checkOutStr,
        nbAdults,
        'EUR',
        1
      );
      row.prices.push(total);
    }
    return row;
  }));
  res.render('pricesTable', {
    hotels: HOTELS,
    days,
    prices,
    nbAdults
  });
}



module.exports = {
  showLogin,
  handleLogin,
  handleLogout,
  showForm,
  showPrices
};
