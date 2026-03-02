import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../entities/beneficiary.entity';
import { CreateBeneficiaryDto } from '../dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../dto/update-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>,
    ) {}

    async addBeneficiary(
        userId: string,
        createBeneficiaryDto: CreateBeneficiaryDto,
    ): Promise<Beneficiary> {
        const beneficiary = this.beneficiaryRepository.create({
            userId,
            nickname: createBeneficiaryDto.nickname,
            accountNumber: createBeneficiaryDto.accountNumber,
            bankName: createBeneficiaryDto.bankName,
        });

        return this.beneficiaryRepository.save(beneficiary);
    }

    async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
        // Enforce Me Pattern
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
