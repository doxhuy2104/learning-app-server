import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get current token from request
 * Usage: @CurrentUser() token: string
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        // Trả về token từ request (đã được set bởi JwtAuthGuard)
        return request.token || request.headers['authorization'] || request.headers['Authorization'] || '';
    },
);

