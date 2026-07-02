import { SaleRepository, type SaleFilters } from '../repository/SaleRepository.js';
import type { Sale } from '../models/SaleModel.js';

export class SaleService {
    constructor(private readonly saleRepository: SaleRepository) {}

    async getSales(filters: SaleFilters): Promise<Sale[]> {
        return this.saleRepository.findAll(filters);
    }

    async createSale(saleData: Omit<Sale, 'id'>): Promise<Sale> {
        if (saleData.price < 0) {
            throw new Error("Le prix ne peut pas être négatif.");
        }
        if (saleData.quantity <= 0) {
            throw new Error("La quantité doit être supérieure à 0.");
        }
        
        return this.saleRepository.create(saleData);
    }
}