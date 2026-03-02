import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum Currency {
    VND = 'VND',
    USD = 'USD',
}

// Transformer to handle Postgres decimal conversion safely in JS/TS
export class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}

@Entity('accounts')
export class Account {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Foreign key for User
    @Column({ name: 'user_id' })
    userId!: string;

    // Unique account number
    @Column({ name: 'account_number', unique: true })
    accountNumber!: string;

    // User-defined account name for easier identification
    @Column({ name: 'account_name' })
    accountName!: string;

    // Flag to indicate if this is the primary account for the user
    @Column({ name: 'is_primary', default: false })
    isPrimary!: boolean;

    // Currency type
    @Column({ type: 'enum', enum: Currency, default: Currency.VND })
    currency!: Currency;

    // Financial balance with high precision and transformer
    @Column({
        type: 'decimal',
        precision: 20,
        scale: 4,
        default: 0,
        transformer: new ColumnNumericTransformer(),
    })
    balance!: number;

    // Optimistic locking version to prevent race conditions
    @VersionColumn()
    version!: number;

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
