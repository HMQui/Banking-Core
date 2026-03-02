import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';

@Injectable()
export class AuditLogsService {
    // Initialize logger for internal error tracking
    private readonly logger = new Logger(AuditLogsService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {}

    // Fire-and-forget method to save sensitive actions asynchronously
    async logAction(
        userId: string | null,
        action: string,
        resource: string | null,
        oldValue: Record<string, unknown> | null,
        newValue: Record<string, unknown> | null,
        ipAddress: string | null,
        userAgent: string | null,
    ): Promise<void> {
        try {
            const auditLog = this.auditLogRepository.create({
                userId,
                action,
                resource,
                oldValue,
                newValue,
                ipAddress,
                userAgent,
            });

            // Execute database save operation
            await this.auditLogRepository.save(auditLog);
        } catch (error: any) {
            // Log the error internally to avoid blocking or failing the main API request
            if (error instanceof Error) {
                this.logger.error(
                    `Failed to log audit action: ${action} for user: ${userId}`,
                    error.stack,
                );
            } else {
                this.logger.error(
                    `Failed to log audit action: ${action} for user: ${userId}. Error: ${error}`,
                );
            }
        }
    }

    // Retrieve paginated audit logs strictly for the current authenticated user
    async getMyLogs(
        userId: string,
        query: GetAuditLogsDto,
    ): Promise<{
        data: AuditLog[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await this.auditLogRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
        };
    }
}
