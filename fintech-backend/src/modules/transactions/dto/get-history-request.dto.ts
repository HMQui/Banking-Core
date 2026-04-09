// get-history-request.dto.ts
import {
    IsOptional,
    IsInt,
    Min,
    Max,
    IsUUID,
    IsDate,
    IsEnum,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EntryType } from '../entities/ledger-entry.entity';

export class GetHistoryRequestDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsUUID()
    accountId?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @IsEnum(EntryType)
    type?: EntryType;

    @IsOptional()
    @IsString()
    description?: string;
}
