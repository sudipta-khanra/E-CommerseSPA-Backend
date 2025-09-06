const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const Item = require('../models/Item');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};

// Get cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user }).populate('items.item');
        if (!cart) cart = new Cart({ user: req.user, items: [] });
        res.json(cart);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Add to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        let cart = await Cart.findOne({ user: req.user });
        if (!cart) cart = new Cart({ user: req.user, items: [] });

        const itemIndex = cart.items.findIndex(i => i.item.toString() === itemId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1;
        } else {
            cart.items.push({ item: itemId, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Remove from cart
router.post('/remove', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        let cart = await Cart.findOne({ user: req.user });
        if (!cart) return res.status(400).json({ msg: 'Cart not found' });

        cart.items = cart.items.filter(i => i.item.toString() !== itemId);
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
