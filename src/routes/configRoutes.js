const express = require('express');
const configController = require('../controllers/configController');

const configRoutes = express.Router();

function router() {
  const { getIndex, getLogout, postAjax } = configController();

  configRoutes.route('/').get(getIndex);
  configRoutes.route('/logout').get(getLogout);
  configRoutes.route('/ajax').post(postAjax);

  return configRoutes;
}

module.exports = router;
