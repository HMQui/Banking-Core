import { IsEnum, IsNotEmpty } from 'class-validator';
import { Currency } from '../entities/account.entity';
import { Optional } from '@nestjs/common/decorators/core/optional.decorator';

export class CreateAccountDto {
    // Currency selected by user (VND or USD)
    @IsNotEmpty()
    @IsEnum(Currency)
    currency!: Currency;

    // Optional account name for user-friendly identification
    @IsNotEmpty()
    accountName!: string;

    @Optional()
    isPrimary?: boolean;
}
