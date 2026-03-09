import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../../users/entities/user.entity';

export class UpdateUserStatusDto {
    @IsNotEmpty()
    @IsEnum(UserStatus)
    status!: UserStatus;
}
