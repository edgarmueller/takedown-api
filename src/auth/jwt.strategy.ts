import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log(request.cookies);
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: configService.get('auth.jwt.secret'),
    });
  }

  // TODO
  async validate(payload: any) {
    try {
      console.log('validating', payload);
      // You could add a function to the authService to verify the claims of the token:
      // i.e. does the user still have the roles that are claimed by the token
      //const validClaims = await this.authService.verifyTokenClaims(payload);

      // if (!validClaims)
      //   return done(new UnauthorizedException('invalid token claims'), false);
      return this.userService.findOneByIdOrFail(payload.sub);
    } catch (err) {
      throw new UnauthorizedException('unauthorized', err.message);
    }
  }
}
