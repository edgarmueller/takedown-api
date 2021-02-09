import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { Response } from 'express';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { GoogleGuard } from './google.guard';
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

@Controller('google')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(GoogleGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    const accessToken: string = req.user.jwt;
    const refreshToken: string = req.user.refresh;
    const accessTokenCookie = `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'auth.jwt.accessToken.expiresIn',
    )}`;
    const refreshTokenCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'auth.jwt.refreshToken.expiresIn',
    )}`;
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    if (accessToken) {
      res.redirect(`${this.configService.get('frontend.url')}/login/success`);
    } else {
      res.redirect(`${this.configService.get('frontend.url')}/login/failure`);
    }
  }

  @Get('protected')
  @UseGuards(JwtGuard)
  protectedResource() {
    return 'JWT is working!';
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
    res.cookie('Authentication', accessTokenCookie);
    res.end();
  }
}
