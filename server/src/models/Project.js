const mongoose = require('mongoose');

const wallSchema = new mongoose.Schema(
  {
    polygon: [{ x: Number, y: Number }],
    color: { type: String, required: true },
    opacity: { type: Number, default: 0.6 },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'My Room' },
    originalImageUrl: { type: String, required: true },
    resultImageUrl: { type: String },
    walls: [wallSchema],
    canvasWidth: Number,
    canvasHeight: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);