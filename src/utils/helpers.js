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

module.exports = { getWeekDays, getParam };
