import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DPoPGuard } from '../../auth/guards/dpop.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { Roles } from '../../../decorators/roles.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { UserProfileResponseDto } from '../../users/dto/user-profile-response.dto';
import { UpdateUserStatusDto } from '../dtos/user/update-user-status.dto';

@Controller('admin/users')
// Applies authentication, DPoP validation, and role-based access control
@UseGuards(JwtAuthGuard, DPoPGuard, RolesGuard)
// Restricts access to this controller to users with the ADMIN role
@Roles(UserRole.ADMIN)
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) {}

    // Retrieves a paginated list of all users
    @Get()
    async getAllUsers(
        // Extracts the admin's ID from the JWT payload for potential auditing
        @CurrentUser('sub') adminId: string,
        // Pagination parameter for the current page number
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        // Pagination parameter for the maximum number of items per page
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        const result = await this.usersService.findAll(page, limit);

        // Map the entities to response DTOs to exclude sensitive fields like password hashes
        const mappedData = result.data.map((user) =>
            plainToInstance(UserProfileResponseDto, user, {
                excludeExtraneousValues: true,
            }),
        );

        return {
            data: mappedData,
            total: result.total,
            page,
            limit,
        };
    }

    // Updates the account status of a specific user by their UUID
    @Patch(':id/status')
    async updateUserStatus(
        // Extracts the admin's ID from the JWT payload for potential auditing
        @CurrentUser('sub') adminId: string,
        // Target user's UUID from the route parameter
        @Param('id') userId: string,
        // Validated payload containing the new UserStatus
        @Body() updateData: UpdateUserStatusDto,
    ): Promise<UserProfileResponseDto> {
        const updatedUser = await this.usersService.updateStatus(
            userId,
            updateData.status,
        );

        return plainToInstance(UserProfileResponseDto, updatedUser, {
            excludeExtraneousValues: true,
        });
    }
}
