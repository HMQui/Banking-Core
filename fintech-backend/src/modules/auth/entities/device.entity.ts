import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Session } from './session.entity';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @Column({ name: 'device_name' })
    deviceName!: string;

    @Column({ type: 'varchar', name: 'user_agent', nullable: true })
    userAgent?: string | null;

    @Column({ name: 'public_key_thumbprint', unique: true })
    publicKeyThumbprint!: string;

    @Column({
        name: 'last_active_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    lastActiveAt!: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Session, (session) => session.device)
    sessions!: Session[];
}
