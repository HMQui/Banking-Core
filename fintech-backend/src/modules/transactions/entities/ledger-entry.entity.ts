import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import {
    Account,
    ColumnNumericTransformer,
} from '../../accounts/entities/account.entity';

export enum EntryType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT',
}

@Entity('ledger_entries')
@Index(['transactionId'])
@Index(['accountId'])
export class LedgerEntry {
    // Primary UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string; // [cite: 14]

    // Foreign key for Transaction
    @Column({ name: 'transaction_id' })
    transactionId!: string; // [cite: 14]

    // Foreign key for Account
    @Column({ name: 'account_id' })
    accountId!: string; // [cite: 14]

    // Entry type: DEBIT or CREDIT
    @Column({ type: 'enum', enum: EntryType })
    type!: EntryType; // [cite: 14]

    // Absolute financial amount
    @Column({
        type: 'decimal',
        precision: 20,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    amount!: number; // [cite: 15]

    // Auto-generated creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date; // [cite: 15]

    // Relation to the parent transaction
    @ManyToOne(() => Transaction, (transaction) => transaction.ledgerEntries)
    @JoinColumn({ name: 'transaction_id' })
    transaction!: Transaction; // [cite: 15]

    // Relation to the affected account
    @ManyToOne(() => Account)
    @JoinColumn({ name: 'account_id' })
    account!: Account; // [cite: 15]
}
