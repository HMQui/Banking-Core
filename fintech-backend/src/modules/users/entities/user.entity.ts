import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED',
    PENDING = 'PENDING',
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string; //

    // Unique email for authentication
    @Column({ unique: true })
    email!: string; // [cite: 2]

    // Hashed password
    @Column({ name: 'password_hash' })
    passwordHash!: string; // [cite: 2]

    // User's full name
    @Column({ name: 'full_name' })
    fullName!: string; // [cite: 2]

    // Account status, defaults to ACTIVE
    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status!: UserStatus; // [cite: 2]

    // Optional 2FA secret
    @Column({ type: 'varchar', name: 'two_factor_secret', nullable: true })
    twoFactorSecret?: string | null; // [cite: 2, 3]

    // User role, defaults to USER
    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole; // [cite: 2]

    // Auto-generated creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date; // [cite: 3]

    // Auto-updated modification timestamp
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date; // [cite: 3]
}
