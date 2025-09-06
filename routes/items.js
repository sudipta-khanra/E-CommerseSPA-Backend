const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// @desc Get all items with filters
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice } = req.query;
        const filter = {};

        // Category filter (case-insensitive)
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        // Price filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const items = await Item.find(filter);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc Create new item
router.post('/', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Update item by id
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns the updated document
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @desc Delete item by id
router.delete('/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
