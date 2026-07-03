import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { UserService } from '../service/UserService.js';
import type { User } from '../models/UserModel.js';
import { z } from 'zod';

const updateUserSchema = z.object({
    firstname: z.string().min(2, "Le prénom doit faire au moins 2 caractères.").optional(),
    lastname: z.string().min(2, "Le nom doit faire au moins 2 caractères.").optional(),
    phone: z.string().min(10, "Le numéro de téléphone doit faire au moins 10 chiffres.").optional(),
    birthday: z.coerce.date({ 
        message: "Format de date invalide." 
    }).optional()
});

export class UserController {
    constructor(private readonly userService: UserService) {}

    private getUserId(req: AuthRequest): string {
        if (!req.user || !req.user.userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        return req.user.userId;
    }

    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req);
            const user = await this.userService.getUserProfile(userId);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateProfile(req: AuthRequest, res: Response): Promise<void> {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: "Le corps de la requête est vide ou manquant." });
            return;
        }

        try {
            const userId = this.getUserId(req);
            const validatedData = updateUserSchema.parse(req.body);
            
            const cleanData = Object.fromEntries(
                Object.entries(validatedData).filter(([_, value]) => value !== undefined)
            ) as Partial<User>;
            
            const updatedUser = await this.userService.updateUser(userId, cleanData);
            res.status(200).json(updatedUser);
            
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues.map(e => e.message).join(' | ') });
                return;
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: "Une erreur inattendue est survenue." });
        }
    }

    async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req);
            await this.userService.deleteUser(userId);
            
            res.status(200).json({ message: "Votre compte a été supprimé avec succès." });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}