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
import { Account, Currency } from '../../accounts/entities/account.entity';
import { LedgerEntry } from './ledger-entry.entity';

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

@Entity('transactions')
export class Transaction {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string; // [cite: 9]

    // Optional sender account ID for deposits
    @Column({ name: 'sender_id', nullable: true })
    senderId!: string; // [cite: 10]

    // Optional receiver account ID for withdrawals
    @Column({ name: 'receiver_id', nullable: true })
    receiverId!: string; // [cite: 11]

    // Financial amount
    @Column({ type: 'decimal', precision: 20, scale: 4 })
    amount!: number; // [cite: 11]

    // Currency type
    @Column({ type: 'enum', enum: Currency })
    currency!: Currency; // [cite: 11]

    // Status of the transaction
    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status!: TransactionStatus; // [cite: 11]

    // Optional transaction description
    @Column({ nullable: true })
    description!: string; // [cite: 11]

    // Unique key to prevent duplicate processing
    @Column({ name: 'idempotency_key', unique: true })
    idempotencyKey!: string; // [cite: 12]

    // Auto-generated creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date; // [cite: 12]

    // Auto-updated modification timestamp
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date; // [cite: 12]

    // Relation to sender account
    @ManyToOne(() => Account)
    @JoinColumn({ name: 'sender_id' })
    sender!: Account; // [cite: 13]

    // Relation to receiver account
    @ManyToOne(() => Account)
    @JoinColumn({ name: 'receiver_id' })
    receiver!: Account; // [cite: 14]

    // Relation to ledger entries
    @OneToMany(() => LedgerEntry, (ledgerEntry) => ledgerEntry.transaction)
    ledgerEntries!: LedgerEntry[]; // [cite: 14]
}
