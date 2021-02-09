import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.Refresh,
      ]),
      secretOrKey: configService.get('auth.jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    const refreshToken = request.cookies?.Refresh;
    const { user } = await this.authService.createAccessTokenFromRefreshToken(
      refreshToken,
    );
    return user;
  }
}
