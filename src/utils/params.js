const debug = require('debug')('roomos-portal:params');
const dotenv = require('dotenv');

// Load ENV File from Config Directory
try {
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config(`${__dirname}/../../.env`);
  }
} catch (error) {
  debug(`error: ${error}`);
}

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const publicURL = process.env.PUBLIC_URL;
const redirectURI = process.env.REDIRECT_URI || `${publicURL}/login/callback`;
const port = process.env.PORT || 3000;
const state = process.env.SESSION_SECRET || 'please-change-me-to-a-session-secret';
const sessionSecret = process.env.STATE_SECRET || 'please-change-me-to-a-state-secret';
const scopes = 'spark:people_read spark:xapi_statuses spark:xapi_commands spark-admin:devices_read spark-admin:devices_write spark-admin:places_read spark-admin:places_write';
const initiateURL = `https://webexapis.com/v1/authorize?&client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
  redirectURI,
)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

module.exports = {
  clientId,
  clientSecret,
  port,
  redirectURI,
  state,
  scopes,
  initiateURL,
  publicURL,
  sessionSecret,
};
