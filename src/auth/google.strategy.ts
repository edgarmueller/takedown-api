import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Provider } from './provider.enum';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('auth.google.clientId'),
      clientSecret: configService.get('auth.google.clientSecret'),
      callbackURL: configService.get('auth.google.callbackUrl'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
  ) {
    const { jwt, refresh } = await this.authService.validateOAuthLogin(
      profile.emails[0].value,
      profile.id,
      Provider.GOOGLE,
    );
    const user = {
      jwt,
      refresh,
    };
    return user;
  }
}
