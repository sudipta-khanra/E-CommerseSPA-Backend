const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { auth } = require("../middleware/authMiddleware"); 

router.get("/", auth, async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = { user: req.user.id };

    if (category && category.trim() !== "") {
      filter.category = { $regex: category, $options: "i" };
    }

    if ((minPrice && !isNaN(minPrice)) || (maxPrice && !isNaN(maxPrice))) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(filter);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    const newItem = new Item({ ...req.body, user: req.user.id });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
