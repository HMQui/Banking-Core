import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    statusCode: number;
    message: string | undefined;
    data: T | undefined;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
    T,
    Response<T>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<Response<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<{ statusCode: number }>();

        return next.handle().pipe(
            map((res: T) => {
                return {
                    statusCode: response.statusCode,
                    message: 'Success',
                    data: res,
                };
            }),
        );
    }
}
