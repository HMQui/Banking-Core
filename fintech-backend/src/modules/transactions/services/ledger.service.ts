import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';

@Injectable()
export class LedgerService {
    constructor(
        @InjectRepository(LedgerEntry)
        private readonly ledgerEntryRepository: Repository<LedgerEntry>,
    ) {}

    // Records a new ledger entry (double-entry bookkeeping)
    async createEntry(entryData: Partial<LedgerEntry>): Promise<LedgerEntry> {
        const entry = this.ledgerEntryRepository.create(entryData);
        return this.ledgerEntryRepository.save(entry);
    }

    // Retrieves all ledger entries for a specific transaction
    async findByTransactionId(transactionId: string): Promise<LedgerEntry[]> {
        return this.ledgerEntryRepository.find({ where: { transactionId } });
    }
}
