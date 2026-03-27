const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/menu - Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/menu/:id - Get single menu item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/menu - Create menu item (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/menu/:id - Update menu item (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/menu/:id - Delete menu item (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/menu/seed - Seed initial menu data
router.post('/seed/init', async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    const menuItems = [
      { name: 'Signature Espresso', description: 'Bold single-origin espresso with notes of dark chocolate and caramel', price: 3.50, category: 'espresso', isPopular: true, tags: ['strong', 'bold'] },
      { name: 'Oat Milk Latte', description: 'Velvety espresso with steamed oat milk, a customer favourite', price: 5.00, category: 'espresso', isPopular: true, tags: ['vegan', 'creamy'] },
      { name: 'Honey Lavender Cappuccino', description: 'Double shot cappuccino with house lavender honey syrup', price: 5.50, category: 'espresso', tags: ['floral', 'sweet'] },
      { name: 'Cold Brew Classic', description: '24-hour steeped cold brew, served over ice, smooth and rich', price: 4.50, category: 'cold-brew', isPopular: true, tags: ['cold', 'smooth'] },
      { name: 'Nitro Cold Brew', description: 'Nitrogen-infused cold brew, silky and creamy without any dairy', price: 5.50, category: 'cold-brew', tags: ['nitro', 'vegan'] },
      { name: 'Cascara Cold Brew', description: 'Cold brew blended with cascara syrup for a fruity twist', price: 6.00, category: 'cold-brew', tags: ['fruity', 'unique'] },
      { name: 'Masala Chai', description: 'House-spiced chai blend with ginger, cardamom and cinnamon', price: 4.00, category: 'tea', isPopular: true, tags: ['spicy', 'warming'] },
      { name: 'Matcha Latte', description: 'Ceremonial-grade matcha whisked with steamed oat milk', price: 5.00, category: 'tea', tags: ['vegan', 'antioxidants'] },
      { name: 'Almond Croissant', description: 'Buttery croissant filled with frangipane, topped with flaked almonds', price: 4.50, category: 'pastry', isPopular: true, tags: ['buttery', 'nutty'] },
      { name: 'Cardamom Kouign-Amann', description: 'Caramelised pastry with cardamom sugar and flaky layers', price: 5.00, category: 'pastry', tags: ['caramel', 'flaky'] },
      { name: 'Avocado Toast', description: 'Sourdough with smashed avocado, poached egg, chilli flakes, micro herbs', price: 9.50, category: 'breakfast', isPopular: true, tags: ['healthy', 'filling'] },
      { name: 'Shakshuka', description: 'Eggs poached in spiced tomato sauce with feta and toasted sourdough', price: 11.00, category: 'breakfast', tags: ['hearty', 'spicy'] },
      { name: 'Grain Bowl', description: 'Farro, roasted vegetables, halloumi, tahini dressing and pomegranate', price: 13.00, category: 'lunch', tags: ['healthy', 'vegetarian'] },
      { name: 'Smoked Salmon Sandwich', description: 'House-cured salmon, cream cheese, capers on rye', price: 12.00, category: 'lunch', tags: ['classic', 'light'] },
      { name: 'Pumpkin Spice Latte', description: 'Seasonal favourite with real pumpkin, spices and oat milk', price: 6.00, category: 'seasonal', isPopular: true, tags: ['seasonal', 'autumn'] },
    ];
    const created = await MenuItem.insertMany(menuItems);
    res.status(201).json({ success: true, message: `${created.length} menu items seeded`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
