const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Role routes - Admin only
router.route('/')
  .get(authenticateToken, requireAdmin, roleController.getAllRoles)
  .post(authenticateToken, requireAdmin, roleController.createRole);

router.route('/stats')
  .get(authenticateToken, requireAdmin, roleController.getRoleStats);

router.route('/pagination')
  .get(authenticateToken, requireAdmin, roleController.getRolesWithPagination);

router.route('/:id')
  .get(authenticateToken, requireAdmin, roleController.getRoleById)
  .put(authenticateToken, requireAdmin, roleController.updateRole)
  .delete(authenticateToken, requireAdmin, roleController.deleteRole);

module.exports = router;
