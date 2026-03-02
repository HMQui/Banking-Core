import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './accounts.controller';
import { BeneficiariesService } from './services/beneficiaries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Account, Beneficiary]), AuthModule],
    controllers: [AccountsController],
    providers: [AccountsService, BeneficiariesService],
    exports: [AccountsService],
})
export class AccountsModule {}
