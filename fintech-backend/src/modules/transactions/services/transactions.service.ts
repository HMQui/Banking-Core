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
        dto: TransferRequestDto,
    ): Promise<Transaction | undefined> {
        const { receiverAccountNumber, amount, currency, description } = dto;

        // check for existing request with same key
        const existingTx = await this.dataSource
            .getRepository(Transaction)
            .findOne({ where: { idempotencyKey } });
        if (existingTx) {
            throw new ConflictException(
                'Duplicate request with this idempotency key',
            );
        }

        // begin a manual DB transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // look up and verify sender/receiver
            const senderAccount =
                await this.accountsService.findAccountByUserId(
                    userId,
                    queryRunner.manager,
                );
            if (!senderAccount) {
                throw new NotFoundException('Sender account not found');
            }

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

            // adjust balances; service applies locking
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

            // record transaction and ledger entries
            const transaction = queryRunner.manager.create(Transaction, {
                senderId: senderAccount.id,
                receiverId: receiverAccount.id,
                amount,
                currency,
                description,
                idempotencyKey,
                status: TransactionStatus.SUCCESS,
            });
            const savedTransaction =
                await queryRunner.manager.save(transaction);

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

            await queryRunner.commitTransaction();

            // emit event after commit to avoid false positives
            this.eventEmitter.emit('transaction.success', {
                receiverId: receiverAccount['userId'] || receiverAccount.id,
                amount: savedTransaction.amount,
                currency: savedTransaction.currency,
                senderName: String(senderAccount['userId'] || senderAccount.id),
                description: savedTransaction.description,
                timestamp: new Date().toISOString(),
            });

            return savedTransaction;
        } catch (error) {
            // rollback any changes
            await queryRunner.rollbackTransaction();

            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            if (error instanceof InternalServerErrorException) {
                throw new InternalServerErrorException(
                    'Transaction failed: ' + error.message,
                );
            }

            throw new InternalServerErrorException(
                'Unexpected error during transaction transfer',
            );
        } finally {
            // release query runner resources
            await queryRunner.release();
        }
    }

    /**
     * Fetch paginated transaction history for a user (as sender or receiver).
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
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const userAccount = manager
            ? await this.accountsService.findAccountByUserId(userId, manager)
            : await this.accountsService.findAccountByUserId(userId);

        if (!userAccount) {
            return { data: [], total: 0, page, limit };
        }

        const repository = manager
            ? manager.getRepository(Transaction)
            : this.dataSource.getRepository(Transaction);

        const queryBuilder = repository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.sender', 'sender')
            .leftJoinAndSelect('transaction.receiver', 'receiver')
            .where(
                '(transaction.senderId = :accountId OR transaction.receiverId = :accountId)',
                { accountId: userAccount.id },
            )
            .orderBy('transaction.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total, page, limit };
    }
}
