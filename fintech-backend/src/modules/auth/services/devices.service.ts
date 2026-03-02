import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DevicesService {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
    ) {}

    // Registers a new device for a user
    async create(deviceData: Partial<Device>): Promise<Device> {
        const device = this.deviceRepository.create(deviceData);
        return this.deviceRepository.save(device);
    }

    // Finds a device by its unique DPoP public key thumbprint
    async findByThumbprint(thumbprint: string): Promise<Device | null> {
        return this.deviceRepository.findOne({
            where: { publicKeyThumbprint: thumbprint },
        });
    }

    // Updates the last active timestamp for a device
    async updateLastActive(id: string): Promise<Device> {
        const device = await this.deviceRepository.findOne({ where: { id } });
        if (!device) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }
        device.lastActiveAt = new Date();
        return this.deviceRepository.save(device);
    }
}
