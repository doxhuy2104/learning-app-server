import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from '../modules/auth/firebase-auth.guard';

@Module({
    providers: [FirebaseService, FirebaseAuthGuard],
    exports: [FirebaseService, FirebaseAuthGuard],
})
export class FirebaseModule { }

