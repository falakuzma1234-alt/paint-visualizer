const router = require('express').Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createProject, listProjects, getProject, updateProject, deleteProject,
} = require('../controllers/projectController');

router.use(protect);

const files = upload.fields([
  { name: 'original', maxCount: 1 },
  { name: 'result', maxCount: 1 },
]);

router.post('/', files, createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', files, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;