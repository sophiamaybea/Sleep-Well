// Updated authentication model code from Prompt 5

// Authentication User Model
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

// Authentication Token Interface
export interface AuthToken {
    token: string;
    user: User;
}

// Methods
export declare class AuthService {
    login(email: string, password: string): Promise<AuthToken>;
    register(user: User): Promise<AuthToken>;
    logout(userId: string): Promise<void>;
}