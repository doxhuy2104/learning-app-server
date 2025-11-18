// Augment Express Request with JWT decoded payload and token
declare namespace Express {
    interface Request {
        user?: {
            user_id: number;
            [key: string]: any;
        };
        token?: string;
    }
}


