const Color = require('../models/Color');

exports.listColors = async (req, res) => {
  const colors = await Color.find().sort({ category: 1, name: 1 });
  res.json(colors);
};

exports.createColor = async (req, res) => {
  try {
    const color = await Color.create(req.body);
    res.status(201).json(color);
  } catch (err) {
    res.status(400).json({ message: 'Colour add nahi hua. Naam aur sahi HEX (#RRGGBB) daalo.' });
  }
};

exports.updateColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!color) return res.status(404).json({ message: 'Colour nahi mila' });
    res.json(color);
  } catch (err) {
    res.status(400).json({ message: 'Update nahi hua' });
  }
};

exports.deleteColor = async (req, res) => {
  const color = await Color.findByIdAndDelete(req.params.id);
  if (!color) return res.status(404).json({ message: 'Colour nahi mila' });
  res.json({ message: 'Delete ho gaya' });
};