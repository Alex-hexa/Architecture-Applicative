import type { Request } from 'express';

const CATEGORIES_VALIDEES = [
    'Informatique', 'Sport', 'Animaux', 'Service', 
    'Livre', 'Cuisine', 'Vêtement', 'Jeux Vidéo', 'Fourniture'
];

export interface ValidationHandler {
    setNext(handler: ValidationHandler): ValidationHandler;
    handle(req: Request): string | null;
}

export abstract class AbstractValidationHandler implements ValidationHandler {
    private nextHandler: ValidationHandler | null = null;

    public setNext(handler: ValidationHandler): ValidationHandler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(req: Request): string | null {
        if (this.nextHandler) {
            return this.nextHandler.handle(req);
        }
        return null;
    }
}

export class BodyValidationHandler extends AbstractValidationHandler {
    public handle(req: Request): string | null {
        if (!req.body || Object.keys(req.body).length === 0) {
            return "Le corps de la requête est vide ou manquant.";
        }
        return super.handle(req);
    }
}

export class CategoryValidationHandler extends AbstractValidationHandler {
    public handle(req: Request): string | null {
        if (!CATEGORIES_VALIDEES.includes(req.body.categorie)) {
            return `Catégorie invalide. Veuillez choisir parmi : ${CATEGORIES_VALIDEES.join(', ')}`;
        }
        return super.handle(req);
    }
}

export class PriceValidationHandler extends AbstractValidationHandler {
    public handle(req: Request): string | null {
        if (req.body.price !== undefined && Number(req.body.price) < 0) {
            return "Le prix ne peut pas être négatif.";
        }
        return super.handle(req);
    }
}