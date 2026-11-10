const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { listColors, createColor, updateColor, deleteColor } = require('../controllers/colorController');

router.get('/', listColors);

router.post('/', protect, adminOnly, createColor);
router.put('/:id', protect, adminOnly, updateColor);
router.delete('/:id', protect, adminOnly, deleteColor);

module.exports = router;