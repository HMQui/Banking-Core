import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './modules/mail/mail.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './modules/admin/admin.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule, MailerModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get('DATABASE_URL'), // Get URL Neon
                autoLoadEntities: true, // Auto load entities
                synchronize: true, // Auto sync schema (disable in production)
                ssl: {
                    rejectUnauthorized: false, // Allow self-signed certificates
                },
            }),
        }),

        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.getOrThrow<string>('MAIL_HOST'),
                    port: configService.getOrThrow<number>('MAIL_PORT'),
                    secure: true,
                    auth: {
                        user: configService.getOrThrow<string>('MAIL_USER'),
                        pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
                    },
                    family: 4,
                },
                defaults: {
                    from: configService.getOrThrow<string>('MAIL_FROM_NAME'),
                },
            }),
        }),

        EventEmitterModule.forRoot(),
        RedisModule,
        UsersModule,
        AuthModule,
        AccountsModule,
        TransactionsModule,
        AuditLogsModule,
        MailModule,
        NotificationsModule,
        AdminModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
