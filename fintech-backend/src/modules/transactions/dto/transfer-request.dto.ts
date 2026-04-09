import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    IsEnum,
    Min,
    Length,
    IsOptional,
} from 'class-validator';
import { Currency } from '../../accounts/entities/account.entity';

export class TransferRequestDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 36)
    senderAccountId!: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 20)
    receiverAccountNumber!: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 4 })
    @IsPositive()
    @Min(1000)
    amount!: number;

    @IsNotEmpty()
    @IsEnum(Currency)
    currency!: Currency;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    description?: string;
}
