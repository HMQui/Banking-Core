import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('beneficiaries')
export class Beneficiary {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Foreign key for User
    @Column({ name: 'user_id' })
    userId!: string;

    // Nickname for the beneficiary
    @Column()
    nickname!: string;

    // Beneficiary's account number
    @Column({ name: 'account_number' })
    accountNumber!: string;

    // Beneficiary's bank name
    @Column({ name: 'bank_name' })
    bankName!: string;

    // Auto-generated creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    // Auto-updated modification timestamp
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // Many-to-One relation with User
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}
