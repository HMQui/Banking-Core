import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    UseGuards,
    Query,
    BadRequestException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { TransferRequestDto } from './dto/transfer-request.dto';
import { GetHistoryRequestDto } from './dto/get-history-request.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DPoPGuard } from '../auth/guards/dpop.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, DPoPGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    /**
     * POST /transactions/transfer
     * Strictly uses the sub (userId) from the DPoP-verified JWT
     */
    @Post('transfer')
    async transfer(
        @CurrentUser('sub') userId: string,
        @Headers('x-idempotency-key') idempotencyKey: string,
        @Body() dto: TransferRequestDto,
    ) {
        if (!idempotencyKey) {
            throw new BadRequestException(
                'x-idempotency-key header is required',
            );
        }

        return await this.transactionsService.transfer(
            userId,
            idempotencyKey,
            dto,
        );
    }

    /**
     * GET /transactions/me
     * Fetch paginated history for the authenticated user
     */
    @Get('me')
    async getMyHistory(
        @CurrentUser('sub') userId: string,
        @Query() query: GetHistoryRequestDto,
    ) {
        return await this.transactionsService.getHistory(userId, query);
    }
}
