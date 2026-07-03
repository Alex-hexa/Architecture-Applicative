import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export interface JwtUserPayload {
    userId: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: JwtUserPayload;
}

function isJwtUserPayload(payload: unknown): payload is JwtUserPayload {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'userId' in payload &&
        typeof (payload as JwtUserPayload).userId === 'string'
    );
}

export const getUserId = (req: AuthRequest): string => {
    if (!req.user || !req.user.userId) {
        throw new Error("Utilisateur non authentifié.");
    }
    return req.user.userId;
}

export const AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

        if (!isJwtUserPayload(decoded)) {
            res.status(401).json({ error: 'Token invalide.' });
            return;
        }

        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};