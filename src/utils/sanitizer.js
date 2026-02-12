module.exports = {
  sanitizeText: (text) => {
    if (!text) return '';
    // Remove potentially harmful characters for SQL injection if not using prepared statements (we are using prepared statements but still).
    // Or remove HTML tags
    return text.replace(/[<>"']/g, ''); // Basic sanitization
  },
  
  sanitizePhone: (phone) => {
    // Keep only numbers and +
    return phone.replace(/[^0-9+]/g, '');
  }
};
