const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

const jwtService = {
  /**
   * Signs a new access token
   * @param {Object} payload - The payload to embed into the token (usually user info)
   * @returns {String} - The signed JWT access token
   */
  signAccessToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES, // '15m'
    });
  },

  /**
   * Signs a new refresh token
   * @param {Object} payload - The payload to embed into the token (usually user info)
   * @returns {String} - The signed JWT refresh token
   */
  signRefreshToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES, // '7d'
    });
  },

  /**
   * Verifies the access token
   * @param {String} token - The token to verify
   * @returns {Object|String} - The decoded payload if valid, otherwise throws an error
   */
  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error('Access token is invalid or expired');
    }
  },

  /**
   * Verifies the refresh token
   * @param {String} token - The token to verify
   * @returns {Object|String} - The decoded payload if valid, otherwise throws an error
   */
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Refresh token is invalid or expired');
    }
  },

  /**
   * Refresh the access token using a valid refresh token
   * @param {String} refreshToken - The refresh token
   * @returns {String} - A new access token if the refresh token is valid
   */
  refreshAccessToken: (refreshToken) => {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      // You can add more logic like checking if the token is revoked here
      const newAccessToken = jwtService.signAccessToken({ id: decoded.id, email: decoded.email });
      return newAccessToken;
    } catch (error) {
      throw new Error('Unable to refresh access token, refresh token is invalid');
    }
  },
};

module.exports = jwtService;
