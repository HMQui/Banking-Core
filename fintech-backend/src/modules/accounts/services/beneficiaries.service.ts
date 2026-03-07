import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../entities/beneficiary.entity';
import { CreateBeneficiaryDto } from '../dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../dto/update-beneficiary.dto';
import { AccountsService } from './accounts.service';

@Injectable()
export class BeneficiariesService {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>,
        private readonly accountsService: AccountsService,
    ) {}

    async addBeneficiary(
        userId: string,
        createBeneficiaryDto: CreateBeneficiaryDto,
    ): Promise<Beneficiary> {
        // Verify the account exists
        const account = await this.accountsService.findAccountByNumber(
            createBeneficiaryDto.accountNumber,
        );

        if (!account) {
            throw new NotFoundException('Target account does not exist');
        }

        // Prevent adding user's own account as beneficiary
        if (account.userId === userId) {
            throw new BadRequestException(
                'You cannot add your own account as a beneficiary',
            );
        }

        // Prevent duplicate beneficiary
        const existing = await this.beneficiaryRepository.findOne({
            where: {
                userId,
                accountNumber: createBeneficiaryDto.accountNumber,
            },
        });

        if (existing) {
            throw new BadRequestException(
                'This beneficiary already exists in your list',
            );
        }

        const beneficiary = this.beneficiaryRepository.create({
            userId,
            nickname: createBeneficiaryDto.nickname,
            accountNumber: createBeneficiaryDto.accountNumber,
            bankName: createBeneficiaryDto.bankName,
        });

        return this.beneficiaryRepository.save(beneficiary);
    }

    async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
        return this.beneficiaryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async updateBeneficiary(
        id: string,
        userId: string,
        updateBeneficiaryDto: UpdateBeneficiaryDto,
    ): Promise<Beneficiary> {
        // Enforce Me Pattern: verify ownership before updating
        const beneficiary = await this.beneficiaryRepository.findOne({
            where: { id, userId },
        });

        if (!beneficiary) {
            throw new NotFoundException(
                'Beneficiary not found or unauthorized access',
            );
        }

        // Apply partial updates
        Object.assign(beneficiary, updateBeneficiaryDto);
        return this.beneficiaryRepository.save(beneficiary);
    }

    async removeBeneficiary(id: string, userId: string): Promise<void> {
        // Enforce Me Pattern: strictly delete by id AND userId
        const result = await this.beneficiaryRepository.delete({ id, userId });

        if (result.affected === 0) {
            throw new NotFoundException(
                'Beneficiary not found or unauthorized access',
            );
        }
    }
}
