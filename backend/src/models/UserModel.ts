export interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    birthday: Date;
    phone?: string | null;
}