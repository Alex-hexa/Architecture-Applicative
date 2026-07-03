export interface Preference {
    id: string;
    user_id: string;
    category: string;
    score: number;
    last_interaction: Date;
}