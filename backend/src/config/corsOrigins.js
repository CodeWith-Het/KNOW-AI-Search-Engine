// Centralized list of allowed origins for both Express CORS (app.js) and
// Socket.io CORS (socket/server.socket.js). Keeping this in one place avoids
// the two configs drifting apart and causing hard-to-debug cross-domain bugs.

// FRONTEND_URL can hold a single URL or a comma-separated list of URLs
// (useful for supporting a custom domain + the default vercel.app domain
// at the same time, or multiple preview/staging frontends).
const parseOrigins = (envValue) =>
  (envValue || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, "")) // strip trailing slash
    .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...parseOrigins(process.env.FRONTEND_URL),
];

export default allowedOrigins;
