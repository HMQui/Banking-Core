import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    UseInterceptors,
    ClassSerializerInterceptor,
    SerializeOptions,
} from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { BeneficiariesService } from './services/beneficiaries.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { BeneficiaryResponseDto } from './dto/beneficiary-response.dto';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DPoPGuard } from '../auth/guards/dpop.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, DPoPGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly beneficiariesService: BeneficiariesService,
    ) {}

    @Post('me')
    @SerializeOptions({ type: AccountResponseDto })
    async createAccount(
        @CurrentUser('sub') userId: string,
        @Body() createAccountDto: CreateAccountDto,
    ) {
        // Logics remains the same, but userId is now cleanly injected
        return this.accountsService.createAccount(userId, createAccountDto);
    }

    @Get('me')
    @SerializeOptions({ type: AccountResponseDto })
    async getAccounts(@CurrentUser('sub') userId: string) {
        return this.accountsService.getAccounts(userId);
    }

    @Post('me/beneficiaries')
    @SerializeOptions({ type: BeneficiaryResponseDto })
    async addBeneficiary(
        @CurrentUser('sub') userId: string,
        @Body() createBeneficiaryDto: CreateBeneficiaryDto,
    ) {
        return this.beneficiariesService.addBeneficiary(
            userId,
            createBeneficiaryDto,
        );
    }

    @Get('me/beneficiaries')
    @SerializeOptions({ type: BeneficiaryResponseDto })
    async getBeneficiaries(@CurrentUser('sub') userId: string) {
        return this.beneficiariesService.getBeneficiaries(userId);
    }

    @Patch('me/beneficiaries/:id')
    @SerializeOptions({ type: BeneficiaryResponseDto })
    async updateBeneficiary(
        @CurrentUser('sub') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
    ) {
        return this.beneficiariesService.updateBeneficiary(
            id,
            userId,
            updateBeneficiaryDto,
        );
    }

    @Delete('me/beneficiaries/:id')
    async removeBeneficiary(
        @CurrentUser('sub') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.beneficiariesService.removeBeneficiary(id, userId);
    }
}
