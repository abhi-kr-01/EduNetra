const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change-me-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
