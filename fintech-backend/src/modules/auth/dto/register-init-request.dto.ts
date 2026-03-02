import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    Matches,
} from 'class-validator';

export class RegisterInitRequestDto {
    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'Password is too weak (requires uppercase, lowercase, number/special character)',
    })
    password!: string;

    @IsString()
    @IsNotEmpty()
    fullName!: string;
}
