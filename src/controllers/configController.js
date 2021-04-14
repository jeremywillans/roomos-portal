const debug = require('debug')('roomos-portal:configController');
const webexService = require('../services/webexService');
const params = require('../utils/params');

function configController() {
  async function getIndex(req, res) {
    debug('config get initiate');

    if (typeof req.session.personId === 'undefined') {
      debug('no session data, redirecting...');

      // If email appended, send to login directly
      if (req.query.email) {
        let { initiateURL } = params;
        initiateURL += `&email=${req.query.email}`;
        res.redirect(initiateURL);
        return;
      }
      res.redirect('/');
      return;
    }

    try {
      const devices = await webexService.getField(
        req.session.access_token,
        'devices',
      );

      if (devices.items.length < 1) {
        const errorText = 'No devices could be found!';
        res.render('error', { title: 'Error', errorText });
        return;
      }

      let device;
      if (req.query.deviceId) {
        // eslint-disable-next-line prefer-destructuring
        device = devices.items.filter(
          (item) => item.id === req.query.deviceId,
        )[0];
      } else {
        // eslint-disable-next-line prefer-destructuring
        device = devices.items[0];
      }

      let output;

      // Get SpeakerTrack/Best Overview Status
      output = await webexService.getField(
        req.session.access_token,
        `xapi/status?deviceId=${device.id}&name=Cameras.SpeakerTrack.Status`,
      );

      device.speakerTrack = output.result.Cameras.SpeakerTrack.Status;

      if (device.speakerTrack !== 'Active') {
        device.ptz = true;
      }

      // Get System State
      output = await webexService.getField(
        req.session.access_token,
        `xapi/status?deviceId=${device.id}&name=SystemUnit.State.*`,
      );

      // Determine Call Status
      if (output.result.SystemUnit.State.NumberOfActiveCalls > 0) {
        device.callstatus = 'In Call';
        device.incall = true;
      } else if (output.result.SystemUnit.State.NumberOfInProgressCalls > 0) {
        device.callstatus = 'Pending Call';
        device.incall = true;
      } else {
        device.callstatus = 'Idle';
      }

      if (device.incall) {
        // Get Call Data
        output = await webexService.getField(
          req.session.access_token,
          `xapi/status?deviceId=${device.id}&name=Call[*].*`,
        );

        // Update Call Info in Device Object
        switch (output.result.Call.length) {
          case 0:
            debug('not in call');
            break;
          case 1:
            debug('single call');
            device.callnumber = output.result.Call[0].CallbackNumber;
            device.calldisplay = output.result.Call[0].DisplayName;
            break;
          default:
            debug('multiple calls');
            device.callnumber = 'Multiple';
            device.calldisplay = 'Multiple';
        }
      }

      // Get SelfView Status
      /* output = await webexService.getField(
        req.session.access_token,
        `xapi/status?deviceId=${device.id}&name=Video.SelfView.*`,
      ); */

      // debug(output.result);

      // Determine Device Status
      switch (device.connectionStatus) {
        case 'connected':
        case 'connected_with_issues':
          device.status = 'Online';
          device.online = true;
          break;
        default:
          device.status = 'Offline';
          device.online = false;
      }

      // Render Config Page
      res.render('config', {
        title: 'Config',
        person: req.session.person,
        devices: devices.items,
        device,
      });
    } catch (error) {
      debug(`error encountered: ${error}`);
    }
  }

  async function getLogout(req, res) {
    debug('config logout initiate');

    // construct return url
    // const logoutURL = 'https://idbroker.webex.com/idb/oauth2/v1/logout';

    // perform logout
    req.session.destroy();
    res.redirect('/');
  }

  async function postAjax(req, res) {
    debug('config ajax initiate');
    if (!req.body.deviceId) {
      debug('missing device id, aborting');
      return;
    }
    if (!req.session.access_token) {
      debug('missing access_token, aborting');
      res.status(404).json({});
      return;
    }
    res.status(200).json({});

    if (req.body.command === 'Release') {
      try {
        await webexService.postxAPI(
          req.session.access_token,
          'Camera.Ramp',
          req.body.deviceId,
          '{ "CameraId": 1, "Tilt": "Stop", "Pan": "Stop", "Zoom": "Stop" }',
        );
      } catch (error) {
        debug(error);
      }
      return;
    }

    // Format Command for Webex API
    const command = req.body.id[0].toUpperCase() + req.body.id.substring(1);

    switch (req.body.id) {
      case 'left':
      case 'right':
        try {
          debug(`attempt pan ${command}`);
          await webexService.postxAPI(
            req.session.access_token,
            'Camera.Ramp',
            req.body.deviceId,
            `{ "CameraId": 1, "Pan": "${command}" }`,
          );
        } catch (error) {
          debug(error);
        }
        break;
      case 'up':
      case 'down':
        try {
          debug(`attempt tilt ${command}`);
          await webexService.postxAPI(
            req.session.access_token,
            'Camera.Ramp',
            req.body.deviceId,
            `{ "CameraId": 1, "Tilt": "${command}" }`,
          );
        } catch (error) {
          debug(error);
        }
        break;
      case 'zoomin':
        try {
          debug(`attempt ${command}`);
          await webexService.postxAPI(
            req.session.access_token,
            'Camera.Ramp',
            req.body.deviceId,
            '{ "CameraId": 1, "Zoom": "In" }',
          );
        } catch (error) {
          debug(error);
        }
        break;
      case 'zoomout':
        try {
          debug(`attempt ${command}`);
          await webexService.postxAPI(
            req.session.access_token,
            'Camera.Ramp',
            req.body.deviceId,
            '{ "CameraId": 1, "Zoom": "Out" }',
          );
        } catch (error) {
          debug(error);
        }
        break;
      case 'Dial':
        try {
          debug(`attempt ${req.body.id}`);
          if (!req.body.uri) {
            debug('no dial string, aborting');
            return;
          }
          const response = await webexService.postxAPI(
            req.session.access_token,
            'dial',
            req.body.deviceId,
            `{ "Number": "${req.body.uri}" }`,
          );
          debug(response);
        } catch (error) {
          debug(error);
        }
        break;
      case 'End':
        try {
          debug(`attempt ${req.body.id}`);
          await webexService.postxAPI(
            req.session.access_token,
            'call.disconnect',
            req.body.deviceId,
            '{}',
          );
        } catch (error) {
          debug(error);
        }
        break;
      case 'TrackToggle':
        try {
          debug(`attempt ${req.body.id}`);
          debug(req.body.state);
          if (req.body.state === 'ActiveToggle') {
            await webexService.postxAPI(
              req.session.access_token,
              'Cameras.SpeakerTrack.Deactivate',
              req.body.deviceId,
              '{}',
            );
          } else {
            await webexService.postxAPI(
              req.session.access_token,
              'Cameras.SpeakerTrack.Activate',
              req.body.deviceId,
              '{}',
            );
          }
        } catch (error) {
          debug(error);
        }
        break;
      default:
        debug(`unknown selection: ${req.body.id}`);
    }
  }

  return {
    getIndex,
    getLogout,
    postAjax,
  };
}

module.exports = configController;
