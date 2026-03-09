import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
    imports: [UsersModule, AccountsModule, TransactionsModule],
})
export class AdminModule {}
