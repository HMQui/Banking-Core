import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
    @ApiProperty({
        example: 'user@bank.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: 'SecureP@ssw0rd!', description: 'User password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;

    @ApiProperty({
        example: 'iPhone 14 Pro Max',
        description: 'Device name for binding',
    })
    @IsString()
    @IsNotEmpty()
    deviceName!: string;

    @ApiProperty({
        example: 'Mozilla/5.0...',
        description: 'User agent of the client',
    })
    @IsString()
    @IsNotEmpty()
    userAgent!: string;

    @ApiProperty({ description: 'Public key in JWK format for DPoP binding' })
    @IsNotEmpty()
    publicKey!: Record<string, any>;
}
