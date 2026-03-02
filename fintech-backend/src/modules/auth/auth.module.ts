import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DevicesService } from './services/devices.service';
import { SessionsService } from './services/sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Session } from './entities/session.entity';
import { AuthService } from './services/auth.service';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from './services/otp.service';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Device, Session, User]),
        MailModule,
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('SECRET_KEY');
                const expiresIn =
                    configService.get<string>('JWT_EXPIRES_IN') || '15m';

                if (!secret) {
                    throw new Error('SECRET_KEY is not defined');
                }

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn as StringValue,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        DevicesService,
        SessionsService,
        AuthService,
        OtpService,
        JwtStrategy,
    ],
})
export class AuthModule {}
