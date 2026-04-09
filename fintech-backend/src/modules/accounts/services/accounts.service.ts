import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

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
        return this.accountRepository.manager.transaction(async (manager) => {
            const existingAccounts = await manager.find(Account, {
                where: { userId },
            });

            let accountNumber = '';
            let isUnique = false;

            while (!isUnique) {
                accountNumber = Math.floor(
                    1000000000 + Math.random() * 9000000000,
                ).toString();

                const existing = await manager.findOne(Account, {
                    where: { accountNumber },
                });

                if (!existing) isUnique = true;
            }

            let isPrimary = false;

            if (existingAccounts.length === 0) {
                isPrimary = true;
            } else if (createAccountDto.isPrimary) {
                await manager.update(
                    Account,
                    { userId, isPrimary: true },
                    { isPrimary: false },
                );
                isPrimary = true;
            }

            const newAccount = manager.create(Account, {
                userId,
                accountNumber,
                accountName: createAccountDto.accountName,
                currency: createAccountDto.currency,
                isPrimary,
            });

            return manager.save(newAccount);
        });
    }

    async updateAccount(
        updateDto: UpdateAccountDto,
        userId: string,
    ): Promise<Account> {
        return this.accountRepository.manager.transaction(async (manager) => {
            const account = await manager.findOne(Account, {
                where: { id: updateDto.id, userId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!account) {
                throw new NotFoundException('Account not found');
            }

            if (updateDto.accountName !== undefined) {
                account.accountName = updateDto.accountName;
            }

            if (updateDto.isPrimary === true) {
                if (!account.isPrimary) {
                    await manager.update(
                        Account,
                        { userId, isPrimary: true },
                        { isPrimary: false },
                    );

                    account.isPrimary = true;
                }
            }

            if (updateDto.isPrimary === false) {
                if (account.isPrimary) {
                    const primaryCount = await manager.count(Account, {
                        where: { userId, isPrimary: true },
                    });

                    if (primaryCount <= 1) {
                        throw new Error(
                            'User must always have exactly one primary account',
                        );
                    }

                    account.isPrimary = false;
                }
            }

            return manager.save(account);
        });
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
            lock: manager ? { mode: 'pessimistic_write' } : undefined,
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
     * Find account by account id using EntityManager
     * Used in transaction processing to locate receiver account
     */
    async findAccountById(
        accountId: string,
        manager?: EntityManager,
    ): Promise<Account | null> {
        if (manager) {
            return manager.findOne(Account, {
                where: { id: accountId },
            });
        }
        return this.accountRepository.findOne({
            where: { id: accountId },
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
