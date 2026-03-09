import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { DPoPGuard } from '../auth/guards/dpop.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, DPoPGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    async getProfile(
        @CurrentUser('sub') userId: string,
    ): Promise<UserProfileResponseDto> {
        const user = await this.usersService.getProfile(userId);

        return plainToInstance(UserProfileResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser('sub') userId: string,
        @Body() updateData: UpdateProfileDto,
    ): Promise<UserProfileResponseDto> {
        const updatedUser = await this.usersService.updateProfile(
            userId,
            updateData,
        );

        return plainToInstance(UserProfileResponseDto, updatedUser, {
            excludeExtraneousValues: true,
        });
    }

    @Get('me/security')
    async getSecurityInfo(
        @CurrentUser('sub') userId: string,
    ): Promise<{ isTwoFactorEnabled: boolean }> {
        return this.usersService.getSecurityInfo(userId);
    }
}
