import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { 
    AdminCreateUserSchema, 
    AdminUpdateUserSchema,
    type AdminCreateUserType,
    type AdminUpdateUserType 
} from '../types/user.type';

export class AdminController {
    /**
     * Get all users (paginated)
     * GET /api/admin/users
     */
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const search = req.query.search as string || '';
            const filter: any = {};
            
            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await UserModel.find(filter)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await UserModel.countDocuments(filter);

            res.json({
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error fetching users' 
            });
        }
    }

    /**
     * Get single user by ID
     * GET /api/admin/users/:id
     */
    async getUserById(req: Request, res: Response) {
        try {
            const user = await UserModel.findById(req.params.id).select('-password');
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error fetching user' 
            });
        }
    }

    /**
     * Create new user (admin only)
     * POST /api/admin/users
     * With FormData including optional image
     */
    async createUser(req: Request, res: Response) {
        try {
            // Prepare data for validation
            const userData: AdminCreateUserType = {
                ...req.body,
                profileImage: req.file ? `/uploads/${req.file.filename}` : ''
            };

            // Validate input
            const validationResult = AdminCreateUserSchema.safeParse(userData);
            
            if (!validationResult.success) {
                const errors = validationResult.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({ 
                    success: false, 
                    message: 'Validation failed',
                    errors 
                });
            }

            const { email, password, username, firstName, lastName, role, profileImage } = validationResult.data;

            // Check if user exists
            const existingUser = await UserModel.findOne({ 
                $or: [{ email }, { username }] 
            });
            
            if (existingUser) {
                const field = existingUser.email === email ? 'email' : 'username';
                return res.status(400).json({ 
                    success: false, 
                    message: `User with this ${field} already exists` 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = new UserModel({
                email,
                password: hashedPassword,
                username,
                firstName: firstName || '',
                lastName: lastName || '',
                role: role || 'user',
                profileImage: profileImage || ''
            });

            await user.save();

            // Return user without password
            const userResponse = user.toObject();
            (userResponse as any).password = undefined;

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: userResponse
            });
        } catch (error: any) {
            console.error('Create user error:', error);
            
            if (error.code === 11000) { // MongoDB duplicate key error
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate email or username'
                });
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Server error creating user' 
            });
        }
    }

    /**
     * Update user (admin only)
     * PUT /api/admin/users/:id
     * With optional FormData image
     */
    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            
            // Prepare update data
            const updateData: AdminUpdateUserType = {
                ...req.body
            };

            // Add profile image if uploaded
            if (req.file) {
                updateData.profileImage = `/uploads/${req.file.filename}`;
            }

            // Validate input (partial validation)
            const validationResult = AdminUpdateUserSchema.partial().safeParse(updateData);
            
            if (!validationResult.success) {
                const errors = validationResult.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({ 
                    success: false, 
                    message: 'Validation failed',
                    errors 
                });
            }

            const validatedData = validationResult.data;

            // Check if user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            // Check for duplicate email/username
            if (validatedData.email && validatedData.email !== user.email) {
                const existingEmail = await UserModel.findOne({ 
                    email: validatedData.email,
                    _id: { $ne: userId } // Exclude current user
                });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use by another user'
                    });
                }
            }

            if (validatedData.username && validatedData.username !== user.username) {
                const existingUsername = await UserModel.findOne({ 
                    username: validatedData.username,
                    _id: { $ne: userId } // Exclude current user
                });
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already in use by another user'
                    });
                }
            }

            // Prepare updates
            const updates: any = { ...validatedData };

            // Handle password update
            if (validatedData.password) {
                updates.password = await bcrypt.hash(validatedData.password, 10);
            }

            // Update user
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error: any) {
            console.error('Update user error:', error);
            
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate email or username'
                });
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Server error updating user' 
            });
        }
    }

    /**
     * Delete user
     * DELETE /api/admin/users/:id
     */
    async deleteUser(req: Request, res: Response) {
        try {
            const user = await UserModel.findByIdAndDelete(req.params.id);
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error deleting user' 
            });
        }
    }
}