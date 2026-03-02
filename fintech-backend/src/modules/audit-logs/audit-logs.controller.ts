import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
// Import your authentication guards (adjust the path based on your actual auth module location)
import { DPoPGuard } from '../auth/guards/dpop.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('audit-logs')
// Apply authentication and DPoP protection to all endpoints in this controller
@UseGuards(JwtAuthGuard, DPoPGuard)
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) {}

    // Endpoint to retrieve the activity history of the currently authenticated user
    @Get('me')
    async getMyLogs(
        @CurrentUser('sub') userId: string,
        @Query() query: GetAuditLogsDto,
    ) {
        return this.auditLogsService.getMyLogs(userId, query);
    }
}
