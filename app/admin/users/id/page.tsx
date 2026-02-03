"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { getUser, deleteUser } from "../../../../lib/api/admin";

interface UserDetail {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  lastLogin?: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const result = await getUser(userId);
      
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setErrorMessage(result.message || "Failed to load user data");
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      setErrorMessage(error.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        setSuccessMessage("User deleted successfully!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 1500);
      } else {
        setErrorMessage(result.message || "Failed to delete user");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">User Not Found</h2>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/users"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                <p className="text-gray-600 mt-2">
                  View and manage user information
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/users/${userId}/edit`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70 transition"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete User
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>
            
            {/* Profile Info */}
            <div className="px-6 pb-6 -mt-16">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">
                        {getInitials(user.firstName, user.lastName)}
                      </span>
                    </div>
                  )}
                  
                  {/* Role Badge */}
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? (
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </div>
                    ) : (
                      'User'
                    )}
                  </div>
                </div>
              </div>

              {/* User Name */}
              <div className="text-center mt-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500">@{user.username}</p>
              </div>

              {/* Status */}
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className={`flex items-center px-3 py-1 rounded-full ${
                    user.isActive === false 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isActive === false ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Comments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Joined</div>
                  <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-sm text-gray-900">{getTimeAgo(user.updatedAt)}</div>
                </div>
              </div>
              
              {user.lastLogin && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Last Login</div>
                    <div className="text-sm text-gray-900">{getTimeAgo(user.lastLogin)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    First Name
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user.firstName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Last Name
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user.lastName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Username
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">@{user.username}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-gray-900 break-all">
                      {user._id}
                    </code>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Shield className={`h-4 w-4 mr-2 ${
                      user.role === 'admin' ? 'text-purple-500' : 'text-green-500'
                    }`} />
                    <span className={`font-medium ${
                      user.role === 'admin' ? 'text-purple-700' : 'text-green-700'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          {user.profileImage && (
            <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Profile Image</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-64 w-64 rounded-lg object-cover shadow-lg"
                  />
                  <div className="mt-4 text-sm text-gray-500">
                    Current profile picture
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow overflow-hidden border border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
              <p className="text-sm text-red-600 mt-1">
                These actions are irreversible. Please proceed with caution.
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Delete User Account</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Permanently delete this user's account and all associated data.
                    </p>
                  </div>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-70 transition"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Deactivate Account</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Temporarily disable this user's account.
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
                  >
                    {user.isActive === false ? "Reactivate" : "Deactivate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}