const express = require('express');
const router = express.Router();
const todos = require('../services/todos');
const Validator = require('jsonschema').Validator;
const passportInstance = require('./passportAuthConfig');
const newTodoSchema = require('../schemas/newTodoSchema.json');

function validateNewTodoRequest(req, res, next)
{
  try {
    const v = new Validator();
    const validateResult = v.validate(req.body, newTodoSchema);
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

router.get(
  '',
  passportInstance.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const myTodos = await todos.getTodosByUserId(req.user.id);

      res.status(200).json({
        todos: myTodos
      });
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
});

router.get(
  '/:id',
  passportInstance.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Enforce that user can only query todos owned by him
      const theTodo = await todos.getTodoById(req.params.id, req.user.id);

      if(theTodo === undefined) {
        res.status(404).send();
      }
      else {
        res.status(200).json(theTodo);
      }
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
});

router.post(
  '',
  passportInstance.authenticate('jwt', { session: false }),
  validateNewTodoRequest,
  async (req, res) => {

    try {
      const now = new Date('05 October 2011 14:48 UTC');
      const result = await todos.addNew({
        user: req.user.id,
        description: req.body.description,
        dueDateTime: req.body.dueDateTime,
        createdDateTime: now.toISOString(),
        status: 'open'
      });
      res.status(201).send();
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
});

router.delete(
  '/:id',
  passportInstance.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Enforce that user can only query todos owned by him
      const result = await todos.deleteTodoById(req.params.id, req.user.id);

      res.status(200).send();
    } catch (error) {
      res.status(404).send();
    }
});

module.exports = router;