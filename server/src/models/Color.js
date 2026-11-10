const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
    category: { type: String, default: 'Neutrals' },
    brand: { type: String, default: '' },
    finishOptions: { type: [String], default: ['matte'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Color', colorSchema);