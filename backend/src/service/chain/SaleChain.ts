import { CATEGORIES_VALIDEES } from '../../constants/Categories.js';

export interface ValidationHandler {
    setNext(handler: ValidationHandler): ValidationHandler;
    handle(data: any): string | null;
}

export abstract class AbstractValidationHandler implements ValidationHandler {
    private nextHandler: ValidationHandler | null = null;

    public setNext(handler: ValidationHandler): ValidationHandler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(data: any): string | null {
        if (this.nextHandler) {
            return this.nextHandler.handle(data);
        }
        return null;
    }
}

export class BodyValidationHandler extends AbstractValidationHandler {
    public handle(data: any): string | null {
        if (!data || Object.keys(data).length === 0) {
            return "Le corps de la requête est vide ou manquant.";
        }
        return super.handle(data);
    }
}

export class CategoryValidationHandler extends AbstractValidationHandler {
    public handle(data: any): string | null {
        if (!CATEGORIES_VALIDEES.includes(data.categorie)) {
            return `Catégorie invalide. Veuillez choisir parmi : ${CATEGORIES_VALIDEES.join(', ')}`;
        }
        return super.handle(data);
    }
}

export class PriceValidationHandler extends AbstractValidationHandler {
    public handle(data: any): string | null {
        if (data.price !== undefined && Number(data.price) < 0) {
            return "Le prix ne peut pas être négatif.";
        }
        return super.handle(data);
    }
}