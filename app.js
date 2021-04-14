//
// Copyright (c) 2021 Jeremy Willans
// Licensed under the MIT License
//

const debug = require('debug')('roomos-portal:app');
const express = require('express');
const path = require('path');
const session = require('express-session');
const chalk = require('chalk');

const app = express();

// Import Integration Options
const params = require('./src/utils/params');

if (!params.publicURL) {
  process.stdout.write(`${chalk.red('ERROR: Missing Public URL')}`);
  process.exit(1);
}

app.use(express.static(path.join(__dirname, './src/public/')));
app.use(
  '/js',
  express.static(path.join(__dirname, '/node_modules/jquery/dist')),
);
app.use(
  '/js',
  express.static(path.join(__dirname, '/node_modules/select2/dist/js')),
);
app.use(
  '/css',
  express.static(path.join(__dirname, '/node_modules/select2/dist/css')),
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: params.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000 },
  }),
);

app.set('views', './src/views');
app.set('view engine', 'pug');

const loginRoutes = require('./src/routes/loginRoutes')();
const configRoutes = require('./src/routes/configRoutes')();

app.use('/login', loginRoutes);
app.use('/config', configRoutes);
app.get('/logout', (req, res) => {
  res.redirect('/config/logout/');
});

// Build URL and Display Login Page
app.get('/', (req, res) => {
  if (typeof req.session.personId !== 'undefined') {
    debug('user logged in, redirecting to config page');
    res.redirect('/config');
    return;
  }
  res.render('index', { title: 'Index' });
});

// Starts the App
app.listen(params.port, () => {
  process.stdout.write(
    `${chalk.green(
      `Cisco Webex Integration started on port: ${chalk.blue(
        `${params.port}`,
      )}`,
    )}\n`,
  );
});
