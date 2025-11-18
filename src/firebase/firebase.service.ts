import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);
    private initialized = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (this.initialized) return;
        if (!admin.apps.length) {
            try {
                if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                    admin.initializeApp({
                        credential: admin.credential.cert(creds),
                    });
                } else {
                    admin.initializeApp();
                }
                this.initialized = true;
            } catch (e) {
                this.logger.error('Failed to initialize Firebase Admin', e as Error);
                throw e;
            }
        } else {
            this.initialized = true;
        }
    }

    async verifyIdToken(idToken: string) {
        this.initialize();
        return admin.auth().verifyIdToken(idToken);
    }
}

