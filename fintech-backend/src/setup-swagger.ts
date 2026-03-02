import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Banking API')
        .setDescription('Core Banking System API with DPoP Security')
        .setVersion('1.0')
        // Standard Bearer Auth
        .addBearerAuth()
        // Custom DPoP Header Auth for Swagger UI
        .addApiKey({ type: 'apiKey', name: 'DPoP', in: 'header' }, 'DPoP')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}
