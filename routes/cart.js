const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middleware/authMiddleware.js");

// Get cart for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user }).populate("items.item");

    if (!cart) {
      cart = new Cart({ user: req.user, items: [] });
      await cart.save();
    }

    // Filter out deleted or invalid products
    cart.items = cart.items.filter(i => i.item !== null);

    res.json({ items: cart.items });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add item to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      cart = new Cart({ user: req.user, items: [] });
    }

    const itemIndex = cart.items.findIndex(i => i.item.toString() === itemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ item: itemId, quantity: 1 });
    }

    await cart.save();
    await cart.populate("items.item");
    // Filter invalid items before sending
    const validItems = cart.items.filter(i => i.item !== null);
    res.json({ items: validItems });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Remove item from cart
router.post("/remove", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      return res.status(400).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(i => i.item?.toString() !== itemId);

    await cart.save();
    await cart.populate("items.item");
    const validItems = cart.items.filter(i => i.item !== null);
    res.json({ items: validItems });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
