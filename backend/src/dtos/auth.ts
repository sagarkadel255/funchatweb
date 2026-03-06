export class LoginDTO {
  email!: string;
  password!: string;
}

export class RegisterDTO {
  username!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;
}

export class RefreshTokenDTO {
  refreshToken!: string;
}

export class ForgotPasswordDTO {
  email!: string;
}

export class ResetPasswordDTO {
  token!: string;
  password!: string;
  confirmPassword!: string;
}

export class ChangePasswordDTO {
  currentPassword!: string;
  newPassword!: string;
  confirmPassword!: string;
}

export class UpdateProfileDTO {
  username?: string;
  email?: string;
  bio?: string;
  phone?: string;
}

export class UpdateProfileImageDTO {
  profileImage!: string;
}