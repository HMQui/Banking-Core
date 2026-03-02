import { Exclude, Expose } from 'class-transformer';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UserProfileResponseDto {
    @Expose()
    // Primary UUID
    id!: string;

    @Expose()
    // Unique email for authentication
    email!: string;

    @Expose()
    // User's full name
    fullName!: string;

    @Expose()
    // Account status
    status!: UserStatus;

    @Expose()
    // Role-based access control (e.g., 'user', 'admin')
    role!: UserRole;

    @Expose()
    // Auto-generated creation timestamp
    createdAt!: Date;

    @Exclude()
    // Explicitly exclude hashed password from response serialization
    passwordHash!: string;

    @Exclude()
    // Explicitly exclude 2FA secret from response serialization
    twoFactorSecret?: string | null;
}
