import type { Sale } from '../models/SaleModel.js';
import type { SaleFilters } from './SaleRepository.js';
import { randomUUID } from 'crypto';

export class MockSaleRepository {
    private sales: Sale[] = [
        {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'SSD Samsung 990 Pro 2To',
            price: 180.00,
            description: 'Idéal pour booster une PS5.',
            quantity: 1,
            categorie: 'Informatique',
            user_id: 'user-id-alexandre',
            created_at: new Date('2026-06-01T10:00:00Z'),
            seller_rating: 4.8,
            wear_level: 0
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            title: 'Raquette de Padel',
            price: 85.00,
            description: 'Très bon état, surgrip neuf.',
            quantity: 1,
            categorie: 'Sport',
            user_id: 'user-id-maxime',
            created_at: new Date('2026-06-02T15:30:00Z'),
            seller_rating: 4.2,
            wear_level: 2
        },
        {
            id: '33333333-3333-3333-3333-333333333333',
            title: 'Garde de chien (Les Amis à 4 Pattes)',
            price: 20.00,
            description: 'Promenade et garde à domicile.',
            quantity: 5,
            categorie: 'Service',
            user_id: 'user-id-alexandre',
            created_at: new Date(),
            seller_rating: 5.0,
            wear_level: 0
        }
    ];

    async findAll(filters: SaleFilters): Promise<Sale[]> {
        let result = [...this.sales];

        if (filters.title) {
            result = result.filter(s => s.title.toLowerCase().includes(filters.title!.toLowerCase()));
        }
        if (filters.minPrice !== undefined) {
            result = result.filter(s => s.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            result = result.filter(s => s.price <= filters.maxPrice!);
        }

        if (filters.sortBy === 'price') {
            result.sort((a, b) => filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
        } else {
            result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        }

        return result;
    }

    async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
        const newSale: Sale = {
            ...sale,
            id: randomUUID()
        };
        this.sales.push(newSale);
        return newSale;
    }
}