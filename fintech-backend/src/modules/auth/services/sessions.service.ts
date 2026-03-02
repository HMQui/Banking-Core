import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
    ) {}

    // Creates a new session record
    async create(sessionData: Partial<Session>): Promise<Session> {
        const session = this.sessionRepository.create(sessionData);
        return this.sessionRepository.save(session);
    }

    // Finds a session by its hashed refresh token
    async findByTokenHash(tokenHash: string): Promise<Session | null> {
        return this.sessionRepository.findOne({
            where: { tokenHash },
            relations: ['device', 'device.user'],
        });
    }

    // Revokes a specific session
    async revokeSession(id: string): Promise<Session> {
        const session = await this.sessionRepository.findOne({ where: { id } });
        if (!session) {
            throw new NotFoundException(`Session with ID ${id} not found`);
        }
        session.isRevoked = true;
        return this.sessionRepository.save(session);
    }

    // Revokes all sessions for a specific device (e.g., when device is compromised)
    async revokeAllForDevice(deviceId: string): Promise<void> {
        await this.sessionRepository.update(
            { deviceId, isRevoked: false },
            { isRevoked: true },
        );
    }

    // Revokes the entire token family using PostgreSQL Recursive CTE
    // Crucial for Refresh Token Reuse Detection
    async revokeTokenFamily(sessionId: string): Promise<void> {
        const query = `
            WITH RECURSIVE TokenFamily AS (
                SELECT id FROM sessions WHERE id = $1
                UNION
                SELECT s.id FROM sessions s
                INNER JOIN TokenFamily tf ON s.parent_id = tf.id
            )
            UPDATE sessions 
            SET is_revoked = true 
            WHERE id IN (SELECT id FROM TokenFamily);
        `;
        // Use TypeORM raw query execution for the recursive CTE
        await this.sessionRepository.query(query, [sessionId]);
    }
}
