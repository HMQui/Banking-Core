import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../modules/users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;

        if (!user?.role) {
            throw new ForbiddenException(
                'Access denied. User role not found in the payload.',
            );
        }

        const hasRequiredRole = requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                'Access denied. Insufficient permissions to access this resource.',
            );
        }

        return true;
    }
}
