import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordInitRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    currentPassword!: string;
}
