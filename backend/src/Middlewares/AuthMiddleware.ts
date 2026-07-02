import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Accès refusé. Token manquant.' });
        return;
    }

    const token = authHeader.split(' ')[1] as string;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET n'est pas défini dans le fichier .env");
        }

        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};