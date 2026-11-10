const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { listUsers, stats } = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/users', listUsers);
router.get('/stats', stats);

module.exports = router;