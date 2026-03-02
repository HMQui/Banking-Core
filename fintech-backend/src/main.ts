import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from './setup-swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 1. Basic Security
    app.use(helmet());
    app.enableCors({
        origin: '*', // Configure this to your specific frontend domain in production
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // 2. Global Route Prefix
    app.setGlobalPrefix('api/v1');

    // 3. Global Pipes (Validation)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that do not have any decorators
            forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
            transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
        }),
    );

    // 4. Global Interceptors (Format successful responses)
    app.useGlobalInterceptors(new TransformInterceptor());

    // 5. Global Exception Filters (Format error responses)
    app.useGlobalFilters(new HttpExceptionFilter());

    // 6. Swagger API Documentation
    setupSwagger(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`Application is running on: http://localhost:${port}/api/v1`);
    console.log(`Swagger UI is available at: http://localhost:${port}/docs`);
}
bootstrap();
