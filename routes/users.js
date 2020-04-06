const express = require('express');
const router = express.Router();
const users = require('../services/users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

function validateCreateUserRequest(req, res, next)
{
  try {
    const result = users.validateAgainstSchema(req.body);
    if(result.errors.length > 0)
    {
      result.errors.status = 400;
      next(result.errors);
    }
  }
  catch(error) {
    result.errors.status = 400;
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
    console.log(error);
  }



})

module.exports = router;