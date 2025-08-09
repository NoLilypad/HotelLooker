# HotelLooker

Application web Node.js pour comparer les prix d'hôtels sur Booking.com.

## Installation
```bash
git clone <repo_url>
cd HotelLooker
npm install
```
Configurer `.env` puis :
```bash
npm run dev
# ou
npm start
```
Accès : http://localhost:3000

## Générer un exécutable
- Windows : `npm run build:win` → `windist/HotelLooker-win.exe`
- Linux : `npm run build:linux` → `dist/HotelLooker-linux`

## Config
Options dans `.env` (API, cache, ouverture auto navigateur...)