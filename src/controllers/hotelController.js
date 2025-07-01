// Contrôleur pour la gestion dynamique des hôtels (ajout/suppression)
const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.join(__dirname, '../../data/hotels.json');

function getHotels() {
  return JSON.parse(fs.readFileSync(HOTELS_PATH, 'utf-8'));
}

function saveHotels(hotels) {
  fs.writeFileSync(HOTELS_PATH, JSON.stringify(hotels, null, 2), 'utf-8');
}

// Ajout d'un hôtel
function addHotel(req, res) {
  const { hotel_name, hotel_key } = req.body;
  if (!hotel_name || !hotel_key) return res.redirect('/prices');
  const hotels = getHotels();
  // Empêche les doublons
  if (hotels.some(h => h.key === hotel_key)) return res.redirect('/prices');
  hotels.push({ name: hotel_name, key: hotel_key });
  saveHotels(hotels);
  res.redirect('/prices');
}

// Suppression d'un hôtel par index
function deleteHotel(req, res) {
  const { hotel_idx } = req.body;
  const hotels = getHotels();
  if (hotel_idx >= 0 && hotel_idx < hotels.length) {
    hotels.splice(hotel_idx, 1);
    saveHotels(hotels);
  }
  res.redirect('/prices');
}

module.exports = { addHotel, deleteHotel };
