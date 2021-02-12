import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { Request, Response } from 'express';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { JwtGuard } from './jwt.guard';

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string;
    token: string;
    refresh_token?: string;
  };
}

export class RefreshRequest {
  @IsNotEmpty({ message: 'The refresh token is required' })
  readonly refresh_token: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMe(@Req() request: Request) {
    return {};
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  public async refresh(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.generateAccessToken(
      {},
      req.user.id + '',
    );
    const accessTokenCookie = `Authentication=${jwt}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'auth.jwt.accessToken.expiresIn',
    )}`;
    res.setHeader('Set-Cookie', [accessTokenCookie]);
    res.end();
  }
}
