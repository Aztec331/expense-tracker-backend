// routes/expenses.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');

//Get all expenses
//@route GET /api/expenses
router.get('/', async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

//@desc Add new expense
//@route POST /api/expenses
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().toDate().withMessage('Valid date required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const expense = new Expense(req.body);
      const saved = await expense.save();
      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }
);

//@desc Delete an expense
//@route DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

//@desc Update an expense
//@route PUT /api/expenses/:id
router.put(
  '/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const expense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!expense) return res.status(404).json({ message: 'Expense not found' });
      res.json(expense);
    } catch (err) {
      next(err);
    }
  }
);

