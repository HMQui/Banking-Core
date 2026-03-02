import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserProfileResponseDto } from '../../users/dto/user-profile-response.dto';

@Exclude()
export class AuthResponseDto {
    @Expose()
    @ApiProperty({ description: 'DPoP bound access token' })
    accessToken!: string;

    @Expose()
    @ApiProperty({ description: 'Opaque refresh token for token rotation' })
    refreshToken!: string;

    @Expose()
    @ApiProperty({
        example: 3600,
        description: 'Access token expiration time in seconds',
    })
    expiresIn!: number;

    @Expose()
    @Type(() => UserProfileResponseDto)
    @ApiProperty({ type: () => UserProfileResponseDto })
    user!: UserProfileResponseDto;
}
