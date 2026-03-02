import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ExceptionResponse {
    statusCode?: number;
    message?: string | string[];
    error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Log the actual exception for debugging
        if (exception instanceof Error) {
            this.logger.error(
                `[${request.method}] ${request.url} - ${exception.message}`,
                exception.stack,
            );
        } else {
            this.logger.error(
                `[${request.method}] ${request.url} - ${String(exception)}`,
            );
        }

        const status: number =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string = 'Internal server error';
        let error: string = HttpStatus[status];

        if (exception instanceof HttpException) {
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const typedRes = res as ExceptionResponse;

                if (typedRes.message) {
                    message = Array.isArray(typedRes.message)
                        ? typedRes.message[0]
                        : typedRes.message;
                }

                if (typedRes.error) {
                    error = typedRes.error;
                }
            }
        }

        response.status(status).json({
            statusCode: status,
            message,
            error,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
