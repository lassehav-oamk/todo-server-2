const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../services/users');
const passportInstance = require('./passportAuthConfig');

const Validator = require('jsonschema').Validator;
const userSchema = require('../schemas/userSchema.json');
const secretJWT = require('../jwtKey.json');



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

router.get('/login', passportInstance.authenticate('basic', { session: false }), async (req, res) => {

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
  const token = jwt.sign(payload, secretJWT.key, options);

  return res.json({ jwt: token });
});

router.put(
  '/:id',
  passportInstance.authenticate('jwt', { session: false }),
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
  passportInstance.authenticate('jwt', { session: false }),
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
  passportInstance.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const result = await users.deleteById(req.params.id);

      if(result == false) {
        res.status(404).json({ reason: "UserId not found" });
      }
      else {
        res.status(200).send();
      }

    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
})

module.exports = router;