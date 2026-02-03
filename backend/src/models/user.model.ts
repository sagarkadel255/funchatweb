import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim: true
        },
        password: { 
            type: String, 
            required: true 
        },
        username: { 
            type: String, 
            required: true, 
            unique: true,
            trim: true
        },
        firstName: { 
            type: String, 
            default: '' 
        },
        lastName: { 
            type: String, 
            default: '' 
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        profileImage: {  // Add this field
            type: String,
            default: ''
        }
    },
    {
        timestamps: true, 
    }
);

export interface IUser extends UserType, Document { 
    _id: mongoose.Types.ObjectId; 
    updatedAt: Date;
    createdAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);