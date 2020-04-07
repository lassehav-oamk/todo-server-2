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

function validateCreateUserRequest(req, res, next)
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

router.post('', validateCreateUserRequest, async (req, res) => {

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
})

module.exports = router;