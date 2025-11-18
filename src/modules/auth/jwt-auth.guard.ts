import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.headers['authorization'] || request.headers['Authorization'];


        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        try {
            const decoded = this.jwtService.verify(token);
            // Lưu decoded payload (chứa user_id) vào request
            request.user = decoded;
            request.token = token; // Lưu token vào request để decorator có thể lấy
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}

