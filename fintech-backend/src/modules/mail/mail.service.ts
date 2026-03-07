import {
    Injectable,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    /**
     * Send OTP email for account registration verification
     */
    async sendOtpEmail(
        to: string,
        otp: string,
        fullName: string,
    ): Promise<void> {
        try {
            const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Account Registration Confirmation</h2>
                    <p style="color: #34495e; font-size: 16px;">Hello <b>${fullName}</b>,</p>
                    <p style="color: #34495e; font-size: 16px;">You have just requested to register an account on the <b>Zero Trust Banking</b> system. Here is your verification code (OTP):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #2980b9; letter-spacing: 8px; padding: 15px 30px; background-color: #ecf0f1; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="color: #e74c3c; font-size: 14px; text-align: center;">
                        <i>This code is valid for 5 minutes. Never share this code with anyone.</i>
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                        If you did not make this request, please ignore this email.<br>
                        Automated system, please do not reply to this email.
                    </p>
                </div>
            `;

            await this.mailerService.sendMail({
                to: to,
                subject:
                    'Account Registration Verification Code - Zero Trust Banking',
                html: htmlContent,
            });

            this.logger.log(`Successfully sent OTP email to: ${to}`);
        } catch (error: unknown) {
            this.handleError(error, 'OTP email');
        }
    }

    /**
     * Send OTP email for password reset verification
     */
    async sendResetOtpEmail(
        to: string,
        otp: string,
        fullName: string,
    ): Promise<void> {
        try {
            const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                    <p style="color: #34495e; font-size: 16px;">Hello <b>${fullName}</b>,</p>
                    <p style="color: #34495e; font-size: 16px;">We received a request to reset the password for your <b>Zero Trust Banking</b> account. Here is your verification code (OTP):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #e67e22; letter-spacing: 8px; padding: 15px 30px; background-color: #fdf2e9; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="color: #e74c3c; font-size: 14px; text-align: center;">
                        <i>This code is valid for 5 minutes. Never share this code with anyone.</i>
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                        If you did not make this request, your account is safe, and you can safely ignore this email.<br>
                        Automated system, please do not reply to this email.
                    </p>
                </div>
            `;

            await this.mailerService.sendMail({
                to: to,
                subject:
                    'Password Reset Verification Code - Zero Trust Banking',
                html: htmlContent,
            });

            this.logger.log(
                `Successfully sent password reset OTP email to: ${to}`,
            );
        } catch (error: unknown) {
            this.handleError(error, 'password reset OTP email');
        }
    }

    private handleError(error: unknown, context: string): never {
        if (error instanceof Error) {
            this.logger.error({
                message: error.message,
                stack: error.stack,
            });
        } else {
            this.logger.error({
                message: `Unknown error occurred while sending ${context}`,
            });
        }

        throw new InternalServerErrorException(
            `Failed to send ${context}. Please try again later.`,
        );
    }
}
