import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    async createAccount(
        userId: string,
        createAccountDto: CreateAccountDto,
    ): Promise<Account> {
        let accountNumber = '';
        let isUnique = false;

        // Generate a unique 10-digit account number
        while (!isUnique) {
            accountNumber = Math.floor(
                1000000000 + Math.random() * 9000000000,
            ).toString();
            const existingAccount = await this.accountRepository.findOne({
                where: { accountNumber },
            });
            if (!existingAccount) {
                isUnique = true;
            }
        }

        const newAccount = this.accountRepository.create({
            userId,
            accountNumber,
            accountName: createAccountDto.accountName,
            currency: createAccountDto.currency,
        });

        return this.accountRepository.save(newAccount);
    }

    async getAccounts(userId: string): Promise<Account[]> {
        // Enforce Me Pattern: only fetch accounts belonging to the current user
        return this.accountRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Find account by user ID using EntityManager
     * Used in transaction processing to ensure consistency within transaction context
     */
    async findAccountByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<Account | null> {
        const repository = manager
            ? manager.getRepository(Account)
            : this.accountRepository;
        return repository.findOne({
            where: { userId },
        });
    }

    /**
     * Find account by account number using EntityManager
     * Used in transaction processing to locate receiver account
     */
    async findAccountByNumber(
        accountNumber: string,
        manager?: EntityManager,
    ): Promise<Account | null> {
        if (manager) {
            return manager.findOne(Account, {
                where: { accountNumber },
            });
        }
        return this.accountRepository.findOne({
            where: { accountNumber },
        });
    }

    /**
     * Internal method for Transaction/Ledger module to update balance safely
     * Uses pessimistic write lock to prevent race conditions during concurrent transactions
     */
    async updateBalance(
        accountId: string,
        amount: number,
        manager: EntityManager,
    ): Promise<Account> {
        // Use pessimistic write lock to prevent race conditions during concurrent transactions
        const account = await manager.findOne(Account, {
            where: { id: accountId },
            lock: { mode: 'pessimistic_write' },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        account.balance += amount;
        return manager.save(account);
    }
}
