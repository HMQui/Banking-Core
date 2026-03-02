import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { DevicesService } from './services/devices.service';
import { SessionsService } from './services/sessions.service';

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [DevicesService, SessionsService],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
