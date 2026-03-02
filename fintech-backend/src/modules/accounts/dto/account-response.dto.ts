import { Exclude, Expose } from 'class-transformer';
import { Currency } from '../entities/account.entity';

@Exclude()
export class AccountResponseDto {
    @Expose()
    id!: string;

    @Expose()
    accountNumber!: string;

    @Expose()
    accountName!: string;

    @Expose()
    isPrimary!: boolean;

    @Expose()
    currency!: Currency;

    @Expose()
    balance!: number;

    @Expose()
    createdAt!: Date;
}
