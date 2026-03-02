import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],

    controllers: [AuditLogsController],

    providers: [
        AuditLogsService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditLogInterceptor,
        },
    ],
    exports: [AuditLogsService],
})
export class AuditLogsModule {}
