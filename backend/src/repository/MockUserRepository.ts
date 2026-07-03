import type { User } from '../models/UserModel.js';
import { randomUUID } from 'crypto';

export class MockUserRepository {
    private users: User[] = [
        {
            id: 'user-id-alexandre',
            firstname: 'Alexandre',
            lastname: 'Mulard',
            email: 'alexandre@test.com',
            password: '$2b$10$xV2.q5V5.y8H/U.5O/5.5.R/Y.5O/5.5.R/Y.5O/5.5.R/Y.5O/5.',
            birthday: new Date('2000-05-15'),
            phone: '0601020304'
        },
        {
            id: 'user-id-maxime',
            firstname: 'Maxime',
            lastname: 'Richard',
            email: 'maxime@test.com',
            password: '$2b$10$xV2.q5V5.y8H/U.5O/5.5.R/Y.5O/5.5.R/Y.5O/5.5.R/Y.5O/5.',
            birthday: new Date('2001-08-22'),
            phone: '0611223344'
        }
    ];

    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find(u => u.email === email);
        return user || null;
    }

    async create(userData: Omit<User, 'id'>): Promise<User> {
        const newUser: User = {
            ...userData,
            id: randomUUID()
        };
        this.users.push(newUser);
        return newUser;
    }
}