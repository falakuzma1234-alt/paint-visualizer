require('dotenv').config();
const mongoose = require('mongoose');
const Color = require('./models/Color');

const colors = [
  { name: 'Ocean Breeze Blue', hex: '#6FA8DC', category: 'Blues' },
  { name: 'Sky Blue', hex: '#87CEEB', category: 'Blues' },
  { name: 'Navy Night', hex: '#2C3E63', category: 'Blues' },
  { name: 'Powder Blue', hex: '#B0D4E3', category: 'Blues' },
  { name: 'Teal Lagoon', hex: '#3C8D93', category: 'Blues' },
  { name: 'Sage Green', hex: '#9CAF88', category: 'Greens' },
  { name: 'Mint Fresh', hex: '#A8E0C5', category: 'Greens' },
  { name: 'Olive Grove', hex: '#808B4E', category: 'Greens' },
  { name: 'Forest Green', hex: '#3E6B48', category: 'Greens' },
  { name: 'Pistachio', hex: '#C3D9A5', category: 'Greens' },
  { name: 'Warm Sand', hex: '#E6CFA3', category: 'Neutrals' },
  { name: 'Ivory White', hex: '#F5F0E1', category: 'Neutrals' },
  { name: 'Light Grey', hex: '#D3D3D3', category: 'Neutrals' },
  { name: 'Charcoal', hex: '#5A5A5A', category: 'Neutrals' },
  { name: 'Mocha Brown', hex: '#A47551', category: 'Neutrals' },
  { name: 'Beige Cream', hex: '#EAD9C0', category: 'Neutrals' },
  { name: 'Blush Pink', hex: '#F4C2C2', category: 'Pinks & Reds' },
  { name: 'Rose Petal', hex: '#E8A0B4', category: 'Pinks & Reds' },
  { name: 'Terracotta', hex: '#E2725B', category: 'Pinks & Reds' },
  { name: 'Brick Red', hex: '#A5432F', category: 'Pinks & Reds' },
  { name: 'Coral', hex: '#FF7F6E', category: 'Pinks & Reds' },
  { name: 'Lavender', hex: '#C8B6E2', category: 'Purples' },
  { name: 'Lilac Mist', hex: '#D8C7E8', category: 'Purples' },
  { name: 'Plum', hex: '#7B4B7F', category: 'Purples' },
  { name: 'Sunshine Yellow', hex: '#F7DC6F', category: 'Yellows & Oranges' },
  { name: 'Butter Cream', hex: '#FFF1B5', category: 'Yellows & Oranges' },
  { name: 'Peach', hex: '#FFCBA4', category: 'Yellows & Oranges' },
  { name: 'Burnt Orange', hex: '#D2691E', category: 'Yellows & Oranges' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Color.deleteMany({});
  await Color.insertMany(colors);
  console.log(`${colors.length} colors seeded successfully.`);
  process.exit(0);
})();