// Controller for dynamic hotel management (add/delete)
const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.join(__dirname, '../../data/hotels.json');

// Get the list of hotels from the JSON file
function getHotels() {
  return JSON.parse(fs.readFileSync(HOTELS_PATH, 'utf-8'));
}

// Save the list of hotels to the JSON file
function saveHotels(hotels) {
  fs.writeFileSync(HOTELS_PATH, JSON.stringify(hotels, null, 2), 'utf-8');
}

// Add a hotel to the list
function addHotel(req, res) {
  const { hotel_name, hotel_key } = req.body;
  if (!hotel_name || !hotel_key) return res.redirect('/prices');
  const hotels = getHotels();
  // Prevent duplicates
  if (hotels.some(h => h.key === hotel_key)) return res.redirect('/prices');
  hotels.push({ name: hotel_name, key: hotel_key });
  saveHotels(hotels);
  res.redirect('/prices');
}

// Delete a hotel by its index in the list
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
