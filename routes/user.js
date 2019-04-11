const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const request = require('request');
const jwtDecode = require('jwt-decode');
const _ = require('lodash');

let apiData;

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {

  const decodedIDToken = jwtDecode(req.user.tokens.idToken);
  const decodedAccessToken = jwtDecode(req.user.tokens.accessToken);

  res.render('user', {
    user: req.user,
    decodedIDToken,
    decodedAccessToken,
    title: 'Authorization Demo'
  });
});

router.get('/refresh', ensureLoggedIn, function(req, res, next) {
  // get refresh token
  getRefreshToken(req, function (error, response, body) {
    req.user.tokens.idToken = body.id_token;
    req.user.tokens.accessToken = body.access_token;
    return res.redirect('/user');
  });
});

function getRefreshToken(req, cb) {

  // get refresh token
  var options = { method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: { 
      grant_type: 'refresh_token',
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      refresh_token: req.user.tokens.refreshToken,
      redirect_uri: `${process.env.AUTH0_CALLBACK_URL}`,
      scope: `${process.env.SCOPES}`
    }, 
    json: true 
  };

  return request(options, cb);
}

module.exports = router;
