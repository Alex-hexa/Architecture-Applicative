import type { Request, Response } from 'express';
import { AuthService } from '../service/AuthService.js';
import { z } from 'zod';

const registerSchema = z.object({
    firstname: z.string().min(2, "Le prénom doit faire au moins 2 caractères."),
    lastname: z.string().min(2, "Le nom doit faire au moins 2 caractères."),
    email: z.string().email("Le format de l'email est invalide."),
    
    password: z.string()
        .min(12, "Le mot de passe doit faire au moins 12 caractères.")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule.")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule.")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
        .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial."),
        
    birthday: z.coerce.date({ 
        message: "La date de naissance est invalide ou manquante (format attendu: YYYY-MM-DD)." 
    }),
    
    phone: z.string().min(10, "Le numéro de téléphone doit faire au moins 10 chiffres.")
});

const loginSchema = z.object({
    email: z.string().email("Le format de l'email est invalide."),
    password: z.string().min(1, "Le mot de passe est requis.")
});

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    async register(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = registerSchema.parse(req.body);

            const user = await this.authService.register(validatedData);
            res.status(201).json(user);
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

    async login(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = loginSchema.parse(req.body);
            
            const result = await this.authService.login(validatedData.email, validatedData.password);
            res.status(200).json(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues.map(e => e.message).join(' | ') });
                return;
            }
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
                return;
            }
            res.status(401).json({ error: "Une erreur inattendue est survenue." });
        }
    }
}