const User = require('../models/User');
const Project = require('../models/Project');
const Color = require('../models/Color');

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
};

exports.stats = async (req, res) => {
  const [users, projects, colors] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Color.countDocuments(),
  ]);
  const recent = await Project.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email');
  res.json({ users, projects, colors, recent });
};