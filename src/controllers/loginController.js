const debug = require('debug')('roomos-portal:loginController');
const webexService = require('../services/webexService');
const params = require('../utils/params');

function loginController() {
  async function getCallback(req, res) {
    debug('login callback initiate');

    // Process Authoriation Codes
    if (req.query.error) {
      if (req.query.error === 'access_denied') {
        debug(`user declined, received err: ${req.query.error}`);
        const errorText = 'Access has been denied.';
        res.render('error', { title: 'Error', errorText });
        return;
      }

      if (req.query.error === 'invalid_scope') {
        debug(`wrong scope requested, received err: ${req.query.error}`);
        const errorText = 'The application is requesting an invalid scope.';
        res.render('error', { title: 'Error', errorText });
        return;
      }

      if (req.query.error === 'server_error') {
        debug(`server error, received err: ${req.query.error}`);
        const errorText = 'Cisco Webex sent a Server Error.';
        res.render('error', { title: 'Error', errorText });
        return;
      }

      debug(`received err: ${req.query.error}`);
      const errorText = 'An Error has occurred.';
      res.render('error', { title: 'Error', errorText });
      return;
    }

    // Check request parameters correspond to the spec
    if ((!req.query.code) || (!req.query.state)) {
      debug('expected code & state query parameters are not present');
      res.redirect('/');
      return;
    }

    // Check State
    // [NOTE] we implement a Security check below,
    if (params.state !== req.query.state) {
      debug('State does not match');
      const errorText = 'Invalid Intergration Secret.';
      res.render('error', { title: 'Error', errorText });
      return;
    }

    let accessCodes;
    try {
      // Retreive access token (expires in 14 days) & refresh token (expires in 90 days)
      accessCodes = await webexService.postTokens(req.query.code);

      // Retrieve User Data
      const person = await webexService.getField(accessCodes.access_token, 'people/me');

      // Set Session Data
      req.session.personId = person.id;
      req.session.displayName = person.displayName;
      req.session.access_token = accessCodes.access_token;
      req.session.person = person;

      // Redirect to Configuration Page
      res.redirect('/config');
    } catch (error) {
      debug(error);
      const errorText = 'Could not retrieve your access token.';
      res.render('error', { title: 'Error', errorText });
    }
  }

  async function getIndex(req, res) {
    debug('login index initiate');

    // Append Email is defined
    let { initiateURL } = params;
    if (req.query.email) {
      initiateURL += `&email=${req.query.email}`;
    }
    // Send to Webex for Authentication
    res.redirect(initiateURL);
  }

  return {
    getIndex,
    getCallback,
  };
}

module.exports = loginController;
