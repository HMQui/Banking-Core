import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './transactions.controller';
import { LedgerService } from './services/ledger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, LedgerEntry]),
        AccountsModule,
        AuthModule,
        NotificationsModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService, LedgerService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
