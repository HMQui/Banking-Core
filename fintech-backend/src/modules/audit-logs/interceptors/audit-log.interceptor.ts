/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../audit-logs.service';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly auditLogsService: AuditLogsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const method = request.method;

        // We only care about mutation operations for auditing purposes
        const targetMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

        if (!targetMethods.includes(method)) {
            // For GET or other methods, just proceed without interception
            return next.handle();
        }

        // Extract necessary information from the request object before the handler executes
        const ipAddress: string | null = request.ip ?? null;
        const userAgent: string | null =
            (request.headers['user-agent'] as string) ?? null;
        const userId: string | null =
            request.user && (request.user as any).sub
                ? String((request.user as any).sub)
                : null;
        const resource: string | null =
            request.originalUrl ?? request.url ?? null;
        const action = `${method} ${resource ?? ''}`;

        // Capture the incoming payload as the new state/value
        // We use Record<string, unknown> type safety as agreed
        const newValue: Record<string, unknown> | null =
            request.body && Object.keys(request.body).length > 0
                ? (request.body as Record<string, unknown>)
                : null;

        // In an HTTP interceptor, the previous state (oldValue) is not readily available
        // without doing a specific database lookup. We leave it as null here.
        const oldValue: Record<string, unknown> | null = null;

        return next.handle().pipe(
            tap(() => {
                // Execute the logging asynchronously (fire-and-forget) only if the request succeeds
                this.auditLogsService.logAction(
                    userId,
                    action,
                    resource,
                    oldValue,
                    newValue,
                    ipAddress,
                    userAgent,
                );
            }),
        );
    }
}
