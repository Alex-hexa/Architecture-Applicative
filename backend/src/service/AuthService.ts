import { UserRepository } from '../repository/UserRepository.js';
import type { User } from '../models/UserModel.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("Il manque JWT_SECRET dans le fichier .env");
}

export class AuthService {
    constructor(private readonly userRepository: UserRepository) {}

    async register(userData: Omit<User, 'id'>): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé.');
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        
        return this.userRepository.create({
            ...userData,
            password: hashedPassword
        });
    }

    async login(email: string, passwordUnsecured: string): Promise<{ token: string; user: User }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Identifiants invalides.');
        }

        const isPasswordValid = await bcrypt.compare(passwordUnsecured, user.password!);
        if (!isPasswordValid) {
            throw new Error('Identifiants invalides.');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'VOTRE_SECRET_JWT',
            { expiresIn: '24h' }
        );

        const { password, ...userWithoutPassword } = user;

        return { token, user: userWithoutPassword as User };
    }
}