// transactions.service.ts
import {
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { LedgerEntry, EntryType } from '../entities/ledger-entry.entity';
import { TransferRequestDto } from '../dto/transfer-request.dto';
import { AccountsService } from '../../accounts/services/accounts.service';
import { GetHistoryRequestDto } from '../dto/get-history-request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueryRunner } from 'typeorm/browser';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TransactionsService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly accountsService: AccountsService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Perform a funds transfer with ACID guarantees and idempotency.
     */
    async transfer(
        userId: string,
        idempotencyKey: string,
        dto: TransferRequestDto & { senderAccountId: string },
    ): Promise<Transaction> {
        const {
            senderAccountId,
            receiverAccountNumber,
            amount,
            currency,
            description,
        } = dto;

        // fail fast outside transaction
        const existingTx = await this.dataSource
            .getRepository(Transaction)
            .findOne({ where: { idempotencyKey } });

        if (existingTx) {
            if (existingTx.status === TransactionStatus.SUCCESS) {
                return existingTx;
            }
            if (existingTx.status === TransactionStatus.PENDING) {
                throw new ConflictException(
                    'Transaction is currently being processed',
                );
            }
            if (existingTx.status === TransactionStatus.FAILED) {
                throw new BadRequestException(
                    'Previous transaction with this idempotency key failed',
                );
            }
        }

        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // verify specific sender account with lock
            const senderAccount = await this.accountsService.findAccountById(
                senderAccountId,
                queryRunner.manager,
            );

            if (!senderAccount) {
                throw new NotFoundException('Sender account not found');
            }

            // security check: verify ownership
            if (senderAccount.userId !== userId) {
                throw new BadRequestException(
                    'You do not own the selected source account',
                );
            }

            // verify receiver with lock
            const receiverAccount =
                await this.accountsService.findAccountByNumber(
                    receiverAccountNumber,
                    queryRunner.manager,
                );

            if (!receiverAccount) {
                throw new NotFoundException('Receiver account not found');
            }

            if (senderAccount.id === receiverAccount.id) {
                throw new BadRequestException(
                    'Cannot transfer to the same account',
                );
            }

            if (senderAccount.balance < amount) {
                throw new BadRequestException('Insufficient balance');
            }

            // reserve idempotency key
            const initialTransaction = queryRunner.manager.create(Transaction, {
                senderId: senderAccount.id,
                receiverId: receiverAccount.id,
                amount,
                currency,
                description,
                idempotencyKey,
                status: TransactionStatus.PENDING,
            });
            let savedTransaction =
                await queryRunner.manager.save(initialTransaction);

            // adjust balances
            await this.accountsService.updateBalance(
                senderAccount.id,
                -amount,
                queryRunner.manager,
            );
            await this.accountsService.updateBalance(
                receiverAccount.id,
                amount,
                queryRunner.manager,
            );

            // record ledger
            const ledgerEntries = [
                queryRunner.manager.create(LedgerEntry, {
                    transactionId: savedTransaction.id,
                    accountId: senderAccount.id,
                    type: EntryType.DEBIT,
                    amount,
                }),
                queryRunner.manager.create(LedgerEntry, {
                    transactionId: savedTransaction.id,
                    accountId: receiverAccount.id,
                    type: EntryType.CREDIT,
                    amount,
                }),
            ];
            await queryRunner.manager.save(LedgerEntry, ledgerEntries);

            // commit success
            savedTransaction.status = TransactionStatus.SUCCESS;
            savedTransaction = await queryRunner.manager.save(savedTransaction);

            await queryRunner.commitTransaction();

            const senderUser = await queryRunner.manager.findOne(User, {
                where: { id: userId },
            });

            this.eventEmitter.emit('transaction.success', {
                receiverId: receiverAccount.userId ?? receiverAccount.id,
                amount: savedTransaction.amount,
                currency: savedTransaction.currency,
                senderName: String(senderUser?.fullName ?? senderAccount.id),
                description: savedTransaction.description,
                timestamp: new Date().toISOString(),
            });

            return savedTransaction;
        } catch (error: unknown) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            const dbError = error as { code?: string; errno?: number };
            if (dbError.code === '23505' || dbError.errno === 1062) {
                throw new ConflictException(
                    'Duplicate request with this idempotency key is already processing',
                );
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException(
                    'Transaction failed: ' + error.message,
                );
            }

            throw new InternalServerErrorException(
                'Unexpected error during transaction transfer',
            );
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Fetch paginated history for the authenticated user
     */
    async getHistory(
        userId: string,
        query: GetHistoryRequestDto,
        manager?: EntityManager,
    ): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
    }> {
        const {
            page = 1,
            limit = 10,
            accountId,
            startDate,
            endDate,
            type,
            description,
        } = query;
        const skip = (page - 1) * limit;

        const userAccounts = await this.accountsService.getAccounts(userId);

        if (!userAccounts.length) {
            return { data: [], total: 0, page, limit };
        }

        let targetAccountIds = userAccounts.map((a) => a.id);

        if (accountId) {
            if (!targetAccountIds.includes(accountId)) {
                return { data: [], total: 0, page, limit };
            }
            targetAccountIds = [accountId];
        }

        const repository = manager
            ? manager.getRepository(Transaction)
            : this.dataSource.getRepository(Transaction);

        const queryBuilder = repository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.sender', 'sender')
            .leftJoinAndSelect('transaction.receiver', 'receiver');

        if (type === EntryType.DEBIT) {
            queryBuilder.andWhere('transaction.senderId IN (:...accountIds)', {
                accountIds: targetAccountIds,
            });
        } else if (type === EntryType.CREDIT) {
            queryBuilder.andWhere(
                'transaction.receiverId IN (:...accountIds)',
                { accountIds: targetAccountIds },
            );
        } else {
            queryBuilder.andWhere(
                '(transaction.senderId IN (:...accountIds) OR transaction.receiverId IN (:...accountIds))',
                { accountIds: targetAccountIds },
            );
        }

        if (startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', {
                startDate,
            });
        }

        if (endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', {
                endDate,
            });
        }

        if (description) {
            queryBuilder.andWhere(
                'LOWER(transaction.description) LIKE LOWER(:description)',
                { description: `%${description}%` },
            );
        }

        queryBuilder.orderBy('transaction.createdAt', 'DESC');
        queryBuilder.skip(skip).take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total, page, limit };
    }
}
