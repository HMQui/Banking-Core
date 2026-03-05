import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Currency } from '../entities/account.entity';

export class CreateAccountDto {
    // Currency selected by user (VND or USD)
    @IsNotEmpty()
    @IsEnum(Currency)
    currency!: Currency;

    // Optional account name for user-friendly identification
    @IsNotEmpty()
    accountName!: string;

    @IsOptional()
    isPrimary?: boolean;
}
