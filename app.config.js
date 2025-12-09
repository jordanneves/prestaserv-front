// app.config.js — inject build-time environment variables into Expo config
// This will set expo.extra.API_URL from process.env.API_URL (Render environment variable)

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
        // Use process.env.API_URL when available (Render or local env).
        // Fallback to the previously used Render host for safety.
        API_URL: 'https://prestaserv-api-68y8.onrender.com',
    },
  };
};
