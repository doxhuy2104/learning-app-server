import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async verifyToken(idToken: string): Promise<DecodedIdToken> {
        try {
            const decodedToken = await this.firebaseService.verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.log(error)
            throw new UnauthorizedException('Invalid or expired token');
        }
    }


    async login(loginDto: LoginDto) {
        const decodedToken = await this.verifyToken(loginDto.idToken);

        if (!decodedToken.email) {
            throw new BadRequestException('Token must contain email');
        }

        let user = await this.usersService.findByEmail(decodedToken.email);

        if (!user) {
            user = await this.usersService.createOrUpdateFromFirebaseToken(
                decodedToken,
            );
        } else {
            await this.usersService.updateLastLogin(user.userId);
        }

        const jwtToken = this.jwtService.sign({ user_id: user.userId });

        await this.usersService.updateToken(user.userId, jwtToken);

        user.accessToken = jwtToken;

        return {
            user,
            token: jwtToken,
        };
    }

    async register(registerDto: RegisterDto) {
        const decodedToken = await this.verifyToken(registerDto.idToken);

        if (!decodedToken.email) {
            throw new BadRequestException('Token must contain email');
        }

        const existingUser = await this.usersService.findByEmail(
            decodedToken.email,
        );

        if (existingUser) {
            throw new BadRequestException('User already exists. Please login instead.');
        }

        const fullName =
            decodedToken.name?.trim() || registerDto.fullName || undefined;

        const user = await this.usersService.createOrUpdateFromFirebaseToken(
            decodedToken,
            {
                fullName: fullName,
            }
        );

        const jwtToken = this.jwtService.sign({ user_id: user.userId });

        await this.usersService.updateToken(user.userId, jwtToken);

        user.accessToken = jwtToken;

        return {
            user,
            token: jwtToken,
            firebaseToken: decodedToken,
        };
    }

    async getProfile(idToken: string) {
        const decodedToken = await this.verifyToken(idToken);

        if (!decodedToken.email) {
            throw new BadRequestException('Token must contain email');
        }

        const user = await this.usersService.findByEmail(decodedToken.email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    async refreshToken(idToken: string) {
        const decodedToken = await this.verifyToken(idToken);

        if (!decodedToken.email) {
            throw new BadRequestException('Token must contain email');
        }

        const user = await this.usersService.findByEmail(decodedToken.email);

        if (!user) {
            return this.usersService.createOrUpdateFromFirebaseToken(decodedToken);
        }

        await this.usersService.updateLastLogin(user.userId);
        return user;
    }
}
