/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException(
                'User not found in request. Ensure JwtAuthGuard is applied.',
            );
        }

        // If a specific property is requested (e.g., @CurrentUser('sub'))
        if (data) {
            if (!user[data]) {
                throw new UnauthorizedException(
                    `Property ${data} not found in user payload`,
                );
            }
            return user[data];
        }

        // Otherwise return the whole user object
        return user;
    },
);
