export interface Sale {
    id: string;
    title: string;
    price: number;
    description?: string | null;
    quantity: number;
    categorie: string;
    user_id: string;
}