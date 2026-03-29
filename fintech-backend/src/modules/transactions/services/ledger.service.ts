import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { GetHistoryRequestDto } from '../dto/get-history-request.dto';
import { AccountsService } from '../../accounts/services/accounts.service';

@Injectable()
export class LedgerService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(LedgerEntry)
        private readonly ledgerEntryRepository: Repository<LedgerEntry>,

        private readonly accountsService: AccountsService,
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

    // Fetch double-entry ledger statement for the user
    async getStatement(
        userId: string,
        query: GetHistoryRequestDto,
    ): Promise<{
        data: LedgerEntry[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const userAccount =
            await this.accountsService.findAccountByUserId(userId);

        if (!userAccount) {
            return { data: [], total: 0, page, limit };
        }

        const repository = this.dataSource.getRepository(LedgerEntry);

        const [data, total] = await repository.findAndCount({
            where: { accountId: userAccount.id },
            relations: ['transaction'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }
}
