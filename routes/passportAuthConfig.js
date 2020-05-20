const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const users = require('../services/users');

const secretJWT = require('../jwtKey.json');

passport.use(new BasicStrategy(
  async function(username, password, done) {

    try {
      const user = await users.getUserByName(username);
      if(user == undefined) {
        // Username not found
        return done(null, false);
      }

      /* Verify password match */
      if(bcrypt.compareSync(password, user.password) == false) {
        // Password does not match
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(null, false);
    }
  }
));

let jwtOptions = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
jwtOptions.secretOrKey = secretJWT.key;

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, done) {

  done(null, jwt_payload.user);
}));

module.exports = passport;