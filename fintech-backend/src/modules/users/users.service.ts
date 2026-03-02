import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    // Creates a new user record
    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    // Finds a user by their unique email
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    // Finds a user by their UUID
    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // Updates the user's account status (e.g., locking the account)
    async updateStatus(id: string, status: UserStatus): Promise<User> {
        const user = await this.findById(id);
        user.status = status;
        return this.userRepository.save(user);
    }

    // Updates the 2FA secret for the user
    async updateTwoFactorSecret(id: string, secret: string): Promise<User> {
        const user = await this.findById(id);
        user.twoFactorSecret = secret;
        return this.userRepository.save(user);
    }

    // Retrieve the profile of the currently authenticated user
    async getProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User profile not found');
        }

        return user;
    }

    // Update specific fields of the user's profile
    async updateProfile(
        userId: string,
        updateData: UpdateProfileDto,
    ): Promise<User> {
        // Reuse getProfile to ensure the user exists before updating
        const user = await this.getProfile(userId);

        // Update fields if they are provided in the DTO
        if (updateData.fullName) {
            user.fullName = updateData.fullName;
        }

        // Save and return the updated entity
        return this.userRepository.save(user);
    }

    // Retrieve the security configuration status of the user
    async getSecurityInfo(
        userId: string,
    ): Promise<{ isTwoFactorEnabled: boolean }> {
        // Explicitly select twoFactorSecret to evaluate its presence
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'twoFactorSecret'],
        });

        if (!user) {
            throw new NotFoundException('User profile not found');
        }

        // Check if the 2FA secret exists and is not empty
        const isTwoFactorEnabled =
            user.twoFactorSecret !== null &&
            user.twoFactorSecret !== undefined &&
            user.twoFactorSecret !== '';

        return {
            isTwoFactorEnabled,
        };
    }
}
