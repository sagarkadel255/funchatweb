import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../../src/config/multer.config'; // We'll create this

const router = express.Router();
const adminController = new AdminController();

// Apply admin middleware to ALL routes in this router
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', upload.single('profileImage'), adminController.createUser);
router.put('/users/:id', upload.single('profileImage'), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;