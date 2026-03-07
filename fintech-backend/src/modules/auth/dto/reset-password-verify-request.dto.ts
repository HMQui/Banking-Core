import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class ResetPasswordVerifyRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    otp!: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    newPassword!: string;
}
