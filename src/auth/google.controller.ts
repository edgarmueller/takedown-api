import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GoogleGuard } from './google.guard';

@Controller('google')
export class GoogleController {
  constructor(private readonly configService: ConfigService) {}

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
}
