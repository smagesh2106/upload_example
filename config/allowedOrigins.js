const { ALLOWED_ORIGINS } = process.env
const allowedOrigins = ALLOWED_ORIGINS.split(',');

module.exports = allowedOrigins;
