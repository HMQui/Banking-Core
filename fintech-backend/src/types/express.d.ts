/* eslint-disable @typescript-eslint/no-empty-object-type */
import { JwtPayload } from '../modules/auth/interfaces/jwt-payload.interface';

declare global {
    namespace Express {
        interface User extends JwtPayload {}
    }
}

export {};
