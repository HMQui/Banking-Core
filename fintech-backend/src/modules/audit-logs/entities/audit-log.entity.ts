import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId!: string | null;

    // The action performed by the user or system
    @Column()
    action!: string;

    @Column({ nullable: true, type: 'text' })
    resource!: string | null;

    // Previous state of the entity before the action
    @Column({ name: 'old_value', type: 'jsonb', nullable: true })
    oldValue!: Record<string, unknown> | null;

    @Column({ name: 'new_value', type: 'jsonb', nullable: true })
    newValue!: Record<string, unknown> | null;

    // IP address of the requester
    @Column({ name: 'ip_address', nullable: true, type: 'varchar', length: 45 })
    ipAddress!: string | null;

    @Column({ name: 'user_agent', nullable: true, type: 'text' })
    userAgent!: string | null;

    // Auto-generated creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User | null;
}
