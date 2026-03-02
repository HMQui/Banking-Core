import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    // Primary UUID [cite: 6]
    id!: string;

    @Column({ name: 'device_id' })
    // Foreign key for Device [cite: 6]
    deviceId!: string;

    @Column({ name: 'token_hash', unique: true })
    // Hashed token for security [cite: 6]
    tokenHash!: string;

    @Column({ type: 'varchar', name: 'parent_id', nullable: true })
    // Tracks token chain for Refresh Token Rotation [cite: 6, 7]
    parentId?: string | null;

    @Column({ name: 'is_revoked', default: false })
    // Revocation status [cite: 7]
    isRevoked!: boolean;

    @Column({ name: 'expires_at', type: 'timestamp' })
    // Expiration timestamp [cite: 7]
    expiresAt!: Date;

    @CreateDateColumn({ name: 'created_at' })
    // Auto-generated creation timestamp [cite: 7]
    createdAt!: Date;

    @ManyToOne(() => Device, (device) => device.sessions)
    @JoinColumn({ name: 'device_id' })
    // Many-to-One relation with Device [cite: 7]
    device!: Device;
}
