const Project = require('../models/Project');
const { cloudinary } = require('../middleware/upload');

const urlOf = (f) => f.path; // full Cloudinary URL

// URL se public_id nikalo (delete ke liye)
const publicIdOf = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
};

const removeImage = (url) => {
  const id = publicIdOf(url);
  if (id) cloudinary.uploader.destroy(id).catch(() => {});
};

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
    res.status(500).json({ message: 'Could not save', error: err.message });
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

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const result = req.files?.result?.[0];

    if (req.body.walls) project.walls = JSON.parse(req.body.walls);
    if (req.body.title) project.title = req.body.title;

    if (result) {
      removeImage(project.resultImageUrl);
      project.resultImageUrl = urlOf(result);
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Could not update', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });

  removeImage(project.originalImageUrl);
  removeImage(project.resultImageUrl);

  res.json({ message: 'Deleted successfully' });
};