const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const auth = require("../middleware/authMiddleware");

// ✅ Get all items for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = { user: req.user }; // only current user's items

    if (category) filter.category = { $regex: category, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(filter);

    // 🔥 Ensure response is always an array
    res.json(Array.isArray(items) ? items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", items: [] }); // send empty array on error
  }
});

// ✅ Add new item (link to logged-in user)
router.post("/", auth, async (req, res) => {
  try {
    const newItem = new Item({ ...req.body, user: req.user });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update item (only by owner)
router.put("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.user.toString() !== req.user)
      return res.status(403).json({ message: "Not authorized" });

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete item (only by owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.user.toString() !== req.user)
      return res.status(403).json({ message: "Not authorized" });

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
