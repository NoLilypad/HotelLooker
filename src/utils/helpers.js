// Utility functions for HotelLooker

/**
 * Get all days (Monday to Sunday) for the week containing the given date.
 * @param {string|Date} date - Date string (YYYY-MM-DD) or Date object
 * @param {string} [locale='fr-FR'] - Locale for weekday labels
 * @returns {Array<{date: string, label: string}>}
 */
function getWeekDays(date, locale = 'fr-FR') {
  const refDate = new Date(date);
  const day = refDate.getDay();
  // Monday = 1, Sunday = 0
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - ((day + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(locale, { weekday: 'long' })
    });
  }
  return days;
}

/**
 * Extract a parameter from req.body or req.query, with a default value.
 * @param {object} req - Express request object
 * @param {string} name - Parameter name
 * @param {*} defaultValue - Default value if not found
 * @returns {*}
 */
function getParam(req, name, defaultValue) {
  if (req.body && req.body[name] !== undefined) return req.body[name];
  if (req.query && req.query[name] !== undefined) return req.query[name];
  return defaultValue;
}

const fs = require('fs');
const path = require('path');

/**
 * Get a writable path for hotels.json, compatible with pkg executables.
 * If running packaged, copy the original hotels.json to a writable location (next to the executable) if needed.
 * @returns {string} Absolute path to the writable hotels.json
 */
function getWritableHotelsPath() {
  const isPkg = typeof process.pkg !== 'undefined';
  if (isPkg) {
    // Always use the hotels.json next to the executable in pkg mode
    return path.join(path.dirname(process.execPath), 'hotels.json');
  } else {
    // In dev mode, use the source file
    return path.join(__dirname, '../../data/hotels.json');
  }
}

/**
 * Ensure that the writable hotels.json exists and is initialized (for pkg mode)
 */
function ensureWritableHotelsJson() {
  const isPkg = typeof process.pkg !== 'undefined';
  if (isPkg) {
    const execDir = path.dirname(process.execPath);
    const writablePath = path.join(execDir, 'hotels.json');
    if (!fs.existsSync(writablePath)) {
      // Read from the snapshot (read-only)
      const originalPath = path.join(__dirname, '../../data/hotels.json');
      const data = fs.readFileSync(originalPath, 'utf-8');
      fs.writeFileSync(writablePath, data, 'utf-8');
    }
  }
}

module.exports = { getWeekDays, getParam, getWritableHotelsPath, ensureWritableHotelsJson };
