const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { auth } = require("../middleware/authMiddleware.js");

router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.item");

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    cart.items = cart.items.filter((i) => i.item !== null);

    res.json({ items: cart.items });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.item");

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const index = cart.items.findIndex(
      (i) => i.item?._id.toString() === itemId
    );
    if (index > -1) {
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ item: itemId, quantity: 1 });
    }

    await cart.save();
    await cart.populate("items.item");

    const validItems = cart.items.filter((i) => i.item !== null);
    const totalPrice = validItems.reduce(
      (sum, i) => sum + (i.item.price || 0) * i.quantity,
      0
    );

    res.json({ items: validItems, totalPrice });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.item");

    if (!cart) return res.status(400).json({ msg: "Cart not found" });

    cart.items = cart.items.filter((i) => i.item?._id.toString() !== itemId);

    await cart.save();
    const validItems = cart.items.filter((i) => i.item !== null);
    const totalPrice = validItems.reduce(
      (sum, i) => sum + (i.item.price || 0) * i.quantity,
      0
    );

    res.json({ items: validItems, totalPrice });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
