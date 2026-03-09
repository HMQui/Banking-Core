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
        // Retrieve the roles required for the current route handler or class
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If the @Roles decorator is not used, allow access by default
        if (!requiredRoles) {
            return true;
        }

        // Extract the request object from the execution context
        const request: Request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if the user object and role exist in the request
        if (!user?.role) {
            throw new ForbiddenException(
                'Access denied. User role not found in the payload.',
            );
        }

        // Validate if the user's role is included in the required roles array
        const role = user.role as UserRole;
        const hasRequiredRole = requiredRoles.includes(role);

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                'Access denied. Insufficient permissions to access this resource.',
            );
        }

        return true;
    }
}
