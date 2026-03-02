import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenRequestDto {
    @ApiProperty({
        description: 'The valid refresh token to obtain a new access token',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}
