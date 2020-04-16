const express = require('express');
const router = express.Router();
const users = require('../services/users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const Validator = require('jsonschema').Validator;
const userSchema = require('../schemas/userSchema.json');

const secretJWTKey = 'mysecret-token-key1243';

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
jwtOptions.secretOrKey = secretJWTKey;

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, done) {

  done(null, jwt_payload.user);
}));

function validateCreateOrModifyUserRequest(req, res, next)
{
  try {
    const v = new Validator();
    const validateResult = v.validate(req.body, userSchema);
    if(validateResult.errors.length > 0) {
      validateResult.errors.status = 400;
      next(validateResult.errors);
    }
  }
  catch(error) {
    error.status = 400;
    next(error);
  }
  next();
}

router.post('', validateCreateOrModifyUserRequest, async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 6);

  try {
    const newUser = await users.createNew({
      username: req.body.username,
      password: hashedPassword
    });

    res.status(201).json({
      userId: newUser.id
    });
  } catch (error) {
    res.status(400).json({
      reason: error
    });
  }
});

router.get('/login', passport.authenticate('basic', { session: false }), async (req, res) => {

  const payload = {
    user : {
      id: req.user.id
    }
  };

  const options = {
    expiresIn: '1m'
  }

  /* Sign the token with payload, key and options.
     Detailed documentation of the signing here:
     https://github.com/auth0/node-jsonwebtoken#readme */
  const token = jwt.sign(payload, secretJWTKey, options);

  return res.json({ jwt: token });
});

router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validateCreateOrModifyUserRequest,
  async (req, res) => {
    try {
      const result = await users.modify({
        id: req.params.id,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 6)
      });

      if(result.changes == 0) {
        res.status(400).json({ reason: "UserId not found" });
      }
      else {
        res.status(200).send();
      }
    } catch (error) {
        res.status(400).json({
        reason: error
      });
    }
});

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await users.getUserById(req.params.id);

      delete user.password; // remove password field

      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }

  return res.json();
});

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const result = await users.deleteById(req.params.id);

      if(result == false) {
        res.status(404).json({ reason: "UserId not found" });
      }
      else {
        res.status(200);
      }

    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
})

module.exports = router;