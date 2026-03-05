import {
    IsUUID,
    IsOptional,
    IsString,
    MinLength,
    IsBoolean,
} from 'class-validator';

export class UpdateAccountDto {
    @IsUUID()
    id!: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    accountName?: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;
}
