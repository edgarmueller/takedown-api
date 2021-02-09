import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Provider } from './provider.enum';
import { RefreshToken } from './refresh-token.entity';

// TODO
const BASE_OPTIONS: SignOptions = {
  issuer: 'https://my-app.com',
  audience: 'https://my-app.com',
};

export interface RefreshTokenPayload {
  jti: number;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  async validateOAuthLogin(
    email: string,
    thirdPartyId: string,
    provider: Provider,
  ): Promise<{ jwt: string; refresh: string }> {
    try {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      let user: User = await this.userService.findOneByThirdPartyId(
        thirdPartyId,
        provider,
      );

      if (!user) {
        user = await this.userService.registerOAuthUser(
          email,
          thirdPartyId,
          provider,
        );
      }

      const payload = {
        //thirdPartyId,
        //provider,
      };

      const jwt: string = this.jwtService.sign(payload, {
        ...BASE_OPTIONS,
        subject: user.id,
        // TODO
        expiresIn: 3600,
      });
      const refresh = await this.generateRefreshToken(user, 60 * 60 * 24 * 30);
      return { jwt, refresh };
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }

  async generateAccessToken(payload: any, subject: string) {
    const jwt: string = this.jwtService.sign(payload, {
      ...BASE_OPTIONS,
      subject,
      // TODO
      expiresIn: 3600,
    });
    return jwt;
  }

  public async generateRefreshToken(
    user: User,
    expiresIn: number,
  ): Promise<string> {
    const token = new RefreshToken({
      userId: user.id,
      expiresAt: new Date(new Date().getTime() + expiresIn),
      isRevoked: false,
    });

    await this.refreshTokenRepo.save(token);

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id),
    };

    return this.jwtService.signAsync({}, opts);
  }

  public async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: User; token: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new Error('Refresh token not found');
    }

    if (token.isRevoked) {
      throw new Error('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new Error('Refresh token malformed');
    }

    return { user, token };
  }

  public async createAccessTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ token: string; user: User }> {
    const { user } = await this.resolveRefreshToken(refresh);
    const token = await this.generateAccessToken({}, user.id + '');
    return { user, token };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else {
        throw new Error('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<User> {
    const subId = payload.sub;

    if (!subId) {
      throw new Error('Refresh token malformed');
    }

    return this.userService.findOneByIdOrFail(subId);
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<RefreshToken | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new Error('Refresh token malformed');
    }

    return this.refreshTokenRepo.findOneOrFail(tokenId);
  }
}
