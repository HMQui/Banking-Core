import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway';

// Define the structure of the incoming event payload
export interface TransactionSuccessPayload {
    receiverId: string | number;
    amount: number;
    currency: string;
    senderName: string;
    description: string;
    timestamp: string | Date;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    // Inject NotificationsGateway to access the WebSocket server instance
    constructor(private readonly notificationsGateway: NotificationsGateway) {}

    @OnEvent('transaction.success')
    public handleTransactionSuccessEvent(
        payload: TransactionSuccessPayload,
    ): void {
        try {
            this.logger.log(
                `Received transaction.success event for receiver ID: ${payload.receiverId}`,
            );

            // Format the exact message structure required by the client
            const formattedMessage = {
                type: 'TRANSACTION_RECEIVED',
                data: payload,
            };

            const roomName = String(payload.receiverId);

            // Emit the event to the specific user's room
            this.notificationsGateway.server
                .to(roomName)
                .emit('notification', formattedMessage);

            this.logger.log(
                `Successfully emitted TRANSACTION_RECEIVED to room: ${roomName}`,
            );
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(
                    `Error handling transaction.success event: ${error.message}`,
                );
            }
        }
    }
}
