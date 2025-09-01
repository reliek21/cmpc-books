import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token: string | undefined = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('SECURITY.JWT_SECRET');
      console.log('JWT Secret being used:', secret); // Debug log
      console.log('Token being verified:', token.substring(0, 20) + '...'); // Debug log

      const payload: JwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: secret as string,
      });

      console.log('Decoded JWT payload:', payload); // Debug log
      request.user = payload;
    } catch (error) {
      console.error('JWT verification error:', error); // Debug log
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
