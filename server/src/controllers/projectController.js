const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');

const urlOf = (f) => `/uploads/${f.filename}`;

exports.createProject = async (req, res) => {
  try {
    const original = req.files?.original?.[0];
    const result = req.files?.result?.[0];
    if (!original) return res.status(400).json({ message: 'Original image is required' });

    const walls = JSON.parse(req.body.walls || '[]');

    const project = await Project.create({
      userId: req.user._id,
      title: req.body.title || 'My Room',
      originalImageUrl: urlOf(original),
      resultImageUrl: result ? urlOf(result) : undefined,
      walls,
      canvasWidth: Number(req.body.canvasWidth) || undefined,
      canvasHeight: Number(req.body.canvasHeight) || undefined,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
};

exports.listProjects = async (req, res) => {
  const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(projects);
};

exports.getProject = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

exports.deleteProject = async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });

  [project.originalImageUrl, project.resultImageUrl].forEach((u) => {
    if (u) fs.unlink(path.join(__dirname, '../../', u), () => {});
  });

  res.json({ message: 'Project deleted' });
};

// Project update (walls + naya result image)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const result = req.files?.result?.[0];

    if (req.body.walls) project.walls = JSON.parse(req.body.walls);
    if (req.body.title) project.title = req.body.title;

    // naya result aaya to purana file hata do
    if (result) {
      if (project.resultImageUrl) {
        fs.unlink(path.join(__dirname, '../../', project.resultImageUrl), () => {});
      }
      project.resultImageUrl = urlOf(result);
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
};