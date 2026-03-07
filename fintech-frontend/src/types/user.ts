export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | string;
export type UserRole = "ADMIN" | "USER" | string;

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    status: UserStatus;
    role: UserRole;
    createdAt: string;
}

export interface UpdateProfilePayload {
    fullName?: string;
}

export interface SecurityInfo {
    isTwoFactorEnabled: boolean;
}