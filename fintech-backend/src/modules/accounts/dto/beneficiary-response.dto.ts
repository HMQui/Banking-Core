import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BeneficiaryResponseDto {
    @Expose()
    id!: string;

    @Expose()
    nickname!: string;

    @Expose()
    accountNumber!: string;

    @Expose()
    bankName!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}
