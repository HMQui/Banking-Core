import {
    IsNotEmpty,
    IsString,
    MaxLength,
    IsNumberString,
} from 'class-validator';

export class CreateBeneficiaryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    nickname!: string;

    @IsNotEmpty()
    @IsNumberString()
    @MaxLength(30)
    accountNumber!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    bankName!: string;
}
