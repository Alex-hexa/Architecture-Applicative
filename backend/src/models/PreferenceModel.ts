import type { Sale } from './SaleModel.js';

export interface Preference {
    id: string;
    user_id: string;
    sale_id: string;
    score: number;
    last_interaction: Date;
    sale?: Sale;
}