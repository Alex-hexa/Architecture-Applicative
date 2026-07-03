import { UserRepository } from '../repository/UserRepository.js';
import type { User } from '../models/UserModel.js';

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async getUserProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur introuvable.");
        }
                
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }
    
    async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
        if (updateData.password) {
            throw new Error("La modification du mot de passe doit passer par une procédure spécifique.");
        }

        const updatedUser = await this.userRepository.update(userId, updateData);
        
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur introuvable.");
        }
        
        await this.userRepository.delete(userId);
    }
}